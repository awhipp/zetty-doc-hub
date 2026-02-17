import type { FrontMatter } from '@/types';
import type { ReactNode } from 'react';
import './TemplateWrapper.css';

interface TemplateWrapperProps {
  frontMatter: FrontMatter;
  children: ReactNode;
}

export default function TemplateWrapper({ frontMatter, children }: TemplateWrapperProps) {
  const template = frontMatter.template || 'general';

  if (template === 'effort') {
    return (
      <div className="template-effort">
        {frontMatter.title && <h1>{frontMatter.title}</h1>}
        {frontMatter.description && <p className="effort-desc">{frontMatter.description}</p>}

        <div className="effort-meta">
          {frontMatter.status && (
            <span className={`status-badge status-${frontMatter.status}`}>
              {frontMatter.status}
            </span>
          )}
          {frontMatter.priority && (
            <span className="priority-badge">Priority: {frontMatter.priority}</span>
          )}
          {frontMatter.assignees && (
            <span className="assignees">
              👥 {(frontMatter.assignees as string[]).join(', ')}
            </span>
          )}
        </div>

        {(frontMatter.startDate || frontMatter.endDate) && (
          <div className="effort-dates">
            {frontMatter.startDate && <span>📅 Start: {frontMatter.startDate as string}</span>}
            {frontMatter.endDate && <span>📅 End: {frontMatter.endDate as string}</span>}
          </div>
        )}

        {frontMatter.links && (
          <div className="effort-links">
            {(frontMatter.links as Array<{ label: string; url: string }>).map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="effort-link">
                🔗 {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="effort-content">{children}</div>
      </div>
    );
  }

  // General template (default)
  return (
    <div className="template-general">
      {frontMatter.title && <h1>{frontMatter.title}</h1>}
      {frontMatter.description && <p className="template-desc">{frontMatter.description}</p>}
      {(frontMatter.author || frontMatter.date) && (
        <div className="template-meta">
          {frontMatter.author && <span>✍️ {frontMatter.author}</span>}
          {frontMatter.date && <span>📅 {frontMatter.date}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
