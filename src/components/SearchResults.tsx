import React from 'react';
import type { SearchResult } from '../types/search';
import './SearchResults.css';

interface SearchResultsProps {
  results: SearchResult[];
  selectedIndex: number;
  onResultSelect: (result: SearchResult) => void;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedIndex,
  onResultSelect,
  query
}) => {
  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-no-results">
          <div className="no-results-icon">🔍</div>
          <p>No results found for "{query}"</p>
          <small>Try a different search term</small>
        </div>
      </div>
    );
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
  };

  const getDisplayPath = (filePath: string): string => {
    return filePath
      .replace('/src/docs/', '')
      .replace(/\.(md|mdx)$/, '');
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
    <div className="search-results" role="listbox">
      {results.map((result, index) => (
        <div
          key={result.filePath}
          className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => handleResultClick(result)}
          role="option"
          aria-selected={index === selectedIndex}
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
  );
};

export default SearchResults;