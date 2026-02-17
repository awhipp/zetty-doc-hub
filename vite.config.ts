import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { docsManifestPlugin } from './scripts/docsManifestPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildTime = new Date().toISOString();
  const basePath = env.VITE_BASE_PATH || '/';

  return {
    plugins: [
      react(),
      docsManifestPlugin() as Plugin,
    ],
    base: basePath,
    define: {
      global: 'globalThis',
      __BUILD_TIME__: JSON.stringify(buildTime),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    // Serve /docs as static in dev
    publicDir: 'public',
    server: {
      fs: {
        allow: ['.'],
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'gray-matter'],
            'mermaid-vendor': ['mermaid'],
            'highlight-vendor': ['highlight.js'],
            'graph-vendor': ['cytoscape', 'cytoscape-cose-bilkent'],
          },
        },
      },
      sourcemap: false,
      cssCodeSplit: true,
      minify: 'esbuild',
      target: 'es2020',
    },
  };
});
