// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// MIT License (c) Cezar Augusto and the extension.dev collaborators

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const readmePath = fileURLToPath(new URL("../README.md", import.meta.url));
const githubWidth = "18.4%";
const npmWidth = "18.3%";

const mode = process.argv[2];
const [from, to] =
  mode === "npm" ? [githubWidth, npmWidth] : [npmWidth, githubWidth];

const readme = readFileSync(readmePath, "utf8");
writeFileSync(readmePath, readme.replace(`width="${from}"`, `width="${to}"`));
