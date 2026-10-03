// ZooWork agent adapter. Every agent call in the game goes through ZooWork.run(agent, input, context).
//
// Live mode: run `node server.js` with ZOOWORK_API_URL (and ZOOWORK_API_KEY) set. The server proxies
// POST /api/zoowork to your ZooWork managed agents and keeps the key out of the browser.
// Sim mode: if the proxy isn't reachable, a local simulator answers so the game stays playable offline.

const ZooWork = (() => {
  let live = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function detect() {
    try {
      const r = await fetch("/api/health", { cache: "no-store" });
      const j = await r.json();
      live = !!j.zoowork;
    } catch { live = false; }
    return live;
  }

  async function run(agent, input, context = {}) {
    const t0 = performance.now();
    if (live) {
      try {
        const r = await fetch("/api/zoowork", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agent, input, context }),
        });
        if (r.ok) {
          const j = await r.json();
          // Live agents return text. Structured fields (offer, risk) are filled by the simulator's rules,
          // so the game logic stays deterministic even when the wording comes from ZooWork.
          const local = SIM[agent] ? SIM[agent](input, context) : { data: null, cites: [] };
          return { text: j.text || local.text, data: j.data || local.data, cites: local.cites || [], source: "zoowork", ms: Math.round(performance.now() - t0) };
        }
      } catch { /* fall through to the simulator */ }
    }
    await sleep(450 + Math.random() * 700);
    const out = SIM[agent] ? SIM[agent](input, context) : { text: "Noted.", data: null };
    return { cites: [], ...out, source: "sim", ms: Math.round(performance.now() - t0) };
  }

  // ---------- simulator ----------
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const moss = (idx, ms) => `moss · ${idx} · ${ms ?? 3 + Math.floor(Math.random() * 5)} ms`;
  const findProduct = text => {
    const t = text.toLowerCase();
    return PRODUCTS.find(p => p.name.toLowerCase().split(/[ ,()]+/).some(w => w.length > 3 && t.includes(w)));
  };

  const SIM = {
    // Promo engine: turns a merchant prompt into a billboard offer with a margin check.
    promo(prompt, ctx) {
      const t = prompt.toLowerCase();
      const pctMatch = t.match(/(\d{1,2})\s*%/);
      let pct = pctMatch ? +pctMatch[1] : (t.includes("clear") ? 25 : 10);
      const product = findProduct(t) || PRODUCTS.find(p => p.stock > 25) || PRODUCTS[0];
      const segment = t.includes("new") ? "First-time buyers" : t.includes("vip") || t.includes("gold") ? "Gold & Silver tier" : t.includes("lapsed") || t.includes("back") ? "Lapsed 90+ days" : "Returning customers";
      const ends = t.includes("weekend") ? "Sun Oct 4, 23:59" : t.includes("today") ? "Today, 23:59" : "Fri Oct 9, 23:59";
      const price = Math.round(product.price * (1 - pct / 100));
      const margin = Math.round(((price - product.cost) / price) * 100);
      const needsApproval = pct > 15;
      const headline = pick([`${pct}% off the ${product.name.toLowerCase()}`, `The ${product.name.split(",")[0]}, now $${price}`, `${segment.split(" ")[0]}: ${pct}% off ${product.cat.toLowerCase()}`]);
      const lift = Math.max(4, Math.round(pct * 0.9 + (product.stock > 25 ? 6 : 0)));
      return {
        text: `Offer drafted for ${segment.toLowerCase()}: ${product.name} at $${price} (list $${product.price}). Margin after discount is ${margin}%.` +
          (needsApproval ? ` ${pct}% is above the 15% rule, so this needs your approval before buyer agents see it.` : " Inside the margin rule, ready to publish to buyer agents."),
        data: { headline, body: `${product.name}, ${pct}% off for ${segment.toLowerCase()}. Ends ${ends}.`, sku: product.sku, product: product.name, pct, price, list: product.price, margin, segment, ends, needsApproval, lift, competitor: Math.round(product.price * 0.97) },
        cites: [moss("catalog"), `tavily · competitor price · ${700 + Math.floor(Math.random() * 400)} ms`],
      };
    },

    // Service: answers buyer agents and callers. Picks an intent from keywords.
    service(msg, ctx) {
      const t = msg.toLowerCase();
      const c = ctx.customer ? CUSTOMERS[ctx.customer] : null;
      const first = c ? c.name.split(" ")[0] : "the customer";
      const order = c ? c.order : "the order";
      if (/person|human|manager|someone/.test(t)) return { text: `I'll bring in a person from the team. I've flagged this room for staff and put ${first}'s details on the desk. Someone will reply here in a few minutes.`, data: { handoff: true }, cites: [moss(`customer/${ctx.customer || "?"}`)] };
      if (/refund|money back|return/.test(t)) {
        const risky = c && c.risk > 60;
        return risky
          ? { text: `I've checked ${order} against our returns policy. This would be the 3rd return in 60 days, so I can't refund it directly. I can offer an exchange for another size with free shipping both ways. @returns has sent the refund request to the owner to review.`, data: { approval: true }, cites: [moss("policy/returns"), moss(`customer/${ctx.customer}`)] }
          : { text: `That's inside our 30-day window. I've started the return for ${order}: a prepaid label is on its way to ${first}'s email, and the refund goes out when the parcel is scanned.`, data: null, cites: [moss("policy/returns")] };
      }
      if (/why|can't|cannot|just/.test(t)) return { text: `Our policy allows refunds within 30 days unless an account has 3 or more returns in 60 days. In that case we offer an exchange or store credit. The owner is reviewing this case now, and I'll update you as soon as they decide.`, cites: [moss("policy/returns")] };
      if (/where|late|track|arriv|due|deliver|wednesday/.test(t)) return { text: `${order} is held at the carrier's Dallas hub. The new estimate is Oct 5. I can send a replacement by overnight shipping today at no cost, and ${first} can refuse the late parcel at the door.`, data: { offer: "overnight_replacement" }, cites: [moss(`customer/${ctx.customer || "c3"}`), moss("policy/late-delivery")] };
      if (/oct 6|by .*oct|too close|tuesday|trip|make that/.test(t)) return { text: `Yes. If I ship the replacement overnight now, it arrives tomorrow, well before the trip. Shall I go ahead?`, cites: [moss("carrier/eta")] };
      if (/size|fit|large|small|between|m or l|sweater|chunky/.test(t)) return { text: `The camel overcoat is cut with about 4 inches of ease at the chest, so it fits over a thick sweater. ${first} kept an M in outerwear last time, so M should work. Exchanges on size are free.`, cites: [moss("catalog"), moss(`customer/${ctx.customer || "c1"}`)] };
      if (/damag|broken|torn/.test(t)) return { text: `Sorry about that. I'll send a replacement today and you don't need to send the damaged one back. A photo helps us claim it from the carrier, if you have one.`, cites: [moss("policy/damaged")] };
      if (/price|discount|code|deal|offer/.test(t)) return { text: `The current offer is on the billboard: ${ctx.promo ? ctx.promo.headline : "10% off for returning customers"}. I've applied it to the cart.`, cites: [moss("promos/active")] };
      if (/thank|okay|ok|great|fine|works|please do|go ahead|send/.test(t)) return { text: `Done. Confirmation and tracking are in ${first}'s email. Anything else I can help with?`, data: { resolved: true }, cites: [] };
      return { text: `Happy to help with that. Could you tell me the order number or the item you're asking about?`, cites: [] };
    },

    // Risk screener: scores a transaction from its flags.
    returns(txn) {
      const score = Math.min(99, (txn.flags || []).reduce((s, f) => s + (FLAGS[f]?.w || 0), 5));
      const why = (txn.flags || []).map(f => FLAGS[f].label);
      let verdict, action;
      if (!why.length) { verdict = "Clean"; action = "Release"; }
      else if (txn.flags.includes("no_signature")) { verdict = "Block"; action = "Block and deny-list the agent for 30 days"; }
      else if (txn.type === "refund" && score > 60) { verdict = "Review"; action = "Deny refund, offer an exchange"; }
      else if (txn.type === "refund") { verdict = "Review"; action = "Ask for a photo before refunding"; }
      else if (score > 40) { verdict = "Hold"; action = "Hold shipment, verify card"; }
      else { verdict = "Watch"; action = "Ship, keep watching this account"; }
      return {
        text: why.length ? `${txn.id}: risk ${score}. ${why.join("; ")}. Recommend: ${action.toLowerCase()}.` : `${txn.id}: no fraud signals. Safe to ship.`,
        data: { score, verdict, action, why },
        cites: why.length ? [moss("policy/fraud"), ...(txn.flags.includes("resale_listing") || txn.flags.includes("no_signature") ? ["tavily · lookup · 1.0 s"] : [])] : [],
      };
    },

    // Gatekeeper: checks a buyer agent at the door.
    gatekeeper(visitor) {
      return visitor.bot
        ? { text: `Blocked ${visitor.handle}: no platform signature, handle is hours old, rate far above normal.`, data: { allow: false }, cites: ["tavily · operator lookup · 940 ms"] }
        : { text: `Verified ${visitor.handle}. Signature valid.`, data: { allow: true }, cites: [] };
    },

    // Concierge: short shift summary for the monitoring table.
    concierge(_, ctx) {
      const s = ctx.stats;
      return {
        text: `Shift summary: $${s.revenue.toLocaleString()} in agent-assisted sales from ${s.orders} orders. Agents closed ${s.handled} service conversations without staff. ${s.blocked} bots were turned away at the door. ${s.approvals} decision${s.approvals === 1 ? "" : "s"} need${s.approvals === 1 ? "s" : ""} you. Field Runner is the most attacked item today, so keep the 1-per-customer limit on.`,
        cites: [moss("events/today", 6)],
      };
    },
  };

  return { detect, run, get live() { return live; } };
})();
