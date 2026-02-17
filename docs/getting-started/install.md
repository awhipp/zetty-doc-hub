---
title: Installation Guide
description: How to install and run Zetty Doc Hub
tags: [getting-started, installation, setup]
author: Zetty Doc Hub Team
---

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **pnpm**

## Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-username/zetty-doc-hub.git
cd zetty-doc-hub

# Install dependencies
npm install

# Initialize MSW service worker
npx msw init public/ --save

# Start development server
npm run dev
```

## Project Structure

```
zetty-doc-hub/
├── docs/              # Your documentation (add .md files here!)
│   ├── README.md
│   ├── getting-started/
│   └── examples/
├── src/               # Application source code
│   ├── api/           # API client (works with MSW or real backend)
│   ├── components/    # React components
│   ├── config/        # Site configuration
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── mocks/         # MSW handlers (the "mock API")
│   └── types/         # TypeScript interfaces
├── public/            # Static assets
├── vite.config.ts     # Vite configuration
└── package.json
```

## Adding Documentation

Simply add markdown files to the `/docs` folder:

```bash
# Create a new document
echo "# My New Document" > docs/my-doc.md

# Create a subfolder
mkdir docs/tutorials
echo "# Tutorial 1" > docs/tutorials/first-tutorial.md
```

Files will be automatically discovered and indexed.

## Building for Production

```bash
npm run build
```

The output goes to `/dist` and can be deployed to any static hosting.

## Deploying to GitHub Pages

```bash
npm run deploy
```

See [Configuration](configuration.md) for environment variables.
