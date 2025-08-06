import { useCallback, useRef, useEffect } from 'react';

interface UseDOMQueryOptions {
  cache?: boolean;
  multiple?: boolean;
}

interface UseDOMQueryReturn {
  queryElement: <T extends Element = Element>(selector: string, container?: Element | Document) => T | null;
  queryElements: <T extends Element = Element>(selector: string, container?: Element | Document) => T[];
  clearCache: () => void;
}

/**
 * Custom hook for cached DOM queries
 * Reduces repeated DOM queries and improves performance
 * 
 * @param options - Configuration for DOM query behavior
 * @returns DOM query functions with caching
 */
export const useDOMQuery = (options: UseDOMQueryOptions = {}): UseDOMQueryReturn => {
  const { cache = true } = options;
  
  const elementCache = useRef<Map<string, Element | Element[]>>(new Map());

  const queryElement = useCallback(<T extends Element = Element>(
    selector: string, 
    container: Element | Document = document
  ): T | null => {
    const cacheKey = `${selector}:${container === document ? 'document' : 'container'}`;
    
    if (cache && elementCache.current.has(cacheKey)) {
      const cached = elementCache.current.get(cacheKey);
      return (Array.isArray(cached) ? cached[0] : cached) as T | null;
    }

    const element = container.querySelector<T>(selector);
    
    if (cache && element) {
      elementCache.current.set(cacheKey, element);
    }
    
    return element;
  }, [cache]);

  const queryElements = useCallback(<T extends Element = Element>(
    selector: string, 
    container: Element | Document = document
  ): T[] => {
    const cacheKey = `${selector}:multiple:${container === document ? 'document' : 'container'}`;
    
    if (cache && elementCache.current.has(cacheKey)) {
      const cached = elementCache.current.get(cacheKey);
      return (Array.isArray(cached) ? cached : [cached]) as T[];
    }

    const elements = Array.from(container.querySelectorAll<T>(selector));
    
    if (cache && elements.length > 0) {
      elementCache.current.set(cacheKey, elements);
    }
    
    return elements;
  }, [cache]);

  const clearCache = useCallback(() => {
    elementCache.current.clear();
  }, []);

  // Clear cache when DOM changes significantly
  useEffect(() => {
    if (!cache) return;

    const observer = new MutationObserver(() => {
      // Clear cache when DOM structure changes
      clearCache();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    return () => {
      observer.disconnect();
    };
  }, [cache, clearCache]);

  return {
    queryElement,
    queryElements,
    clearCache
  };
};
