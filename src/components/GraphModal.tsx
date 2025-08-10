import React, { useRef, useEffect, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import type { Core, NodeSingular } from 'cytoscape';
import { useNavigate } from 'react-router-dom';
import { getGraphDataWithCurrent } from '../utils/graphUtils';
import { IconClose, IconNetwork } from './shared/Icons';
import type { GraphData, GraphNode } from '../utils/graphUtils';
import './GraphModal.css';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilePath?: string;
  onNavigateToFile?: (filePath: string) => void;
  onNavigateToTag?: (tagName: string) => void;
}

const GraphModal: React.FC<GraphModalProps> = ({ 
  isOpen, 
  onClose, 
  currentFilePath,
  onNavigateToFile,
  onNavigateToTag
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle node clicks
  const handleNodeClick = useCallback((node: NodeSingular) => {
    const nodeData = node.data() as GraphNode;
    
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
    } else if (nodeData.type === 'tag' && nodeData.tagName) {
      if (onNavigateToTag) {
        onNavigateToTag(nodeData.tagName);
      }
      onClose();
    }
  }, [navigate, onNavigateToFile, onNavigateToTag, onClose]);

  // Initialize Cytoscape
  const initializeCytoscape = useCallback(async () => {
    if (!containerRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const graphData: GraphData = await getGraphDataWithCurrent(currentFilePath);

      // Convert graph data to Cytoscape format
      const elements = [
        ...graphData.nodes.map(node => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            filePath: node.filePath,
            tagName: node.tagName,
            description: node.description,
            isCurrent: node.isCurrent
          }
        })),
        ...graphData.edges.map(edge => ({
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
                if (data.isCurrent) return '#dc3545';
                return data.type === 'tag' ? '#28a745' : '#007acc';
              },
              'label': 'data(label)',
              'font-size': '12px',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#fff',
              'text-outline-width': 2,
              'text-outline-color': (ele: cytoscape.NodeSingular) => {
                const data = ele.data();
                if (data.isCurrent) return '#dc3545';
                return data.type === 'tag' ? '#28a745' : '#007acc';
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
                return data.type === 'tag' ? '#28a745' : '#666';
              },
              'target-arrow-color': (ele: cytoscape.EdgeSingular) => {
                const data = ele.data();
                return data.type === 'tag' ? '#28a745' : '#666';
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
        maxZoom: 3,
        wheelSensitivity: 0.2
      });

      // Add event listeners
      cy.on('tap', 'node', (evt) => {
        handleNodeClick(evt.target);
      });

      // Add tooltip functionality
      cy.on('mouseover', 'node', (evt) => {
        const node = evt.target;
        const data = node.data();
        
        // Create tooltip content for potential future use
        let tooltipContent = `<strong>${data.label}</strong>`;
        if (data.description) {
          tooltipContent += `<br/><small>${data.description}</small>`;
        }
        if (data.type === 'document') {
          tooltipContent += `<br/><small>Click to open document</small>`;
        } else if (data.type === 'tag') {
          tooltipContent += `<br/><small>Click to view tag</small>`;
        }
        
        // Simple visual hover effect for now
        node.style('border-width', '2px');
        node.style('border-color', '#ff6b6b');
        
        // TODO: Implement proper tooltip display
        console.log('Node hover:', tooltipContent);
      });

      cy.on('mouseout', 'node', (evt) => {
        const node = evt.target;
        node.style('border-width', '0px');
      });

      cyRef.current = cy;
      setLoading(false);
    } catch (err) {
      console.error('Failed to initialize graph:', err);
      setError('Failed to load document relationships');
      setLoading(false);
    }
  }, [currentFilePath, handleNodeClick]);

  // Control functions
  const fitGraph = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  }, []);

  const centerGraph = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.center();
    }
  }, []);

  const resetZoom = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(1);
      cyRef.current.center();
    }
  }, []);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
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
                <div className="legend-item">
                  <div className="legend-color tag"></div>
                  <span>Tags</span>
                </div>
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
