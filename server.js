// Static file server + ZooWork proxy. No dependencies: `node server.js`, then open http://localhost:5173
//
//   ZOOWORK_API_URL   endpoint that runs a ZooWork managed agent (required for live mode)
//   ZOOWORK_API_KEY   bearer token for that endpoint
//   ZOOWORK_AGENT_IDS optional JSON map from game agent name to ZooWork agent id,
//                     e.g. {"promo":"agt_123","service":"agt_456","returns":"agt_789"}
//
// Without ZOOWORK_API_URL the game runs on its built-in simulator.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5173;
const URL_ = process.env.ZOOWORK_API_URL;
const KEY = process.env.ZOOWORK_API_KEY;
const IDS = JSON.parse(process.env.ZOOWORK_AGENT_IDS || "{}");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };

// Shape of the request sent to ZooWork. Adjust these two functions to match your ZooWork agent's API.
function toZooWorkRequest({ agent, input, context }) {
  return {
    agent_id: IDS[agent] || agent,
    input: typeof input === "string" ? input : JSON.stringify(input),
    context,
  };
}
function fromZooWorkResponse(j) {
  return { text: j.output ?? j.text ?? j.message ?? j.result ?? JSON.stringify(j), data: j.data ?? null };
}

http.createServer(async (req, res) => {
  if (req.url === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ zoowork: !!URL_ }));
  }
  if (req.url === "/api/zoowork" && req.method === "POST") {
    if (!URL_) { res.writeHead(503); return res.end("ZOOWORK_API_URL not set"); }
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", async () => {
      try {
        const r = await fetch(URL_, {
          method: "POST",
          headers: { "content-type": "application/json", ...(KEY ? { authorization: `Bearer ${KEY}` } : {}) },
          body: JSON.stringify(toZooWorkRequest(JSON.parse(body))),
        });
        const j = await r.json();
        res.writeHead(r.ok ? 200 : 502, { "content-type": "application/json" });
        res.end(JSON.stringify(fromZooWorkResponse(j)));
      } catch (e) {
        res.writeHead(502, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: String(e) }));
      }
    });
    return;
  }
  const file = path.join(__dirname, decodeURIComponent(req.url.split("?")[0]) === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Tabard running on http://localhost:${PORT} · ZooWork ${URL_ ? "live" : "simulator"}`));
