import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { IconMenu, IconClose, IconSearch, IconGitHub } from './shared/Icons';
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
              className="btn-base btn-icon mobile-menu-toggle"
              onClick={onToggleSidePanel}
              aria-label="Toggle navigation menu"
            >
              {isSidePanelVisible ? <IconClose /> : <IconMenu />}
            </button>
            {siteConfig.github?.url && (
              <a
                href={siteConfig.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-icon btn-secondary github-link"
                aria-label="View on GitHub"
              >
                <IconGitHub />
              </a>
            )}
            <button 
              className="btn-base btn-icon btn-secondary search-button"
              onClick={handleSearchClick}
              aria-label="Open search"
            >
              <IconSearch />
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
