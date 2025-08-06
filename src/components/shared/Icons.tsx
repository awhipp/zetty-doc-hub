import React from 'react';

interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  stroke?: string;
  strokeWidth?: number | string;
  fill?: string;
}

export const IconSearch: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ 
  width = 16, 
  height = 16, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ 
  width = 16, 
  height = 16, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ 
  width = 24, 
  height = 24, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <path d="M18 6L6 18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconMenu: React.FC<IconProps> = ({ 
  width = 24, 
  height = 24, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ 
  width = 16, 
  height = 16, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

export const IconFile: React.FC<IconProps> = ({ 
  width = 16, 
  height = 16, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <path d="M4 7V4a2 2 0 0 1 2-2h8m0 0v4a2 2 0 0 0 2 2h4m0 0v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7"/>
  </svg>
);

export const IconArrowUp: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  stroke = "currentColor", 
  strokeWidth = 2,
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  >
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
