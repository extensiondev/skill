# Surface: content script

A content script runs inside web pages the manifest matches, in an isolated
world with the page's DOM and none of the page's JavaScript. Read this when
the extension changes or reads pages.

## Manifest

```json
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["content/scripts.js"] }
],
"host_permissions": ["<all_urls>"]
```

`matches` decides where it runs; `host_permissions` is what lets it fetch
cross-origin and lets the worker reach those tabs. Narrow both to the sites
the extension is for.

## Files the starter lays out

- `content/scripts.js`: the entry. It exports a default `initial()` that the
  framework calls on injection and whose returned function it calls on
  teardown and hot reload; do not call it yourself.
- `content/ContentApp.js`, `content/styles.css`: the injected UI and its
  stylesheet. The starter mounts the UI inside a shadow root on a host
  element marked `data-extension-root` with `all: initial`, so page CSS
  cannot restyle it and its CSS cannot leak out.
- `background.js`: the worker. A content script cannot open extension pages
  or call most `chrome.*` APIs; it sends a message and the worker does it.

## What bites

- Styles imported by the script are inlined into its bundle; a stylesheet
  the script fetches with `new URL("./styles.css", import.meta.url)` is the
  pattern the starter uses to put CSS inside the shadow root.
- Injection happens at `document_idle` by default and once per page load.
  A page that renders after load (a feed, a search result) needs a
  `MutationObserver`, not a longer delay.
- Batch DOM writes with `requestAnimationFrame`. A synchronous loop over
  thousands of nodes freezes the page and the site gets blamed.
- The script's memory is per page and per frame. Share state through
  `chrome.storage` (declare the `storage` permission) or the worker, never
  through a module variable.
- The worker may be asleep; a message wakes it, its caches are gone.

## What proves it works

- On a matching page the host element is in the DOM and the injected UI is
  visible over the page's own styles.
- The count or change the script makes agrees with the page (for links,
  `document.querySelectorAll("a").length`).
- The worker's log shows the relay when the injected UI asks it for
  something.
