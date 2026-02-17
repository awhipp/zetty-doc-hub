import { useState, useEffect, useMemo } from 'react';
import { fetchFileTree } from '@/api/docsApi';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { humanize, getFileIcon } from '@/utils/display';
import type { FileTreeNode } from '@/types';
import Breadcrumb from './Breadcrumb';
import './FolderView.css';

interface FolderViewProps {
  folderPath: string;
  onNavigate: (path: string) => void;
}

export default function FolderView({ folderPath, onNavigate }: FolderViewProps) {
  const config = useSiteConfig();
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFileTree(config.navigation.hiddenDirectories)
      .then(data => { if (!cancelled) { setTree(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [config.navigation.hiddenDirectories]);

  // Find the folder node matching the path
  const folderContents = useMemo(() => {
    const parts = folderPath.split('/').filter(Boolean);

    let nodes = tree;
    for (const part of parts) {
      const folder = nodes.find(n => n.name === part && n.type === 'folder');
      if (!folder || !folder.children) return null;
      nodes = folder.children;
    }
    return nodes;
  }, [tree, folderPath]);

  const folderName = folderPath.split('/').filter(Boolean).pop() || 'Root';
  const displayName = humanize(folderName);

  if (loading) {
    return <div className="folder-view-loading">Loading…</div>;
  }

  return (
    <div className="folder-view">
      <Breadcrumb filePath={folderPath} onNavigate={onNavigate} />

      <div className="folder-view-header">
        <span className="folder-view-icon">📂</span>
        <h1>{displayName}</h1>
      </div>

      {folderContents && folderContents.length > 0 ? (
        <div className="folder-view-grid">
          {folderContents.map(node => (
            <button
              key={node.path}
              className="folder-view-item"
              onClick={() => onNavigate(node.path)}
            >
              <span className="folder-view-item-icon">{getFileIcon(node.name, node.type)}</span>
              <span className="folder-view-item-name">
                {humanize(node.name)}
              </span>
              {node.type === 'folder' && node.children && (
                <span className="folder-view-item-count">
                  {node.children.length} item{node.children.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="folder-view-empty">
          <p>This folder is empty or doesn't exist.</p>
          <button className="folder-view-back" onClick={() => onNavigate('')}>
            ← Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
