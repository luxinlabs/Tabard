// ZooWork agent client. Every merchant agent call goes through runAgent().
//
// Live: set ZOOWORK_API_URL (+ ZOOWORK_API_KEY). Each merchant's agents can point at their own ZooWork agent id
// (agents.zoowork_agent_id, editable on the merchant profile page). Adjust toRequest/fromResponse to ZooWork's API.
// Sim: without ZOOWORK_API_URL, the rule-based simulator below answers.
//
// Structured fields (price, risk score, approval needed) always come from the simulator's rules, so policy stays
// deterministic. ZooWork supplies the wording when it's live.
import { FLAGS, riskOf, type AgentKey } from "./catalog.ts";
import type { Row } from "./db.ts";

const URL_ = process.env.ZOOWORK_API_URL;
const KEY = process.env.ZOOWORK_API_KEY;
export const zooworkLive = () => !!URL_;

export type AgentResult = { text: string; data: any; cites: string[]; source: "zoowork" | "sim"; ms: number };
export type AgentCtx = {
  merchant: Row;
  agentRow?: Row;
  customer?: Row | null;
  products?: Row[];
  promo?: Row | null;
  stats?: Record<string, number>;
  pendingApproval?: boolean; // the customer already has a refund waiting for the owner
};

function toRequest(agent: AgentKey, input: unknown, ctx: AgentCtx) {
  return {
    agent_id: ctx.agentRow?.zoowork_agent_id || agent,
    input: typeof input === "string" ? input : JSON.stringify(input),
    context: {
      merchant: { name: ctx.merchant.name, category: ctx.merchant.category, policies: { discount_cap: ctx.merchant.discount_cap, refund_review_over: ctx.merchant.refund_review_over, risk_threshold: ctx.merchant.risk_threshold } },
      customer: ctx.customer ? { name: ctx.customer.name, tier: ctx.customer.tier, risk: ctx.customer.risk, last_order: ctx.customer.last_order } : null,
      promo: ctx.promo ? { headline: ctx.promo.headline } : null,
    },
  };
}
function fromResponse(j: any): string | null {
  return j?.output ?? j?.text ?? j?.message ?? j?.result ?? null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runAgent(agent: AgentKey, input: any, ctx: AgentCtx): Promise<AgentResult> {
  const t0 = Date.now();
  const local = SIM[agent](input, ctx);
  if (URL_) {
    try {
      const r = await fetch(URL_, {
        method: "POST",
        headers: { "content-type": "application/json", ...(KEY ? { authorization: `Bearer ${KEY}` } : {}) },
        body: JSON.stringify(toRequest(agent, input, ctx)),
        signal: AbortSignal.timeout(20_000),
      });
      if (r.ok) {
        const text = fromResponse(await r.json());
        if (text) return { ...local, text, source: "zoowork", ms: Date.now() - t0 };
      }
      console.warn(`[zoowork] ${agent} returned ${r.status}, using simulator`);
    } catch (e) {
      console.warn(`[zoowork] ${agent} failed (${(e as Error).message}), using simulator`);
    }
  }
  await sleep(450 + Math.random() * 700);
  return { ...local, source: "sim", ms: Date.now() - t0 };
}

// ---------------------------------------------------------------- simulator
type SimOut = { text: string; data: any; cites: string[] };
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const moss = (idx: string, ms?: number) => `moss · ${idx} · ${ms ?? 3 + Math.floor(Math.random() * 5)} ms`;
const money = (n: number) => "$" + Math.round(n).toLocaleString();

const SIM: Record<AgentKey, (input: any, ctx: AgentCtx) => SimOut> = {
  promo(prompt: string, ctx) {
    const t = prompt.toLowerCase();
    const products = ctx.products || [];
    const pctMatch = t.match(/(\d{1,2})\s*%/);
    const pct = pctMatch ? +pctMatch[1] : t.includes("clear") ? 25 : 10;
    const product = products.find(p => String(p.name).toLowerCase().split(/[ ,()]+/).some((w: string) => w.length > 3 && t.includes(w)))
      || [...products].sort((a, b) => b.stock - a.stock)[0];
    if (!product) return { text: "Add products to the catalog first, then I can write an offer.", data: null, cites: [] };
    const segment = t.includes("new") ? "First-time buyers" : /vip|gold/.test(t) ? "Gold & Silver tier" : /lapsed|back/.test(t) ? "Lapsed 90+ days" : "Returning customers";
    const ends = t.includes("weekend") ? "Sunday, 23:59" : t.includes("today") ? "Today, 23:59" : "Next Friday, 23:59";
    const price = Math.round(product.price * (1 - pct / 100));
    const margin = Math.round(((price - product.cost) / price) * 100);
    const cap = ctx.merchant.discount_cap;
    const needsApproval = pct > cap;
    const headline = pick([`${pct}% off the ${String(product.name).toLowerCase()}`, `The ${String(product.name).split(",")[0]}, now ${money(price)}`, `${segment.split(" ")[0]}: ${pct}% off ${String(product.category).toLowerCase()}`]);
    const lift = Math.max(4, Math.round(pct * 0.9 + (product.stock > 25 ? 6 : 0)));
    return {
      text: `Offer drafted for ${segment.toLowerCase()}: ${product.name} at ${money(price)} (list ${money(product.price)}). Margin after discount is ${margin}%.` +
        (needsApproval ? ` ${pct}% is above your ${cap}% rule, so this needs your approval before buyer agents see it.` : " Inside your margin rule, ready to publish to buyer agents."),
      data: { headline, body: `${product.name}, ${pct}% off for ${segment.toLowerCase()}. Ends ${ends}.`, sku: product.sku, product: product.name, pct, price, list: product.price, margin, segment, ends, needsApproval, lift, competitor: Math.round(product.price * 0.97) },
      cites: [moss("catalog"), `tavily · competitor price · ${700 + Math.floor(Math.random() * 400)} ms`],
    };
  },

  service(msg: string, ctx) {
    const t = String(msg).toLowerCase();
    const c = ctx.customer;
    const first = c ? String(c.name).split(" ")[0] : "the customer";
    const order = c?.last_order || "the order";
    const cid = c ? `customer/${c.id}` : "customer/?";
    if (/person|human|manager|someone/.test(t)) return { text: `I'll bring in a person from the team. I've flagged this room for staff and put ${first}'s details on the desk. Someone will reply here in a few minutes.`, data: { handoff: true }, cites: [moss(cid)] };
    if (/why|can't|cannot|just/.test(t)) return { text: `Our policy allows refunds within 30 days unless an account has 3 or more returns in 60 days. In that case we offer an exchange or store credit. The owner is reviewing this case now, and I'll update you as soon as they decide.`, data: null, cites: [moss("policy/returns")] };
    if (/refund|money back|return/.test(t) && ctx.pendingApproval) return { text: `Your refund request for ${order} is already with the owner. I'll let you know as soon as they decide; an exchange is available right away if you'd prefer.`, data: null, cites: [moss("approvals/open")] };
    if (/refund|money back|return/.test(t)) {
      const risky = c && c.risk > ctx.merchant.risk_threshold;
      return risky
        ? { text: `I've checked ${order} against our returns policy. This would be the 3rd return in 60 days, so I can't refund it directly. I can offer an exchange for another size with free shipping both ways. @returns has sent the refund request to the owner to review.`, data: { approval: true }, cites: [moss("policy/returns"), moss(cid)] }
        : { text: `That's inside our 30-day window. I've started the return for ${order}: a prepaid label is on its way to ${first}'s email, and the refund goes out when the parcel is scanned.`, data: null, cites: [moss("policy/returns")] };
    }
    if (/oct 6|by .*oct|too close|tuesday|trip|make that/.test(t)) return { text: `Yes. If I ship the replacement overnight now, it arrives tomorrow, well before the trip. Shall I go ahead?`, data: null, cites: [moss("carrier/eta")] };
    if (/where|late|track|arriv|due|deliver|wednesday/.test(t)) return { text: `${order} is held at the carrier's Dallas hub. The new estimate is Oct 5. I can send a replacement by overnight shipping today at no cost, and ${first} can refuse the late parcel at the door.`, data: { offer: "overnight_replacement" }, cites: [moss(cid), moss("policy/late-delivery")] };
    if (/size|fit|large|small|between|m or l|sweater|chunky/.test(t)) return { text: `It's cut with about 4 inches of ease at the chest, so it fits over a thick sweater. ${first} kept an M last time, so M should work. Exchanges on size are free.`, data: null, cites: [moss("catalog"), moss(cid)] };
    if (/damag|broken|torn|chipped|crack/.test(t)) return { text: `Sorry about that. I'll send a replacement today and you don't need to send the damaged one back. A photo helps us claim it from the carrier, if you have one.`, data: null, cites: [moss("policy/damaged")] };
    if (/price|discount|code|deal|offer/.test(t)) return { text: `The current offer is on the billboard: ${ctx.promo ? ctx.promo.headline : ctx.merchant.house_offer}. I've applied it to the cart.`, data: null, cites: [moss("promos/active")] };
    if (/thank|okay|ok|great|fine|works|please do|go ahead|send/.test(t)) return { text: `Done. Confirmation and tracking are in ${first}'s email. Anything else I can help with?`, data: { resolved: true }, cites: [] };
    return { text: `Happy to help with that. Could you tell me the order number or the item you're asking about?`, data: null, cites: [] };
  },

  returns(txn: Row) {
    const flags: string[] = txn.flags || [];
    const score = riskOf(flags);
    const why = flags.map(f => FLAGS[f]?.label || f);
    let verdict: string, action: string;
    if (!why.length) { verdict = "Clean"; action = "Release"; }
    else if (flags.includes("no_signature")) { verdict = "Block"; action = "Block and deny-list the agent for 30 days"; }
    else if (txn.type === "refund" && score > 60) { verdict = "Review"; action = "Deny refund, offer an exchange"; }
    else if (txn.type === "refund") { verdict = "Review"; action = "Ask for a photo before refunding"; }
    else if (score > 40) { verdict = "Hold"; action = "Hold shipment, verify card"; }
    else { verdict = "Watch"; action = "Ship, keep watching this account"; }
    return {
      text: why.length ? `${txn.code}: risk ${score}. ${why.join("; ")}. Recommend: ${action.toLowerCase()}.` : `${txn.code}: no fraud signals. Safe to ship.`,
      data: { score, verdict, action, why },
      cites: why.length ? [moss("policy/fraud"), ...(flags.includes("resale_listing") || flags.includes("no_signature") ? ["tavily · lookup · 1.0 s"] : [])] : [],
    };
  },

  gatekeeper(visitor: { handle: string; bot: boolean }) {
    return visitor.bot
      ? { text: `Blocked ${visitor.handle}: no platform signature, handle is hours old, rate far above normal.`, data: { allow: false }, cites: ["tavily · operator lookup · 940 ms"] }
      : { text: `Verified ${visitor.handle}. Signature valid.`, data: { allow: true }, cites: [] };
  },

  stylist(want: { product: Row }) {
    const p = want.product;
    return { text: `Try the ${String(p.name).toLowerCase()} — ${p.stock} in stock.`, data: null, cites: [moss("catalog")] };
  },

  concierge(_input, ctx) {
    const s = ctx.stats || {};
    const top = ctx.products?.slice().sort((a, b) => b.sold - a.sold)[0];
    return {
      text: `Shift summary for ${ctx.merchant.name}: ${money(s.revenue || 0)} in agent-assisted sales from ${s.orders || 0} orders. Agents closed ${s.handled || 0} service conversations and calls without staff. ${s.blocked || 0} bots were turned away at the door. ${s.waiting || 0} decision${s.waiting === 1 ? "" : "s"} need${s.waiting === 1 ? "s" : ""} you.` +
        (top ? ` Best seller today: ${top.name} (${top.sold} sold).` : ""),
      data: null,
      cites: [moss("events/today", 6)],
    };
  },
};
