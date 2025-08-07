import siteConfigJson from '../../site.config.json';

export interface SiteConfig {
    site: {
        title: string;
        description: string;
        author: string;
    };
    navigation: {
        sidebarTitle: string;
        hiddenDirectories?: string[];
        maxTocLevel?: number;
    };
    branding: {
        favicon: string;
        logo: string | null;
    };
    footer?: {
        text: string;
    };
    deployment?: {
        basePath: string;
    };
}

export const defaultSiteConfig: SiteConfig = {
    site: {
        title: "Zetty Doc Hub",
        description: "A modern documentation hub built with React and TypeScript",
        author: "Zetty Doc Hub Team"
    },
    navigation: {
        sidebarTitle: "File Explorer",
        hiddenDirectories: [],
        maxTocLevel: 2
    },
    branding: {
        favicon: "/favicon.svg",
        logo: null
    },
    footer: {
        text: "Documentation Hub - Organized with Zetty Doc Hub",
    },
    deployment: {
        basePath: "/"
    }
};

// Load configuration from environment variables and defaults
export const getSiteConfig = (): SiteConfig => {
    const configFromFile = siteConfigJson as Partial<SiteConfig>;

    return {
        site: {
            title: import.meta.env.VITE_SITE_TITLE || configFromFile.site?.title || defaultSiteConfig.site.title,
            description: import.meta.env.VITE_SITE_DESCRIPTION || configFromFile.site?.description || defaultSiteConfig.site.description,
            author: import.meta.env.VITE_SITE_AUTHOR || configFromFile.site?.author || defaultSiteConfig.site.author,
        },
        navigation: {
            sidebarTitle: import.meta.env.VITE_NAVIGATION_SIDEBAR_TITLE || configFromFile.navigation?.sidebarTitle || defaultSiteConfig.navigation.sidebarTitle,
            hiddenDirectories: configFromFile.navigation?.hiddenDirectories || defaultSiteConfig.navigation.hiddenDirectories || [],
            maxTocLevel: parseInt(import.meta.env.VITE_NAVIGATION_MAX_TOC_LEVEL) || configFromFile.navigation?.maxTocLevel || defaultSiteConfig.navigation.maxTocLevel || 2
        },
        branding: {
            favicon: import.meta.env.VITE_BRANDING_FAVICON || configFromFile.branding?.favicon || defaultSiteConfig.branding.favicon,
            logo: import.meta.env.VITE_BRANDING_LOGO || configFromFile.branding?.logo || defaultSiteConfig.branding.logo,
        },
        footer: {
            text: import.meta.env.VITE_FOOTER_TEXT || configFromFile.footer?.text || defaultSiteConfig.footer?.text || "Documentation Hub",
        },
        deployment: {
            basePath: import.meta.env.VITE_BASE_PATH || configFromFile.deployment?.basePath || defaultSiteConfig.deployment?.basePath || "/"
        }
    };
};