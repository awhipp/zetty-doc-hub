import { getAvailableFiles, loadMarkdownContent, loadMdxRawContent } from './markdownLoader';
import { getFileExtension, isMdxFile } from './fileUtils';
import { urlToFilePathWithExtension } from './routing';
import { getSiteConfig } from '../config/siteConfig';
import { getAllTags } from './tagsUtils';
import { buildBacklinksIndex } from './backlinksUtils';
import { isPathHidden } from './fileTree';
import type { FrontMatter } from '../types/template';

export interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'tag';
  filePath?: string;
  tagName?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'link' | 'tag';
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Cache for graph data
let cachedGraphData: GraphData | null = null;
let graphDataBuilt = false;

/**
 * Extract title from file path
 */
const extractTitleFromPath = (filePath: string): string => {
  const fileName = filePath.split('/').pop() || '';
  return fileName
    .replace(/\.(md|mdx)$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Extract links from markdown content
 */
const extractLinks = (content: string): Array<{ linkText: string; url: string }> => {
  const links: Array<{ linkText: string; url: string }> = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const [, linkText, url] = match;
    
    // Skip external links and anchors
    if (url.match(/^(https?:\/\/|mailto:|#)/)) {
      continue;
    }
    
    links.push({ linkText, url });
  }
  
  return links;
};

/**
 * Resolve relative URLs to absolute file paths
 */
const resolveFilePath = (currentFile: string, relativeUrl: string, availableFiles: string[]): string => {
  // Handle relative paths
  if (relativeUrl.startsWith('./') || relativeUrl.startsWith('../')) {
    // Get the directory of the current file
    const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));
    
    // Resolve the relative path
    const parts = currentDir.split('/').concat(relativeUrl.split('/'));
    const resolved: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '.' && part !== '') {
        resolved.push(part);
      }
    }
    
    const resolvedPathCandidate = '/' + resolved.join('/');
    
    // Try to find the file with the resolved path
    return urlToFilePathWithExtension(resolvedPathCandidate, availableFiles);
  } else {
    // Handle absolute paths (starting with /)
    return urlToFilePathWithExtension(relativeUrl, availableFiles);
  }
};

/**
 * Build the complete graph data for all documents and their relationships
 */
export const buildGraphData = async (): Promise<GraphData> => {
  if (graphDataBuilt && cachedGraphData) {
    return cachedGraphData;
  }

  // Ensure backlinks index is built
  await buildBacklinksIndex();

  const siteConfig = getSiteConfig();
  const hiddenDirectories = siteConfig.navigation.hiddenDirectories || [];
  
  const availableFiles = getAvailableFiles();
  const documentFiles = availableFiles.filter(file => {
    // Filter out files from hidden directories
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return ['md', 'mdx'].includes(getFileExtension(file));
  });

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  // Add document nodes
  for (const filePath of documentFiles) {
    try {
      let frontMatter: FrontMatter = {};
      
      if (isMdxFile(filePath)) {
        const content = await loadMdxRawContent(filePath);
        // Extract front matter from raw content
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontMatterMatch) {
          const frontMatterText = frontMatterMatch[1];
          const titleMatch = frontMatterText.match(/title:\s*["']?([^"'\n]+)["']?/);
          const descMatch = frontMatterText.match(/description:\s*["']?([^"'\n]+)["']?/);
          if (titleMatch) {
            frontMatter.title = titleMatch[1];
          }
          if (descMatch) {
            frontMatter.description = descMatch[1];
          }
        }
      } else {
        const { frontMatter: parsedFrontMatter } = await loadMarkdownContent(filePath);
        frontMatter = parsedFrontMatter;
      }

      const title = frontMatter.title || extractTitleFromPath(filePath);
      const description = frontMatter.description;

      nodes.push({
        id: filePath,
        label: title,
        type: 'document',
        filePath,
        description,
        isCurrent: false
      });

      nodeIds.add(filePath);
    } catch (error) {
      console.warn(`Failed to process document ${filePath}:`, error);
    }
  }

  // Add link edges between documents
  for (const sourceFilePath of documentFiles) {
    try {
      let content: string;
      
      if (isMdxFile(sourceFilePath)) {
        content = await loadMdxRawContent(sourceFilePath);
      } else {
        const { content: markdownContent } = await loadMarkdownContent(sourceFilePath);
        content = markdownContent;
      }

      const links = extractLinks(content);
      
      for (const link of links) {
        const targetFilePath = resolveFilePath(sourceFilePath, link.url, availableFiles);
        
        // Only add edge if target document exists in our node set
        if (nodeIds.has(targetFilePath)) {
          const edgeId = `link-${sourceFilePath}-${targetFilePath}`;
          
          if (!edgeIds.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: sourceFilePath,
              target: targetFilePath,
              type: 'link',
              label: link.linkText
            });
            edgeIds.add(edgeId);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to extract links from ${sourceFilePath}:`, error);
    }
  }

  // Add tag nodes and edges
  try {
    const allTags = await getAllTags();
    
    for (const tag of allTags) {
      // Only add tag nodes if they have documents
      if (tag.files.length > 0) {
        const tagNodeId = `tag-${tag.name}`;
        
        nodes.push({
          id: tagNodeId,
          label: tag.name,
          type: 'tag',
          tagName: tag.name,
          description: `${tag.count} document${tag.count !== 1 ? 's' : ''}`
        });

        nodeIds.add(tagNodeId);

        // Add edges from documents to tags
        for (const file of tag.files) {
          if (nodeIds.has(file.filePath)) {
            const edgeId = `tag-${file.filePath}-${tagNodeId}`;
            
            if (!edgeIds.has(edgeId)) {
              edges.push({
                id: edgeId,
                source: file.filePath,
                target: tagNodeId,
                type: 'tag'
              });
              edgeIds.add(edgeId);
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to add tag nodes and edges:', error);
  }

  const graphData: GraphData = { nodes, edges };
  
  cachedGraphData = graphData;
  graphDataBuilt = true;
  
  return graphData;
};

/**
 * Reset the graph data cache (useful for development/testing)
 */
export const resetGraphData = (): void => {
  cachedGraphData = null;
  graphDataBuilt = false;
};

/**
 * Get graph data with a specific current document highlighted
 */
export const getGraphDataWithCurrent = async (currentFilePath?: string): Promise<GraphData> => {
  const graphData = await buildGraphData();
  
  // Clone the data to avoid mutating the cache
  const nodes = graphData.nodes.map(node => ({
    ...node,
    isCurrent: node.filePath === currentFilePath
  }));
  
  return {
    nodes,
    edges: [...graphData.edges]
  };
};
