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
              <li>🌲 <strong>File tree navigation</strong> - Browse documentation structure</li>
              <li>📁 <strong>Expandable folders</strong> - Organize content hierarchically</li>
              <li>🧭 <strong>Breadcrumb navigation</strong> - Track your location</li>
              <li>🔗 <strong>Smart URL routing</strong> - Shareable document links</li>
              <li>📱 <strong>Responsive design</strong> - Mobile & desktop support</li>
            </ul>
          </div>
          
          <div className="feature-category">
            <h5>📝 Document Experience</h5>
            <ul>
              <li>📄 <strong>Markdown rendering</strong> - Rich text formatting</li>
              <li>⚡ <strong>MDX support</strong> - Interactive components</li>
              <li>🖼️ <strong>Image viewing</strong> - Display SVG, PNG, JPG, GIF, WebP files</li>
              <li>🎨 <strong>Syntax highlighting</strong> - Beautiful code blocks</li>
              <li>📋 <strong>Copy code buttons</strong> - One-click copying</li>
              <li>📊 <strong>Reading progress bar</strong> - Track your progress</li>
              <li>📈 <strong>Document statistics</strong> - Word count & reading time</li>
              <li>⬆️ <strong>Back to top button</strong> - Quick navigation</li>
            </ul>
          </div>
          
          <div className="feature-category">
            <h5>🛠️ Advanced Tools</h5>
            <ul>
              <li>📋 <strong>Table of contents</strong> - Auto-generated navigation</li>
              <li>📊 <strong>Mermaid diagrams</strong> - Flowcharts & visualizations</li>
              <li>📝 <strong>Document templates</strong> - Structured content creation</li>
              <li>🔍 <strong>Smart search</strong> - Find content quickly</li>
              <li>🤖 <strong>AI Q&A assistant</strong> - Get instant answers</li>
              <li>🔥 <strong>Hot reload</strong> - Real-time development updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeRenderer;
