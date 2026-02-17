import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSearchResults } from '@/api/docsApi';
import { getStars } from '@/utils/display';
import type { SearchResult } from '@/types';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export default function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetchSearchResults(query, 10);
        setResults(r);
        setSelectedIdx(0);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      onNavigate(results[selectedIdx].filePath);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIdx, onNavigate, onClose]);

  const getMatchIcon = (type: string) => {
    switch (type) {
      case 'title': return '📌';
      case 'heading': return '📖';
      default: return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search documentation… (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        <div className="search-results">
          {loading && <div className="search-loading">Searching…</div>}

          {!loading && query && results.length === 0 && (
            <div className="search-empty">No results found for "{query}"</div>
          )}

          {results.map((result, i) => (
            <button
              key={result.filePath}
              className={`search-result ${i === selectedIdx ? 'selected' : ''}`}
              onClick={() => { onNavigate(result.filePath); onClose(); }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <div className="result-header">
                <span className="result-icon">{getMatchIcon(result.matchType)}</span>
                <span className="result-title">{result.title}</span>
                <span className="result-score">{getStars(result.score, [5, 10])}</span>
              </div>
              <p className="result-excerpt">{result.excerpt}</p>
              <span className="result-path">{result.filePath}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
