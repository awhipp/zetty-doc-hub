import React, { useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { loadMdxComponent, loadMdxFrontMatter, loadMdxRawContent } from '../utils/markdownLoader';
import { getTemplate } from './templates';
import type { FrontMatter } from '../types/template';
import TemplateWrapper from './TemplateWrapper';
import DocumentStats from './DocumentStats';
import { createCustomComponents, ContentLoading, ErrorState } from './shared';
import './MarkdownRenderer.css';

interface MdxRendererProps {
  filePath: string;
}

const MdxRenderer: React.FC<MdxRendererProps> = ({ filePath }) => {
  const [MdxComponent, setMdxComponent] = useState<React.ComponentType | null>(null);
  const [frontMatter, setFrontMatter] = useState<FrontMatter>({});
  const [rawContent, setRawContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMdxContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [Component, frontMatterData, rawMdxContent] = await Promise.all([
          loadMdxComponent(filePath),
          loadMdxFrontMatter(),
          loadMdxRawContent(filePath)
        ]);
        setMdxComponent(() => Component);
        setFrontMatter(frontMatterData);
        setRawContent(rawMdxContent);
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
  const mdxComponents = createCustomComponents({ filePath });

  if (loading) {
    return <ContentLoading />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!MdxComponent) {
    return <ErrorState message="No MDX component could be loaded." />;
  }

  // Get the appropriate template based on front matter
  const TemplateComponent = getTemplate(frontMatter.template);

  const mdxContent = (
    <MDXProvider components={mdxComponents}>
      <MdxComponent />
    </MDXProvider>
  );

  return (
    <div className="mdx-content-wrapper">
      <DocumentStats content={rawContent} />
      <TemplateWrapper
        TemplateComponent={TemplateComponent}
        templateProps={{
          content: mdxContent,
          frontMatter: frontMatter,
          filePath: filePath
        }}
      />
    </div>
  );
};

export default MdxRenderer;