# Runtime API Gotchas

The WebExtension APIs fail silently in specific, repeatable ways. This file
collects the ones that cost the most debugging time, with the reason behind
each so the fix generalizes.

## Service worker lifecycle (Chromium MV3)

The background service worker is killed after roughly 30 seconds of
inactivity and restarted on the next event. Consequences:

- Module-level variables are wiped between events. Persist every piece of
  state to `chrome.storage.local` (or `session`) and re-read it on wake.
- Register all event listeners synchronously at the top level of the worker.
  A listener registered inside an async callback may not exist when the
  worker restarts, so the event is dropped.
- `setTimeout` and `setInterval` do not survive the worker being stopped.
  Schedule with `chrome.alarms` (the `alarms` permission), which wakes the
  worker when it fires.
- Long-lived connections (WebSocket, ports) die with the worker. Use alarms
  (`chrome.alarms`) to re-establish, or an offscreen document when a DOM or
  long-lived context is genuinely required.
- Firefox MV2 background scripts are persistent, which can mask these bugs
  during cross-browser testing. Test state loss on Chromium specifically.
- `ReferenceError: browser is not defined` in a **production** Chrome build
  (but not in dev) means the build ran without the polyfill: it defaults on
  for `dev`/`start` but off for `build`. Rebuild with
  `npm run build -- --polyfill` or switch the code to `chrome.*`.

## Storage

- `chrome.storage.local` is the default for persistent data and works
  cross-browser (Firefox supports the `chrome.*` namespace natively).
- `chrome.storage.session` survives worker restarts but not browser restarts;
  good for ephemeral, session-scoped state you would not persist to disk.
- `chrome.storage.sync` has small quotas and per-minute write limits; never
  put high-frequency writes there.
- Storage APIs are async. Reading "right after" a write in another context is
  a race; listen to `chrome.storage.onChanged` instead.

## Permissions and gestures

- `activeTab` is granted only by a genuine user gesture: toolbar click,
  context menu item, keyboard command, or omnibox entry. A button inside a
  side panel or popup page is not a gesture for this purpose, and programmatic
  event replay never is. If a flow needs host access without a gesture,
  request explicit host permissions instead.
- `tab.url`, `tab.title`, and `tab.favIconUrl` are silently `undefined`
  without the `tabs` permission (or an applicable host permission). No error
  fires; the data is just missing.
- `scripting.executeScript` needs `scripting` plus host access for the target
  origin (or an active `activeTab` grant).
- `permissions.request()` must run inside a user gesture. Call it in the
  click handler of the popup, panel or options page itself, as the first
  call, with nothing awaited before it. Chromium carries the gesture across
  one `runtime.sendMessage` hop into the worker's listener, and only until
  the first `await` there. Firefox documents the request as allowed only
  inside the handler for a user action (a click on a page bundled with the
  extension is one), says a handler that has waited on a promise loses
  that status, and documents no carry across messaging. The page-side call
  is the one both browsers document.
- Scope `host_permissions` to the sites the extension is for. A broad
  pattern such as `<all_urls>` is a wider install warning and a longer
  review on every store.

## Action, windows, tabs

- `chrome.action` is undefined unless the manifest has an `"action"` key,
  even an empty `{}`. On a Firefox Manifest V2 build the key is
  `browser_action` and the API is `browser.browserAction`.
- `action.onClicked` fires only when the action has no `default_popup`. An
  extension with both a popup and a panel opens the panel from a button in
  the popup, not from the toolbar click.
- `chrome.windows` has no `query()` method. Use `getAll()`, `getCurrent()`,
  or `getLastFocused()`. (`chrome.tabs.query()` exists; the asymmetry trips
  people up.)
- `chrome.tabs.query({ active: true, currentWindow: true })` returns an array;
  destructure the first element and handle the empty case (DevTools windows,
  for instance).

## Messaging

- Use `async`/`await` end to end. In an `onMessage` listener, return `true`
  only if you really will call `sendResponse` later; returning `true` and
  never responding leaves the sender hanging.
- A rejected promise or thrown error inside a listener surfaces on the sender
  as "message port closed before a response was received". Wrap handlers in
  try/catch and always respond.
- Content script to background messaging works when the worker is asleep (the
  message wakes it), but the worker's in-memory caches are gone; see the
  lifecycle section.

## Content scripts

- Batch DOM updates with `requestAnimationFrame`. Synchronous loops that
  mutate the DOM wedge the host page's main thread, and on heavy pages that
  shows up as the page freezing, which gets blamed on the site, not the
  extension. Between batches, hand the thread back (`scheduler.yield()`
  where it exists, a zero timeout where it does not) so the page's own
  input handlers run.
- Mark injected roots (`data-extension-root` or similar) so probes and
  debugging tools can verify injection deterministically.
- CSS injected by content scripts leaks both ways. Scope aggressively or use
  Shadow DOM for nontrivial UI.

## UI surfaces

- Side panel (Chromium): requires `sidePanel` permission and an explicit open
  trigger. See the cross-browser reference for the working pattern. The
  behavior key is `openPanelOnActionClick`; a misspelled key throws
  synchronously at the worker's top level and takes every listener
  registered after it down with it. Do not pair it with a `default_popup`.
- DevTools pages: panel URLs are resolved relative to the extension root, not
  the devtools HTML file's directory.
- Offscreen documents (Chromium): only `chrome.runtime` messaging plus
  standard Web APIs are available. No `chrome.tabs`, `chrome.downloads`,
  `chrome.action`, etc. Route privileged calls through the worker. One
  offscreen document exists at a time, and Firefox has none: its
  background is a page with a DOM, so the same work runs there.
- Anything exclusive (one offscreen document, one capture stream per tab)
  fails when a fast second click starts it twice. Keep the state in
  `chrome.storage.session` with the in-between steps written down
  (`starting`, `stopping`) and return early while one is in flight.
- Notifications: `iconUrl` must point at a bundled file or a data URL built at
  runtime. A typo'd path fails silently on some platforms.

## Code execution and CSP

- MV3 forbids remote code and `eval()` in extension pages, and the
  extension-pages CSP (`script-src 'self'`) also blocks `blob:` script URLs
  and inline scripts. `srcdoc` iframes inherit the embedding page's CSP, so
  they are not an escape hatch either. The supported path for dynamic code
  is a sandboxed page (`"sandbox"` manifest key), which may use `eval()`;
  embed it as an iframe and message results across the boundary with
  `postMessage`, because the page cannot reach into the frame's document.
  Measured on Chromium 143 from an extension page under the default policy:
  an inline script ran in the manifest sandbox page and in no other frame,
  not in a `blob:` iframe, a `srcdoc` iframe or a `srcdoc` iframe with
  `sandbox="allow-scripts"`. Where other guidance offers those three as
  alternatives, use the sandbox page.
- User-visible feedback matters for background actions: after a context menu
  click or command, confirm with a badge, notification, or toast. Silent
  success is indistinguishable from silent failure, for users and for tests.


## APIs not every browser ships

Some APIs exist on Chrome or Chromium alone, or behave differently enough elsewhere
that one code path cannot serve every build. `extension_docs_search`
carries their call-level detail. What this skill adds is the other
browsers:

- Feature-detect before the first call (`if (chrome.tabCapture)`,
  `"LanguageModel" in self`) or branch on
  `import.meta.env.EXTENSION_PUBLIC_BROWSER`, and give the builds without
  the API a path that says so in the UI instead of throwing.
- Declare a Chrome-only permission under `chromium:permissions`
  (`tabCapture`, `desktopCapture`, `offscreen`, `sidePanel`), so the
  Firefox manifest does not carry a name it warns about.
- Prompt API (`LanguageModel`), `chrome.tabCapture` and
  `chrome.desktopCapture`: absent on Firefox and Safari; confirm any other
  target with `extension_docs_search`.
- `chrome.userScripts`: the person has to allow it per extension, so check
  that it is available before every use and show what to enable. Firefox
  has a `userScripts` API of its own with different rules; look it up
  before porting.
- `chrome.identity.getAuthToken` works on Chrome alone. On Firefox and Edge use
  `identity.launchWebAuthFlow` with the address from
  `identity.getRedirectURL()`, registered at the provider.
- Sign-in is tied to the extension ID, and each store assigns its own. A
  manifest `"key"` pins the ID of an unpacked Chrome build. On Firefox the
  ID is `browser_specific_settings.gecko.id`, which you write provisionally
  when the manifest has none ([cross-browser.md](cross-browser.md)). After
  the first publish, register each store-assigned ID or redirect address
  with the provider.
