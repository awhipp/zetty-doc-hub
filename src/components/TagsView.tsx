import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllTags, getTagInfo, getTaggedFileUrl } from '../utils/tagsUtils';
import { ContentLoading, ErrorState } from './shared';
import type { TagInfo, TaggedFile } from '../types/tags';
import './TagsView.css';

interface TagsViewProps {
  onFileSelect?: (filePath: string) => void;
}

const TagsBreadcrumb: React.FC<{ tagName?: string; onNavigate: (path: string) => void }> = ({ tagName, onNavigate }) => (
  <nav className="breadcrumb" aria-label="Breadcrumb">
    <ol className="breadcrumb-list">
      <li className="breadcrumb-item">
        <button 
          className="breadcrumb-item breadcrumb-home"
          onClick={() => onNavigate('')}
          aria-label="Go to home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          Home
        </button>
      </li>
      <li className="breadcrumb-item">
        <svg className="breadcrumb-separator" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
        {tagName ? (
          <button 
            className="breadcrumb-item"
            onClick={() => onNavigate('/tags')}
          >
            Tags
          </button>
        ) : (
          <span className="breadcrumb-current" aria-current="page">
            Tags
          </span>
        )}
      </li>
      {tagName && (
        <li className="breadcrumb-item">
          <svg className="breadcrumb-separator" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
          <span className="breadcrumb-current" aria-current="page">
            {tagName}
          </span>
        </li>
      )}
    </ol>
  </nav>
);

interface TagsViewProps {
  onFileSelect?: (filePath: string) => void;
}

const TagsView: React.FC<TagsViewProps> = ({ onFileSelect }) => {
  const { tagName } = useParams<{ tagName?: string }>();
  const navigate = useNavigate();
  const [allTags, setAllTags] = useState<TagInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'frequency'>('alphabetical');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load all tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const tags = await getAllTags({
          sortBy,
          sortOrder
        });
        setAllTags(tags);
      } catch (err) {
        setError('Failed to load tags');
        console.error('Error loading tags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [sortBy, sortOrder]);

  // Load specific tag info when tagName changes
  useEffect(() => {
    const loadTagInfo = async () => {
      if (tagName) {
        try {
          const tagInfo = await getTagInfo(tagName);
          setSelectedTag(tagInfo);
        } catch (err) {
          console.error('Error loading tag info:', err);
          setSelectedTag(null);
        }
      } else {
        setSelectedTag(null);
      }
    };

    loadTagInfo();
  }, [tagName]);

  const handleTagClick = (tag: TagInfo) => {
    navigate(`/tags/${encodeURIComponent(tag.name)}`);
  };

  const handleFileClick = (taggedFile: TaggedFile) => {
    if (onFileSelect) {
      onFileSelect(taggedFile.filePath);
    } else {
      const url = getTaggedFileUrl(taggedFile);
      navigate(url);
    }
  };

  const handleBackToAllTags = () => {
    navigate('/tags');
  };

  const handleBreadcrumbNavigate = (path: string) => {
    const url = path === '' ? '/' : path;
    navigate(url);
  };

  const handleSortChange = (newSortBy: 'alphabetical' | 'frequency') => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="tags-view">
        <ContentLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tags-view">
        <ErrorState message={error} />
      </div>
    );
  }

  // Show specific tag view
  if (tagName && selectedTag) {
    return (
      <div className="tags-view">
        <TagsBreadcrumb tagName={tagName} onNavigate={handleBreadcrumbNavigate} />
        <div className="tags-header">
          <button 
            className="btn-base btn-secondary back-to-tags"
            onClick={handleBackToAllTags}
          >
            ← Back to All Tags
          </button>
          <h1 className="tag-title">
            <span className="tag-icon">🏷️</span>
            {selectedTag.name}
            <span className="tag-count">({selectedTag.count} file{selectedTag.count !== 1 ? 's' : ''})</span>
          </h1>
        </div>

        <div className="tagged-files">
          {selectedTag.files.map((file, index) => (
            <div 
              key={`${file.filePath}-${index}`}
              className="tagged-file-card"
              onClick={() => handleFileClick(file)}
            >
              <div className="tagged-file-header">
                <h3 className="tagged-file-title">{file.title}</h3>
                {file.template && (
                  <span className={`template-badge template-${file.template}`}>
                    {file.template}
                  </span>
                )}
              </div>
              
              {file.description && (
                <p className="tagged-file-description">{file.description}</p>
              )}
              
              <div className="tagged-file-meta">
                {file.author && (
                  <span className="tagged-file-author">
                    <span className="meta-icon">👤</span>
                    {file.author}
                  </span>
                )}
                {file.date && (
                  <span className="tagged-file-date">
                    <span className="meta-icon">📅</span>
                    {file.date}
                  </span>
                )}
                <span className="tagged-file-path">
                  <span className="meta-icon">📄</span>
                  {file.filePath.replace('/src/docs/', '')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show all tags view
  return (
    <div className="tags-view">
      <TagsBreadcrumb onNavigate={handleBreadcrumbNavigate} />
      <div className="tags-header">
        <h1 className="tags-main-title">
          <span className="tag-icon">🏷️</span>
          All Tags
          <span className="tags-count">({allTags.length} tag{allTags.length !== 1 ? 's' : ''})</span>
        </h1>
        
        <div className="tags-controls">
          <div className="sort-controls">
            <span className="sort-label">Sort by:</span>
            <button 
              className={`btn-base btn-sort ${sortBy === 'alphabetical' ? 'active' : ''}`}
              onClick={() => handleSortChange('alphabetical')}
            >
              Name
              {sortBy === 'alphabetical' && (
                <span className="sort-order">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            <button 
              className={`btn-base btn-sort ${sortBy === 'frequency' ? 'active' : ''}`}
              onClick={() => handleSortChange('frequency')}
            >
              Count
              {sortBy === 'frequency' && (
                <span className="sort-order">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {allTags.length === 0 ? (
        <div className="no-tags">
          <div className="no-tags-icon">🏷️</div>
          <h2>No Tags Found</h2>
          <p>
            No documents with tags were found. Add tags to your markdown frontmatter to see them here.
          </p>
          <div className="example-frontmatter">
            <h4>Example:</h4>
            <pre>{`---
title: "My Document"
tags: ["example", "guide", "documentation"]
---`}</pre>
          </div>
        </div>
      ) : (
        <div className="tags-grid">
          {allTags.map((tag, index) => (
            <div 
              key={`${tag.name}-${index}`}
              className="tag-card"
              onClick={() => handleTagClick(tag)}
            >
              <div className="tag-card-header">
                <h3 className="tag-name">{tag.name}</h3>
                <span className="tag-count-badge">{tag.count}</span>
              </div>
              
              <div className="tag-preview">
                {tag.files.slice(0, 3).map((file, fileIndex) => (
                  <div key={fileIndex} className="tag-preview-file">
                    <span className="preview-file-icon">📄</span>
                    <span className="preview-file-title">{file.title}</span>
                  </div>
                ))}
                {tag.count > 3 && (
                  <div className="tag-preview-more">
                    and {tag.count - 3} more...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsView;
