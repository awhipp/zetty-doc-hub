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
