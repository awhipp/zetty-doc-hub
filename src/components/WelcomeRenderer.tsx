import { useSiteConfig } from '@/contexts/SiteConfigContext';
import './WelcomeRenderer.css';

interface WelcomeRendererProps {
  onSearchOpen: () => void;
}

export default function WelcomeRenderer({ onSearchOpen }: WelcomeRendererProps) {
  const config = useSiteConfig();

  return (
    <div className="welcome">
      <div className="welcome-hero">
        <h1>{config.site.title}</h1>
        <p className="welcome-desc">{config.site.description}</p>
      </div>

      <div className="welcome-search" onClick={onSearchOpen}>
        <span className="welcome-search-icon">🔍</span>
        <span className="welcome-search-text">Search documentation… (Ctrl+K)</span>
        <kbd className="welcome-search-kbd">Ctrl+K</kbd>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3>Full-text Search</h3>
          <p>Fuzzy matching and relevance scoring across all documents</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🕸️</span>
          <h3>Knowledge Graph</h3>
          <p>Interactive visualization of document relationships</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🏷️</span>
          <h3>Tags & Categories</h3>
          <p>Organize and discover content through tags</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔗</span>
          <h3>Backlinks</h3>
          <p>Discover connections between documents</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📊</span>
          <h3>Mermaid Diagrams</h3>
          <p>Flowcharts, graphs, and visualizations</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📈</span>
          <h3>Document Stats</h3>
          <p>Word count, reading time, and character count</p>
        </div>
      </div>
    </div>
  );
}
