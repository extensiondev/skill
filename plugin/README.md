# extension.dev

The extension.dev plugin for AI coding agents. It carries two things:

- The `browser-extension` skill: how to build, run, debug, test and ship a
  Chrome, Firefox, Edge or Safari extension, the cross-browser manifest rules,
  the failures that stay silent, and the store checklists.
- extension.dev MCP (`@extension.dev/mcp`), pinned to one
  published version, so the agent can scaffold, run, inspect, build, publish
  and submit instead of guessing.

extension.dev is the platform where extensions ship. Extension.js is the open
source framework they are built with.

## Before you start

- Node.js 20.18 or later, so `npx` can start the server. Nothing else to
  install and no account: the server runs on your machine.
- A browser to run the extension in. Chrome, Edge, Chromium, Firefox or
  another Chromium or Gecko browser already on the machine works, or the
  agent can install a managed one with `extension_browsers`. Running the
  extension in Safari needs macOS.

## Install

Antigravity:

```
agy plugin install https://github.com/extensiondev/skill/tree/main/plugin
```

The plugin installs enabled, with no API key to enter. In the Antigravity
App it shows under Customizations > Installed; in the CLI, run `/plugin`.
Tool calls may run up to 21 minutes, so a Safari build (20 minutes at most)
answers on its own instead of being cut off.

Claude Code:

```
/plugin marketplace add extensiondev/skill
/plugin install extension-dev@extensiondev
```

Codex:

```
codex plugin marketplace add extensiondev/skill
```

Copilot CLI:

```
copilot plugin marketplace add extensiondev/skill
```

Cursor reads this folder as a plugin from a marketplace that imports the
repository. Without a plugin host, the two halves install on their own:
`npx skills add extensiondev/skill` for the skill, and
`claude mcp add extension-dev -- npx -y @extension.dev/mcp` (or the same
command in your client) for the server.

## How to use

Ask in plain words. The skill turns the ask into the right chain of tools.

- "Create a Chrome extension that highlights every external link on the
  page, and prove it injects."
- "Add a side panel to my extension."
- "Run it and show me what the popup renders."
- "Build it for Chrome and Firefox from one codebase."
- "Get it ready for the Chrome Web Store, Edge Add-ons, Firefox Add-ons and
  the App Store, and tell me what the listing still needs."

## Included tools

The server starts with its local tools, which need no account:

- Create and build: `extension_templates`, `extension_create`,
  `extension_add_feature`, `extension_build`, `extension_docs_search`.
- Run: `extension_dev`, `extension_start`, `extension_wait`,
  `extension_stop`, `extension_browsers`.
- See: `extension_logs`, `extension_inspect`, `extension_dom_snapshot`,
  `extension_screenshot`, `extension_list_extensions`,
  `extension_manifest_validate`, `extension_analyze`, `extension_doctor`.
- Test and act: `extension_assert`, `extension_element`,
  `extension_open`, `extension_reload`, `extension_storage`,
  `extension_eval`.

Publishing, store submission and releases are platform tools on
extension.dev. They stay off until the server starts with
`--features=local,platform`, and they ask for a login the first time. The
full reference is at https://docs.extension.dev/tools/mcp.

## What it runs, sends and fetches

- The MCP server starts with `npx -y @extension.dev/mcp@<pinned version>`,
  which downloads the package from `registry.npmjs.org` on first use. It runs
  on your machine and reads the project folder you point it at.
- Running or previewing an extension launches a browser on your machine with
  the extension loaded. Inspection reads that browser's DOM, console and
  storage. Page content read this way is treated as untrusted data.
- Scaffolding fetches the template catalog from `registry.extension.land` and
  template files from `raw.githubusercontent.com`.
- Installing a managed browser downloads it: Chrome from
  `storage.googleapis.com` after reading versions at
  `googlechromelabs.github.io`, Firefox from `archive.mozilla.org` after
  reading versions at `product-details.mozilla.org`, and Edge from
  `cdn.playwright.dev`, `playwright.download.prss.microsoft.com` or
  `packages.microsoft.com`.
- The platform tools (login, builds, publish, store submission, release
  promotion) stay off until the server starts with
  `--features=local,platform`. They talk to `www.extension.dev` and
  `mcp.extension.dev` with the token the login flow stores, and send a
  per-install id header. A store submission or a stable promotion never runs
  without a human approval. Docs search reads `docs.extension.dev`.
- Telemetry: after a successful scaffold the server sends one event to
  PostHog at `us.i.posthog.com` (template slug, source and commit, a random
  per-process session id, never a path or a name).
  `EXTENSION_DEV_NO_TELEMETRY=1` or `DO_NOT_TRACK=1` turns it off.

## Privacy policy

The plugin itself stores nothing. What the server sends is listed above, and
the platform's policy is at https://extension.dev/privacy. Support is at
https://extension.dev/support and the documentation at
https://docs.extension.dev.

## Source

The manifests in this folder are generated from `scripts/plugin.source.json`
at the repository root by `npm run plugin:build`, and the skill here is a
copy of `skills/browser-extension`. Edit the source, never this folder.

Apache-2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators.
