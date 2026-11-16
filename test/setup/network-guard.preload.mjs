// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

import net from "node:net";
import { after, afterEach } from "node:test";

/* @invariant
 * A TEST THAT REACHES THE NETWORK FAILS, AND IT FAILS BY NAME. The lane names
 * this module with `--import`, so it is installed in the process of every
 * test file before the file loads. A refused call is recorded as well as
 * rejected, because a fail-soft caller swallows the rejection: the hooks
 * below fail the test that made the call, or the file when it was made
 * outside any test. `data:` and `blob:` documents and unix socket paths stay
 * open. The live reads this repository keeps, the registry catalog in
 * templates-sync and the npm versions of the MCP server in mcp-sync, run in
 * their own step without this module and are skipped here.
 */
export const NETWORK_GUARD = Symbol.for("extension.dev/skill/network-guard");

const refused = [];
const realFetch = globalThis.fetch;
const realConnect = net.Socket.prototype.connect;

function refuse(target) {
  const error = new Error(
    `UNSTUBBED NETWORK CALL: ${target}. A test in this lane never reaches a host; stub the call or move it to the live step.`,
  );

  refused.push(error.message);

  return error;
}

function targetOf(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;

  return String(input?.url ?? input);
}

globalThis.fetch = function guardedFetch(input, init) {
  const target = targetOf(input);

  if (/^(data|blob):/i.test(target)) return realFetch.call(globalThis, input, init);

  return Promise.reject(refuse(`fetch ${target}`));
};

net.Socket.prototype.connect = function guardedConnect(...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0];
  const isPath =
    (first && typeof first === "object" && Boolean(first.path)) ||
    (typeof first === "string" && !/^\d+$/.test(first));

  if (isPath) return realConnect.apply(this, args);

  const host = first && typeof first === "object" ? first.host : args[1];
  const port = first && typeof first === "object" ? first.port : first;

  throw refuse(`socket ${typeof host === "string" ? host : "localhost"}:${port ?? ""}`);
};

globalThis[NETWORK_GUARD] = true;

function failOnRefusedCalls() {
  const seen = refused.splice(0, refused.length);

  if (seen.length > 0) throw new Error(seen.join("\n"));
}

afterEach(failOnRefusedCalls);
after(failOnRefusedCalls);
