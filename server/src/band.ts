// Band (band.ai) bridge: every Tabard room is a real Band chat room, and agent hand-offs travel through it.
//
// Each Tabard agent is a Band "Remote Agent" registered at app.band.ai/agents, with its own API key in server/.env:
//   BAND_KEY_CONCIERGE, BAND_KEY_STYLIST, BAND_KEY_PROMO, BAND_KEY_SERVICE, BAND_KEY_RETURNS, BAND_KEY_GATEKEEPER,
//   BAND_KEY_SHOPPER (one agent that speaks for the simulated Muse/Dots buyer agents).
// Band is on when the concierge and shopper keys are set. Roles without a key are relayed by the concierge.
//
//  mirror()  – posts a room message to Band as the agent who said it, with @mentions for whoever should act on it.
//  handoff() – one agent @mentions another in the Band room; the recipient pulls the message from its own Band
//              inbox (GET /messages/next), marks it processing, answers in the room, and marks it processed.
import { all, get, iso, run, type Row } from "./db.ts";

const BASE = (process.env.BAND_API_URL || "https://api.band.ai").replace(/\/$/, "");
export const BAND_ROLES = ["concierge", "stylist", "promo", "service", "returns", "gatekeeper", "shopper"] as const;
export type BandRole = (typeof BAND_ROLES)[number];
const keyOf = (r: BandRole) => process.env[`BAND_KEY_${r.toUpperCase()}`];
export const bandLive = () => !!keyOf("concierge") && !!keyOf("shopper");
export const bandRoles = () => BAND_ROLES.filter(r => keyOf(r));
const poster = (r: BandRole): BandRole => (keyOf(r) ? r : "concierge");

class BandError extends Error { constructor(public status: number, msg: string) { super(msg); } }

async function call<T>(role: BandRole, method: string, path: string, body?: unknown): Promise<T | null> {
  const key = keyOf(role);
  if (!key) throw new BandError(0, `no Band key for ${role}`);
  const r = await fetch(BASE + path, {
    method,
    headers: { "x-api-key": key, accept: "application/json", ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  if (r.status === 204) return null;
  const text = await r.text();
  if (!r.ok) throw new BandError(r.status, `Band ${method} ${path} → ${r.status} ${text.slice(0, 200)}`);
  return text ? (JSON.parse(text) as T) : null;
}

// ---------------------------------------------------------------- identities
type Identity = { id: string; handle: string; name: string };
const identities = new Map<BandRole, Promise<Identity>>();
export function identity(role: BandRole) {
  if (!identities.has(role)) identities.set(role, call<{ data: Identity }>(role, "GET", "/api/v1/agent/me")
    .then(r => r!.data)
    .catch(e => { identities.delete(role); throw e; }));
  return identities.get(role)!;
}
export async function bandStatus() {
  if (!bandLive()) return { live: false, agents: [] as { role: BandRole; handle: string | null; ok: boolean; error?: string }[] };
  const agents = await Promise.all(bandRoles().map(async role => {
    try { const me = await identity(role); return { role, handle: me.handle, ok: true }; }
    catch (e) { return { role, handle: null, ok: false, error: (e as Error).message }; }
  }));
  return { live: true, agents };
}

// Tabard sender → the Band role that speaks for it
export function roleOf(sender: string): BandRole {
  const k = sender.replace(/^@/, "");
  if ((BAND_ROLES as readonly string[]).includes(k)) return k as BandRole;
  if (sender === "@staff/you" || sender === "system") return "concierge";
  return "shopper"; // @muse/…, @dots/…, bots
}
const MENTION_ROLES = /@(concierge|stylist|promo|service|returns|gatekeeper)\b/g;

// ---------------------------------------------------------------- rooms
const roomQueues = new Map<number, Promise<unknown>>();
function enqueue<T>(roomId: number, job: () => Promise<T>): Promise<T> {
  const prev = roomQueues.get(roomId) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(job);
  roomQueues.set(roomId, next);
  void next.finally(() => { if (roomQueues.get(roomId) === next) roomQueues.delete(roomId); });
  return next;
}

async function ensureRoom(room: Row): Promise<string> {
  if (room.band_chat_id) return room.band_chat_id;
  const m = get("SELECT name FROM merchants WHERE id = ?", room.merchant_id);
  const title = (room.kind === "team" ? `${m?.name} · ${room.intent || "Team room"}` : `${m?.name} · ${room.handle} · ${room.kind}`).replace(/[\r\n\0]/g, " ").slice(0, 120);
  const r = await call<{ data: { id: string } }>("concierge", "POST", "/api/v1/agent/chats", { chat: { title } });
  const chatId = r!.data.id;
  run("UPDATE rooms SET band_chat_id = ? WHERE id = ?", chatId, room.id);
  for (const role of bandRoles().filter(x => x !== "concierge")) {
    try {
      const me = await identity(role);
      await call("concierge", "POST", `/api/v1/agent/chats/${chatId}/participants`, { participant: { participant_id: me.id, role: "member" } });
    } catch (e) { console.warn(`[band] couldn't add ${role} to ${chatId}: ${(e as Error).message}`); }
  }
  return chatId;
}

// who should act on a message
function recipients(msg: Row, from: BandRole): BandRole[] {
  const named = [...String(msg.text).matchAll(MENTION_ROLES)].map(m => m[1] as BandRole);
  const base: BandRole[] = msg.role === "buyer" ? ["concierge"] : ["shopper"];
  return [...new Set([...named, ...base])].filter(r => r !== from && keyOf(r));
}

async function send(chatId: string, from: BandRole, content: string, to: BandRole[]) {
  const mentions = await Promise.all(to.map(async r => ({ id: (await identity(r)).id })));
  const r = await call<{ data: { id: string } }>(from, "POST", `/api/v1/agent/chats/${chatId}/messages`, { message: { content: content.slice(0, 8000), mentions } });
  return r!.data.id;
}

function contentFor(msg: Row, speaker: BandRole) {
  const actual = roleOf(msg.sender);
  if (actual === "shopper") return `[${msg.sender}] ${msg.text}`;          // one Band agent speaks for many buyer agents
  if (msg.sender === "@staff/you") return `(owner) ${msg.text}`;
  if (speaker !== actual) return `(for @${actual}) ${msg.text}`;           // relayed: that role has no Band key
  return msg.text;
}

// Post one stored message to Band. Called for every new message while Band is on.
export function mirror(messageId: number) {
  if (!bandLive()) return;
  const msg = get("SELECT * FROM messages WHERE id = ?", messageId);
  if (!msg) return;
  void enqueue(msg.room_id, async () => {
    const room = get("SELECT * FROM rooms WHERE id = ?", msg.room_id);
    if (!room) return;
    try {
      const chatId = await ensureRoom(room);
      const from = poster(roleOf(msg.sender));
      if (msg.role === "sys") {
        await call(from, "POST", `/api/v1/agent/chats/${chatId}/events`, { event: { content: String(msg.text).slice(0, 16000), message_type: "thought" } });
        run("UPDATE messages SET band_status = 'sent' WHERE id = ?", messageId);
        return;
      }
      const id = await send(chatId, from, contentFor(msg, from), recipients(msg, from));
      run("UPDATE messages SET band_message_id = ?, band_status = 'sent' WHERE id = ?", id, messageId);
    } catch (e) {
      run("UPDATE messages SET band_status = 'failed' WHERE id = ?", messageId);
      console.warn(`[band] mirror failed: ${(e as Error).message}`);
    }
  });
}

// One agent asks another through the Band room and waits for the answer.
// Returns null when Band can't carry it (keys missing, Band down), so the caller can ask directly instead.
export async function handoff(opts: {
  roomId: number; from: BandRole; to: BandRole; ask: string; askMessageId: number;
  answer: (content: string) => Promise<string>; timeoutMs?: number;
}): Promise<{ text: string; bandMessageId: string } | null> {
  if (!bandLive() || !keyOf(opts.from) || !keyOf(opts.to)) return null;
  try {
    return await enqueue(opts.roomId, async () => {
      const room = get("SELECT * FROM rooms WHERE id = ?", opts.roomId)!;
      const chatId = await ensureRoom(room);
      const sentId = await send(chatId, opts.from, opts.ask, [opts.to]);
      run("UPDATE messages SET band_message_id = ?, band_status = 'sent' WHERE id = ?", sentId, opts.askMessageId);
      // the recipient works its own Band inbox until it reaches this request
      const deadline = Date.now() + (opts.timeoutMs ?? 20_000);
      while (Date.now() < deadline) {
        const next = await call<{ data: { id: string; content: string } }>(opts.to, "GET", `/api/v1/agent/chats/${chatId}/messages/next`);
        if (!next) { await new Promise(r => setTimeout(r, 600)); continue; }
        await call(opts.to, "POST", `/api/v1/agent/chats/${chatId}/messages/${next.data.id}/processing`);
        if (next.data.id !== sentId) { // an earlier mention it only needed to read
          await call(opts.to, "POST", `/api/v1/agent/chats/${chatId}/messages/${next.data.id}/processed`);
          continue;
        }
        const text = await opts.answer(next.data.content);
        const replyId = await send(chatId, opts.to, text, [opts.from]);
        await call(opts.to, "POST", `/api/v1/agent/chats/${chatId}/messages/${sentId}/processed`);
        return { text, bandMessageId: replyId };
      }
      throw new Error(`@${opts.to} didn't receive the hand-off within the time limit`);
    });
  } catch (e) {
    console.warn(`[band] hand-off @${opts.from} → @${opts.to} failed: ${(e as Error).message}`);
    run("UPDATE messages SET band_status = 'failed' WHERE id = ?", opts.askMessageId);
    return null;
  }
}

export const bandRoomInfo = (roomId: number) => {
  const r = get("SELECT band_chat_id FROM rooms WHERE id = ?", roomId);
  const counts = all("SELECT band_status, COUNT(*) AS n FROM messages WHERE room_id = ? GROUP BY band_status", roomId);
  return { chatId: r?.band_chat_id ?? null, sent: counts.find(c => c.band_status === "sent")?.n ?? 0, failed: counts.find(c => c.band_status === "failed")?.n ?? 0, checkedAt: iso() };
};
