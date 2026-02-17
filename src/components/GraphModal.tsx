import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchGraphData } from '@/api/docsApi';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import type { GraphData } from '@/types';
import './GraphModal.css';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile?: string | null;
  onNavigate: (path: string) => void;
}

export default function GraphModal({ isOpen, onClose, currentFile, onNavigate }: GraphModalProps) {
  const config = useSiteConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<import('cytoscape').Core | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showTags, setShowTags] = useState(true);
  const [showRelatedOnly, setShowRelatedOnly] = useState(false);

  // Fetch graph data
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetchGraphData()
      .then(d => { if (!cancelled) setGraphData(d); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [isOpen]);

  // Render cytoscape
  useEffect(() => {
    if (!isOpen || !graphData || !containerRef.current) return;

    let cy: import('cytoscape').Core;

    (async () => {
      const cytoscape = (await import('cytoscape')).default;
      const coseBilkent = (await import('cytoscape-cose-bilkent')).default;

      // Register the layout extension (safe to call multiple times)
      try { cytoscape.use(coseBilkent); } catch { /* already registered */ }

      // Filter data
      let nodes = [...graphData.nodes];
      let edges = [...graphData.edges];

      if (!showTags) {
        const tagIds = new Set(nodes.filter(n => n.type === 'tag').map(n => n.id));
        nodes = nodes.filter(n => n.type !== 'tag');
        edges = edges.filter(e => !tagIds.has(e.source) && !tagIds.has(e.target));
      }

      if (showRelatedOnly && currentFile) {
        const related = new Set<string>([currentFile]);
        edges.forEach(e => {
          if (e.source === currentFile) related.add(e.target);
          if (e.target === currentFile) related.add(e.source);
        });
        nodes = nodes.filter(n => related.has(n.id));
        edges = edges.filter(e => related.has(e.source) && related.has(e.target));
      }

      // Mark current
      nodes = nodes.map(n => ({
        ...n,
        isCurrent: n.filePath === currentFile,
      }));

      const colors = config.graph.colors;

      cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...nodes.map(n => ({
            data: { id: n.id, label: n.label, nodeType: n.type, filePath: n.filePath, isCurrent: n.isCurrent },
          })),
          ...edges.map(e => ({
            data: { id: e.id, source: e.source, target: e.target, edgeType: e.type },
          })),
        ],
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'font-size': '7px',
              color: '#e2e8f0',
              'text-outline-color': '#0f172a',
              'text-outline-width': 1,
              'text-wrap': 'ellipsis',
              'text-max-width': '70px',
              'text-valign': 'bottom',
              'text-margin-y': 4,
              width: 18,
              height: 18,
            },
          },
          {
            selector: 'node[nodeType="document"]',
            style: {
              'background-color': colors.document,
              shape: 'ellipse',
            },
          },
          {
            selector: 'node[nodeType="tag"]',
            style: {
              'background-color': colors.tag,
              shape: 'hexagon',
              width: 14,
              height: 14,
            },
          },
          {
            selector: 'node[nodeType="image"]',
            style: {
              'background-color': colors.image,
              shape: 'rectangle',
              width: 14,
              height: 14,
            },
          },
          {
            selector: 'node[?isCurrent]',
            style: {
              'background-color': colors.current,
              width: 28,
              height: 28,
              'border-width': 2,
              'border-color': '#fff',
              label: 'data(label)',
              'font-size': '9px',
              color: '#e2e8f0',
              'text-outline-color': '#0f172a',
              'text-outline-width': 1,
              'text-valign': 'bottom',
              'text-margin-y': 6,
            },
          },
          {
            selector: 'edge',
            style: {
              width: 1,
              'line-color': '#555',
              'target-arrow-color': '#555',
              'target-arrow-shape': 'triangle',
              'arrow-scale': 0.6,
              'curve-style': 'bezier',
              opacity: 0.4,
            },
          },
          {
            selector: 'edge[edgeType="tag"]',
            style: {
              'line-style': 'dashed',
              'line-color': colors.tag,
              'target-arrow-color': colors.tag,
              opacity: 0.3,
              width: 0.8,
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
        layout: {
          name: 'cose-bilkent',
          animate: false,
          nodeDimensionsIncludeLabels: true,
          nodeRepulsion: 8000,
          idealEdgeLength: 120,
          edgeElasticity: 0.1,
          gravity: 0.2,
          gravityRange: 1.5,
          numIter: 2500,
          tile: true,
          tilingPaddingVertical: 20,
          tilingPaddingHorizontal: 20,
          padding: 30,
        } as cytoscape.LayoutOptions,
      });

      cy.on('tap', 'node[nodeType="document"]', evt => {
        const fp = evt.target.data('filePath');
        if (fp) {
          onNavigate(fp);
          onClose();
        }
      });

      cyRef.current = cy;
    })();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [isOpen, graphData, showTags, showRelatedOnly, currentFile, config.graph.colors, onNavigate, onClose]);

  const fit = useCallback(() => cyRef.current?.fit(undefined, 30), []);
  const zoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (cy) {
      const center = { x: cy.width() / 2, y: cy.height() / 2 };
      cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: center });
    }
  }, []);
  const zoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (cy) {
      const center = { x: cy.width() / 2, y: cy.height() / 2 };
      cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: center });
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="graph-overlay" onClick={onClose}>
      <div className="graph-modal" onClick={e => e.stopPropagation()}>
        <div className="graph-header">
          <h3>🕸️ Knowledge Graph</h3>
          <div className="graph-controls">
            <label className="graph-toggle">
              <input type="checkbox" checked={showTags} onChange={e => setShowTags(e.target.checked)} />
              Tags
            </label>
            <label className="graph-toggle">
              <input type="checkbox" checked={showRelatedOnly} onChange={e => setShowRelatedOnly(e.target.checked)} />
              Related only
            </label>
            <button className="btn-icon" onClick={zoomIn} title="Zoom in">➕</button>
            <button className="btn-icon" onClick={zoomOut} title="Zoom out">➖</button>
            <button className="btn-icon" onClick={fit} title="Fit">🔲</button>
            <button className="btn-icon" onClick={onClose} title="Close">✕</button>
          </div>
        </div>
        <div className="graph-legend">
          <span><span className="legend-dot" style={{ background: config.graph.colors.document }} /> Document</span>
          <span><span className="legend-dot" style={{ background: config.graph.colors.tag }} /> Tag</span>
          <span><span className="legend-dot" style={{ background: config.graph.colors.image }} /> Image</span>
          <span><span className="legend-dot" style={{ background: config.graph.colors.current }} /> Current</span>
        </div>
        <div ref={containerRef} className="graph-container" />
      </div>
    </div>
  );
}
