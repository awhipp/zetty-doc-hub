/**
 * Utility functions for text manipulation and formatting
 */

/**
 * Converts a heading text to a URL-friendly slug ID
 * Handles special characters, numbers, and edge cases
 * 
 * @param text - The heading text to convert
 * @returns A kebab-case ID suitable for use as a DOM element ID
 * 
 * @example
 * generateHeadingId("Quick Start Guide") // "quick-start-guide"
 * generateHeadingId("File Types Supported") // "file-types-supported"
 * generateHeadingId("1. Use Descriptive Filenames") // "1-use-descriptive-filenames"
 * generateHeadingId("MDX Files (.mdx)") // "mdx-files-mdx"
 * generateHeadingId("What's Next?") // "whats-next"
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Checks if a generated ID is valid and unique
 * Falls back to a generic ID if needed
 * 
 * @param text - The original heading text
 * @param index - The heading index for fallback
 * @param existingIds - Set of already used IDs to ensure uniqueness
 * @returns A unique, valid DOM ID
 */
export function generateUniqueHeadingId(
  text: string, 
  index: number, 
  existingIds: Set<string> = new Set()
): string {
  let baseId = generateHeadingId(text);
  
  // If the generated ID is empty or invalid, use fallback
  if (!baseId || baseId.length === 0) {
    baseId = `heading-${index}`;
  }
  
  // Ensure uniqueness
  let finalId = baseId;
  let counter = 1;
  while (existingIds.has(finalId)) {
    finalId = `${baseId}-${counter}`;
    counter++;
  }
  
  existingIds.add(finalId);
  return finalId;
}