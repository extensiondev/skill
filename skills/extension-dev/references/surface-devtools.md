# Surface: DevTools panel

A DevTools extension adds a panel to the browser's developer tools. Read
this when the extension's main surface is a `devtools_page`.

## Manifest

```json
"devtools_page": "devtools/index.html"
```

No permission is needed for the panel itself. Reading network traffic or
evaluating in the page is granted by being a DevTools page.

## Files the starter lays out

- `devtools/index.html`, `devtools/scripts.js`: the DevTools page. It shows
  nothing; its script calls
  `chrome.devtools.panels.create(title, icon, "panel/index.html")`.
- `panel/index.html`, `panel/scripts.js`, `panel/styles.css`: the panel that
  the person sees, created once per DevTools window.

## What bites

- The panel exists only while DevTools is open on a tab, and it is torn down
  when DevTools closes. Persist anything worth keeping in `chrome.storage`,
  which needs the `storage` permission.
- DevTools pages get `chrome.devtools.*`, `chrome.runtime.*` and
  `chrome.extension.*`. For anything else (tabs, windows, storage areas
  beyond the basics) message the worker and let it do the call.
- `chrome.devtools.inspectedWindow.eval(code)` runs `code` in the inspected
  page's own world, not the extension's, and hands back a JSON-serialisable
  result plus an error object; check the error every time.
- `chrome.devtools.inspectedWindow.tabId` names the tab being inspected;
  `chrome.devtools.network.onRequestFinished` streams its requests.
- A DevTools window does not count as a browser tab for `tabs.query`;
  handle an empty result.

## What proves it works

- Opening DevTools on a page shows the panel by its title, and switching to
  it paints without errors.
- What the panel reports about the page (a title, a request, a value from
  `eval`) agrees with the page it inspects.
