# Changelog

## Unreleased

- Three more descriptions lose the framework's name. The `package.json`
  description is the skill's own line: "The Agent Skill that teaches your
  AI agent to build, debug and publish browser extensions for Chrome,
  Firefox, Edge and Safari." The marketplace's own description is the first
  line every listing carries: "Build, run, debug, test and ship Chrome,
  Firefox, Edge and Safari extensions from your AI agent." The plugin's
  long description opens "extension.dev is the platform where browser
  extensions ship." and no longer names the framework they are built with.
- The plugin's description is the one first line every listing carries:
  "Build, run, debug, test and ship Chrome, Firefox, Edge and Safari
  extensions from your AI agent." The tail "on the extension.dev platform
  with the Extension.js framework" leaves `scripts/plugin.source.json` and
  the eight manifests generated from it.
- The README shows the four browsers in place of the platform logo, level
  with the install line beside it, and opens with one paragraph that says
  what the skill is and which agents it serves. Its prose no longer names
  the framework: it says "the engine", and only the link in the link row,
  the `extension` command, the `extension.js` checkout the sync tests read
  and its repository name stay as written. The stack section's closing line
  is gone and the Community list points skill issues at this repository.
- The release no longer rewrites the README image width.
  `scripts/readme-logo-width.mjs`, the `prepack` and `postpack` scripts that
  called it and its step in the release workflow are gone: the image is
  sized by one percentage on GitHub and npm.
- WebAssembly guidance, which the skill had none of: no match for
  WebAssembly, `wasm`, `'wasm-unsafe-eval'` or remotely hosted code, while
  "no remote code" and "CSP intact" could be read as forbidding the grant a
  WebAssembly extension needs. Core rule 2 in `SKILL.md` now says an
  extension page or service worker that compiles a `.wasm` module adds
  `'wasm-unsafe-eval'` to `content_security_policy.extension_pages` (never
  `'unsafe-eval'`), ships the binary inside the package through
  `new URL("./file.wasm", import.meta.url)` instead of a CDN at run time,
  and compiles in the background or an extension page, never in a content
  script. The API gotchas reference carries the exact Chromium error (it
  names `'wasm-eval'`, which no manifest accepts), the manifest line, the
  packaging rule and the content script limit, measured on Chromium 156
  and Extension.js 4.1.41, with the Firefox MV3 requirement as MDN
  documents it. Store readiness item 4 says the grant stays, and the
  STORE.md maintenance rules say to record it as a bullet under
  `### Permissions justification` and in the Firefox reviewer notes.
- The skill's description also says to load it before running, loading,
  opening or inspecting an extension in a browser and before reporting what
  it did (scripts that ran, storage, logs), and adds "run" and "check" to
  the asks it names; every earlier trigger stays, in 1012 of the 1024
  characters the spec allows. On the five live-session tasks of the
  2026-11-18 sweep the skill loaded in 0 of 15 runs, so the rule against
  loading `src/` was never read and 4 of 5 runs still loaded it. The README
  line for agents without skills support names running an extension too.
- Five rules from the 2026-11-18 eval triage, each stated in `SKILL.md` at
  the step where the agent decides (no run in that sweep opened a
  reference file) with the detail in the references. Core rule 12 and the
  content script and options references say a content script cannot
  `await` at its top level, because it is a classic script and the build
  refuses it; 4 runs wrote one after reading "No `.then()` chains". Step 5
  and the project structure reference say a missing `node_modules` is no
  reason to skip the build: install, or run the pinned engine through
  `npx`; 9 of 9 runs on one task reported without building. Step 4 and the
  cross-browser and debugging references say never to load `src/` into a
  browser and to load `dist/<browser>`; 4 runs loaded `src/` and concluded
  nothing ran. Core rule 11 and the store readiness checklist say a
  128x128 PNG on disk that `icons` does not declare is declared and
  rebuilt, and only when none exists a plain placeholder is saved at
  `icons/icon-128.png`, declared and reported to the owner (owner ruling
  of 2026-11-18, the wording the MCP server answers with); 2 runs left the
  file undeclared for the owner. Step 3 and the cross-browser reference
  say Firefox's `menus` permission grants only the `menus` namespace, so
  `contextMenus` stays in the permissions when the code calls it.
- The agent writes the Firefox add-on ID. When a manifest bound for Firefox
  has no `browser_specific_settings.gecko.id`, `SKILL.md` step 3 and the
  cross-browser, migrating and STORE.md references say to write a
  provisional `<project-name>@<domain>` under the `firefox:` prefix, tell
  the owner it locks at the first Firefox submission and record it in
  STORE.md as provisional until the owner confirms it (owner ruling of
  2026-11-18). The data declaration stays the owner's and is stated apart
  from the ID. In the 2026-11-18 `firefox-port` runs the skill arm left the
  ID out in 4 of 5 and the MCP plus skill arm in 3 of 5, with "Both are
  your decision as the owner"; `SKILL.md`, the only skill text those runs
  read, named the ID nowhere and the owner's declaration twice.
- cross-browser.md's Firefox data collection example names no value: the
  block shows a placeholder for the categories the owner declares, and the
  text no longer maps an extension type to categories (owner ruling of
  2026-11-17: no doc names a value).
- cross-browser.md no longer says templates ship Firefox's
  `data_collection_permissions` by default (owner ruling of 2026-11-17: no
  default, the owner declares); a `"none"` block a project started with is
  shown to the owner as awaiting their answer.
- The project structure reference says to set `"moduleDetection": "force"`
  in `tsconfig.json`, or to end an import-less script with `export {}`. In
  the 2026-11-17 sweep every hand-written TypeScript sidebar declared a
  top-level `const status` in a script with no import and failed the type
  check with TS2451 against the DOM lib's global.

- The skill's description says to load it before writing or editing any
  extension file, even for a small change and even when the extension.dev
  MCP tools are connected, and names the asks it had left out: "build",
  "make", "fix" or "change" an extension, and a move to Manifest V3. In the
  2026-11-17 sweep the skill loaded in 10 of 10 runs on two tasks when it
  was alone and in 0 of 10 when the MCP server was connected beside it, and
  in 0 of 20 on two edit-in-place tasks either way.

- The "did my content script inject?" row and the debugging playbook name
  the MCP `extension_dom_snapshot` beside `extension inspect` and
  `extension_inspect` for reading what a content script injected, and the
  `--max-bytes` line matches what `extension inspect --help` prints on
  4.1.41. The 2026-11-17 sweep graded 4 of 5 plans as missing the inspect
  step; all 5 had it, spelled `npx extension@latest inspect`, and the
  `injection-debugging` eval now says that spelling counts.

- `SKILL.md` drops the sentences it said twice, so the two rules added
  after the 2026-11-17 sweep cost no length: the `extras` note repeated in
  the MCP-only list and the doctor paragraph, the second "stop the session"
  line and its table row, the second pointer to the debugging reference and
  the closing line on shell fallbacks. Each still stands once in `SKILL.md`
  or in `references/debugging.md`.

- Getting ready for a store has its own workflow step. An eval sweep of
  2026-11-17 saw 8 of 10 runs with the skill write a flat `STORE.md` and 4
  add Firefox's `data_collection_permissions`, one of them after the build
  warned that AMO requires it; only the runs that opened
  `references/store-md.md` got both right. Step 8 names the file's shape
  (the shared sections, then one `##` section per store) with the pointer to
  the reference, and states the owner rule with its reason: every data-use
  and privacy declaration is one the owner certifies, so the agent quotes
  the code facts and asks. `references/store-md.md` opens with the same
  rule, and its template leaves the privacy rows as `TODO (owner)`.

- A new extension starts from the scaffold by any phrasing. An eval sweep of
  2026-11-17 saw agents load the skill and still write a root
  `manifest.json` with no `package.json` for "create an extension that ...":
  step 2 said "Only the manifest is required" and core rule 1 said to start
  every project at `manifest.json`. Step 1 now says to run
  `extension create` (MCP `extension_create`) whatever the ask is called,
  why a lone root manifest cannot be built or verified, and that a
  hand-written project keeps the scaffold's layout; step 2 and core rule 1
  name `src/manifest.json`. The `cross-browser-sidebar` eval asserts the
  root `package.json`.

- Ledger 892. The plugin starts the MCP server at `@extension.dev/mcp@11.0.0`
  (it was 10.22.0, from before the hosted move). `mcp-sync` now holds the
  pin: every plugin file names the version in `scripts/plugin.source.json`,
  and the live CI step fails when that version is not on npm, or when the
  MCP checkout carries a newer version that npm already serves. A newer
  version that is not published yet passes with a note.
  `npm run plugin:pin -- <version>` moves the pin and regenerates the files.

- Ledger 886. The skill follows the MCP's three feature groups. Every place
  that names `extension_network` or `extension_theme_verify` says the tool is
  listed only when `extras` is in `--features`
  (`--features=local,platform,extras`), and the core rules say to name that
  value when either is missing or answers `E_TOOL_DISABLED`. The
  `extension_try` write-off places it in the platform group. The three build
  acts (`rebuild`, `configure`, `create-channel`) are taught on
  `extension_builds_act`, which the MCP split from `extension_builds`.

- Ledger 823. The core rules and
  `references/api-gotchas.md` now carry the rules the skill had skipped:
  `chrome.alarms` over timers, `permissions.request()` in the clicked page's
  handler before any `await`, `action.onClicked` and `default_popup`, the
  `openPanelOnActionClick` key, yielding between DOM batches, one offscreen
  document, a state lock for exclusive resources, and a section on the APIs
  not every browser ships (Prompt API, capture, user scripts, identity and
  the manifest `key`). The dynamic code line records a measurement on
  Chromium 143: only the manifest sandbox page ran an inline script.
  `references/store-md.md` says to fold a `CHROMEWEBSTORE.md` into
  `STORE.md`, the file the submission reads.

- Ledger 766. The test lane runs under a network guard
  (`test/setup/network-guard.preload.mjs`, loaded with `--import`): a test
  that reaches a host fails by name, also when the caller swallowed the
  refusal. The registry catalog read in `templates-sync` is the one live
  read; it runs in its own CI step and `npm test` skips it.

- Ledger 559. The skill no longer teaches the Chrome store icon as 96x96
  artwork inside a 16 px transparent margin. The STORE.md reference names
  the store icon as the 128x128 px PNG from the manifest icons, the size
  Chrome requires, and says nothing about how the logo is drawn, matching
  the MCP, which stopped commenting on icon art.

- Ledger 551. The skill teaches `extension_element` (click, fill, read or
  wait on one element, and trusted mouse and keyboard input over the
  session's debug port, Chromium only, no `allowEval`) and
  `extension_network` (stub a response by rule on a Chromium session, list
  or clear the rules, read which requests hit or missed) beside the other
  local verbs: the MCP-only list, the verify table and the ask table in
  SKILL.md, and two sections in `references/debugging.md` with the call
  shape and the limits each tool states. Both leave `NOT_TAUGHT` in
  `test/mcp-sync.test.mjs`, so the registry cell holds the skill to them
  from now on.
- Ledger 550. `test/mcp-sync.test.mjs` reads the live tool registry from the
  MCP checkout's `docs/tools.json`, the file the MCP's own
  `docs-match-the-code` test keeps equal to the tool array, instead of a
  README table the MCP no longer carries; the two registry cells had failed
  with "no tool rows found" since that README rewrite. The MCP checkout is
  found at the `mcp` sibling (`public/mcp` beside `public/skill` in the
  monorepo since 2026-11-12, or a sibling clone) or through
  `EXTENSION_DEV_MCP_REPO`; the `public-extensiondev-mcp` candidate is gone.
  Reading the registry again showed `extension_element` and
  `extension_network` registered and untaught, so both are written off in
  `NOT_TAUGHT` with the reason until the skill teaches them, and the
  `extension_try` write-off now says the published MCP serves it.

## 1.4.0

- Ledger 524. The skill is `browser-extension`: the folder is
  `skills/browser-extension`, the frontmatter `name` matches, and the
  description says in the words people type what it does (builds, runs,
  debugs, tests and ships Chrome, Firefox, Edge and Safari extensions) and
  when to load it (Chrome Web Store, Edge Add-ons, Firefox Add-ons, the App
  Store, a review rejection, a privacy policy, the manifest, a service
  worker, a content script, a popup), naming extension.dev as the platform
  and Extension.js as the framework. No prose states a tool count or a
  pinned MCP version any more, and `test/mcp-sync.test.mjs` now fails on
  one. An install made under the old name keeps working but gets no
  updates: the skills CLI resolves a locked skill by its recorded path and
  then by its name, and the rename moved both, so `npx skills update`
  reports it as deleted upstream and offers to remove it; re-add with
  `npx skills add extensiondev/skill`.
- Ledger 523. One `extension-dev` plugin, in `plugin/`, replaces the two
  plugins the skill and the MCP server shipped: it carries the skill and the
  `@extension.dev/mcp` launcher pinned to an exact published version, with
  `displayName`, the documentation, support, privacy and terms URLs, and one
  manifest per client (Claude Code, Codex and ChatGPT through the Agent
  Plugins layout, Cursor, Copilot CLI, Antigravity), all generated from
  `scripts/plugin.source.json` by `npm run plugin:build`; `npm run
  plugin:check` and `test/skill-structure.test.mjs` fail when the folder
  drifts, CI runs `claude plugin validate --strict` on the plugin and on the
  marketplace, and the release workflow runs `npm run plugin:pin` so each
  release moves the launcher to the server version npm serves. The
  marketplace entry no longer sets `strict: false` beside a `skills` list.
  The standalone installs, `npx skills add extensiondev/skill` and
  `npx @extension.dev/mcp`, are unchanged. The approved 512 px brand mark
  lives at `assets/icon-512.png` and the generator copies it into the plugin
  as the icon every manifest names.
- Ledger 528. The generator also writes `gemini-extension.json` at the
  repository root (`name`, `version`, `description`, `mcpServers` with the
  same pinned launcher) in the shape of Gemini CLI's extension reference;
  Gemini CLI installs the repository as a whole and discovers the skill
  under `skills/` on its own, so no context file is needed. The GitHub topic
  `gemini-cli-extension` is a separate step.

## 1.3.0

- The `store-readiness` eval follows Cezar's ruling of 2026-11-01: the agent
  writes STORE.md's own fields and leaves every data-use and privacy row,
  the Firefox `data_collection_permissions` declaration included, to the
  owner with the code facts quoted beside it, reports the missing
  declaration instead of adding it, and asks for the answers in one short
  list. The publishing, cross-browser, migrating and STORE.md references
  no longer tell the agent to write that declaration.
- The STORE.md reference teaches the listing draft `extension_submit_check`
  `preflight` answers with `projectPath` (MCP 10.22.0):
  `value.readiness.listingDraft` holds `storeMd` (a STORE.md to save when the
  project has none, with only the manifest's own name and summary),
  `fromCode`, `agentWrites` (the prose lines the agent writes, each with its
  section, stores, limit and the code facts to write it from),
  `ownerAnswers` and `gallery` (each store's screenshot folder measured
  against the store's sizes and alpha rule, with the capture call for an
  empty one). Under Cezar's ruling of 2026-11-01 the owner answers every
  data-use and privacy row: the agent quotes the code facts and never
  drafts an answer or a PRIVACY.md.
- The publishing reference teaches `value.releaseLoop`: where each store's
  upload lands under its saved or least public default mode, the acts still
  owed, the approval count, and the fold that would put a store on one
  approval, named as the owner's choice and never saved by the agent; then
  the first-submission flow for a new project and the one-sentence,
  one-approval second release watched with `extension_release_status`. It
  no longer says a store's publish mode cannot be read.
- Two evals cover it: `listing-draft-owner-answers` and
  `ship-all-four-stores-release-loop`.
- The STORE.md reference carries the bring list the board's store-assets
  plan adopted on 2026-10-26: `extension_submit_check` `preflight` answers each
  store's rows with "from your build" or "you supply", the store's own
  sizes, counts and documentation links, `readyForReview` per store and the
  door that clears each row; the Screenshots door (`extension_screenshot`
  `forStore`, then `sync-listing` `screenshots`) replaces the retired
  `- Screenshots:` line, since STORE.md carries no image; the decide-once
  rows (`gecko.id`, the Safari bundle id, the App Store name, the item, the
  product, the app record) are written at creation; privacy and data
  answers are never prefilled; and a review send the platform refuses with
  `409 LISTING_INCOMPLETE` is relayed as `listing-incomplete` with nothing
  recorded. The starter STORE.md exists at project creation; the agent fills
  it rather than writing one on publishing intent.
- The STORE.md reference reads the bring list from `extension_submit_check`
  `preflight`, the read-only tool MCP 10.20.0 added. It asks for `- License:`
  only for a listed Firefox version and names Safari as a `- Search terms:`
  reader, as the MCP reader does.

## 1.2.2

- The templates reference points agents at the registry catalog as the
  source of truth for the template list and its downloads: the pointer at
  `registry.extension.land/extension-dev/catalog/latest.json` names the
  pinned commit and the immutable catalog document for it, each template
  carries `downloads` and `integrity` from the registry build and a
  `repositoryUrl` and `sources.base` pinned to that commit, and files are
  read from raw GitHub at the pinned commit, never at `main`. The reference
  used to send agents to a GitHub nightly release asset and to say the
  templates site served no metadata; the site publishes the same metadata
  as a mirror of the catalog. The `templates-sync` test reads the catalog
  instead of the nightly asset.
- The skill teaches `extension_submit_check` and `extension_approvals`,
  the two platform tools the published `@extension.dev/mcp` 10.20.0
  registers and the skill never named. A store act now takes two calls:
  `extension_submit_check` reads, rehearses and asks a workspace owner for
  the approval, and `extension_submit` with that `approvalId` runs it once.
  `extension_approvals` reads where an approval stands, or revokes one that
  has not run yet. The step that said `dryRun: false` dispatches now says
  it only asks for the approval. The skill states 38 tools (37 in the
  published 10.20.0) and 13 platform tools. `extension_try`, on MCP main
  and not published yet, is written off in the `mcp-sync` test until the
  next MCP publish.

## 1.2.1

- The skill teaches `extension_screenshot`, the local tool
  `@extension.dev/mcp` 10.14.0 added, and states the new count of 35 tools
  (24 local, 11 platform). Asked what a popup or page looks like in a live
  `extension_dev` or `extension_start` session, the agent calls the tool,
  which saves a .png of the open surface or page inside the project and
  answers its path and pixel size; the one rule is that `path` stays inside
  `projectPath` and ends in `.png`, or the call is refused. Agents used to
  script `screencapture`, AppleScript or Playwright for a picture the
  session could hand them.
- The verify table says what the 10.14.1 server does: `extension_wait`
  with `for: "rebuild"` answers once the compile and the reload have both
  happened, never from the compile write alone; `extension_eval` with
  `until` ends the whole call inside its `timeoutMs`; and `extension_stop`
  with `browser` ends only that browser's session, so stopping firefox
  leaves a chrome session and a person's own `npm run dev` running.
- The publishing reference states the Firefox rule as the platform ships
  it: a submission with no saved release channel uploads unlisted, always,
  never a channel read from AMO's current listing, and a saved channel is
  used as is; an add-on AMO already lists, with no saved channel, is
  refused before upload until a release channel is saved in the store
  settings. The reference used to say an unset channel submitted as
  listed and told the agent to set Unlisted first.
- The share rule and the publishing reference name the two links the
  `@extension.dev/mcp` publish answer carries: a build link pins one build
  and, on a private project, expires at `value.link.expiresAt`, a date the
  agent tells the person instead of the plan policy; a channel link always
  opens the newest build and never expires, on a project made public in
  its extension.dev project settings (not the GitHub repository) and, once
  it ships, on a channel marked public on the console Releases page. They
  no longer call a private project's link a public page.

## 1.2.0

- Every share, publish, distribute, send-to-testers, get-a-link or store
  ask now leads with extension.dev, in one order: create the project and
  log in when there is none, `extension_publish` for the build's public
  page (a download and a run command per browser), the emulator link from
  `extension_preview_web` as a second link, and `extension_submit` for the
  stores, with AMO unlisted as the route to a signed Firefox build. The
  skill says the preview runs content scripts on its sample pages only and
  that this never justifies sending a zip by hand. Asked how to share
  builds, agents used to send the zip from `dist/`, sign on the AMO site by
  hand and cut a repository release.
- The workflow names the MCP tool before the shell command for dev, build
  and preview, and the standing rules say to run those tools rather than
  hand the person `npm run dev`. Agents used to tell people to run commands
  the agent could have run itself.

## 1.1.0

- Add a guide for migrating projects from other extension frameworks.
  The skill recognizes the source from the project's files and moves it
  over step by step: a hand-written manifest, plain modules in place of
  wrappers, stored data that stays readable, and the exact build and type
  errors a half-finished move leaves, with the fix for each. Agents moving
  such a project used to reset users' saved settings and miss leftovers
  that build green and fail at runtime.
- The skill teaches `extension_builds` and `extension_workspace`, the two
  platform tools `@extension.dev/mcp` 10.12.0 added, and states the new
  count of 34 tools. `references/publishing.md` says which build actions
  only read and which change the project (a rebuild spends the build
  allowance, a settings change waits for an owner's approval), and SKILL.md
  says the platform tools stay off until the server starts with
  `--features=local,platform`. Agents asked why a platform build failed
  used to have no tool to name.
- The content script reference says editing `matches` during a dev session
  needs no restart: the dev server reloads the extension on a manifest
  change and asks for a restart only when an entry is added or removed.
  Agents used to tell users to restart for a `matches` fix. Rule 4 says the
  same, so the advice holds even when the agent never opens the reference.

## 1.0.3

- Rule 17 and the debugging reference point `extension inspect` only at a
  local fixture page the project serves, never at a third-party site. The
  old wording also allowed any page the user named, and Snyk's agent scan
  rated the skill Medium for third-party content exposure on that path;
  with the scope narrowed the scan reports no risk.
- The templates reference lists `ai-chatgpt` under Sidebar beside
  `ai-claude`; it sat under Action popup, and every AI template is a side
  panel. The table placed it wrong, so agents listed it wrong.
- The "What people actually ask" table gains the add-a-surface row: "Add an
  options page" (or a side panel, a content script) means
  `extension_add_feature` first, then write what the plan says, then
  `extension_manifest_validate` and `extension_dev`. Rule 4 says the same
  and stops calling the tool a scaffolder; it plans, the agent writes.
  Agents used to hand-write the files without ever calling the tool.
- Rule 5 and the project-structure, cross-browser, debugging and
  publishing references say where a build lands the way the engine does
  it: `extension build` with no `--browser` targets chromium and writes
  `dist/chromium/`, so a scaffolded `npm run build` lands there, while
  `--browser=chrome` writes `dist/chrome/`. The agent reads the folder
  from the build's answer instead of assuming `dist/chrome/`.
- LibreWolf leaves the promoted browser lists (the package description,
  the skill description and the cross-browser reference): it ships with
  remote debugging off, so a dev session refuses to launch until its
  overrides file is edited. The accepted `--browser` value stays documented
  with that caveat.

## 1.0.2

- Rule 6 and the cross-browser reference no longer say `chromium:world`
  hard-fails the Chromium build. Measured with Extension.js 4.1.31, it
  builds and gives the same Chromium output as the unprefixed `world`
  key, and keeps Firefox on the isolated world. Unprefixed `world` stays
  the default.

## 1.0.1

- `references/publishing.md` teaches the `projects` input on
  `extension_project_create` and on `extension_auth` login: one approval for
  several projects in one workspace, the exact-slug rule, the cap of 10
  creates per approval (ten now, the next ten once the hourly limit
  allows), the `creating` resume loop and how to read the per-project
  rows. It needs `@extension.dev/mcp` 10.10.9 and a
  platform that accepts a list.

## 1.0.0

The skill moves to Apache-2.0, and it finally covers the tools it was
missing, including store submission and the new assertion stage.

### Changed (2026-09-30, from nine real migrations)

- The canonical layout draws `pages/`, `scripts/` and `public/` at the
  project root, where the engine discovers them, instead of under `src/`,
  and warns about the `scripts/` clash with repository tooling.
- `project-structure.md` says that engines up to 4.1.30 resolve `public/`
  next to the manifest, so a `src/manifest.json` cannot name an icon kept in
  root `public/` until the project upgrades.
- The CSS Modules line gives the named-import form and the `namedExports`
  switch that engines up to 4.1.30 need for a default import.
- A new `references/migrating.md` carries the checklist an existing
  webpack, Vite, gulp or pug extension needs, linked from workflow step 1.

### Added

- **Looking a fact up (`extension_docs_search`).** A keyword search over the
  Extension.js and extension.dev docs that returns pages with excerpts, free
  and with no login. The skill names it beside the other tools and says when
  to reach for it: before answering from memory on anything that changes by
  version, such as a CLI flag, a manifest field across browsers or a store
  submission rule. It is MCP-only; no `extension` command exists for it.
- **Asserting expectations (`extension_assert`).** The platform had nine
  inspection primitives and no assertion verb, so an agent had to hand-roll
  every expectation as an `extension_eval` string and judge the result
  itself, which is exactly the guessing this skill exists to prevent. The
  skill now teaches the five checks and, more importantly, the discipline:
  **every verdict is pass, fail or inconclusive, and inconclusive is neither**.
  It is not a soft pass and not a red against the extension; it means the
  question was not observable here, and every one carries a `settledBy`
  naming the evidence that would answer it. An empty expectation list is
  inconclusive too. The two results that look wrong and are not are written
  down: `content-script-injected` passes only on a line the content script
  itself wrote at that url in this run, so a covering `content_scripts`
  declaration is inconclusive rather than a pass, and
  `background-worker-booted` is inconclusive when the worker is merely
  dormant, because Chrome delists an idle MV3 worker and absence is not
  proof.

- **Store submission through extension.dev (`extension_submit`).** The
  publishing reference ran to 175 lines about shipping to stores and never
  named the tool that ships to stores. It now has a section of its own: what
  the tool does and does not do, why `dryRun` defaults to true, how to read
  the per-store preflight rows, and why `dryRun: false` is a one-way door
  into store review. This was the largest gap in the skill: the most
  consequential and least reversible action on the platform had no page.
- **Reading project state (`extension_release_status`).** Read-only, and the
  place a valid build sha comes from. The skill previously told agents to
  pass a build sha to `extension_release_promote` without saying where one
  comes from.
- **Sharing a build (`extension_preview_web`, `extension_shares`).** How to
  hand someone a link that opens the extension with no install, why
  `share: true` is required outside the extension.dev monorepo, that a share
  also serves the built code as a zip, and how to list or revoke a link
  afterwards. A share made without knowing `extension_shares` exists cannot
  be pulled back.
- **Session diagnosis (`extension_doctor`).** A CLI command and an MCP tool
  that names the broken leg of a dev session in dependency order. Run it
  before theorizing when an act tool errors. Includes the two readings that
  mislead: a `skip` means blocked, and a `read-only` status is a choice, not
  a fault.
- **Chrome theme verification (`extension_theme_verify`)**, noted in the
  debugging reference as the tool for themes rather than extensions.
- **A drift test against the MCP server** (`test/mcp-sync.test.mjs`). It
  derives the live tool registry from the MCP's own sources instead of
  trusting prose, and fails when the skill states the wrong tool count, names
  a tool the server retired, promises an `extension` CLI command that is not
  registered, calls a tool MCP-only when a CLI command exists for it, or when
  a newly registered tool goes undocumented without a written reason. CI and
  the release workflow now check out the MCP server alongside Extension.js.

### Fixed

- **The CLI parity claim was wrong.** The skill said nearly every MCP
  capability had an `extension` CLI equivalent, with three exceptions. In
  fact 13 of the 29 tools have a CLI command, and everything that talks to
  extension.dev has none. An agent reading the old claim would confidently
  tell a user to run commands that do not exist. The skill now lists the CLI
  commands that exist and the tools that are MCP-only, and both lists are
  held to their sources by the new drift test.
- **The publishing and STORE.md references pointed at a package readers
  cannot install.** They named a private deploy CLI as the way to mint a
  Chrome refresh token and to hold credentials in a local dotfile. That
  package publishes with restricted access, so the command answered 404 for
  everyone outside the company. The Chrome credential guidance now recommends
  the service account, which needs nothing minted, and credential storage is
  described on the console path it actually uses. A test now fails if any
  private package name reappears anywhere in this package.
- **The tool count** said 28 in the README and 29 in the skill; the server
  registers 30. The drift test now holds both to the registry, and it is what
  caught the change.
- **`STORE.md` advice is now trustworthy where it was guesswork.** The MCP's
  `STORE.md` parser is a pinned port of the one the real submission runs,
  held to it by a test that replays both over the same corpus, so the skill
  now says a missing-notes warning means a genuinely missing field. It also
  records the fact that bit people: the submission reads `STORE.md` from the
  source repository at the built commit, not from the working directory.
- **The platform hold** is described accurately. Device login works, and so
  does listing or revoking an existing share; five lanes answer 403
  `PLATFORM_NOT_OPEN` while the hold is on.

### Changed

- **License: MIT is now Apache-2.0.** Everything published up to and
  including 0.5.1 was released under MIT and stays MIT forever; you keep
  those rights on those versions. From 1.0.0 forward the license is
  Apache-2.0, which adds an express patent grant and requires anyone
  shipping a modified copy to state that they changed the files. Installing
  this skill and using it to build extensions is unaffected. The skill
  frontmatter and the plugin manifest, which still read MIT, now agree with
  the LICENSE file.
- The workflow gained a step for sharing a build and split publish from
  submit, because conflating the two is how an irreversible store submission
  happens by accident.

## 0.5.1

Honest browser support wording ahead of the Safari lane landing.

### Changed

- The package description, README, and skill frontmatter now say Safari
  is coming next instead of listing it alongside the browsers that are
  store-ready today. Chrome, Edge, Firefox, and every Chromium- or
  Gecko-based browser remain fully covered; nothing changes in the
  skill content.
- The maintainer contact email is now hello@extension.dev.
- The em dash guard in the structure test now checks for the actual em
  dash character instead of a substring that false-positived on AMO API
  URLs.

## 0.5.0

Introduces the `STORE.md` convention: one tracked file at the project root
holding listing copy, permission justifications, privacy disclosures, per
store reviewer notes, and version history, one section per store.

### Added

- New reference `references/store-md.md` with the template, the maintenance
  rules (manifest change, release, rejection, privacy shift), and the table
  of fields a submission sends automatically (Firefox reviewer and release
  notes, Edge certification notes).
- Workflow step 6 and `references/publishing.md` now direct the agent to
  create and maintain `STORE.md` as soon as publishing intent appears.
- The Chrome section mirrors the `CHROMEWEBSTORE.md` shape other agent
  tooling expects, so those agents find their sections here.
- Firefox `data_collection_permissions` coverage: cross-browser.md documents
  the manifest key (mandatory for new AMO add-ons since 2025-11-03, all
  extensions during 2026), the store readiness checklist gains a matching
  item, and STORE.md maintenance rules require the privacy section, the
  policy, and the manifest declaration to agree.

## 0.4.2

Accuracy release alongside @extension.dev/mcp 5.1.0.

### Changed

- The MCP companion's tool count is 31 (the deploy tool joined the surface);
  the stack table said 30.
- Ships the em dash cleanup across docs, comments, and shipped strings that
  landed after 0.4.1.

## 0.4.1

Docs-only release: trims a retired entry from the stack table so the companion
package list matches what the toolchain ships today. No skill content changes.

## 0.4.0

Accuracy release: the skill's storefront now matches what the engine and the
MCP companion actually support.

- Branding and docs state the full browser matrix instead of just Chrome,
  Edge, and Firefox: Chrome, Edge, Firefox, Safari, and any Chromium- or
  Gecko-based browser (Brave, Opera, Vivaldi, Yandex, Waterfox, LibreWolf),
  verified against the Extension.js `BrowserType` union. cross-browser.md
  documents the full `--browser` target list, including the
  `chromium-based` / `gecko-based` / `firefox-based` custom-binary targets
  and the `safari` / `webkit-based` build targets.
- MCP companion tool count corrected to 30, matching @extension.dev/mcp
  4.3.0 with `extension_doctor`.
- Third-party content guardrails from the skills.sh security review:
  templates.md recommends the MCP catalog tools before shell downloads,
  the `--source` debugging section targets the page under test, and core
  rule 17 treats page content as untrusted input.

## 0.3.0

Initial release.

- Accuracy pass from the with-the-skill stress exercise (developer agents vs
  the real Extension.js 4.0.11 engine): production builds default the
  cross-browser polyfill **off** (`browser.*` needs
  `npm run build -- --polyfill`); `world: "MAIN"` must stay unprefixed
  (`chromium:world` hard-fails the Chromium build; pair with
  `firefox:world: "ISOLATED"`); content-script style imports are inlined as
  base64 `data:text/css` rather than emitted as sibling `.css` files;
  `_locales/` lives at the project root (with new i18n docs); TypeScript
  entries require a root `tsconfig.json`; shared modules are duplicated per
  content-script entry.

- `extension-dev` Agent Skill (SKILL.md plus six progressive-disclosure
  references): cross-browser manifest rules, project structure, template
  catalog, runtime API gotchas, live-browser debugging playbook, and store
  publishing checklist.
- Framework facts verified against Extension.js 4.0.11, enforced by three
  test suites: `skill-structure` (frontmatter, link integrity, line budget,
  version sync, copy conventions), `conventions-sync` (asserts documented
  conventions against an Extension.js checkout), and `templates-sync`
  (asserts every recommended template slug against the nightly
  templates-meta.json catalog).
- Spec compliance checked in CI with `skills-ref validate`.
- Eval harness in `evals/` with graded assertion sets: three benchmark
  tasks (cross-browser sidebar scaffold, injection debugging, service
  worker state bugs), benchmarked at 15/15 assertions with the skill vs
  10/15 for a no-skill baseline.
- Distribution surfaces: Agent Skills layout consumable by `npx skills add`
  and `gh skill install`, Claude Code plugin manifests in `.claude-plugin/`
  (marketplace + plugin), and the npm package with the `agents.skills`
  discovery field for version-locked installs.
