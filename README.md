# Browser Extension Template

A starting point for a Chrome + Firefox (Manifest V3) extension in TypeScript. You get a
background script, popup, options page and content script, all wired together and each easy to
remove. The build is a single readable script (`build.mjs`, using esbuild) with no framework.

Out of the box it runs a small demo across all four parts. The options page saves a greeting,
the popup sends it to the background, and the background passes it to the content script, which
shows it as a toast on the page.

## Quick start

```
npm install
npm run dev:chrome      # or dev:firefox
```

This builds into `dist/<browser>/` and opens a fresh browser profile with the extension loaded.
Every save under `src/`, `assets/` or the manifests rebuilds and reloads it. Extra flags go to
[web-ext run](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run),
for example `npm run dev:firefox -- --devtools`.

To load a build by hand:

- **Chrome:** go to `chrome://extensions`, turn on *Developer mode*, choose *Load unpacked* and pick `dist/chrome`.
- **Firefox:** go to `about:debugging#/runtime/this-firefox`, choose *Load Temporary Add-on* and pick `dist/firefox/manifest.json`.

## Using this template

1. On GitHub, click **Use this template**, then clone your new repo.
2. In `package.json`, set `name` and `description`.
3. In `manifest.json`, set `name`, `description` and `action.default_title`.
4. In `manifest.firefox.json`, set `gecko.id` to an id you own, e.g. `my-extension@yourdomain.com`.
   If your extension collects data, also update `data_collection_permissions`.
5. Replace `assets/icon.svg`. Every PNG size is generated from it.
6. In `content_scripts.matches`, list only the sites you need (see [Content script](#content-script)).
7. Replace the demo with your own code, then remove any parts you don't need (below).
8. Fill in the `TODO`s in `LICENSE`, `REVIEWERS.md` and `LISTING.md`.

## Layout

```
src/
  background/index.ts      background service worker (Chrome) / event page (Firefox)
  content/index.ts         runs inside web pages
  popup/                   toolbar popup: popup.html + index.ts
  options/                 settings page: options.html + index.ts
  shared/
    api.ts                 `api` = `browser` on Firefox, `chrome` on Chrome
    settings.ts            typed settings in storage.sync, with defaults
    messages.ts            typed messages between parts
    base.css               shared styles for popup + options, with light and dark themes
assets/icon.svg            the single icon source
manifest.json              manifest shared by both browsers
manifest.chrome.json       Chrome-only keys, merged over manifest.json
manifest.firefox.json      Firefox-only keys, merged over manifest.json
build.mjs                  the whole build
```

The build bundles every `src/<part>/index.ts` that exists into `<part>.js` and copies the
non-TypeScript files in that folder (HTML, CSS, images) next to it. It also rasterises the icon
and writes `manifest.json`, taking the `version` from `package.json`. The per-browser manifest
merge is shallow, so a top-level key in `manifest.<browser>.json` replaces the same key in
`manifest.json` entirely.

### Settings

To add a setting, add a field to `Settings` in `src/shared/settings.ts` and give it a default in
`DEFAULT_SETTINGS`. Use `getSettings()`, `setSettings({ ... })` and `onSettingsChanged(cb)` from
any part.

### Messages

To add a message, add a member to the `Message` union in `src/shared/messages.ts`.
`sendToBackground` and `sendToTab` reject if the receiving handler throws, or if no one is
listening (for example, a tab without the content script).

## Removing a part

Delete the folder, remove the matching manifest key, then run `npm run typecheck`. It will point
at any leftover references to the removed part.

| Part | Delete | Manifest change |
| --- | --- | --- |
| Popup | `src/popup/` | `manifest.json`: remove `action.default_popup` (keep `action` if you still want a toolbar button) |
| Options | `src/options/` | `manifest.json`: remove `options_ui`; remove the popup's *Settings* link |
| Content script | `src/content/` | `manifest.json`: remove `content_scripts` |
| Background | `src/background/` | remove `background` from **both** `manifest.chrome.json` and `manifest.firefox.json` |

Once the popup and options are gone, `src/shared/base.css` is unused, and so is
`src/shared/settings.ts` if nothing else reads settings. If only one part is left, it has no one
to message, so `src/shared/messages.ts` can go too.

### Content script

The demo's content script runs on `<all_urls>`. That's convenient, but at install time both
browsers will warn that the extension can "read and change all your data on all websites",
and store reviewers look at it more closely. List only the sites you actually need, for example
`"matches": ["https://*.example.com/*"]`.

If the script should run only when the user asks, remove `content_scripts` and inject it on
demand with the `activeTab` + `scripting` permissions instead.

## Release

```
npm version patch       # or minor / major — package.json is the only place the version lives
npm run package
```

`npm run package` runs the typecheck, both builds and `web-ext lint`, then writes these files to
`dist/`:

- `<name>-chrome-<version>.zip`: upload this to the Chrome Web Store.
- `<name>-firefox-<version>.zip`: upload this to addons.mozilla.org.
- `source.zip`: the source code for AMO review, made with `git archive`, so it contains only
  **committed** files.

Builds aren't minified unless `NODE_ENV=production` is set, which keeps AMO review simple.

`npm run sign` signs an unlisted Firefox build and uploads the source zip with it. It needs the
`WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` environment variables, which you get from
[AMO's API keys page](https://addons.mozilla.org/developers/addon/api/key/).

## Scripts

| Script | What it does |
| --- | --- |
| `dev:chrome`, `dev:firefox` | Build, watch, and run in a fresh browser profile with auto-reload |
| `build`, `build:chrome`, `build:firefox` | One-off build into `dist/` |
| `typecheck` | `tsc --noEmit` over `src/` and `build.mjs` |
| `lint` | `web-ext lint` on the Firefox build |
| `package` | Typecheck, build, lint, then create both store zips and the source zip |
| `sign` | Sign an unlisted Firefox build via AMO |

## License

[MIT](LICENSE)
