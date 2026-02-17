# Copilot Instructions – Zetty Doc Hub

## Project Overview

Zetty Doc Hub is a **static-first documentation hub** built with React 19, TypeScript, and Vite 7. Markdown files placed in `/docs` are discovered at build time by a custom Vite plugin, bundled into a JSON manifest, and served at runtime through **MSW (Mock Service Worker)** handlers that expose a REST-like `/api/docs/*` surface. No backend server is required for development or static deployment.

## Architecture

### Data flow

```
docs/*.md  ──▶  Vite plugin (scripts/docsManifestPlugin.ts)
               ──▶  virtual:docs-manifest (inlined JSON)
                      ──▶  MSW handlers (src/mocks/handlers.ts)
                             ──▶  /api/docs/* REST endpoints
                                    ──▶  React components via src/api/docsApi.ts
```

### Key directories

| Path              | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `docs/`           | Markdown content (auto-discovered)                            |
| `scripts/`        | Build-time Vite plugins                                       |
| `src/api/`        | Fetch helpers that call `/api/docs/*`                         |
| `src/components/` | React components (each with a co-located `.css`)              |
| `src/config/`     | Runtime site configuration from env vars                      |
| `src/contexts/`   | React context providers (SiteConfig)                          |
| `src/hooks/`      | Shared custom hooks (`useDebounce`, `useScrollHandler`)       |
| `src/mocks/`      | MSW worker + handlers that serve the manifest                 |
| `src/types/`      | Shared TypeScript interfaces                                  |
| `src/utils/`      | Pure utility functions (front-matter parser, display helpers) |

### Important patterns

- **One component per file** – each component lives in its own `.tsx` alongside a `.css` module.
- **Shared utilities** live in `src/utils/`. If you find yourself duplicating logic (display formatting, YAML parsing, etc.) extract it there.
- **`parseFrontMatter`** is the single YAML front-matter parser shared by both `docsApi.ts` (re-export) and `mocks/handlers.ts`.
- **Display helpers** (`humanize`, `getFileIcon`, `getStars`) live in `src/utils/display.ts`. Use them everywhere instead of inline formatting.
- **Path alias** `@/` maps to `src/`.

## Tech Stack

- **React 19** + **React Router 7** (SPA, `BrowserRouter`)
- **TypeScript 5.8** (strict mode)
- **Vite 7** with `@vitejs/plugin-react`
- **MSW 2** for API mocking
- **react-markdown** + remark-gfm + rehype-highlight for rendering
- **Mermaid** (lazy-loaded) for diagrams
- **Cytoscape** + `cytoscape-cose-bilkent` (lazy-loaded) for the knowledge graph
- **highlight.js** for syntax highlighting

## Coding Standards

### TypeScript

- Use `strict: true` everywhere.
- Prefer `interface` over `type` for object shapes.
- All shared types go in `src/types/index.ts`.
- Avoid `any`; use `unknown` and narrow.

### React

- **Functional components only** – no class components.
- Use `memo()` for expensive list-item renderers (see `SidePanel`).
- Heavy third-party libs (mermaid, cytoscape) must be **lazy-loaded** via dynamic `import()`.
- Prefer `useCallback` / `useMemo` where referential stability matters (callbacks passed to children, memoized computations).
- Co-locate CSS with components using plain `.css` files and BEM-like class names.

### Styling

- No CSS-in-JS; use co-located `.css` files.
- CSS custom properties (variables) are defined in `src/index.css`.
- Support both light and dark themes via `prefers-color-scheme`.

### API Layer

- All data fetching goes through `src/api/docsApi.ts`.
- Functions return typed promises (`Promise<SearchResult[]>`, etc.).
- To migrate to a real backend: swap the MSW handlers or change `API_BASE` in `docsApi.ts`.

## Build & Deployment

- `npm run dev` – Vite dev server; the plugin serves `/api/docs/*` in dev middleware.
- `npm run build` – TypeScript compile + Vite production build; outputs to `dist/`.
- `npm run preview` – Preview the production build locally.
- Deployed to **Netlify** (see `netlify.toml`). SPA fallback configured via `_redirects` + `netlify.toml`.

## Adding Documentation

1. Add `.md` or `.mdx` files anywhere under `docs/`.
2. Optionally add YAML front-matter (`title`, `description`, `tags`, `template`, etc.).
3. Rebuild or restart the dev server – files appear automatically.
4. The root `README.md` is copied into `docs/README.md` at build time so the project README also appears as a doc page. Set `SYNC_ROOT_README=false` to disable this behaviour.

## Environment Variables

All config is driven by `VITE_*` env vars (see `src/config/siteConfig.ts` for the full list). Defaults are sensible; no `.env` file is required for development.
