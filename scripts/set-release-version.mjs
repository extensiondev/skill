// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = (process.argv[2] || "").trim();

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`set-release-version: "${version}" is not a plain semver version`);
  process.exit(1);
}

const manifestPath = join(root, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = version;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const skillPath = join(root, "skills", "browser-extension", "SKILL.md");
writeFileSync(skillPath, readFileSync(skillPath, "utf8").replace(/^( {2}version: ).*$/m, `$1${version}`));

console.log(`set package.json and SKILL.md to ${version}`);
