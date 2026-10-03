// Builds the Vercel deployment with the Build Output API (https://vercel.com/docs/build-output-api):
//   static/          the React app (web/dist) and the Elm console under /console
//   functions/api    the whole Tabard API bundled into one streaming Node function
// Run from the repo root after `npm ci` in server/ and web/:  node server/scripts/vercel-build.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..", "..");
const out = path.join(root, ".vercel", "output");
const sh = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: "inherit" });

fs.rmSync(out, { recursive: true, force: true });

// 1. static files
sh("npm run build", path.join(root, "web"));
fs.cpSync(path.join(root, "web", "dist"), path.join(out, "static"), { recursive: true });
fs.mkdirSync(path.join(out, "static", "console"), { recursive: true });
for (const f of ["copilot.html", "copilot.js", "copilot.css"]) fs.copyFileSync(path.join(root, f), path.join(out, "static", "console", f));

// 2. the API function
const fn = path.join(out, "functions", "api.func");
await build({
  entryPoints: [path.join(root, "server", "src", "vercel.ts")],
  outfile: path.join(fn, "index.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  sourcemap: false,
  // CommonJS dependencies (express) call require(); give the ESM bundle one
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: "info",
});
fs.writeFileSync(path.join(fn, ".vc-config.json"), JSON.stringify({
  runtime: "nodejs22.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  shouldAddHelpers: false,
  supportsResponseStreaming: true,
  maxDuration: 300,
}, null, 2));

// 3. routes: API calls go to the function (original path kept in ?__path=), then files, then the SPA
fs.writeFileSync(path.join(out, "config.json"), JSON.stringify({
  version: 3,
  routes: [
    { src: "^/api/(.*)$", dest: "/api?__path=$1" },
    { handle: "filesystem" },
    { src: "^/console$", status: 308, headers: { Location: "/console/" } },
    { src: "^/console/$", dest: "/console/copilot.html" },
    { src: "^/(.*)$", dest: "/index.html" },
  ],
}, null, 2));
console.log("Vercel build output written to .vercel/output");
