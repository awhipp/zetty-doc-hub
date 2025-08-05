export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

export interface FileTreeProps {
  nodes: FileTreeNode[];
  onFileSelect?: (filePath: string) => void;
}

export interface FileTreeNodeProps {
  node: FileTreeNode;
  level: number;
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
}
