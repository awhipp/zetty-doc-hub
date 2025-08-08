import React, { useEffect, useState } from 'react';
import { generateUniqueHeadingId } from '../utils/textUtils';
import { observeElementChanges, scrollToElementSafely } from '../utils/domUtils';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { IconChevronRight } from './shared/Icons';
import './TableOfContents.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef?: React.RefObject<HTMLElement | null>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef, isCollapsed, onToggleCollapse }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const siteConfig = useSiteConfig();

  useEffect(() => {
    // Extract headings from the rendered content using MutationObserver
    const container = contentRef?.current || document;
    
    const updateTocItems = (headings: Element[]) => {
      const items: TocItem[] = [];
      const existingIds = new Set<string>();
      const maxLevel = siteConfig.navigation.maxTocLevel || 2;
      
      headings.forEach((heading, index) => {
        const headingLevel = parseInt(heading.tagName.charAt(1));
        
        // Skip headings that exceed the max TOC level
        if (headingLevel > maxLevel) {
          return;
        }
        
        const headingText = heading.textContent || '';
        let id = heading.id;
        
        // Generate meaningful ID if heading doesn't have one or has a generic one
        if (!id || id.match(/^heading-\d+$/)) {
          id = generateUniqueHeadingId(headingText, index, existingIds);
          heading.id = id;
        } else {
          // Track existing IDs to prevent duplicates
          existingIds.add(id);
        }
        
        items.push({
          id,
          text: headingText,
          level: headingLevel
        });
      });
      
      setTocItems(items);
    };

    // Use MutationObserver to watch for heading changes instead of setTimeout
    const cleanup = observeElementChanges('h1, h2, h3, h4, h5, h6', updateTocItems, container);

    return cleanup;
  }, [contentRef, siteConfig.navigation.maxTocLevel]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -80% 0%' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  // Handle hash navigation on page load or when TOC items change
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the '#' prefix
    if (hash && tocItems.length > 0) {
      // Use proper DOM readiness detection instead of setTimeout
      scrollToElementSafely(hash).then((success) => {
        if (success) {
          setActiveId(hash);
        }
      });
    }
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    scrollToElementSafely(id).then((success) => {
      if (success) {
        // Update URL hash without triggering page reload
        const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
        window.history.pushState(null, '', newUrl);
      }
    });
  };

  if (tocItems.length === 0) {
    return (
      <aside className={`table-of-contents ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="toc-sticky">
          <div className="toc-header">
            <h3 className="toc-title">📑 Table of Contents</h3>
            {onToggleCollapse && (
              <button 
                className="btn-base btn-icon btn-secondary collapse-button"
                onClick={onToggleCollapse}
                aria-label="Collapse table of contents"
                title="Collapse table of contents"
              >
                <IconChevronRight />
              </button>
            )}
          </div>
          <div className="toc-placeholder">
            <p>No headings found in this document.</p>
            <p className="toc-hint">Add headings (h1-h6) to generate a table of contents.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`table-of-contents ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="toc-sticky">
        <div className="toc-header">
          <h3 className="toc-title">📑 Table of Contents</h3>
          {onToggleCollapse && (
            <button 
              className="btn-base btn-icon btn-secondary collapse-button"
              onClick={onToggleCollapse}
              aria-label="Collapse table of contents"
              title="Collapse table of contents"
            >
              <IconChevronRight />
            </button>
          )}
        </div>
        <nav className="toc-nav">
          <ul className="toc-list">
            {tocItems.map((item) => (
              <li
                key={item.id}
                className={`toc-item toc-level-${item.level} ${activeId === item.id ? 'toc-active' : ''}`}
              >
                <button
                  className="toc-link clickable"
                  onClick={() => scrollToHeading(item.id)}
                  title={item.text}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default TableOfContents;