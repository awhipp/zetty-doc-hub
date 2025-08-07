import React from 'react';
import matter from 'gray-matter';
import type { ParsedMarkdown, FrontMatter } from '../types/template';
import { isMdxFile } from './fileUtils';
import { getAvailableFilePaths } from './fileTree';

// Real markdown file loader using Vite's import.meta.glob
// Get markdown files as raw text (for .md files)
const markdownModules = import.meta.glob('/src/docs/**/*.md', { 
  query: '?raw',
  import: 'default'
});

// Get MDX files as compiled React components (for .mdx files)
const mdxModules = import.meta.glob('/src/docs/**/*.mdx');

// Get MDX files as raw text (for DocumentStats and content analysis)
const mdxRawModules = import.meta.glob('/src/docs/**/*.mdx', { 
  query: '?raw',
  import: 'default'
});

export const loadMarkdownContent = async (filePath: string): Promise<ParsedMarkdown> => {
  // MDX files should not be loaded as raw text - they're compiled React components
  if (isMdxFile(filePath)) {
    throw new Error('MDX files should be loaded as React components, not raw text');
  }
  
  try {
    // Check if we have a module loader for this markdown file path
    const moduleLoader = markdownModules[filePath];
    
    if (moduleLoader) {
      const rawContent = await moduleLoader();
      const parsed = matter(rawContent as string);
      
      return {
        content: parsed.content,
        frontMatter: parsed.data as FrontMatter
      };
    } else {
      // File not found - list available files for debugging
      const availableFiles = Object.keys(markdownModules);
      console.error('Available markdown files:', availableFiles);
      console.error('Requested file:', filePath);
      
      const errorContent = `# File Not Found

The requested file \`${filePath}\` could not be loaded.

**Available markdown files:**
${availableFiles.map(file => `- ${file}`).join('\n')}

**Troubleshooting:**
- Check if the file path in the file tree matches exactly
- Verify the file exists in src/docs/ directory
- Make sure the file has a .md extension (for .mdx files, they're handled differently)`;

      return {
        content: errorContent,
        frontMatter: {}
      };
    }
  } catch (error) {
    console.error('Error loading markdown file:', error);
    const errorContent = `# File Not Found

The requested file \`${filePath}\` could not be loaded.

**Error details:** ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting:**
- Check if the file exists in the file system
- Verify the file path is correct
- Ensure the file has proper read permissions`;

    return {
      content: errorContent,
      frontMatter: {}
    };
  }
};

// Function to load MDX components
export const loadMdxComponent = async (filePath: string): Promise<React.ComponentType> => {
  try {
    // Check if we have a module loader for this MDX file path
    const moduleLoader = mdxModules[filePath];
    
    if (moduleLoader) {
      const module = await moduleLoader();
      // MDX files export their content as the default export
      return (module as { default: React.ComponentType }).default;
    } else {
      // File not found - list available files for debugging
      const availableMdxFiles = Object.keys(mdxModules);
      console.error('Available MDX files:', availableMdxFiles);
      console.error('Requested MDX file:', filePath);
      
      // Return a fallback component that shows the error
      return () => React.createElement(
        'div',
        null,
        React.createElement('h1', null, 'MDX File Not Found'),
        React.createElement('p', null, `The requested MDX file ${filePath} could not be loaded.`),
        React.createElement('h3', null, 'Available MDX files:'),
        React.createElement(
          'ul',
          null,
          availableMdxFiles.map(file => React.createElement('li', { key: file }, file))
        )
      );
    }
  } catch (error) {
    console.error('Error loading MDX file:', error);
    
    // Return a fallback component that shows the error
    return () => React.createElement(
      'div',
      null,
      React.createElement('h1', null, 'MDX File Load Error'),
      React.createElement('p', null, `The requested MDX file ${filePath} could not be loaded.`),
      React.createElement('p', null, React.createElement('strong', null, 'Error details: '), error instanceof Error ? error.message : 'Unknown error')
    );
  }
};

// Function to extract front matter from MDX files
export const loadMdxFrontMatter = async (filePath: string): Promise<FrontMatter> => {
  try {
    // Check if we have a module loader for this MDX file path
    const moduleLoader = mdxRawModules[filePath];
    
    if (moduleLoader) {
      const rawContent = await moduleLoader();
      const parsed = matter(rawContent as string);
      
      return parsed.data as FrontMatter;
    } else {
      console.warn(`MDX file not found for frontmatter parsing: ${filePath}`);
      return {};
    }
  } catch (error) {
    console.error('Error loading MDX front matter:', error);
    return {};
  }
};

// Function to load raw MDX content for DocumentStats
export const loadMdxRawContent = async (filePath: string): Promise<string> => {
  try {
    // Check if we have a module loader for this MDX file path
    const moduleLoader = mdxRawModules[filePath];
    
    if (moduleLoader) {
      const rawContent = await moduleLoader();
      // Remove front matter and clean up MDX-specific syntax for stats
      const content = (rawContent as string)
        .replace(/^---[\s\S]*?---\n?/, '') // Remove front matter
        .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '') // Remove imports
        .replace(/export\s+.*?(?=\n\n|\n#|\n$)/gs, '') // Remove exports
        .replace(/<[^>]*>/g, '') // Remove JSX tags
        .replace(/{\s*\/\*[\s\S]*?\*\/\s*}/g, '') // Remove JSX comments
        .trim();
      
      return content;
    } else {
      console.warn(`Raw MDX file not found: ${filePath}`);
      return '';
    }
  } catch (error) {
    console.error('Error loading raw MDX content:', error);
    return '';
  }
};

// Debug function to see what files are available
export const getAvailableFiles = (): string[] => {
  return getAvailableFilePaths();
};
