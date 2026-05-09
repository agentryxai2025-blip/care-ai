#!/usr/bin/env node
/**
 * Dev startup wrapper for Expo on Replit.
 *
 * Problem: Node.js resolves 'localhost' to '::1' (IPv6-first) on this host.
 * Metro calls httpServer.listen(port, 'localhost', cb) which binds ONLY to
 * IPv6 (shows in /proc/net/tcp6 but NOT /proc/net/tcp). Replit's pid1
 * portdetector scans /proc/net/tcp (IPv4) only — so it never sees the port.
 *
 * Fix: Patch dns.lookup so 'localhost' → '127.0.0.1' (IPv4) BEFORE requiring
 * Expo. Also patch net.Server.listen to rewrite '::1' → '0.0.0.0' as a
 * belt-and-suspenders fallback.
 */

const dns = require("dns");
const net = require("net");

// ── Patch 1: Override dns.lookup for 'localhost' → '127.0.0.1' ───────────────
const _origLookup = dns.lookup.bind(dns);
dns.lookup = function patchedLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (
    typeof hostname === "string" &&
    hostname.toLowerCase() === "localhost"
  ) {
    const family = typeof options === "object" ? options.family : options;
    if (!family || family === 4 || family === 6) {
      return callback(null, "127.0.0.1", 4);
    }
  }
  return _origLookup(hostname, options, callback);
};

// Also patch the promisified version if used
const dnsPromises = dns.promises;
if (dnsPromises && dnsPromises.lookup) {
  const _origLookupP = dnsPromises.lookup.bind(dnsPromises);
  dnsPromises.lookup = async function (hostname, options) {
    if (
      typeof hostname === "string" &&
      hostname.toLowerCase() === "localhost"
    ) {
      return { address: "127.0.0.1", family: 4 };
    }
    return _origLookupP(hostname, options);
  };
}

// ── Patch 2: net.Server.listen — rewrite '::1' / 'localhost' → '0.0.0.0' ────
const _origListen = net.Server.prototype.listen;
net.Server.prototype.listen = function patchedListen(...args) {
  if (args.length >= 2) {
    const host = args[1];
    if (host === "::1" || host === "localhost") {
      process.stderr.write(
        `[dev-start] Rewrote listen host '${host}' → '0.0.0.0'\n`
      );
      args[1] = "0.0.0.0";
    }
  }
  return _origListen.apply(this, args);
};

process.stderr.write("[dev-start] DNS + net.Server patches active\n");

// ── Launch Expo via spawn (inherits env, preserves stdio) ─────────────────────
// Use spawn instead of require() so that process.argv handling in @expo/cli
// works correctly and env vars set by the npm dev script are inherited.
const { spawn } = require("child_process");

const port = process.env.PORT || "8081";

// Resolve the expo CLI binary
let expoBin;
try {
  expoBin = require.resolve("expo/bin/cli", { paths: [process.cwd()] });
} catch {
  expoBin = require.resolve("@expo/cli/build/src/bin/cli", {
    paths: [process.cwd()],
  });
}

const expo = spawn(process.execPath, [expoBin, "start", "--localhost", "--port", port], {
  stdio: "inherit",
  env: process.env,
});

expo.on("exit", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGTERM", () => expo.kill("SIGTERM"));
process.on("SIGINT", () => expo.kill("SIGINT"));
