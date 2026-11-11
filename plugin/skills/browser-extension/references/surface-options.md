# Surface: options page

The options page is where a person configures the extension. Read this when
the extension declares `options_ui`, on its own or beside another surface.

## Manifest

```json
"options_ui": { "page": "options/index.html", "open_in_tab": false }
```

`open_in_tab: false` embeds the page inside the browser's extensions
management page; `true` opens it as a full tab. Firefox honours the same key.

## Files the starter lays out

- `options/index.html`, `options/scripts.js`, `options/styles.css`: the
  page, its script and styles.
- `background.js`: the worker. A content script cannot open the options
  page; it sends `open-options` and the worker calls
  `chrome.runtime.openOptionsPage()`.

## What bites

- Embedded options render in an iframe with a constrained height. Set
  explicit sizes on the page or the browser clips it.
- Both areas need the `storage` permission in the manifest. Save settings
  to `chrome.storage.sync` when they should follow the person across
  devices and to `local` otherwise; `sync` has small quotas and
  per-minute write limits, so never write on every keystroke.
- Other contexts learn about a change through `chrome.storage.onChanged`,
  never by re-reading on a timer.
- `chrome.runtime.openOptionsPage()` works from the worker and from
  extension pages, not from a content script.

## What proves it works

- The page opens from the extensions list, or from the worker on request,
  and paints without errors.
- A setting changed here is visible to the surface that reads it, on the
  next event, without a reload.
