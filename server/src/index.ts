import "./env.ts"; // must stay first: loads server/.env
// Local entry point: the API on PORT (default 4000), plus the built React app when web/dist exists.
import express from "express";
import fs from "node:fs";
import path from "node:path";
import app from "./app.ts";
import { zooworkLive } from "./zoowork.ts";

const dist = path.join(import.meta.dirname, "..", "..", "web", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Tabard API on http://localhost:${PORT} · ZooWork ${zooworkLive() ? "live" : "simulator"}`));
