import React from 'react';
import './Breadcrumb.css';

import { EXTENSIONS_PATTERN } from '../utils/constants';

interface BreadcrumbProps {
  filePath?: string;
  onNavigate?: (path: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ filePath, onNavigate }) => {
  // Convert file path to breadcrumb segments
  const pathSegments = filePath
    ? filePath
        .replace('/src/docs/', '')
        .replace(EXTENSIONS_PATTERN, '')
        .split('/')
        .filter(segment => segment.length > 0)
    : [];

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          {pathSegments.length === 0 ? (
            <span className="breadcrumb-current" aria-current="page">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Home
            </span>
          ) : (
            <button 
              className="breadcrumb-item breadcrumb-home"
              onClick={() => onNavigate && onNavigate('')}
              aria-label="Go to home"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Home
            </button>
          )}
        </li>
        {pathSegments.map((segment, index) => (
          <li key={index} className="breadcrumb-item">
            <svg className="breadcrumb-separator" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
            {index === pathSegments.length - 1 ? (
              <span className="breadcrumb-current" aria-current="page">
                {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
              </span>
            ) : (
              <button 
                className="breadcrumb-item"
              >
                {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;