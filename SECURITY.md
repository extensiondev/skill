# Security policy

## Report a vulnerability

Use [private vulnerability reporting](https://github.com/extensiondev/skill/security/advisories/new) on this repository, or email hello@extension.dev, not a public issue. Either reaches the maintainer directly.

A useful report names:

- the version of `@extension.dev/skill` and the agent that loaded it
- the file and the instruction involved, or the prompt that leads an agent to the problem
- what an attacker gains: a file read, a command run, a credential exposed, a package installed that should not be

## Supported versions

Fixes ship in the next release of `@extension.dev/skill` on npm and in the plugin marketplace. Only the latest published version receives them, so upgrade before you report.

## Scope

This repository holds the `browser-extension` skill and the `extension-dev` plugin. Reports about the extension.dev MCP server go to [extensiondev/mcp](https://github.com/extensiondev/mcp/blob/main/SECURITY.md).
