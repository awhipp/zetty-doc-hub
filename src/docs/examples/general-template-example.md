---
title: "General Template Example"
description: "Demonstration of the general template style available in Zetty Doc Hub"
template: "general"
author: "Zetty Doc Hub"
date: "2024-01-15"
tags: ["templates", "examples", "demonstration"]
---

This document showcases the different template options available in Zetty Doc Hub. Each template provides a unique layout and styling approach to present your documentation content.

## Available Templates

### 1. General Template

The `general` template provides a clean, simple layout with:

- Optional header section with title, description, author, and date
- Main content area with standard markdown rendering
- Footer with Zetty Doc Hub branding

**Use case**: General documentation, guides, and standard content.

### 2. Effort Template

The `effort` template is designed for body of work tracking and effort planning with:

- Professional header with effort metadata and badge
- Structured layout with effort details sidebar
- Support for assignees, dates, status tracking
- Links and tags organization

**Use case**: Project planning, effort tracking, body of work documentation.

## Hidden Directories Feature

Zetty Doc Hub supports hiding specific directories from the side panel navigation while keeping the content accessible via direct links. This is perfect for private notes, drafts, or internal documentation.

### Configuration

Add directories to hide in your `.env` file:

```bash
# In .env file
VITE_NAVIGATION_HIDDEN_DIRECTORIES="src/docs/examples/hidden,src/docs/private"
```

For multiple directories, separate them with commas.

### Example

Try accessing this [hidden directory example](/examples/hidden/README) - it won't appear in the navigation but works via direct link!

**Use cases for hidden directories:**

- Daily notes and personal documentation
- Draft content not ready for general consumption  
- Internal team documentation
- Private project notes

## How to Use Templates

Add front matter to the top of your markdown or MDX files:

```yaml
---
title: "Your Document Title"
description: "Brief description of the document"
template: "template-name"
author: "Your Name"
date: "2024-01-15"
tags: ["tag1", "tag2"]
---
```

### Template Options

- `general` - Standard layout with header and footer
- `effort` - Body of work template for effort tracking and project planning

## Example Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Code Examples

```javascript
function createTemplate(name, config) {
  return {
    name,
    render: (content, frontMatter) => {
      return applyTemplate(content, frontMatter, config);
    }
  };
}
```

### Lists and Tables

| Template | Use Case | Features |
|----------|----------|----------|
| General | General docs | Simple, clean layout |
| Effort | Project planning | Metadata sidebar, effort tracking |

1. First item
2. Second item
3. Third item

> This is a blockquote example showing how content renders within the general template.

**Bold text** and *italic text* are rendered with proper styling.
