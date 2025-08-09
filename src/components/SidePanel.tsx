import React, { useMemo, useState, useEffect } from 'react';
import FileTreeNode from './FileTreeNode';
import { buildFileTree } from '../utils/fileTree';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { IconChevronLeft } from './shared/Icons';
import { getAllTags } from '../utils/tagsUtils';
import { ContentLoading, ErrorState } from './shared';
import type { TagInfo } from '../types/tags';
import './SidePanel.css';

interface SidePanelProps {
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
  isMobileVisible?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  scrollToTag?: string;
}

type TabType = 'files' | 'tags';

const SidePanel: React.FC<SidePanelProps> = ({ 
  onFileSelect, 
  selectedFile, 
  isMobileVisible, 
  onMobileClose, 
  isCollapsed, 
  onToggleCollapse,
  activeTab: externalActiveTab,
  onTabChange,
  scrollToTag
}) => {
  // Memoize file tree building to prevent unnecessary re-renders
  const fileTree = useMemo(() => buildFileTree(), []);
  const siteConfig = useSiteConfig();
  
  // Tab state - use external control if provided, otherwise internal state
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('files');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  
  // Tags state
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // Handle tab changes
  const handleTabChange = (newTab: TabType) => {
    if (onTabChange) {
      onTabChange(newTab);
    } else {
      setInternalActiveTab(newTab);
    }
  };

  // Load tags when tags tab is first accessed
  useEffect(() => {
    if (activeTab === 'tags' && tags.length === 0 && !tagsLoading) {
      loadTags();
    }
  }, [activeTab, tags.length, tagsLoading]);

  // Scroll to specific tag when requested
  useEffect(() => {
    if (scrollToTag && activeTab === 'tags' && tags.length > 0) {
      const tagElement = document.querySelector(`[data-tag="${scrollToTag}"]`);
      if (tagElement) {
        // Scroll to the tag
        tagElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add flash animation class
        tagElement.classList.add('flash-highlight');
        
        // Remove the animation class after animation completes
        setTimeout(() => {
          tagElement.classList.remove('flash-highlight');
        }, 2000);
      }
    }
  }, [scrollToTag, activeTab, tags]);

  const loadTags = async () => {
    try {
      setTagsLoading(true);
      setTagsError(null);
      const allTags = await getAllTags({
        sortBy: 'alphabetical',
        sortOrder: 'asc'
      });
      setTags(allTags);
    } catch (error) {
      setTagsError('Failed to load tags');
      console.error('Error loading tags:', error);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleFileSelect = (filePath: string) => {
    if (onFileSelect) {
      onFileSelect(filePath);
    }
    // Auto-close on mobile when a file is selected
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const panelClasses = `side-panel ${isMobileVisible ? 'mobile-visible' : ''} ${isCollapsed ? 'collapsed' : ''}`;

  return (
    <div className={panelClasses}>
      <div className="side-panel-header">
        <h3>{siteConfig.navigation.sidebarTitle}</h3>
        {onToggleCollapse && (
          <button 
            className="btn-base btn-icon btn-secondary collapse-button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <IconChevronLeft />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="side-panel-tabs">
        <button
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => handleTabChange('files')}
        >
          <span className="tab-icon">📁</span>
          <span className="tab-text">Files</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => handleTabChange('tags')}
        >
          <span className="tab-icon">🏷️</span>
          <span className="tab-text">Tags</span>
        </button>
      </div>

      <div className="side-panel-content">
        {activeTab === 'files' && (
          <div className="side-panel-section">
            {fileTree.map((node, index) => (
              <FileTreeNode
                key={`${node.path}-${index}`}
                node={node}
                level={0}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            ))}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="side-panel-section">
            {tagsLoading && <ContentLoading />}
            {tagsError && <ErrorState message={tagsError} />}
            {!tagsLoading && !tagsError && tags.length === 0 && (
              <div className="no-tags-message">
                <p>No tags found.</p>
                <p>Add tags to your markdown files to see them here.</p>
              </div>
            )}
            {!tagsLoading && !tagsError && tags.length > 0 && (
              <div className="tags-glossary">
                {tags.map((tag) => (
                  <div key={tag.name} className="tag-group" data-tag={tag.name}>
                    <div className="tag-header">
                      <span className="tag-name">#{tag.name}</span>
                      <span className="tag-count">({tag.count})</span>
                    </div>
                    <div className="tag-files">
                      {tag.files.map((file, index) => (
                        <button
                          key={`${file.filePath}-${index}`}
                          className="tag-file-item"
                          onClick={() => handleFileSelect(file.filePath)}
                          title={file.description || file.title}
                        >
                          <span className="file-icon">📄</span>
                          <span className="file-title">{file.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SidePanel);
