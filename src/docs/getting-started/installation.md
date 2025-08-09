---
title: "Installation Guide"
description: "Get your Zetty Documentation Hub up and running in just a few minutes"
template: "general"
author: "Zetty Doc Hub"
date: "2024-01-15"
tags: ["installation", "setup", "getting-started", "nodejs", "git", "prerequisites"]
---

# Installation Guide

Get your Zetty Documentation Hub up and running in just a few minutes.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/awhipp/zetty-doc-hub.git
cd zetty-doc-hub
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173/zetty-doc-hub/`

## Verification

Once the development server is running, you should see:

1. **Left Panel**: A file tree showing the documentation structure
2. **Right Panel**: The main content area displaying documentation
3. **Navigation**: Clickable folders and files in the sidebar

## Next Steps

- **[Quick Start Guide](./quick-start)** - Learn the basics in 5 minutes
- **[Configuration](./configuration)** - Customize your documentation hub

## Troubleshooting

### Common Issues

**Port already in use?**

```bash
# Use a different port
npm run dev -- --port 3000
```

**Build failing?**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**

```bash
# Run type checking
npm run build
```

### Getting Help

- Look at [Examples](../examples/general-template-example) for implementation patterns

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.0.0 | v20.0.0+ |
| RAM | 512MB | 1GB+ |
| Disk Space | 100MB | 500MB+ |

---

**Ready to continue?** Head to the [Quick Start Guide](./quick-start) to learn the basics!
