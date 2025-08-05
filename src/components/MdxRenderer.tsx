import React, { useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { loadMdxComponent, loadMdxFrontMatter } from '../utils/markdownLoader';
import { getTemplate } from './templates';
import type { FrontMatter } from '../types/template';
import LinkComponent from './LinkComponent';
import ImageComponent from './ImageComponent';
import TemplateWrapper from './TemplateWrapper';
import './MarkdownRenderer.css';

interface MdxRendererProps {
  filePath: string;
}

const MdxRenderer: React.FC<MdxRendererProps> = ({ filePath }) => {
  const [MdxComponent, setMdxComponent] = useState<React.ComponentType | null>(null);
  const [frontMatter, setFrontMatter] = useState<FrontMatter>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMdxContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [Component, frontMatterData] = await Promise.all([
          loadMdxComponent(filePath),
          loadMdxFrontMatter()
        ]);
        setMdxComponent(() => Component);
        setFrontMatter(frontMatterData);
      } catch (err) {
        console.error('Error loading MDX file:', err);
        setError('Failed to load the MDX file content.');
      } finally {
        setLoading(false);
      }
    };

    loadMdxContent();
  }, [filePath]);

  // MDX components mapping for consistent styling and functionality
  const mdxComponents = {
    // Custom components for better styling (matching MarkdownRenderer)
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="markdown-h1" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="markdown-h2" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="markdown-h3" {...props}>{children}</h3>
    ),
    a: LinkComponent, // Use the shared LinkComponent for consistent internal navigation
    img: ({ src, alt, title, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <ImageComponent 
        src={src || ''} 
        alt={alt} 
        title={title}
        currentDocPath={filePath}
        {...props}
      />
    ),
    table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="markdown-table-container">
        <table className="markdown-table" {...props}>{children}</table>
      </div>
    ),
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>
    ),
  };

  if (loading) {
    return (
      <div className="markdown-renderer">
        <div className="markdown-loading">
          <div className="loading-spinner"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="markdown-renderer">
        <div className="markdown-error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!MdxComponent) {
    return (
      <div className="markdown-renderer">
        <div className="markdown-error">
          <h3>Error</h3>
          <p>No MDX component could be loaded.</p>
        </div>
      </div>
    );
  }

  // Get the appropriate template based on front matter
  const TemplateComponent = getTemplate(frontMatter.template);

  const mdxContent = (
    <MDXProvider components={mdxComponents}>
      <MdxComponent />
    </MDXProvider>
  );

  return (
    <TemplateWrapper
      TemplateComponent={TemplateComponent}
      templateProps={{
        content: mdxContent,
        frontMatter: frontMatter,
        filePath: filePath
      }}
    />
  );
};

export default MdxRenderer;