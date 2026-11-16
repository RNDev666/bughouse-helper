# Notes for AMO reviewers

<!-- TODO: Keep this file accurate for every submission. AMO reviewers read it alongside source.zip. -->

The submitted package is built from TypeScript with esbuild. The source is included, as AMO's
source code submission policy requires.

## Build environment

- Node.js 20 or newer (`node --version`)
- npm 10 or newer

## Steps to reproduce the submitted package

```
npm ci
npm run build:firefox
```

The unminified output in `dist/firefox/` is exactly the contents of the submitted package.
`npm run package` zips that same directory using `web-ext build`. The build is not minified
because `build.mjs` only minifies when `NODE_ENV=production`, and the commands above don't set it.

## Source map of the bundle

| Submitted file | Built from |
| --- | --- |
| `background.js` | `src/background/index.ts` and its imports from `src/shared/` |
| `content.js` | `src/content/index.ts` and its imports from `src/shared/` |
| `popup.js`, `popup.html` | `src/popup/` (HTML copied verbatim) |
| `options.js`, `options.html` | `src/options/` (HTML copied verbatim) |
| `base.css` | copied verbatim from `src/shared/base.css` |
| `icons/icon-*.png` | rasterised from `assets/icon.svg` by `build.mjs` using sharp |
| `manifest.json` | `manifest.json` merged with `manifest.firefox.json`, `version` from `package.json` |

<!-- TODO: Remove rows for any parts you deleted. -->

## Permissions

<!-- TODO: Justify every permission and host match. Reviewers check each one. -->

- `storage`: holds the user's settings in `storage.sync`.
- Content script on `TODO: matches`: TODO: what it does on those pages, and why it needs them.

## Network requests

TODO: List every request the extension makes and where in the code it happens, or state "None."

## Data collection

TODO: None. `browser_specific_settings.gecko.data_collection_permissions.required` is `["none"]`.
