import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

export function docsAssetsPlugin(): Plugin {
  return {
    name: 'docs-assets',
    configureServer(server) {
      server.middlewares.use('/docs', (req, res, next) => {
        if (!req.url) {
          return next();
        }

        // Remove query parameters and decode URL
        const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
        
        // Resolve the file path in the docs directory
        const filePath = resolve(process.cwd(), 'src/docs', cleanUrl.substring(1));
        
        // Check if file exists
        if (existsSync(filePath)) {
          try {
            const fileContent = readFileSync(filePath);
            
            // Set appropriate content type based on file extension
            const ext = filePath.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
              'svg': 'image/svg+xml',
              'png': 'image/png',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'gif': 'image/gif',
              'webp': 'image/webp'
            };
            
            const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(fileContent);
          } catch (error) {
            console.error('Error serving docs asset:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        } else {
          res.statusCode = 404;
          res.end('File not found');
        }
      });
    }
  };
}
