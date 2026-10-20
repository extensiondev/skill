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

const REGISTRY_ORIGIN = "https://registry.extension.land";
const CATALOG_POINTER_URL = `${REGISTRY_ORIGIN}/extension-dev/catalog/latest.json`;
const POINTER_SCHEMA = "templates-catalog-channel/v1";
const CATALOG_SCHEMA = "templates-catalog/v1";

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

async function readJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`${url} answered HTTP ${res.status}`);

  return res.json();
}

test("the reference names the catalog pointer agents are told to read", () => {
  assert.ok(
    templatesMd.includes(CATALOG_POINTER_URL),
    "references/templates.md must name the registry catalog pointer",
  );
  assert.ok(
    !/releases\/download\/nightly/.test(templatesMd),
    "references/templates.md must not send agents to a GitHub nightly asset",
  );
});

test("recommended template slugs exist in the registry catalog", async (t) => {
  assert.ok(
    slugs.length >= 15,
    `slug extraction looks broken: only found ${slugs.length}`,
  );

  let pointer;
  let catalog;
  try {
    pointer = await readJson(CATALOG_POINTER_URL);
    assert.equal(pointer.schema, POINTER_SCHEMA);
    assert.match(String(pointer.commit), /^[0-9a-f]{40}$/);
    assert.equal(
      pointer.catalog,
      `/extension-dev/catalog/${pointer.commit}.json`,
    );
    catalog = await readJson(`${REGISTRY_ORIGIN}${pointer.catalog}`);
  } catch (err) {
    if (err instanceof assert.AssertionError) throw err;

    t.skip(`registry catalog unreachable: ${err.message}`);
    return;
  }

  assert.equal(catalog.schema, CATALOG_SCHEMA);
  assert.equal(catalog.source?.commit, pointer.commit);

  const known = new Set(catalog.templates.map((entry) => entry.slug));

  for (const slug of slugs) {
    assert.ok(
      known.has(slug),
      `slug \`${slug}\` is not in the catalog; update references/templates.md`,
    );
  }
});
