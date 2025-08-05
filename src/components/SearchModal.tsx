import React, { useState, useRef, useEffect } from 'react';
import { searchDocumentation } from '../utils/searchUtils';
import type { SearchResult } from '../types/search';
import { EXTENSIONS_PATTERN } from '../utils/constants';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (filePath: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onResultSelect 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  // Handle search with debouncing
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchDocumentation(searchQuery, {
        maxResults: 10,
        minScore: 0.1
      });
      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      handleSearch(query);
    }, 200);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleResultSelect(results[0]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result.filePath);
    }
    onClose();
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This will be handled by the parent component
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleKeyboardShortcut);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyboardShortcut);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDisplayPath = (filePath: string): string => {
    return filePath
      .replace('/src/docs/', '')
      .replace(EXTENSIONS_PATTERN, '');
  };

  const getMatchTypeIcon = (matchType: SearchResult['matchType']): string => {
    switch (matchType) {
      case 'title':
        return '📄';
      case 'heading':
        return '📑';
      case 'content':
        return '📝';
      default:
        return '📄';
    }
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const searchTerm = query.toLowerCase();
    const lowerText = text.toLowerCase();
    const startIndex = lowerText.indexOf(searchTerm);
    
    if (startIndex === -1) return text;
    
    const beforeMatch = text.slice(0, startIndex);
    const match = text.slice(startIndex, startIndex + query.length);
    const afterMatch = text.slice(startIndex + query.length);
    
    return (
      <>
        {beforeMatch}
        <mark className="search-highlight">{match}</mark>
        {afterMatch}
      </>
    );
  };

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        <div className="search-modal-header">
          <div className="search-input-container">
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search documentation..."
              className="search-input"
              aria-label="Search documentation"
            />
            {isLoading && (
              <div className="search-spinner">
                <div className="spinner" />
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="Close search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18"/>
              <path d="M6 6L18 18"/>
            </svg>
          </button>
        </div>

        <div className="search-modal-content">
          {query && results.length === 0 && !isLoading && (
            <div className="search-no-results">
              <div className="no-results-icon">🔍</div>
              <p>No results found for "{query}"</p>
              <small>Try a different search term</small>
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results-list">
              {results.map((result, index) => (
                <div
                  key={result.filePath}
                  className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="search-result-header">
                    <div className="search-result-icon">
                      {getMatchTypeIcon(result.matchType)}
                    </div>
                    <div className="search-result-title">
                      {highlightText(result.title, query)}
                    </div>
                    <div className="search-result-score">
                      {result.score > 5 ? '★★★' : result.score > 2 ? '★★' : '★'}
                    </div>
                  </div>
                  <div className="search-result-path">
                    {getDisplayPath(result.filePath)}
                  </div>
                  {result.excerpt && result.excerpt !== result.title && (
                    <div className="search-result-excerpt">
                      {highlightText(result.excerpt, query)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!query && (
            <div className="search-modal-tips">
              <h3>Search Tips</h3>
              <ul>
                <li>Search for specific terms or phrases</li>
                <li>Use keywords from documentation titles</li>
                <li>Try "How to" or "Getting started" queries</li>
                <li>Use ↑↓ arrows to navigate, Enter to select</li>
              </ul>
            </div>
          )}
        </div>

        <div className="search-modal-footer">
          <div className="keyboard-shortcuts">
            <span className="shortcut">
              <kbd>↑</kbd><kbd>↓</kbd> Navigate
            </span>
            <span className="shortcut">
              <kbd>Enter</kbd> Open
            </span>
            <span className="shortcut">
              <kbd>Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
