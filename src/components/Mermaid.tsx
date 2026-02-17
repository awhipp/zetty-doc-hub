import { useEffect, useRef, useState, useId } from 'react';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, '-');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        if (cancelled || !containerRef.current) return;

        const { svg } = await mermaid.render(`mermaid-${uniqueId}`, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="mermaid-error">
        <p>⚠️ Diagram rendering error</p>
        <pre>{chart}</pre>
      </div>
    );
  }

  return <div ref={containerRef} className="mermaid-container" />;
}
