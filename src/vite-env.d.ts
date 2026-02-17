// Declare the virtual module provided by our Vite plugin
declare module 'virtual:docs-manifest' {
  import type { DocsManifest } from '@/types';
  const manifest: DocsManifest;
  export default manifest;
}

// Cytoscape layout extension
declare module 'cytoscape-cose-bilkent' {
  import type { Ext } from 'cytoscape';
  const ext: Ext;
  export default ext;
}
