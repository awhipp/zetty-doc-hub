---
title: "Quick Start Guide"
description: "Learn the essentials of using Zetty Documentation Hub in just 5 minutes"
template: "general"
author: "Zetty Doc Hub"
date: "2024-01-15"
tags: ["quick-start", "getting-started", "tutorial", "basics", "markdown", "mdx"]
---

# Quick Start Guide

Learn the essentials of using Zetty Documentation Hub in just 5 minutes.

## Your First Documentation

Once you have Zetty Doc Hub [installed](./installation), you can immediately start adding your own documentation.

### Adding a New Document

1. **Create a new markdown file** in the `src/docs` directory:

```bash
# Create a simple document
echo "# My First Document\nHello, World!" > src/docs/my-first-doc.md
```

2. **Watch the magic happen** - The file automatically appears in the sidebar!

3. **Click on the file** in the sidebar to view its content

### Creating Folders

Organize your documentation with folders:

```bash
# Create a new folder structure
mkdir -p src/docs/tutorials
echo "# Tutorial Overview\nWelcome to our tutorials!" > src/docs/tutorials/overview.md
echo "# Basic Tutorial\nLet's start with the basics." > src/docs/tutorials/basic.md
```

The folder structure will automatically appear in the sidebar with expandable/collapsible folders.

## File Types Supported

Zetty Doc Hub supports two types of files:

### Markdown Files (.md)

Standard markdown with GitHub-flavored markdown features:

```markdown
# Headers
## Subheaders

- Lists
- **Bold text**
- *Italic text*
- `code snippets`

| Tables | Are | Supported |
|--------|-----|-----------|
| Yes    | They| Are       |
```

### MDX Files (.mdx)

Markdown with JSX components for interactive content:

```mdx
# Interactive Content

<div style={{padding: '20px', background: '#f0f8ff', borderRadius: '8px'}}>
  This is a custom JSX component inside markdown!
</div>

export const CustomButton = () => (
  <button style={{padding: '10px', background: '#007acc', color: 'white'}}>
    Click me!
  </button>
);

<CustomButton />
```

## Navigation Features

### File Tree Navigation

- **📁 Folders**: Click to expand/collapse
- **📄 Files**: Click to view content
- **Auto-sorting**: Folders appear first, then files alphabetically

### URL Routing

Each document has its own URL:

- `http://localhost:5173/my-first-doc`
- `http://localhost:5173/tutorials/basic`
- URLs are shareable and bookmarkable

### Cross-Document Linking

Link between documents using relative paths:

```markdown
Check out our [Installation Guide](./installation) for setup instructions.
```

## Content Organization Tips

### 1. Use Descriptive Filenames

```bash
# Good
user-authentication.md
api-endpoints.md
troubleshooting-guide.md

# Avoid
doc1.md
stuff.md
notes.md
```

### 2. Create Logical Folder Structure

```
src/docs/
├── README.md                 # Main overview
├── getting-started/          # Onboarding content
│   ├── installation.md
│   └── quick-start.md
├── guides/                   # How-to guides
│   ├── user-guide.md
│   └── admin-guide.md
└── reference/                # Technical reference
    ├── api.md
    └── configuration.md
```

### 3. Use Consistent Heading Structure

```markdown
# Page Title (H1 - only one per page)
## Major Section (H2)
### Subsection (H3)
#### Details (H4)
```

## What's Next?

Now that you know the basics:

1. **[Configure your hub](./configuration)** - Customize the appearance and behavior
2. **[View examples](../examples/general-template-example)** - See available templates and examples

## Quick Reference Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run code linting

# File operations (examples)
mkdir src/docs/new-section                    # Create new folder
echo "# Title" > src/docs/new-section/doc.md # Create new document
```

---

**Pro Tip**: Try creating both `.md` and `.mdx` files to see the difference in capabilities!
