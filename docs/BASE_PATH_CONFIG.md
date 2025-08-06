# Base Path Configuration Guide

This file explains how to configure the base path for different deployment scenarios.

## Environment Variables

Set `VITE_BASE_PATH` to configure the base path for your deployment:

### Local Development
```bash
VITE_BASE_PATH=/
```

### GitHub Pages (with repository name)
```bash
VITE_BASE_PATH=/repository-name/
```

### Subdirectory Deployment
```bash
VITE_BASE_PATH=/my-docs/
```

### Custom Domain (root deployment)
```bash
VITE_BASE_PATH=/
```

## Configuration Files

The base path is used in several places:

1. **vite.config.ts** - Sets the `base` option for Vite
2. **site.config.json** - Can override the deployment.basePath
3. **Environment variables** - `VITE_BASE_PATH` takes precedence
4. **Generated HTML files** - 404.html and index.html use the configured base path

## Build Process

The build process automatically:
1. Reads the `VITE_BASE_PATH` environment variable
2. Generates `404.html` and `index.html` with the correct base path
3. Ensures all asset links use the correct base path

## GitHub Actions

The `.github/workflows/deploy.yml` file sets:
```yaml
env:
  VITE_BASE_PATH: /zetty-doc-hub/
```

Update this to match your repository name or deployment path.

## Development vs Production

- **Development**: Usually use `VITE_BASE_PATH=/` for local development
- **Production**: Set to your actual deployment path

## Verification

After building, check that:
1. `dist/404.html` contains the correct base path in script and links
2. `dist/index.html` contains the correct base path in script src
3. All assets are accessible at the expected paths
