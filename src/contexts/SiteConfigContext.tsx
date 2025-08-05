import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import type { SiteConfig } from '../config/siteConfig';
import { getSiteConfig } from '../config/siteConfig';

const SiteConfigContext = createContext<SiteConfig | undefined>(undefined);

interface SiteConfigProviderProps {
  children: ReactNode;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({ children }) => {
  const config = getSiteConfig();
  
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export { SiteConfigContext };