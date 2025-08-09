export interface Backlink {
  /** The file that contains the link pointing to the target */
  sourceFile: string;
  /** Title of the source file */
  sourceTitle: string;
  /** Description of the source file */
  sourceDescription?: string;
  /** The text content of the link */
  linkText: string;
  /** The URL/path that was linked to */
  linkUrl: string;
  /** Context around the link (for preview) */
  context?: string;
  /** Number of times this source file references the target */
  referenceCount: number;
}

export interface BacklinksIndex {
  /** Maps file paths to arrays of backlinks pointing to that file */
  [targetFile: string]: Backlink[];
}

export interface RelatedContentData {
  /** Files that share tags with the current file */
  byTags: {
    tag: string;
    files: Array<{
      filePath: string;
      title: string;
      description?: string;
      sharedTags: string[];
    }>;
  }[];
  /** Files that link to the current file */
  backlinks: Backlink[];
  /** Files that the current file links to */
  outgoingLinks: Array<{
    filePath: string;
    title: string;
    description?: string;
    linkText: string;
  }>;
}

export interface LinkReference {
  /** The target file path */
  targetFile: string;
  /** The text of the link */
  linkText: string;
  /** The original URL from the markdown */
  originalUrl: string;
  /** Context around the link */
  context: string;
}
