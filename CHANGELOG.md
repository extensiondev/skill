# Changelog

## 1.0.0

The skill moves to Apache-2.0, and it finally covers the tools it was
missing, including store submission.

### Added

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
- **The tool count in the README** said 28; the server registers 29.
- **`STORE.md` advice is now trustworthy where it was guesswork.** The MCP's
  `STORE.md` parser is a pinned port of the one the real submission runs,
  held to it by a test that replays both over the same corpus, so the skill
  now says a missing-notes warning means a genuinely missing field. It also
  records the fact that bit people: the submission reads `STORE.md` from the
  source repository at the built commit, not from the working directory.
- **The September 6, 2026 platform hold** is described accurately. Device
  login works, and so does listing or revoking an existing share; five lanes
  answer 403 `PLATFORM_NOT_OPEN` until that date.

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
