import { useState, useEffect, useCallback, memo } from 'react';
import { fetchFileTree } from '@/api/docsApi';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { getFileIcon } from '@/utils/display';
import type { FileTreeNode as FTNode } from '@/types';
import './SidePanel.css';

interface SidePanelProps {
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Memoized tree node component
const FileTreeNodeItem = memo(function FileTreeNodeItem({
  node,
  depth,
  selectedFile,
  onFileSelect,
}: {
  node: FTNode;
  depth: number;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = node.type === 'file' && node.path === selectedFile;

  // Auto-expand folders containing the selected file
  useEffect(() => {
    if (selectedFile && node.type === 'folder' && selectedFile.startsWith(node.path + '/')) {
      setExpanded(true);
    }
  }, [selectedFile, node.path, node.type]);

  const handleClick = () => {
    if (node.type === 'folder') {
      setExpanded(!expanded);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <button
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={handleClick}
        title={node.path}
      >
        <span className="tree-icon">{getFileIcon(node.name, node.type, expanded)}</span>
        <span className="tree-name">{node.name}</span>
      </button>
      {expanded && node.children?.map(child => (
        <FileTreeNodeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
});

export default function SidePanel({ selectedFile, onFileSelect, isOpen, onClose }: SidePanelProps) {
  const config = useSiteConfig();
  const [tree, setTree] = useState<FTNode[]>([]);
  const [activeTab, setActiveTab] = useState<'files' | 'tags'>('files');
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);

  const loadTree = useCallback(async () => {
    try {
      const data = await fetchFileTree(config.navigation.hiddenDirectories);
      setTree(data);
    } catch (e) {
      console.error('Failed to load file tree:', e);
    }
  }, [config.navigation.hiddenDirectories]);

  useEffect(() => { loadTree(); }, [loadTree]);

  const loadTags = useCallback(async () => {
    if (tags.length > 0) return;
    try {
      const { fetchTags } = await import('@/api/docsApi');
      const data = await fetchTags();
      setTags(data.map(t => ({ name: t.name, count: t.count })));
    } catch (e) {
      console.error('Failed to load tags:', e);
    }
  }, [tags.length]);

  useEffect(() => {
    if (activeTab === 'tags') loadTags();
  }, [activeTab, loadTags]);

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-tabs">
            <button
              className={`tab ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              📁 Files
            </button>
            <button
              className={`tab ${activeTab === 'tags' ? 'active' : ''}`}
              onClick={() => setActiveTab('tags')}
            >
              🏷️ Tags
            </button>
          </div>
        </div>

        <div className="sidebar-content">
          {activeTab === 'files' ? (
            <nav className="file-tree" aria-label="File explorer">
              {tree.map(node => (
                <FileTreeNodeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedFile={selectedFile}
                  onFileSelect={(path) => { onFileSelect(path); onClose(); }}
                />
              ))}
              {tree.length === 0 && (
                <p className="empty-state">No documents found. Add .md files to /docs/</p>
              )}
            </nav>
          ) : (
            <div className="tags-list">
              {tags.map(tag => (
                <button key={tag.name} className="tag-pill" title={`${tag.count} documents`}>
                  {tag.name} <span className="tag-count">{tag.count}</span>
                </button>
              ))}
              {tags.length === 0 && (
                <p className="empty-state">No tags found. Add tags to your frontmatter.</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
