import { getAvailableFiles, loadMarkdownContent, loadMdxRawContent } from './markdownLoader';
import { getFileExtension, isMdxFile } from './fileUtils';
import { urlToFilePathWithExtension } from './routing';
import { getSiteConfig } from '../config/siteConfig';
import { getAllTags } from './tagsUtils';
import { extractLinks } from './linkExtractor';
import type { BacklinksIndex, Backlink, RelatedContentData } from '../types/backlinks';
import type { FrontMatter } from '../types/template';
import { isPathHidden } from './fileTree';

let backlinksIndex: BacklinksIndex = {};
let indexBuilt = false;

// Memoization cache for file path resolution
const pathResolutionCache = new Map<string, string>();
const availableFilesSet = new Set<string>();
let availableFilesCached = false;

// Initialize available files cache
const initializeAvailableFilesCache = (): void => {
  if (!availableFilesCached) {
    const files = getAvailableFiles();
    availableFilesSet.clear();
    files.forEach(file => availableFilesSet.add(file));
    availableFilesCached = true;
  }
};

// Resolve relative URLs to absolute file paths
const resolveFilePath = (currentFile: string, relativeUrl: string, availableFiles: string[]): string => {
  // Create cache key
  const cacheKey = `${currentFile}:${relativeUrl}`;
  
  // Check cache first
  if (pathResolutionCache.has(cacheKey)) {
    return pathResolutionCache.get(cacheKey)!;
  }
  
  let resolvedPath: string;
  
  // Handle relative paths
  if (relativeUrl.startsWith('./') || relativeUrl.startsWith('../')) {
    // Get the directory of the current file
    const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));
    
    // Resolve the relative path
    const parts = currentDir.split('/').concat(relativeUrl.split('/'));
    const resolved: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '.' && part !== '') {
        resolved.push(part);
      }
    }
    
    const resolvedPathCandidate = '/' + resolved.join('/');
    
    // Try to find the file with the resolved path
    resolvedPath = urlToFilePathWithExtension(resolvedPathCandidate, availableFiles);
  } else {
    // Handle absolute paths (starting with /)
    resolvedPath = urlToFilePathWithExtension(relativeUrl, availableFiles);
  }
  
  // Cache the result
  pathResolutionCache.set(cacheKey, resolvedPath);
  
  return resolvedPath;
};

// Extract title from file path
const extractTitleFromPath = (filePath: string): string => {
  const fileName = filePath.split('/').pop() || '';
  return fileName
    .replace(/\.(md|mdx)$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Build backlinks index from all markdown and MDX files
 */
export const buildBacklinksIndex = async (): Promise<void> => {
  if (indexBuilt) return;
  
  const siteConfig = getSiteConfig();
  const hiddenDirectories = siteConfig.navigation.hiddenDirectories || [];
  
  // Initialize available files cache
  initializeAvailableFilesCache();
  const availableFiles = getAvailableFiles();
  
  const documentFiles = availableFiles.filter(file => {
    // Filter out files from hidden directories
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return ['md', 'mdx'].includes(getFileExtension(file));
  });
  
  const newBacklinksIndex: BacklinksIndex = {};
  
  // Process each file to extract its outgoing links
  const indexPromises = documentFiles.map(async (sourceFile): Promise<void> => {
    try {
      let content: string;
      let frontMatter: FrontMatter = {};
      
      if (isMdxFile(sourceFile)) {
        content = await loadMdxRawContent(sourceFile);
        // Extract front matter from raw content
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontMatterMatch) {
          // Simple front matter parsing for title extraction
          const frontMatterText = frontMatterMatch[1];
          const titleMatch = frontMatterText.match(/title:\s*["']?([^"'\n]+)["']?/);
          if (titleMatch) {
            frontMatter.title = titleMatch[1];
          }
        }
      } else {
        const { content: markdownContent, frontMatter: parsedFrontMatter } = await loadMarkdownContent(sourceFile);
        content = markdownContent;
        frontMatter = parsedFrontMatter;
      }
      
      const sourceTitle = frontMatter.title || extractTitleFromPath(sourceFile);
      const sourceDescription = frontMatter.description;
      
      // Extract all links from the content
      const links = extractLinks(content, true); // Enable context extraction
      
      // Group links by target file to count references and collect contexts
      const linksByTarget = new Map<string, {
        linkTexts: string[];
        contexts: string[];
        originalUrl: string;
      }>();
      
      // Process each link
      for (const link of links) {
        const targetFile = resolveFilePath(sourceFile, link.url, availableFiles);
        
        // Only process if the target file exists (use cached set for faster lookup)
        if (availableFilesSet.has(targetFile)) {
          if (!linksByTarget.has(targetFile)) {
            linksByTarget.set(targetFile, {
              linkTexts: [],
              contexts: [],
              originalUrl: link.url
            });
          }
          
          const linkData = linksByTarget.get(targetFile)!;
          linkData.linkTexts.push(link.linkText);
          if (link.context) {
            linkData.contexts.push(link.context);
          }
        }
      }
      
      // Create backlinks with reference counts
      for (const [targetFile, linkData] of linksByTarget) {
        const backlink: Backlink = {
          sourceFile,
          sourceTitle,
          sourceDescription,
          linkText: linkData.linkTexts[0], // Use the first link text as primary
          linkUrl: linkData.originalUrl,
          context: linkData.contexts[0], // Use the first context as primary
          referenceCount: linkData.linkTexts.length
        };
        
        if (!newBacklinksIndex[targetFile]) {
          newBacklinksIndex[targetFile] = [];
        }
        
        newBacklinksIndex[targetFile].push(backlink);
      }
    } catch (error) {
      console.warn(`Failed to index backlinks for file ${sourceFile}:`, error);
    }
  });
  
  await Promise.all(indexPromises);
  
  backlinksIndex = newBacklinksIndex;
  indexBuilt = true;
};

/**
 * Get backlinks for a specific file
 */
export const getBacklinks = async (filePath: string): Promise<Backlink[]> => {
  await buildBacklinksIndex();
  return backlinksIndex[filePath] || [];
};

/**
 * Get related content for a file (both by tags and backlinks)
 */
export const getRelatedContent = async (filePath: string): Promise<RelatedContentData> => {
  await buildBacklinksIndex();
  
  const backlinks = backlinksIndex[filePath] || [];
  
  // Get outgoing links from this file
  const outgoingLinks: RelatedContentData['outgoingLinks'] = [];
  try {
    let content: string;
    
    if (isMdxFile(filePath)) {
      content = await loadMdxRawContent(filePath);
    } else {
      const { content: markdownContent } = await loadMarkdownContent(filePath);
      content = markdownContent;
    }
    
    // Initialize available files cache
    initializeAvailableFilesCache();
    const availableFiles = getAvailableFiles();
    const links = extractLinks(content, true); // Enable context extraction
    
    for (const link of links) {
      const targetFile = resolveFilePath(filePath, link.url, availableFiles);
      
      if (availableFilesSet.has(targetFile)) {
        // Get target file title
        let targetTitle: string;
        try {
          if (isMdxFile(targetFile)) {
            const targetContent = await loadMdxRawContent(targetFile);
            const frontMatterMatch = targetContent.match(/^---\n([\s\S]*?)\n---/);
            if (frontMatterMatch) {
              const frontMatterText = frontMatterMatch[1];
              const titleMatch = frontMatterText.match(/title:\s*["']?([^"'\n]+)["']?/);
              targetTitle = titleMatch ? titleMatch[1] : extractTitleFromPath(targetFile);
            } else {
              targetTitle = extractTitleFromPath(targetFile);
            }
          } else {
            const { frontMatter } = await loadMarkdownContent(targetFile);
            targetTitle = frontMatter.title || extractTitleFromPath(targetFile);
          }
        } catch {
          targetTitle = extractTitleFromPath(targetFile);
        }
        
        outgoingLinks.push({
          filePath: targetFile,
          title: targetTitle,
          linkText: link.linkText
        });
      }
    }
  } catch (error) {
    console.warn(`Failed to get outgoing links for ${filePath}:`, error);
  }
  
  // Get related content by tags
  const byTags: RelatedContentData['byTags'] = [];
  try {
    // Get current file's tags
    let currentTags: string[] = [];
    if (isMdxFile(filePath)) {
      const content = await loadMdxRawContent(filePath);
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontMatterMatch) {
        const frontMatterText = frontMatterMatch[1];
        const tagsMatch = frontMatterText.match(/tags:\s*\[(.*?)\]/s);
        if (tagsMatch) {
          currentTags = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/["']/g, ''))
            .filter(Boolean);
        }
      }
    } else {
      const { frontMatter } = await loadMarkdownContent(filePath);
      currentTags = frontMatter.tags || [];
    }
    
    if (currentTags.length > 0) {
      const allTags = await getAllTags();
      
      // Find files that share tags
      const fileTagMap = new Map<string, { filePath: string; title: string; description?: string; sharedTags: string[] }>();
      
      for (const tag of allTags) {
        if (currentTags.includes(tag.name)) {
          const relatedFiles = tag.files
            .filter(file => file.filePath !== filePath); // Exclude current file
          
          for (const file of relatedFiles) {
            const existing = fileTagMap.get(file.filePath);
            if (existing) {
              existing.sharedTags.push(tag.name);
            } else {
              fileTagMap.set(file.filePath, {
                filePath: file.filePath,
                title: file.title,
                description: file.description,
                sharedTags: [tag.name]
              });
            }
          }
        }
      }
      
      // Group by shared tags
      const tagGroups = new Map<string, Array<{ filePath: string; title: string; description?: string; sharedTags: string[] }>>();
      
      for (const [, file] of fileTagMap) {
        const sharedTagsStr = file.sharedTags.sort().join(',');
        
        if (!tagGroups.has(sharedTagsStr)) {
          tagGroups.set(sharedTagsStr, []);
        }
        tagGroups.get(sharedTagsStr)!.push(file);
      }
      
      // Convert to the expected format
      for (const [tagsStr, files] of tagGroups) {
        const tags = tagsStr.split(',');
        byTags.push({
          tag: tags.join(', '),
          files
        });
      }
    }
  } catch (error) {
    console.warn(`Failed to get related content by tags for ${filePath}:`, error);
  }
  
  return {
    byTags,
    backlinks,
    outgoingLinks
  };
};

/**
 * Reset the backlinks index (useful for development/testing)
 */
export const resetBacklinksIndex = (): void => {
  backlinksIndex = {};
  indexBuilt = false;
  
  // Clear caches
  pathResolutionCache.clear();
  availableFilesSet.clear();
  availableFilesCached = false;
};
