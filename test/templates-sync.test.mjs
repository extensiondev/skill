import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const templatesMd = readFileSync(
  join(root, "skills", "extension-dev", "references", "templates.md"),
  "utf8",
);

const META_URL =
  "https://github.com/extension-js/examples/releases/download/nightly/templates-meta.json";

const tableSection = templatesMd
  .split("## Key templates by surface")[1]
  .split("\n## ")[0];
const tableSlugs = [...tableSection.matchAll(/`([a-z0-9-]+)`/g)].map(
  (m) => m[1],
);
const proseSlugs = [
  ...templatesMd.matchAll(/`(ai-[a-z-]+|content-multi-[a-z-]+|content-main-world)`/g),
].map((m) => m[1]);
const slugs = [...new Set([...tableSlugs, ...proseSlugs])];

test("recommended template slugs exist in the nightly catalog", async (t) => {
  assert.ok(
    slugs.length >= 15,
    `slug extraction looks broken: only found ${slugs.length}`,
  );

  let meta;
  try {
    const res = await fetch(META_URL, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    meta = await res.json();
  } catch (err) {
    t.skip(`nightly templates-meta.json unreachable: ${err.message}`);
    return;
  }

  const known = new Set(meta.templates.map((entry) => entry.slug));

  for (const slug of slugs) {
    assert.ok(
      known.has(slug),
      `slug \`${slug}\` is not in the catalog; update references/templates.md`,
    );
  }
});
