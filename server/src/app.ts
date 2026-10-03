// Tabard API app: REST for data, Server-Sent Events for the live shop floor.
// Started locally by index.ts, and on Vercel by vercel.ts.
import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { DATA_DIR, get, run } from "./db.ts";
import { seedIfEmpty } from "./seed.ts";
import { cleanMerchant, createFromImport, createMerchant, HttpError, listMerchants } from "./merchants.ts";
import { previewImport, tavilyConfigured } from "./importer.ts";
import { engine } from "./engine.ts";
import { send, subscribe, unsubscribe } from "./bus.ts";
import { zooworkLive, zooworkRoleLive } from "./zoowork.ts";
import * as Q from "./queries.ts";
import { consoleRouter } from "./console.ts";
import { bandLive, bandRoomInfo, bandStatus } from "./band.ts";
import { missionRouter } from "./mission.ts";

seedIfEmpty();

const app = express();
app.use(express.json({ limit: "100kb" }));

// CORS for local front ends served from another port (e.g. the Elm console)
app.use((req, res, next) => {
  const o = req.headers.origin;
  if (o && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) {
    res.setHeader("Access-Control-Allow-Origin", o);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    if (req.method === "OPTIONS") return void res.sendStatus(204);
  }
  next();
});

const mid = (req: Request) => {
  const id = Number(req.params.mid);
  if (!Number.isInteger(id) || !get("SELECT 1 FROM merchants WHERE id = ?", id)) throw new HttpError(404, "merchant not found");
  return id;
};
const num = (v: unknown, name: string) => {
  const n = Number(v);
  if (!Number.isInteger(n)) throw new HttpError(400, `${name} must be an id`);
  return n;
};
const text = (v: unknown, name: string, max = 2000) => {
  if (typeof v !== "string" || !v.trim()) throw new HttpError(400, `${name} is required`);
  return v.trim().slice(0, max);
};
const oneOf = <T extends string>(v: unknown, opts: readonly T[], name: string) => {
  if (!opts.includes(v as T)) throw new HttpError(400, `${name} must be one of: ${opts.join(", ")}`);
  return v as T;
};

const api = express.Router();
api.get("/health", (_req, res) => { res.json({ ok: true, band: bandLive(), zoowork: zooworkLive(), zooworkRoles: (process.env.ZOOWORK_AGENTS || "promo,concierge").split(","), tavily: tavilyConfigured(), claude: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) }); });

// ---- import a shop from a storefront link (Tavily gathers, Claude or rules structure, nothing saved until confirmed)
api.post("/import/preview", async (req, res) => { res.json(await previewImport(text(req.body?.url, "url", 2000))); });
api.post("/import/create", (req, res) => { res.status(201).json(createFromImport(req.body)); });

// ---- merchants (basic info + policies)
api.get("/merchants", (_req, res) => { res.json(listMerchants()); });
api.post("/merchants", (req, res) => {
  const sample = req.body?.sample ?? "none";
  res.status(201).json(createMerchant({ ...req.body, sample: oneOf(sample, ["none", "apparel", "ceramics"] as const, "sample") }));
});
api.get("/merchants/:mid", (req, res) => {
  const id = mid(req);
  res.json({ ...get("SELECT * FROM merchants WHERE id = ?", id), totals: Q.totals(id), live: engine(id).live });
});
api.patch("/merchants/:mid", (req, res) => {
  const id = mid(req);
  const data = cleanMerchant(req.body || {});
  if ("name" in data && !data.name) throw new HttpError(400, "name can't be empty");
  const cols = Object.keys(data);
  if (cols.length) run(`UPDATE merchants SET ${cols.map(c => `${c} = ?`).join(", ")} WHERE id = ?`, ...cols.map(c => data[c]), id);
  const e = engine(id);
  if ("simulate" in data) data.simulate ? e.start() : e.stop();
  if ("billboard_mode" in data || "house_offer" in data) e.refreshBillboard();
  e.event("you", `updated the store profile (${cols.join(", ") || "no changes"})`, "staff");
  res.json(get("SELECT * FROM merchants WHERE id = ?", id));
});
api.delete("/merchants/:mid", (req, res) => {
  const id = mid(req);
  engine(id).stop();
  run("DELETE FROM merchants WHERE id = ?", id);
  res.status(204).end();
});

// ---- live stream
api.get("/merchants/:mid/stream", (req, res) => {
  const id = mid(req);
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive", "x-accel-buffering": "no" });
  subscribe(id, res); // starts the shop engine if it isn't running
  send(res, engine(id).snapshot());
  req.on("close", () => unsubscribe(id, res));
});

// ---- read models
api.get("/merchants/:mid/overview", (req, res) => { const id = mid(req); res.json({ ...Q.overview(id), inShop: engine(id).visitors.size }); });
api.get("/merchants/:mid/agents", (req, res) => { const id = mid(req); res.json(Q.agents(id, engine(id).busy)); });
api.patch("/merchants/:mid/agents/:key", (req, res) => {
  const id = mid(req);
  const a = get("SELECT * FROM agents WHERE merchant_id = ? AND key = ?", id, req.params.key);
  if (!a) throw new HttpError(404, "agent not found");
  if ("zoowork_agent_id" in req.body) run("UPDATE agents SET zoowork_agent_id = ? WHERE id = ?", req.body.zoowork_agent_id ? String(req.body.zoowork_agent_id).slice(0, 200) : null, a.id);
  if ("enabled" in req.body) run("UPDATE agents SET enabled = ? WHERE id = ?", req.body.enabled ? 1 : 0, a.id);
  res.json(get("SELECT * FROM agents WHERE id = ?", a.id));
});
api.get("/merchants/:mid/customers", (req, res) => { res.json(Q.customers(mid(req))); });
api.get("/merchants/:mid/products", (req, res) => { res.json(Q.productsWithRisk(mid(req))); });
api.get("/merchants/:mid/transactions", (req, res) => { res.json(Q.transactions(mid(req), typeof req.query.sku === "string" ? req.query.sku : undefined)); });
api.get("/merchants/:mid/rooms", (req, res) => { res.json(Q.rooms(mid(req))); });
api.get("/band/status", async (_req, res) => { res.json(await bandStatus()); });
api.get("/merchants/:mid/rooms/:rid", (req, res) => {
  const id = mid(req), rid = num(req.params.rid, "room");
  const room = Q.rooms(id).find(r => r.id === rid) ?? get("SELECT * FROM rooms WHERE id = ? AND merchant_id = ?", rid, id);
  if (!room) throw new HttpError(404, "room not found");
  const typing = [...engine(id).typingRooms].filter(k => k.startsWith(`${rid}:`)).map(k => k.split(":")[1]);
  res.json({ ...room, messages: Q.roomMessages(rid), band: { live: bandLive(), ...bandRoomInfo(rid) }, typing });
});
api.post("/merchants/:mid/rooms", (req, res) => {
  const rid = engine(mid(req)).createTeamRoom(text(req.body?.topic, "topic", 100));
  res.status(201).json({ id: rid });
});
api.post("/merchants/:mid/rooms/:rid/messages", (req, res) => {
  const e = engine(mid(req)), rid = num(req.params.rid, "room"), body = text(req.body?.text, "text", 2000);
  if (!get("SELECT 1 FROM rooms WHERE id = ? AND merchant_id = ?", rid, e.mid)) throw new HttpError(404, "room not found");
  void e.ownerSays(rid, body).catch(err => console.warn(err));
  res.status(202).json({ ok: true });
});
api.get("/merchants/:mid/approvals", (req, res) => { res.json(Q.approvals(mid(req))); });
api.get("/merchants/:mid/decisions", (req, res) => { res.json(Q.decisions(mid(req))); });
api.get("/merchants/:mid/events", (req, res) => { res.json(Q.events(mid(req), Math.min(500, Number(req.query.limit) || 80))); });
api.get("/merchants/:mid/promos", (req, res) => { res.json(Q.promos(mid(req))); });
api.get("/merchants/:mid/calls", (req, res) => { res.json(Q.calls(mid(req))); });
api.get("/merchants/:mid/tickets", (req, res) => { const id = mid(req); res.json(Q.tickets(id, engine(id).typing)); });
api.get("/merchants/:mid/tickets/:tid", (req, res) => {
  const id = mid(req), e = engine(id);
  const t = Q.tickets(id, e.typing).find(x => x.id === num(req.params.tid, "ticket"));
  if (!t) throw new HttpError(404, "ticket not found");
  res.json({ ...t, messages: Q.roomMessages(t.room_id) });
});

// ---- actions: service counter
api.post("/merchants/:mid/visitors", (req, res) => {
  const e = engine(mid(req));
  if (!e.live) throw new HttpError(409, "the shop is closed (simulation off or nobody watching)");
  e.spawn(oneOf(req.body?.kind ?? "service", ["shop", "service", "bot"] as const, "kind"));
  res.status(202).json({ ok: true });
});
api.post("/merchants/:mid/tickets/:tid/messages", async (req, res) => {
  const e = engine(mid(req)), tid = num(req.params.tid, "ticket");
  const as = oneOf(req.body?.as, ["customer", "staff"] as const, "as");
  const body = text(req.body?.text, "text");
  if (as === "staff") e.staffSays(tid, body); else await e.customerSays(tid, body);
  res.json({ ok: true });
});
api.post("/merchants/:mid/tickets/:tid/staff", (req, res) => { engine(mid(req)).setStaff(num(req.params.tid, "ticket"), !!req.body?.staff); res.json({ ok: true }); });
api.post("/merchants/:mid/tickets/:tid/resolve", (req, res) => { engine(mid(req)).resolveTicket(num(req.params.tid, "ticket"), "staff"); res.json({ ok: true }); });

// ---- actions: phone
api.post("/merchants/:mid/calls", (req, res) => {
  const id = engine(mid(req)).ring();
  if (!id) throw new HttpError(409, "a call is already in progress, or there are no customers");
  res.status(201).json({ id });
});
api.post("/merchants/:mid/calls/:cid/answer", (req, res) => { void engine(mid(req)).answer(num(req.params.cid, "call")); res.status(202).json({ ok: true }); });
api.post("/merchants/:mid/calls/:cid/takeover", (req, res) => { engine(mid(req)).takeOverCall(num(req.params.cid, "call")); res.json({ ok: true }); });
api.post("/merchants/:mid/calls/:cid/say", (req, res) => { engine(mid(req)).staffOnCall(num(req.params.cid, "call"), text(req.body?.text, "text", 500)); res.json({ ok: true }); });
api.post("/merchants/:mid/calls/:cid/end", (req, res) => {
  const e = engine(mid(req)), cid = num(req.params.cid, "call");
  const k = Q.calls(e.mid).find(c => c.id === cid);
  e.endCall(cid, k?.staff ? "staff" : "agent");
  res.json({ ok: true });
});

// ---- actions: goods & fraud
const TX_STATUSES = ["Released", "Blocked", "Refunded", "Exchange offered", "Denied", "Held"] as const;
api.post("/merchants/:mid/transactions/:txid/screen", async (req, res) => { res.json(await engine(mid(req)).screen(num(req.params.txid, "transaction"))); });
api.post("/merchants/:mid/transactions/:txid/decision", (req, res) => {
  engine(mid(req)).decideTransaction(num(req.params.txid, "transaction"), oneOf(req.body?.status, TX_STATUSES, "status"));
  res.json({ ok: true });
});
api.post("/merchants/:mid/scan", async (req, res) => { res.json(await engine(mid(req)).scanAll()); });

// ---- actions: approvals
const APPROVAL_STATUSES = ["Refunded", "Exchange offered", "Denied", "Photo requested"] as const;
api.post("/merchants/:mid/approvals/:aid", (req, res) => {
  engine(mid(req)).decideApproval(num(req.params.aid, "approval"), oneOf(req.body?.status, APPROVAL_STATUSES, "status"));
  res.json({ ok: true });
});

// ---- actions: promo engine
api.post("/merchants/:mid/promos", async (req, res) => { res.status(201).json(await engine(mid(req)).generatePromo(text(req.body?.prompt, "prompt", 500))); });
api.post("/merchants/:mid/promos/:pid/artwork", (req, res) => {
  const e = engine(mid(req)), pid = num(req.params.pid, "promo");
  if (!zooworkRoleLive("promo")) throw new HttpError(409, "Ad artwork needs the promo agent running on ZooWork. Set ZOOWORK_API_KEY on the server.");
  if (!get("SELECT 1 FROM promos WHERE id = ? AND merchant_id = ?", pid, e.mid)) throw new HttpError(404, "promo not found");
  void e.paintAd(pid).catch(err => console.warn(err));
  res.status(202).json({ ok: true });
});
api.get("/merchants/:mid/promos/:pid", (req, res) => {
  const p = Q.promos(mid(req)).find(x => x.id === num(req.params.pid, "promo"));
  if (!p) throw new HttpError(404, "promo not found");
  res.json(p);
});
api.get("/merchants/:mid/promos/:pid/image", (req, res) => {
  const p = get("SELECT image_path FROM promos WHERE id = ? AND merchant_id = ?", num(req.params.pid, "promo"), mid(req));
  if (!p?.image_path) throw new HttpError(404, "no artwork for this promo yet");
  res.setHeader("cache-control", "public, max-age=31536000, immutable");
  res.sendFile(path.join(DATA_DIR, "ads", path.basename(p.image_path)));
});
api.post("/merchants/:mid/promos/:pid/publish", (req, res) => { engine(mid(req)).publishPromo(num(req.params.pid, "promo")); res.json({ ok: true }); });

// ---- concierge
api.post("/merchants/:mid/summary", async (req, res) => { res.json(await engine(mid(req)).summary()); });

api.use("/merchants/:mid/console", (req, _res, next) => { mid(req); next(); }, consoleRouter);

api.use("/mission", missionRouter);

app.use("/api", api);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Something went wrong on the server" : err.message });
});

export default app;
