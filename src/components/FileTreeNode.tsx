import React, { useState } from 'react';
import type { FileTreeNodeProps } from '../types/fileTree';
import { UI } from '../utils/constants';
import { getFileExtension, isImageFile, isMdxFile } from '../utils/fileUtils';
import './FileTreeNode.css';

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, level, onFileSelect, selectedFile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if this node or any of its children are selected
  const isSelected = node.type === 'file' && selectedFile === node.path;
  const hasSelectedChild = node.type === 'folder' && selectedFile?.startsWith(node.path + '/');

  // Auto-expand if this folder contains the selected file
  React.useEffect(() => {
    if (hasSelectedChild && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasSelectedChild, isExpanded]);

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      // Pass full path for file loading, but router will use relative
      onFileSelect?.(node.path);
    }
  };

  const getIcon = () => {
    if (node.type === 'folder') {
      return isExpanded ? '📂' : '📁';
    }
    
    // File icons based on type
    if (isImageFile(node.path)) {
      const ext = getFileExtension(node.path);
      switch (ext) {
        case 'svg':
          return '🎨';
        case 'png':
        case 'jpg':
        case 'jpeg':
          return '🖼️';
        case 'gif':
          return '🎬';
        case 'webp':
          return '🖼️';
        default:
          return '🖼️';
      }
    }
    
    if (isMdxFile(node.path)) {
      return '📝';
    }
    
    return '📄';
  };

  return (
    <div className="file-tree-node">
      <div 
        className={`node-item ${node.type} ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * UI.TREE_NODE_INDENT}px` }}
        onClick={handleToggle}
      >
        <span className="node-icon">{getIcon()}</span>
        <span className="node-name">{node.name}</span>
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div className="node-children">
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.path}-${index}`}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(FileTreeNode);
