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

## Action, windows, tabs

- `chrome.action` is undefined unless the manifest has an `"action"` key,
  even an empty `{}`.
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
  extension.
- Mark injected roots (`data-extension-root` or similar) so probes and
  debugging tools can verify injection deterministically.
- CSS injected by content scripts leaks both ways. Scope aggressively or use
  Shadow DOM for nontrivial UI.

## UI surfaces

- Side panel (Chromium): requires `sidePanel` permission and an explicit open
  trigger. See the cross-browser reference for the working pattern.
- DevTools pages: panel URLs are resolved relative to the extension root, not
  the devtools HTML file's directory.
- Offscreen documents (Chromium): only `chrome.runtime` messaging plus
  standard Web APIs are available. No `chrome.tabs`, `chrome.downloads`,
  `chrome.action`, etc. Route privileged calls through the worker.
- Notifications: `iconUrl` must point at a bundled file or a data URL built at
  runtime. A typo'd path fails silently on some platforms.

## Code execution and CSP

- MV3 forbids remote code and `eval()` in extension pages, and the
  extension-pages CSP (`script-src 'self'`) also blocks `blob:` script URLs
  and inline scripts. `srcdoc` iframes inherit the embedding page's CSP, so
  they are not an escape hatch either. The supported path for dynamic code
  is a sandboxed page (`"sandbox"` manifest key), which may use `eval()`;
  embed it as an iframe and message results across the boundary.
- User-visible feedback matters for background actions: after a context menu
  click or command, confirm with a badge, notification, or toast. Silent
  success is indistinguishable from silent failure, for users and for tests.
