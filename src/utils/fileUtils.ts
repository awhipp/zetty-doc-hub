import { FILE_EXTENSIONS, MDX_EXTENSIONS, IMAGE_EXTENSIONS, SUPPORTED_EXTENSIONS, EXTENSIONS_PATTERN } from './constants';

// Cache for file extension results to avoid repeated string operations
const extensionCache = new Map<string, string>();
const fileTypeCache = new Map<string, boolean>();

/**
 * Get file extension from a file path with caching
 * Centralized to eliminate duplication across the codebase
 */
export const getFileExtension = (filePath: string): string => {
  if (extensionCache.has(filePath)) {
    return extensionCache.get(filePath)!;
  }

  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  extensionCache.set(filePath, extension);
  return extension;
};

/**
 * Create a memoized file type checker factory
 * Reduces repeated extension checking for the same files
 */
const createFileTypeChecker = (
  extensions: readonly string[], 
  cachePrefix: string
) => (filePath: string): boolean => {
  const cacheKey = `${cachePrefix}:${filePath}`;
  
  if (fileTypeCache.has(cacheKey)) {
    return fileTypeCache.get(cacheKey)!;
  }

  const ext = getFileExtension(filePath);
  const result = extensions.includes(ext as typeof extensions[number]);
  fileTypeCache.set(cacheKey, result);
  return result;
};

/**
 * Check if a file is a supported markdown file
 */
export const isMarkdownFile = createFileTypeChecker(MDX_EXTENSIONS, 'markdown');

/**
 * Check if a file is specifically an MDX file
 */
export const isMdxFile = (filePath: string): boolean => {
    const cacheKey = `mdx:${filePath}`;
    
    if (fileTypeCache.has(cacheKey)) {
        return fileTypeCache.get(cacheKey)!;
    }

    const result = getFileExtension(filePath) === FILE_EXTENSIONS.MDX;
    fileTypeCache.set(cacheKey, result);
    return result;
};

/**
 * Check if a file is specifically a Markdown file (not MDX)
 */
export const isMarkdownOnlyFile = (filePath: string): boolean => {
    const cacheKey = `md-only:${filePath}`;
    
    if (fileTypeCache.has(cacheKey)) {
        return fileTypeCache.get(cacheKey)!;
    }

    const result = getFileExtension(filePath) === FILE_EXTENSIONS.MARKDOWN;
    fileTypeCache.set(cacheKey, result);
    return result;
};

/**
 * Check if a file is an image file
 */
export const isImageFile = createFileTypeChecker(IMAGE_EXTENSIONS, 'image');

/**
 * Check if a file is supported by the application (markdown, MDX, or image)
 */
export const isSupportedFile = createFileTypeChecker(SUPPORTED_EXTENSIONS, 'supported');

/**
 * Get the display name for a file (without extension)
 */
export const getFileDisplayName = (fileName: string): string => {
    // Use SUPPORTED_EXTENSIONS to ensure consistency
    return fileName.replace(EXTENSIONS_PATTERN, '');
};

/**
 * Normalize file path by removing leading/trailing slashes and ensuring consistency
 */
export const normalizeFilePath = (filePath: string): string => {
    return filePath.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
};

/**
 * Clear caches when needed (useful for development or when file system changes)
 */
export const clearFileUtilCaches = (): void => {
    extensionCache.clear();
    fileTypeCache.clear();
};

/**
 * Get cache statistics for debugging
 */
export const getFileUtilCacheStats = (): { extensionCache: number; fileTypeCache: number } => {
    return {
        extensionCache: extensionCache.size,
        fileTypeCache: fileTypeCache.size
    };
};