import React from 'react';
import type { FrontMatter } from '../types/template';
import './DocumentTags.css';

interface DocumentTagsProps {
  frontMatter: FrontMatter;
  onTagClick?: (tagName: string) => void;
}

const DocumentTags: React.FC<DocumentTagsProps> = ({ frontMatter, onTagClick }) => {
  // Don't render if no tags
  if (!frontMatter.tags || !Array.isArray(frontMatter.tags) || frontMatter.tags.length === 0) {
    return null;
  }

  const handleTagClick = (tagName: string) => {
    if (onTagClick) {
      onTagClick(tagName);
    }
  };

  return (
    <div className="document-tags">
      <div className="tags-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      </div>
      <div className="tags-list">
        {frontMatter.tags.map((tag, index) => (
          <button
            key={index}
            className={`tag-item ${onTagClick ? 'tag-clickable' : ''}`}
            onClick={() => handleTagClick(tag)}
            disabled={!onTagClick}
            title={onTagClick ? `View all files with #${tag} tag` : undefined}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocumentTags;
