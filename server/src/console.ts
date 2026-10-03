// Read-only adapters in the shapes the Elm merchant console (src/Data.elm) expects, plus one write endpoint.
// Mounted at /api/merchants/:mid/console.
import express, { type Request } from "express";
import { all, get, parse, type Row } from "./db.ts";
import { FLAGS, riskOf } from "./catalog.ts";
import { engine } from "./engine.ts";
import { HttpError } from "./merchants.ts";

export const consoleRouter = express.Router({ mergeParams: true });
const mid = (req: Request) => Number((req.params as Record<string, string>).mid);
const hhmm = (s: string) => new Date(s).toTimeString().slice(0, 5);
const day = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
type Tone = "good" | "warn" | "bad" | "neutral" | "rose";
const pill = (label: string, tone: Tone) => ({ label, tone });

const LINE: Record<string, string> = { shop: "Sell more", service: "Run leaner", bot: "Lose less" };
const DECISION_OUT: Record<string, string> = { Denied: "Declined" };
const DECISION_IN: Record<string, string> = { Declined: "Denied" };

function refund(a: Row) {
  return {
    id: a.code, cust: a.customer_name, order: a.order_code, amt: a.amount, risk: a.risk, rec: a.recommendation,
    why: parse(a.reasons, []), decision: a.status === "waiting" ? null : DECISION_OUT[a.status] || a.status,
  };
}
const logEntry = (d: Row) => ({ time: hhmm(d.created_at), agent: d.agent, decision: d.decision, basis: d.basis, version: d.version });

// One room in the console's Room shape. Shared with the mission-control API.
export function roomShape(r: Row) {
  const waiting = all(`SELECT a.code, t.room_id FROM approvals a JOIN tickets t ON t.id = a.ticket_id WHERE a.merchant_id = ? AND a.status = 'waiting'`, r.merchant_id);
  const msgs = all("SELECT * FROM messages WHERE room_id = ? ORDER BY id", r.id);
  const caseId = waiting.find(w => w.room_id === r.id)?.code ?? null;
  const state = caseId ? pill("Needs approval", "warn")
    : r.state === "blocked" ? pill("Blocked", "bad")
    : r.state === "sold" ? pill("Sold", "good")
    : r.state === "open" ? (r.kind === "shop" ? pill("Negotiating", "good") : pill("Service", "neutral"))
    : pill(r.state === "left" ? "Left" : "Resolved", "neutral");
  return {
    id: `r${r.id}`, platform: r.platform, handle: r.handle, customerId: r.customer_id ? `c${r.customer_id}` : null,
    state, intent: r.intent || "", opened: hhmm(r.opened_at), line: LINE[r.kind] || "Sell more",
    members: [...new Set([r.handle, ...msgs.map(x => x.sender).filter(s => s !== "system")])],
    posts: msgs.map(x => {
      const approval = !!caseId && x.role === "agent" && /owner/.test(x.text);
      return { from: x.sender, kind: x.role === "staff" ? "agent" : x.role, text: x.text, payload: null, cites: parse(x.cites, []), approval, caseId: approval ? caseId : null };
    }),
  };
}

consoleRouter.get("/rooms", (req, res) => {
  res.json(all("SELECT * FROM rooms WHERE merchant_id = ? ORDER BY id DESC LIMIT 30", mid(req)).map(roomShape));
});

consoleRouter.get("/customers", (req, res) => {
  const m = mid(req);
  res.json(all("SELECT * FROM customers WHERE merchant_id = ? ORDER BY ltv DESC", m).map(c => {
    const txs = all(`SELECT t.*, p.name AS item FROM transactions t LEFT JOIN products p ON p.merchant_id = t.merchant_id AND p.sku = t.sku
      WHERE t.customer_id = ? ORDER BY t.created_at DESC`, c.id);
    const first = txs[txs.length - 1];
    return {
      id: `c${c.id}`, name: c.name, since: first ? `Customer since ${new Date(first.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : "New customer",
      tier: c.tier, ltv: c.ltv, orders: txs.filter(t => t.type === "order").length, returnRate: c.return_rate, risk: c.risk,
      sizes: [], prefs: c.city ? [`Ships to ${c.city}`] : [], phone: c.phone,
      history: txs.slice(0, 6).map(t => ({
        order: t.code, item: t.item || t.sku, date: day(t.created_at), amount: t.amount,
        outcome: t.type === "refund" ? (t.status === "Needs review" ? "Refund requested" : t.status) : t.status === "Paid" ? "Kept" : t.status,
      })),
    };
  }));
});

consoleRouter.get("/refunds", (req, res) => {
  res.json(all(`SELECT a.*, c.name AS customer_name FROM approvals a JOIN customers c ON c.id = a.customer_id WHERE a.merchant_id = ? ORDER BY (a.status != 'waiting'), a.id DESC`, mid(req)).map(refund));
});

consoleRouter.get("/agents-seen", (req, res) => {
  const m = mid(req);
  const threshold = get("SELECT risk_threshold FROM merchants WHERE id = ?", m)!.risk_threshold;
  const rows = all(`SELECT r.handle, r.platform, r.kind, MAX(r.state = 'blocked') AS blocked, MAX(c.risk) AS risk
    FROM rooms r LEFT JOIN customers c ON c.id = r.customer_id WHERE r.merchant_id = ? GROUP BY r.handle ORDER BY MAX(r.id) DESC LIMIT 40`, m);
  res.json(rows.map(r => r.blocked
    ? { handle: r.handle, claims: r.platform === "Unverified" ? "Muse (false)" : r.platform, checks: ["No signature", "Handle < 24h old", "Abnormal request rate"], risk: 92, result: pill("Blocked", "bad") }
    : { handle: r.handle, claims: r.platform, checks: ["Band handle", "Signature", "Rate"], risk: r.risk ?? 10,
        result: (r.risk ?? 0) > threshold ? pill("Allowed, watched", "warn") : pill("Allowed", "good") }));
});

consoleRouter.get("/signals", (req, res) => {
  const txs = all("SELECT * FROM transactions WHERE merchant_id = ? AND flags != '[]' ORDER BY created_at DESC LIMIT 30", mid(req));
  res.json(txs.map(t => {
    const flags: string[] = parse(t.flags, []);
    const risk = riskOf(flags);
    return {
      time: hhmm(t.created_at), text: `${t.code} (${t.buyer_handle}): ${flags.map(f => FLAGS[f]?.label || f).join("; ")}`,
      by: flags.includes("no_signature") ? "@gatekeeper" : "@returns",
      severity: risk > 60 ? pill("High", "bad") : risk > 30 ? pill("Medium", "warn") : pill("Low", "neutral"),
    };
  }));
});

consoleRouter.get("/log", (req, res) => {
  res.json(all("SELECT * FROM decisions WHERE merchant_id = ? ORDER BY id DESC LIMIT 60", mid(req)).map(logEntry));
});

consoleRouter.post("/refunds/:caseId/decision", (req, res) => {
  const m = mid(req);
  const raw = req.body?.decision;
  if (!["Exchange offered", "Refunded", "Declined", "Photo requested"].includes(raw)) throw new HttpError(400, "decision must be one of: Exchange offered, Refunded, Declined, Photo requested");
  const a = get("SELECT id FROM approvals WHERE merchant_id = ? AND code = ?", m, req.params.caseId);
  if (!a) throw new HttpError(404, "refund case not found");
  engine(m).decideApproval(a.id, DECISION_IN[raw] || raw);
  const updated = get("SELECT a.*, c.name AS customer_name FROM approvals a JOIN customers c ON c.id = a.customer_id WHERE a.id = ?", a.id)!;
  const log = get("SELECT * FROM decisions WHERE merchant_id = ? ORDER BY id DESC LIMIT 1", m)!;
  res.json({ refund: refund(updated), log: logEntry(log) });
});
