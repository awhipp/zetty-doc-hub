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
    <button
      className="back-to-top"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <IconArrowUp />
    </button>
  );
};

export default BackToTop;