import type { FrontMatter } from '@/types';

/**
 * Lightweight YAML-like front-matter parser.
 *
 * Supports flat key-value pairs, inline arrays `[a, b]`, and
 * multi-line dash arrays.  Used by both the client-side renderer
 * and the MSW mock handlers.
 */
export function parseFrontMatter(raw: string): { content: string; frontMatter: FrontMatter } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { content: raw, frontMatter: {} };

  const yamlStr = match[1];
  const content = match[2];
  const frontMatter: FrontMatter = {};

  const lines = yamlStr.split('\n');
  let currentKey = '';
  let currentArray: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item
    if (trimmed.startsWith('- ') && currentKey) {
      if (!currentArray) currentArray = [];
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, '');
      currentArray.push(val);
      frontMatter[currentKey] = currentArray;
      continue;
    }

    // Flush array
    if (currentArray) {
      currentArray = null;
    }

    const kvMatch = trimmed.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim().replace(/^["']|["']$/g, '');

      if (val === '') continue; // Next lines might be array

      // Inline array [a, b, c]
      if (val.startsWith('[') && val.endsWith(']')) {
        frontMatter[currentKey] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
      } else if (val === 'true') {
        frontMatter[currentKey] = true as unknown as string;
      } else if (val === 'false') {
        frontMatter[currentKey] = false as unknown as string;
      } else {
        frontMatter[currentKey] = val;
      }
    }
  }

  return { content, frontMatter };
}
