# Surface: toolbar popup

The popup is a page that opens under the toolbar icon and dies the moment it
loses focus. Read this when the extension's main surface is an `action`.

## Manifest

```json
"chromium:action": { "default_popup": "action/index.html", "default_icon": { "16": "images/icon.png" }, "default_title": "Open" },
"firefox:browser_action": { "default_popup": "action/index.html", "default_icon": { "16": "images/icon.png" } }
```

`chrome.action` is undefined unless the manifest has an `action` key. A popup
needs no permission of its own, but `chrome.storage` does: declare
`"permissions": ["storage"]` or every read throws before the first paint.

## Files the starter lays out

- `action/index.html`, `action/scripts.js`, `action/styles.css`: the popup
  document, its script and its stylesheet.
- `background.js`: the worker, for anything that must outlive the popup.
- `images/icon.png`: the toolbar icon, also the manifest icon.

## What bites

- Every open is a fresh document and closing it is a hard teardown. Nothing
  in the popup's memory survives, so state lives in `chrome.storage.local`
  (declare the `storage` permission first) and the popup re-reads it on
  load. A counter that "forgets" is this.
- The popup sizes to its content up to 800 by 600 CSS pixels. Give `body` an
  explicit width or it collapses to the widest word.
- A button inside the popup is not a user gesture for `activeTab`. Ask for a
  host permission if the popup must read the page.
- `chrome.action.openPopup()` exists only in Chrome 127 and later and needs a
  gesture; do not design a flow around opening the popup from code.
- The popup and the worker are different contexts. `runtime.sendMessage`
  from the popup wakes the worker; the worker cannot reach popup memory.

## What proves it works

- The toolbar icon opens the page and it paints without console errors.
- A value written from the popup is still there after the popup is closed
  and opened again.
- The worker's log shows any message the popup sent.
