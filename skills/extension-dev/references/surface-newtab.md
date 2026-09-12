# Surface: new tab page

A new tab override replaces the page every new tab opens on. Read this when
the extension's main surface is `chrome_url_overrides.newtab`.

## Manifest

```json
"chrome_url_overrides": { "newtab": "newtab/index.html" }
```

The key is the same on Firefox. An extension may override each of `newtab`,
`history` and `bookmarks` once, and only one installed extension can hold
each override.

## Files the starter lays out

- `newtab/index.html`, `newtab/scripts.js`, `newtab/styles.css`: the page,
  its script and styles.
- `background.js`: the worker, for work that should not restart on every new
  tab.

## What bites

- The page is an extension page: it has every `chrome.*` API the manifest's
  permissions allow and needs no host permission to exist.
- It loads on every new tab, so it has to be fast. Remote scripts are
  forbidden by Manifest V3 anyway; keep fonts and images local too, because
  a remote asset that stalls is a blank new tab.
- `chrome.topSites` needs the `topSites` permission, `chrome.search.query`
  needs `search`, and a plain form that navigates to a search URL needs
  neither.
- Persist preferences (the clock format, the last query) in
  `chrome.storage.local`, which needs the `storage` permission, and read
  them before first paint to avoid a flash of defaults.
- On first run real Chrome asks whether to keep the override; that prompt
  is the browser's and cannot be suppressed.

## What proves it works

- Opening a new tab shows the page instead of the browser's own, and it
  paints without errors.
- The clock or content it draws is right for the moment, and a preference
  set on one new tab is honoured on the next.
