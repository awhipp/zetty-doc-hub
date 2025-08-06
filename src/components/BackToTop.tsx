import React from 'react';
import { useScrollHandler } from '../hooks';
import { IconArrowUp } from './shared';
import './BackToTop.css';

const BackToTop: React.FC = () => {
  const { isVisible, scrollToTop } = useScrollHandler({
    threshold: 300,
    container: '.main-content-body'
  });

  if (!isVisible) return null;

  return (
    <div className="back-to-top">
      <button
        className="btn-base btn-icon-lg back-to-top-btn fade-in-up"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <IconArrowUp />
      </button>
    </div>
  );
};

export default BackToTop;