import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import MarkdownRenderer from './MarkdownRenderer';
import ImageRenderer from './ImageRenderer';
import ErrorRenderer from './ErrorRenderer';
import WelcomeRenderer from './WelcomeRenderer';
import ReadingProgress from './ReadingProgress';
import BackToTop from './BackToTop';
import CopyCodeButton from './CopyCodeButton';
import Breadcrumb from './Breadcrumb';
import { isMarkdownFile, isImageFile } from '../utils/fileUtils';
import './MainContent.css';

interface MainContentProps {
  selectedFile?: string;
  onFileSelect?: (filePath: string) => void;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  onTagClick?: (tagName: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ selectedFile, onFileSelect, contentRef, onTagClick }) => {
  const navigate = useNavigate();
  
  const handleSearchResultSelect = (filePath: string) => {
    if (onFileSelect) {
      onFileSelect(filePath);
    }
  };

  const handleBreadcrumbNavigate = (path: string) => {
    const url = path === '' ? '/' : `/${path}`;
    navigate({ to: url });
  };

  return (
    <div className="main-content">
      <ReadingProgress />
      <div className="main-content-body" ref={contentRef}>
        <Breadcrumb filePath={selectedFile} onNavigate={handleBreadcrumbNavigate} />
        {selectedFile ? (
          <div className="file-content">
            {isMarkdownFile(selectedFile) ? (
              <MarkdownRenderer filePath={selectedFile} onTagClick={onTagClick} />
            ) : isImageFile(selectedFile) ? (
              <ImageRenderer filePath={selectedFile} />
            ) : (
              <ErrorRenderer selectedFile={selectedFile} />
            )}
          </div>
        ) : (
          <WelcomeRenderer onNavigateToFile={handleSearchResultSelect} />
        )}
      </div>
      <CopyCodeButton />
      <BackToTop />
    </div>
  );
};

export default MainContent;
