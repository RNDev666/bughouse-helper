# Store listing copy

Paste-ready text for the store submission forms. Keep this file in sync with what's published,
so a future version doesn't drift from the live listing.

## Name

TODO: My Extension

## Slug (AMO)

TODO: `my-extension` → https://addons.mozilla.org/firefox/addon/my-extension/

## Summary (AMO: 250 characters max, Chrome: 132 characters max)

> TODO: One or two sentences on what it does and for whom.

## Description

> TODO: **Lead with the benefit in one bold line.**
>
> What the user does, step by step, and what happens.
>
> **Why it's trustworthy.**
>
> - What it stores, and where.
> - No tracking, no analytics, no remote code. (Only say this if it's true.)
> - Open source under TODO: licence.

## Categories

- TODO

## Tags

TODO: `tag`, `tag`

## Privacy policy

> TODO: My Extension does not collect, transmit, or share any personal data.
>
> **What is stored.** TODO: e.g. your settings, saved in browser extension storage and synced
> through your own browser account. They are never sent to the developer or any third party.
>
> **What is sent over the network.** TODO: Nothing, or list each request and what triggers it.
>
> **Permissions.** TODO: Each permission, and why it's needed.

## Notes to reviewer

> The package is built from TypeScript with esbuild, and the full source is attached.
> REVIEWERS.md at the archive root has the build steps, a map from each bundled file to its
> sources, and the justification for each permission. `npm ci && npm run build:firefox`
> reproduces `dist/firefox/`, which is exactly the submitted package.

## Screenshots to capture

Take these at 1280×800 and upload them in this order.

1. TODO: The main feature in action.
2. TODO: The popup.
3. TODO: The options page.
