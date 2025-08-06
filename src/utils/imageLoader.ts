import { IMAGE_EXTENSIONS } from './constants';

// Image modules loaded via Vite's import.meta.glob
// This will import all images from the docs directory structure
const imageModules = import.meta.glob('/src/docs/**/*.{svg,png,jpg,jpeg,gif,webp}', {
  query: '?url',
  import: 'default'
});

/**
 * Load an image URL by its file path
 * Similar to markdownLoader but for images
 */
export const loadImageUrl = async (filePath: string): Promise<string | null> => {
  try {
    // Check if we have a module loader for this image file path
    const moduleLoader = imageModules[filePath];
    
    if (moduleLoader) {
      // Load the image URL
      const imageUrl = await moduleLoader();
      return imageUrl as string;
    } else {
      console.warn(`Image not found in modules: ${filePath}`);
      console.log('Available image files:', Object.keys(imageModules));
      return null;
    }
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

/**
 * Resolve relative image paths to absolute paths within the docs structure
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
 * Check if a file path is a supported image format
 */
export const isImageFile = (filePath: string): boolean => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  return extension ? (IMAGE_EXTENSIONS as readonly string[]).includes(extension) : false;
};

/**
 * Get all available image file paths for debugging
 */
export const getAvailableImagePaths = (): string[] => {
  return Object.keys(imageModules);
};

/**
 * Preload commonly used images for better performance
 */
export const preloadImages = async (imagePaths: string[]): Promise<void> => {
  const loadPromises = imagePaths.map(async (path) => {
    try {
      await loadImageUrl(path);
    } catch (error) {
      console.warn(`Failed to preload image: ${path}`, error);
    }
  });
  
  await Promise.allSettled(loadPromises);
};
