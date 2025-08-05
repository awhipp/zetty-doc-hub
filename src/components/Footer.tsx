import React from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import './Footer.css';

const Footer: React.FC = () => {
  const siteConfig = useSiteConfig();

  return (
    <footer className="site-footer">
      <div className="site-footer-content">
        <p>{siteConfig.footer?.text || 'Documentation Hub'}</p>
      </div>
    </footer>
  );
};

export default Footer;