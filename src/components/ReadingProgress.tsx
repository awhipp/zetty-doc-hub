import React, { useState, useEffect } from 'react';
import './ReadingProgress.css';

const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const mainContent = document.querySelector('.main-content-body');
      if (!mainContent) return;

      const scrollTop = mainContent.scrollTop;
      const scrollHeight = mainContent.scrollHeight - mainContent.clientHeight;
      const progressPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      setProgress(Math.min(100, Math.max(0, progressPercentage)));
    };

    const mainContent = document.querySelector('.main-content-body');
    if (mainContent) {
      mainContent.addEventListener('scroll', calculateProgress);
      calculateProgress(); // Initial calculation

      return () => {
        mainContent.removeEventListener('scroll', calculateProgress);
      };
    }
  }, []);

  return (
    <div className="reading-progress">
      <div 
        className="reading-progress-bar" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;