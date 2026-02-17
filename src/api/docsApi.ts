/**
 * Docs API client.
 *
 * In development / static deployment this hits MSW which serves from the
 * embedded virtual:docs-manifest.  Replace the base URL or swap the
 * implementation entirely to point at a Lambda / S3 backend.
 */
import type {
  FileTreeNode,
  SearchResult,
  TagInfo,
  Backlink,
  RelatedContentData,
  GraphData,
  QAAnswer,
} from '@/types';

const API_BASE = '/api/docs';

// ── single file ────────────────────────────────────────────────────────
export async function fetchDocFile(path: string): Promise<string> {
  const res = await fetch(`${API_BASE}/file/${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.text();
}

// ── file tree ──────────────────────────────────────────────────────────
export async function fetchFileTree(hiddenDirs: string[] = []): Promise<FileTreeNode[]> {
  const res = await fetch(`${API_BASE}/tree?hidden=${encodeURIComponent(JSON.stringify(hiddenDirs))}`);
  if (!res.ok) throw new Error('Failed to fetch file tree');
  return res.json();
}

// ── search ─────────────────────────────────────────────────────────────
export async function fetchSearchResults(
  query: string,
  maxResults = 10,
): Promise<SearchResult[]> {
  const res = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(query)}&max=${maxResults}`,
  );
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

// ── tags ───────────────────────────────────────────────────────────────
export async function fetchTags(): Promise<TagInfo[]> {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

// ── backlinks / related ────────────────────────────────────────────────
export async function fetchBacklinks(filePath: string): Promise<Backlink[]> {
  const res = await fetch(`${API_BASE}/backlinks?file=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error('Failed to fetch backlinks');
  return res.json();
}

export async function fetchRelatedContent(filePath: string): Promise<RelatedContentData> {
  const res = await fetch(`${API_BASE}/related?file=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error('Failed to fetch related content');
  return res.json();
}

// ── graph ──────────────────────────────────────────────────────────────
export async function fetchGraphData(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
}

// ── Q&A ────────────────────────────────────────────────────────────────
export async function fetchQAAnswer(question: string): Promise<QAAnswer> {
  const res = await fetch(`${API_BASE}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Q&A failed');
  return res.json();
}

// ── frontmatter helper (re-exported from shared utility) ───────────────
export { parseFrontMatter } from '@/utils/parseFrontMatter';
