export interface TagInfo {
  name: string;
  count: number;
  files: TaggedFile[];
}

export interface TaggedFile {
  filePath: string;
  title: string;
  description?: string;
  author?: string;
  date?: string;
  template?: string;
}

export interface TagsIndex {
  [tagName: string]: TagInfo;
}

export interface TagsOptions {
  sortBy?: 'alphabetical' | 'frequency';
  sortOrder?: 'asc' | 'desc';
  minCount?: number;
}
