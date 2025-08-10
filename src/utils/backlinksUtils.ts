import { getAvailableFiles, loadMarkdownContent, loadMdxRawContent } from './markdownLoader';
import { getFileExtension, isMdxFile } from './fileUtils';
import { getSiteConfig } from '../config/siteConfig';
import { getAllTags } from './tagsUtils';
import { extractLinks } from './linkExtractor';
import { resolveFilePath, extractTitleFromPath, clearPathResolutionCache } from './pathUtils';
import { extractFrontMatter, extractTitleFromFrontMatter, extractTagsFromFrontMatter } from './frontMatterUtils';
import { initializeAvailableFilesCache, getAvailableFilesSet, clearAvailableFilesCache } from './sharedUtils';
import type { BacklinksIndex, Backlink, RelatedContentData } from '../types/backlinks';
import type { FrontMatter } from '../types/template';
import { isPathHidden } from './fileTree';

let backlinksIndex: BacklinksIndex = {};
let indexBuilt = false;

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
  const availableFilesSet = getAvailableFilesSet();
  
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
        // Extract front matter from raw content using consolidated utility
        frontMatter = extractFrontMatter(content);
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
    const availableFilesSet = getAvailableFilesSet();
    const links = extractLinks(content, true); // Enable context extraction
    
    for (const link of links) {
      const targetFile = resolveFilePath(filePath, link.url, availableFiles);
      
      if (availableFilesSet.has(targetFile)) {
        // Get target file title
        let targetTitle: string;
        try {
          if (isMdxFile(targetFile)) {
            const extractedTitle = extractTitleFromFrontMatter(await loadMdxRawContent(targetFile));
            targetTitle = extractedTitle || extractTitleFromPath(targetFile);
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
      currentTags = extractTagsFromFrontMatter(content);
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
  clearPathResolutionCache();
  clearAvailableFilesCache();
};
