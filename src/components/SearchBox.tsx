import React, { useRef, useEffect, useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import SearchResults from './SearchResults';
import type { SearchResult } from '../types/search';
import './SearchBox.css';

interface SearchBoxProps {
  onResultSelect?: (filePath: string) => void;
  placeholder?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  onResultSelect, 
  placeholder = "Search documentation..." 
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    query,
    setQuery,
    results,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    clearSearch,
    navigateResults
  } = useSearch({
    maxResults: 8,
    minScore: 0.1,
    autoSearch: true
  });

  // Update isOpen based on results
  useEffect(() => {
    setIsOpen(results.length > 0 && query.trim() !== '');
  }, [results, query]);

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result.filePath);
    }
    clearSearch();
    setIsOpen(false);
    searchInputRef.current?.blur();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        navigateResults(e.key === 'ArrowDown' ? 'down' : 'up');
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSelectedIndex]);

  // Handle input focus
  const handleFocus = () => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="search-box" ref={searchBoxRef}>
      <div className="search-input-container">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search documentation"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        <div className="search-icon">
          {isLoading ? (
            <div className="search-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          )}
        </div>
      </div>
      
      {isOpen && (
        <SearchResults
          results={results}
          selectedIndex={selectedIndex}
          onResultSelect={handleResultSelect}
          query={query}
        />
      )}
    </div>
  );
};

export default SearchBox;