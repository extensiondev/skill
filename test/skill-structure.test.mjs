import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = join(root, "skills", "extension-dev");
const skillMd = readFileSync(join(skillDir, "SKILL.md"), "utf8");

test("SKILL.md has valid frontmatter with name and description", () => {
  const match = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "frontmatter block missing");

  const frontmatter = match[1];
  assert.match(frontmatter, /^name: extension-dev$/m);

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
  const plugin = JSON.parse(
    readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8"),
  );
  assert.equal(
    plugin.version,
    pkg.version,
    ".claude-plugin/plugin.json version out of sync with package.json",
  );
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
