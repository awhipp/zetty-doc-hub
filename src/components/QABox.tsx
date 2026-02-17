import { useState, useRef, useCallback } from 'react';
import { fetchQAAnswer } from '@/api/docsApi';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { getStars } from '@/utils/display';
import type { QAAnswer } from '@/types';
import './QABox.css';

export default function QABox() {
  const config = useSiteConfig();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QAAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ask = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const a = await fetchQAAnswer(q);
      setAnswer(a);
    } catch (e) {
      console.error('Q&A error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(question);
    }
  };

  return (
    <div className="qa-box">
      <h3 className="qa-title">💡 Ask a Question</h3>

      <form onSubmit={handleSubmit} className="qa-form">
        <textarea
          ref={textareaRef}
          className="qa-input"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config.qa.placeholder}
          rows={2}
        />
        <button type="submit" className="qa-submit" disabled={loading || !question.trim()}>
          {loading ? '⏳ Thinking…' : '🔎 Ask'}
        </button>
      </form>

      <div className="qa-suggestions">
        {config.qa.commonQuestions.slice(0, 4).map((q, i) => (
          <button
            key={i}
            className="qa-suggestion"
            onClick={() => { setQuestion(q); ask(q); }}
          >
            {q}
          </button>
        ))}
      </div>

      {answer && (
        <div className="qa-answer">
          <div className="qa-answer-header">
            <span className="qa-confidence" title={`Confidence: ${Math.round(answer.confidence * 100)}%`}>
              {getStars(answer.confidence, [0.4, 0.7])}
            </span>
          </div>
          <div className="qa-answer-text">{answer.text}</div>
          {answer.sources.length > 0 && (
            <div className="qa-sources">
              <strong>Sources:</strong>
              {answer.sources.map((s, i) => (
                <span key={i} className="qa-source">📄 {s.title}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
