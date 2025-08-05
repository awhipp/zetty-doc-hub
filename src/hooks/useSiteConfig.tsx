import { useContext } from 'react';
import type { SiteConfig } from '../config/siteConfig';
import { SiteConfigContext } from '../contexts/SiteConfigContext';

export const useSiteConfig = (): SiteConfig => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};