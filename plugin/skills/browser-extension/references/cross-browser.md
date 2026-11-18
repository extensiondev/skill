# Cross-Browser Rules

extension.dev (built on the open-source Extension.js framework) extends the
standard manifest with browser prefixes. The build resolves them per target,
so one source tree ships to Chrome, Edge, Firefox, Safari, and any
Chromium- or Gecko-based browser (Brave, Opera, Vivaldi, Yandex, Waterfox,
Zen, Floorp).

## Prefix semantics

These rules come from Extension.js's `filterKeysForThisBrowser` resolver
(verified against Extension.js 4.1.30):

- Unprefixed fields apply to every browser.
- `chromium:` fields apply to Chrome, Edge, and other Chromium-based browsers;
  it is the only Chromium **family** prefix.
- `firefox:` fields apply to Firefox and other Gecko-based browsers, and
  `gecko:` is its alias.
- `chrome:` and `edge:` name **one vendor each**, the requested build target
  by name: a `chrome:` field reaches the Chrome build only and is dropped on
  Edge, Brave or any other Chromium-based target, and `edge:` likewise. Up to
  Extension.js 4.1.18 both reached the whole Chromium family, and the build
  warns when a key the old rule applied is now dropped. Write `chromium:` for
  family-wide fields and keep `chrome:`/`edge:` for a true per-vendor value.
- Prefixes resolve at **any nesting depth**: inside `background`, inside a
  `content_scripts` entry (`firefox:world`), anywhere an object key appears.
  `world` follows the same rule; see the `world: "MAIN"` section below.
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

Firefox keeps `background.scripts` under Manifest V3 as well: it runs the
background as an event page and has no extension service worker. Guidance
written for Chrome alone says `service_worker`, never `scripts`; both hold
at once when the two keys carry their prefixes, as in the example below.

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
  "firefox:permissions": ["storage"],
  "firefox:browser_specific_settings": {
    "gecko": { "id": "my-extension@example.com" }
  }
}
```

## Firefox add-on ID (you write it, provisional)

When a manifest bound for Firefox has no
`browser_specific_settings.gecko.id`, write one. Do not leave it out, and
do not hand the choice to the owner as an open item.

- Form: `<project-name>@<domain>`. Use the owner's domain when the project
  shows one (a homepage, an author URL or email, a repository under their
  own domain); otherwise use a placeholder such as `example.com`, as in
  `my-extension@example.com` above.
- Write it as `firefox:browser_specific_settings.gecko.id` in the one
  manifest, so only Firefox builds carry it.
- Tell the owner plainly: you wrote a provisional ID, it locks at the first
  Firefox submission (AMO ties the add-on to it for good), and they should
  change it before then if they want another.
- An ID the project already has stays as it is.

Without an ID a temporary add-on gets a new internal id on every launch, so
storage and the `moz-extension://` origin do not survive a relaunch, and a
store upload needs one.

The ID is an identifier, not a statement to a store. The rule in the next
section, that the owner alone writes the data declaration, does not reach
it.

## Firefox data collection permissions (required for new AMO add-ons)

Since November 3, 2025, AMO rejects any NEW extension whose manifest lacks
`browser_specific_settings.gecko.data_collection_permissions`. Updates to
add-ons created before that date are exempt for now; Mozilla says they must
adopt it at a later date it has not set
([source](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/)),
so every project needs it. Prefix it so only Firefox builds carry it:

```json
{
  "firefox:browser_specific_settings": {
    "gecko": {
      "id": "my-extension@example.com",
      "data_collection_permissions": {
        "required": ["<the categories the owner declares>"]
      }
    }
  }
}
```

The `id` line is the provisional one you wrote (section above). The
declaration's value is a statement the owner certifies to Mozilla, so this
reference shows the shape and names no value. Every category, the one that states no
collection included, is a declaration that must match what the code does; a
false one is a policy violation. Firefox shows the declaration in the
install prompt (desktop 140+, Android 142+), and the `required` entries
cannot be opted out of by the user. Categories in `optional` must be
requested at runtime via `permissions.request()`. Full category list:
https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/

The declaration is the owner's, never the agent's (Cezar's ruling of
2026-11-01, see the listing draft in [store-md.md](store-md.md)). When the
manifest lacks it, say so, quote the code facts (the network and
remote-code call sites with file and line, storage use) and ask the owner
for the value; never write or propose one, not even `"none"`. Write the
block only with the categories the owner states. No template declares it
for the owner; if a project still carries a `"none"` block it started
with, show it to the owner as a declaration awaiting their answer rather
than keeping or deleting it silently. Merge the owner's
`data_collection_permissions` into the `firefox:browser_specific_settings`
object that already holds the ID and any `strict_min_version`.

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

Write the `world` key **unprefixed** by default. Main-world content scripts
need a companion bridge script, and the build inserts it automatically. A
`chromium:world` key works too: measured with Extension.js 4.1.31, it builds,
the Chromium output is the same as the unprefixed key (the main-world script
plus its bridge), and the Firefox build gets the entry with no `world`, so it
runs in the isolated world.

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
`opera`, `vivaldi`, `yandex`, `waterfox`, `librewolf` (which ships with remote
debugging off; the engine's launch error names the two override lines), `zen`,
`floorp`, the
family targets `chromium-based`, `gecko-based`, and `firefox-based` for
pointing at a custom binary, `safari` / `webkit-based` as build targets (see
the Safari note in Prefix semantics above), and `chromium-emulator`.

Build output lands in `dist/<browser>/`: `--browser=chrome` writes
`dist/chrome/`, and a plain `npm run build` with no flag targets chromium and
writes `dist/chromium/`, so read the folder the build prints instead of
assuming one. When a bug appears in one browser only, diff the two `dist/`
manifests first; prefix mistakes show up there immediately.

### Safari

A local Safari dev session runs on a Mac with Xcode: `dev --browser=safari`
converts the bundle into a Safari app, opens it and prints the enable steps;
enabling the extension and granting site access are Safari controls no tool
can perform. Once enabled,
Extension.js 4.1.28 reloads the extension on every save through the
extension's own bridge to the dev server, and streams background and content
lines into the dev session's log file. Start the session with
`allowEval: true` and the bridge tools work as on other engines:
`extension_logs`, `extension_storage`, `extension_reload`, `extension_open`
for surfaces, `extension_dom_snapshot` by tab id, and `extension_assert` for
`content-script-injected` (a content line at the url), `background-worker-booted`,
`storage-key-present` and `console-errors-empty`. Two Safari limits, both
reported by the engine when hit: `extension_eval` in `content` or `page`
needs a tab already open at the url, which the user opens in Safari by hand,
because `extension_open` with `url` navigates through a background eval and
Safari's MV3 background CSP blocks eval, which also rules out
`extension_eval` in `background`. Safari has no CDP or RDP, so
`extension_inspect` has no Safari path and `surface-rendered` answers
inconclusive; read a surface with `extension_dom_snapshot` and its
`context`, or in Web Inspector.

Reaching the App Store needs no Mac. `build --browser=safari` runs on any
OS; on a host that is not macOS the engine skips the local packaging step
and leaves a plain bundle in `dist/safari`. Apple's App Store Connect has a
Safari Web Extension Packager that, in Apple's words, works "from any web
browser, without requiring a Mac or access to Xcode". What the platform's
Safari lane does that an upload there does not: one approval, signing with
keys the platform holds encrypted at rest, the same flow as the other three
stores, and no hand upload; see [publishing.md](publishing.md). A Mac with
Xcode still packages locally, and a person who has one can keep doing that.

Safari 27 and Safari Technology Preview 247 ship Apple's Safari MCP server
(`safaridriver --mcp`). Added beside `extension-dev` (enable Safari >
Settings > Developer > "Allow remote automation and external agents", then
`claude mcp add safari-mcp -- "/usr/bin/safaridriver" --mcp`), it gives an
agent an isolated automation window with page-level tools: tabs, navigation,
`evaluate_javascript`, `browser_console_messages`, network requests and
screenshots. It has no extension-aware tool: no popup, no background page,
no extension list, no `browser.storage`; use it to read a page a content
script touches, in the page's main world. It runs beside a Safari dev
session, because the extension.dev server opens no automation session of
its own. `extension_doctor` with no `projectPath` reports whether the
machine's safaridriver has `--mcp`.
