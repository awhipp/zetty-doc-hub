import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { docsAssetsPlugin } from './src/plugins/docsAssetsPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      }),
      docsAssetsPlugin()
    ],
    assetsInclude: ['**/*.md', '**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
    base: env.VITE_BASE_PATH || '/',
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    build: {
      // Increase chunk size warning limit for intentionally large chunks
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'gray-matter'],
            // Large visualization libraries should be separate
            'mermaid-vendor': ['mermaid'],
            'highlight-vendor': ['highlight.js'],
            // MDX processing
            'mdx-vendor': ['@mdx-js/react', '@mdx-js/rollup']
          }
        }
      },
      // Enable source maps for better debugging in production
      sourcemap: false,
      // Optimize CSS
      cssCodeSplit: true,
      // Enable minification
      minify: 'esbuild',
      // Target modern browsers for better optimization
      target: 'es2020'
    }
  };
})
