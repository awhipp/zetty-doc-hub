/**
 * Utility functions for DOM operations and observation
 */

/**
 * Waits for an element to exist in the DOM
 */
export const waitForElement = (
  selector: string, 
  container?: Element | Document,
  timeoutMs: number = 10000
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const root = container || document;
    const existingElement = root.querySelector(selector);
    
    if (existingElement) {
      resolve(existingElement);
      return;
    }

    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element with selector "${selector}" not found within ${timeoutMs}ms`));
    }, timeoutMs);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const element = root.querySelector(selector);
          if (element) {
            clearTimeout(timeoutId);
            observer.disconnect();
            resolve(element);
            return;
          }
        }
      }
    });

    // Set up timeout to prevent indefinite waiting

    observer.observe(root, {
      childList: true,
      subtree: true
    });
  });
};

/**
 * Waits for multiple elements to exist in the DOM
 */
export const waitForElements = (
  selectors: string[], 
  container?: Element | Document,
  timeoutMs: number = 10000
): Promise<Element[]> => {
  return Promise.all(selectors.map(selector => waitForElement(selector, container, timeoutMs)));
};

/**
 * Observes changes to elements matching a selector within a container
 */
export const observeElementChanges = (
  selector: string,
  callback: (elements: Element[]) => void,
  container?: Element | Document
): (() => void) => {
  const root = container || document;
  
  const checkElements = () => {
    const elements = Array.from(root.querySelectorAll(selector));
    callback(elements);
  };

  // Initial check
  checkElements();

  const observer = new MutationObserver(() => {
    checkElements();
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id', 'class']
  });

  return () => observer.disconnect();
};

/**
 * Waits for the next animation frame, useful for DOM operations
 */
export const waitForAnimationFrame = (): Promise<void> => {
  return new Promise(resolve => {
    requestAnimationFrame(() => resolve());
  });
};

/**
 * Scrolls to an element with proper timing
 */
export const scrollToElementSafely = async (
  elementId: string, 
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' },
  timeoutMs: number = 5000
): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    if (element) {
      await waitForAnimationFrame();
      element.scrollIntoView(options);
      return true;
    }
    
    // If element doesn't exist yet, wait for it with a timeout
    try {
      await waitForElement(`#${elementId}`, document, timeoutMs);
      const foundElement = document.getElementById(elementId);
      if (foundElement) {
        await waitForAnimationFrame();
        foundElement.scrollIntoView(options);
        return true;
      }
    } catch (timeoutError) {
      console.warn(`Element with id "${elementId}" not found within timeout`, timeoutError);
      return false;
    }
    
    return false;
  } catch (error) {
    console.warn(`Failed to scroll to element with id: ${elementId}`, error);
    return false;
  }
};