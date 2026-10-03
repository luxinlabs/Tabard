// Creating merchants and their starting data.
import { all, get, insert, iso, run, tx, type Row } from "./db.ts";
import { AGENT_DEFAULTS, SAMPLE_STORES, riskOf, type StoreKind } from "./catalog.ts";

export const MERCHANT_FIELDS = [
  "name", "category", "tagline", "owner_name", "owner_email", "phone", "website", "city", "currency", "timezone", "plan",
  "discount_cap", "refund_review_over", "risk_threshold", "house_offer", "simulate",
] as const;
const NUMERIC = new Set(["discount_cap", "refund_review_over", "risk_threshold", "simulate"]);

export type MerchantInput = Partial<Record<(typeof MERCHANT_FIELDS)[number], string | number | boolean | null>> & { sample?: StoreKind | "none" };

export function cleanMerchant(input: Record<string, unknown>) {
  const out: Record<string, string | number | null> = {};
  for (const k of MERCHANT_FIELDS) {
    if (!(k in input)) continue;
    const v = input[k];
    if (NUMERIC.has(k)) {
      const n = typeof v === "boolean" ? Number(v) : Number(v);
      if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${k} must be a non-negative number`);
      out[k] = Math.round(n);
    } else out[k] = v == null || v === "" ? null : String(v).slice(0, 300);
  }
  return out;
}

export class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }

const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "shop";

export function createMerchant(input: MerchantInput): Row {
  const data = cleanMerchant(input as Record<string, unknown>);
  if (!data.name) throw new HttpError(400, "name is required");
  return tx(() => {
    let slug = slugify(String(data.name)), n = 2;
    while (get("SELECT 1 FROM merchants WHERE slug = ?", slug)) slug = `${slugify(String(data.name))}-${n++}`;
    const cols = Object.keys(data);
    const id = insert(
      `INSERT INTO merchants (slug, created_at${cols.map(c => ", " + c).join("")}) VALUES (?, ?${cols.map(() => ", ?").join("")})`,
      slug, iso(), ...cols.map(c => data[c]),
    );
    for (const a of AGENT_DEFAULTS) {
      insert("INSERT INTO agents (merchant_id, key, handle, name, line, job, version) VALUES (?, ?, ?, ?, ?, ?, ?)", id, a.key, a.handle, a.name, a.line, a.job, a.version);
    }
    if (input.sample && input.sample !== "none") seedSample(id, input.sample);
    return get("SELECT * FROM merchants WHERE id = ?", id)!;
  });
}

const minsAgo = (m: number) => iso(new Date(Date.now() - m * 60_000));

// Fill a merchant with a sample catalog, customers and a morning of activity.
export function seedSample(merchantId: number, kind: StoreKind) {
  const store = SAMPLE_STORES[kind];
  const cust = store.customers.map(c => insert(
    "INSERT INTO customers (merchant_id, name, tier, ltv, return_rate, risk, phone, city, last_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    merchantId, c.name, c.tier, c.ltv, c.return_rate, c.risk, c.phone, c.city, c.last_order,
  ));
  for (const p of store.products) {
    insert("INSERT INTO products (merchant_id, sku, name, category, price, cost, stock, swatch) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      merchantId, p.sku, p.name, p.category, p.price, p.cost, p.stock, p.swatch);
  }
  const prods = store.products;
  const limited = prods.find(p => /limited/i.test(p.name)) || prods[0];
  const prefix = prods[0].sku.split("-")[0];
  let code = 8900;
  const addTx = (o: { sku: string; mins: number; buyer: string; cust: number | null; qty?: number; amount: number; type?: string; flags?: string[]; status: string }) =>
    insert("INSERT INTO transactions (merchant_id, code, sku, buyer_handle, customer_id, qty, amount, type, flags, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      merchantId, `TX-${code++}`, o.sku, o.buyer, o.cust, o.qty ?? 1, o.amount, o.type ?? "order", JSON.stringify(o.flags ?? []), o.status, minsAgo(o.mins));

  // a morning of paid orders spread over the last few hours
  const handles = ["@muse/", "@dots/agent-"];
  for (let i = 0; i < 14; i++) {
    const p = prods[(i * 3) % prods.length];
    const ci = (i * 5) % cust.length;
    const amount = Math.round(p.price * (i % 3 === 0 ? 0.9 : 1));
    addTx({ sku: p.sku, mins: 20 + i * 13, buyer: handles[i % 2] + (i % 2 ? (4096 + i * 37).toString(16) : store.customers[ci].name.split(" ")[0].toLowerCase()), cust: cust[ci], amount, status: "Paid" });
    run("UPDATE products SET sold = sold + 1 WHERE merchant_id = ? AND sku = ?", merchantId, p.sku);
  }
  // fraud cases waiting for a look
  const risky = store.customers.findIndex(c => c.risk > 60);
  const riskyId = cust[risky >= 0 ? risky : 0];
  addTx({ sku: limited.sku, mins: 25, buyer: "@shopbot-x9", cust: null, qty: 40, amount: limited.price * 40, flags: ["no_signature", "bulk_limited", "many_addresses", "new_handle"], status: "Blocked" });
  addTx({ sku: limited.sku, mins: 31, buyer: "@fastcart-77", cust: null, qty: 12, amount: limited.price * 12, flags: ["no_signature", "bulk_limited"], status: "Blocked" });
  addTx({ sku: prods[2 % prods.length].sku, mins: 40, buyer: "@dots/agent-7f21", cust: riskyId, amount: prods[2 % prods.length].price, type: "refund", flags: ["resale_listing", "repeat_returns", "forwarder"], status: "Needs review" });
  addTx({ sku: prods[3 % prods.length].sku, mins: 58, buyer: "@dots/agent-31bd", cust: null, qty: 2, amount: prods[3 % prods.length].price * 2, flags: ["card_mismatch", "promo_abuse"], status: "Held" });
  addTx({ sku: prods[4 % prods.length].sku, mins: 64, buyer: "@dots/agent-0c4e", cust: cust[4 % cust.length], amount: Math.round(prods[4 % prods.length].price * 0.6), type: "refund", flags: ["signed_but_claimed"], status: "Needs review" });

  // bots already turned away this morning
  for (let i = 0; i < 6; i++) {
    insert("INSERT INTO rooms (merchant_id, handle, platform, kind, intent, state, opened_at, closed_at) VALUES (?, ?, 'Unverified', 'bot', ?, 'blocked', ?, ?)",
      merchantId, `@bulkbot-${(900 + i * 7).toString(36)}`, "Bulk order on a limited item", minsAgo(30 + i * 17), minsAgo(30 + i * 17));
  }

  // refunds waiting for the owner
  const riskyCust = get("SELECT * FROM customers WHERE id = ?", riskyId)!;
  insert("INSERT INTO approvals (merchant_id, code, customer_id, order_code, amount, risk, recommendation, reasons, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    merchantId, "RF-2207", riskyId, riskyCust.last_order, prods[2 % prods.length].price, riskOf(["resale_listing", "repeat_returns", "forwarder"]),
    "Deny refund, offer exchange", JSON.stringify(["3rd return in 60 days", "Same item listed on a resale site", "Ships to a freight forwarder"]), minsAgo(40));
  const c3 = get("SELECT * FROM customers WHERE id = ?", cust[3 % cust.length])!;
  insert("INSERT INTO approvals (merchant_id, code, customer_id, order_code, amount, risk, recommendation, reasons, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    merchantId, "RF-2204", c3.id, c3.last_order, 182, 31, "Approve refund", JSON.stringify(["Damaged in transit, photo attached", "First return"]), minsAgo(52));

  const ev = (actor: string, text: string, kind: string, m: number) => insert("INSERT INTO events (merchant_id, actor, text, kind, created_at) VALUES (?, ?, ?, ?, ?)", merchantId, actor, text, kind, minsAgo(m));
  const dec = (agent: string, decision: string, basis: string, m: number) => {
    const v = AGENT_DEFAULTS.find(a => a.handle === agent)?.version || "—";
    insert("INSERT INTO decisions (merchant_id, agent, decision, basis, version, created_at) VALUES (?, ?, ?, ?, ?, ?)", merchantId, agent, decision, basis, v, minsAgo(m));
  };
  ev("@gatekeeper", "blocked @shopbot-x9 at the door", "block", 25);
  ev("@returns", "sent RF-2207 for owner approval", "risk", 40);
  ev("@concierge", "shop opened, agents online", "info", 240);
  dec("@gatekeeper", "Blocked @shopbot-x9 for 30 days", "No signature, rate, Tavily lookup", 25);
  dec("@returns", "Sent RF-2207 for human approval", "Risk above threshold, amount above review limit", 40);
  dec("@promo", `Offered 10% off ${prods[0].name}`, "Returning customer, margin rule", 50);
}

export function merchantSummary(id: number) {
  return get("SELECT * FROM merchants WHERE id = ?", id);
}
export function listMerchants() {
  return all(`SELECT m.*,
      (SELECT COUNT(*) FROM products p WHERE p.merchant_id = m.id) AS product_count,
      (SELECT COUNT(*) FROM customers c WHERE c.merchant_id = m.id) AS customer_count,
      (SELECT COUNT(*) FROM approvals a WHERE a.merchant_id = m.id AND a.status = 'waiting') AS waiting,
      (SELECT MAX(created_at) FROM events e WHERE e.merchant_id = m.id) AS last_activity
    FROM merchants m ORDER BY m.id`);
}

// ---------------------------------------------------------------- shops imported from a storefront link
const HEXRE = /^#[0-9a-fA-F]{6}$/;
const WALK_IN = [
  { name: "Maya Chen", tier: "Gold", ltv: 1260, return_rate: 7, risk: 9, city: "Seattle" },
  { name: "Jordan Ellis", tier: "Standard", ltv: 340, return_rate: 52, risk: 70, city: "Phoenix" },
  { name: "Sofia Rossi", tier: "Silver", ltv: 780, return_rate: 12, risk: 14, city: "Boston" },
  { name: "Kwame Asante", tier: "Standard", ltv: 220, return_rate: 18, risk: 22, city: "Atlanta" },
  { name: "Lucía Gómez", tier: "Gold", ltv: 1640, return_rate: 5, risk: 6, city: "San Diego" },
  { name: "Ben Carter", tier: "Standard", ltv: 410, return_rate: 36, risk: 63, city: "Denver" },
];

export function createFromImport(p: any): Row {
  if (!p || typeof p !== "object" || !p.merchant?.name) throw new HttpError(400, "Run the import preview first, then confirm it.");
  const t = p.theme ?? {};
  const theme = Object.fromEntries(["wall", "floorA", "floorB", "accent", "trim"].map(k => [k, HEXRE.test(t[k]) ? t[k] : null]));
  if (Object.values(theme).some(v => !v)) throw new HttpError(400, "The room theme is incomplete.");
  const platform = ["tiktok", "amazon", "shopify", "etsy", "web"].includes(p.platform) ? p.platform : "web";
  const products = (Array.isArray(p.products) ? p.products : []).slice(0, 24).filter((x: any) => x && typeof x.name === "string" && x.name.trim());
  const httpsOrNull = (u: unknown) => (typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) ? u.slice(0, 1000) : null);
  const m = p.merchant;
  return tx(() => {
    const created = createMerchant({
      name: m.name, category: m.category || "Online store", tagline: m.tagline, website: m.website, city: m.city,
      house_offer: m.house_offer || "10% off for returning customers", plan: "Starter", sample: "none",
    });
    const id = created.id as number;
    run("UPDATE merchants SET description = ?, source_url = ?, source_platform = ?, theme = ?, import_notes = ? WHERE id = ?",
      String(m.description ?? "").slice(0, 1000), httpsOrNull(p.url) ?? String(p.url ?? "").slice(0, 500), platform,
      JSON.stringify({ ...theme, vibe: String(t.vibe ?? "").slice(0, 80) }),
      JSON.stringify({ method: p.method === "claude" ? "claude" : "rules", sources: (p.sources ?? []).slice(0, 10), imported_at: iso() }), id);

    const prefix = String(m.name).replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "SH";
    const swatches = [theme.accent, theme.trim, theme.wall, "#C9C2B2", "#DCCDB0", "#8E4B4B", "#6B7046"];
    products.forEach((x: any, i: number) => {
      const price = Math.min(100_000, Math.max(1, Math.round(Number(x.price) || 25)));
      insert("INSERT INTO products (merchant_id, sku, name, category, price, cost, stock, swatch, image_url, product_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id, `${prefix}-${String(i + 1).padStart(3, "0")}`, String(x.name).trim().slice(0, 80), String(x.category || m.category || "General").slice(0, 40),
        price, Math.round(price * 0.42), 8 + ((i * 7) % 33), swatches[i % swatches.length], httpsOrNull(x.image_url), httpsOrNull(x.product_url));
    });
    // shoppers for the simulation (the storefront doesn't reveal real customers)
    WALK_IN.forEach((c, i) => insert("INSERT INTO customers (merchant_id, name, tier, ltv, return_rate, risk, phone, city, last_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      id, c.name, c.tier, c.ltv, c.return_rate, c.risk, `+1 (555) 010-${String(20 + i).padStart(4, "0")}`, c.city, `${prefix}-${30100 + i * 7}`));
    insert("INSERT INTO events (merchant_id, actor, text, kind, created_at) VALUES (?, 'tavily', ?, 'info', ?)", id,
      `read ${platform === "web" ? "the storefront" : platform} page and ${(p.sources ?? []).length} source(s); built ${products.length} products and a "${String(t.vibe ?? "custom")}" room`, iso());
    return get("SELECT * FROM merchants WHERE id = ?", id)!;
  });
}
