import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const skillDir = join(root, "skills", "extension-dev");

const skillFiles = [
  join(skillDir, "SKILL.md"),
  ...readdirSync(join(skillDir, "references"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(skillDir, "references", f)),
  join(root, "README.md"),
];

const skillMd = readFileSync(join(skillDir, "SKILL.md"), "utf8");
const allSkillText = skillFiles
  .map((f) => `\n<<<${f}>>>\n${readFileSync(f, "utf8")}`)
  .join("\n");

/* An explicit override is authoritative. Falling back from a path someone set
 * by hand to whatever happens to sit next door is how a workflow keeps
 * reporting green against a repo it stopped reading. */
const resolveRepo = (override, fallbacks) => {
  if (override) return override;
  return fallbacks.find((c) => existsSync(c));
};

// The MCP checkout. In the monorepo it is a sibling package; in CI the
// release and verify workflows check out extensiondev/mcp and point
// EXTENSION_DEV_MCP_REPO at it.
const mcpRepo = resolveRepo(process.env.EXTENSION_DEV_MCP_REPO, [
  join(here, "..", "..", "public-extensiondev-mcp"),
  join(here, "..", "..", "mcp"),
  join(here, "..", "..", "..", "..", "mcp"),
]);

const mcpReadme = mcpRepo ? join(mcpRepo, "README.md") : null;
const mcpCountTest = mcpRepo
  ? join(mcpRepo, "src", "__tests__", "tool-count.test.ts")
  : null;
const mcpAvailable = Boolean(
  mcpReadme && existsSync(mcpReadme) && mcpCountTest && existsSync(mcpCountTest),
);

// The Extension.js checkout, reached exactly the way conventions-sync
// reaches it, so both sync tests share one CI checkout step.
const cliRepo = resolveRepo(process.env.EXTENSION_JS_REPO, [
  join(here, "..", "..", "extension.js"),
  join(here, "..", "..", "..", "..", "extension.js"),
]);
const cliCommandsDir = cliRepo
  ? join(cliRepo, "programs", "extension", "commands")
  : null;
const cliAvailable = Boolean(cliCommandsDir && existsSync(cliCommandsDir));

/* The live registry, read from the MCP's README table rather than typed here.
 * That table is not prose: the MCP's own src/__tests__/tool-count.test.ts
 * asserts it lists every registered tool "and nothing else", derived from the
 * tool array at import time. So reading it is reading the registry through an
 * instrument the other side already keeps honest. */
function liveTools() {
  const readme = readFileSync(mcpReadme, "utf8");
  const names = [
    ...readme.matchAll(/^\| \w+ \| `(extension_\w+)` \|/gm),
  ].map((m) => m[1]);
  assert.ok(
    names.length > 0,
    "no tool rows found in the MCP README table; the table shape changed and this test can no longer read the registry",
  );
  return [...new Set(names)].sort();
}

/* The retired names, read from the MCP's own retirement list. The MCP test
 * asserts that list stays disjoint from the live registry, so a name here is
 * a name the server really did drop. */
function retiredTools() {
  const source = readFileSync(mcpCountTest, "utf8");
  const block = source.match(
    /const RETIRED_TOOL_NAMES\s*=\s*\[([\s\S]*?)\]/,
  );
  assert.ok(
    block,
    "RETIRED_TOOL_NAMES not found in the MCP tool-count test; the retirement list moved",
  );
  const names = [...block[1].matchAll(/"(extension_\w+)"/g)].map((m) => m[1]);
  assert.ok(names.length > 0, "the MCP retirement list parsed as empty");
  return names;
}

function cliCommands() {
  const names = readdirSync(cliCommandsDir)
    .filter((f) => f.endsWith(".ts"))
    .flatMap((f) => [
      ...readFileSync(join(cliCommandsDir, f), "utf8").matchAll(
        /\.command\('([a-z][a-z-]*)'\)/g,
      ),
    ])
    .map((m) => m[1]);
  assert.ok(
    names.length > 0,
    "no .command('x') registrations found in the Extension.js CLI; the registration shape changed",
  );
  return [...new Set(names)].sort();
}

/* A skipped sync test reads as a pass, and a checkout step that silently
 * stopped landing its repo would turn this whole file into decoration. Off a
 * developer machine the sources are mandatory, so a missing one fails loudly
 * instead of skipping quietly. */
test("the sync sources are present in CI", { skip: !process.env.CI }, () => {
  assert.ok(
    mcpAvailable,
    "no MCP checkout: set EXTENSION_DEV_MCP_REPO or check out extensiondev/mcp",
  );
  assert.ok(
    cliAvailable,
    "no Extension.js checkout: set EXTENSION_JS_REPO or check out extension-js/extension.js",
  );
});

/* Tools the skill deliberately does not name, each with the reason. This list
 * is the reason the omission this test was written for cannot happen twice: a
 * tool that lands in the MCP and is neither taught nor written down here
 * reddens the build. Emptying it is allowed; deleting the check is not. */
const NOT_TAUGHT = {};

/* `extension_`-shaped identifiers in the skill that are not tool names. Every
 * one needs a reason, so a genuine typo or a retired tool cannot hide here. */
const NON_TOOL_IDENTIFIERS = {
  extension_root_tree:
    "an output event type of the CLI's --source stream, documented in debugging.md",
};

function namedInSkill() {
  return new Set(
    [...allSkillText.matchAll(/\bextension_[a-z_]+\b/g)]
      .map((m) => m[0])
      .filter((name) => !NON_TOOL_IDENTIFIERS[name]),
  );
}

test("SKILL.md states the live tool count", { skip: !mcpAvailable }, () => {
  const live = liveTools();
  const stated = [...skillMd.matchAll(/(\d+)\s+tools\b/g)].map((m) =>
    Number(m[1]),
  );
  assert.ok(
    stated.length > 0,
    "SKILL.md no longer states a tool count; this test can no longer check it",
  );
  for (const n of stated) {
    assert.equal(
      n,
      live.length,
      `SKILL.md says ${n} tools; the MCP registers ${live.length}`,
    );
  }
});

test(
  "every extension_ tool the skill names is one the server still registers",
  { skip: !mcpAvailable },
  () => {
    const live = new Set(liveTools());
    for (const name of namedInSkill()) {
      assert.ok(
        live.has(name),
        `the skill names ${name}, which the MCP does not register. If it is not a tool name, add it to NON_TOOL_IDENTIFIERS with the reason.`,
      );
    }
  },
);

test(
  "the skill names no tool the MCP retired",
  { skip: !mcpAvailable },
  () => {
    for (const retired of retiredTools()) {
      assert.ok(
        !new RegExp(`\\b${retired}\\b`).test(allSkillText),
        `the skill still names the retired tool ${retired}`,
      );
    }
  },
);

test(
  "every registered tool is either taught or written off with a reason",
  { skip: !mcpAvailable },
  () => {
    const named = namedInSkill();
    const missing = liveTools().filter(
      (name) => !named.has(name) && !NOT_TAUGHT[name],
    );
    assert.deepEqual(
      missing,
      [],
      `the MCP registers these and the skill never names them: ${missing.join(", ")}. Teach them, or add each to NOT_TAUGHT with the reason.`,
    );
  },
);

/* The parity claim in SKILL.md is two lists, and both are checkable. The
 * claim it replaced was wrong in both directions at once: it promised a CLI
 * path for tools that have none, which is how an agent ends up telling a user
 * to run a command that was never registered. */
function statedCliCommands() {
  const sentence = skillMd.match(/The commands\s+are\s+([\s\S]*?)\.\s/);
  assert.ok(
    sentence,
    "the SKILL.md sentence listing the CLI commands is gone; parity is no longer checkable",
  );
  const names = [...sentence[1].matchAll(/`([a-z][a-z-]*)`/g)].map((m) => m[1]);
  assert.ok(names.length > 0, "the stated CLI command list parsed as empty");
  return names;
}

function statedMcpOnlyTools() {
  const paragraph = skillMd.match(
    /\*\*Everything else is MCP-only\.\*\*([\s\S]*?)\n\n/,
  );
  assert.ok(
    paragraph,
    "the SKILL.md MCP-only paragraph is gone; parity is no longer checkable",
  );
  const names = [
    ...paragraph[1].matchAll(/`(extension_[a-z_]+)`/g),
  ].map((m) => m[1]);
  assert.ok(names.length > 0, "the stated MCP-only list parsed as empty");
  return names;
}

test(
  "every CLI command SKILL.md promises is registered by the CLI",
  { skip: !cliAvailable },
  () => {
    const registered = new Set(cliCommands());
    for (const name of statedCliCommands()) {
      assert.ok(
        registered.has(name),
        `SKILL.md tells agents to run \`extension ${name}\`, which the CLI does not register`,
      );
    }
  },
);

test(
  "every tool SKILL.md calls MCP-only really has no CLI command",
  { skip: !cliAvailable },
  () => {
    const registered = new Set(cliCommands());
    for (const tool of statedMcpOnlyTools()) {
      const tail = tool.replace(/^extension_/, "");
      for (const candidate of [tail, tail.replace(/_/g, "-")]) {
        assert.ok(
          !registered.has(candidate),
          `SKILL.md calls ${tool} MCP-only, but \`extension ${candidate}\` is a registered CLI command`,
        );
      }
    }
  },
);

/* C11: extensiondev-config, extensiondev-deploy, extensiondev-executables,
 * extensiondev-session, extensiondev-ui and registry-template are private
 * packages. This skill is public and npm-installable, so a reader who follows
 * it must never be sent to a bin they cannot install. publishing.md named the
 * private deploy CLI for months; that package publishes with
 * access:restricted, so the command answered 404 for everyone outside the
 * company. The scope is every file this package publishes, changelog
 * included, because npm ships all of them. This check needs no external
 * checkout, on purpose: it is the one that must never be skippable. */
const PRIVATE_BINS = [
  "extension-deploy",
  "extension-config",
  "extension-session",
  "extension-executables",
  "@extension.dev/deploy",
  "@extension.dev/config",
  "@extension.dev/session",
  "@extension.dev/ui",
  "@extension.dev/executables",
  "registry-template",
];

test("the skill never sends a reader to a private package", () => {
  for (const file of [...skillFiles, join(root, "CHANGELOG.md")]) {
    const text = readFileSync(file, "utf8");
    for (const bin of PRIVATE_BINS) {
      assert.ok(
        !text.includes(bin),
        `${file} names the private package ${bin}; public docs never teach the private surface (canon C11)`,
      );
    }
  }
});
