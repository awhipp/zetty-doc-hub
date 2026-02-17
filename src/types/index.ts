// Types for the docs API - shared between MSW handlers and real API
export interface DocsManifest {
  files: string[];
  contents: Record<string, string>;
  generatedAt: string;
}

export interface FrontMatter {
  title?: string;
  description?: string;
  tags?: string[];
  author?: string;
  date?: string;
  template?: string;
  status?: string;
  priority?: string;
  assignees?: string[];
  startDate?: string;
  endDate?: string;
  links?: Array<{ label: string; url: string }>;
  [key: string]: unknown;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

export interface SearchResult {
  filePath: string;
  title: string;
  excerpt: string;
  score: number;
  matchType: 'title' | 'heading' | 'content';
}

export interface QAAnswer {
  id: string;
  questionId: string;
  text: string;
  sources: QASource[];
  confidence: number;
  timestamp: Date;
}

export interface QASource {
  filePath: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
}

export interface TagInfo {
  name: string;
  count: number;
  files: Array<{ filePath: string; title: string }>;
}

export interface Backlink {
  sourceFile: string;
  sourceTitle: string;
  sourceDescription?: string;
  linkText: string;
  context?: string;
  referenceCount: number;
}

export interface RelatedContentData {
  backlinks: Backlink[];
  outgoingLinks: Array<{ filePath: string; title: string; linkText: string }>;
  byTags: Array<{
    sharedTags: string[];
    files: Array<{ filePath: string; title: string }>;
  }>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'tag' | 'image';
  filePath?: string;
  tagName?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'link' | 'tag';
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SiteConfig {
  site: {
    title: string;
    description: string;
    author: string;
  };
  navigation: {
    sidebarTitle: string;
    hiddenDirectories: string[];
    maxTocLevel: number;
  };
  branding: {
    favicon: string;
  };
  footer: {
    text: string;
  };
  deployment: {
    basePath: string;
  };
  github: {
    url: string;
  };
  qa: {
    placeholder: string;
    commonQuestions: string[];
  };
  build: {
    time: string;
  };
  graph: {
    colors: {
      document: string;
      tag: string;
      current: string;
      image: string;
    };
  };
}
