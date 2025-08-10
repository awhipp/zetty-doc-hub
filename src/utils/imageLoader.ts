import { IMAGE_EXTENSIONS } from './constants';
import { resolveImagePath } from './pathUtils';

// Re-export the resolveImagePath function for backward compatibility
export { resolveImagePath };

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
            if (import.meta.env && import.meta.env.DEV) {
                console.log('Available image files:', getAvailableImagePaths());
            }
            return null;
        }
    } catch (error) {
        console.error('Error loading image:', error);
        return null;
    }
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

    // Process images in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < loadPromises.length; i += batchSize) {
        const batch = loadPromises.slice(i, i + batchSize);
        await Promise.allSettled(batch);

        // Small delay between batches to prevent overwhelming the network
        if (i + batchSize < loadPromises.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
};
