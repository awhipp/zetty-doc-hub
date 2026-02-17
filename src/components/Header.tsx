import { useSiteConfig } from '@/contexts/SiteConfigContext';
import './Header.css';

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  onGraphOpen: () => void;
}

export default function Header({ onMenuToggle, onSearchOpen, onGraphOpen }: HeaderProps) {
  const config = useSiteConfig();

  return (
    <header className="header">
      <div className="header-left">
        <button className="btn-icon menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          ☰
        </button>
        <a href={config.deployment.basePath} className="header-title">
          {config.site.title}
        </a>
      </div>
      <div className="header-right">
        <button className="btn-icon" onClick={onSearchOpen} title="Search (Ctrl+K)">
          🔍
        </button>
        <button className="btn-icon" onClick={onGraphOpen} title="Knowledge Graph">
          🕸️
        </button>
      </div>
    </header>
  );
}
