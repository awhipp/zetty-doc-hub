import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';
import { useSiteConfig } from '../hooks/useSiteConfig';
import './Header.css';

interface HeaderProps {
  onToggleSidePanel?: () => void;
  isSidePanelVisible?: boolean;
  onSearchResultSelect?: (filePath: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidePanel, isSidePanelVisible, onSearchResultSelect }) => {
  const navigate = useNavigate();
  const siteConfig = useSiteConfig();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
  };

  // No keyboard shortcuts - removed Ctrl+K functionality

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1 className="header-title" onClick={handleTitleClick}>
            {siteConfig.site.title}
          </h1>
          <div className="header-controls">
            <button 
              className="mobile-menu-toggle"
              onClick={onToggleSidePanel}
              aria-label="Toggle navigation menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isSidePanelVisible ? (
                  // X icon when menu is visible
                  <>
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                ) : (
                  // Hamburger icon when menu is hidden
                  <>
                    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                )}
              </svg>
            </button>
            <button 
              className="search-button"
              onClick={handleSearchClick}
              aria-label="Open search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
        onResultSelect={onSearchResultSelect}
      />
    </>
  );
};

export default Header;
