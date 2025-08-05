import React from 'react';
import './ErrorRenderer.css';

interface ErrorRendererProps {
  selectedFile: string;
}

const ErrorRenderer: React.FC<ErrorRendererProps> = ({ selectedFile }) => {
  return (
    <div className="error-renderer">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3>Unsupported File Type</h3>
        <p>Selected file: <code>{selectedFile}</code></p>
        <p className="error-description">
          This file type is not supported for display. Only .md, .mdx, and image files (.svg, .png, .jpg, .gif, .webp) can be rendered.
        </p>
        
        <div className="supported-features">
          <h4>Supported features for documentation files:</h4>
          <ul className="feature-list">
            <li>Rich markdown formatting with syntax highlighting</li>
            <li>Interactive MDX components</li>
            <li>Image viewing with metadata display</li>
            <li>Automatic table of contents generation</li>
            <li>Mermaid diagrams and flowcharts</li>
            <li>Multiple document templates (general, effort tracking)</li>
            <li>Smart search and Q&A assistance</li>
            <li>Reading progress indicator</li>
            <li>Copy code buttons</li>
            <li>Document statistics</li>
            <li>Back to top button</li>
            <li>Breadcrumb navigation</li>
          </ul>
        </div>
        
        <div className="error-suggestions">
          <h4>💡 Suggestions:</h4>
          <ul>
            <li>Try renaming the file with a supported extension (.md, .mdx)</li>
            <li>Convert the content to Markdown format</li>
            <li>If it's an image, ensure it's in a supported format</li>
            <li>Check the file tree for other available documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorRenderer;
