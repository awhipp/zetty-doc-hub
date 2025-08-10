import React from 'react';
import QABox from './QABox';
import { useSiteConfig } from '../hooks/useSiteConfig';
import './WelcomeRenderer.css';

interface WelcomeRendererProps {
  onNavigateToFile: (filePath: string) => void;
}

const WelcomeRenderer: React.FC<WelcomeRendererProps> = ({ onNavigateToFile }) => {
  const siteConfig = useSiteConfig();
  
  return (
    <div className="welcome-renderer">
      <div className="welcome-header">
        <h3>Welcome to {siteConfig.site.title}</h3>
        <p>{siteConfig.site.description}</p>
      </div>
      
      <QABox onNavigateToFile={onNavigateToFile} />
      
      <div className="features-showcase">
        <h4>✨ Available Features</h4>
        <div className="features-grid">
          <div className="feature-category">
            <h5>📖 Content & Navigation</h5>
            <ul>
              <li>🌲 <strong>Dynamic file tree navigation</strong> - Auto-discovered documentation structure</li>
              <li>🔗 <strong>Intelligent URL routing</strong> - Shareable, bookmarkable document links</li>
              <li>📱 <strong>Responsive design</strong> - Mobile, tablet & desktop support</li>
              <li>🏷️ <strong>Tags navigation</strong> - Browse content by tags and categories</li>
            </ul>
          </div>
          
          <div className="feature-category">
            <h5>📝 Document Experience</h5>
            <ul>
              <li>📄 <strong>Markdown</strong> - Rich text with tables, lists, code blocks</li>
              <li>⚛️ <strong>MDX Support</strong> - Enhanced markdown with JSX components</li>
              <li>📊 <strong>Document Statistics</strong> - Word count, reading time & metadata</li>
              <li>🎯 <strong>Frontmatter Templating</strong> - Custom layouts driven by metadata</li>
            </ul>
          </div>
          
          <div className="feature-category">
            <h5>🛠️ Advanced Tools</h5>
            <ul>
              <li>📋 <strong>Auto-generated table of contents</strong> - Navigate long documents easily</li>
              <li>🎨 <strong>Mermaid diagram support</strong> - Flowcharts & visualizations in markdown</li>
              <li>🔍 <strong>Full-text and NLP search</strong> - Find content across all documentation</li>
              <li>🕸️ <strong>Related content & graph visualization</strong> - Backlinks, suggestions & interactive document relationships</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeRenderer;
