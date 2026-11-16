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

import { stalePaths } from "../scripts/build-plugin.mjs";

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
