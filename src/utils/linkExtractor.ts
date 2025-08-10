export interface BasicLink {
  linkText: string;
  url: string;
}

export interface LinkWithContext extends BasicLink {
  context?: string;
}

/**
 * Extract links from markdown content
 */
export const extractLinks = (content: string, includeContext = false): LinkWithContext[] => {
  const links: LinkWithContext[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const [fullMatch, linkText, url] = match;
    
    // Skip external links and anchors
    if (url.match(/^(https?:\/\/|mailto:|#)/)) {
      continue;
    }
    
    const link: LinkWithContext = { linkText, url };
    
    if (includeContext) {
      // Extract context around the link (50 characters before and after)
      const matchIndex = match.index;
      const contextStart = Math.max(0, matchIndex - 50);
      const contextEnd = Math.min(content.length, matchIndex + fullMatch.length + 50);
      link.context = content.slice(contextStart, contextEnd).replace(/\n/g, ' ').trim();
    }
    
    links.push(link);
  }
  
  return links;
};
