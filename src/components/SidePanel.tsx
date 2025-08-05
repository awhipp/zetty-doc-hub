import React, { useMemo } from 'react';
import FileTreeNode from './FileTreeNode';
import { buildFileTree } from '../utils/fileTree';
import { useSiteConfig } from '../hooks/useSiteConfig';
import './SidePanel.css';

interface SidePanelProps {
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
  isMobileVisible?: boolean;
  onMobileClose?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ onFileSelect, selectedFile, isMobileVisible, onMobileClose }) => {
  // Memoize file tree building to prevent unnecessary re-renders
  const fileTree = useMemo(() => buildFileTree(), []);
  const siteConfig = useSiteConfig();

  const handleFileSelect = (filePath: string) => {
    if (onFileSelect) {
      onFileSelect(filePath);
    }
    // Auto-close on mobile when a file is selected
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const panelClasses = `side-panel ${isMobileVisible ? 'mobile-visible' : ''}`;

  return (
    <div className={panelClasses}>
      <div className="side-panel-header">
        <h3>{siteConfig.navigation.sidebarTitle}</h3>
      </div>
      <div className="side-panel-content">
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
    </div>
  );
};

export default React.memo(SidePanel);
