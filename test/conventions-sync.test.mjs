// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// MIT License (c) Cezar Augusto and the extension.dev collaborators

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const candidates = [
  process.env.EXTENSION_JS_REPO,
  join(here, "..", "..", "extension.js"),
  join(here, "..", "..", "..", "..", "extension.js"),
].filter(Boolean);
const repo = candidates.find((c) => existsSync(c)) ?? candidates[0];
const webExtension = join(
  repo,
  "programs",
  "develop",
  "plugin-web-extension",
);
const available = existsSync(webExtension);

test("browser prefix families match the resolver source", { skip: !available }, () => {
  const resolverCandidates = [
    join(repo, "programs", "develop", "lib", "manifest-utils.ts"),
    join(webExtension, "feature-manifest", "manifest-lib", "manifest.ts"),
  ];

  const resolverPath = resolverCandidates.find((c) => existsSync(c));

  assert.ok(resolverPath, "resolver source not found in extension.js checkout");

  const resolver = readFileSync(resolverPath, "utf8");

  assert.match(resolver, /chromiumPrefixes = new Set\(\['chromium', 'chrome', 'edge'\]\)/);
  assert.match(resolver, /geckoPrefixes = new Set\(\['gecko', 'firefox'\]\)/);
  assert.match(
    resolver,
    /webkitPrefixes = new Set\(\['safari', 'webkit'\]\)/,
    "safari/webkit prefix set changed; update references/cross-browser.md",
  );
  assert.match(
    resolver,
    /plain < family prefix.*< specific prefix/s,
    "prefixed-over-plain precedence semantics changed; update references/cross-browser.md",
  );
});

test("canonical content script output naming matches contracts", { skip: !available }, () => {
  const contracts = readFileSync(
    join(webExtension, "feature-scripts", "contracts.ts"),
    "utf8",
  );

  assert.match(
    contracts,
    /CANONICAL_CONTENT_SCRIPT_ENTRY_PREFIX = 'content_scripts\/content-'/,
    "content script output naming changed; update references/cross-browser.md and project-structure.md",
  );
});

test("special folders are still pages/, scripts/, public/", { skip: !available }, () => {
  const plugin = readFileSync(
    join(repo, "programs", "develop", "plugin-special-folders", "index.ts"),
    "utf8",
  );

  for (const marker of ["/pages", "/scripts", "/public"]) {
    assert.ok(
      plugin.includes(marker),
      `special folder ${marker} missing from plugin-special-folders; update references/project-structure.md`,
    );
  }
});

test("env var prefix is still EXTENSION_PUBLIC_", { skip: !available }, () => {
  const env = readFileSync(
    join(repo, "programs", "develop", "plugin-compilation", "env.ts"),
    "utf8",
  );

  assert.ok(env.includes("EXTENSION_PUBLIC_"));
});
