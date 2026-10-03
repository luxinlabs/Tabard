// Mission control: every merchant's agents talking to other agents, across the whole fleet. Mounted at /api/mission.
// Shapes match the Elm mission view (agreed with the console session); keep field names as they are.
import express, { type Response } from "express";
import { all, get, parse, startOfToday, type Row } from "./db.ts";
import { HttpError } from "./merchants.ts";
import { engineIfAny, missionClosed, missionOpened, missionWatching, startAllSimulated } from "./engine.ts";
import { zooworkLive } from "./zoowork.ts";
import { overview } from "./queries.ts";
import { roomShape } from "./console.ts";
import { send } from "./bus.ts";

export const missionRouter = express.Router();

const hhmm = (s: string | null | undefined) => (s ? new Date(s).toTimeString().slice(0, 5) : null);
const hhmmss = (s: string) => new Date(s).toTimeString().slice(0, 8);
const hourAgo = () => new Date(Date.now() - 3600_000).toISOString();

// ---------------------------------------------------------------- snapshot
function merchantCard(m: Row) {
  const o = overview(m.id);
  const e = engineIfAny(m.id);
  const since = hourAgo();
  const counts = new Map(all("SELECT sender, COUNT(*) AS n FROM messages WHERE merchant_id = ? AND created_at >= ? GROUP BY sender", m.id, since).map(r => [r.sender, r.n as number]));
  const live = zooworkLive();
  return {
    id: m.id, name: m.name, category: m.category, live: !!e?.live,
    openRooms: get("SELECT COUNT(*) AS n FROM rooms WHERE merchant_id = ? AND state = 'open'", m.id)!.n as number,
    approvalsWaiting: o.waiting, blockedToday: o.blocked, revenueToday: o.revenue, ordersToday: o.orders,
    lastActivity: hhmm(get("SELECT MAX(created_at) AS t FROM events WHERE merchant_id = ?", m.id)?.t),
    agents: all("SELECT * FROM agents WHERE merchant_id = ? ORDER BY id", m.id).map(a => ({
      key: a.key, handle: a.handle, name: a.name, line: a.line, enabled: !!a.enabled, busy: !!e?.busy.has(a.key),
      zoowork: live && !!a.zoowork_agent_id, messagesLastHour: counts.get(a.handle) ?? 0,
    })),
  };
}
type Card = ReturnType<typeof merchantCard>;

function totals(cards: Card[]) {
  return {
    merchants: cards.length,
    live: cards.filter(c => c.live).length,
    openRooms: cards.reduce((s, c) => s + c.openRooms, 0),
    messagesLastHour: get("SELECT COUNT(*) AS n FROM messages WHERE created_at >= ?", hourAgo())!.n as number,
    approvalsWaiting: cards.reduce((s, c) => s + c.approvalsWaiting, 0),
    blockedToday: get("SELECT COUNT(*) AS n FROM rooms WHERE state = 'blocked' AND opened_at >= ?", startOfToday())!.n as number,
    revenueToday: cards.reduce((s, c) => s + c.revenueToday, 0),
  };
}

function snapshot() {
  const cards = all("SELECT * FROM merchants ORDER BY id").map(merchantCard);
  return { generatedAt: new Date().toISOString(), totals: totals(cards), merchants: cards };
}

// ---------------------------------------------------------------- the wire
const MENTION = /@[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]*[A-Za-z0-9_-])?/g;

function wireItem(m: Row) {
  let to: string[];
  if (m.role === "sys") to = [];
  else {
    const mentions = [...new Set((m.text.match(MENTION) || []) as string[])].filter(h => h !== m.sender);
    to = mentions.length ? mentions : m.role === "buyer" ? ["@concierge"] : [m.room_handle];
  }
  return {
    id: m.id, time: hhmmss(m.created_at), merchantId: m.merchant_id, merchant: m.merchant_name,
    roomId: `r${m.room_id}`, roomKind: m.room_kind, platform: m.platform,
    from: m.sender, fromRole: m.role, to, text: m.text, cites: parse(m.cites, []), source: m.source ?? null,
  };
}

const WIRE_SQL = `SELECT m.*, r.handle AS room_handle, r.kind AS room_kind, r.platform, mm.name AS merchant_name
  FROM messages m JOIN rooms r ON r.id = m.room_id JOIN merchants mm ON mm.id = m.merchant_id`;

function wire(q: { merchant?: number; agent?: string; platform?: string; after?: number; limit: number }) {
  const where: string[] = [], params: (string | number)[] = [];
  if (q.merchant) { where.push("m.merchant_id = ?"); params.push(q.merchant); }
  if (q.platform) { where.push("LOWER(r.platform) = LOWER(?)"); params.push(q.platform); }
  if (q.after !== undefined) { where.push("m.id > ?"); params.push(q.after); }
  // the agent filter matches derived recipients too, so over-fetch and filter after deriving
  const fetch = q.agent ? Math.min(5000, q.limit * 10) : q.limit;
  const sql = `${WIRE_SQL} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY m.id ${q.after !== undefined ? "ASC" : "DESC"} LIMIT ?`;
  let items = all(sql, ...params, fetch).map(wireItem);
  if (q.after === undefined) items.reverse();
  if (q.agent) items = items.filter(i => i.from === q.agent || i.to.includes(q.agent!));
  return q.after !== undefined ? items.slice(0, q.limit) : items.slice(-q.limit);
}

// collapse buyer handles so the graph stays small: @muse/priya.r → @muse/*, bots and unknowns → @unverified/*
const PLATFORMS = ["muse", "dots"];
function node(handle: string) {
  if (handle === "@staff/you" || /^@[a-z]+$/.test(handle)) return handle; // merchant agents and staff
  const prefix = handle.match(/^@([a-z]+)\//)?.[1];
  return prefix && PLATFORMS.includes(prefix) ? `@${prefix}/*` : "@unverified/*";
}

function links(minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const items = all(`${WIRE_SQL} WHERE m.created_at >= ? ORDER BY m.id`, since).map(wireItem);
  const agg = new Map<string, { from: string; to: string; count: number; merchants: Set<number> }>();
  for (const i of items) {
    const from = node(i.from);
    for (const t of i.to) {
      const to = node(t);
      const k = from + "→" + to;
      const a = agg.get(k) ?? { from, to, count: 0, merchants: new Set<number>() };
      a.count++; a.merchants.add(i.merchantId);
      agg.set(k, a);
    }
  }
  return [...agg.values()].sort((a, b) => b.count - a.count).map(a => ({ ...a, merchants: [...a.merchants].sort((x, y) => x - y) }));
}

// ---------------------------------------------------------------- routes
const int = (v: unknown, name: string) => {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) throw new HttpError(400, `${name} must be a non-negative integer`);
  return n;
};
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

missionRouter.get("/", (_req, res) => { res.json(snapshot()); });

missionRouter.get("/wire", (req, res) => {
  res.json(wire({
    merchant: int(req.query.merchant, "merchant"), agent: str(req.query.agent), platform: str(req.query.platform),
    after: int(req.query.after, "after"), limit: Math.min(500, int(req.query.limit, "limit") || 100),
  }));
});

missionRouter.get("/links", (req, res) => { res.json(links(Math.min(24 * 60, int(req.query.minutes, "minutes") || 60))); });

missionRouter.get("/rooms/:merchantId/:roomId", (req, res) => {
  const mid = int(req.params.merchantId, "merchantId");
  const rid = int(String(req.params.roomId).replace(/^r/, ""), "roomId");
  const m = get("SELECT * FROM merchants WHERE id = ?", mid ?? -1);
  if (!m) throw new HttpError(404, "merchant not found");
  const r = get("SELECT * FROM rooms WHERE id = ? AND merchant_id = ?", rid ?? -1, m.id);
  if (!r) throw new HttpError(404, "room not found");
  res.json({ merchantId: m.id, merchant: m.name, room: roomShape(r) });
});

// ---------------------------------------------------------------- stream: one shared poller fans out to every viewer
const viewers = new Set<Response>();
let poller: NodeJS.Timeout | null = null;
let lastId = 0, lastTotals = "", lastTotalsAt = 0;
const lastCards = new Map<number, string>();

function tick() {
  if (!viewers.size) return;
  const out = (msg: unknown) => { for (const v of viewers) send(v, msg); };
  // new messages, oldest first
  for (const i of all(`${WIRE_SQL} WHERE m.id > ? ORDER BY m.id LIMIT 500`, lastId).map(wireItem)) {
    lastId = i.id;
    out({ type: "message", ...i });
  }
  if (Date.now() - lastTotalsAt < 2000) return;
  lastTotalsAt = Date.now();
  if (missionWatching()) startAllSimulated(); // picks up shops created or switched on since the stream opened
  const snap = snapshot();
  const t = JSON.stringify(snap.totals);
  if (t !== lastTotals) { lastTotals = t; out({ type: "totals", ...snap.totals }); }
  for (const c of snap.merchants) {
    const j = JSON.stringify(c);
    if (lastCards.get(c.id) !== j) { lastCards.set(c.id, j); out({ type: "merchant", ...c }); }
  }
}

missionRouter.get("/stream", (req, res) => {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive", "x-accel-buffering": "no" });
  if (!viewers.size) lastId = (get("SELECT MAX(id) AS id FROM messages")?.id as number) ?? 0;
  viewers.add(res);
  missionOpened();
  // a fresh viewer gets the current state straight away
  const snap = snapshot();
  send(res, { type: "totals", ...snap.totals });
  for (const c of snap.merchants) send(res, { type: "merchant", ...c });
  if (!poller) poller = setInterval(tick, 1000);
  const ping = setInterval(() => res.write(": ping\n\n"), 20_000);
  req.on("close", () => {
    clearInterval(ping);
    viewers.delete(res);
    missionClosed();
    if (!viewers.size && poller) { clearInterval(poller); poller = null; lastCards.clear(); lastTotals = ""; }
  });
});
