import type { SiteConfig } from '@/types';

const env = (key: string, fallback: string) =>
  (import.meta.env[key] as string | undefined) ?? fallback;

const envList = (key: string, fallback: string[]): string[] => {
  const v = import.meta.env[key] as string | undefined;
  if (!v) return fallback;
  return v.split(',').map(s => s.trim()).filter(Boolean);
};

const getBuildTime = (): string => {
  try { return __BUILD_TIME__; } catch { return new Date().toISOString(); }
};

export const getSiteConfig = (): SiteConfig => ({
  site: {
    title: env('VITE_SITE_TITLE', 'Zetty Doc Hub'),
    description: env('VITE_SITE_DESCRIPTION', 'A modern documentation hub built with React and TypeScript'),
    author: env('VITE_SITE_AUTHOR', 'Zetty Doc Hub Team'),
  },
  navigation: {
    sidebarTitle: env('VITE_NAVIGATION_SIDEBAR_TITLE', 'File Explorer'),
    hiddenDirectories: envList('VITE_NAVIGATION_HIDDEN_DIRECTORIES', []),
    maxTocLevel: parseInt(env('VITE_NAVIGATION_MAX_TOC_LEVEL', '2'), 10),
  },
  branding: {
    favicon: env('VITE_BRANDING_FAVICON', '/favicon.svg'),
  },
  footer: {
    text: env('VITE_FOOTER_TEXT', 'Documentation Hub - Organized with Zetty Doc Hub'),
  },
  deployment: {
    basePath: env('VITE_BASE_PATH', '/'),
  },
  github: {
    url: env('VITE_GITHUB_URL', 'https://github.com/awhipp/zetty-doc-hub'),
  },
  qa: {
    placeholder: env('VITE_QA_PLACEHOLDER', 'e.g., How do I install Zetty Doc Hub?'),
    commonQuestions: envList('VITE_QA_COMMON_QUESTIONS', [
      'How do I install Zetty Doc Hub?',
      'What is Zetty Doc Hub?',
      'How do I configure the documentation hub?',
      'Where can I find examples?',
    ]),
  },
  build: {
    time: getBuildTime(),
  },
  graph: {
    colors: {
      document: env('VITE_GRAPH_COLOR_DOCUMENT', '#377eb8'),
      tag: env('VITE_GRAPH_COLOR_TAG', '#4daf4a'),
      current: env('VITE_GRAPH_COLOR_CURRENT', '#ffb300'),
      image: env('VITE_GRAPH_COLOR_IMAGE', '#984ea3'),
    },
  },
});
