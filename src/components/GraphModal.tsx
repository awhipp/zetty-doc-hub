import React, { useRef, useEffect, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import type { Core, NodeSingular } from 'cytoscape';
import { useNavigate } from 'react-router-dom';
import { getGraphDataWithCurrent } from '../utils/graphUtils';
import { getGraphColors, setGraphColorCSSVariables } from '../utils/graphColors';
import { IconClose, IconNetwork } from './shared/Icons';
import type { GraphData, GraphNode } from '../utils/graphUtils';
import './GraphModal.css';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilePath?: string;
  onNavigateToFile?: (filePath: string) => void;
}

const GraphModal: React.FC<GraphModalProps> = ({ 
  isOpen, 
  onClose, 
  currentFilePath,
  onNavigateToFile
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(true);
  const [showRelatedOnly, setShowRelatedOnly] = useState(!!currentFilePath);
  const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);

  // Handle node clicks
  const handleNodeClick = useCallback((node: NodeSingular) => {
    const nodeData = node.data() as GraphNode;
    
    // Only handle document clicks, not tag clicks
    if (nodeData.type === 'document' && nodeData.filePath) {
      if (onNavigateToFile) {
        onNavigateToFile(nodeData.filePath);
      } else {
        // Use react-router to navigate
        const urlPath = nodeData.filePath
          .replace('/src/docs/', '/')
          .replace(/\.(md|mdx)$/, '');
        navigate(urlPath);
      }
      onClose();
    }
    // Tags no longer have click actions
  }, [navigate, onNavigateToFile, onClose]);

  // Filter graph data based on current settings
  const getFilteredGraphData = useCallback((graphData: GraphData): GraphData => {
    if (!showRelatedOnly || !currentFilePath) {
      // Show everything (filtered by tags if needed)
      return {
        nodes: showTags ? graphData.nodes : graphData.nodes.filter(node => node.type !== 'tag'),
        edges: showTags ? graphData.edges : graphData.edges.filter(edge => edge.type !== 'tag')
      };
    }

    // Show only nodes related to current document
    const relatedNodeIds = new Set<string>();
    const relatedEdges: typeof graphData.edges = [];

    // Always include the current document
    relatedNodeIds.add(currentFilePath);

    // Find all edges connected to the current document
    graphData.edges.forEach(edge => {
      if (edge.source === currentFilePath || edge.target === currentFilePath) {
        relatedEdges.push(edge);
        relatedNodeIds.add(edge.source);
        relatedNodeIds.add(edge.target);
      }
    });

    // Filter nodes to only include related ones
    const filteredNodes = graphData.nodes.filter(node => {
      if (!relatedNodeIds.has(node.id)) return false;
      if (!showTags && node.type === 'tag') return false;
      return true;
    });

    // Filter edges based on remaining nodes and tag visibility
    const filteredEdges = relatedEdges.filter(edge => {
      const sourceNode = filteredNodes.find(n => n.id === edge.source);
      const targetNode = filteredNodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return false;
      if (!showTags && edge.type === 'tag') return false;
      return true;
    });

    return {
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }, [showTags, showRelatedOnly, currentFilePath]);

  // Update graph display based on current filters
  const updateGraphDisplay = useCallback(() => {
    if (!cyRef.current || !fullGraphData) return;

    const filteredData = getFilteredGraphData(fullGraphData);

    // Convert to Cytoscape format
    const elements = [
      ...filteredData.nodes.map(node => ({
        data: {
          id: node.id,
          label: node.type === 'tag' ? `#${node.label}` : node.label,
          type: node.type,
          filePath: node.filePath,
          tagName: node.tagName,
          description: node.description,
          isCurrent: node.isCurrent
        }
      })),
      ...filteredData.edges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          label: edge.label
        }
      }))
    ];

    // Update the graph
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    cyRef.current.layout({
      name: 'cose',
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }).run();
  }, [fullGraphData, getFilteredGraphData]);

  // Initialize Cytoscape
  const initializeCytoscape = useCallback(async () => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const graphData: GraphData = await getGraphDataWithCurrent(currentFilePath);
      setFullGraphData(graphData);
      
      const filteredData = getFilteredGraphData(graphData);
      const colors = getGraphColors();

      // Convert graph data to Cytoscape format
      const elements = [
        ...filteredData.nodes.map(node => ({
          data: {
            id: node.id,
            label: node.type === 'tag' ? `#${node.label}` : node.label,
            type: node.type,
            filePath: node.filePath,
            tagName: node.tagName,
            description: node.description,
            isCurrent: node.isCurrent
          }
        })),
        ...filteredData.edges.map(edge => ({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            label: edge.label
          }
        }))
      ];

      // Clean up existing instance
      if (cyRef.current) {
        cyRef.current.destroy();
      }

      // Create new Cytoscape instance
      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': (ele: cytoscape.NodeSingular) => {
                const data = ele.data();
                if (data.isCurrent) return colors.current;
                return data.type === 'tag' ? colors.tag : colors.document;
              },
              'label': 'data(label)',
              'font-size': '12px',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#fff',
              'text-outline-width': 2,
              'text-outline-color': (ele: cytoscape.NodeSingular) => {
                const data = ele.data();
                if (data.isCurrent) return colors.current;
                return data.type === 'tag' ? colors.tag : colors.document;
              },
              'width': (ele: cytoscape.NodeSingular) => {
                const data = ele.data();
                return data.type === 'tag' ? '30px' : data.isCurrent ? '35px' : '30px';
              },
              'height': (ele: cytoscape.NodeSingular) => {
                const data = ele.data();
                return data.type === 'tag' ? '30px' : data.isCurrent ? '35px' : '30px';
              }
            }
          },
          {
            selector: 'node[type = "tag"]',
            style: {
              'shape': 'hexagon'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': (ele: cytoscape.EdgeSingular) => {
                const data = ele.data();
                return data.type === 'tag' ? colors.tag : '#666';
              },
              'target-arrow-color': (ele: cytoscape.EdgeSingular) => {
                const data = ele.data();
                return data.type === 'tag' ? colors.tag : '#666';
              },
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'opacity': 0.7
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 3,
              'border-color': '#ff6b6b'
            }
          }
        ],
        layout: {
          name: 'cose',
          idealEdgeLength: 100,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0
        },
        minZoom: 0.1,
        maxZoom: 3
      });

      // Add event listeners
      cy.on('tap', 'node', (evt) => {
        handleNodeClick(evt.target);
      });

      // Add hover functionality with cursor styling
      cy.on('mouseover', 'node', (evt) => {
        const node = evt.target;
        const data = node.data();
        
        // Set cursor style based on node type
        if (data.type === 'document') {
          containerRef.current!.style.cursor = 'pointer';
        } else {
          containerRef.current!.style.cursor = 'default';
        }
        
        // Simple visual hover effect
        node.style('border-width', '2px');
        node.style('border-color', '#ff6b6b');
      });

      cy.on('mouseout', 'node', (evt) => {
        const node = evt.target;
        containerRef.current!.style.cursor = 'default';
        node.style('border-width', '0px');
      });

      cyRef.current = cy;
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize graph:', err);
      setError('Failed to load document relationships');
      setLoading(false);
    }
  }, [currentFilePath, handleNodeClick, getFilteredGraphData]);

  // Update display when filters change
  useEffect(() => {
    if (fullGraphData) {
      updateGraphDisplay();
    }
  }, [fullGraphData, showTags, showRelatedOnly, updateGraphDisplay]);

  // Control functions
  const fitGraph = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  }, []);

  const centerGraph = useCallback(() => {
    if (cyRef.current) {
      // If there's a current document, center on that node
      if (currentFilePath) {
        const currentNode = cyRef.current.$(`node[id="${currentFilePath}"]`);
        if (currentNode.length > 0) {
          cyRef.current.center(currentNode);
          return;
        }
      }
      // Otherwise, center the entire graph
      cyRef.current.center();
    }
  }, [currentFilePath]);

  const resetZoom = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(1);
      cyRef.current.center();
    }
  }, []);

  const zoomIn = useCallback(() => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom(currentZoom * 1.2);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom(currentZoom * 0.8);
    }
  }, []);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set CSS custom properties for graph colors
      setGraphColorCSSVariables();
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initializeCytoscape, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initializeCytoscape]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="graph-modal-overlay" onClick={onClose}>
      <div className="graph-modal" onClick={(e) => e.stopPropagation()}>
        <div className="graph-modal-header">
          <h2 className="graph-modal-title">
            <IconNetwork width={20} height={20} />
            Document Relationships
          </h2>
          <button
            className="graph-modal-close"
            onClick={onClose}
            aria-label="Close graph"
          >
            <IconClose width={20} height={20} />
          </button>
        </div>

        <div className="graph-controls-top">
          <label className="graph-toggle">
            <input
              type="checkbox"
              checked={showTags}
              onChange={(e) => setShowTags(e.target.checked)}
            />
            Show Tags
          </label>
          {currentFilePath && (
            <label className="graph-toggle">
              <input
                type="checkbox"
                checked={showRelatedOnly}
                onChange={(e) => setShowRelatedOnly(e.target.checked)}
              />
              Show Related Only
            </label>
          )}
        </div>
        
        <div className="graph-container">
          {loading && (
            <div className="graph-loading">
              Loading document relationships...
            </div>
          )}
          
          {error && (
            <div className="graph-error">
              {error}
            </div>
          )}
          
          <div
            ref={containerRef}
            className="graph-cytoscape"
            style={{ display: loading || error ? 'none' : 'block' }}
          />
          
          {!loading && !error && (
            <>
              <div className="graph-controls">
                <button
                  className="graph-control-btn"
                  onClick={zoomIn}
                  title="Zoom in"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  className="graph-control-btn"
                  onClick={zoomOut}
                  title="Zoom out"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  className="graph-control-btn"
                  onClick={fitGraph}
                  title="Fit to view"
                  aria-label="Fit graph to view"
                >
                  📐
                </button>
                <button
                  className="graph-control-btn"
                  onClick={centerGraph}
                  title="Center graph"
                  aria-label="Center graph"
                >
                  🎯
                </button>
                <button
                  className="graph-control-btn"
                  onClick={resetZoom}
                  title="Reset zoom"
                  aria-label="Reset zoom to 100%"
                >
                  🔍
                </button>
              </div>
              
              <div className="graph-legend">
                <h4>Legend</h4>
                <div className="legend-item">
                  <div className="legend-color document"></div>
                  <span>Documents</span>
                </div>
                {showTags && (
                  <div className="legend-item">
                    <div className="legend-color tag"></div>
                    <span>Tags</span>
                  </div>
                )}
                {currentFilePath && (
                  <div className="legend-item">
                    <div className="legend-color current"></div>
                    <span>Current Page</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphModal;
