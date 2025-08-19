import { getAvailableFiles, loadMarkdownContent, loadMdxRawContent } from './markdownLoader';
import { getFileExtension, isMdxFile } from './fileUtils';
import { getSiteConfig } from '../config/siteConfig';
import { getAllTags } from './tagsUtils';
import { buildBacklinksIndex } from './backlinksUtils';
import { isPathHidden } from './fileTree';
import { extractLinks } from './linkExtractor';
import { resolveFilePath, extractTitleFromPath } from './pathUtils';
import { extractFrontMatter } from './frontMatterUtils';
import type { FrontMatter } from '../types/template';

export interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'tag' | 'image';
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
 * Build the complete graph data for all documents and their relationships
 */
import { isImageFile } from './fileUtils';

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
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return ['md', 'mdx'].includes(getFileExtension(file));
  });

  const imageFiles = availableFiles.filter(file => {
    if (isPathHidden(file, hiddenDirectories)) {
      return false;
    }
    return isImageFile(file);
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
        // Extract front matter from raw content using consolidated utility
        frontMatter = extractFrontMatter(content);
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

  // Add image nodes
  for (const filePath of imageFiles) {
    try {
      // Use the same title extraction as for documents, but allow all extensions
      const title = extractTitleFromPath(filePath);
      nodes.push({
        id: filePath,
        label: title,
        type: 'image',
        filePath,
        description: 'Image file',
        isCurrent: false
      });
      nodeIds.add(filePath);
    } catch (error) {
      console.warn(`Failed to process image ${filePath}:`, error);
    }
  }

  // Add link edges between documents and images
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