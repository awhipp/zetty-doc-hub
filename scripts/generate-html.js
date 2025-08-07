import { writeFileSync } from 'fs';
import { loadEnv } from 'vite';

// Load environment variables
const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const basePath = env.VITE_BASE_PATH || '/';

// Generate 404.html with correct base path
function generate404Html() {
    const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${basePath === '/' ? '/' : basePath}favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zetty Doc Hub</title>
    <script>
      // GitHub Pages SPA fallback
      // Store the attempted path and redirect to index.html
      // Only store redirect if it's not the base path
      var basePath = '${basePath}';
      if (location.pathname !== basePath) {
        sessionStorage.redirect = location.pathname + location.search + location.hash;
      }
      location.replace(basePath);
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

    writeFileSync('public/404.html', template);
    console.log(`Generated 404.html with base path: ${basePath}`);
}

// Generate index.html template with correct base path and favicon
function generateIndexHtml() {
    const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${basePath === '/' ? '/' : basePath}favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zetty Doc Hub</title>
    <script>
      // GitHub Pages SPA redirect handler
      // Restore the original URL if we were redirected from 404.html
      (function() {
        var redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;
        if (redirect && redirect !== location.pathname) {
          history.replaceState(null, null, redirect);
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${basePath === '/' ? '/' : basePath}src/main.tsx"></script>
  </body>
</html>`;

    writeFileSync('index.html', template);
    console.log(`Generated index.html with base path: ${basePath}`);
}

// Main execution
function main() {
    console.log('Generating HTML files with base path configuration...');
    console.log(`Using base path: ${basePath}`);

    generate404Html();
    generateIndexHtml();

    console.log('HTML generation complete!');
}

main();
