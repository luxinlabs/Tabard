// ZooWork agent client. Every merchant agent call goes through runAgent().
//
// Live (ZOOWORK_API_KEY set, a zwp_ Project key): each merchant agent is a real ZooWork managed agent, created on first
// use with its role in the persona (SOUL.md), started, and saved in agents.zoowork_agent_id. Paste an existing agent id
// on the store profile page to use your own agent instead. Each call opens a ZooWork session, sends the prompt and
// streams the reply.
// ZOOWORK_AGENTS chooses which roles run live (default "promo,concierge"); the rest use the simulator below, so the
// busy shop floor doesn't send a ZooWork request for every passing shopper. Set it to "all" to run every role live.
//
// Policy stays deterministic either way: prices, margins, risk scores and "needs approval" come from the rules here.
// ZooWork chooses and writes; the rules check.
import { createZooworkClient, isRunFinished, runOutcome, assistantText, type ZooworkClient } from "@zoowork-ai/sdk";
import { FLAGS, riskOf, type AgentKey } from "./catalog.ts";
import { get, run, type Row } from "./db.ts";

const KEY = process.env.ZOOWORK_API_KEY;
const MODEL = process.env.ZOOWORK_MODEL || "litellm/claude-opus-5-5";
const LIVE_ROLES = new Set((process.env.ZOOWORK_AGENTS || "promo,concierge").split(",").map(s => s.trim()));
export const zooworkLive = () => !!KEY;
export const zooworkRoleLive = (key: string) => !!KEY && (LIVE_ROLES.has("all") || LIVE_ROLES.has(key));

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

// ---------------------------------------------------------------- ZooWork agents
let client: ZooworkClient | null = null;
const zc = () => (client ??= createZooworkClient({ apiKey: KEY }));
const started = new Set<string>();
const creating = new Map<string, Promise<string>>();

function soul(key: AgentKey, m: Row) {
  const shop = `${m.name}, a ${m.category} shop${m.city ? ` in ${m.city}` : ""}`;
  const roles: Record<AgentKey, string> = {
    promo: `You are the promo engine for ${shop}. You turn the owner's request into one billboard offer that buyer agents will see. Pick the product and discount that best match the request, and write a short, specific headline and body in the shop's voice. Keep discounts at or below ${m.discount_cap}% unless the owner asks for more; the shop's own rules check margin and approval afterwards.`,
    concierge: `You are the concierge for ${shop}. You speak for the store and summarise the shift for the owner in plain language: what sold, what the agents handled, what needs the owner. Three or four sentences, no lists.`,
    service: `You are the customer-service agent for ${shop}. You answer shoppers' agents about orders, sizing, delivery and returns. Refunds are allowed within 30 days unless an account has 3 or more returns in 60 days; then offer an exchange. Be brief and concrete.`,
    returns: `You are the risk screener for ${shop}. You explain fraud signals on a transaction in one or two sentences and recommend an action.`,
    stylist: `You are the stylist for ${shop}. You recommend in-stock items in one sentence.`,
    gatekeeper: `You are the gatekeeper for ${shop}. You decide whether a visiting buyer agent may enter, in one sentence.`,
  };
  return roles[key] + " Reply with exactly what is asked for, nothing else.";
}

async function ensureAgent(key: AgentKey, ctx: AgentCtx): Promise<string> {
  const existing = ctx.agentRow?.zoowork_agent_id as string | undefined;
  const id = existing || await (async () => {
    const k = `${ctx.merchant.id}:${key}`;
    if (!creating.has(k)) creating.set(k, (async () => {
      const a = await zc().createAgent({ resource: {
        name: `tabard-${ctx.merchant.slug}-${key}`.slice(0, 60),
        model: { primary: MODEL },
        persona: { docs: [{ name: "SOUL.md", content: soul(key, ctx.merchant) }] },
        include_global_skills: false,
        ...(key === "promo" ? { skills: [{ skill_id: await designerSkillId() }] } : {}),
        labels: { app: "tabard", merchant: String(ctx.merchant.id), role: key },
      } }, `tabard-${ctx.merchant.id}-${key}-v1`);
      run("UPDATE agents SET zoowork_agent_id = ? WHERE merchant_id = ? AND key = ?", a.agent_id, ctx.merchant.id, key);
      console.log(`[zoowork] created ${key} agent ${a.agent_id} for ${ctx.merchant.name}`);
      return a.agent_id;
    })().finally(() => creating.delete(k)));
    return creating.get(k)!;
  })();
  if (!started.has(id)) {
    await zc().startAgent(id);
    await zc().waitUntilRunning(id);
    started.add(id);
  }
  return id;
}

// One turn: a fresh session with the prompt, streamed until the run finishes. If the stream drops mid-run
// (it can be closed by the gateway), read the session's durable history until the run is done.
async function converse(agentId: string, prompt: string, timeoutMs = 90_000): Promise<string> {
  return (await converseIn(agentId, prompt, timeoutMs)).text;
}
async function converseIn(agentId: string, prompt: string, timeoutMs: number): Promise<{ text: string; sessionId: string }> {
  const deadline = Date.now() + timeoutMs;
  const s = await zc().createSession(agentId, { initial_events: [{ type: "user.message", content: prompt } as never] });
  const finish = (text: string, outcome: string | undefined) => {
    if (outcome !== "succeeded") throw new Error(`run ${outcome}`);
    if (!text.trim()) throw new Error("empty reply");
    return { text: text.trim(), sessionId: s.session_id };
  };
  let text = "";
  try {
    for await (const ev of zc().streamEvents(agentId, s.session_id, { signal: AbortSignal.timeout(timeoutMs) })) {
      text += assistantText(ev);
      if (isRunFinished(ev)) return finish(text, runOutcome(ev));
    }
  } catch (e) {
    if ((e as Error).message.startsWith("run ") || (e as Error).message === "empty reply") throw e;
  }
  while (Date.now() < deadline) {
    const events = await zc().listEvents(agentId, s.session_id, { limit: 500 });
    const done = events.find(isRunFinished);
    if (done) return finish(events.map(assistantText).join(""), runOutcome(done));
    await sleep(1500);
  }
  throw new Error("timed out waiting for the agent");
}

// ---------------------------------------------------------------- shared (not per-shop) agents, e.g. the store importer
const utilityIds = new Map<string, Promise<string>>();
export async function askUtilityAgent(name: string, soulText: string, prompt: string, timeoutMs = 180_000): Promise<string> {
  const settingKey = `zoowork_agent_${name}`;
  if (!utilityIds.has(name)) utilityIds.set(name, (async () => {
    const saved = get("SELECT value FROM app_settings WHERE key = ?", settingKey)?.value as string | undefined;
    if (saved) return saved;
    const a = await zc().createAgent({ resource: {
      name: `tabard-${name}`, model: { primary: MODEL },
      persona: { docs: [{ name: "SOUL.md", content: soulText }] },
      include_global_skills: false, labels: { app: "tabard", role: name },
    } }, `tabard-${name}-v1`);
    run("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", settingKey, a.agent_id);
    console.log(`[zoowork] created ${name} agent ${a.agent_id}`);
    return a.agent_id;
  })().catch(e => { utilityIds.delete(name); throw e; }));
  const id = await utilityIds.get(name)!;
  if (!started.has(id)) { await zc().startAgent(id); await zc().waitUntilRunning(id); started.add(id); }
  return converse(id, prompt, timeoutMs);
}

// ---------------------------------------------------------------- billboard artwork (ZooWork "designer" skill)
let designerId: Promise<string> | null = null;
function designerSkillId() {
  return (designerId ??= (async () => {
    const page: any = await zc().listSkills();
    const skill = (Array.isArray(page) ? page : page.data ?? []).find((x: any) => x.name === "designer");
    if (!skill) { designerId = null; throw new Error("the ZooWork designer skill isn't available to this project"); }
    return skill.skill_id as string;
  })());
}
const withDesigner = new Set<string>();

// Ask the promo agent to paint the billboard for an offer. Returns the PNG/JPEG bytes. Takes about two minutes.
export async function designAd(ctx: AgentCtx, promo: Row): Promise<{ bytes: Buffer; ext: string; ms: number }> {
  const t0 = Date.now();
  const id = await ensureAgent("promo", ctx);
  if (!withDesigner.has(id)) { await zc().putAgentSkill(id, await designerSkillId()); withDesigner.add(id); } // agents made before artwork existed
  const m = ctx.merchant;
  let palette = "";
  try { const t = m.theme ? JSON.parse(m.theme) : null; if (t) palette = ` Brand colours: wall ${t.wall}, accent ${t.accent}, light ${t.floorA}.`; } catch { /* default palette */ }
  const { sessionId } = await converseIn(id,
    `Use the designer skill to create a wide billboard banner, 2400x840 pixels, for ${m.name} (${m.category}).${palette || " Brand colours: forest green #2F4A3C, rose #A45F6A, cream."}\n` +
    `Headline: "${promo.headline}"\nLine under it: "${promo.body}"\nShow the product: ${promo.product}. Make the discount (${promo.pct}% off, now $${promo.price}) easy to read. ` +
    `Keep all text inside the left 55% and leave the product on the right. Publish the final image as an artifact, then reply with only DONE.`, 6 * 60_000);
  const arts = await zc().listArtifacts(id, { sessionId });
  const art = arts.artifacts.filter(a => /^image\//.test(a.content_type || "") && a.status === "ready").pop();
  if (!art) throw new Error("the designer finished without publishing an image");
  const { url } = await zc().downloadArtifact(id, art.artifact_id);
  if (!url) throw new Error("ZooWork returned no download link for the image");
  const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`downloading the image failed (${r.status})`);
  const ext = (art.content_type || "image/png").includes("jpeg") ? "jpg" : (art.content_type || "").includes("webp") ? "webp" : "png";
  return { bytes: Buffer.from(await r.arrayBuffer()), ext, ms: Date.now() - t0 };
}

const firstJson = (t: string) => { const m = t.match(/\{[\s\S]*\}/); try { return m ? JSON.parse(m[0]) : null; } catch { return null; } };

// What each role is asked, and how its reply is checked against the shop's rules.
const LIVE: Partial<Record<AgentKey, (input: any, ctx: AgentCtx, agentId: string) => Promise<Omit<SimOut, "cites"> & { cites?: string[] }>>> = {
  async promo(prompt: string, ctx, id) {
    const products = (ctx.products || []).map(p => ({ sku: p.sku, name: p.name, category: p.category, price: p.price, stock: p.stock }));
    if (!products.length) return { text: "Add products to the catalog first, then I can write an offer.", data: null };
    const reply = await converse(id, `The owner asks: "${prompt}"\n\nCatalog (JSON): ${JSON.stringify(products)}\n\n` +
      `Reply with one JSON object only: {"sku": one sku from the catalog, "pct": discount percent as an integer, "segment": who the offer is for, ` +
      `"ends": when it ends in plain words, "headline": under 60 characters, "body": one sentence under 140 characters, "note": one sentence on why this offer}`);
    const j = firstJson(reply);
    const product = j && (ctx.products || []).find(p => p.sku === j.sku);
    const pct = j ? Math.round(Number(j.pct)) : NaN;
    if (!product || !(pct >= 1 && pct <= 90) || typeof j.headline !== "string") throw new Error("promo reply didn't match the catalog: " + reply.slice(0, 200));
    const offer = priceOffer(product, pct, ctx);
    return {
      text: `${String(j.note || "").trim()} ${offer.check}`.trim(),
      data: { ...offer.data, headline: String(j.headline).slice(0, 80), body: String(j.body || "").slice(0, 200), segment: String(j.segment || "Returning customers").slice(0, 40), ends: String(j.ends || "Next Friday").slice(0, 40) },
    };
  },
  async concierge(_input, ctx, id) {
    const s = ctx.stats || {};
    const top = ctx.products?.slice().sort((a, b) => b.sold - a.sold).slice(0, 3).map(p => `${p.name} (${p.sold} sold)`);
    return { text: await converse(id, `Today's numbers for ${ctx.merchant.name}: ${JSON.stringify({ ...s, best_sellers: top })}. Summarise the shift for the owner.`), data: null };
  },
  async service(msg: string, ctx, id) {
    const local = SIM.service(msg, ctx); // keeps handoff/approval decisions rule-based
    const c = ctx.customer;
    const text = await converse(id, `Shopper's agent says: "${msg}"\nCustomer: ${c ? JSON.stringify({ name: c.name, tier: c.tier, last_order: c.last_order, return_rate: c.return_rate }) : "unknown"}\n` +
      `Store decision you must communicate: ${local.text}\nReply to the shopper's agent in two sentences or fewer.`);
    return { text, data: local.data };
  },
  async returns(txn: Row, ctx, id) {
    const local = SIM.returns(txn, ctx);
    const text = await converse(id, `Transaction ${txn.code} (${txn.type}). Signals: ${local.data.why.join("; ") || "none"}. Risk score ${local.data.score}. Policy action: ${local.data.action}. Explain in one or two sentences.`);
    return { text, data: local.data };
  },
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runAgent(agent: AgentKey, input: any, ctx: AgentCtx): Promise<AgentResult> {
  const t0 = Date.now();
  if (zooworkRoleLive(agent) && LIVE[agent] && ctx.agentRow?.enabled !== 0) {
    try {
      const id = await ensureAgent(agent, ctx);
      const out = await LIVE[agent]!(input, ctx, id);
      return { cites: [`zoowork · ${MODEL.replace("litellm/", "")} · ${((Date.now() - t0) / 1000).toFixed(1)} s`], ...out, source: "zoowork", ms: Date.now() - t0 };
    } catch (e) {
      console.warn(`[zoowork] ${agent} failed (${(e as Error).message}); using the simulator for this call`);
    }
  }
  const local = SIM[agent](input, ctx);
  await sleep(450 + Math.random() * 700);
  return { ...local, source: "sim", ms: Date.now() - t0 };
}

// Price, margin and the approval check for an offer. Shared by ZooWork and the simulator so the rules are identical.
function priceOffer(product: Row, pct: number, ctx: AgentCtx) {
  const price = Math.round(product.price * (1 - pct / 100));
  const margin = Math.round(((price - product.cost) / price) * 100);
  const cap = ctx.merchant.discount_cap;
  const needsApproval = pct > cap;
  const lift = Math.max(4, Math.round(pct * 0.9 + (product.stock > 25 ? 6 : 0)));
  return {
    data: { sku: product.sku, product: product.name, pct, price, list: product.price, margin, needsApproval, lift, competitor: Math.round(product.price * 0.97) },
    check: `${product.name} at $${price} (list $${product.price}), ${margin}% margin. ` +
      (needsApproval ? `${pct}% is above your ${cap}% rule, so this needs your approval.` : "Inside your margin rule."),
  };
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
