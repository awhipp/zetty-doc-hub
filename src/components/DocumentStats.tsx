import { useMemo } from 'react';
import './DocumentStats.css';

interface DocumentStatsProps {
  content: string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/[-*_]{3,}/g, '')
    .replace(/\|[^|]+\|/g, '')
    .trim();
}

export default function DocumentStats({ content }: DocumentStatsProps) {
  const stats = useMemo(() => {
    const plain = stripMarkdown(content);
    const words = plain.split(/\s+/).filter(Boolean).length;
    const chars = plain.length;
    const readingTime = Math.max(1, Math.ceil(words / 250));
    return { words, chars, readingTime };
  }, [content]);

  return (
    <div className="doc-stats">
      <span title="Word count">📝 {stats.words.toLocaleString()} words</span>
      <span title="Reading time">⏱️ {stats.readingTime} min read</span>
      <span title="Character count">🔤 {stats.chars.toLocaleString()} chars</span>
    </div>
  );
}
