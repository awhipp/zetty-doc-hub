import { FILE_EXTENSIONS, MDX_EXTENSIONS, IMAGE_EXTENSIONS, SUPPORTED_EXTENSIONS, EXTENSIONS_PATTERN } from './constants';

/**
 * Get file extension from a file path
 * Centralized to eliminate duplication across the codebase
 */
export const getFileExtension = (filePath: string): string => {
  return filePath.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if a file is a supported markdown file
 */
export const isMarkdownFile = (filePath: string): boolean => {
  const ext = getFileExtension(filePath);
  return MDX_EXTENSIONS.includes(ext as typeof MDX_EXTENSIONS[number]);
};

/**
 * Check if a file is specifically an MDX file
 */
export const isMdxFile = (filePath: string): boolean => {
  return getFileExtension(filePath) === FILE_EXTENSIONS.MDX;
};

/**
 * Check if a file is specifically a Markdown file (not MDX)
 */
export const isMarkdownOnlyFile = (filePath: string): boolean => {
  return getFileExtension(filePath) === FILE_EXTENSIONS.MARKDOWN;
};

/**
 * Check if a file is an image file
 */
export const isImageFile = (filePath: string): boolean => {
  const ext = getFileExtension(filePath);
  return IMAGE_EXTENSIONS.includes(ext as typeof IMAGE_EXTENSIONS[number]);
};

/**
 * Check if a file is supported by the application (markdown, MDX, or image)
 */
export const isSupportedFile = (filePath: string): boolean => {
  const ext = getFileExtension(filePath);
  return SUPPORTED_EXTENSIONS.includes(ext as typeof SUPPORTED_EXTENSIONS[number]);
};

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