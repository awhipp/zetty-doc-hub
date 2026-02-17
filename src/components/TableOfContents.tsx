import { useState, useEffect, useRef, useCallback } from 'react';
import './TableOfContents.css';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  maxLevel?: number;
}

export default function TableOfContents({ maxLevel = 2 }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from DOM after render
  useEffect(() => {
    const extractHeadings = () => {
      const article = document.querySelector('.markdown-content');
      if (!article) return;

      const elements = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const found: Heading[] = [];

      elements.forEach(el => {
        const level = parseInt(el.tagName[1], 10);
        if (level > maxLevel) return;

        // Generate an ID if not present
        if (!el.id) {
          el.id = el.textContent
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() || '';
        }

        found.push({ id: el.id, text: el.textContent || '', level });
      });

      setHeadings(found);
    };

    // Use MutationObserver to detect when markdown renders
    const observer = new MutationObserver(extractHeadings);
    const article = document.querySelector('.markdown-content');
    if (article) {
      observer.observe(article, { childList: true, subtree: true });
      extractHeadings();
    }

    return () => observer.disconnect();
  }, [maxLevel]);

  // Track active heading with IntersectionObserver
  useEffect(() => {
    observerRef.current?.disconnect();
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <h3 className="toc-title">On this page</h3>
      <ul className="toc-list">
        {headings.map(h => (
          <li key={h.id} className="toc-item" style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
            <button
              className={`toc-link ${activeId === h.id ? 'active' : ''}`}
              onClick={() => scrollTo(h.id)}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
