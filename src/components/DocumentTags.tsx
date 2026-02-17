import './DocumentTags.css';

interface DocumentTagsProps {
  tags?: string[];
}

export default function DocumentTags({ tags }: DocumentTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="doc-tags">
      {tags.map(tag => (
        <span key={tag} className="doc-tag">
          🏷️ {tag}
        </span>
      ))}
    </div>
  );
}
