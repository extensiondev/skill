[npm-version-image]: https://img.shields.io/npm/v/@extension.dev/skill.svg?color=26FFB8
[npm-version-url]: https://www.npmjs.com/package/@extension.dev/skill
[action-image]: https://github.com/extensiondev/skill/actions/workflows/ci.yml/badge.svg?branch=main&color=26FFB8
[action-url]: https://github.com/extensiondev/skill/actions
[discord-image]: https://img.shields.io/discord/1253608412890271755?label=Discord&logo=discord&style=flat&color=26FFB8
[discord-url]: https://discord.gg/v9h2RgeTSN

# @extension.dev/skill [![Version][npm-version-image]][npm-version-url] [![skills.sh](https://skills.sh/b/extensiondev/skill)](https://skills.sh/extensiondev/skill/extension-dev) [![CI][action-image]][action-url] [![Discord][discord-image]][discord-url]

> The Agent Skill for cross-browser extension development. Teaches your coding agent to build, debug, and publish for Chrome, Edge, Firefox, Safari, and every Chromium- or Gecko-based browser.

<img alt="Logo" align="right" src="https://media.extension.land/brand/extension-dev/logo-dock.png" width="18.4%" />

```bash
npx skills add extensiondev/skill
```

Works with Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, and any agent that supports the open [Agent Skills](https://agentskills.io) format.

[Documentation](https://extension.dev) · [MCP server](https://www.npmjs.com/package/@extension.dev/mcp) · [Extension.js](https://extension.js.org) · [Discord](https://discord.gg/v9h2RgeTSN)

## Why @extension.dev/skill

Powered by [extension.dev](https://extension.dev) and the open-source
[Extension.js](https://extension.js.org) framework, this is the knowledge
half of the extension.dev agent stack:

- **[@extension.dev/mcp](https://www.npmjs.com/package/@extension.dev/mcp)**
  gives agents *hands*: 30 MCP tools for scaffolding, building, live DOM
  inspection, log streaming, publishing, and headless release promotion.
- **@extension.dev/skill** gives agents *judgment*: when to use which tool,
  the cross-browser rules, the silent-failure gotchas, and the publish
  checklist, packaged in the open [Agent Skills](https://agentskills.io)
  format (SKILL.md plus progressive-disclosure references).

The skill works standalone: every capability documents the `extension` CLI
path. It shines when the MCP server is connected, because the skill tells the
agent to verify against the live browser instead of guessing, and the MCP
tools make that a one-call operation.

In the shipped benchmark, a skill-equipped agent passed **15/15** graded
assertions; the no-skill baseline passed 10/15. Details and reproduction in
[Why a skill on top of an MCP server](#why-a-skill-on-top-of-an-mcp-server).

## Install

The skill is plain markdown in the open Agent Skills format. Every lane
below installs the same skill; pick the one that fits your setup.

### Any agent, one command

```bash
npx skills add extensiondev/skill
```

Installs into every agent detected on your machine. Use `-g` for user scope
instead of project scope, or `-a claude-code` (or `-a cursor`, `-a copilot`,
...) to target one agent.

### Claude Code, native plugin flow

```
/plugin marketplace add extensiondev/skill
/plugin install extension-dev@extensiondev
```

### GitHub CLI

```bash
gh skill install extensiondev/skill extension-dev
```

### npm, version-locked

The same skill ships inside the npm package, pinned to the package version,
so it can ride your dependency tree and update with `npm update`:

```bash
npm i -D @extension.dev/skill
```

The package declares the `agents.skills` field, so npm-aware skill
installers (for example [skills-npm](https://github.com/antfu/skills-npm),
via a `"prepare": "skills-npm"` script) link it into your agents
automatically on install. Manual fallback for Claude Code:

```bash
cp -R node_modules/@extension.dev/skill/skills/extension-dev .claude/skills/
```

### Agents without skills support

Add one line to your `AGENTS.md` (or `CLAUDE.md`):

```
For any browser-extension work, read .agents/skills/extension-dev/SKILL.md before writing code.
```

### Pair with the MCP server

```bash
claude mcp add extension-dev npx @extension.dev/mcp
```

## Your first prompt

After installing, try:

```
Create a browser extension that highlights every external link on a page.
It must work on Chrome and Firefox from a single codebase, and I want proof
it actually injects: inspect the live browser, do not just tell me it works.
```

A skill-equipped agent will scaffold from a template, write one prefixed
manifest instead of two, and verify injection with `--source-probe` or the
MCP inspection tools instead of declaring victory.

## What's inside

```
skills/
  extension-dev/
    SKILL.md                     Triggering metadata + workflow + core rules
    references/
      templates.md               50+ template catalog as a pattern library
      project-structure.md       Layout, entry wiring, special folders, env vars
      cross-browser.md           chromium:/firefox: prefixes, API namespaces
      api-gotchas.md             Service worker lifetime, gestures, messaging
      debugging.md               --source, --logs, act tools, diagnosis playbook
      publishing.md              Builds, zips, store checklist, extension.dev publish
```

The SKILL.md body stays small and always loads when the skill triggers; the
agent reads only the reference file that matches the task at hand.

## Why a skill on top of an MCP server

An MCP server can expose a live-DOM probe, but nothing makes an agent think
to call it when a content script silently fails to inject. Skills shape
behavior before any tool is called.

In the shipped benchmark (three tasks, five graded assertions each,
identical prompts), the skill run passed **15/15** assertions against 10/15
for a no-skill baseline. The baseline hand-rolled per-browser manifests with
custom build scripts and debugged by opening four consoles manually; the
skill run produced a single prefixed manifest and an evidence-driven
debugging plan. The harness, fixtures, and assertion sets ship in `evals/`,
so the numbers are reproducible.

## Accuracy and versioning

Framework facts in the references (prefix families, override semantics,
canonical output naming, special folders, env prefix) are verified against
the Extension.js source and carry a "verified against Extension.js x.y.z"
pin. Three test suites plus a spec check enforce this:

```bash
npm test
npx skills-ref validate skills/extension-dev
```

- `skill-structure` validates frontmatter, reference links, the
  progressive-disclosure line budget, version sync across the plugin
  manifests, and copy conventions.
- `conventions-sync` asserts the documented conventions against an
  Extension.js checkout (`EXTENSION_JS_REPO` env var, or a sibling
  `extension.js` directory) and skips when none is present. CI should check
  out [extension-js/extension.js](https://github.com/extension-js/extension.js)
  alongside this repo so the suite never silently skips.
- `templates-sync` asserts every template slug the skill recommends against
  the nightly templates-meta.json release asset, and skips offline.
- `skills-ref validate` checks the skill against the open Agent Skills
  specification.

When Extension.js changes a documented convention, the sync test fails and
names the reference file to update. Bump the version pin when re-verifying.

## Contributing

The skill content is plain markdown; edit, run `npm test`, and open a pull
request. For changes to framework facts, include the Extension.js source
reference that backs the claim. The eval harness in `evals/` (prompts,
fixtures, assertions) is the regression suite for behavioral changes; see
the eval metadata files for the assertion sets.

## The extension.dev stack

| Package | Use it to |
| --- | --- |
| [`@extension.dev/mcp`](https://www.npmjs.com/package/@extension.dev/mcp) | Give AI agents tools to build, run, debug, and publish extensions |
| [`@extension.dev/artifact-integrity`](https://www.npmjs.com/package/@extension.dev/artifact-integrity) | Verify extension artifacts and gate CI on tampered bytes before they ship |

All of it rides on [Extension.js](https://github.com/extension-js/extension.js), the open-source cross-browser extension framework.

If the skill saves your agent a debugging session, a
[star on GitHub](https://github.com/extensiondev/skill) helps other
extension developers find it.

## License

MIT (c) Cezar Augusto and the extension.dev collaborators
