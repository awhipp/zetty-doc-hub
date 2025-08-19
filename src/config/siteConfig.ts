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
    github?: {
        url: string;
    };
    qa?: {
        placeholder: string;
        commonQuestions: string[];
    };
    build?: {
        time: string;
    };
    graph?: {
        colors: {
            document: string;
            tag: string;
            current: string;
            image: string;
        };
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
    },
    github: {
        url: "https://github.com/your-username/your-repo"
    },
    qa: {
        placeholder: "e.g., How do I install Zetty Doc Hub?",
        commonQuestions: [
            "How do I install Zetty Doc Hub?",
            "What is Zetty Doc Hub?",
            "How do I configure the documentation hub?",
            "Where can I find examples?",
            "How does the file tree system work?",
            "What file formats are supported?",
            "How do I add new documentation?",
            "How do I customize the appearance?"
        ]
    },
    build: {
        time: new Date().toISOString()
    },
    graph: {
        colors: {
            // Colors chosen for high contrast, color-blind friendliness, and harmony
            document: '#377eb8',  // Blue (color-blind safe)
            tag: '#4daf4a',       // Green (color-blind safe)
            current: '#ffb300',   // Gold (color-blind safe, not harsh)
            image: '#984ea3'      // Purple (color-blind safe)
        }
    }
};

// Load configuration from environment variables and defaults
export const getSiteConfig = (): SiteConfig => {
    // Parse hidden directories from comma-separated string
    const parseHiddenDirectories = (envValue: string | undefined): string[] => {
        if (!envValue) return defaultSiteConfig.navigation.hiddenDirectories || [];
        return envValue.split(',').map(dir => dir.trim()).filter(dir => dir.length > 0);
    };

    // Parse common questions from comma-separated string
    const parseCommonQuestions = (envValue: string | undefined): string[] => {
        if (!envValue) return defaultSiteConfig.qa?.commonQuestions || [];
        return envValue.split(',').map(q => q.trim()).filter(q => q.length > 0);
    };

    // Parse max TOC level with fallback
    const parseMaxTocLevel = (envValue: string | undefined): number => {
        const parsed = envValue ? parseInt(envValue, 10) : NaN;
        return isNaN(parsed) ? (defaultSiteConfig.navigation.maxTocLevel || 2) : parsed;
    };

    // Get build time from Vite define or fallback
    const getBuildTime = (): string => {
        try {
            return __BUILD_TIME__;
        } catch {
            return defaultSiteConfig.build?.time || new Date().toISOString();
        }
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
        },
        github: {
            url: import.meta.env.VITE_GITHUB_URL || defaultSiteConfig.github?.url || ""
        },
        qa: {
            placeholder: import.meta.env.VITE_QA_PLACEHOLDER || defaultSiteConfig.qa?.placeholder || "e.g., How do I install Zetty Doc Hub?",
            commonQuestions: parseCommonQuestions(import.meta.env.VITE_QA_COMMON_QUESTIONS)
        },
        build: {
            time: getBuildTime()
        },
        graph: {
            colors: {
                document: import.meta.env.VITE_GRAPH_COLOR_DOCUMENT || defaultSiteConfig.graph?.colors.document || '#0072B2',
                tag: import.meta.env.VITE_GRAPH_COLOR_TAG || defaultSiteConfig.graph?.colors.tag || '#D55E00',
                current: import.meta.env.VITE_GRAPH_COLOR_CURRENT || defaultSiteConfig.graph?.colors.current || '#009E73',
                image: import.meta.env.VITE_GRAPH_COLOR_IMAGE || defaultSiteConfig.graph?.colors.image || '#4bb3fd'
            }
        }
    };
};