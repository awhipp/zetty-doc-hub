import React, { useState, useEffect } from 'react';
import './BackToTop.css';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const mainContent = document.querySelector('.main-content-body');
      if (mainContent && mainContent.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const mainContent = document.querySelector('.main-content-body');
    if (mainContent) {
      mainContent.addEventListener('scroll', toggleVisibility);
      return () => mainContent.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector('.main-content-body');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      className="back-to-top"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5,12 12,5 19,12"/>
      </svg>
    </button>
  );
};

export default BackToTop;