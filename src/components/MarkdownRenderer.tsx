import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { loadMarkdownContent } from '../utils/markdownLoader';
import { getTemplate } from './templates';
import type { ParsedMarkdown } from '../types/template';
import MdxRenderer from './MdxRenderer';
import TemplateWrapper from './TemplateWrapper';
import DocumentStats from './DocumentStats';
import { isMdxFile, isMarkdownFile } from '../utils/fileUtils';
import { createCustomComponents, ContentLoading, ErrorState } from './shared';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  filePath: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ filePath }) => {
  const [parsedMarkdown, setParsedMarkdown] = useState<ParsedMarkdown>({ content: '', frontMatter: {} });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this is an MDX file
  const isMdxFileType = isMdxFile(filePath);

  useEffect(() => {
    // If it's an MDX file, don't load content here
    if (isMdxFileType) {
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!isMarkdownFile(filePath)) {
          setError('This file type is not supported for rendering.');
          return;
        }

        const parsed = await loadMarkdownContent(filePath);
        setParsedMarkdown(parsed);
      } catch (err) {
        setError('Failed to load the file content.');
        console.error('Error loading markdown:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [filePath, isMdxFileType]);

  // If it's an MDX file, use the MdxRenderer
  if (isMdxFileType) {
    return <MdxRenderer filePath={filePath} />;
  }

  // Custom link component to handle internal navigation
  const customComponents = createCustomComponents({ filePath });

  if (loading) {
    return (
      <div className="markdown-renderer">
        <ContentLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="markdown-renderer">
        <ErrorState message={error} />
      </div>
    );
  }

  // Get the appropriate template based on front matter
  const TemplateComponent = getTemplate(parsedMarkdown.frontMatter.template);

  const markdownContent = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={customComponents}
    >
      {parsedMarkdown.content}
    </ReactMarkdown>
  );

  return (
    <div className="markdown-content-wrapper">
      <DocumentStats content={parsedMarkdown.content} />
      <TemplateWrapper
        TemplateComponent={TemplateComponent}
        templateProps={{
          content: markdownContent,
          frontMatter: parsedMarkdown.frontMatter,
          filePath: filePath
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;
