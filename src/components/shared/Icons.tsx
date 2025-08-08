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

export const IconChevronLeft: React.FC<IconProps> = ({ 
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
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ 
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
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconPanelLeft: React.FC<IconProps> = ({ 
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);

export const IconPanelRight: React.FC<IconProps> = ({ 
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);

export const IconGitHub: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  fill = "currentColor",
  ...props 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill={fill}
    {...props}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);
