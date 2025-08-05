import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LinkComponentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

/**
 * Custom link component that handles internal navigation via React Router
 * while allowing external links to work normally and open in a new tab.
 */
const LinkComponent: React.FC<LinkComponentProps> = ({ href, children, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Check if it's an internal link (doesn't start with http/https/mailto/# and doesn't have a dot indicating external)
    if (href && !href.match(/^(https?:\/\/|mailto:|#|\.)/)) {
      e.preventDefault();
      navigate(href);
    }
  };

  // Check if it's an external link that should open in a new tab
  const isExternalLink = href && href.match(/^https?:\/\//);

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      target={isExternalLink ? "_blank" : undefined}
      rel={isExternalLink ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

export default LinkComponent;