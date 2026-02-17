import { humanize } from '@/utils/display';
import './Breadcrumb.css';

interface BreadcrumbProps {
  filePath: string;
  onNavigate: (path: string) => void;
}

export default function Breadcrumb({ filePath, onNavigate }: BreadcrumbProps) {
  const parts = filePath.split('/');
  const crumbs = parts.map((part, i) => ({
    label: humanize(part),
    path: parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }));

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <button className="breadcrumb-item" onClick={() => onNavigate('')}>
        🏠 Home
      </button>
      {crumbs.map((crumb, i) => (
        <span key={i}>
          <span className="breadcrumb-sep">/</span>
          {crumb.isLast ? (
            <span className="breadcrumb-current">{crumb.label}</span>
          ) : (
            <button className="breadcrumb-item" onClick={() => onNavigate(crumb.path)}>
              {crumb.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
