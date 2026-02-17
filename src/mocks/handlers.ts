/**
 * MSW (Mock Service Worker) handlers for the docs API.
 *
 * These intercept all /api/docs/* requests and serve content from the
 * virtual:docs-manifest that Vite bakes in at build time.
 *
 * To migrate to a real backend: remove MSW, point fetch() at your
 * Lambda / API Gateway, and serve markdown from S3.
 */
import { http, HttpResponse } from 'msw';
import type {
  DocsManifest,
  FileTreeNode,
  SearchResult,
  TagInfo,
  Backlink,
  RelatedContentData,
  GraphData,
  GraphNode,
  GraphEdge,
  QAAnswer,
  QASource,
  FrontMatter,
} from '@/types';
import { humanize } from '@/utils/display';

import { parseFrontMatter } from '@/utils/parseFrontMatter';

// Import the build-time manifest (inlined by Vite plugin)
import manifest from 'virtual:docs-manifest';

const typedManifest = manifest as DocsManifest;

// ── helpers ────────────────────────────────────────────────────────────

function isPathHidden(filePath: string, hiddenDirs: string[]): boolean {
  return hiddenDirs.some(dir => filePath.startsWith(dir));
}

function getExtension(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot + 1).toLowerCase() : '';
}

function isMarkdown(path: string): boolean {
  const ext = getExtension(path);
  return ext === 'md' || ext === 'mdx';
}

function isImage(path: string): boolean {
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(getExtension(path));
}

function titleFromPath(p: string): string {
  const name = p.split('/').pop() || p;
  return humanize(name);
}

function extractTitle(content: string): string | null {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function extractHeadings(content: string): string[] {
  const re = /^#{1,6}\s+(.+)$/gm;
  const out: string[] = [];
  let m;
  while ((m = re.exec(content))) out.push(m[1].trim());
  return out;
}

function extractLinks(content: string): Array<{ url: string; linkText: string; context?: string }> {
  const re = /\[([^\]]*)\]\(([^)]+)\)/g;
  const links: Array<{ url: string; linkText: string; context?: string }> = [];
  let m;
  while ((m = re.exec(content))) {
    const url = m[2];
    // Skip external, anchors, and images
    if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:')) continue;
    const start = Math.max(0, m.index - 50);
    const end = Math.min(content.length, m.index + m[0].length + 50);
    links.push({
      linkText: m[1],
      url,
      context: content.slice(start, end).replace(/\n+/g, ' ').trim(),
    });
  }
  return links;
}

function resolveFilePath(sourceFile: string, linkUrl: string, allFiles: string[]): string {
  // Remove anchor
  const url = linkUrl.split('#')[0];
  if (!url) return '';

  // Resolve relative to source directory
  const sourceDir = sourceFile.split('/').slice(0, -1).join('/');
  let resolved: string;
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    const parts = [...(url.startsWith('/') ? [] : sourceDir.split('/')), ...url.split('/')];
    const stack: string[] = [];
    for (const p of parts) {
      if (p === '.' || p === '') continue;
      if (p === '..') stack.pop();
      else stack.push(p);
    }
    resolved = stack.join('/');
  } else {
    resolved = sourceDir ? `${sourceDir}/${url}` : url;
  }

  // Try exact, then with extensions
  if (allFiles.includes(resolved)) return resolved;
  for (const ext of ['.md', '.mdx', '.png', '.jpg', '.svg']) {
    if (allFiles.includes(resolved + ext)) return resolved + ext;
  }
  // Try as directory index
  for (const idx of ['README.md', 'index.md', 'README.mdx', 'index.mdx']) {
    const tryPath = `${resolved}/${idx}`;
    if (allFiles.includes(tryPath)) return tryPath;
  }
  return resolved;
}

// ── cached indexes ─────────────────────────────────────────────────────

interface SearchIndex {
  filePath: string;
  title: string;
  content: string;
  headings: string[];
}

let searchIndex: SearchIndex[] | null = null;
let tagsCache: TagInfo[] | null = null;
let backlinksCache: Record<string, Backlink[]> | null = null;
let graphCache: GraphData | null = null;

function getMarkdownFiles(hiddenDirs: string[] = []): string[] {
  return typedManifest.files.filter(
    f => isMarkdown(f) && !isPathHidden(f, hiddenDirs),
  );
}

function buildSearchIndex(hiddenDirs: string[] = []): SearchIndex[] {
  if (searchIndex) return searchIndex;
  const files = getMarkdownFiles(hiddenDirs);
  searchIndex = files.map(filePath => {
    const raw = typedManifest.contents[filePath] || '';
    const { content, frontMatter } = parseFrontMatter(raw);
    const title =
      (frontMatter.title as string) || extractTitle(content) || titleFromPath(filePath);
    return {
      filePath,
      title,
      content: content.toLowerCase(),
      headings: extractHeadings(content).map(h => h.toLowerCase()),
    };
  });
  return searchIndex;
}

function doSearch(query: string, maxResults: number, hiddenDirs: string[] = []): SearchResult[] {
  const index = buildSearchIndex(hiddenDirs);
  if (!query.trim()) return [];
  const term = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const item of index) {
    let score = 0;
    let matchType: SearchResult['matchType'] = 'content';
    let excerpt = '';

    if (item.title.toLowerCase().includes(term)) {
      score += 10;
      matchType = 'title';
      excerpt = item.title;
    }

    const headingMatch = item.headings.find(h => h.includes(term));
    if (headingMatch) {
      score += 5;
      if (matchType === 'content') matchType = 'heading';
      if (!excerpt) excerpt = headingMatch;
    }

    if (item.content.includes(term)) {
      score += 1;
      if (!excerpt) {
        const idx = item.content.indexOf(term);
        const s = Math.max(0, idx - 50);
        const e = Math.min(item.content.length, idx + term.length + 50);
        excerpt = (s > 0 ? '...' : '') + item.content.slice(s, e) + (e < item.content.length ? '...' : '');
      }
    }

    // Fuzzy fallback
    if (score === 0) {
      let qi = 0;
      for (let i = 0; i < item.title.toLowerCase().length && qi < term.length; i++) {
        if (item.title.toLowerCase()[i] === term[qi]) qi++;
      }
      const fuzzy = qi / term.length;
      if (fuzzy > 0.5) {
        score = fuzzy;
        matchType = 'title';
        excerpt = item.title;
      }
    }

    if (score >= 0.1) results.push({ filePath: item.filePath, title: item.title, excerpt, score, matchType });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function buildTags(hiddenDirs: string[] = []): TagInfo[] {
  if (tagsCache) return tagsCache;
  const tagMap = new Map<string, TagInfo>();
  const files = getMarkdownFiles(hiddenDirs);

  for (const filePath of files) {
    const raw = typedManifest.contents[filePath] || '';
    const { frontMatter } = parseFrontMatter(raw);
    const tags = (frontMatter.tags as string[]) || [];
    const title = (frontMatter.title as string) || titleFromPath(filePath);

    for (const tag of tags) {
      const normalized = tag.toLowerCase().trim().replace(/\s+/g, '-');
      if (!tagMap.has(normalized)) {
        tagMap.set(normalized, { name: normalized, count: 0, files: [] });
      }
      const info = tagMap.get(normalized)!;
      info.count++;
      info.files.push({ filePath, title });
    }
  }
  tagsCache = Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  return tagsCache;
}

function buildBacklinks(hiddenDirs: string[] = []): Record<string, Backlink[]> {
  if (backlinksCache) return backlinksCache;
  const index: Record<string, Backlink[]> = {};
  const files = getMarkdownFiles(hiddenDirs);
  const allFiles = typedManifest.files;

  for (const sourceFile of files) {
    const raw = typedManifest.contents[sourceFile] || '';
    const { content, frontMatter } = parseFrontMatter(raw);
    const sourceTitle = (frontMatter.title as string) || titleFromPath(sourceFile);
    const links = extractLinks(content);

    const byTarget = new Map<string, { texts: string[]; contexts: string[]; count: number }>();
    for (const link of links) {
      const target = resolveFilePath(sourceFile, link.url, allFiles);
      if (!allFiles.includes(target)) continue;
      if (!byTarget.has(target)) byTarget.set(target, { texts: [], contexts: [], count: 0 });
      const d = byTarget.get(target)!;
      d.texts.push(link.linkText);
      if (link.context) d.contexts.push(link.context);
      d.count++;
    }

    for (const [target, data] of byTarget) {
      if (!index[target]) index[target] = [];
      index[target].push({
        sourceFile,
        sourceTitle,
        sourceDescription: frontMatter.description as string | undefined,
        linkText: data.texts[0],
        context: data.contexts[0],
        referenceCount: data.count,
      });
    }
  }

  backlinksCache = index;
  return index;
}

function buildRelatedContent(filePath: string, hiddenDirs: string[] = []): RelatedContentData {
  const bl = buildBacklinks(hiddenDirs);
  const backlinks = bl[filePath] || [];
  const allFiles = typedManifest.files;
  const outgoingLinks: RelatedContentData['outgoingLinks'] = [];

  const raw = typedManifest.contents[filePath] || '';
  if (raw) {
    const { content } = parseFrontMatter(raw);
    const links = extractLinks(content);
    for (const link of links) {
      const target = resolveFilePath(filePath, link.url, allFiles);
      if (!allFiles.includes(target) || !isMarkdown(target)) continue;
      const tRaw = typedManifest.contents[target] || '';
      const { frontMatter: tFm } = parseFrontMatter(tRaw);
      outgoingLinks.push({
        filePath: target,
        title: (tFm.title as string) || titleFromPath(target),
        linkText: link.linkText,
      });
    }
  }

  // Related by tags
  const { frontMatter: myFm } = parseFrontMatter(raw);
  const myTags = ((myFm.tags as string[]) || []).map(t => t.toLowerCase().trim());
  const byTags: RelatedContentData['byTags'] = [];

  if (myTags.length > 0) {
    const allTags = buildTags(hiddenDirs);
    const relatedMap = new Map<string, { sharedTags: Set<string>; title: string }>();

    for (const tag of allTags) {
      if (!myTags.includes(tag.name)) continue;
      for (const file of tag.files) {
        if (file.filePath === filePath) continue;
        if (!relatedMap.has(file.filePath)) {
          relatedMap.set(file.filePath, { sharedTags: new Set(), title: file.title });
        }
        relatedMap.get(file.filePath)!.sharedTags.add(tag.name);
      }
    }

    // Group by shared tag sets
    const groups = new Map<string, { sharedTags: string[]; files: Array<{ filePath: string; title: string }> }>();
    for (const [fp, data] of relatedMap) {
      const key = [...data.sharedTags].sort().join(',');
      if (!groups.has(key)) groups.set(key, { sharedTags: [...data.sharedTags].sort(), files: [] });
      groups.get(key)!.files.push({ filePath: fp, title: data.title });
    }
    byTags.push(...groups.values());
  }

  return { backlinks, outgoingLinks, byTags };
}

function buildGraph(hiddenDirs: string[] = []): GraphData {
  if (graphCache) return graphCache;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const allFiles = typedManifest.files;

  // Document nodes
  for (const fp of getMarkdownFiles(hiddenDirs)) {
    const raw = typedManifest.contents[fp] || '';
    const { frontMatter } = parseFrontMatter(raw);
    nodes.push({
      id: fp,
      label: (frontMatter.title as string) || titleFromPath(fp),
      type: 'document',
      filePath: fp,
      description: frontMatter.description as string | undefined,
    });
    nodeIds.add(fp);
  }

  // Image nodes
  for (const fp of allFiles.filter(f => isImage(f) && !isPathHidden(f, hiddenDirs))) {
    nodes.push({ id: fp, label: titleFromPath(fp), type: 'image', filePath: fp });
    nodeIds.add(fp);
  }

  // Link edges
  for (const fp of getMarkdownFiles(hiddenDirs)) {
    const raw = typedManifest.contents[fp] || '';
    const { content } = parseFrontMatter(raw);
    const links = extractLinks(content);
    for (const link of links) {
      const target = resolveFilePath(fp, link.url, allFiles);
      if (!nodeIds.has(target)) continue;
      const eid = `link-${fp}-${target}`;
      if (edgeIds.has(eid)) continue;
      edges.push({ id: eid, source: fp, target, type: 'link', label: link.linkText });
      edgeIds.add(eid);
    }
  }

  // Tag nodes + edges
  const tags = buildTags(hiddenDirs);
  for (const tag of tags) {
    if (tag.files.length === 0) continue;
    const tagId = `tag-${tag.name}`;
    nodes.push({ id: tagId, label: tag.name, type: 'tag', tagName: tag.name, description: `${tag.count} docs` });
    nodeIds.add(tagId);
    for (const file of tag.files) {
      if (!nodeIds.has(file.filePath)) continue;
      const eid = `tag-${file.filePath}-${tagId}`;
      if (edgeIds.has(eid)) continue;
      edges.push({ id: eid, source: file.filePath, target: tagId, type: 'tag' });
      edgeIds.add(eid);
    }
  }

  graphCache = { nodes, edges };
  return graphCache;
}

function generateQAAnswer(question: string, hiddenDirs: string[] = []): QAAnswer {
  const stopWords = new Set([
    'what', 'how', 'where', 'when', 'why', 'who', 'which', 'can', 'could', 'should', 'would',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'shall', 'may', 'might', 'must', 'the', 'a', 'an', 'to', 'of', 'in', 'on', 'at',
    'by', 'for', 'with', 'about', 'into', 'through', 'during', 'before', 'after',
  ]);

  const keyTerms = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .join(' ');

  const results = doSearch(keyTerms, 6, hiddenDirs);
  const sources: QASource[] = results.slice(0, 3).map(r => ({
    filePath: r.filePath,
    title: r.title,
    excerpt: r.excerpt,
    relevanceScore: r.score,
  }));

  let text: string;
  if (sources.length === 0) {
    text = "I couldn't find specific information to answer your question. Try rephrasing or searching for specific terms.";
  } else {
    const lq = question.toLowerCase();
    if (lq.includes('how to') || lq.includes('how do') || lq.includes('how can')) {
      text = `Based on the documentation:\n\n${sources[0].excerpt}\n\nFor more, see "${sources[0].title}".`;
    } else if (lq.includes('what is') || lq.includes('what are')) {
      text = `According to the documentation:\n\n${sources[0].excerpt}\n\nMore details in "${sources[0].title}".`;
    } else {
      text = `Based on the documentation:\n\n${sources.map(s => s.excerpt).join('\n\n')}\n\nSee ${sources.map(s => `"${s.title}"`).join(', ')}.`;
    }
  }

  const avg = sources.length ? sources.reduce((s, x) => s + x.relevanceScore, 0) / sources.length : 0;
  const confidence = Math.min(avg * 0.1 + 0.2 + Math.min(sources.length / 3, 1) * 0.3, 1);

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    questionId: Date.now().toString(36),
    text,
    sources,
    confidence,
    timestamp: new Date(),
  };
}

// ── file tree builder ──────────────────────────────────────────────────

function buildFileTree(hiddenDirs: string[] = []): FileTreeNode[] {
  const roots: FileTreeNode[] = [];

  const sorted = [...typedManifest.files]
    .filter(f => !isPathHidden(f, hiddenDirs))
    .sort();

  for (const filePath of sorted) {
    const parts = filePath.split('/');
    let level = roots;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      if (isFile) {
        level.push({ name: part, path: currentPath, type: 'file' });
      } else {
        let folder = level.find(n => n.name === part && n.type === 'folder');
        if (!folder) {
          folder = { name: part, path: currentPath, type: 'folder', children: [] };
          level.push(folder);
        }
        level = folder.children!;
      }
    }
  }

  // Sort: folders first then alpha
  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => { if (n.children) sortNodes(n.children); });
  };
  sortNodes(roots);
  return roots;
}

// ── MSW Request Handlers ───────────────────────────────────────────────

export const handlers = [
  // GET /api/docs/manifest
  http.get('/api/docs/manifest', () => {
    return HttpResponse.json(typedManifest);
  }),

  // GET /api/docs/file/:path
  http.get('/api/docs/file/:path', ({ params }) => {
    const filePath = decodeURIComponent(params.path as string);
    const content = typedManifest.contents[filePath];
    if (content === undefined) {
      return new HttpResponse('Not found', { status: 404 });
    }
    return new HttpResponse(content, { headers: { 'Content-Type': 'text/plain' } });
  }),

  // GET /api/docs/tree
  http.get('/api/docs/tree', ({ request }) => {
    const url = new URL(request.url);
    const hidden = JSON.parse(url.searchParams.get('hidden') || '[]');
    return HttpResponse.json(buildFileTree(hidden));
  }),

  // GET /api/docs/search
  http.get('/api/docs/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const max = parseInt(url.searchParams.get('max') || '10', 10);
    return HttpResponse.json(doSearch(q, max));
  }),

  // GET /api/docs/tags
  http.get('/api/docs/tags', () => {
    return HttpResponse.json(buildTags());
  }),

  // GET /api/docs/backlinks
  http.get('/api/docs/backlinks', ({ request }) => {
    const url = new URL(request.url);
    const file = url.searchParams.get('file') || '';
    const bl = buildBacklinks();
    return HttpResponse.json(bl[file] || []);
  }),

  // GET /api/docs/related
  http.get('/api/docs/related', ({ request }) => {
    const url = new URL(request.url);
    const file = url.searchParams.get('file') || '';
    return HttpResponse.json(buildRelatedContent(file));
  }),

  // GET /api/docs/graph
  http.get('/api/docs/graph', () => {
    return HttpResponse.json(buildGraph());
  }),

  // POST /api/docs/qa
  http.post('/api/docs/qa', async ({ request }) => {
    const body = (await request.json()) as { question: string };
    return HttpResponse.json(generateQAAnswer(body.question));
  }),
];
