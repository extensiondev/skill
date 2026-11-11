// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const sourcePath = join(root, "scripts", "plugin.source.json");
export const pluginDir = "plugin";

const AGENT_PLUGINS_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const AGENT_PLUGINS_MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const ANTIGRAVITY_SCHEMA = "https://antigravity.google/schemas/v1/plugin.json";

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const ICON_PATH = "assets/icon.png";

export function readSource() {
  const source = JSON.parse(readFileSync(sourcePath, "utf8"));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  return { ...source, version: pkg.version };
}

function launcher(source) {
  return {
    command: "npx",
    args: ["-y", `${source.server.package}@${source.server.version}`],
  };
}

function listFiles(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full);
    }
  };
  walk(dir);
  return out;
}

export function renderPlugin(source) {
  const files = new Map();
  const put = (path, content) => files.set(path.split(sep).join("/"), content);
  const stdio = launcher(source);
  const skillDir = join("skills", source.skill);
  const icon = `./${ICON_PATH}`;
  const metadata = {
    description: source.description,
    version: source.version,
    author: source.author,
    homepage: source.homepage,
    repository: source.repository,
    license: source.license,
    keywords: source.keywords,
  };

  put(
    join(pluginDir, ".claude-plugin", "plugin.json"),
    json({
      name: source.name,
      displayName: source.displayName,
      ...metadata,
      icon,
      documentationUrl: source.urls.documentation,
      supportUrl: source.urls.support,
      privacyPolicyUrl: source.urls.privacyPolicy,
      termsOfServiceUrl: source.urls.termsOfService,
    }),
  );
  put(join(pluginDir, ".mcp.json"), json({ mcpServers: { [source.server.name]: stdio } }));

  put(
    join(pluginDir, "plugin.json"),
    json({
      $schema: AGENT_PLUGINS_SCHEMA,
      name: source.name,
      ...metadata,
      extensions: {
        "com.openai": {
          interface: {
            displayName: source.displayName,
            shortDescription: source.shortDescription,
            longDescription: source.longDescription,
            developerName: source.author.name,
            category: source.category.codex,
            capabilities: source.capabilities,
            websiteURL: source.urls.website,
            supportURL: source.urls.support,
            privacyPolicyURL: source.urls.privacyPolicy,
            termsOfServiceURL: source.urls.termsOfService,
            defaultPrompt: source.prompts,
            logo: icon,
            composerIcon: icon,
          },
        },
        "com.github.copilot": { logo: ICON_PATH },
      },
    }),
  );
  put(
    join(pluginDir, "mcp.json"),
    json({
      $schema: AGENT_PLUGINS_MCP_SCHEMA,
      mcpServers: { [source.server.name]: { type: "stdio", ...stdio } },
    }),
  );

  put(
    join(pluginDir, ".cursor-plugin", "plugin.json"),
    json({
      name: source.name,
      ...metadata,
      logo: ICON_PATH,
      skills: [`./${skillDir}`],
      mcpServers: { [source.server.name]: stdio },
    }),
  );

  put(
    join(pluginDir, ".antigravity-plugin", "plugin.json"),
    json({
      $schema: ANTIGRAVITY_SCHEMA,
      name: source.name,
      displayName: source.displayName,
      ...metadata,
      author: { name: source.author.name, url: source.author.url },
      logo: ICON_PATH,
      suggestedPrompts: source.prompts,
    }),
  );
  put(join(pluginDir, "mcp_config.json"), json({ mcpServers: { [source.server.name]: stdio } }));

  put(join(pluginDir, "LICENSE"), readFileSync(join(root, "LICENSE"), "utf8"));
  put(join(pluginDir, ICON_PATH), readFileSync(join(root, source.icon)));

  const skillSource = join(root, skillDir);
  for (const file of listFiles(skillSource)) {
    put(join(pluginDir, skillDir, relative(skillSource, file)), readFileSync(file));
  }

  const entry = { name: source.name, source: `./${pluginDir}`, ...metadata };

  put(
    join(".claude-plugin", "marketplace.json"),
    json({
      name: source.marketplace.name,
      description: source.marketplace.description,
      owner: source.author,
      plugins: [{ ...entry, category: source.category.claude }],
    }),
  );
  put(
    join(".agents", "plugins", "marketplace.json"),
    json({
      name: source.marketplace.name,
      plugins: [
        {
          name: source.name,
          source: { source: "local", path: `./${pluginDir}` },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
          category: source.category.codex,
          description: source.description,
          version: source.version,
        },
      ],
    }),
  );
  put(
    "gemini-extension.json",
    json({
      name: source.name,
      version: source.version,
      description: source.description,
      mcpServers: { [source.server.name]: stdio },
    }),
  );
  put(
    join(".github", "plugin", "marketplace.json"),
    json({
      name: source.marketplace.name,
      metadata: { description: source.marketplace.description, version: source.version },
      owner: source.author,
      plugins: [entry],
    }),
  );

  return files;
}

export function generatedPaths(source) {
  return [...renderPlugin(source).keys()];
}

function currentFiles(source) {
  const current = new Map();
  const skillCopy = join(root, pluginDir, "skills", source.skill);
  const dirs = [
    join(root, pluginDir, ".claude-plugin"),
    join(root, pluginDir, ".cursor-plugin"),
    join(root, pluginDir, ".antigravity-plugin"),
    join(root, pluginDir, "assets"),
    skillCopy,
  ];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const file of listFiles(dir)) {
      current.set(relative(root, file).split(sep).join("/"), readFileSync(file));
    }
  }
  for (const file of [
    join(pluginDir, ".mcp.json"),
    join(pluginDir, "plugin.json"),
    join(pluginDir, "mcp.json"),
    join(pluginDir, "mcp_config.json"),
    join(pluginDir, "LICENSE"),
    join(".claude-plugin", "marketplace.json"),
    join(".agents", "plugins", "marketplace.json"),
    join(".github", "plugin", "marketplace.json"),
    "gemini-extension.json",
  ]) {
    const full = join(root, file);
    if (existsSync(full) && statSync(full).isFile()) {
      current.set(file.split(sep).join("/"), readFileSync(full));
    }
  }
  return current;
}

export function stalePaths(source = readSource()) {
  const expected = renderPlugin(source);
  const current = currentFiles(source);
  const stale = [];
  for (const [path, content] of expected) {
    const have = current.get(path);
    if (!have || !have.equals(Buffer.from(content))) stale.push(path);
  }
  for (const path of current.keys()) {
    if (!expected.has(path)) stale.push(path);
  }
  return stale.sort();
}

export function writePlugin(source = readSource()) {
  rmSync(join(root, pluginDir, "skills"), { recursive: true, force: true });
  rmSync(join(root, pluginDir, "assets"), { recursive: true, force: true });
  for (const [path, content] of renderPlugin(source)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
}

export function pinServer(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`"${version}" is not a plain semver version for ${readSource().server.package}`);
  }
  const source = JSON.parse(readFileSync(sourcePath, "utf8"));
  source.server.version = version;
  writeFileSync(sourcePath, json(source));
  return source.server.package;
}

function publishedServerVersion() {
  const { server } = readSource();
  return execFileSync("npm", ["view", server.package, "version", "--registry", "https://registry.npmjs.org/"], {
    encoding: "utf8",
  }).trim();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const pinAt = args.indexOf("--pin");

  if (pinAt >= 0) {
    const version = args[pinAt + 1] && !args[pinAt + 1].startsWith("--") ? args[pinAt + 1] : publishedServerVersion();
    const pkg = pinServer(version);
    console.log(`pinned ${pkg}@${version}`);
  }

  if (args.includes("--check")) {
    const stale = stalePaths();
    if (stale.length) {
      console.error(
        `${pluginDir}/ is out of date with scripts/plugin.source.json and skills/; run \`npm run plugin:build\`:\n  ${stale.join("\n  ")}`,
      );
      process.exit(1);
    }
    console.log(`${pluginDir}/ matches the source`);
  } else {
    writePlugin();
    console.log(`wrote ${pluginDir}/ and the marketplace manifests`);
  }
}
