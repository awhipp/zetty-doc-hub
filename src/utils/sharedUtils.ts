/**
 * Shared utilities for common patterns across the codebase
 * Consolidates frequently used functions to eliminate duplication
 */

import { getAvailableFiles } from './markdownLoader';
import { getFileExtension } from './fileUtils';
import { isPathHidden } from './fileTree';

// Cache for available files (shared across modules)
const availableFilesCache = new Set<string>();
let availableFilesCached = false;

/**
 * Initialize and cache available files for fast lookup
 * Shared pattern used in backlinksUtils, graphUtils, and other modules
 */
export const initializeAvailableFilesCache = (): void => {
  if (!availableFilesCached) {
    const files = getAvailableFiles();
    availableFilesCache.clear();
    files.forEach(file => availableFilesCache.add(file));
    availableFilesCached = true;
  }
};

/**
 * Get cached available files set for fast lookups
 */
export const getAvailableFilesSet = (): Set<string> => {
  initializeAvailableFilesCache();
  return availableFilesCache;
};

/**
 * Clear available files cache (useful for development/testing)
 */
export const clearAvailableFilesCache = (): void => {
  availableFilesCache.clear();
  availableFilesCached = false;
};

/**
 * Check if a file exists in the available files (optimized with cached set)
 */
export const fileExists = (filePath: string): boolean => {
  initializeAvailableFilesCache();
  return availableFilesCache.has(filePath);
};

/**
 * Common document filtering pattern used across multiple modules
 */
export const getDocumentFiles = (hiddenDirectories: string[] = []): string[] => {
  const files = getAvailableFiles();
  return files.filter(file => {
    // Filter out files from hidden directories
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return ['md', 'mdx'].includes(getFileExtension(file));
  });
};

/**
 * Cache statistics for all shared utilities
 */
export const getSharedUtilsCacheStats = () => {
  return {
    availableFilesCache: availableFilesCache.size,
    availableFilesCached
  };
};
