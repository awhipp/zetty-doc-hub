// File system constants to eliminate duplication across the codebase
export const FILE_EXTENSIONS = {
  MARKDOWN: 'md',
  MDX: 'mdx',
  // Image extensions
  SVG: 'svg',
  PNG: 'png',
  JPG: 'jpg',
  JPEG: 'jpeg',
  GIF: 'gif',
  WEBP: 'webp'
} as const;

export const PATHS = {
  DOCS_ROOT: '/src/docs',
  DOCS_ROOT_PUBLIC: '/docs',
  // Default file to show on root path. Set to empty string to show welcome screen,
  // or set to a specific file path (e.g., '/src/docs/README.md') to show that file by default
  DEFAULT_FILE: ''
} as const;

export const MDX_EXTENSIONS = [FILE_EXTENSIONS.MARKDOWN, FILE_EXTENSIONS.MDX] as const;
export const IMAGE_EXTENSIONS = [
  FILE_EXTENSIONS.SVG, 
  FILE_EXTENSIONS.PNG, 
  FILE_EXTENSIONS.JPG, 
  FILE_EXTENSIONS.JPEG, 
  FILE_EXTENSIONS.GIF, 
  FILE_EXTENSIONS.WEBP
] as const;
export const SUPPORTED_EXTENSIONS = [...MDX_EXTENSIONS, ...IMAGE_EXTENSIONS] as const;

export const EXTENSIONS_PATTERN = new RegExp(`\\.(${SUPPORTED_EXTENSIONS.join('|')})$`);

// Base path configuration - now configurable via site config
// This function will be called at runtime to get the current base path
export const getBasePath = (): string => {
  // Use environment variable first, fallback to default
  return import.meta.env.VITE_BASE_PATH || '/';
};

// For backward compatibility, keep BASE_PATH but make it dynamic
export const BASE_PATH = getBasePath();

// Bundle size constants for optimization
export const BUNDLE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 500 * 1024, // 500KB
  MAX_CHUNK_SIZE: 800 * 1024     // 800KB
} as const;

// Performance constants
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,           // ms for search debouncing
  LAZY_LOAD_THRESHOLD: 100       // number of items before virtualization
} as const;

// UI constants
export const UI = {
  MOBILE_BREAKPOINT: 768,        // px
  SIDE_PANEL_WIDTH: 280,         // px
  TREE_NODE_INDENT: 20           // px per level
} as const;