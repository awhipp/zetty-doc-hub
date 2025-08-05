import React, { useEffect, useRef, useState, Suspense } from 'react';

interface MermaidProps {
  chart: string;
  id?: string;
}

// Lazy loading component for Mermaid to reduce initial bundle size
const LazyMermaidRenderer: React.FC<MermaidProps> = ({ chart, id = `mermaid-${Math.random().toString(36).substr(2, 9)}` }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [mermaidLib, setMermaidLib] = useState<typeof import('mermaid').default | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically import mermaid only when needed
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaidModule = await import('mermaid');
        setMermaidLib(mermaidModule.default);
      } catch (error) {
        console.error('Failed to load Mermaid:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (!mermaidLib || !mermaidRef.current) return;

    // Initialize mermaid
    mermaidLib.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
    });

    // Render the diagram
    mermaidLib.render(id, chart).then((result: { svg: string }) => {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = result.svg;
      }
    }).catch((error: Error) => {
      console.error('Mermaid rendering error:', error);
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `
          <div style="
            padding: 20px; 
            border: 2px dashed #ff6b6b; 
            border-radius: 8px; 
            background: #fff5f5; 
            color: #333;
            text-align: center;
          ">
            <strong>Mermaid Diagram Error</strong><br/>
            <small>Failed to render diagram. Check console for details.</small>
          </div>
        `;
      }
    });
  }, [mermaidLib, chart, id]);

  if (isLoading) {
    return (
      <div style={{
        textAlign: 'center',
        margin: '20px 0',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        background: '#f8f9fa'
      }}>
        <div>Loading diagram...</div>
      </div>
    );
  }

  return (
    <div 
      ref={mermaidRef}
      style={{
        textAlign: 'center',
        margin: '20px 0',
        padding: '10px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        background: '#ffffff'
      }}
    />
  );
};

const Mermaid: React.FC<MermaidProps> = (props) => {
  return (
    <Suspense fallback={
      <div style={{
        textAlign: 'center',
        margin: '20px 0',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        background: '#f8f9fa'
      }}>
        Loading diagram...
      </div>
    }>
      <LazyMermaidRenderer {...props} />
    </Suspense>
  );
};

export default Mermaid;