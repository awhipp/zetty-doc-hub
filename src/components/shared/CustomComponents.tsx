import React from 'react';
import LinkComponent from '../LinkComponent';
import ImageComponent from '../ImageComponent';

interface CustomComponentsOptions {
  filePath?: string;
}

/**
 * Shared MDX/Markdown component mappings
 * Eliminates duplication between MarkdownRenderer and MdxRenderer
 * 
 * @param options - Configuration options for components
 * @returns Component mappings object
 */
export const createCustomComponents = (options: CustomComponentsOptions = {}) => {
  const { filePath } = options;

  return {
    // Headings with consistent styling
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="markdown-h1" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="markdown-h2" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="markdown-h3" {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className="markdown-h4" {...props}>{children}</h4>
    ),
    h5: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h5 className="markdown-h5" {...props}>{children}</h5>
    ),
    h6: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h6 className="markdown-h6" {...props}>{children}</h6>
    ),

    // Links with internal navigation support
    a: LinkComponent,

    // Images with lazy loading and error handling
    img: ({ src, alt, title, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <ImageComponent 
        src={src || ''} 
        alt={alt} 
        title={title}
        currentDocPath={filePath}
        {...props}
      />
    ),

    // Tables with responsive wrapper
    table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="markdown-table-container">
        <table className="markdown-table" {...props}>{children}</table>
      </div>
    ),

    // Blockquotes with consistent styling
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>
    ),

    // Code blocks (pre is handled by rehype-highlight for syntax highlighting)
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre className="markdown-pre" {...props}>{children}</pre>
    ),

    // Inline code
    code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code className="markdown-code" {...props}>{children}</code>
    ),

    // Lists
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="markdown-ul" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="markdown-ol" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="markdown-li" {...props}>{children}</li>
    ),

    // Paragraphs
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="markdown-p" {...props}>{children}</p>
    ),

    // Horizontal rules
    hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="markdown-hr" {...props} />
    ),

    // Emphasis
    strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong className="markdown-strong" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <em className="markdown-em" {...props}>{children}</em>
    ),
  };
};
