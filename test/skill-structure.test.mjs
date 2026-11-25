import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { generatedPaths, readSource, releasePaths, stalePaths } from "../scripts/build-plugin.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = join(root, "skills", "browser-extension");
const skillMd = readFileSync(join(skillDir, "SKILL.md"), "utf8");

test("SKILL.md has valid frontmatter with name and description", () => {
  const match = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "frontmatter block missing");

  const frontmatter = match[1];
  assert.match(frontmatter, /^name: browser-extension$/m);

  const description = frontmatter.match(/^description: (.+)$/m);
  assert.ok(description, "description missing");
  assert.ok(
    description[1].length > 100,
    "description should be substantive enough to drive triggering",
  );
});

test("every reference linked from SKILL.md exists", () => {
  const links = [...skillMd.matchAll(/\((references\/[\w-]+\.md)\)/g)].map(
    (m) => m[1],
  );
  assert.ok(links.length >= 6, "expected at least 6 reference links");

  for (const link of links) {
    assert.ok(existsSync(join(skillDir, link)), `missing file: ${link}`);
  }
});

test("every reference file is linked from SKILL.md", () => {
  const files = readdirSync(join(skillDir, "references")).filter((f) =>
    f.endsWith(".md"),
  );

  for (const file of files) {
    assert.ok(
      skillMd.includes(`references/${file}`),
      `orphaned reference: ${file}`,
    );
  }
});

test("SKILL.md stays within the progressive-disclosure budget", () => {
  const lines = skillMd.split("\n").length;
  assert.ok(lines < 500, `SKILL.md is ${lines} lines; keep it under 500`);
});

test("SKILL.md fits the 24000 bytes Antigravity loads", () => {
  const bytes = Buffer.byteLength(skillMd, "utf8");
  assert.ok(
    bytes <= 24000,
    `SKILL.md is ${bytes} bytes; Antigravity loads only the first 24000, so move detail into references`,
  );
});

test("version is in sync across package.json, SKILL.md, and plugin manifests", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---\n/)[1];
  const skillVersion = frontmatter.match(/^ {2}version: "?([\d.]+)"?$/m);
  assert.ok(skillVersion, "metadata.version missing from SKILL.md frontmatter");
  assert.equal(
    skillVersion[1],
    pkg.version,
    "SKILL.md metadata.version out of sync with package.json",
  );
  for (const manifest of [
    join("plugin", ".claude-plugin", "plugin.json"),
    join("plugin", "plugin.json"),
    join("plugin", ".cursor-plugin", "plugin.json"),
    join("plugin", ".antigravity-plugin", "plugin.json"),
    join("plugin-codex", "plugin.json"),
    join("plugin-codex", ".codex-plugin", "plugin.json"),
  ]) {
    const plugin = JSON.parse(readFileSync(join(root, manifest), "utf8"));
    assert.equal(
      plugin.version,
      pkg.version,
      `${manifest} version out of sync with package.json`,
    );
  }
  const marketplace = JSON.parse(
    readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"),
  );
  for (const entry of marketplace.plugins) {
    assert.equal(
      entry.version,
      pkg.version,
      `marketplace.json plugin ${entry.name} version out of sync with package.json`,
    );
  }
});

/* @invariant
 * plugin/ and the three marketplace manifests are generated from
 * scripts/plugin.source.json and skills/ (ledger 523). Two copies of the
 * skill and six manifests edited by hand drift apart within a release; the
 * generator's own check is the one place that says whether they match. */
test("the plugin folder and the marketplace manifests match their source", () => {
  assert.deepEqual(
    stalePaths(),
    [],
    "plugin/ is out of date; run npm run plugin:build",
  );
});

/* @invariant
 * The release run regenerates every manifest with the new version and then
 * commits what it staged. v1.4.2 staged plugin/ but not plugin-codex/, so the
 * Codex manifests shipped at 1.4.1 (ledger 1111). The staged paths come from
 * the generator, so a new output folder is committed with the rest. */
test("the release run stages every file the plugin build writes", () => {
  const workflow = readFileSync(join(root, ".github", "workflows", "release.yml"), "utf8");
  const adds = [...workflow.matchAll(/^\s*git add (.+)$/gm)].map((match) =>
    match[1].replace("$(node scripts/build-plugin.mjs --paths)", releasePaths().join(" ")).split(/\s+/),
  );
  assert.ok(adds.length > 0, "release.yml stages nothing");
  for (const staged of adds) {
    const missing = generatedPaths(readSource()).filter(
      (path) => !staged.some((entry) => path === entry || path.startsWith(`${entry}/`)),
    );
    assert.deepEqual(missing, [], `a git add line in release.yml leaves generated files unstaged`);
  }
});

/* @invariant
 * Kiro activates a power when a person's message contains one of its
 * keywords, and its examples are words people type ("database", "auth").
 * Nobody types "manifest-v3", so every manifest carries plain words and
 * phrases (ledger 1147); "add-on" is the one hyphen people write. */
test("every manifest's keywords are words people type, not hyphenated slugs", () => {
  const manifests = [...manifestKeywords()];
  assert.ok(manifests.length >= 6, "the plugin build writes the six manifests that carry keywords");
  for (const [path, keywords] of manifests) {
    const slugs = keywords.filter((keyword) => keyword.replace(/add-on/g, "addon").includes("-"));
    assert.deepEqual(slugs, [], `${path} carries hyphenated slugs`);
  }
  const source = readSource();
  for (const phrase of ["browser extension", "chrome extension", "manifest v3", "content script"]) {
    assert.ok(source.keywords.includes(phrase), `keywords name "${phrase}"`);
  }
});

function* manifestKeywords() {
  for (const path of generatedPaths(readSource())) {
    if (!path.endsWith(".json")) continue;
    const parsed = JSON.parse(readFileSync(join(root, path), "utf8"));
    if (Array.isArray(parsed.keywords)) yield [path, parsed.keywords];
  }
}

test("the Claude manifest declares every host the plugin reaches, and the README names the same hosts", () => {
  const manifest = JSON.parse(readFileSync(join(root, "plugin", ".claude-plugin", "plugin.json"), "utf8"));
  const readme = readFileSync(join(root, "plugin", "README.md"), "utf8");
  const section = readme.slice(readme.indexOf("## What it runs, sends and fetches"), readme.indexOf("## Privacy policy"));
  const named = [...new Set([...section.matchAll(/`([a-z0-9-]+(?:\.[a-z0-9-]+)+)`/g)].map((match) => match[1]))].filter((token) => !token.startsWith("@"));

  assert.ok(Array.isArray(manifest.network?.hosts), "plugin.json lists network.hosts");
  assert.deepEqual([...manifest.network.hosts].sort(), named.sort());
});

test("the Antigravity manifest meets the Marketplace listing values", () => {
  const manifest = JSON.parse(
    readFileSync(join(root, "plugin", ".antigravity-plugin", "plugin.json"), "utf8"),
  );
  const { length } = manifest.description;
  assert.ok(length >= 120 && length <= 160, `description is ${length} characters; Antigravity recommends 120 to 160`);
  assert.doesNotMatch(manifest.displayName, /\b(MCP|Plugin)$|^(Antigravity|Gemini|Claude|Cursor)\b/);
  assert.ok(manifest.suggestedPrompts.length >= 1 && manifest.suggestedPrompts.length <= 3);
  for (const key of ["name", "displayName", "version", "author", "logo"]) {
    assert.ok(manifest[key], `${key} missing; the Marketplace requires it`);
  }
  const logo = readFileSync(join(root, "plugin", manifest.logo));
  const [width, height] = [logo.readUInt32BE(16), logo.readUInt32BE(20)];
  assert.ok(width === height && width >= 128, `logo is ${width}x${height}; Antigravity wants 1:1 and at least 128 px`);
});

test("the plugin pins the server launcher to an exact version", () => {
  const mcp = JSON.parse(readFileSync(join(root, "plugin", ".mcp.json"), "utf8"));
  const servers = Object.values(mcp.mcpServers);
  assert.equal(servers.length, 1, "the plugin declares one server");
  const launcher = servers[0].args.find((arg) => arg.startsWith("@extension.dev/mcp"));
  assert.match(
    launcher ?? "",
    /^@extension\.dev\/mcp@\d+\.\d+\.\d+$/,
    "the npx launcher must name @extension.dev/mcp at an exact version",
  );
});

/* @invariant
 * Cezar ruled on 2026-11-24 (ledger 1127) that the OpenAI and Codex plugin
 * connects to the hosted server over OAuth and every other client keeps the
 * local npx launcher. Codex reads the root mcp.json of the plugin it loads,
 * and plugin/mcp.json is the same file GitHub Copilot reads, so the Codex
 * bundle is its own folder and the shared file stays the stdio launcher. */
test("the Codex bundle names only the hosted server and the shared mcp.json stays the stdio launcher", () => {
  const read = (...path) => JSON.parse(readFileSync(join(root, ...path), "utf8"));
  const source = read("scripts", "plugin.source.json");

  const codexServers = Object.values(read("plugin-codex", "mcp.json").mcpServers);
  assert.equal(codexServers.length, 1, "the Codex bundle declares one server");
  for (const server of codexServers) {
    assert.equal(server.type, "streamable-http");
    assert.equal(server.url, "https://mcp.extension.dev/mcp");
    assert.equal(server.command, undefined, "the Codex bundle must not launch a local server");
    assert.equal(server.args, undefined, "the Codex bundle must not launch a local server");
    assert.equal(server.extensions?.["com.openai"]?.auth?.type, "oauth");
    assert.equal(server.extensions["com.openai"].auth.client?.clientId, undefined);
  }
  assert.ok(!existsSync(join(root, "plugin-codex", ".mcp.json")), "the Codex bundle carries no second server file");

  assert.deepEqual(read("plugin", "mcp.json"), {
    $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    mcpServers: {
      [source.server.name]: {
        type: "stdio",
        command: "npx",
        args: ["-y", `${source.server.package}@${source.server.version}`],
      },
    },
  });

  const codexMarketplace = read(".agents", "plugins", "marketplace.json");
  assert.deepEqual(
    codexMarketplace.plugins.map((entry) => entry.source.path),
    ["./plugin-codex"],
    "the Codex marketplace installs the hosted bundle",
  );
});

test("no em dashes in any skill content", () => {
  const files = [
    join(skillDir, "SKILL.md"),
    ...readdirSync(join(skillDir, "references")).map((f) =>
      join(skillDir, "references", f),
    ),
    join(root, "README.md"),
  ];

  for (const file of files) {
    assert.ok(
      !readFileSync(file, "utf8").includes("—"),
      `em dash found in ${file}`,
    );
  }
});

test("the share rule names the build link and the channel link and where visibility is set", () => {
  const publishing = readFileSync(join(skillDir, "references", "publishing.md"), "utf8");
  const flat = (text) => text.replace(/\s+/g, " ");

  for (const [name, text] of [["SKILL.md", flat(skillMd)], ["publishing.md", flat(publishing)]]) {
    assert.ok(text.includes("build link"), `${name} does not say build link`);
    assert.ok(text.includes("channel link"), `${name} does not say channel link`);
    assert.ok(text.includes("value.link.expiresAt"), `${name} does not name the expiry field`);
    assert.ok(
      text.includes("extension.dev project settings (not the GitHub repository)"),
      `${name} does not say where visibility is set`,
    );
    assert.ok(text.includes("On a public project, or a public channel, send the channel link"), `${name} gives unconditional channel advice`);
    assert.ok(!/public (build )?page/i.test(text), `${name} calls a link a public page`);
  }
});

const PRELOAD = "test/setup/network-guard.preload.mjs";
const LIVE_LANES = [
  "node --test test/templates-sync.test.mjs",
  "node --test test/templates-sync.test.mjs test/mcp-sync.test.mjs",
];

test("this file runs under the network guard", () => {
  assert.equal(
    globalThis[Symbol.for("extension.dev/skill/network-guard")],
    true,
    `run the suite with npm test, or pass --import ./${PRELOAD}`,
  );
});

test("the guard fails a test whose refused call the caller swallowed", () => {
  const directory = mkdtempSync(join(tmpdir(), "skill-guard-"));

  const run = (name, body, guarded = true) => {
    const file = join(directory, name);

    writeFileSync(file, `import test from "node:test";\n${body}\n`);

    const result = spawnSync(
      process.execPath,
      ["--test", ...(guarded ? ["--import", join(root, PRELOAD)] : []), file],
      {
        encoding: "utf8",
        env: Object.fromEntries(
          Object.entries(process.env).filter(([key]) => key !== "NODE_TEST_CONTEXT"),
        ),
      },
    );

    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  };

  const leak = (host) =>
    `test("leaks", async () => { await fetch("https://${host}/soft").catch(() => "fail-soft"); });`;

  try {
    const swallowed = run("swallowed.test.mjs", leak("unstubbed.invalid"));

    assert.equal(swallowed.status, 1, swallowed.output);
    assert.match(swallowed.output, /UNSTUBBED NETWORK CALL: fetch https:\/\/unstubbed\.invalid\/soft/);

    const socket = run(
      "socket.test.mjs",
      [
        'import net from "node:net";',
        'test("dials", () => { try { net.connect(443, "unstubbed.invalid"); } catch { return; } });',
      ].join("\n"),
    );

    assert.equal(socket.status, 1, socket.output);
    assert.match(socket.output, /UNSTUBBED NETWORK CALL: socket unstubbed\.invalid:443/);

    const quiet = run("quiet.test.mjs", 'test("clean", () => {});');

    assert.equal(quiet.status, 0, quiet.output);

    const unguarded = run("unguarded.test.mjs", leak("unstubbed.invalid"), false);

    assert.equal(unguarded.status, 0, unguarded.output);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("every node --test lane names the guard, except the live registry steps", () => {
  const lanes = [JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts.test];
  const workflows = join(root, ".github", "workflows");

  for (const workflow of readdirSync(workflows)) {
    for (const line of readFileSync(join(workflows, workflow), "utf8").split("\n")) {
      if (/\bnode --test\b/.test(line)) lanes.push(line.replace(/^\s*run:\s*/, "").trim());
    }
  }

  const guarded = lanes.filter((lane) => !LIVE_LANES.includes(lane));

  assert.equal(guarded.length, 3, lanes.join("\n"));
  assert.equal(lanes.length - guarded.length, 2, lanes.join("\n"));

  for (const lane of guarded) {
    assert.ok(lane.startsWith(`node --test --import ./${PRELOAD} `), lane);
  }
});
