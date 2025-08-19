import { getSiteConfig } from '../config/siteConfig';

export interface GraphColors {
  document: string;
  tag: string;
  current: string;
  image: string;
}

/**
 * Get the configured graph colors from site config
 */
export const getGraphColors = (): GraphColors => {
  const siteConfig = getSiteConfig();
  return {
    document: siteConfig.graph?.colors.document || '#377eb8',
    tag: siteConfig.graph?.colors.tag || '#4daf4a',
    current: siteConfig.graph?.colors.current || '#ffb300',
    image: siteConfig.graph?.colors.image || '#984ea3'
  };
};

/**
 * Set CSS custom properties for graph colors
 */
export const setGraphColorCSSVariables = (): void => {
  const colors = getGraphColors();
  const root = document.documentElement;
  
  root.style.setProperty('--graph-color-document', colors.document);
  root.style.setProperty('--graph-color-tag', colors.tag);
  root.style.setProperty('--graph-color-current', colors.current);
  root.style.setProperty('--graph-color-image', colors.image);
};
