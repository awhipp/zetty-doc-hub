import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelatedContent } from '../utils/backlinksUtils';
import { filePathToUrl } from '../utils/routing';
import { ContentLoading, ErrorState } from './shared/LoadingStates';
import type { RelatedContent } from '../types/backlinks';
import './RelatedContent.css';

interface RelatedContentProps {
  filePath: string;
}

const RelatedContent: React.FC<RelatedContentProps> = ({ filePath }) => {
  const [relatedContent, setRelatedContent] = useState<RelatedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backlinksExpanded, setBacklinksExpanded] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadRelatedContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const content = await getRelatedContent(filePath);
        
        if (isMounted) {
          setRelatedContent(content);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load related content');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRelatedContent();

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  const handleFileClick = (targetFilePath: string) => {
    const url = filePathToUrl(targetFilePath);
    navigate(url);
  };

  if (loading) {
    return (
      <div className="related-content-loading">
        <ContentLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="related-content-error">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!relatedContent) {
    return null;
  }

  const { backlinks, byTags } = relatedContent;
  const hasContent = backlinks.length > 0 || byTags.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="related-content" id="related-content">
      <div className="related-content-header">
        <p><strong>🔗 Related Content</strong></p>
        <p>Discover more content connected to this page</p>
      </div>

      <div className="related-sections">
        {/* Backlinks Section */}
        {backlinks.length > 0 && (
          <div className="related-section">
            <h4 
              className="collapsible-header"
              onClick={() => setBacklinksExpanded(!backlinksExpanded)}
            >
              <span className="section-icon">⬅️</span>
              Backlinks ({backlinks.length})
              <span className={`expand-icon ${backlinksExpanded ? 'expanded' : ''}`}>▼</span>
            </h4>
            <p className="section-description">Pages that link to this content</p>
            {backlinksExpanded && (
              <div className="related-items">
                {backlinks.map((backlink, index) => (
                  <div
                    key={`${backlink.sourceFile}-${index}`}
                    className="related-item backlink-item"
                    onClick={() => handleFileClick(backlink.sourceFile)}
                  >
                    <div className="item-header">
                      <h5 className="item-title">{backlink.sourceTitle}</h5>
                      <span className="item-type">
                        {backlink.referenceCount > 1 
                          ? `${backlink.referenceCount} references` 
                          : 'backlink'
                        }
                      </span>
                    </div>
                    {backlink.sourceDescription && (
                      <p className="item-description">{backlink.sourceDescription}</p>
                    )}
                    <div className="link-context">
                      <span className="link-text">"{backlink.linkText}"</span>
                      {backlink.context && (
                        <p className="context-preview">...{backlink.context}...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related by Tags Section */}
        {byTags.length > 0 && (
          <div className="related-section">
            <h4 
              className="collapsible-header"
              onClick={() => setTagsExpanded(!tagsExpanded)}
            >
              <span className="section-icon">🏷️</span>
              Related by Tags ({byTags.reduce((acc, group) => acc + group.files.length, 0)})
              <span className={`expand-icon ${tagsExpanded ? 'expanded' : ''}`}>▼</span>
            </h4>
            <p className="section-description">Pages sharing similar topics</p>
            {tagsExpanded && (
              <>
                {byTags.map((tagGroup, groupIndex) => (
                  <div key={groupIndex} className="tag-group">
                    <div className="tag-group-header">
                      <span className="shared-tags">#{tagGroup.tag}</span>
                      <span className="file-count">({tagGroup.files.length} files)</span>
                    </div>
                    <div className="related-items">
                      {tagGroup.files.map((file, fileIndex) => (
                        <div
                          key={`${file.filePath}-${fileIndex}`}
                          className="related-item tag-related-item"
                          onClick={() => handleFileClick(file.filePath)}
                        >
                          <div className="item-header">
                            <h5 className="item-title">{file.title}</h5>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedContent;
