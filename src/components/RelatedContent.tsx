import { useState, useEffect } from 'react';
import { fetchRelatedContent } from '@/api/docsApi';
import type { RelatedContentData } from '@/types';
import './RelatedContent.css';

interface RelatedContentProps {
  filePath: string;
  onNavigate: (path: string) => void;
}

export default function RelatedContent({ filePath, onNavigate }: RelatedContentProps) {
  const [data, setData] = useState<RelatedContentData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRelatedContent(filePath)
      .then(d => { if (!cancelled) setData(d); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [filePath]);

  if (!data) return null;

  const hasContent =
    data.backlinks.length > 0 || data.outgoingLinks.length > 0 || data.byTags.length > 0;

  if (!hasContent) return null;

  return (
    <div className="related-content">
      <button className="related-toggle" onClick={() => setExpanded(!expanded)}>
        <span>{expanded ? '▼' : '▶'}</span>
        <span>Related Content ({data.backlinks.length + data.outgoingLinks.length})</span>
      </button>

      {expanded && (
        <div className="related-sections">
          {data.backlinks.length > 0 && (
            <div className="related-section">
              <h4 className="related-section-title">🔗 Backlinks</h4>
              <ul>
                {data.backlinks.map((bl, i) => (
                  <li key={i}>
                    <button className="related-link" onClick={() => onNavigate(bl.sourceFile)}>
                      {bl.sourceTitle}
                    </button>
                    {bl.referenceCount > 1 && (
                      <span className="ref-count">×{bl.referenceCount}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.outgoingLinks.length > 0 && (
            <div className="related-section">
              <h4 className="related-section-title">➡️ Links to</h4>
              <ul>
                {data.outgoingLinks.map((link, i) => (
                  <li key={i}>
                    <button className="related-link" onClick={() => onNavigate(link.filePath)}>
                      {link.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.byTags.length > 0 && (
            <div className="related-section">
              <h4 className="related-section-title">🏷️ Related by tags</h4>
              {data.byTags.map((group, i) => (
                <div key={i}>
                  <span className="shared-tags">{group.sharedTags.join(', ')}</span>
                  <ul>
                    {group.files.map((f, j) => (
                      <li key={j}>
                        <button className="related-link" onClick={() => onNavigate(f.filePath)}>
                          {f.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
