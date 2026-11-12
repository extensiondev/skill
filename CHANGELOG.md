# Changelog

## Unreleased

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
