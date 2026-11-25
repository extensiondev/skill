# Contributing

Thanks for helping. This guide covers how to run the suite, how to report a bug and how a change lands.

## Run the suite

You need Node.js 20.18 or newer.

```bash
npm install
npm run lint
npm test
npm run plugin:check
npx -y skills-ref validate skills/browser-extension
```

`npm test` blocks the network and skips the live reads. `npm run test:live` runs them against the registry catalog and npm.

The sync suites read an Extension.js checkout and an extension.dev MCP checkout. Point `EXTENSION_JS_REPO` and `EXTENSION_DEV_MCP_REPO` at them, or clone them as sibling directories; without them those cells skip locally and fail in CI.

The `plugin/` and `plugin-codex/` folders are built from the source. After you edit the skill, run `npm run plugin:build` and commit the result; `npm run plugin:check` fails when they differ.

## Report a bug

Open an issue with the [bug form](https://github.com/extensiondev/skill/issues/new?template=bug_report.yml). Name the agent, the prompt, what the agent did and what the skill should have taught it instead.

Security reports never go in a public issue. See [SECURITY.md](SECURITY.md).

Questions and ideas are welcome on [Discord](https://discord.gg/BRqbPDfPxb).

## Send a change

- A change to an engine fact includes the engine source reference that backs it.
- A behavioral change names the eval in `evals/` that covers it, or adds an assertion there.
- Write copy in American English, with no em dashes.
- Leave the version and the changelog alone. The maintainers cut releases from CI.

### Commit messages

One natural sentence, at most 74 characters, with no prefix such as `feat:` or `fix:` and no trailers.

```text
Point the debugging reference at the per-browser console logs
```

## Code of conduct

Everyone who takes part follows the [code of conduct](CODE_OF_CONDUCT.md).
