/**
 * Consolidated path resolution utilities
 * Eliminates code duplication across backlinksUtils, graphUtils, and imageLoader
 */

import { urlToFilePathWithExtension } from './routing';
import { getAvailableFiles } from './markdownLoader';
import { SUPPORTED_EXTENSIONS } from './constants';

// Cache for path resolution results
const pathResolutionCache = new Map<string, string>();

/**
 * Resolve relative URLs to absolute file paths
 * Consolidated from backlinksUtils.ts and graphUtils.ts
 */
export const resolveFilePath = (currentFile: string, relativeUrl: string, availableFiles?: string[]): string => {
  // Create cache key
  const cacheKey = `${currentFile}:${relativeUrl}`;
  
  // Check cache first
  if (pathResolutionCache.has(cacheKey)) {
    return pathResolutionCache.get(cacheKey)!;
  }
  
  // Use provided files or get them if not provided
  const files = availableFiles || getAvailableFiles();
  
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
    resolvedPath = urlToFilePathWithExtension(resolvedPathCandidate, files);
  } else {
    // Handle absolute paths (starting with /)
    resolvedPath = urlToFilePathWithExtension(relativeUrl, files);
  }
  
  // Cache the result
  pathResolutionCache.set(cacheKey, resolvedPath);
  
  return resolvedPath;
};

/**
 * Resolve relative image paths to absolute paths within the docs structure
 * Consolidated from imageLoader.ts with improved path handling
 */
export const resolveImagePath = (imageSrc: string, currentDocPath?: string): string => {
  // If it's already an absolute URL or starts with http, return as is
  if (imageSrc.startsWith('http') || imageSrc.startsWith('https')) {
    return imageSrc;
  }

  // If it starts with /, treat as absolute path from docs root
  if (imageSrc.startsWith('/')) {
    // Convert /docs/path to /src/docs/path for module loading
    if (imageSrc.startsWith('/docs/')) {
      return imageSrc.replace('/docs/', '/src/docs/');
    }
    // If it already starts with /src/docs/, keep it as is
    if (imageSrc.startsWith('/src/docs/')) {
      return imageSrc;
    }
    // Otherwise, prepend /src/docs/
    return `/src/docs${imageSrc}`;
  }

  // Handle relative paths
  if (!currentDocPath) {
    // Fallback: assume it's relative to docs root
    return `/src/docs/${imageSrc}`;
  }

  // Normalize the document path - handle both /src/docs/ and other formats
  let normalizedDocPath = currentDocPath;
  if (normalizedDocPath.startsWith('/src/docs/')) {
    normalizedDocPath = normalizedDocPath.substring('/src/docs/'.length);
  }

  // Get the directory part (remove filename)
  const docDir = normalizedDocPath.replace(/\/[^/]*$/, '');

  let targetPath = '';

  if (imageSrc.startsWith('./')) {
    // Current directory reference
    const relativePath = imageSrc.substring(2);
    targetPath = docDir ? `${docDir}/${relativePath}` : relativePath;
  } else if (imageSrc.startsWith('../')) {
    // Parent directory reference
    const pathParts = docDir.split('/').filter(part => part !== '');
    const relativeParts = imageSrc.split('/');

    for (const part of relativeParts) {
      if (part === '..') {
        pathParts.pop();
      } else if (part !== '.' && part !== '') {
        pathParts.push(part);
      }
    }

    targetPath = pathParts.join('/');
  } else {
    // Direct relative path (no ./ prefix)
    targetPath = docDir ? `${docDir}/${imageSrc}` : imageSrc;
  }

  // Clean up any double slashes and ensure /src/docs/ prefix
  const cleanPath = targetPath.replace(/\/+/g, '/').replace(/^\//, '');
  return `/src/docs/${cleanPath}`;
};

/**
 * Extract title from file path
 * Consolidated from backlinksUtils.ts, graphUtils.ts, tagsUtils.ts, and searchUtils.ts
 */
export const extractTitleFromPath = (filePath: string): string => {
  const fileName = filePath.split('/').pop() || '';
  // Build regex from SUPPORTED_EXTENSIONS
  const extPattern = new RegExp(`\\.(${SUPPORTED_EXTENSIONS.join('|')})$`, 'i');
  return fileName
    .replace(extPattern, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
};

/**
 * Extract filename from file path (no title formatting)
 * Used by search utilities and other modules that need raw filename
 */
export const getFileNameFromPath = (filePath: string): string => {
  const segments = filePath.split('/');
  const fileName = segments[segments.length - 1];
  const extPattern = new RegExp(`\\.(${SUPPORTED_EXTENSIONS.join('|')})$`, 'i');
  return fileName.replace(extPattern, '').replace(/-/g, ' ');
};

/**
 * Clear path resolution cache (useful for development/testing)
 */
export const clearPathResolutionCache = (): void => {
  pathResolutionCache.clear();
};

/**
 * Get cache statistics for debugging
 */
export const getPathResolutionCacheStats = (): { cacheSize: number } => {
  return {
    cacheSize: pathResolutionCache.size
  };
};
