// Test script to verify image loading functionality
import { loadImageUrl, resolveImagePath, getAvailableImagePaths } from './utils/imageLoader';

console.log('=== Image Loader Test ===');

// Test 1: Check available images
const availableImages = getAvailableImagePaths();
console.log('Available images:', availableImages);

// Test 2: Test path resolution
const testPaths = [
  { original: '/docs/examples/references/image.svg', currentDoc: '/src/docs/examples/markdown-example.md' },
  { original: './references/image.svg', currentDoc: '/src/docs/examples/markdown-example.md' },
  { original: '../examples/references/image.svg', currentDoc: '/src/docs/getting-started/quick-start.md' }
];

testPaths.forEach(({ original, currentDoc }) => {
  const resolved = resolveImagePath(original, currentDoc);
  console.log(`${original} (from ${currentDoc}) -> ${resolved}`);
});

// Test 3: Try to load an image (async)
(async () => {
  try {
    const imagePath = '/src/docs/examples/references/image.svg';
    const imageUrl = await loadImageUrl(imagePath);
    console.log(`Loaded image URL: ${imageUrl}`);
  } catch (error) {
    console.error('Error loading image:', error);
  }
})();

console.log('=== End Test ===');
