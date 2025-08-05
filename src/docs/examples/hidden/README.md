# Hidden Directory Example

This is an example of a hidden directory that won't appear in the side panel navigation but is still accessible via direct links.

## Purpose

Hidden directories are useful for:

- **Private notes**: Documents you want to keep in the repository but not show in navigation
- **Draft content**: Work-in-progress documentation
- **Internal documentation**: Content meant for contributors only
- **Personal notes**: Daily notes or scratch content

## How it works

Files in hidden directories:

- ✅ Are **accessible** via direct URL
- ✅ Can be **linked to** from other documents  
- ❌ Do **not appear** in the side panel navigation
- ❌ Are **not included** in search results (by design)

## Configuration

To hide directories, add them to the `hiddenDirectories` array in `site.config.json`:

```json
{
  "navigation": {
    "hiddenDirectories": ["src/docs/examples/hidden"]
  }
}
```

## Try it out

This file is hidden from navigation but you can still access it directly!