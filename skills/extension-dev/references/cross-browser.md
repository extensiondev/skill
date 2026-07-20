# Cross-Browser Rules

extension.dev (built on the open-source Extension.js framework) extends the
standard manifest with browser prefixes. The build resolves them per target,
so one source tree ships to Chrome, Edge, Firefox, Safari, and any
Chromium- or Gecko-based browser (Brave, Opera, Vivaldi, Yandex, Waterfox,
LibreWolf).

## Prefix semantics

These rules come from Extension.js's `filterKeysForThisBrowser` resolver
(verified against Extension.js 4.0.11):

- Unprefixed fields apply to every browser.
- `chromium:` fields apply to Chrome, Edge, and other Chromium-based browsers.
- `firefox:` fields apply to Firefox and other Gecko-based browsers.
- `gecko:` is an alias for the Firefox family; `chrome:` and `edge:` are
  aliases for the Chromium family. Aliases resolve family-wide on
  non-matching siblings (an `edge:` field also applies to a Chrome build), so
  write `chromium:` and `firefox:` for family-wide fields.
- Prefixes resolve at **any nesting depth**: inside `background`, inside a
  `content_scripts` entry (`firefox:world`), anywhere an object key appears.
  One exception: never write `chromium:world`; see the `world: "MAIN"`
  section below.
- Precedence is deterministic and independent of declaration order:
  **plain key < family prefix < exact-browser prefix**. A non-matching
  prefixed key is dropped and the plain key survives. So
  `chromium:action` sets the Chromium-family default and `edge:action`
  overrides it on the Edge build only; "default plus per-browser override"
  is the natural pattern.
- Safari targets (`safari`, `webkit-based`) inherit the **chromium family**
  for manifest resolution (the Safari build converts a Chrome-shaped
  extension), and `safari:`/`webkit:` prefixes win over chromium-family keys
  on those targets.
- Permissions can diverge: `chromium:permissions` and `firefox:permissions`.

## Manifest field mapping

| Feature | Chromium | Firefox |
| --- | --- | --- |
| Manifest version | `chromium:manifest_version: 3` | `firefox:manifest_version: 2` |
| Toolbar button | `chromium:action` | `firefox:browser_action` |
| Side panel | `chromium:side_panel` | `firefox:sidebar_action` |
| Background | `chromium:service_worker` (string) | `firefox:scripts` (array) |
| Side panel permission | `chromium:permissions: ["sidePanel"]` | not needed |

## Complete cross-browser manifest example

```json
{
  "$schema": "https://json.schemastore.org/chrome-manifest.json",
  "chromium:manifest_version": 3,
  "firefox:manifest_version": 2,
  "name": "My Extension",
  "chromium:action": { "default_title": "Click me" },
  "firefox:browser_action": { "default_title": "Click me" },
  "chromium:side_panel": { "default_path": "sidebar/index.html" },
  "firefox:sidebar_action": { "default_panel": "sidebar/index.html" },
  "background": {
    "chromium:service_worker": "background.ts",
    "firefox:scripts": ["background.ts"]
  },
  "chromium:permissions": ["sidePanel", "storage"],
  "firefox:permissions": ["storage"]
}
```

## Firefox data collection permissions (required for new AMO add-ons)

Since November 3, 2025, AMO rejects any NEW extension whose manifest lacks
`browser_specific_settings.gecko.data_collection_permissions`. Updates to
add-ons that existed before that date are exempt for now, but Mozilla has
said all extensions will need it during 2026, so declare it in every project.
Prefix it so only Firefox builds carry it:

```json
{
  "firefox:browser_specific_settings": {
    "gecko": {
      "data_collection_permissions": {
        "required": ["none"]
      }
    }
  }
}
```

`"none"` is itself a declaration ("collects no data") and is only truthful
when the extension transmits nothing. If the extension sends any user data
anywhere (an AI provider, your own backend, analytics), declare the matching
categories instead, for example `["authenticationInfo",
"personalCommunications", "websiteContent"]` for a chat extension that sends
an API key, chat messages, and page content to a provider. Firefox shows the
declaration in the install prompt (desktop 140+, Android 142+), and the
`required` entries cannot be opted out of by the user. Categories in
`optional` must be requested at runtime via `permissions.request()`.
The declaration must match what the code actually does; a false `"none"` is
a policy violation. Full category list:
https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/

Extension.dev templates ship this block by default. If the project already
declares `firefox:browser_specific_settings` (a gecko id, `strict_min_version`),
merge `data_collection_permissions` into the existing object.

## Side panel / sidebar open behavior

Declaring the panel in the manifest renders nothing by itself. Wire an open
trigger in the background script:

```typescript
const isFirefoxLike =
  import.meta.env.EXTENSION_PUBLIC_BROWSER === "firefox" ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === "gecko-based";

if (isFirefoxLike) {
  browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.open();
  });
} else {
  // Top level, not inside onClicked: setPanelBehavior only affects
  // FUTURE clicks, so installing it from the first click means that
  // first click does nothing.
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}
```

Note the asymmetry: `sidebarAction.open()` must be called from a user gesture
handler on Firefox; on Chromium, `setPanelBehavior` is declared once up front
and the toolbar click itself opens the panel. (To open the panel from other
gestures, call `chrome.sidePanel.open({ windowId })` synchronously inside the
gesture handler.)

## Content scripts with `world: "MAIN"`

Write the `world` key **unprefixed**. Main-world content scripts need a
companion bridge script that the build inserts automatically, and that
insertion keys off the literal `world` key in the source manifest. A
`chromium:world` prefix hides the key from the bridge step and **hard-fails
the Chromium build** (the emitted manifest references bridge bundles that
were never compiled).

The build strips `world` from the bridge entry it emits, and Firefox keeps
the unprefixed key verbatim (Firefox understands manifest `world` from 128
onward). If older Firefox must stay on the isolated world, say so explicitly
with an exact-prefix override:

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/scripts.ts"],
      "world": "MAIN",
      "firefox:world": "ISOLATED"
    }
  ]
}
```

If the feature fundamentally requires main-world access on Firefox, inject a
`<script>` element from the isolated world instead, and treat it as a separate
code path.

## API namespaces

- `browser.*` on Chromium only exists through the webextension-polyfill, and
  the polyfill is applied **per command**: on by default for `dev` and
  `start`, **off by default for `build`**. A `browser.*` call that worked all
  through development throws (`browser is not defined`) in the production
  Chrome build unless you build with `npm run build -- --polyfill`.
- `npm run start` cannot catch this: it runs its own build with the polyfill
  on, so it tests a different artifact than the `npm run build --zip` you
  ship. Verify the real artifact with `npm run preview` after a plain build.
- If you do not want to manage the flag, write `chrome.*` (promise-based on
  Chromium MV3) and reserve `browser.*` for Firefox code paths; Firefox
  ships `browser.*` natively, no polyfill involved.
- Use `chrome.*` always for Chromium-only surfaces (`chrome.sidePanel`,
  `chrome.offscreen`, `chrome.declarativeNetRequest` specifics).
- Branch at runtime with `import.meta.env.EXTENSION_PUBLIC_BROWSER`.

## Testing across browsers

```bash
npm run dev -- --browser=chrome
npm run dev -- --browser=firefox
npm run dev -- --browser=edge

# Production builds for several targets at once
npm run build -- --browser=chrome,firefox
```

`--browser` accepts the full target list (verified against the Extension.js
`BrowserType` union): `chrome`, `edge`, `firefox`, `chromium`, `brave`,
`opera`, `vivaldi`, `yandex`, `waterfox`, `librewolf`, the family targets
`chromium-based`, `gecko-based`, and `firefox-based` for pointing at a custom
binary, and `safari` / `webkit-based` as build targets (see the Safari note
in Prefix semantics above).

Build output lands in `dist/<browser>/`. When a bug appears in one browser
only, diff the two `dist/` manifests first; prefix mistakes show up there
immediately.

Note that the build rewrites entry paths to canonical output locations, so
the dist manifests will not match the source manifest verbatim:

| Source manifest value | dist output |
| --- | --- |
| `background.chromium:service_worker: "background.ts"` | `background/service_worker.js` |
| `background.firefox:scripts: ["background.ts"]` | `background/scripts.js` |
| `content_scripts[0].js: ["content/scripts.tsx"]` | `content_scripts/content-0.js` |
| `content_scripts[0].css: ["content/styles.css"]` | `content_scripts/content-0.css` |
| `side_panel.default_path: "sidebar/index.html"` | `sidebar/index.html` |

Styles **imported from a content script** (`import "./styles.css"`) do not
become a sibling `.css` file: they are inlined into the JS bundle as base64
`data:text/css` and injected at runtime, and the dist manifest shows
`css: []`. Only stylesheets listed in the manifest `css` array compile to
`content_scripts/content-<index>.css`. A `world: "MAIN"` entry additionally
appends an auto-generated bridge entry (`content_scripts/content-<N>.js`
past your last index) to the dist manifest; leave it alone.

In development builds, content script assets carry a content hash
(`content-0.<hash>.js`) so Chrome does not serve stale cached resources after
a live reinjection.
