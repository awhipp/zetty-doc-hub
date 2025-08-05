// Test script to verify dynamic file tree functionality
import { buildFileTree, getAllFiles } from './utils/fileTree';

console.log('=== Dynamic File Tree Test ===');

const tree = buildFileTree();
console.log('File tree structure:', JSON.stringify(tree, null, 2));

const allFiles = getAllFiles(tree);
console.log('\nAll files found:');
allFiles.forEach(file => {
  console.log(`- ${file.name} (${file.path})`);
});

console.log(`\nTotal files: ${allFiles.length}`);
console.log('=== End Test ===');
