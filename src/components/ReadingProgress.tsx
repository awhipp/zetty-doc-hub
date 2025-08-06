import React from 'react';
import { useScrollHandler } from '../hooks';
import './ReadingProgress.css';

const ReadingProgress: React.FC = () => {
  const { progress } = useScrollHandler({
    container: '.main-content-body'
  });

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