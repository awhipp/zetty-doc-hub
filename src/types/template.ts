import type { ReactNode } from 'react';

export interface FrontMatter {
  title?: string;
  description?: string;
  template?: string;
  author?: string;
  date?: string;
  tags?: string[];
  toc?: boolean;
  
  // Effort-specific fields
  effortName?: string;
  assignees?: string[] | string;
  startDate?: string;
  endDate?: string;
  status?: string;
  links?: Record<string, string>;
  
  // Allow custom properties with specific types
  [key: string]: string | string[] | boolean | number | Record<string, string> | undefined;
}

export interface TemplateProps {
  content: ReactNode;
  frontMatter: FrontMatter;
  filePath: string;
}

export interface ParsedMarkdown {
  content: string;
  frontMatter: FrontMatter;
}

export type TemplateComponent = React.FC<TemplateProps>;

export interface TemplateRegistry {
  [templateName: string]: TemplateComponent;
}