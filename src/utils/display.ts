/**
 * Shared display helpers used across multiple components.
 */

/** Convert a kebab/snake-case name to Title Case (strips file extension). */
export function humanize(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Return an emoji icon for a file-tree node based on its extension. */
export function getFileIcon(name: string, type: 'file' | 'folder', expanded = false): string {
  if (type === 'folder') return expanded ? '📂' : '📁';
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'md' || ext === 'mdx') return '📝';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return '🖼️';
  return '📄';
}

/** Render a star rating string from a numeric score. */
export function getStars(score: number, thresholds: [number, number] = [5, 10]): string {
  if (score >= thresholds[1]) return '★★★';
  if (score >= thresholds[0]) return '★★☆';
  if (score >= (thresholds[0] > 1 ? 1 : 0.1)) return '★☆☆';
  return '☆☆☆';
}
