import { useSiteConfig } from '@/contexts/SiteConfigContext';
import './Footer.css';

export default function Footer() {
  const config = useSiteConfig();
  return (
    <footer className="footer">
      <p>
        {config.github.url ? (
          <a href={config.github.url} target="_blank" rel="noopener noreferrer" className="footer-link">
            {config.footer.text}
          </a>
        ) : (
          config.footer.text
        )}
      </p>
    </footer>
  );
}
