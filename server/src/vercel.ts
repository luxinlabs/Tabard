// Vercel entry point: the whole API as one streaming function. Bundled by scripts/vercel-build.mjs.
// The route /api/(.*) is rewritten to this function with the original path in ?__path=, which is restored here.
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://local");
  const original = url.searchParams.get("__path");
  if (original !== null) {
    url.searchParams.delete("__path");
    const qs = url.searchParams.toString();
    req.url = `/api/${original}${qs ? `?${qs}` : ""}`;
  }
  return app(req as never, res as never);
}
