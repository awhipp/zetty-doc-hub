#!/usr/bin/env node

/**
 * Bundle analysis script to monitor performance metrics
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist/assets');
const SIZE_LIMITS = {
  WARNING_THRESHOLD: 500 * 1024, // 500KB
  MAX_CHUNK_SIZE: 800 * 1024,    // 800KB
  GZIP_TARGET: 150 * 1024        // 150KB gzipped
};

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + 'KB';
}

function analyzeBundles() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(DIST_DIR, file);
      const size = getFileSize(filePath);
      return { file, size };
    })
    .sort((a, b) => b.size - a.size);

  console.log('\n📊 Bundle Analysis Report\n');
  console.log('File'.padEnd(50) + 'Size'.padStart(15) + 'Status'.padStart(15));
  console.log('='.repeat(80));

  let totalSize = 0;
  let warnings = 0;
  let errors = 0;

  files.forEach(({ file, size }) => {
    totalSize += size;
    let status = '✅ OK';
    
    if (size > SIZE_LIMITS.MAX_CHUNK_SIZE) {
      status = '❌ TOO LARGE';
      errors++;
    } else if (size > SIZE_LIMITS.WARNING_THRESHOLD) {
      status = '⚠️  LARGE';
      warnings++;
    }

    console.log(
      file.padEnd(50) + 
      formatSize(size).padStart(15) + 
      status.padStart(15)
    );
  });

  console.log('='.repeat(80));
  console.log(`Total JS size: ${formatSize(totalSize)}`);
  console.log(`Warnings: ${warnings}, Errors: ${errors}`);

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (errors > 0) {
    console.log('   - Consider code splitting for large bundles');
    console.log('   - Use dynamic imports for heavy libraries');
  }
  if (warnings > 0) {
    console.log('   - Monitor bundle growth over time');
    console.log('   - Consider lazy loading for non-critical features');
  }
  if (errors === 0 && warnings === 0) {
    console.log('   ✅ All bundles are within recommended size limits!');
  }

  // Vendor chunk analysis
  const vendorChunks = files.filter(({ file }) => file.includes('vendor'));
  if (vendorChunks.length > 0) {
    console.log('\n📦 Vendor Chunks:');
    vendorChunks.forEach(({ file, size }) => {
      console.log(`   ${file}: ${formatSize(size)}`);
    });
  }

  console.log('\n');
  return { warnings, errors };
}

// Run analysis
const { warnings, errors } = analyzeBundles();

// Exit with appropriate code
if (errors > 0) {
  process.exit(1);
} else if (warnings > 0) {
  process.exit(0); // Warnings don't fail the build
} else {
  process.exit(0);
}