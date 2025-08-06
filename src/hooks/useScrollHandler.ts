import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollHandlerOptions {
  threshold?: number;
  element?: string | Element;
  container?: string | Element;
}

interface UseScrollHandlerReturn {
  scrollPosition: number;
  isVisible: boolean;
  progress: number;
  scrollToTop: () => void;
  scrollToElement: (elementId: string) => void;
}

/**
 * Custom hook for scroll-related functionality
 * Consolidates scroll logic used across BackToTop, ReadingProgress, and TableOfContents
 * 
 * @param options - Configuration for scroll behavior
 * @returns Scroll state and handlers
 */
export const useScrollHandler = (options: UseScrollHandlerOptions = {}): UseScrollHandlerReturn => {
  const {
    threshold = 300,
    container = '.main-content-body'
  } = options;

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const containerElementRef = useRef<Element | null>(null);

  const getContainerElement = useCallback(() => {
    if (containerElementRef.current) {
      return containerElementRef.current;
    }

    if (typeof container === 'string') {
      const element = document.querySelector(container);
      containerElementRef.current = element;
      return element;
    } else if (container instanceof Element) {
      containerElementRef.current = container;
      return container;
    }

    return null;
  }, [container]);

  const calculateProgress = useCallback(() => {
    const containerElement = getContainerElement();
    if (!containerElement) return;

    const scrollTop = containerElement.scrollTop;
    const scrollHeight = containerElement.scrollHeight - containerElement.clientHeight;
    const progressPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    setScrollPosition(scrollTop);
    setProgress(Math.min(100, Math.max(0, progressPercentage)));
    setIsVisible(scrollTop > threshold);
  }, [getContainerElement, threshold]);

  const scrollToTop = useCallback(() => {
    const containerElement = getContainerElement();
    if (containerElement) {
      containerElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [getContainerElement]);

  const scrollToElement = useCallback((elementId: string) => {
    const containerElement = getContainerElement();
    const targetElement = document.getElementById(elementId);
    
    if (containerElement && targetElement) {
      const containerRect = containerElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const offsetTop = targetRect.top - containerRect.top + containerElement.scrollTop - 80; // 80px offset for header
      
      containerElement.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }, [getContainerElement]);

  useEffect(() => {
    const containerElement = getContainerElement();
    if (!containerElement) return;

    // Initial calculation
    calculateProgress();

    // Add scroll listener
    containerElement.addEventListener('scroll', calculateProgress);
    
    return () => {
      containerElement.removeEventListener('scroll', calculateProgress);
    };
  }, [calculateProgress, getContainerElement]);

  // Reset container reference when container prop changes
  useEffect(() => {
    containerElementRef.current = null;
  }, [container]);

  return {
    scrollPosition,
    isVisible,
    progress,
    scrollToTop,
    scrollToElement
  };
};
