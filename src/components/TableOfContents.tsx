import React, { useEffect, useState, useRef } from 'react';
import { generateUniqueHeadingId } from '../utils/textUtils';
import { observeElementChanges } from '../utils/domUtils';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { useScrollHandler } from '../hooks';
import { getRelatedContent } from '../utils/backlinksUtils';
import { IconChevronRight } from './shared/Icons';
import RelatedContent from './RelatedContent';
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
  filePath?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef, isCollapsed, onToggleCollapse, filePath }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [hasRelatedContent, setHasRelatedContent] = useState<boolean>(false);
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
  }, [contentRef, siteConfig.navigation.maxTocLevel, hasRelatedContent]);

  // Check if related content exists
  useEffect(() => {
    if (!filePath) {
      console.log('[TableOfContents] filePath is empty or undefined:', filePath);
      return;
    }
    const checkRelatedContent = async () => {
      try {
        const relatedContent = await getRelatedContent(filePath);
        const hasContent = relatedContent.backlinks.length > 0 || relatedContent.byTags.length > 0;
        setHasRelatedContent(hasContent);
      } catch {
        setHasRelatedContent(false);
      }
    };
    checkRelatedContent();
  }, [filePath]);

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

  // Use scroll handler for main content area
  const { scrollToElement } = useScrollHandler({ container: '.main-content-body' });

  // Track last hash scrolled to, to avoid repeated scrolling
  const lastScrolledHash = useRef<string | null>(null);

  // Scroll to hash on mount or tocItems change
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || tocItems.length === 0) return;
    if (lastScrolledHash.current === hash) return;
    scrollToElement(hash);
    setActiveId(hash);
    lastScrolledHash.current = hash;
  }, [tocItems, scrollToElement]);

  // Scroll to heading on TOC click
  const scrollToHeading = (id: string) => {
    scrollToElement(id);
    // Update URL hash without triggering browser jump
    const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, '', newUrl);
    setActiveId(id);
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
        
        {/* Related Content at bottom of TOC */}
        {filePath && (
          <div className="toc-related-content">
            <RelatedContent filePath={filePath} />
          </div>
        )}
      </div>
    </aside>
  );
};

export default TableOfContents;