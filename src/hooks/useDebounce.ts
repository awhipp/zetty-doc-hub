import { useRef, useCallback } from 'react';
import { PERFORMANCE } from '../utils/constants';

/**
 * Custom hook for debouncing function calls
 * Consolidates debounce logic used across search components
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (defaults to PERFORMANCE.DEBOUNCE_DELAY)
 * @returns Debounced function
 */
export const useDebounce = <T extends (...args: never[]) => void>(
  callback: T,
  delay: number = PERFORMANCE.DEBOUNCE_DELAY
) => {
  const timeoutRef = useRef<number | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay) as unknown as number;
    },
    [callback, delay]
  );

  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return { debouncedCallback, cancelDebounce };
};
