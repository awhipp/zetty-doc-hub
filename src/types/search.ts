export interface SearchResult {
  filePath: string;
  title: string;
  excerpt: string;
  score: number;
  matchType: 'title' | 'content' | 'heading';
}

export interface SearchIndex {
  filePath: string;
  title: string;
  content: string;
  headings: string[];
}

export interface SearchOptions {
  maxResults?: number;
  minScore?: number;
  includeContent?: boolean;
}