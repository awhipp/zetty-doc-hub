import { PATHS, getBasePath } from './constants';
import { normalizeFilePath } from './fileUtils';
import { EXTENSIONS_PATTERN, SUPPORTED_EXTENSIONS } from './constants';

// Get the current base path from configuration
const getCurrentBasePath = (): string => {
  const basePath = getBasePath();
  // Remove leading and trailing slashes, then return with trailing slash for consistency
  return basePath === '/' ? '' : basePath.replace(/^\/+|\/+$/g, '');
};

// URL and file path utilities for routing
export const filePathToUrl = (filePath: string): string => {
  // Convert '/src/docs/getting-started.md' to '/getting-started'
  // Convert '/src/docs/api/overview.md' to '/api/overview'
  return filePath
    .replace(PATHS.DOCS_ROOT + '/', '/')
    .replace(/\.(md|mdx)$/, '');
};

export const urlToFilePath = (url: string): string => {
  // Convert '/getting-started' to '/src/docs/getting-started.md'
  // Convert '/api/overview' to '/src/docs/api/overview.md'
  
  const basePath = getCurrentBasePath();
  
  // Handle root path or base path
  if (url === '/' || url === `/${basePath}/` || url === `/${basePath}`) {
    return PATHS.DEFAULT_FILE; // Default file
  }
  
  // Remove leading slash and base path if present
  let cleanUrl = normalizeFilePath(url);
  if (basePath && cleanUrl.startsWith(`${basePath}/`)) {
    cleanUrl = cleanUrl.replace(`${basePath}/`, '');
  }
  
  // For now, we'll try .md first, then .mdx
  // In a real app, you might want to check which file actually exists
  return `${PATHS.DOCS_ROOT}/${cleanUrl}.md`;
};

export const urlToFilePathWithExtension = (url: string, availableFiles: string[]): string => {
  // Remove leading slash if present
  let cleanUrl = normalizeFilePath(url);
  
  const basePath = getCurrentBasePath();
  
  // Remove the base path if it exists
  if (basePath && cleanUrl.startsWith(`${basePath}/`)) {
    cleanUrl = cleanUrl.replace(`${basePath}/`, '');
  }
  
  // Handle root path or when URL is just the base path
  if (url === '/' || cleanUrl === '' || cleanUrl === `${basePath}/` || cleanUrl === basePath) {
    return PATHS.DEFAULT_FILE;
  }
  
  // Check if the URL already has a supported file extension
  if (cleanUrl.match(EXTENSIONS_PATTERN)) {
    // URL already has an extension, check if it's already a full path
    let directPath: string;
    if (cleanUrl.startsWith('src/docs/')) {
      // URL already includes the docs root, just add leading slash
      directPath = `/${cleanUrl}`;
    } else {
      // URL is relative, prepend the docs root
      directPath = `${PATHS.DOCS_ROOT}/${cleanUrl}`;
    }
    
    if (availableFiles.includes(directPath)) {
      return directPath;
    }
    // If the direct path doesn't exist, fall back to the original behavior
    // This handles edge cases where someone might manually type an incorrect extension
  }
  
  // Try to find the file with any supported extension, prioritizing markdown files  
  for (const ext of SUPPORTED_EXTENSIONS) {
    const testPath = `${PATHS.DOCS_ROOT}/${cleanUrl}.${ext}`;
    if (availableFiles.includes(testPath)) {
      return testPath;
    }
  }
  
  // Default to .md if not found
  return `${PATHS.DOCS_ROOT}/${cleanUrl}.md`;
};

// Extract internal links from markdown content and convert them
export const convertInternalLinks = (content: string): string => {
  // Match markdown links: [text](path)
  return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Check if it's an internal link (doesn't start with http/https/mailto)
    if (!url.match(/^(https?:\/\/|mailto:|#)/)) {
      // Convert internal markdown links to router links
      // Remove .md/.mdx extensions from the URL
      const cleanUrl = url.replace(/\.(md|mdx)$/, '');
      return `[${text}](${cleanUrl})`;
    }
    return match;
  });
};
