import React from 'react';
import './LoadingStates.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

interface LoadingMessageProps {
  message?: string;
  className?: string;
}

interface ErrorStateProps {
  title?: string;
  message: string;
  className?: string;
}

/**
 * Reusable loading spinner component
 * Consolidates loading UI across components
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '' 
}) => (
  <div className={`loading-spinner loading-spinner--${size} ${className}`}>
    <div className="spinner" />
  </div>
);

/**
 * Loading state with message
 * Used for content loading states
 */
export const LoadingMessage: React.FC<LoadingMessageProps> = ({ 
  message = 'Loading content...', 
  className = '' 
}) => (
  <div className={`loading-message ${className}`}>
    <LoadingSpinner />
    <p>{message}</p>
  </div>
);

/**
 * Error state component
 * Consolidates error UI across components
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Error', 
  message, 
  className = '' 
}) => (
  <div className={`error-state ${className}`}>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

/**
 * Content loading state for markdown/MDX files
 */
export const ContentLoading: React.FC = () => (
  <div className="content-loading">
    <LoadingMessage message="Loading content..." />
  </div>
);

/**
 * Search loading state
 */
export const SearchLoading: React.FC = () => (
  <div className="search-loading">
    <LoadingSpinner size="small" />
  </div>
);
