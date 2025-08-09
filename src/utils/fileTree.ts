import type { FileTreeNode } from '../types/fileTree';
import { PATHS } from './constants';
import { getSiteConfig } from '../config/siteConfig';

// Dynamically import all markdown and image files from the docs directory
const docsModules = import.meta.glob('/src/docs/**/*.{md,mdx,svg,png,jpg,jpeg,gif,webp}', { eager: false });

// Cache for the built file tree to prevent unnecessary rebuilds
let cachedFileTree: FileTreeNode[] | null = null;
let cachedFilePaths: string[] | null = null;
let lastHiddenDirectories: string[] | null = null;

// Helper function to check if a path should be hidden
export const isPathHidden = (filePath: string, hiddenDirectories: string[]): boolean => {
  return hiddenDirectories.some(hiddenDir => {
    // Normalize the hidden directory path - ensure it starts with /src/docs/
    let normalizedHiddenDir = hiddenDir;
    if (!normalizedHiddenDir.startsWith('/src/docs/')) {
      if (normalizedHiddenDir.startsWith('src/docs/')) {
        normalizedHiddenDir = '/' + normalizedHiddenDir;
      } else {
        normalizedHiddenDir = '/src/docs/' + normalizedHiddenDir;
      }
    }
    
    return filePath.startsWith(normalizedHiddenDir);
  });
};

// Build file tree dynamically from the actual files in src/docs
// Uses caching to prevent unnecessary rebuilds on re-renders
export const buildFileTree = (): FileTreeNode[] => {
  // Get the site configuration to access hidden directories
  const siteConfig = getSiteConfig();
  const hiddenDirectories = siteConfig.navigation.hiddenDirectories || [];

  // Return cached version if available and hiddenDirectories haven't changed
  if (cachedFileTree && JSON.stringify(hiddenDirectories) === JSON.stringify(lastHiddenDirectories)) {
    return cachedFileTree;
  }

  const fileMap = new Map<string, FileTreeNode>();
  const rootNodes: FileTreeNode[] = [];

  // Get all file paths and sort them for consistent ordering
  const filePaths = Object.keys(docsModules).sort();

  filePaths.forEach(filePath => {
    // Skip hidden paths
    if (isPathHidden(filePath, hiddenDirectories)) {
      return;
    }

    // Remove the /src/docs prefix and split into parts
    const relativePath = filePath.replace(PATHS.DOCS_ROOT + '/', '');
    const pathParts = relativePath.split('/');
    
    let currentPath: string = PATHS.DOCS_ROOT;
    let currentLevel = rootNodes;

    // Build the tree structure
    pathParts.forEach((part, index) => {
      const isFile = index === pathParts.length - 1;
      const fullPath = currentPath + '/' + part;
      
      // Skip if this intermediate path is hidden
      if (!isFile && isPathHidden(fullPath + '/', hiddenDirectories)) {
        return;
      }
      
      if (isFile) {
        // Create file node
        const fileNode: FileTreeNode = {
          name: part,
          path: fullPath,
          type: 'file'
        };
        currentLevel.push(fileNode);
        fileMap.set(fullPath, fileNode);
      } else {
        // Create or find folder node
        let folderNode = currentLevel.find(node => node.name === part && node.type === 'folder');
        
        if (!folderNode) {
          folderNode = {
            name: part,
            path: fullPath,
            type: 'folder',
            children: []
          };
          currentLevel.push(folderNode);
          fileMap.set(fullPath, folderNode);
        }
        
        currentLevel = folderNode.children!;
      }
      
      currentPath = fullPath;
    });
  });

  // Sort nodes: folders first, then files, both alphabetically
  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Recursively sort children
    nodes.forEach(node => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);
  
  // Cache the result
  cachedFileTree = rootNodes;
  lastHiddenDirectories = hiddenDirectories;
  return rootNodes;
};

// Utility function to get the module loader for a specific file path
export const getModuleLoader = (filePath: string) => {
  return docsModules[filePath];
};

// Utility function to get all files from the tree (flattened)
// Uses caching to prevent unnecessary recomputation
export const getAllFiles = (nodes: FileTreeNode[]): FileTreeNode[] => {
  const files: FileTreeNode[] = [];
  
  const traverse = (node: FileTreeNode) => {
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      node.children.forEach(traverse);
    }
  };
  
  nodes.forEach(traverse);
  return files;
};

// Get all available file paths as strings (cached for performance)
export const getAvailableFilePaths = (): string[] => {
  // Return cached version if available
  if (cachedFilePaths) {
    return cachedFilePaths;
  }

  const filePaths = [...Object.keys(docsModules)].sort();
  cachedFilePaths = filePaths;
  return filePaths;
};

// Clear cache when needed (e.g., in development when files change)
export const clearFileTreeCache = (): void => {
  cachedFileTree = null;
  cachedFilePaths = null;
  lastHiddenDirectories = null;
};
