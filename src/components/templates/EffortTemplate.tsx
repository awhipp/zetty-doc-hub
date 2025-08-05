import React from 'react';
import type { TemplateProps } from '../../types/template';
import './EffortTemplate.css';

const EffortTemplate: React.FC<TemplateProps> = ({ content, frontMatter }) => {
  // Parse assignees if it's a string
  const assignees = Array.isArray(frontMatter.assignees) 
    ? frontMatter.assignees 
    : typeof frontMatter.assignees === 'string' 
      ? frontMatter.assignees.split(',').map(a => a.trim())
      : [];

  // Parse links if they exist
  const links = frontMatter.links as Record<string, string> || {};

  return (
    <div className="template-effort">
      <header className="effort-header">
        <div className="effort-header-content">
          {frontMatter.title && <h1 className="effort-title">{frontMatter.title}</h1>}
          {frontMatter.description && <p className="effort-description">{frontMatter.description}</p>}
          
          <div className="effort-metadata">
            <div className="effort-details-section">
              <div className="effort-sidebar-title">Effort Details</div>
              <div className="effort-info-item">
                <div className="effort-info-label">📄 Document Type</div>
                <div className="effort-info-value">Technical Specification</div>
              </div>
              <div className="effort-info-item">
                <div className="effort-info-label">🎯 Purpose</div>
                <div className="effort-info-value">Central hub for effort planning, tracking, and documentation</div>
              </div>
              
              {Object.keys(links).length > 0 && (
                <div className="effort-info-item">
                  <div className="effort-info-label">🔗 Related Links</div>
                  <div className="effort-links">
                    {Object.entries(links).map(([label, url]) => (
                      <a key={label} href={url} className="effort-link" target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {frontMatter.tags && Array.isArray(frontMatter.tags) && frontMatter.tags.length > 0 && (
                <div className="effort-info-item">
                  <div className="effort-info-label">🏷️ Tags</div>
                  <div className="effort-tags">
                    {frontMatter.tags.map((tag, index) => (
                      <span key={index} className="effort-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="effort-meta-grid">
              {frontMatter.effortName && (
                <div className="effort-meta-item">
                  <span className="effort-meta-label">📋 Effort Name:</span>
                  <span className="effort-meta-value">{frontMatter.effortName}</span>
                </div>
              )}
              {assignees.length > 0 && (
                <div className="effort-meta-item">
                  <span className="effort-meta-label">👥 Assignees:</span>
                  <div className="effort-assignees">
                    {assignees.map((assignee: string, index: number) => (
                      <span key={index} className="effort-assignee">{assignee}</span>
                    ))}
                  </div>
                </div>
              )}
              {frontMatter.startDate && (
                <div className="effort-meta-item">
                  <span className="effort-meta-label">🚀 Start Date:</span>
                  <span className="effort-meta-value">{frontMatter.startDate}</span>
                </div>
              )}
              {frontMatter.endDate && (
                <div className="effort-meta-item">
                  <span className="effort-meta-label">🏁 End Date:</span>
                  <span className="effort-meta-value">{frontMatter.endDate}</span>
                </div>
              )}
              {frontMatter.status && (
                <div className="effort-meta-item">
                  <span className="effort-meta-label">📊 Status:</span>
                  <span className={`effort-status effort-status-${String(frontMatter.status).toLowerCase().replace(/\s+/g, '-')}`}>
                    {String(frontMatter.status)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="effort-content-wrapper">
        <main className="effort-main-content">
          {content}
        </main>
      </div>
    </div>
  );
};

export default EffortTemplate;