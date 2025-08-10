# Zetty Doc Hub

Zetty Doc Hub is a powerful documentation platform that automatically discovers, organizes, and enhances your markdown content with advanced features like NLP-powered Q&A, interactive knowledge graphs, intelligent search, and dynamic content relationships.

"Zetty" comes from "Zettelkasten", the renowned note-taking method that emphasizes linking and organizing knowledge - exactly what this hub does for your documentation.

## Table of Contents

- [Zetty Doc Hub](#zetty-doc-hub)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [**Advanced Search \& Discovery**](#advanced-search--discovery)
    - [**Zero-Configuration Auto-Discovery**](#zero-configuration-auto-discovery)
    - [**Content \& Navigation**](#content--navigation)
    - [**Rich Document Experience**](#rich-document-experience)
    - [**Content Intelligence**](#content-intelligence)
  - [Use Cases](#use-cases)
  - [Quick Setup](#quick-setup)
  - [Node Scripts](#node-scripts)
  - [Live Example](#live-example)
  - [Full Documentation](#full-documentation)

## Features

Unlike static site generators, Zetty Doc Hub creates a living, breathing documentation ecosystem that learns from your content and helps users find exactly what they need.

### **Advanced Search & Discovery**

- **Full-text search** with fuzzy matching and relevance scoring
- **NLP-powered Q&A** that answers questions using your documentation
- **Interactive knowledge graphs** showing document relationships
- **Smart content suggestions** based on tags and backlinks

### **Zero-Configuration Auto-Discovery**

- Drop markdown files anywhere in `src/docs/` and they appear instantly
- Automatic file tree navigation with intelligent URL routing
- Support for both traditional Markdown and modern MDX
- Extensive customization via environment variables as desired

### **Content & Navigation**

- **Dynamic file tree navigation** - Auto-discovered documentation structure
- **Intelligent URL routing** - Shareable, bookmarkable document links  
- **Responsive design** - Mobile, tablet & desktop support
- **Tags navigation** - Browse content by tags and categories
- **Hidden directories** - Organize sensitive or draft content that you may want linked but not indexed

### **Rich Document Experience**

- **Enhanced Markdown** - Tables, lists, code blocks with syntax highlighting
- **MDX Support** - React components directly in your markdown
- **Document Statistics** - Word count, reading time & metadata display
- **Frontmatter Templating** - Custom layouts driven by YAML metadata
- **Auto-generated ToC** - Navigate long documents with ease
- **Mermaid Diagrams** - Flowcharts, graphs, and visualizations in markdown

### **Content Intelligence**

- **Knowledge Graph** - Interactive visualization of document relationships
- **Backlinks & Related Content** - Discover connections between documents

## Use Cases

- **Technical documentation** - API docs, guides, tutorials
- **Knowledge bases** - Company wikis, research notes
- **Personal documentation** - Learning notes, project documentation
- **Team collaboration** - Shared documentation with discovery features
- **Educational content** - Course materials with interactive features

## Quick Setup

1. **Clone and install:**

    ```sh
    git clone https://github.com/awhipp/zetty-doc-hub.git
    cd zetty-doc-hub
    npm install
    ```

2. **Start development:**

    ```sh
    npm run dev
    ```

3. **Add your documentation:**
    - Place markdown files in `src/docs/`
    - Files appear automatically in the navigation
    - Try the search and Q&A features instantly

## Node Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Auto-fix linting issues

## Live Example

A live example of Zetty Doc Hub is available at [Zetty Doc Hub Demo](https://zettydocs.netlify.app/). Explore the features, try the search and Q&A, and see how it can enhance your documentation experience.

This repository includes comprehensive documentation in the `src/docs/` directory that demonstrates all features:

- **Getting Started Guide** - Complete setup and configuration
- **Feature Demonstrations** - Live examples of search, Q&A, and graphs
- **Customization Options** - Theming, environment variables, and advanced config
- **API Documentation** - TypeScript interfaces and utility functions

## Full Documentation

For complete documentation, examples, and advanced usage, see the [comprehensive documentation](src/docs/README.md) included in this repository. The documentation itself is built with Zetty Doc Hub, showcasing all features in action.
