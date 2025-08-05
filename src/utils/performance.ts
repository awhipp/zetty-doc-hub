import { BUNDLE_SIZE_LIMITS, PERFORMANCE } from './constants';

/**
 * Performance monitoring utilities for development
 */

// Bundle size analyzer for development
export const analyzeBundleSize = (size: number, filename: string): void => {
  if (import.meta.env.DEV) {
    if (size > BUNDLE_SIZE_LIMITS.WARNING_THRESHOLD) {
      console.warn(`⚠️ Large bundle detected: ${filename} (${(size / 1024).toFixed(2)}KB)`);
    }
    if (size > BUNDLE_SIZE_LIMITS.MAX_CHUNK_SIZE) {
      console.error(`❌ Bundle too large: ${filename} (${(size / 1024).toFixed(2)}KB). Consider code splitting.`);
    }
  }
};

// Performance timing helper
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
};

// Debounce helper for search and other expensive operations
export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number = PERFORMANCE.DEBOUNCE_DELAY
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay) as unknown as number;
  };
};

// Memory usage helper for development
export const logMemoryUsage = (context: string): void => {
  if (import.meta.env.DEV && 'memory' in performance) {
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    if (memory) {
      console.log(`📊 Memory usage (${context}): ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }
};

// Component render counter for debugging unnecessary re-renders
const renderCounts = new Map<string, number>();

export const trackRenderCount = (componentName: string): void => {
  if (import.meta.env.DEV) {
    const count = renderCounts.get(componentName) || 0;
    renderCounts.set(componentName, count + 1);
    
    if (count > 0 && count % 10 === 0) {
      console.warn(`🔄 Component ${componentName} has rendered ${count + 1} times. Consider optimization.`);
    }
  }
};