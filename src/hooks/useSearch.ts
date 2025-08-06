import { useState, useEffect, useCallback, useRef } from 'react';
import { searchDocumentation } from '../utils/searchUtils';
import type { SearchResult } from '../types/search';
import { useDebounce } from './useDebounce';

interface UseSearchOptions {
  maxResults?: number;
  minScore?: number;
  debounceDelay?: number;
  autoSearch?: boolean;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleSearch: (searchQuery?: string) => Promise<void>;
  clearSearch: () => void;
  navigateResults: (direction: 'up' | 'down') => void;
}

/**
 * Custom hook for search functionality
 * Consolidates search logic used across SearchModal and SearchBox components
 * 
 * @param options - Configuration options for search behavior
 * @returns Search state and handlers
 */
export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    maxResults = 10,
    minScore = 0.1,
    debounceDelay = 300,
    autoSearch = true
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchAbortController = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    // Cancel previous search if still running
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    // Create new abort controller for this search
    searchAbortController.current = new AbortController();

    setIsLoading(true);
    try {
      const searchResults = await searchDocumentation(searchQuery, {
        maxResults,
        minScore
      });
      
      // Only update results if search wasn't aborted
      if (!searchAbortController.current.signal.aborted) {
        setResults(searchResults);
        setSelectedIndex(-1);
      }
    } catch (error) {
      if (!searchAbortController.current?.signal.aborted) {
        console.error('Search failed:', error);
        setResults([]);
        setSelectedIndex(-1);
      }
    } finally {
      if (!searchAbortController.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [maxResults, minScore]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    performSearch,
    debounceDelay
  );

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery ?? query;
    await performSearch(queryToSearch);
  }, [query, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    setIsLoading(false);
    
    // Cancel any ongoing search
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
  }, []);

  const navigateResults = useCallback((direction: 'up' | 'down') => {
    if (results.length === 0) return;

    setSelectedIndex(prevIndex => {
      if (direction === 'down') {
        return prevIndex < results.length - 1 ? prevIndex + 1 : 0;
      } else {
        return prevIndex > 0 ? prevIndex - 1 : results.length - 1;
      }
    });
  }, [results.length]);

  // Auto-search when query changes (if enabled)
  useEffect(() => {
    if (autoSearch) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, autoSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    handleSearch,
    clearSearch,
    navigateResults
  };
};
