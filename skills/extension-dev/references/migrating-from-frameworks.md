# Migrating from Another Extension Framework

Some extensions start on a framework that generates the manifest from a
file layout and a config file. The engine reads a `manifest.json` you
write, so the move is mostly writing that file and turning framework
wrappers back into plain modules. UI code, styles, tests and `chrome.*`
calls stay as they are. Everything below was built with Extension.js
4.1.33 for Chromium and Firefox.

## Detect the source

Read the project before changing it. The files say which section applies.

| Signal in the project | Source | Section |
| --- | --- | --- |
| `wxt.config.*`, an `entrypoints/` folder, `wxt` in `package.json`, `defineBackground` or `defineContentScript` in sources | WXT | [From WXT](#from-wxt) |
| `plasmo` or `@plasmohq/*` in `package.json`, a `manifest` field in `package.json`, `contents/` or `background/messages/` folders, `PlasmoCSConfig` in sources | Plasmo | [From Plasmo](#from-plasmo) |

Neither signal present means a bundler build (webpack, Vite, gulp); follow
[migrating.md](migrating.md) instead.

## Steps both sources share

1. **Write `src/manifest.json` by hand.** Start from the config's manifest
   block, then add one entry per file convention (tables below). Every
   entry names a **source** file (`background.ts`, `content/scripts.ts`)
   and every page entry names an **HTML** file: a `.tsx` named as
   `default_popup` builds green and ships its source as escaped text in the
   page. Add `"$schema"` and the Firefox fields from
   [migrating.md](migrating.md) step 1, and prefix what differs per browser
   ([cross-browser.md](cross-browser.md)). The background entry is
   `"background": {"chromium:service_worker": "background.ts",
   "firefox:scripts": ["background.ts"]}`.
2. **Move the code under `src/`** next to the manifest, one folder per
   surface. Pages and scripts the manifest does not name (loaded at
   runtime) go to the root `pages/` and `scripts/` folders; files served
   verbatim go to root `public/`, copied as is
   ([project-structure.md](project-structure.md)).
3. **Swap the scripts and dependencies.** `npm i -D extension@latest`,
   remove the framework CLI package and delete any `postinstall` that calls
   it (left in, `npm install` fails with `sh: wxt: command not found`).
   Point the scripts at the CLI: `"dev": "extension dev"`,
   `"build": "extension build"`, `"preview": "extension preview"`. A
   per-browser script becomes `extension build --browser=firefox`; a zip
   script becomes `extension build --browser=chrome,firefox --zip`, which
   writes `dist/<name>-<version>-<browser>.zip`. No framework module
   package is needed: React, Vue, Svelte and Preact are configured from the
   imports.
4. **Give the project its own `tsconfig.json`.** A `tsconfig.json` that
   extends the old framework's generated config fails the build with
   `× Tsconfig not found` and the path it looked for. Write a
   standalone one that includes `extension-env.d.ts` and maps the old
   import aliases in `paths` (`"~*": ["./*"]`, `"@/*": ["./src/*"]`); an
   alias left unmapped fails with
   `× Module not found: Can't resolve '@/utils/counter'`. Without the local
   `extension` dev dependency, `tsc` reports `Cannot find name 'process'`
   and `Property 'env' does not exist on type 'ImportMeta'`.
5. **Rename the env vars.** Only `EXTENSION_PUBLIC_*` reaches extension
   code, through `import.meta.env.EXTENSION_PUBLIC_X` or
   `process.env.EXTENSION_PUBLIC_X`; `EXTENSION_PUBLIC_BROWSER` and
   `EXTENSION_PUBLIC_MODE` are set for you. A leftover old name reads
   `undefined` with no error. Per-browser and per-mode files are named
   `.env.[browser].[mode]`, and one file is selected, not a cascade.
6. **Keep stored data readable.** Users who update keep what the old build
   wrote to `chrome.storage`. The section for each source says which
   area and which key format the old storage wrapper used; keeping the
   wrapper package is the safe default.
7. **Type-check and grep, because the build stays green on leftovers.** A
   leftover `export default defineContentScript({...})` compiles and throws
   a `ReferenceError` at runtime; only `tsc` catches it
   (`error TS2304: Cannot find name 'defineContentScript'.`). Set
   `"noEmit": true` in that `tsconfig.json`, run `npx tsc`, then search the sources for
   `defineBackground`, `defineContentScript`, `defineUnlistedScript`,
   `WXT_`, `PLASMO_` and `#imports`; every hit is unfinished work.
8. **Verify like a release**, [migrating.md](migrating.md) step 6: validate
   the manifest, build per browser, run the built artifact and read its
   logs.

## From WXT

| Convention | `src/manifest.json` entry |
| --- | --- |
| `manifest: {...}` in `wxt.config.ts` | the same keys, at the top level |
| `entrypoints/background.ts` | the background entry from step 1 |
| `entrypoints/content.ts` or `*.content.ts` | a `content_scripts` entry; `matches`, `runAt` (`run_at`) and `world` move out of `defineContentScript` |
| `entrypoints/popup/index.html` | `"action": {"default_popup": "popup/index.html"}` |
| `entrypoints/options/index.html` | `"options_ui": {"page": "options/index.html"}` |
| `entrypoints/sidepanel/index.html` | `"chromium:side_panel": {"default_path": "sidepanel/index.html"}` and `firefox:sidebar_action`, plus the `sidePanel` permission (core rule 4) |
| `entrypoints/newtab/index.html` | `"chrome_url_overrides": {"newtab": "newtab/index.html"}` |
| `entrypoints/devtools/index.html` | `"devtools_page": "devtools/index.html"` |
| `entrypoints/sandbox/index.html` | `"sandbox": {"pages": ["sandbox/index.html"]}` |
| `<meta name="manifest.*">` in an HTML entry | the matching key in that entry's manifest block; delete the tag |
| an unlisted script or page | root `scripts/` or `pages/` |
| `include` / `exclude` per browser | `chromium:` and `firefox:` keys |

- **`defineBackground` and `defineContentScript`**: delete the wrapper and
  run the body of `main()` at the top level of a plain module. Listeners
  stay at the top level (core rule 7).
- **`ctx`** (the content script context): replace `ctx.addEventListener`,
  `ctx.setTimeout` and `ctx.setInterval` with the plain DOM calls, and
  guard long-lived callbacks with `if (!chrome.runtime?.id) return` so an
  orphaned script stops after the extension updates. The
  `wxt:locationchange` event has no counterpart; listen for `popstate` and
  `hashchange`, or watch `location.href`, on a single-page site.
- **Auto-imports and `#imports`**: nothing is global. A missing import
  fails the build with `× Module not found: Can't resolve '#imports'`
  (likewise `wxt/browser` and `wxt/utils/storage`), and a global used with
  no import at all type-checks as
  `error TS2552: Cannot find name 'storage'. Did you mean 'Storage'?`.
  Import every helper explicitly, framework hooks from `react` or `vue`
  directly.
- **`browser`**: `import { browser } from "@wxt-dev/browser"` keeps the
  calls as written. A bare `browser.*` without it builds with the warning
  `uses browser.*, which chrome only has through the cross-browser
  polyfill`; build with `--polyfill` or write `chrome.*` (core rule 5).
- **`storage`**: `import { storage } from "@wxt-dev/storage"` keeps every
  call and every stored value. To drop the package,
  `storage.getItem("local:counter")` is
  `chrome.storage.local.get("counter")`: the prefix names the area and the
  value is stored unchanged (metadata sits under `counter$`).
- **`WXT_*` and `VITE_*` env vars** become `EXTENSION_PUBLIC_*`.
- **`@wxt-dev/module-react`** (and the Vue, Svelte, Solid modules): remove
  them.
- **`registration: "runtime"`** content scripts: put the file in root
  `scripts/` and register it with `chrome.scripting.registerContentScripts`.
- **Delete** `wxt.config.ts`, the `.wxt/` and `.output/` folders and the
  `wxt prepare` postinstall.

## From Plasmo

| Convention | `src/manifest.json` entry |
| --- | --- |
| `manifest` field in `package.json` | the same keys, at the top level; delete the field |
| `popup.tsx` (or `popup/index.tsx`) | `"action": {"default_popup": "popup/index.html"}` with an HTML page that mounts the default export |
| `options.tsx` | `"options_ui": {"page": "options/index.html"}` |
| `sidepanel.tsx` | `"chromium:side_panel": {"default_path": "sidepanel/index.html"}` and `firefox:sidebar_action`, plus the `sidePanel` permission (core rule 4) |
| `newtab.tsx` | `"chrome_url_overrides": {"newtab": "newtab/index.html"}` |
| `background.ts` or `background/index.ts` | the background entry from step 1 |
| `contents/*.ts(x)` | one `content_scripts` entry per file; `matches` and the other fields move out of the exported `PlasmoCSConfig`, which the engine ignores |
| `tabs/*.tsx` | root `pages/` |
| `assets/icon.png` | an `icons` block and `action.default_icon` naming 16, 32, 48, 64 and 128 px files you export yourself (core rule 11); nothing resizes them |

- **Pages export a component; the engine needs a page.** Write
  `popup/index.html` with a `<div id="root">` and a module script, and a
  `popup/index.tsx` that renders the old default export with
  `createRoot(...).render(...)`.
- **Content script UI** (a default-exported component in `contents/`):
  mount it yourself. Create a host element, `attachShadow({mode: "open"})`,
  put the CSS that `getStyle` returned into a `<style>` inside the shadow
  root (import it with `?raw`, below), and render the component there with
  `createRoot` (see [surface-content.md](surface-content.md)). Anchors and
  the mount lifecycle have no counterpart: find the anchor element yourself
  and re-mount from a `MutationObserver` when the page replaces it.
- **Import schemes**: `data-text:`, `url:` and `data-base64:` fail the
  build with `× Reading from "data-text:~contents/overlay.css" is not
  handled by plugins (Unhandled scheme).` Use
  `import css from "~contents/overlay.css?raw"` for text,
  `import src from "~assets/logo.png?url"` for an asset URL (the build
  emits the file and adds a `web_accessible_resources` entry scoped to the
  content script's matches), and a plain import for `data-base64:` (small
  images are inlined as data URLs). Never put `?url` on a CSS module (core
  rule 14).
- **`@plasmohq/messaging`**: keep `sendToBackground` as it is, and
  replace the `background/messages/` folder convention with one router in
  the background:

  ```ts
  import ping from "./messages/ping";

  const handlers: Record<
    string,
    (req: any, res: { send: (body: unknown) => void }) => unknown
  > = { ping };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handler = handlers[message?.name];
    if (!handler) return false;
    Promise.resolve(handler({ ...message, sender }, { send: sendResponse }))
      .catch((error) => sendResponse({ error: String(error) }));
    return true;
  });
  ```

  For typed names, add
  `declare module "@plasmohq/messaging" { interface MessagesMetadata { ping: {} } }`.
  Ports, relays and `useMessage` were not verified here; rewrite them on
  `chrome.runtime.connect` and `window.postMessage`, and test them.
- **`@plasmohq/storage`** and its `useStorage` hook keep working
  unchanged; keep them. The package writes to the **sync** area by default
  and stores every value as JSON text, so a plain
  `chrome.storage.sync.get("enabled")` returns the string `"false"`, which
  is truthy, and a switch to the local area reads `undefined`: either way
  the user's saved setting is lost. To drop the package, read the same
  area and parse:

  ```ts
  const { [key]: raw } = await chrome.storage.sync.get(key);
  const value =
    raw === undefined ? fallback : typeof raw === "string" ? JSON.parse(raw) : raw;
  ```

  Moving to the local area is a one-time copy on update: parse each value,
  skip keys already in local, and leave sync intact.
- **`PLASMO_PUBLIC_*` env vars** become `EXTENSION_PUBLIC_*`.
- **The `~` alias** points at the project root: map it in `tsconfig.json`
  `paths` (step 4), or switch to relative imports.
- **The `firefox-mv2` build target** becomes `--browser=firefox`; keep
  Firefox on MV2 with `firefox:manifest_version: 2` and
  `firefox:browser_action`. Output goes to `dist/<browser>/`.
- **Delete** the `.plasmo/` and `build/` folders, and the
  `plasmo/templates/tsconfig.base` extends (step 4).
