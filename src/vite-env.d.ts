/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_TITLE: string
  readonly VITE_SITE_DESCRIPTION: string
  readonly VITE_SITE_AUTHOR: string
  readonly VITE_NAVIGATION_SIDEBAR_TITLE: string
  readonly VITE_NAVIGATION_HIDDEN_DIRECTORIES: string
  readonly VITE_NAVIGATION_MAX_TOC_LEVEL: string
  readonly VITE_BRANDING_FAVICON: string
  readonly VITE_FOOTER_TEXT: string
  readonly VITE_BASE_PATH: string
  readonly VITE_GITHUB_URL: string
  readonly VITE_QA_PLACEHOLDER: string
  readonly VITE_QA_COMMON_QUESTIONS: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Build time variable injected by Vite
declare const __BUILD_TIME__: string;