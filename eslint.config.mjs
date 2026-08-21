// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", "evals/fixtures/**"] },
  { languageOptions: { globals: globals.node } },
  js.configs.recommended,
];
