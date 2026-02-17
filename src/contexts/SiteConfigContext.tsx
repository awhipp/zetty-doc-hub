import { createContext, useContext, type ReactNode } from 'react';
import type { SiteConfig } from '@/types';
import { getSiteConfig } from '@/config/siteConfig';

const SiteConfigContext = createContext<SiteConfig>(getSiteConfig());

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const config = getSiteConfig();
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext);
}
