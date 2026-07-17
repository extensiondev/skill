# Project Structure and File Patterns

Only `manifest.json` is required. The framework (Extension.js under the hood)
auto-detects entry points from the manifest and configures React, Vue,
Svelte, Preact, or vanilla JS/TS based on what the code imports. Rspack does
the bundling; customize via `extension.config.js` only when needed.

## Canonical layout

```
my-extension/
  src/
    manifest.json          Required. The source of truth.
    background.ts          Service worker (Chromium) / background script (Firefox)
    content/
      scripts.tsx          Content script entry
      styles.css
    sidebar/               Any UI surface follows this shape
      index.html
      scripts.tsx
      styles.css
    images/
      icon.png
    pages/                 Special folder: HTML pages not in the manifest
    scripts/               Special folder: scripts not in the manifest
  public/                  Special folder: static files copied verbatim
  _locales/                i18n messages at project root, NOT src/ (see below)
  extension.config.js      Optional build config
  extension-env.d.ts       Auto-generated types
  package.json
  tsconfig.json
```

Manifest paths (icons, HTML, scripts) are relative to `src/`. Manifest script
entries point at **source files** (`.ts`, `.tsx`, `.vue`, `.svelte` all
work); the build compiles them and rewrites the dist manifest to the compiled
output paths. Content scripts compile to canonical entries
(`content_scripts/content-<index>.js`), so never hand-reference those output
names from source. Styles the script imports are **inlined into that JS
bundle** as base64 `data:text/css` (no sibling `.css` file; the dist manifest
shows `css: []`); only stylesheets listed in the manifest `css` array emit
`content_scripts/content-<index>.css`.

Two more bundling facts that surprise people:

- TypeScript entries need a `tsconfig.json` at the project root. Without it,
  `.ts`/`.tsx` manifest entries do not compile as expected. Add it whenever
  any entry is TypeScript, not "only if needed".
- Each content-script entry is bundled standalone: a module imported by three
  entries is duplicated into all three bundles, and module-level state is
  per-bundle. Share state through `chrome.storage` or the background script,
  never through a shared import.

### Special folders

Three folders get build treatment without manifest references:

- `pages/`: HTML pages bundled and served like manifest pages (open them via
  `chrome.runtime.getURL`).
- `scripts/`: script files compiled as standalone entries (for
  `chrome.scripting.executeScript` targets and similar).
- `public/`: copied to the output root verbatim, no bundling or hashing. The
  build refuses files in `public/` that would overwrite generated assets, and
  a manifest.json inside `public/` is an error.

## i18n and `_locales`

`_locales/` is the one manifest-adjacent folder that does **not** live in
`src/`: put it at the project root, next to `package.json` and `public/`.

- `<root>/_locales/<locale>/messages.json` is the canonical location.
- `src/_locales/` still builds, but emits a deprecation warning.
- `public/_locales/` **fails the build** (it collides with the generated
  `_locales` output).

Wire it up as usual for WebExtensions: `"default_locale": "en"` in the
manifest, `__MSG_key__` placeholders in manifest strings, and
`chrome.i18n.getMessage("key")` in code.

```
my-extension/
  _locales/
    en/messages.json
    pt_BR/messages.json
  src/
    manifest.json          "default_locale": "en"
```

## File creation order

Create files in dependency order so the manifest never references something
that does not exist:

1. `manifest.json` defines the extension surface
2. Background script, if browser events are handled
3. UI entry HTML files referenced by the manifest
4. UI scripts mounted into those HTML files
5. Styles imported by the scripts
6. `package.json` with the dependencies actually used above
7. `tsconfig.json` whenever any entry is TypeScript; other config files
   (`postcss.config.js`, `extension.config.js`) only if needed

## HTML page pattern

Every UI surface (popup, sidebar, options, newtab, devtools panel) is an HTML
file with a script tag pointing at its entry:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page Title</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this extension.</noscript>
    <div id="root"></div>
  </body>
  <script src="./scripts.tsx"></script>
</html>
```

## React mounting pattern

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Vue, Svelte, and Preact follow the same shape: HTML entry, script that mounts,
styles imported from the script.

## extension.config.js

```javascript
/** @type {import('extension').FileConfig} */
export default {
  browser: {
    chrome: {
      profile: "./dist/profile-chrome",
      startingUrl: "http://localhost:8080",
    },
  },
  config: (rspackConfig) => {
    return rspackConfig;
  },
};
```

A persistent `profile` keeps logins and storage between dev runs, which makes
debugging stateful features far less painful.

## Environment variables

- Only variables prefixed `EXTENSION_PUBLIC_` are exposed to extension code,
  available through both `import.meta.env.*` and `process.env.*`.
- `EXTENSION_PUBLIC_BROWSER` reports the current build target (`chrome`,
  `firefox`, `edge`, `chromium-based`, `gecko-based`).
- `EXTENSION_PUBLIC_MODE` reports `development` or `production`.

## Assets and CSS

- Import images and fonts directly from code; the bundler handles emission.
- CSS Modules: `*.module.css` / `*.module.scss`. Never add the `?url` suffix
  to a CSS module import; it silently breaks class-name hashing.
- Tailwind works out of the box in templates that ship it; check the template
  source rather than wiring it by hand.

## Commands

```bash
npx extension@latest create my-extension --template=react

npm run dev            # dev server + HMR + browser launch
npm run build          # production build to dist/<browser>/
npm run preview        # open the production build, no rebuild
npm run start          # build, then preview

npm run dev -- --browser=firefox
npm run build -- --browser=chrome,firefox --zip
```
