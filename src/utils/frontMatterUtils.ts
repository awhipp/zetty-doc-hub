/**
 * Consolidated front matter parsing utilities
 * Eliminates duplication across backlinksUtils, graphUtils, and other modules
 */

import type { FrontMatter } from '../types/template';

/**
 * Extract front matter from raw MDX/Markdown content
 * Handles both simple field extraction and full parsing
 */
export const extractFrontMatter = (content: string): FrontMatter => {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontMatterMatch) {
    return {};
  }
  
  const frontMatterText = frontMatterMatch[1];
  const frontMatter: FrontMatter = {};
  
  // Extract title
  const titleMatch = frontMatterText.match(/title:\s*["']?([^"'\n]+)["']?/);
  if (titleMatch) {
    frontMatter.title = titleMatch[1].trim();
  }
  
  // Extract description
  const descMatch = frontMatterText.match(/description:\s*["']?([^"'\n]+)["']?/);
  if (descMatch) {
    frontMatter.description = descMatch[1].trim();
  }
  
  // Extract author
  const authorMatch = frontMatterText.match(/author:\s*["']?([^"'\n]+)["']?/);
  if (authorMatch) {
    frontMatter.author = authorMatch[1].trim();
  }
  
  // Extract date
  const dateMatch = frontMatterText.match(/date:\s*["']?([^"'\n]+)["']?/);
  if (dateMatch) {
    frontMatter.date = dateMatch[1].trim();
  }
  
  // Extract template
  const templateMatch = frontMatterText.match(/template:\s*["']?([^"'\n]+)["']?/);
  if (templateMatch) {
    frontMatter.template = templateMatch[1].trim();
  }
  
  // Extract tags (support both array and string formats)
  const tagsMatch = frontMatterText.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    frontMatter.tags = tagsMatch[1]
      .split(',')
      .map(tag => tag.trim().replace(/["']/g, ''))
      .filter(Boolean);
  }
  
  return frontMatter;
};

/**
 * Extract only title from front matter (optimized for performance)
 */
export const extractTitleFromFrontMatter = (content: string): string | null => {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontMatterMatch) {
    return null;
  }
  
  const titleMatch = frontMatterMatch[1].match(/title:\s*["']?([^"'\n]+)["']?/);
  return titleMatch ? titleMatch[1].trim() : null;
};

/**
 * Extract only tags from front matter (optimized for performance)
 */
export const extractTagsFromFrontMatter = (content: string): string[] => {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontMatterMatch) {
    return [];
  }
  
  const tagsMatch = frontMatterMatch[1].match(/tags:\s*\[(.*?)\]/s);
  if (!tagsMatch) {
    return [];
  }
  
  return tagsMatch[1]
    .split(',')
    .map(tag => tag.trim().replace(/["']/g, ''))
    .filter(Boolean);
};

/**
 * Check if content has front matter
 */
export const hasFrontMatter = (content: string): boolean => {
  return /^---\n[\s\S]*?\n---/.test(content);
};
