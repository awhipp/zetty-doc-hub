import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { fetchDocFile, parseFrontMatter } from '@/api/docsApi';
import DocumentStats from './DocumentStats';
import DocumentTags from './DocumentTags';
import Breadcrumb from './Breadcrumb';
import CopyCodeButton from './CopyCodeButton';
import TableOfContents from './TableOfContents';
import RelatedContent from './RelatedContent';
import TemplateWrapper from './TemplateWrapper';
import './MarkdownRenderer.css';

const MermaidDiagram = lazy(() => import('./Mermaid'));

interface MarkdownRendererProps {
  filePath: string;
  onNavigate: (path: string) => void;
}

export default function MarkdownRenderer({ filePath, onNavigate }: MarkdownRendererProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDocFile(filePath)
      .then(raw => {
        if (!cancelled) {
          setContent(raw);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [filePath]);

  const { content: markdownBody, frontMatter } = useMemo(() => {
    const parsed = parseFrontMatter(content);
    // Strip leading h1 when frontmatter title exists to avoid duplicate headings
    if (parsed.frontMatter.title) {
      parsed.content = parsed.content.replace(/^\s*#\s+.+\n?/, '');
    }
    return parsed;
  }, [content]);

  const handleLinkClick = useCallback(
    (href: string) => {
      if (href.startsWith('http') || href.startsWith('mailto:')) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
      // Resolve relative links
      const dir = filePath.split('/').slice(0, -1).join('/');
      let resolved = href;
      if (href.startsWith('./') || href.startsWith('../') || !href.startsWith('/')) {
        const parts = [...dir.split('/'), ...href.split('/')];
        const stack: string[] = [];
        for (const p of parts) {
          if (p === '.' || p === '') continue;
          if (p === '..') stack.pop();
          else stack.push(p);
        }
        resolved = stack.join('/');
      }
      onNavigate(resolved);
    },
    [filePath, onNavigate],
  );

  // Custom components for react-markdown
  const components = useMemo(
    () => ({
      a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
        if (!href) return <a {...props}>{children}</a>;
        if (href.startsWith('http') || href.startsWith('mailto:')) {
          return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
        }
        return (
          <a
            href={href}
            onClick={(e) => { e.preventDefault(); handleLinkClick(href); }}
            {...props}
          >
            {children}
          </a>
        );
      },
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
        if (!src) return <img alt={alt} {...props} />;
        // Resolve relative image paths
        let resolvedSrc = src;
        if (!src.startsWith('http') && !src.startsWith('/')) {
          const dir = filePath.split('/').slice(0, -1).join('/');
          resolvedSrc = `/docs/${dir}/${src}`.replace(/\/+/g, '/');
        } else if (!src.startsWith('http')) {
          resolvedSrc = `/docs${src}`;
        }
        return <img src={resolvedSrc} alt={alt} loading="lazy" {...props} />;
      },
      code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
        const match = /language-(\w+)/.exec(className || '');
        const lang = match?.[1];

        if (lang === 'mermaid') {
          return (
            <Suspense fallback={<div className="mermaid-loading">Loading diagram…</div>}>
              <MermaidDiagram chart={String(children).trim()} />
            </Suspense>
          );
        }

        // Block code
        if (className) {
          return <code className={className} {...props}>{children}</code>;
        }

        // Inline code
        return <code {...props}>{children}</code>;
      },
      pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
        <div className="code-block-wrapper">
          <CopyCodeButton />
          <pre {...props}>{children}</pre>
        </div>
      ),
      table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="table-wrapper">
          <table {...props}>{children}</table>
        </div>
      ),
    }),
    [filePath, handleLinkClick],
  );

  if (loading) {
    return <div className="markdown-loading">Loading document…</div>;
  }

  if (error) {
    return (
      <div className="markdown-error">
        <h2>Error Loading Document</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="doc-layout">
      <article className="markdown-content">
        <Breadcrumb filePath={filePath} onNavigate={onNavigate} />
        <DocumentTags tags={frontMatter.tags as string[] | undefined} />
        <DocumentStats content={markdownBody} />

        <TemplateWrapper frontMatter={frontMatter}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { ignoreMissing: true, detect: true }]]}
            components={components}
          >
            {markdownBody}
          </ReactMarkdown>
        </TemplateWrapper>
      </article>

      <aside className="doc-sidebar">
        <TableOfContents maxLevel={2} />
        <RelatedContent filePath={filePath} onNavigate={onNavigate} />
      </aside>
    </div>
  );
}
