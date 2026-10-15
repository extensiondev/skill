import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = join(root, "skills", "extension-dev");
const evalsDir = join(root, "evals");
const referenceName = "references/migrating-from-frameworks.md";
const referencePath = join(skillDir, referenceName);
const skillMd = readFileSync(join(skillDir, "SKILL.md"), "utf8");
const reference = existsSync(referencePath)
  ? readFileSync(referencePath, "utf8")
  : "";

const evals = JSON.parse(readFileSync(join(evalsDir, "evals.json"), "utf8"));
const migrationEvals = evals.evals.filter((e) =>
  e.eval_name.startsWith("migrate-"),
);

const DETECTION_SIGNALS = [
  "wxt.config",
  "entrypoints/",
  "@plasmohq/",
  "`plasmo`",
];

const CONSTRUCTS = [
  "defineBackground",
  "defineContentScript",
  "ctx",
  "WXT_",
  "@wxt-dev/module-react",
  "PlasmoCSConfig",
  "PLASMO_PUBLIC_",
  "@plasmohq/messaging",
  "@plasmohq/storage",
  "getStyle",
];

const FRAMEWORK_WORD = /\b(?:wxt|plasmo|crxjs)\b/i;

const npmFacing = [
  join(root, "README.md"),
  join(root, "CHANGELOG.md"),
  join(root, "package.json"),
  join(root, ".claude-plugin", "plugin.json"),
  join(root, ".claude-plugin", "marketplace.json"),
];

function fixtureText(evalCase) {
  return evalCase.files
    .map((f) => readFileSync(join(evalsDir, f), "utf8"))
    .join("\n");
}

test("the framework migration evals ship with every fixture they list", () => {
  assert.ok(
    migrationEvals.length >= 2,
    `expected a migrate-* eval per source framework, found ${migrationEvals.length}`,
  );
  for (const evalCase of migrationEvals) {
    assert.ok(evalCase.files.length > 0, `${evalCase.eval_name} lists no fixture`);
    for (const file of evalCase.files) {
      assert.ok(
        existsSync(join(evalsDir, file)),
        `${evalCase.eval_name} lists ${file}, which does not exist`,
      );
    }
  }
});

test("SKILL.md routes a framework project to the migration reference by its files", () => {
  const row = skillMd
    .split("\n")
    .find((line) => line.startsWith("|") && line.includes(`(${referenceName})`));
  assert.ok(row, `no reference table row links ${referenceName}`);
  for (const signal of DETECTION_SIGNALS) {
    assert.ok(row.includes(signal), `the routing row never names the signal ${signal}`);
  }
  const workflow = skillMd.split("## Workflow")[1].split("\n2. ")[0];
  assert.ok(
    workflow.includes(referenceName),
    "workflow step 1 does not send a framework project to the migration reference",
  );
});

test("every construct the fixtures use has a replacement in the reference", () => {
  assert.ok(reference.length > 0, `${referenceName} does not exist`);
  const fixtures = migrationEvals.map(fixtureText).join("\n");
  for (const construct of CONSTRUCTS) {
    assert.ok(
      fixtures.includes(construct),
      `${construct} is in the construct list but no migration fixture uses it`,
    );
    assert.ok(
      reference.includes(`\`${construct}`),
      `the fixtures use ${construct} and ${referenceName} never says what replaces it`,
    );
  }
});

test("framework names stay out of every npm-facing file and the skill description", () => {
  for (const file of npmFacing) {
    assert.ok(
      !FRAMEWORK_WORD.test(readFileSync(file, "utf8")),
      `${file} names another extension framework; only agent-facing skill text may`,
    );
  }
  const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---\n/)[1];
  assert.ok(
    !FRAMEWORK_WORD.test(frontmatter),
    "the SKILL.md frontmatter names another extension framework",
  );
});

test("the migration reference moves a project over without comparing tools", () => {
  assert.ok(reference.length > 0, `${referenceName} does not exist`);
  assert.ok(
    !/\bvs\.?\b|\bversus\b|\bcompar/i.test(reference),
    `${referenceName} compares tools; it only says how to move a project over`,
  );
});
