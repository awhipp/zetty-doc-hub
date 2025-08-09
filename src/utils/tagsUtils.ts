import { getAvailableFiles, loadMarkdownContent, loadMdxFrontMatter } from './markdownLoader';
import { getFileExtension, isMdxFile } from './fileUtils';
import { filePathToUrl } from './routing';
import { getSiteConfig } from '../config/siteConfig';
import type { TagsIndex, TagInfo, TaggedFile, TagsOptions } from '../types/tags';
import type { FrontMatter } from '../types/template';

let tagsIndex: TagsIndex = {};
let indexBuilt = false;

// Helper function to check if a path should be hidden
const isPathHidden = (filePath: string, hiddenDirectories: string[]): boolean => {
  return hiddenDirectories.some(hiddenDir => {
    // Normalize the hidden directory path - ensure it starts with /src/docs/
    let normalizedHiddenDir = hiddenDir;
    if (!normalizedHiddenDir.startsWith('/src/docs/')) {
      if (normalizedHiddenDir.startsWith('src/docs/')) {
        normalizedHiddenDir = '/' + normalizedHiddenDir;
      } else {
        normalizedHiddenDir = '/src/docs/' + normalizedHiddenDir;
      }
    }
    
    return filePath.startsWith(normalizedHiddenDir);
  });
};

/**
 * Build tags index from all markdown and MDX files
 */
export const buildTagsIndex = async (): Promise<void> => {
  if (indexBuilt) return;
  
  // Get the site configuration to access hidden directories
  const siteConfig = getSiteConfig();
  const hiddenDirectories = siteConfig.navigation.hiddenDirectories || [];
  
  const availableFiles = getAvailableFiles();
  const documentFiles = availableFiles.filter(file => {
    // Filter out files from hidden directories
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return ['md', 'mdx'].includes(getFileExtension(file));
  });
  
  const tagMap = new Map<string, TaggedFile[]>();
  
  const indexPromises = documentFiles.map(async (filePath): Promise<void> => {
    try {
      let frontMatter: FrontMatter;
      
      if (isMdxFile(filePath)) {
        frontMatter = await loadMdxFrontMatter(filePath);
      } else {
        const { frontMatter: parsedFrontMatter } = await loadMarkdownContent(filePath);
        frontMatter = parsedFrontMatter;
      }
      
      // Check if the file has tags
      if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
        const taggedFile: TaggedFile = {
          filePath,
          title: frontMatter.title || extractTitleFromPath(filePath),
          description: frontMatter.description,
          author: frontMatter.author,
          date: frontMatter.date,
          template: frontMatter.template
        };
        
        // Add this file to each of its tags
        frontMatter.tags.forEach((tag: string) => {
          const normalizedTag = normalizeTag(tag);
          if (!tagMap.has(normalizedTag)) {
            tagMap.set(normalizedTag, []);
          }
          tagMap.get(normalizedTag)!.push(taggedFile);
        });
      }
    } catch (error) {
      console.warn(`Failed to index tags for file ${filePath}:`, error);
    }
  });
  
  await Promise.all(indexPromises);
  
  // Convert map to TagsIndex
  tagsIndex = {};
  tagMap.forEach((files, tagName) => {
    tagsIndex[tagName] = {
      name: tagName,
      count: files.length,
      files: files.sort((a, b) => a.title.localeCompare(b.title))
    };
  });
  
  indexBuilt = true;
};

/**
 * Get all tags with their associated files
 */
export const getAllTags = async (options: TagsOptions = {}): Promise<TagInfo[]> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  const {
    sortBy = 'alphabetical',
    sortOrder = 'asc',
    minCount = 1
  } = options;
  
  const tags = Object.values(tagsIndex).filter(tag => tag.count >= minCount);
  
  // Sort tags
  if (sortBy === 'alphabetical') {
    tags.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  } else if (sortBy === 'frequency') {
    tags.sort((a, b) => {
      const comparison = a.count - b.count;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
  
  return tags;
};

/**
 * Get files for a specific tag
 */
export const getFilesForTag = async (tagName: string): Promise<TaggedFile[]> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  const normalizedTag = normalizeTag(tagName);
  const tagInfo = tagsIndex[normalizedTag];
  
  return tagInfo ? tagInfo.files : [];
};

/**
 * Get tag info for a specific tag
 */
export const getTagInfo = async (tagName: string): Promise<TagInfo | null> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  const normalizedTag = normalizeTag(tagName);
  return tagsIndex[normalizedTag] || null;
};

/**
 * Search tags by name
 */
export const searchTags = async (query: string): Promise<TagInfo[]> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  const searchTerm = query.toLowerCase();
  
  return Object.values(tagsIndex).filter(tag =>
    tag.name.toLowerCase().includes(searchTerm)
  ).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get the most popular tags
 */
export const getPopularTags = async (limit: number = 10): Promise<TagInfo[]> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  return Object.values(tagsIndex)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/**
 * Rebuild the tags index (for development/hot reload)
 * This will respect hidden directories configuration
 */
export const rebuildTagsIndex = async (): Promise<void> => {
  indexBuilt = false;
  tagsIndex = {};
  await buildTagsIndex();
};

/**
 * Normalize tag names for consistent indexing
 */
const normalizeTag = (tag: string): string => {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
};

/**
 * Extract title from file path as fallback
 */
const extractTitleFromPath = (filePath: string): string => {
  const segments = filePath.split('/');
  const fileName = segments[segments.length - 1];
  return fileName.replace(/\.(md|mdx)$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get URL for a tagged file
 */
export const getTaggedFileUrl = (taggedFile: TaggedFile): string => {
  return filePathToUrl(taggedFile.filePath);
};

/**
 * Get total number of tags
 */
export const getTagsCount = async (): Promise<number> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  return Object.keys(tagsIndex).length;
};

/**
 * Get total number of tagged files
 */
export const getTaggedFilesCount = async (): Promise<number> => {
  if (!indexBuilt) {
    await buildTagsIndex();
  }
  
  const uniqueFiles = new Set<string>();
  Object.values(tagsIndex).forEach(tagInfo => {
    tagInfo.files.forEach(file => uniqueFiles.add(file.filePath));
  });
  
  return uniqueFiles.size;
};
