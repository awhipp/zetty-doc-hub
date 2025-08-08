import React from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import './BuildTime.css';

const BuildTime: React.FC = () => {
  const siteConfig = useSiteConfig();
  
  const formatBuildTime = (buildTimeString: string): { date: string; time: string } => {
    try {
      const buildDate = new Date(buildTimeString);
      
      // Format date and time separately for better display
      const date = buildDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const time = buildDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      return { date, time };
    } catch {
      return { date: 'Unknown', time: 'Unknown' };
    }
  };

  if (!siteConfig.build?.time) {
    return null;
  }

  const { date, time } = formatBuildTime(siteConfig.build.time);

  return (
    <div className="build-time-indicator" title={`Last built: ${date} at ${time}`}>
      <div className="build-time-tooltip">
        <span className="build-time-label">Last Built</span>
        <span className="build-time-date">{date}</span>
        <span className="build-time-date">{time}</span>
      </div>
    </div>
  );
};

export default BuildTime;
