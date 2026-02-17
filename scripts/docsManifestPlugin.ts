import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { resolve, relative, join, extname } from 'path';

interface DocEntry {
  path: string;        // relative path like "getting-started/install.md"
  content: string;     // raw file content
  type: 'md' | 'mdx' | 'image';
}

interface DocsManifest {
  files: string[];           // all file paths
  contents: Record<string, string>; // path -> content for md/mdx
  generatedAt: string;
}

const DOCS_DIR = 'docs';
const MD_EXTENSIONS = new Set(['.md', '.mdx']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

function walkDir(dir: string, base: string): DocEntry[] {
  const entries: DocEntry[] = [];
  if (!existsSync(dir)) return entries;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    const relPath = relative(base, fullPath).replace(/\\/g, '/');

    if (stat.isDirectory()) {
      entries.push(...walkDir(fullPath, base));
    } else {
      const ext = extname(item).toLowerCase();
      if (MD_EXTENSIONS.has(ext)) {
        entries.push({
          path: relPath,
          content: readFileSync(fullPath, 'utf-8'),
          type: ext === '.mdx' ? 'mdx' : 'md',
        });
      } else if (IMAGE_EXTENSIONS.has(ext)) {
        entries.push({
          path: relPath,
          content: '',
          type: 'image',
        });
      }
    }
  }
  return entries;
}

function buildManifest(docsRoot: string): DocsManifest {
  const entries = walkDir(docsRoot, docsRoot);
  const files: string[] = [];
  const contents: Record<string, string> = {};

  for (const entry of entries) {
    files.push(entry.path);
    if (entry.type === 'md' || entry.type === 'mdx') {
      contents[entry.path] = entry.content;
    }
  }

  return {
    files: files.sort(),
    contents,
    generatedAt: new Date().toISOString(),
  };
}

export function docsManifestPlugin() {
  const virtualModuleId = 'virtual:docs-manifest';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  let docsRoot: string;
  let projectRoot: string;
  let syncReadme: boolean;

  /** Copy the root README.md into docs/, rewriting `docs/` link prefixes. */
  function syncRootReadme() {
    if (!syncReadme) return;
    const src = join(projectRoot, 'README.md');
    const dest = join(docsRoot, 'README.md');
    if (existsSync(src)) {
      mkdirSync(docsRoot, { recursive: true });
      // Strip the leading "docs/" from markdown link/image paths so they
      // resolve correctly when the file lives inside docs/ itself.
      const content = readFileSync(src, 'utf-8')
        .replace(/(\[.*?\]\()docs\//g, '$1');
      writeFileSync(dest, content, 'utf-8');
    }
  }

  return {
    name: 'docs-manifest',
    configResolved(config: { root: string }) {
      projectRoot = config.root;
      docsRoot = resolve(config.root, DOCS_DIR);
      // Default to true; set SYNC_ROOT_README=false to skip copying
      syncReadme = (process.env.SYNC_ROOT_README ?? 'true') === 'true';
      syncRootReadme();
    },
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const manifest = buildManifest(docsRoot);
        return `export default ${JSON.stringify(manifest)};`;
      }
    },
    // Copy images from /docs to /dist/docs during build
    writeBundle() {
      if (!existsSync(docsRoot)) return;
      const entries = walkDir(docsRoot, docsRoot);
      for (const entry of entries) {
        if (entry.type === 'image') {
          const src = join(docsRoot, entry.path);
          const dest = join('dist', 'docs', entry.path);
          const destDir = join('dist', 'docs', entry.path, '..');
          mkdirSync(resolve(destDir), { recursive: true });
          copyFileSync(src, dest);
        }
      }
    },
    // In dev, serve docs files
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use((req: { url?: string }, res: { writeHead: Function; end: Function; setHeader: Function }, next: Function) => {
        if (req.url?.startsWith('/api/docs/')) {
          const docsPath = req.url.replace('/api/docs/', '');

          if (docsPath === 'manifest') {
            const manifest = buildManifest(docsRoot);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest));
            return;
          }

          if (docsPath.startsWith('file/')) {
            const filePath = decodeURIComponent(docsPath.replace('file/', ''));
            const fullPath = resolve(docsRoot, filePath);
            if (existsSync(fullPath)) {
              const content = readFileSync(fullPath, 'utf-8');
              res.setHeader('Content-Type', 'text/plain');
              res.end(content);
              return;
            }
            res.writeHead(404);
            res.end('Not found');
            return;
          }
        }
        next();
      });
    },
    handleHotUpdate(ctx: { file: string; server: { ws: { send: Function } } }) {
      // Re-sync when root README changes
      const rootReadme = resolve(projectRoot, 'README.md');
      if (ctx.file === rootReadme) {
        syncRootReadme();
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
      if (ctx.file.startsWith(docsRoot)) {
        // When a docs file changes, trigger full reload
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
