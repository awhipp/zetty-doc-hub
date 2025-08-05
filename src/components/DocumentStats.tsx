import React, { useState, useEffect } from 'react';
import './DocumentStats.css';

interface DocumentStatsProps {
  content?: string;
}

const DocumentStats: React.FC<DocumentStatsProps> = ({ content }) => {
  const [stats, setStats] = useState({
    wordCount: 0,
    charCount: 0,
    readingTime: 0
  });

  useEffect(() => {
    if (!content) {
      setStats({ wordCount: 0, charCount: 0, readingTime: 0 });
      return;
    }

    // Remove markdown syntax and HTML tags for accurate word count
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/>\s/g, '') // Remove blockquotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = cleanContent.length;
    
    // Average reading speed: 200-300 words per minute
    // Using 250 words per minute as a reasonable average
    const readingTime = Math.ceil(wordCount / 250);

    setStats({
      wordCount,
      charCount,
      readingTime: Math.max(1, readingTime) // Minimum 1 minute
    });
  }, [content]);

  if (stats.wordCount === 0) return null;

  return (
    <div className="document-stats">
      <div className="stats-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        <span>{stats.wordCount.toLocaleString()} words</span>
      </div>
      
      <div className="stats-separator">•</div>
      
      <div className="stats-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span>{stats.readingTime} min read</span>
      </div>
      
      <div className="stats-separator">•</div>
      
      <div className="stats-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7V4a2 2 0 0 1 2-2h8m0 0v4a2 2 0 0 0 2 2h4m0 0v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7"/>
        </svg>
        <span>{stats.charCount.toLocaleString()} chars</span>
      </div>
    </div>
  );
};

export default DocumentStats;