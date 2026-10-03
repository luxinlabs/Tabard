// Read models for the API. Every query is scoped to one merchant.
import { all, get, parse, startOfToday, type Row } from "./db.ts";
import { FLAGS, riskOf } from "./catalog.ts";

export function overview(mid: number) {
  const today = startOfToday();
  const sales = get(`SELECT COALESCE(SUM(amount),0) AS revenue, COUNT(*) AS orders FROM transactions
    WHERE merchant_id = ? AND type = 'order' AND status IN ('Paid','Released') AND created_at >= ?`, mid, today)!;
  const handled = get(`SELECT
      (SELECT COUNT(*) FROM tickets WHERE merchant_id = ? AND resolved_by = 'agent' AND resolved_at >= ?) +
      (SELECT COUNT(*) FROM calls WHERE merchant_id = ? AND handled_by = 'agent' AND ended_at >= ?) AS n`, mid, today, mid, today)!.n;
  const blocked = get(`SELECT COUNT(*) AS n FROM rooms WHERE merchant_id = ? AND state = 'blocked' AND opened_at >= ?`, mid, today)!.n;
  const waiting = get(`SELECT COUNT(*) AS n FROM approvals WHERE merchant_id = ? AND status = 'waiting'`, mid)!.n;
  const openTickets = get(`SELECT COUNT(*) AS n FROM tickets WHERE merchant_id = ? AND status != 'resolved'`, mid)!.n;
  const flagged = get(`SELECT COUNT(*) AS n FROM transactions WHERE merchant_id = ? AND flags != '[]' AND status IN ('Needs review','Held')`, mid)!.n;
  const promo = get(`SELECT * FROM promos WHERE merchant_id = ? AND status = 'live'`, mid);
  const ringing = get(`SELECT id FROM calls WHERE merchant_id = ? AND status IN ('ringing','live') ORDER BY id DESC LIMIT 1`, mid);

  // revenue by local hour for the last 8 hours
  const rows = all(`SELECT amount, created_at FROM transactions WHERE merchant_id = ? AND type = 'order' AND status IN ('Paid','Released') AND created_at >= ?`, mid, today);
  const nowH = new Date().getHours();
  const startH = Math.max(0, nowH - 7);
  const hourly = Array.from({ length: nowH - startH + 1 }, (_, i) => ({ h: String(startH + i).padStart(2, "0"), v: 0 }));
  for (const r of rows) {
    const h = new Date(r.created_at).getHours();
    if (h >= startH) hourly[h - startH].v += r.amount;
  }
  return {
    revenue: sales.revenue, orders: sales.orders, handled, blocked, waiting, openTickets, flagged,
    promoSeen: promo?.seen ?? 0, activeCall: !!ringing, hourly,
  };
}

export const productsWithRisk = (mid: number) => all(`SELECT p.*,
    (SELECT COUNT(*) FROM transactions t WHERE t.merchant_id = p.merchant_id AND t.sku = p.sku) AS tx_count,
    (SELECT COUNT(*) FROM transactions t WHERE t.merchant_id = p.merchant_id AND t.sku = p.sku AND t.flags != '[]' AND t.status IN ('Needs review','Held')) AS to_review,
    (SELECT COUNT(*) FROM transactions t WHERE t.merchant_id = p.merchant_id AND t.sku = p.sku AND t.status = 'Blocked') AS blocked
  FROM products p WHERE p.merchant_id = ? ORDER BY p.id`, mid);

export function shapeTx(t: Row) {
  const flags: string[] = parse(t.flags, []);
  return { ...t, flags, flag_labels: flags.map(f => FLAGS[f]?.label || f), risk: flags.length ? riskOf(flags) : 0, screen: parse(t.screen, null) };
}
export const transactions = (mid: number, sku?: string) => all(`SELECT t.*, c.name AS customer_name FROM transactions t
    LEFT JOIN customers c ON c.id = t.customer_id
    WHERE t.merchant_id = ? ${sku ? "AND t.sku = ?" : ""} ORDER BY t.created_at DESC LIMIT 200`, ...(sku ? [mid, sku] : [mid])).map(shapeTx);

export const tickets = (mid: number, typing: Set<number>) => all(`SELECT t.*, c.name AS customer_name, c.tier, c.risk, c.phone, r.handle, r.platform,
    (SELECT text FROM messages m WHERE m.room_id = t.room_id AND m.role != 'sys' ORDER BY m.id DESC LIMIT 1) AS last_text
  FROM tickets t JOIN customers c ON c.id = t.customer_id JOIN rooms r ON r.id = t.room_id
  WHERE t.merchant_id = ? ORDER BY (t.status = 'resolved'), t.id DESC LIMIT 40`, mid).map(t => ({ ...t, typing: typing.has(t.id) }) as Row);

export const roomMessages = (roomId: number) => all(`SELECT * FROM messages WHERE room_id = ? ORDER BY id`, roomId).map(m => ({ ...m, cites: parse(m.cites, []) }));

export const calls = (mid: number) => all(`SELECT k.*, c.name AS customer_name, c.phone FROM calls k JOIN customers c ON c.id = k.customer_id
  WHERE k.merchant_id = ? ORDER BY k.id DESC LIMIT 30`, mid).map(k => ({ ...k, staff: !!k.staff, lines: parse(k.lines, []) }) as Row);

export const approvals = (mid: number) => all(`SELECT a.*, c.name AS customer_name FROM approvals a JOIN customers c ON c.id = a.customer_id
  WHERE a.merchant_id = ? ORDER BY (a.status != 'waiting'), a.id DESC LIMIT 50`, mid).map(a => ({ ...a, reasons: parse(a.reasons, []) }));

export const decisions = (mid: number, limit = 60) => all(`SELECT * FROM decisions WHERE merchant_id = ? ORDER BY id DESC LIMIT ?`, mid, limit);
export const events = (mid: number, limit = 80) => all(`SELECT * FROM events WHERE merchant_id = ? ORDER BY id DESC LIMIT ?`, mid, limit);
export const agents = (mid: number, busy: Set<string>) => all(`SELECT * FROM agents WHERE merchant_id = ? ORDER BY id`, mid).map(a => ({ ...a, enabled: !!a.enabled, busy: busy.has(a.key) }));
export const customers = (mid: number) => all(`SELECT * FROM customers WHERE merchant_id = ? ORDER BY ltv DESC`, mid);
export const promos = (mid: number) => all(`SELECT * FROM promos WHERE merchant_id = ? ORDER BY id DESC LIMIT 20`, mid).map(p => ({ ...p, needs_approval: !!p.needs_approval, cites: parse(p.cites, []) }) as Row);
export const rooms = (mid: number) => all(`SELECT r.*, c.name AS customer_name FROM rooms r LEFT JOIN customers c ON c.id = r.customer_id
  WHERE r.merchant_id = ? ORDER BY r.id DESC LIMIT 50`, mid);

// Lifetime numbers for the merchant profile page.
export const totals = (mid: number) => get(`SELECT
    (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE merchant_id = ? AND type = 'order' AND status IN ('Paid','Released')) AS revenue,
    (SELECT COUNT(*) FROM transactions WHERE merchant_id = ? AND type = 'order' AND status IN ('Paid','Released')) AS orders,
    (SELECT COUNT(*) FROM rooms WHERE merchant_id = ?) AS rooms,
    (SELECT COUNT(*) FROM rooms WHERE merchant_id = ? AND state = 'blocked') AS blocked,
    (SELECT COUNT(*) FROM tickets WHERE merchant_id = ?) AS tickets,
    (SELECT COUNT(*) FROM calls WHERE merchant_id = ?) AS calls,
    (SELECT COUNT(*) FROM promos WHERE merchant_id = ? AND status != 'draft') AS promos,
    (SELECT COUNT(*) FROM events WHERE merchant_id = ?) AS events`, mid, mid, mid, mid, mid, mid, mid, mid)!;
