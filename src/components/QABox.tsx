import React, { useState, useRef, useEffect } from 'react';
import { generateAnswer } from '../utils/qaUtils';
import { useSiteConfig } from '../hooks/useSiteConfig';
import type { QAQuestion, QAAnswer } from '../types/qa';
import './QABox.css';

interface QABoxProps {
  onNavigateToFile?: (filePath: string) => void;
}

const QABox: React.FC<QABoxProps> = ({ onNavigateToFile }) => {
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<QAAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const qaBoxRef = useRef<HTMLDivElement>(null);

  // Get site configuration
  const siteConfig = useSiteConfig();
  const commonQuestions = siteConfig.qa?.commonQuestions || [];
  const placeholderText = siteConfig.qa?.placeholder || "e.g., How do I install Zetty Doc Hub?";

  // Get configurable placeholder text
  

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!question.trim() || isLoading) return;
      
      // Trigger form submission
      const form = qaBoxRef.current?.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  // Handle question submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      const qaQuestion: QAQuestion = {
        id: Date.now().toString(),
        text: question.trim(),
        timestamp: new Date()
      };

      const answer = await generateAnswer(qaQuestion);
      setCurrentAnswer(answer);
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to generate answer:', error);
      // Show error state
      const errorAnswer: QAAnswer = {
        id: Date.now().toString(),
        questionId: Date.now().toString(),
        text: "Sorry, I encountered an error while trying to answer your question. Please try again or search for specific terms.",
        sources: [],
        confidence: 0,
        timestamp: new Date()
      };
      setCurrentAnswer(errorAnswer);
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    setShowSuggestions(false);
    // Auto-submit the suggestion
    setTimeout(() => {
      const form = qaBoxRef.current?.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  // Handle source click
  const handleSourceClick = (filePath: string) => {
    if (onNavigateToFile) {
      onNavigateToFile(filePath);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qaBoxRef.current && !qaBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [question]);

  // Get confidence stars
  const getConfidenceStars = (confidence: number): string => {
    if (confidence >= 0.8) return '★★★';
    if (confidence >= 0.5) return '★★☆';
    return '★☆☆';
  };

  return (
    <div className="qa-box" ref={qaBoxRef}>
      <div className="qa-header">
        <h3>🤖 Ask Questions</h3>
        <p>Ask me anything about the documentation!</p>
      </div>

      <form onSubmit={handleSubmit} className="qa-form">
        <div className="qa-input-container">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholderText}
            className="qa-textarea"
            rows={1}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn-base btn-primary qa-submit-btn"
            disabled={!question.trim() || isLoading}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div className="qa-suggestions">
          <h4>Try asking:</h4>
          <div className="suggestions-list">
            {commonQuestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentAnswer && isExpanded && (
        <div className="qa-answer">
          <div className="answer-header">
            <span className="answer-label">Answer</span>
            <span className="confidence-badge">
              {getConfidenceStars(currentAnswer.confidence)} Confidence
            </span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="close-answer-btn"
              aria-label="Close answer"
            >
              ✕
            </button>
          </div>
          
          <div className="answer-content">
            <p>{currentAnswer.text}</p>
          </div>

          {currentAnswer.sources.length > 0 && (
            <div className="answer-sources">
              <h4>Sources:</h4>
              <div className="sources-list">
                {currentAnswer.sources.map((source, index) => (
                  <div key={index} className="source-item">
                    <button
                      onClick={() => handleSourceClick(source.filePath)}
                      className="source-link"
                    >
                      📄 {source.title}
                    </button>
                    <span className="source-score">
                      ({Math.round(source.relevanceScore * 10)}/10)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="qa-tips">
        <details className="qa-help">
          <summary>💡 Tips for better answers</summary>
          <ul>
            <li>Ask specific questions about features, setup, or usage</li>
            <li>Use keywords from the documentation</li>
            <li>Try "How do I..." or "What is..." questions</li>
            <li>Be specific about what you want to accomplish</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default QABox;