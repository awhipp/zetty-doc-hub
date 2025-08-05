import React from 'react';
import type { TemplateProps } from '../../types/template';
import './GeneralTemplate.css';

const GeneralTemplate: React.FC<TemplateProps> = ({ content, frontMatter }) => {
  return (
    <div className="template-general">
      {frontMatter.title && (
        <header className="general-header">
          <h1 className="general-title">{frontMatter.title}</h1>
          {frontMatter.description && (
            <p className="general-description">{frontMatter.description}</p>
          )}
          {(frontMatter.author || frontMatter.date) && (
            <div className="general-meta">
              {frontMatter.author && <span className="general-author">By {frontMatter.author}</span>}
              {frontMatter.date && <span className="general-date">{frontMatter.date}</span>}
            </div>
          )}
        </header>
      )}
      
      <main className="general-content">
        {content}
      </main>
    </div>
  );
};

export default GeneralTemplate;