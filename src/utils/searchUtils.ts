import { getAvailableFiles, loadMarkdownContent } from './markdownLoader';
import { getFileExtension } from './fileUtils';
import { getSiteConfig } from '../config/siteConfig';
import type { SearchResult, SearchIndex, SearchOptions } from '../types/search';

let searchIndex: SearchIndex[] = [];
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
 * Build search index from all markdown files
 */
export const buildSearchIndex = async (): Promise<void> => {
  if (indexBuilt) return;
  
  // Get the site configuration to access hidden directories
  const siteConfig = getSiteConfig();
  const hiddenDirectories = siteConfig.navigation.hiddenDirectories || [];
  
  const availableFiles = getAvailableFiles();
  const markdownFiles = availableFiles.filter(file => {
    // Filter out files from hidden directories
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return getFileExtension(file) === 'md';
  });
  
  const indexPromises = markdownFiles.map(async (filePath): Promise<SearchIndex | null> => {
    try {
      const { content, frontMatter } = await loadMarkdownContent(filePath);
      
      // Extract title from frontmatter or first heading
      const title = frontMatter.title || extractTitleFromContent(content) || getFileNameFromPath(filePath);
      
      // Extract headings from content
      const headings = extractHeadings(content);
      
      return {
        filePath,
        title,
        content: content.toLowerCase(),
        headings: headings.map(h => h.toLowerCase())
      };
    } catch (error) {
      console.warn(`Failed to index file ${filePath}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(indexPromises);
  searchIndex = results.filter((item): item is SearchIndex => item !== null);
  indexBuilt = true;
};

/**
 * Search through indexed content
 */
export const searchDocumentation = async (query: string, options: SearchOptions = {}): Promise<SearchResult[]> => {
  if (!indexBuilt) {
    await buildSearchIndex();
  }
  
  if (!query.trim()) {
    return [];
  }
  
  const {
    maxResults = 10,
    minScore = 0.1,
    includeContent = true
  } = options;
  
  const searchTerm = query.toLowerCase();
  const results: SearchResult[] = [];
  
  for (const item of searchIndex) {
    let score = 0;
    let matchType: SearchResult['matchType'] = 'content';
    let excerpt = '';
    
    // Check title match (highest priority)
    if (item.title.toLowerCase().includes(searchTerm)) {
      score += 10;
      matchType = 'title';
      excerpt = item.title;
    }
    
    // Check heading matches (medium priority)
    const headingMatch = item.headings.find(heading => heading.includes(searchTerm));
    if (headingMatch) {
      score += 5;
      if (matchType === 'content') matchType = 'heading';
      if (!excerpt) excerpt = headingMatch;
    }
    
    // Check content match (lower priority)
    if (includeContent && item.content.includes(searchTerm)) {
      score += 1;
      if (!excerpt) {
        excerpt = extractExcerpt(item.content, searchTerm);
      }
    }
    
    // Add fuzzy matching bonus for partial matches
    if (score === 0) {
      const fuzzyScore = calculateFuzzyScore(searchTerm, item.title.toLowerCase());
      if (fuzzyScore > 0.5) {
        score = fuzzyScore;
        matchType = 'title';
        excerpt = item.title;
      }
    }
    
    if (score >= minScore) {
      results.push({
        filePath: item.filePath,
        title: item.title,
        excerpt: excerpt || item.title,
        score,
        matchType
      });
    }
  }
  
  // Sort by score (descending) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

/**
 * Extract title from markdown content (first # heading)
 */
const extractTitleFromContent = (content: string): string | null => {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
};

/**
 * Extract filename from file path
 */
const getFileNameFromPath = (filePath: string): string => {
  const segments = filePath.split('/');
  const fileName = segments[segments.length - 1];
  return fileName.replace(/\.(md|mdx)$/, '').replace(/-/g, ' ');
};

/**
 * Extract all headings from markdown content
 */
const extractHeadings = (content: string): string[] => {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }
  
  return headings;
};

/**
 * Extract excerpt around search term
 */
const extractExcerpt = (content: string, searchTerm: string, contextLength = 100): string => {
  const index = content.indexOf(searchTerm);
  if (index === -1) return '';
  
  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(content.length, index + searchTerm.length + contextLength / 2);
  
  let excerpt = content.slice(start, end);
  
  // Clean up excerpt
  excerpt = excerpt.replace(/\n+/g, ' ').trim();
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
};

/**
 * Calculate fuzzy matching score for partial matches
 */
const calculateFuzzyScore = (query: string, target: string): number => {
  if (query.length === 0) return 0;
  if (target.length === 0) return 0;
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      score++;
      queryIndex++;
    }
  }
  
  return score / query.length;
};

/**
 * Clear search index (useful for testing or refreshing)
 * Will respect hidden directories configuration when rebuilt
 */
export const clearSearchIndex = (): void => {
  searchIndex = [];
  indexBuilt = false;
};