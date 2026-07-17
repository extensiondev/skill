# Changelog

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
