# Surface: side panel

The side panel is a page docked beside the tab strip that stays open while
the person switches tabs. Read this when the extension's main surface is a
`side_panel` (Chromium) or `sidebar_action` (Firefox).

## Manifest

```json
"chromium:side_panel": { "default_path": "sidebar/index.html" },
"firefox:sidebar_action": { "default_panel": "sidebar/index.html" },
"chromium:permissions": ["sidePanel"],
"chromium:action": { "default_icon": { "16": "images/icon.png" }, "default_title": "Open side panel" },
"firefox:browser_action": { "default_icon": { "16": "images/icon.png" } }
```

The `action` has no `default_popup` on purpose: it is the panel's opener.
Removing it leaves a panel nobody can open from the toolbar.

## Files the starter lays out

- `sidebar/index.html`, `sidebar/scripts.js`, `sidebar/SidebarApp.js`,
  `sidebar/styles.css`: the panel document, its script, its UI and styles.
- `background.js`: the worker. At its top level it calls
  `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`, and
  on Firefox it opens the sidebar from `browserAction.onClicked`.
- `content/scripts.js`, `content/ContentApp.js`: a content script whose UI
  sends `openSidebar` to the worker; the worker calls
  `chrome.sidePanel.open({ tabId })` synchronously inside that gesture.

## What bites

- `sidePanel.open()` only works inside a user gesture, and the gesture is
  gone after any `await`. Call it synchronously from the message handler.
- `setPanelBehavior` affects future action clicks only; registering it inside
  `onClicked` swallows the first click, so it stays at the worker's top level.
- The panel has no tab of its own. To read the page it sits beside, query
  `chrome.tabs.query({ active: true, currentWindow: true })` and message the
  content script in that tab, or use `chrome.scripting.executeScript` with
  the `scripting` permission and host access.
- The panel outlives tab switches. Listen to `chrome.tabs.onActivated` and
  `chrome.tabs.onUpdated` and refresh what it shows.
- Firefox needs no `sidePanel` permission and opens the sidebar from
  `browser.sidebarAction.open()`, also gesture-bound.

## What proves it works

- Clicking the toolbar icon opens the panel and it paints without errors.
- What the panel lists matches the page beside it, and changes when the
  active tab changes.
- The worker's log shows the open request when the content script's UI asks
  for it.
