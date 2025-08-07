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
        hiddenDirectories: ["src/docs/examples/hidden/"],
        maxTocLevel: 2
    },
    branding: {
        favicon: "/favicon.svg"
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
    // Parse hidden directories from comma-separated string
    const parseHiddenDirectories = (envValue: string | undefined): string[] => {
        if (!envValue) return defaultSiteConfig.navigation.hiddenDirectories || [];
        return envValue.split(',').map(dir => dir.trim()).filter(dir => dir.length > 0);
    };

    // Parse max TOC level with fallback
    const parseMaxTocLevel = (envValue: string | undefined): number => {
        const parsed = envValue ? parseInt(envValue, 10) : NaN;
        return isNaN(parsed) ? (defaultSiteConfig.navigation.maxTocLevel || 2) : parsed;
    };

    return {
        site: {
            title: import.meta.env.VITE_SITE_TITLE || defaultSiteConfig.site.title,
            description: import.meta.env.VITE_SITE_DESCRIPTION || defaultSiteConfig.site.description,
            author: import.meta.env.VITE_SITE_AUTHOR || defaultSiteConfig.site.author,
        },
        navigation: {
            sidebarTitle: import.meta.env.VITE_NAVIGATION_SIDEBAR_TITLE || defaultSiteConfig.navigation.sidebarTitle,
            hiddenDirectories: parseHiddenDirectories(import.meta.env.VITE_NAVIGATION_HIDDEN_DIRECTORIES),
            maxTocLevel: parseMaxTocLevel(import.meta.env.VITE_NAVIGATION_MAX_TOC_LEVEL)
        },
        branding: {
            favicon: import.meta.env.VITE_BRANDING_FAVICON || defaultSiteConfig.branding.favicon,
        },
        footer: {
            text: import.meta.env.VITE_FOOTER_TEXT || defaultSiteConfig.footer?.text || "Documentation Hub",
        },
        deployment: {
            basePath: import.meta.env.VITE_BASE_PATH || defaultSiteConfig.deployment?.basePath || "/"
        }
    };
};