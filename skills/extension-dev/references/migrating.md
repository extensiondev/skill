# Migrating an Existing Extension

Most real projects start here, not from a template: a webpack, Vite, gulp or
pug build that already ships. The engine's own guide is
https://extension.js.org/docs/migrate/from-webpack-or-vite (CRXJS, Plasmo and
WXT have their own pages beside it). This is the checklist nine open-source
extensions needed in practice, in the order the problems appear.

## 1. Point the manifest at sources and merge per-browser manifests

- Keep one `manifest.json`; make every entry point name a **source** file
  (`background.ts`, `content/scripts.tsx`, `popup/index.html`). The build
  compiles them and rewrites the dist manifest.
- Projects that kept `manifest.chrome.json` and `manifest.firefox.json`
  merge them into one file with `chromium:` and `firefox:` prefixes on the
  fields that differ (`chromium:service_worker` / `firefox:scripts`,
  `chromium:action` / `firefox:browser_action`, `chromium:permissions` /
  `firefox:permissions`). See [cross-browser.md](cross-browser.md).
- Add a Firefox id: `firefox:browser_specific_settings.gecko.id`. Without it
  Firefox mints a new internal id on every launch and storage does not
  survive a relaunch. Add `data_collection_permissions` in the same block
  (required for new AMO add-ons).

## 2. Move runtime-only files where the engine finds them

- HTML pages the manifest does not name (an injected panel, a welcome page)
  go to the root `pages/` special folder; scripts loaded at runtime with
  `chrome.scripting.executeScript` go to root `scripts/`; images, fonts and
  anything served verbatim go to root `public/`. None of these live under
  `src/`. Mind the `scripts/` name clash with repository tooling, see
  [project-structure.md](project-structure.md).
- `_locales/` moves to the project root (not `src/`, not `public/`).
- Web-accessible resources keep their manifest entries; check that each
  file resolves after the move (`extension_manifest_validate` warns on a
  missing one).

## 3. Fix CommonJS-era imports

- `require()` of JSON and raw assets becomes `import data from "./x.json"`;
  a raw text or binary asset is imported with the `?url` suffix and fetched,
  not inlined by a loader the project configured for webpack.
- CSS modules on engines up to 4.1.30 export named classes only; see the
  CSS note in [project-structure.md](project-structure.md).
- Drop webpack-only loaders and plugins from the dependency list; the engine
  configures React, Vue, Svelte, Preact and TypeScript from the imports.

## 4. Monorepos and sibling packages

- A panel that imports `.vue` or `.ts` sources from a workspace sibling
  needs those paths compiled: on engines up to 4.1.30 the loaders include
  only the project root, so either move the shared sources under the
  project or alias them to a built package. The `config` hook in
  `extension.config.js` is not the escape hatch here; it runs before the
  framework rules exist.

## 5. Install next to an older toolchain

- `npm i -D extension` can refuse with `ERESOLVE` beside `css-loader@6`,
  which pins `@rspack/core` 0.x or 1.x while the engine brings rspack 2.
  Upgrade `css-loader` to 7, or install with `legacy-peer-deps=true` in
  `.npmrc` for that one step.

## 6. Verify like a release

- `extension_manifest_validate` per target, then `extension_build` per
  browser; a failed build reports the compiler errors under `value.errors`.
- Run the artifact that ships, not the dev build: `extension_start` with
  `outputPath` launches any unpacked directory, including one the old
  toolchain produced, so the two can be compared side by side.
- Read it with `extension_logs` and `extension_dom_snapshot`; on Firefox,
  an extension page with a strict CSP cannot be evaluated through the
  bridge, so read rather than eval there.
