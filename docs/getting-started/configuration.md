---
title: Configuration
description: Configure Zetty Doc Hub with environment variables
tags: [configuration, getting-started, customization]
---

Zetty Doc Hub is configured via environment variables. Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

## Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SITE_TITLE` | Zetty Doc Hub | The site title shown in the header |
| `VITE_SITE_DESCRIPTION` | A modern documentation hub... | Meta description |
| `VITE_SITE_AUTHOR` | Zetty Doc Hub Team | Author name |
| `VITE_BASE_PATH` | `/` | Base path for deployment (e.g., `/my-repo/`) |
| `VITE_GITHUB_URL` | - | Link to GitHub repository |
| `VITE_FOOTER_TEXT` | Documentation Hub... | Footer text |
| `VITE_NAVIGATION_HIDDEN_DIRECTORIES` | - | Comma-separated hidden dirs |
| `VITE_NAVIGATION_MAX_TOC_LEVEL` | 2 | Max heading level for ToC |

## Graph Color Customization

Customize the knowledge graph colors (color-blind safe defaults):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_GRAPH_COLOR_DOCUMENT` | `#377eb8` | Document node color |
| `VITE_GRAPH_COLOR_TAG` | `#4daf4a` | Tag node color |
| `VITE_GRAPH_COLOR_CURRENT` | `#ffb300` | Current document highlight |
| `VITE_GRAPH_COLOR_IMAGE` | `#984ea3` | Image node color |

## MSW to Real Backend Migration

The architecture is designed for easy migration:

1. Remove MSW from `main.tsx`
2. Update `API_BASE` in `src/api/docsApi.ts` to point to your API
3. Implement the same endpoints on your Lambda/API Gateway:
   - `GET /api/docs/manifest` — file listing
   - `GET /api/docs/file/:path` — file content
   - `GET /api/docs/tree` — file tree structure
   - `GET /api/docs/search?q=...` — search
   - `GET /api/docs/tags` — all tags
   - `GET /api/docs/graph` — knowledge graph data

See [Installation Guide](install.md) for setup details.
