// Tabard: the shop floor game. Buyer agents walk in, the merchant's ZooWork agents answer them,
// and you walk between four stations: billboard (promo), goods shelf (fraud), counter (service), monitoring table.

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const now = () => new Date().toTimeString().slice(0, 5);
const money = n => "$" + Math.round(n).toLocaleString();

// ---------------------------------------------------------------- state
const S = {
  revenue: 3412, orders: 14, handled: 41, blocked: 17,
  promo: null, promosSeen: 0,
  products: PRODUCTS.map(p => ({ ...p })),
  txns: TXNS.map(t => ({ ...t, screen: null })),
  hourly: HOURLY.map(h => ({ ...h })),
  tickets: [], calls: [], call: null, ringing: null,
  approvals: [
    { id: "RF-2207", cust: "c2", order: "LO-55790", amt: 214, risk: 72, rec: "Deny refund, offer exchange", why: ["3rd return in 60 days", "Same boot listed on a resale site", "Ships to a freight forwarder"], status: "waiting", kind: "refund" },
    { id: "RF-2204", cust: "c4", order: "LO-55611", amt: 182, risk: 31, rec: "Approve refund", why: ["Damaged in transit, photo attached", "First return"], status: "waiting", kind: "refund" },
    { id: "RF-2201", cust: "c5", order: "LO-55490", amt: 96, risk: 64, rec: "Ask for a photo", why: ["'Not received', but carrier shows signed", "2 similar claims this year"], status: "waiting", kind: "refund" },
  ],
  log: [
    ["10:46", "@promo", "Offered $268 (10% off) on the camel overcoat", "Gold tier, margin rule, Tavily price", "promo@a41c9e"],
    ["10:37", "@gatekeeper", "Blocked @shopbot-x9 for 30 days", "No signature, rate, Tavily lookup", "gatekeeper@7d02b1"],
    ["10:25", "@returns", "Sent RF-2207 for human approval", "Risk 72 > 60, amount > $150", "returns@c18f40"],
  ],
  feed: [],
  agentStats: { gatekeeper: 64, concierge: 38, stylist: 22, promo: 15, service: 41, returns: 19 },
  busy: {},
  modal: null,
};
const HOUR_IDX = 3; // "11" is the current hour bucket in the sample day

// ---------------------------------------------------------------- sprites
const SKIN = ["#F1C9A5", "#D7A27A", "#A8714F", "#7A4E33", "#F5D7BE"];
const HAIR = ["#2B2018", "#5A3A22", "#1B1B1B", "#8C5A2B", "#C9A15A"];
function personSVG(shirt, skin, hair) {
  return `<svg class="sprite" viewBox="0 0 44 64" aria-hidden="true">
    <ellipse cx="22" cy="61" rx="13" ry="3" fill="rgba(0,0,0,.18)"/>
    <rect class="leg-l" x="14" y="44" width="6" height="15" rx="3" fill="#3A3A3A"/>
    <rect class="leg-r" x="24" y="44" width="6" height="15" rx="3" fill="#3A3A3A"/>
    <rect x="9" y="22" width="26" height="26" rx="10" fill="${shirt}"/>
    <circle cx="22" cy="13" r="10" fill="${skin}"/>
    <path d="M12 13 a10 10 0 0 1 20 0 q-10 -5 -20 0z" fill="${hair}"/>
    <circle cx="18.5" cy="14" r="1.3" fill="#22302A"/><circle cx="25.5" cy="14" r="1.3" fill="#22302A"/>
  </svg>`;
}
function robotSVG(body, accent, bad) {
  return `<svg class="sprite" viewBox="0 0 44 64" aria-hidden="true">
    <ellipse cx="22" cy="61" rx="13" ry="3" fill="rgba(0,0,0,.18)"/>
    <rect x="13" y="51" width="18" height="7" rx="3.5" fill="#4A4A4A"/>
    <rect x="10" y="27" width="24" height="25" rx="7" fill="${body}"/>
    <rect x="16" y="33" width="12" height="7" rx="2" fill="${accent}" opacity=".85"/>
    <rect x="7" y="7" width="30" height="21" rx="8" fill="${bad ? "#3B3B3B" : "#EEF2EE"}" stroke="${body}" stroke-width="2"/>
    <circle cx="17" cy="17" r="3" fill="${bad ? "#FF5A5A" : body}"/><circle cx="27" cy="17" r="3" fill="${bad ? "#FF5A5A" : body}"/>
    <line x1="22" y1="7" x2="22" y2="2" stroke="${body}" stroke-width="2"/><circle cx="22" cy="2" r="2.2" fill="${accent}"/>
  </svg>`;
}

// ---------------------------------------------------------------- entities
const ENTS = new Set();
class Ent {
  constructor({ x, y, svg, name, cls = "", speed = 120, onClick }) {
    this.x = x; this.y = y; this.speed = speed; this.path = null;
    this.el = document.createElement("div");
    this.el.className = "ent " + cls;
    this.el.innerHTML = svg + `<span class="name">${esc(name)}</span>`;
    if (onClick) { this.el.classList.add("clickable"); this.el.addEventListener("click", e => { e.stopPropagation(); onClick(this); }); }
    $("#ents").appendChild(this.el);
    ENTS.add(this);
    this.place();
  }
  place() {
    this.el.style.transform = `translate(${this.x - 22}px, ${this.y - 62}px)`;
    this.el.style.zIndex = Math.round(this.y);
  }
  moveTo(x, y) {
    return new Promise(res => { this.path = { x, y, res }; this.el.classList.add("walking"); });
  }
  step(dt) {
    if (!this.path) return;
    const dx = this.path.x - this.x, dy = this.path.y - this.y, d = Math.hypot(dx, dy), s = this.speed * dt;
    if (d <= s) { this.x = this.path.x; this.y = this.path.y; const r = this.path.res; this.path = null; this.el.classList.remove("walking"); r(); }
    else { this.x += dx / d * s; this.y += dy / d * s; }
    this.place();
  }
  say(text, ms = 2600, kind = "") {
    clearTimeout(this.sayT);
    this.el.querySelector(".bubble")?.remove();
    const b = document.createElement("div");
    b.className = "bubble " + kind;
    b.textContent = text;
    this.el.appendChild(b);
    this.sayT = setTimeout(() => b.remove(), ms);
  }
  remove() { this.el.classList.add("gone"); setTimeout(() => this.el.remove(), 500); ENTS.delete(this); }
}

// merchant agents (ZooWork) standing at their posts
const AG = {};
function spawnAgents() {
  const posts = {
    gatekeeper: [705, 668, "#B03A3C", "#F2C98B"],
    concierge:  [600, 380, "#2F4A3C", "#E0A1AB"],
    promo:      [455, 222, "#A45F6A", "#F2C98B"],
    stylist:    [700, 238, "#2F4A3C", "#F2C98B"],
    returns:    [1125, 240, "#9A6512", "#F6EAD3"],
    service:    [970, 392, "#2F4A3C", "#9CC7AE"],
  };
  for (const [k, [x, y, body, accent]] of Object.entries(posts)) {
    AG[k] = new Ent({ x, y, svg: robotSVG(body, accent), name: AGENTS[k].handle, cls: "agent", onClick: e => e.say(`${AGENTS[k].name} · ${AGENTS[k].job}`, 3200) });
  }
}

// you, the merchant
let ME;
function spawnMe() {
  ME = new Ent({ x: 600, y: 560, svg: personSVG("#A45F6A", "#F1C9A5", "#2B2018"), name: "You (owner)", cls: "you", speed: 260 });
}

// ---------------------------------------------------------------- stage scaling & input
const W = 1200, H = 720;
let scale = 1;
function fit() {
  const vp = $("#viewport");
  const availW = vp.clientWidth - 32;
  const availH = window.innerHeight - $(".hud").offsetHeight - $(".ticker").offsetHeight - 24;
  scale = Math.max(0.3, Math.min(availW / W, Math.max(availH, 360) / H, 1.25));
  $("#stage").style.transform = `scale(${scale})`;
  $("#stageBox").style.width = W * scale + "px";
  $("#stageBox").style.height = H * scale + "px";
}
window.addEventListener("resize", fit);

const STATIONS = {
  billboard: { x: 240, y: 222, open: () => openPromo() },
  shelves:   { x: 905, y: 238, open: () => openGoods() },
  service:   { x: 880, y: 560, open: () => openService() },
  monitor:   { x: 250, y: 600, open: () => openDashboard() },
};
// furniture you can't walk through (stage coordinates, at foot level)
const BLOCKS = [[60, 400, 440, 548], [780, 395, 1160, 505], [0, 0, 1200, 190]];
const blocked = (x, y) => BLOCKS.some(([l, t, r, b]) => x > l && x < r && y > t && y < b);

async function goTo(name) {
  if (S.modal) return;
  const st = STATIONS[name];
  await ME.moveTo(st.x, st.y);
  if (!S.modal) st.open();
}

function stagePoint(e) {
  const r = $("#stage").getBoundingClientRect();
  return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
}
function bindInput() {
  document.querySelectorAll("[data-station]").forEach(el => {
    el.addEventListener("click", e => { e.stopPropagation(); goTo(el.dataset.station); });
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); STATIONS[el.dataset.station].open(); } });
  });
  $("#phone").addEventListener("click", e => { e.stopPropagation(); goTo("service").then(() => S.modal === "service" && setServiceTab("phone")); });
  $("#stage").addEventListener("click", e => {
    if (S.modal) return;
    const p = stagePoint(e);
    const x = Math.max(30, Math.min(1170, p.x)), y = Math.max(215, Math.min(700, p.y));
    if (blocked(x, y)) return;
    const t = document.createElement("div"); t.className = "target"; t.style.left = x - 11 + "px"; t.style.top = y - 5 + "px";
    $("#ents").appendChild(t); setTimeout(() => t.remove(), 800);
    ME.moveTo(x, y);
  });
  document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => {
    const m = b.dataset.open; closeModal();
    ({ monitor: openDashboard, service: openService, shelves: openGoods })[m]();
  }));
}

const keys = new Set();
window.addEventListener("keydown", e => {
  if ($("#game").hidden) return;
  if (e.key === "Escape" && S.modal) return closeModal();
  if (S.modal || /input|textarea/i.test(e.target.tagName)) return;
  const k = e.key.toLowerCase();
  if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { keys.add(k); e.preventDefault(); }
  if ((k === "e" || k === " ") && nearest) { e.preventDefault(); STATIONS[nearest].open(); }
  const hot = { "1": "billboard", "2": "shelves", "3": "service", "4": "monitor" }[k];
  if (hot) goTo(hot);
});
window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

let nearest = null;
function updateNearest() {
  let best = null, bd = 95;
  for (const [n, st] of Object.entries(STATIONS)) { const d = Math.hypot(ME.x - st.x, ME.y - st.y); if (d < bd) { bd = d; best = n; } }
  if (best !== nearest) {
    document.querySelectorAll(".station").forEach(el => el.classList.toggle("near", el.dataset.station === best));
    nearest = best;
  }
}

let last = performance.now();
function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (!S.modal && keys.size) {
    ME.path = null;
    let vx = 0, vy = 0;
    if (keys.has("a") || keys.has("arrowleft")) vx--;
    if (keys.has("d") || keys.has("arrowright")) vx++;
    if (keys.has("w") || keys.has("arrowup")) vy--;
    if (keys.has("s") || keys.has("arrowdown")) vy++;
    const l = Math.hypot(vx, vy) || 1, nx = ME.x + vx / l * ME.speed * dt, ny = ME.y + vy / l * ME.speed * dt;
    const cx = Math.max(30, Math.min(1170, nx)), cy = Math.max(215, Math.min(700, ny));
    if (!blocked(cx, cy)) { ME.x = cx; ME.y = cy; }
    ME.el.classList.toggle("walking", true); ME.place();
  } else if (!ME.path) ME.el.classList.remove("walking");
  ENTS.forEach(e => e.step(dt));
  updateNearest();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- feed, toasts, HUD
function feed(from, text, kind = "") {
  S.feed.unshift({ t: now(), from, text, kind });
  S.feed.length = Math.min(S.feed.length, 60);
  const el = $("#ticker");
  const it = document.createElement("span");
  it.className = "it new";
  it.innerHTML = `<b>${esc(from)}</b> ${esc(text)}`;
  el.prepend(it);
  while (el.children.length > 8) el.lastChild.remove();
  refresh();
}
function logDecision(agent, decision, basis) {
  const k = agent.replace("@", "");
  S.log.unshift([now(), agent, decision, basis, AGENTS[k]?.version || "—"]);
}
function toast(html, onClick) {
  const t = document.createElement("div");
  t.className = "toast"; t.innerHTML = html;
  t.onclick = () => { t.remove(); onClick?.(); };
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), 6000);
}
function coin(x, y, text, bad) {
  const c = document.createElement("div");
  c.className = "coin" + (bad ? " bad" : ""); c.textContent = text;
  c.style.left = x - 20 + "px"; c.style.top = y - 90 + "px";
  $("#ents").appendChild(c); setTimeout(() => c.remove(), 1400);
}
const waitingApprovals = () => S.approvals.filter(a => a.status === "waiting");
const flaggedTxns = () => S.txns.filter(t => t.flags.length && ["Needs review", "Held"].includes(t.status));
const openTickets = () => S.tickets.filter(t => t.status !== "resolved");
let lastStats = {};
function setStat(id, val, alert) {
  const el = $(id); const b = el.querySelector("b");
  if (lastStats[id] !== val) { b.textContent = val; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); lastStats[id] = val; }
  el.classList.toggle("alert", !!alert);
}
function badge(sel, n) {
  const host = $(sel); let b = host.querySelector(".badge");
  if (!n) return b?.remove();
  if (!b) { b = document.createElement("span"); b.className = "badge"; host.appendChild(b); }
  b.textContent = n;
}
function refresh() {
  setStat("#s-rev", money(S.revenue));
  setStat("#s-ord", S.orders);
  setStat("#s-in", [...ENTS].filter(e => e.visitor).length);
  setStat("#s-blk", S.blocked);
  setStat("#s-app", waitingApprovals().length, waitingApprovals().length);
  badge("#monitor", waitingApprovals().length);
  badge("#counter", openTickets().length + (S.ringing ? 1 : 0));
  badge("#shelves", flaggedTxns().length);
  $("#miniScreen").innerHTML = Object.keys(AGENTS).map(k => `<div class="dotline"><b class="${S.busy[k] ? "r" : ""}"></b>${AGENTS[k].handle}</div>`).join("");
  renderShelves();
  VIEWS[S.modal]?.update?.();
}

function renderShelves() {
  const flagged = new Set(flaggedTxns().map(t => t.sku));
  const rows = [S.products.slice(0, 3), S.products.slice(3, 6), S.products.slice(6)];
  const html = rows.map(r => `<div class="shelf">${r.map(p => {
    const n = Math.max(1, Math.min(4, Math.ceil(p.stock / 12)));
    return Array.from({ length: n }, (_, i) => `<span class="item ${i === 0 && flagged.has(p.sku) ? "flag" : ""}" style="background:${p.swatch};height:${26 + (i % 2) * 6}px" title="${esc(p.name)}"></span>`).join("");
  }).join("")}</div>`).join("");
  if ($("#unit").innerHTML !== html) $("#unit").innerHTML = html;
}

// ---------------------------------------------------------------- agent calls with floor feedback
async function ask(agent, input, ctx = {}) {
  S.busy[agent] = true; refresh();
  AG[agent]?.say("· · ·", 1500, "typing");
  try { return await ZooWork.run(agent, input, ctx); }
  finally { S.busy[agent] = false; S.agentStats[agent] = (S.agentStats[agent] || 0) + 1; refresh(); }
}

// ---------------------------------------------------------------- visitors
const DOOR = { x: 600, y: 745 }, GATE = { x: 600, y: 652 };
let visitorSeq = 0;
function spawnVisitor(kindOverride) {
  const inShop = [...ENTS].filter(e => e.visitor).length;
  if (inShop >= 9 && !kindOverride) return;
  const r = Math.random();
  const kind = kindOverride || (r < 0.45 ? "shop" : r < 0.75 ? "service" : "bot");
  const platform = pick(["Muse", "Dots"]);
  const custId = pick(Object.keys(CUSTOMERS));
  const c = CUSTOMERS[custId];
  const handle = kind === "bot" ? pick(["@shopbot-", "@fastcart-", "@dropgrab-"]) + Math.random().toString(36).slice(2, 5)
    : `@${platform.toLowerCase()}/${c.name.split(" ")[0].toLowerCase()}.${c.name.split(" ")[1][0].toLowerCase()}`;
  const v = new Ent({
    x: DOOR.x + rand(-20, 20), y: DOOR.y,
    svg: kind === "bot" ? robotSVG("#4A4A4A", "#FF5A5A", true) : personSVG(pick(["#7C9EB2", "#C98B5B", "#8E6BAF", "#5F8F6B", "#C2665A", "#D4A84F"]), pick(SKIN), pick(HAIR)),
    name: kind === "bot" ? handle : `${handle}`, cls: kind === "bot" ? "bot" : "", speed: rand(90, 120),
  });
  Object.assign(v, { visitor: true, kind, handle, platform, cust: kind === "bot" ? null : custId, id: ++visitorSeq });
  refresh();
  visitorFlow(v).catch(console.error);
}

async function visitorFlow(v) {
  await v.moveTo(GATE.x + rand(-15, 15), GATE.y);
  AG.gatekeeper.say(`Checking ${v.handle}…`, 1300);
  await sleep(1300);

  if (v.kind === "bot") {
    v.say(pick(VISITS.bot), 2600, "bad");
    await sleep(1600);
    const g = await ask("gatekeeper", { handle: v.handle, bot: true });
    AG.gatekeeper.say("Blocked: no signature, abnormal rate.", 2800, "bad");
    $("#gate").classList.add("alarm"); setTimeout(() => $("#gate").classList.remove("alarm"), 1300);
    coin(v.x, v.y, "Blocked", true);
    S.blocked++;
    S.txns.unshift({ id: "TX-" + (9100 + visitorSeq), sku: "LO-FR-SNKR", time: now(), buyer: v.handle, cust: null, qty: pick([12, 24, 40]), amount: 0, type: "order", flags: ["no_signature", "bulk_limited", "new_handle"], status: "Blocked", screen: null });
    S.txns[0].amount = S.txns[0].qty * 180;
    logDecision("@gatekeeper", `Blocked ${v.handle} for 30 days`, "No signature, rate, Tavily lookup");
    feed("@gatekeeper", `blocked ${v.handle} at the door`, "bad");
    await sleep(800);
    await v.moveTo(DOOR.x, DOOR.y + 20);
    v.remove(); refresh();
    return;
  }

  AG.gatekeeper.say(`Verified ${v.platform} agent ✓`, 1600, "good");
  feed("@gatekeeper", `verified ${v.handle} (${v.platform}) and opened a room`);

  if (v.kind === "shop") return shopFlow(v);
  return serviceFlow(v);
}

async function shopFlow(v) {
  const want = pick(VISITS.shop);
  const p = S.products.find(x => x.sku === want.sku);
  await v.moveTo(rand(640, 860), rand(275, 320));
  v.say(want.ask, 2800, "buyer");
  feed(v.handle, want.ask);
  await sleep(1500);
  AG.stylist.say(`Try the ${p.name.toLowerCase()} — ${p.stock} in stock.`, 2800);
  feed("@stylist", `suggested ${p.name} to ${v.handle}`);
  await sleep(2200);

  let price = want.offer, reason = "returning-customer rate";
  if (S.promo && S.promo.sku === p.sku) { price = S.promo.price; reason = "billboard offer"; S.promosSeen++; }
  AG.promo.say(`${money(price)} for you (${reason}).`, 2600);
  feed("@promo", `offered ${money(price)} on ${p.name} (${reason})`);
  await sleep(1800);

  // buyer agents are more likely to accept when the billboard offer applies
  const accept = Math.random() < (reason === "billboard offer" ? 0.95 : 0.78);
  if (accept && p.stock > 0) {
    v.say("Accepted. Checking out.", 2000, "buyer");
    await sleep(900);
    coin(v.x, v.y, "+" + money(price));
    S.revenue += price; S.orders++; S.hourly[HOUR_IDX].v += price;
    p.stock--; p.sold++;
    S.txns.unshift({ id: "TX-" + (9100 + visitorSeq), sku: p.sku, time: now(), buyer: v.handle, cust: v.cust, qty: 1, amount: price, type: "order", flags: [], status: "Paid", screen: null });
    feed("@concierge", `order confirmed for ${v.handle}: ${p.name}, ${money(price)}`);
    logDecision("@promo", `Offered ${money(price)} on ${p.name}`, reason);
  } else {
    v.say("Too pricey. Will compare elsewhere.", 2200, "buyer");
    feed(v.handle, "left without buying");
  }
  await sleep(1200);
  await v.moveTo(DOOR.x + rand(-20, 20), DOOR.y + 20);
  v.remove(); refresh();
}

// ---------------------------------------------------------------- service tickets
let ticketSeq = 300;
function queueSpot(i) { return { x: 1000 - (i % 2) * 6, y: 545 + i * 40 }; }
function layoutQueue() {
  openTickets().forEach((t, i) => { if (t.visitor && !t.leaving) { const q = queueSpot(i); t.visitor.moveTo(q.x, Math.min(q.y, 695)); } });
}

async function serviceFlow(v) {
  const c = CUSTOMERS[v.cust];
  const topic = c.risk > 60 ? "refund" : pick(["where", "size", "where", "human", "refund"]);
  const t = {
    id: "CS-" + ++ticketSeq, cust: v.cust, handle: v.handle, platform: v.platform, topic,
    script: TICKET_SCRIPTS[topic].map(s => s.replace("{order}", c.order)),
    step: 0, msgs: [], status: "agent", visitor: v, unread: true,
  };
  S.tickets.unshift(t);
  layoutQueue();
  await sleep(2600);
  runTicket(t);
}

async function runTicket(t) {
  while (t.step < t.script.length && t.status !== "resolved") {
    if (t.status === "staff") { await sleep(800); continue; }
    const line = t.script[t.step++];
    await buyerSays(t, line);
    await agentReplies(t, line);
    await sleep(rand(3500, 5500));
  }
  if (t.status === "agent") resolveTicket(t, "agent");
}

async function buyerSays(t, text) {
  t.msgs.push({ from: "buyer", who: t.handle, text });
  t.visitor?.say(text, 3000, "buyer");
  t.unread = true;
  feed(t.handle, text);
  refresh();
}

async function agentReplies(t, text) {
  t.typing = true; refresh();
  const r = await ask("service", text, { customer: t.cust, promo: S.promo });
  t.typing = false;
  if (t.status === "staff" || t.status === "resolved") return refresh();
  t.msgs.push({ from: "agent", who: "@service", text: r.text, cites: r.cites, src: r.source });
  AG.service.say(r.text.length > 70 ? r.text.slice(0, 68) + "…" : r.text, 3200);
  feed("@service", r.text.slice(0, 80) + (r.text.length > 80 ? "…" : ""));
  if (r.data?.approval) {
    const c = CUSTOMERS[t.cust];
    if (!S.approvals.find(a => a.order === c.order && a.status === "waiting")) {
      S.approvals.unshift({ id: "RF-" + (2210 + ticketSeq % 80), cust: t.cust, order: c.order, amt: 214, risk: c.risk, rec: "Deny refund, offer exchange", why: ["3rd return in 60 days", `Risk score ${c.risk}`], status: "waiting", kind: "refund", ticket: t.id });
      logDecision("@returns", `Sent ${c.order} refund for human approval`, `Risk ${c.risk} > 60`);
      toast(`<b>@returns</b> needs your call on a refund for ${esc(c.name)}. Click to review.`, () => { closeModal(); openDashboard(); });
    }
  }
  if (r.data?.handoff) {
    t.status = "staff";
    t.msgs.push({ from: "sys", text: "@service asked for a person. The agent is paused until you reply or hand it back." });
    toast(`<b>${esc(CUSTOMERS[t.cust].name)}</b> asked for a person at the service counter.`, () => { closeModal(); openService(t.id); });
  }
  refresh();
}

async function resolveTicket(t, by) {
  t.status = "resolved";
  if (by === "agent") S.handled++;
  t.msgs.push({ from: "sys", text: by === "agent" ? "Resolved by @service without staff." : "Marked resolved by you." });
  feed("@service", `closed ${t.id} for ${CUSTOMERS[t.cust].name}`);
  logDecision("@service", `Closed ${t.id} (${t.topic})`, by === "agent" ? "Policy + customer history" : "Staff");
  const v = t.visitor;
  if (v) {
    t.leaving = true; v.say("Thanks!", 1500, "good"); layoutQueue();
    await sleep(900); await v.moveTo(DOOR.x + rand(-20, 20), DOOR.y + 20); v.remove();
  }
  refresh();
}

// ---------------------------------------------------------------- phone calls
let callSeq = 0;
function ringPhone() {
  if (S.call || S.ringing) return;
  const options = [["c3", "where"], ["c1", "size"], ["c2", "refund"]];
  const [cust, topic] = pick(options);
  S.ringing = { cust, topic, at: now() };
  $("#phone").classList.add("ringing");
  feed("phone", `incoming call from ${CUSTOMERS[cust].name}`);
  toast(`📞 <b>${esc(CUSTOMERS[cust].name)}</b> is calling the shop. @service will pick up. Click to listen in.`, () => { closeModal(); openService(); setServiceTab("phone"); });
  setTimeout(() => { if (S.ringing && !S.call) answerCall(); }, 6000);
  refresh();
}

let voiceOn = false;
function speak(text, who) {
  if (!voiceOn || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05; u.pitch = who === "agent" ? 1.0 : 1.2;
  speechSynthesis.speak(u);
}

async function answerCall() {
  if (!S.ringing) return;
  const { cust, topic } = S.ringing;
  S.ringing = null; $("#phone").classList.remove("ringing");
  const call = S.call = { id: ++callSeq, cust, topic, lines: [], started: Date.now(), status: "live", staff: false };
  AG.service.say("Linden & Oak, how can I help?", 2400);
  const c = CUSTOMERS[cust];
  call.lines.push({ who: "agent", text: `Hi ${c.name.split(" ")[0]}, this is Linden & Oak. How can I help?` });
  speak(call.lines[0].text, "agent"); refresh();
  for (const line of CALL_SCRIPTS[topic]) {
    await sleep(2600);
    if (call.status !== "live") break;
    call.lines.push({ who: "caller", text: line }); speak(line, "caller"); refresh();
    if (call.staff) continue;
    call.thinking = true; refresh();
    const r = await ask("service", line, { customer: cust, promo: S.promo });
    call.thinking = false;
    if (call.status !== "live" || call.staff) continue;
    call.lines.push({ who: "agent", text: r.text, cites: r.cites }); speak(r.text, "agent");
    AG.service.say("📞 " + r.text.slice(0, 60) + "…", 2600);
    refresh();
  }
  await sleep(1800);
  endCall(call.staff ? "staff" : "agent");
}
function endCall(by) {
  const call = S.call; if (!call || call.status !== "live") return;
  call.status = "ended"; call.by = by; call.dur = Math.round((Date.now() - call.started) / 1000);
  S.calls.unshift(call); S.call = null;
  if (by === "agent") S.handled++;
  feed("@service", `finished a ${call.dur}s call with ${CUSTOMERS[call.cust].name}`);
  logDecision("@service", `Phone call with ${CUSTOMERS[call.cust].name} (${call.topic})`, "Moss: customer + policy lookups");
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  refresh();
}

// ---------------------------------------------------------------- modal framework
const VIEWS = {};
function openModal(name, title, who, view) {
  S.modal = name; VIEWS[name] = view;
  ME.path = null; keys.clear();
  $("#modalTitle").textContent = title;
  $("#modalWho").textContent = who;
  $("#modal").hidden = false;
  view.mount($("#modalBody"));
  $("#modalClose").focus({ preventScroll: true });
}
function closeModal() {
  if (!S.modal) return;
  VIEWS[S.modal]?.unmount?.();
  S.modal = null; $("#modal").hidden = true; $("#modalBody").innerHTML = "";
}
$("#modalClose").onclick = closeModal;
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

const riskPill = s => `<span class="pill ${s > 60 ? "p-bad" : s > 30 ? "p-warn" : "p-good"}">Risk ${s}</span>`;
const citeHTML = cs => cs?.length ? `<div class="cites">${cs.map(c => `<span class="chip ${c.startsWith("tavily") ? "tv" : ""}">${esc(c)}</span>`).join("")}</div>` : "";
const srcTag = s => s === "zoowork" ? `<span class="pill p-forest">ZooWork live</span>` : `<span class="pill p-neutral">Simulated</span>`;

// ---------------------------------------------------------------- 1. promo engine (billboard)
function openPromo() {
  let draft = null, busy = false;
  const presets = [
    "15% off the camel wool overcoat for returning customers this weekend",
    "Clear the linen trousers before winter, 25% off",
    "Win back lapsed customers with 10% off merino knitwear",
    "Gift idea: cashmere scarf for Gold members, 12% off today",
  ];
  let root;
  const view = {
    mount(el) {
      root = el;
      el.innerHTML = `<div class="grid2">
        <div class="panel"><div class="panel-h"><span class="label">Prompt the promo engine</span><span class="pill p-rose">@promo · ZooWork agent</span></div>
          <div class="pad">
            <textarea id="pPrompt" placeholder="Describe the offer you want, in plain words">${esc(presets[0])}</textarea>
            <div class="presets">${presets.map(p => `<button data-preset="${esc(p)}">${esc(p.length > 46 ? p.slice(0, 44) + "…" : p)}</button>`).join("")}</div>
            <button class="btn primary" id="pGo">Generate offer</button>
            <p class="note" style="margin-top:12px">The agent drafts copy, picks the price, checks margin and a competitor price. Discounts over 15% need your approval before buyer agents see them.</p>
          </div>
          <div class="panel-h" style="border-top:1px solid var(--line)"><span class="label">On the billboard now</span></div>
          <div class="pad" id="pNow"></div>
        </div>
        <div class="panel"><div class="panel-h"><span class="label">Draft</span><span id="pSrc"></span></div><div class="pad" id="pOut"></div></div>
      </div>`;
      el.querySelectorAll("[data-preset]").forEach(b => b.onclick = () => { el.querySelector("#pPrompt").value = b.dataset.preset; });
      el.querySelector("#pGo").onclick = generate;
      renderOut(); view.update();
    },
    update() {
      if (!root) return;
      const n = root.querySelector("#pNow");
      n.innerHTML = S.promo
        ? `<b>${esc(S.promo.headline)}</b><div class="note">${esc(S.promo.body)}</div><div class="note" style="margin-top:6px">Buyer agents that received it: <b class="num">${S.promosSeen}</b></div>`
        : `<span class="note">The house offer: 10% off for returning customers. Generate a new one to replace it.</span>`;
    },
  };
  async function generate() {
    if (busy) return;
    busy = true; draft = null; renderOut();
    const prompt = root.querySelector("#pPrompt").value.trim() || presets[0];
    feed("you", `asked @promo: "${prompt.slice(0, 60)}"`);
    const r = await ask("promo", prompt, { products: S.products.map(p => ({ sku: p.sku, name: p.name, price: p.price, cost: p.cost, stock: p.stock })) });
    busy = false; draft = r;
    if (S.modal === "billboard") renderOut();
  }
  function renderOut() {
    const out = root.querySelector("#pOut");
    root.querySelector("#pSrc").innerHTML = draft ? srcTag(draft.source) : "";
    if (busy) { out.innerHTML = `<div class="thinking"><span class="spin"></span>@promo is drafting an offer…</div>`; return; }
    if (!draft) { out.innerHTML = `<div class="thinking" style="flex-direction:column"><b style="font-family:var(--display);font-size:20px;color:var(--forest)">Write a prompt, get a billboard.</b><span>The draft appears here.</span></div>`; return; }
    const d = draft.data;
    out.innerHTML = `
      <div class="adcard"><div class="label" style="color:#E0A1AB">Billboard preview</div><h3>${esc(d.headline)}</h3><p>${esc(d.body)}</p></div>
      <div class="facts">
        <div><small>Price</small><b>${money(d.price)}</b> <span class="note"><s>${money(d.list)}</s></span></div>
        <div><small>Margin after</small><b>${d.margin}%</b></div>
        <div><small>Competitor</small><b>${money(d.competitor)}</b></div>
        <div><small>Audience</small><b>${esc(d.segment)}</b></div>
        <div><small>Ends</small><b>${esc(d.ends)}</b></div>
        <div><small>Expected lift</small><b>+${d.lift}% conv.</b></div>
      </div>
      <div class="guard ${d.needsApproval ? "stop" : "ok"}">${d.needsApproval ? `⚠ ${d.pct}% is over the 15% discount rule. Approving it is your call.` : `✓ Inside the margin rule (≤ 15%). Safe to publish.`}</div>
      <p style="margin:0 0 6px">${esc(draft.text)}</p>${citeHTML(draft.cites)}
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn ${d.needsApproval ? "rose" : "primary"}" id="pPub">${d.needsApproval ? "Approve and put on billboard" : "Put on billboard"}</button>
        <button class="btn" id="pRe">Try again</button>
      </div>`;
    out.querySelector("#pPub").onclick = () => publish(d);
    out.querySelector("#pRe").onclick = generate;
  }
  function publish(d) {
    S.promo = { ...d }; S.promosSeen = 0;
    $("#bbHead").textContent = d.headline;
    $("#bbSub").textContent = d.body;
    logDecision("@promo", `Published "${d.headline}"`, d.needsApproval ? `${d.pct}% approved by owner` : "Inside margin rule");
    feed("@promo", `new billboard: ${d.headline}`);
    AG.promo.say("New offer is live! Telling buyer agents.", 2600, "good");
    toast(`<b>Billboard updated.</b> Buyer agents asking for ${esc(d.product)} now get ${money(d.price)}.`);
    closeModal();
    // a few shoppers react to the new offer
    setTimeout(() => spawnVisitor("shop"), 600);
    setTimeout(() => spawnVisitor("shop"), 2400);
  }
  openModal("billboard", "Promo engine", "The billboard · Sell more", view);
}

// ---------------------------------------------------------------- 2. customer service (counter)
let serviceTab = "chat", currentTicket = null, speakAs = "customer";
function setServiceTab(t) { serviceTab = t; VIEWS.service?.mount($("#modalBody")); }
function openService(ticketId) {
  if (ticketId) currentTicket = ticketId;
  serviceTab = S.call || S.ringing ? serviceTab : "chat";
  let root;
  const view = {
    mount(el) {
      root = el;
      el.innerHTML = `<div class="subtabs" role="tablist">
          <button role="tab" data-st="chat" aria-selected="${serviceTab === "chat"}">Chats <span class="num" id="stChat"></span></button>
          <button role="tab" data-st="phone" aria-selected="${serviceTab === "phone"}">Phone <span id="stPhone"></span></button>
        </div><div id="stBody"></div>`;
      el.querySelectorAll("[data-st]").forEach(b => b.onclick = () => setServiceTab(b.dataset.st));
      serviceTab === "chat" ? mountChat() : mountPhone();
      view.update();
    },
    update() {
      if (!root) return;
      root.querySelector("#stChat").textContent = openTickets().length ? `(${openTickets().length})` : "";
      root.querySelector("#stPhone").textContent = S.call ? "· live" : S.ringing ? "· ringing" : "";
      serviceTab === "chat" ? updateChat() : updatePhone();
    },
  };

  function mountChat() {
    const b = root.querySelector("#stBody");
    b.innerHTML = `<div class="grid-side">
      <div class="panel"><div class="panel-h"><span class="label">At the counter</span><button class="btn" id="newCust" style="padding:3px 9px;font-size:12px">+ Send a customer</button></div><ul class="tickets" id="tkList"></ul></div>
      <div class="panel chat" id="chat"></div></div>`;
    b.querySelector("#newCust").onclick = () => { spawnVisitor("service"); toast("A buyer agent is on its way to the counter."); };
    if (!S.tickets.find(t => t.id === currentTicket)) currentTicket = openTickets()[0]?.id || S.tickets[0]?.id || null;
    renderChatShell();
  }
  function renderChatShell() {
    const chat = root.querySelector("#chat");
    const t = S.tickets.find(x => x.id === currentTicket);
    if (!t) { chat.innerHTML = `<div class="ringcard"><span class="big">No one at the counter yet</span><span class="note">Buyer agents queue here when they need help. Send one in to try it.</span></div>`; return; }
    const c = CUSTOMERS[t.cust];
    chat.innerHTML = `
      <div class="chat-h"><b>${esc(c.name)}</b><span class="mono note">${esc(t.handle)} · via ${t.platform}</span><span class="pill p-rose">${c.tier}</span>${riskPill(c.risk)}<span id="tkState"></span>
        <span style="margin-left:auto;display:flex;gap:6px"><button class="btn" id="takeBtn"></button><button class="btn" id="resBtn">Mark resolved</button></span></div>
      <div class="msgs" id="msgs" aria-live="polite"></div>
      <form class="compose" id="compose">
        <span class="seg" role="group" aria-label="Speak as"><button type="button" data-as="customer">As customer</button><button type="button" data-as="staff">As staff</button></span>
        <input class="input" id="cIn" autocomplete="off">
        <button class="btn primary" type="submit">Send</button>
      </form>`;
    chat.querySelectorAll("[data-as]").forEach(b => b.onclick = () => { speakAs = b.dataset.as; updateChat(); chat.querySelector("#cIn").focus(); });
    chat.querySelector("#takeBtn").onclick = () => {
      if (t.status === "resolved") return;
      if (t.status === "staff") { t.status = "agent"; t.msgs.push({ from: "sys", text: "You handed the conversation back to @service." }); runTicket(t); }
      else { t.status = "staff"; speakAs = "staff"; t.msgs.push({ from: "sys", text: "You joined. @service will wait for you." }); }
      refresh();
    };
    chat.querySelector("#resBtn").onclick = () => t.status !== "resolved" && resolveTicket(t, "staff");
    chat.querySelector("#compose").onsubmit = async e => {
      e.preventDefault();
      const inp = chat.querySelector("#cIn"); const v = inp.value.trim(); if (!v || t.status === "resolved") return;
      inp.value = "";
      if (speakAs === "staff") {
        if (t.status !== "staff") t.status = "staff";
        t.msgs.push({ from: "staff", who: "@staff/you", text: v }); AG.service.say("(staff) " + v.slice(0, 50), 2500); refresh();
      } else {
        await buyerSays(t, v);
        if (t.status !== "staff") await agentReplies(t, v);
      }
    };
    updateChat();
  }
  function updateChat() {
    const list = root.querySelector("#tkList"); if (!list) return;
    list.innerHTML = S.tickets.length ? S.tickets.map(t => {
      const c = CUSTOMERS[t.cust]; const lastMsg = t.msgs.filter(m => m.from !== "sys").slice(-1)[0];
      const st = t.status === "resolved" ? ["Resolved", "p-neutral"] : t.status === "staff" ? ["You", "p-rose"] : t.typing ? ["Typing…", "p-forest"] : ["Agent", "p-good"];
      return `<li><button class="tk" data-tk="${t.id}" aria-current="${t.id === currentTicket}">
        <span class="av" style="background:${t.status === "resolved" ? "#9AA39E" : "#A45F6A"}">${c.name.split(" ").map(s => s[0]).join("")}</span>
        <span class="t1"><span>${esc(c.name)}</span><span class="pill ${st[1]}">${st[0]}</span></span>
        <span class="t2">${esc(lastMsg ? lastMsg.text : "Walking to the counter…")}</span></button></li>`;
    }).join("") : `<li class="note pad">The queue is empty.</li>`;
    list.querySelectorAll("[data-tk]").forEach(b => b.onclick = () => { currentTicket = b.dataset.tk; renderChatShell(); });
    const t = S.tickets.find(x => x.id === currentTicket);
    const msgs = root.querySelector("#msgs"); if (!t || !msgs) return;
    t.unread = false;
    const atBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 40;
    msgs.innerHTML = t.msgs.map(m => m.from === "sys"
      ? `<div class="m sys"><div class="tx">${esc(m.text)}</div></div>`
      : `<div class="m ${m.from}"><span class="from">${esc(m.who)}${m.src === "zoowork" ? " · ZooWork" : ""}</span><div class="tx">${esc(m.text)}</div>${citeHTML(m.cites)}</div>`).join("")
      + (t.typing ? `<div class="m agent"><span class="from">@service</span><div class="tx">typing…</div></div>` : "");
    if (atBottom || t.typing) msgs.scrollTop = msgs.scrollHeight;
    root.querySelector("#tkState").innerHTML = t.status === "resolved" ? `<span class="pill p-neutral">Resolved</span>` : t.status === "staff" ? `<span class="pill p-rose">You're handling this</span>` : `<span class="status-dot ${t.typing ? "busy" : ""}">@service auto-replying</span>`;
    const tb = root.querySelector("#takeBtn"); tb.textContent = t.status === "staff" ? "Hand back to agent" : "Take over"; tb.disabled = t.status === "resolved";
    root.querySelector("#resBtn").disabled = t.status === "resolved";
    root.querySelectorAll("[data-as]").forEach(b => b.setAttribute("aria-pressed", b.dataset.as === speakAs));
    const inp = root.querySelector("#cIn");
    inp.placeholder = speakAs === "staff" ? "Write to the buyer agent as staff" : "Type as the customer to test the agent";
    inp.disabled = t.status === "resolved";
  }

  function mountPhone() { root.querySelector("#stBody").innerHTML = `<div class="grid2"><div id="callNow"></div><div class="panel"><div class="panel-h"><span class="label">Recent calls</span></div><div id="callHist"></div></div></div>`; updatePhone(); }
  function updatePhone() {
    const now_ = root.querySelector("#callNow"); if (!now_) return;
    if (S.ringing) {
      const c = CUSTOMERS[S.ringing.cust];
      now_.innerHTML = `<div class="panel ringcard"><span class="label">Incoming call</span><span class="big">${esc(c.name)}</span><span class="mono note">${esc(c.phone)}</span><div class="wave"><i></i><i></i><i></i><i></i><i></i></div><span class="note">@service answers automatically in a few seconds.</span><button class="btn primary" id="ansNow">Let the agent answer now</button></div>`;
      now_.querySelector("#ansNow").onclick = answerCall;
    } else if (S.call) {
      const call = S.call, c = CUSTOMERS[call.cust];
      const tr = now_.querySelector("#transcript");
      const prevScroll = tr ? tr.scrollTop : 0;
      now_.innerHTML = `<div class="call">
        <div class="call-top"><span class="who">${esc(c.name)}</span><span class="mono note">${esc(c.phone)}</span><div class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          <span class="pill ${call.staff ? "p-rose" : "p-good"}">${call.staff ? "You're on the line" : "@service on the line"}</span></div>
        <div class="transcript" id="transcript">${call.lines.map(l => `<div class="l"><b>${l.who === "agent" ? "Agent" : l.who === "staff" ? "You" : esc(c.name.split(" ")[0])}</b>${esc(l.text)}${citeHTML(l.cites)}</div>`).join("")}${call.thinking ? `<div class="l note">Agent is looking it up…</div>` : ""}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button class="btn danger" id="endC">End call</button>
          <button class="btn" id="takeC" ${call.staff ? "disabled" : ""}>Take over the call</button>
          <label class="note" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="voiceC" ${voiceOn ? "checked" : ""}> Play voice</label>
        </div>
        ${call.staff ? `<form id="staffSay" style="display:flex;gap:8px"><input class="input" id="staffIn" placeholder="Say something to ${esc(c.name.split(" ")[0])}" autocomplete="off"><button class="btn primary">Say</button></form>` : ""}
        <span class="note">Simulated call. In production the voice loop runs on LiveKit or Pipecat with Twilio, and @service answers with Moss lookups on each turn.</span>
      </div>`;
      const t2 = now_.querySelector("#transcript"); t2.scrollTop = Math.max(prevScroll, t2.scrollHeight);
      now_.querySelector("#endC").onclick = () => endCall(call.staff ? "staff" : "agent");
      now_.querySelector("#takeC").onclick = () => { call.staff = true; call.lines.push({ who: "staff", text: "(You joined the call.)" }); refresh(); };
      now_.querySelector("#voiceC").onchange = e => { voiceOn = e.target.checked; if (!voiceOn && "speechSynthesis" in window) speechSynthesis.cancel(); };
      const f = now_.querySelector("#staffSay");
      if (f) { const inp = f.querySelector("input"); if (document.activeElement?.id !== "staffIn") setTimeout(() => inp.focus(), 0); f.onsubmit = e => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; call.lines.push({ who: "staff", text: v }); speak(v, "agent"); refresh(); }; }
    } else {
      now_.innerHTML = `<div class="panel ringcard"><span class="big">The line is quiet</span><span class="note">Calls come in on their own every minute or so. @service picks up, and you can listen in or take over.</span><button class="btn primary" id="simCall">Simulate an incoming call</button></div>`;
      now_.querySelector("#simCall").onclick = ringPhone;
    }
    root.querySelector("#callHist").innerHTML = S.calls.length
      ? `<div class="tbl"><table><thead><tr><th>Caller</th><th>Topic</th><th>Length</th><th>Handled by</th></tr></thead><tbody>${S.calls.map(c => `<tr><td>${esc(CUSTOMERS[c.cust].name)}</td><td>${c.topic}</td><td class="num">${c.dur}s</td><td>${c.by === "agent" ? `<span class="pill p-good">@service</span>` : `<span class="pill p-rose">You</span>`}</td></tr>`).join("")}</tbody></table></div>`
      : `<div class="pad note">No calls yet today.</div>`;
  }
  openModal("service", "Customer service", "The counter · Run leaner", view);
}

// ---------------------------------------------------------------- 3. goods & fraud (shelf)
function openGoods() {
  let sel = flaggedTxns()[0]?.sku || S.products[0].sku, root, scanning = false;
  const txRisk = t => Math.min(99, t.flags.reduce((s, f) => s + FLAGS[f].w, 5));
  const statusPill = s => `<span class="pill ${{ Paid: "p-good", Blocked: "p-bad", "Needs review": "p-warn", Held: "p-warn", Released: "p-good", Refunded: "p-neutral", "Exchange offered": "p-forest", Denied: "p-bad" }[s] || "p-neutral"}">${esc(s)}</span>`;
  const view = {
    mount(el) {
      root = el;
      el.innerHTML = `<div class="scanbar">
          <button class="btn primary" id="scanAll">Scan all goods with @returns</button>
          <span class="note" id="scanSum"></span>
        </div>
        <div class="grid2">
          <div class="panel"><div class="panel-h"><span class="label">Goods</span><span class="note">Click a row to see its transactions</span></div><div class="tbl"><table>
            <thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Sold today</th><th>Fraud</th></tr></thead><tbody id="gRows"></tbody></table></div></div>
          <div class="panel" id="gDetail"></div>
        </div>`;
      el.querySelector("#scanAll").onclick = scanAll;
      view.update();
    },
    update() {
      if (!root) return;
      root.querySelector("#scanAll").disabled = scanning;
      root.querySelector("#scanAll").textContent = scanning ? "Scanning…" : "Scan all goods with @returns";
      const f = flaggedTxns().length, blk = S.txns.filter(t => t.status === "Blocked").length;
      root.querySelector("#scanSum").innerHTML = `${S.txns.length} transactions today · <b style="color:var(--warn)">${f} need review</b> · <b style="color:var(--bad)">${blk} blocked</b>`;
      root.querySelector("#gRows").innerHTML = S.products.map(p => {
        const tx = S.txns.filter(t => t.sku === p.sku), fl = tx.filter(t => t.flags.length && ["Needs review", "Held"].includes(t.status)).length, bl = tx.filter(t => t.status === "Blocked").length;
        const low = p.stock < 6;
        return `<tr class="row ${p.sku === sel ? "sel" : ""}" data-sku="${p.sku}" tabindex="0">
          <td><span class="swatch" style="background:${p.swatch}"></span>${esc(p.name)}<span class="sub mono">${p.sku}</span></td>
          <td class="num">${money(p.price)}</td>
          <td class="num">${p.stock}${low ? ` <span class="pill p-warn">Low</span>` : ""}<div class="meter"><i style="width:${Math.min(100, p.stock / 52 * 100)}%;background:${low ? "var(--warn)" : "var(--forest)"}"></i></div></td>
          <td class="num">${p.sold}</td>
          <td>${fl ? `<span class="pill p-warn">${fl} to review</span> ` : ""}${bl ? `<span class="pill p-bad">${bl} blocked</span>` : ""}${!fl && !bl ? `<span class="pill p-good">Clean</span>` : ""}</td></tr>`;
      }).join("");
      root.querySelectorAll("[data-sku]").forEach(r => { r.onclick = () => { sel = r.dataset.sku; view.update(); }; r.onkeydown = e => { if (e.key === "Enter") r.click(); }; });
      renderDetail();
    },
  };
  function renderDetail() {
    const p = S.products.find(x => x.sku === sel), tx = S.txns.filter(t => t.sku === sel);
    root.querySelector("#gDetail").innerHTML = `
      <div class="panel-h"><span><b>${esc(p.name)}</b> <span class="note">· ${p.cat} · margin ${Math.round((p.price - p.cost) / p.price * 100)}%</span></span><span class="label">${tx.length} transactions</span></div>
      <div class="tbl"><table><thead><tr><th>Txn</th><th>Buyer agent</th><th>Amount</th><th>Risk</th><th>Status</th></tr></thead><tbody>
      ${tx.map(t => `<tr><td class="mono">${t.id}<span class="sub">${t.time} · ${t.type}</span></td>
        <td class="mono" style="font-size:12px">${esc(t.buyer)}<span class="sub" style="font-family:var(--sans)">${t.cust ? esc(CUSTOMERS[t.cust].name) : "No linked customer"} · qty ${t.qty}</span></td>
        <td class="num">${money(t.amount)}</td>
        <td>${t.flags.length ? riskPill(txRisk(t)) : `<span class="pill p-good">Clean</span>`}</td>
        <td>${statusPill(t.status)}</td></tr>
        ${t.flags.length ? `<tr><td colspan="5" style="padding-top:0">
          <div class="why">${t.flags.map(f => `<span>• ${esc(FLAGS[f].label)}</span>`).join("")}</div>
          ${t.screen ? `<div class="verdict"><b>@returns:</b> ${esc(t.screen.text)} ${srcTag(t.screen.source)}${citeHTML(t.screen.cites)}</div>` : ""}
          ${["Needs review", "Held"].includes(t.status) ? `<div class="acts">
            ${t.screen ? "" : `<button class="btn" data-screen="${t.id}">Screen with @returns</button>`}
            ${t.type === "refund" ? `<button class="btn primary" data-act="Exchange offered" data-tx="${t.id}">Offer exchange</button><button class="btn" data-act="Refunded" data-tx="${t.id}">Refund</button><button class="btn danger" data-act="Denied" data-tx="${t.id}">Deny</button>`
              : `<button class="btn primary" data-act="Released" data-tx="${t.id}">Release</button><button class="btn danger" data-act="Blocked" data-tx="${t.id}">Cancel and block</button>`}
          </div>` : ""}
        </td></tr>` : ""}`).join("") || `<tr><td colspan="5" class="note">No transactions yet.</td></tr>`}
      </tbody></table></div>`;
    root.querySelectorAll("[data-screen]").forEach(b => b.onclick = () => screen(S.txns.find(t => t.id === b.dataset.screen)));
    root.querySelectorAll("[data-act]").forEach(b => b.onclick = () => decide(S.txns.find(t => t.id === b.dataset.tx), b.dataset.act));
  }
  async function screen(t) {
    const r = await ask("returns", t);
    t.screen = r;
    logDecision("@returns", `Screened ${t.id}: ${r.data.verdict}`, r.data.why.join(", ") || "No signals");
    feed("@returns", `screened ${t.id}: risk ${r.data.score}, ${r.data.verdict.toLowerCase()}`);
    refresh();
  }
  async function scanAll() {
    scanning = true; view.update();
    AG.returns.moveTo(905, 250).then(() => AG.returns.say("Scanning every shelf…", 2400));
    const todo = S.txns.filter(t => t.flags.length && !t.screen);
    for (const t of todo) { await screen(t); }
    scanning = false;
    AG.returns.say(`Done. ${flaggedTxns().length} need you.`, 3000, flaggedTxns().length ? "bad" : "good");
    AG.returns.moveTo(1125, 240);
    toast(`<b>@returns</b> screened ${todo.length} flagged transactions. ${flaggedTxns().length} need your decision.`);
    refresh();
  }
  function decide(t, act) {
    t.status = act;
    const ap = S.approvals.find(a => a.cust === t.cust && a.status === "waiting" && t.type === "refund");
    if (ap) ap.status = act;
    logDecision("@staff/you", `${t.id}: ${act}`, "Decided at the goods shelf");
    feed("you", `${t.id} → ${act.toLowerCase()}`);
    refresh();
  }
  openModal("shelves", "Goods & fraud check", "The shelf · Lose less", view);
}

// ---------------------------------------------------------------- 4. monitoring table (dashboard)
function openDashboard() {
  let root, summary = null, summarizing = false;
  const view = {
    mount(el) {
      root = el;
      el.innerHTML = `<div class="kpis" id="dKpis"></div>
        <div class="dash">
          <div class="stack">
            <div class="panel"><div class="panel-h"><span class="label">Agent-assisted revenue by hour, today</span><span class="note">Rose bar = this hour, live</span></div><div class="chart" id="dChart"></div></div>
            <div class="panel"><div class="panel-h"><span class="label">Needs your approval</span><span id="dAppN"></span></div><div class="tbl"><table><thead><tr><th>Case</th><th>Customer</th><th>Amount</th><th>Screener</th><th>Decide</th></tr></thead><tbody id="dApp"></tbody></table></div></div>
            <div class="panel"><div class="panel-h"><span class="label">Decision log</span><span class="note">Agent versions from Entire checkpoints</span></div><div class="tbl" style="max-height:260px;overflow-y:auto"><table><thead><tr><th>Time</th><th>Agent</th><th>Decision</th><th>Version</th></tr></thead><tbody id="dLog"></tbody></table></div></div>
          </div>
          <div class="stack">
            <div class="panel"><div class="panel-h"><span class="label">Shift summary</span><button class="btn" id="dSum" style="padding:3px 10px;font-size:12px">Ask @concierge</button></div><div id="dSumBody"></div></div>
            <div class="panel"><div class="panel-h"><span class="label">Your ZooWork agents</span><span id="dZw"></span></div><div class="tbl"><table><thead><tr><th>Agent</th><th>P&amp;L</th><th>Status</th><th>Today</th></tr></thead><tbody id="dAgents"></tbody></table></div></div>
            <div class="panel"><div class="panel-h"><span class="label">Live room feed</span></div><ul class="feed" id="dFeed"></ul></div>
          </div>
        </div>`;
      el.querySelector("#dSum").onclick = async () => {
        summarizing = true; view.update();
        summary = await ask("concierge", "Summarize the shift so far", { stats: { revenue: S.revenue, orders: S.orders, handled: S.handled, blocked: S.blocked, approvals: waitingApprovals().length } });
        summarizing = false; view.update();
      };
      view.update();
    },
    update() {
      if (!root) return;
      const w = waitingApprovals();
      const kp = [
        ["Revenue", money(S.revenue), `${S.orders} agent-assisted orders`],
        ["Revenue", S.promosSeen, "buyer agents got the billboard offer"],
        ["Efficiency", S.handled, "chats + calls closed without staff"],
        ["Efficiency", openTickets().length, "at the counter now"],
        ["Risk", S.blocked, "bots blocked at the door"],
        ["Risk", w.length, "decisions waiting for you"],
      ];
      root.querySelector("#dKpis").innerHTML = kp.map(k => `<div class="kpi"><span class="k">${k[0]}</span><b>${k[1]}</b><small>${k[2]}</small></div>`).join("");
      drawChart(root.querySelector("#dChart"));
      root.querySelector("#dAppN").innerHTML = w.length ? `<span class="pill p-bad">${w.length} waiting</span>` : `<span class="pill p-good">All clear</span>`;
      root.querySelector("#dApp").innerHTML = S.approvals.map(a => {
        const c = CUSTOMERS[a.cust];
        const act = a.status === "waiting" ? `<div class="acts" style="margin:0"><button class="btn primary" data-ap="${a.id}" data-v="${a.rec.startsWith("Approve") ? "Refunded" : a.rec.startsWith("Ask") ? "Photo requested" : "Exchange offered"}">${a.rec.startsWith("Approve") ? "Approve" : a.rec.startsWith("Ask") ? "Ask for photo" : "Offer exchange"}</button><button class="btn" data-ap="${a.id}" data-v="Refunded">Refund</button><button class="btn danger" data-ap="${a.id}" data-v="Denied">Deny</button></div>` : `<span class="pill p-neutral">${esc(a.status)}</span>`;
        return `<tr><td class="mono">${a.id}<span class="sub">${a.order}</span></td><td>${esc(c.name)}<span class="sub">${a.why.slice(0, 2).map(esc).join(" · ")}</span></td><td class="num">${money(a.amt)}</td><td>${riskPill(a.risk)}<span class="sub">${esc(a.rec)}</span></td><td>${act}</td></tr>`;
      }).join("");
      root.querySelectorAll("[data-ap]").forEach(b => b.onclick = () => approve(b.dataset.ap, b.dataset.v));
      root.querySelector("#dLog").innerHTML = S.log.slice(0, 30).map(l => `<tr><td class="mono">${l[0]}</td><td class="mono">${esc(l[1])}</td><td>${esc(l[2])}<span class="sub">${esc(l[3])}</span></td><td class="mono note">${esc(l[4])}</td></tr>`).join("");
      root.querySelector("#dZw").innerHTML = ZooWork.live ? `<span class="pill p-forest">ZooWork live</span>` : `<span class="pill p-neutral">Simulator</span>`;
      root.querySelector("#dAgents").innerHTML = Object.entries(AGENTS).map(([k, a]) => `<tr><td class="mono">${a.handle}<span class="sub" style="font-family:var(--sans)">${esc(a.job)}</span></td><td style="white-space:nowrap">${a.line}</td><td><span class="status-dot ${S.busy[k] ? "busy" : ""}">${S.busy[k] ? "Working" : "Ready"}</span></td><td class="num">${S.agentStats[k] || 0}</td></tr>`).join("");
      root.querySelector("#dFeed").innerHTML = S.feed.slice(0, 40).map(f => `<li><span class="t">${f.t}</span><span><span class="h">${esc(f.from)}</span> ${esc(f.text)}</span></li>`).join("") || `<li class="note">Quiet so far.</li>`;
      root.querySelector("#dSumBody").innerHTML = summarizing ? `<div class="thinking"><span class="spin"></span>@concierge is reading today's events…</div>`
        : summary ? `<div class="summary">${esc(summary.text)}</div><div class="pad" style="padding-top:0">${srcTag(summary.source)}${citeHTML(summary.cites)}</div>`
        : `<div class="pad note">Ask the concierge agent for a plain-language summary of the shift.</div>`;
    },
  };
  function approve(id, v) {
    const a = S.approvals.find(x => x.id === id); a.status = v;
    const t = S.txns.find(x => x.cust === a.cust && x.type === "refund" && x.status === "Needs review"); if (t) t.status = v === "Photo requested" ? "Held" : v;
    logDecision("@staff/you", `${a.id}: ${v}`, "Approved at the monitoring table");
    feed("you", `decided ${a.id}: ${v.toLowerCase()}`);
    const tk = S.tickets.find(x => x.id === a.ticket);
    if (tk && tk.status !== "resolved") tk.msgs.push({ from: "agent", who: "@concierge", text: `The owner reviewed the request: ${v.toLowerCase()}.` });
    refresh();
  }
  openModal("monitor", "Monitoring table", "Everything in the shop, live", view);
}

function drawChart(host) {
  const data = S.hourly, w = 560, h = 210, padL = 44, padB = 24, padT = 10;
  const max = Math.max(1500, ...data.map(d => d.v)); const step = max > 2000 ? 1000 : 500; const top = Math.ceil(max / step) * step;
  const bw = (w - padL) / data.length, barW = bw - 10;
  const y = v => padT + (h - padT - padB) * (1 - v / top);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const bar = (x, v) => { const y0 = y(0), y1 = y(v), r = Math.min(4, (y0 - y1)); return v <= 0 ? "" : `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + barW - r} Q${x + barW},${y1} ${x + barW},${y1 + r} V${y0} Z`; };
  host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Revenue by hour">
    ${ticks.map(t => `<line class="gl" x1="${padL}" x2="${w}" y1="${y(t)}" y2="${y(t)}"/><text class="ax" x="${padL - 8}" y="${y(t) + 4}" text-anchor="end">${t ? "$" + (t / 1000).toFixed(t % 1000 ? 1 : 0) + "k" : "$0"}</text>`).join("")}
    ${data.map((d, i) => { const x = padL + i * bw + 5; return `<g data-i="${i}"><rect class="hit" x="${x - 5}" y="${padT}" width="${bw}" height="${h - padT - padB}"/><path class="bar ${i === HOUR_IDX ? "now" : ""}" d="${bar(x, d.v)}"/><text class="ax" x="${x + barW / 2}" y="${h - 6}" text-anchor="middle">${d.h}:00</text></g>`; }).join("")}
  </svg><div class="tip" hidden></div>`;
  const tip = host.querySelector(".tip");
  host.querySelectorAll("g[data-i]").forEach(g => {
    g.addEventListener("mousemove", e => {
      const d = data[g.dataset.i], r = host.getBoundingClientRect();
      tip.hidden = false; tip.textContent = `${d.h}:00 · ${money(d.v)}${+g.dataset.i === HOUR_IDX ? " (so far)" : d.v ? "" : " (upcoming)"}`;
      tip.style.left = e.clientX - r.left + "px"; tip.style.top = e.clientY - r.top + "px";
    });
    g.addEventListener("mouseleave", () => tip.hidden = true);
  });
}

// ---------------------------------------------------------------- intro → game
let slide = 0;
function showSlide(i) {
  slide = i;
  document.querySelectorAll(".slide").forEach(s => s.hidden = +s.dataset.slide !== i);
  document.querySelectorAll(".dots i").forEach((d, j) => d.classList.toggle("on", j === i));
  $("#nextSlide").textContent = i === 1 ? "Enter the shop" : "Next";
}
$("#nextSlide").onclick = () => slide === 0 ? showSlide(1) : startGame();
$("#skipIntro").onclick = startGame;

let started = false;
async function startGame() {
  if (started) return; started = true;
  $("#intro").hidden = true; $("#game").hidden = false;
  fit(); spawnAgents(); spawnMe(); bindInput(); renderShelves(); refresh();
  requestAnimationFrame(loop);

  const live = await ZooWork.detect();
  $("#zw").classList.toggle("live", live);
  $("#zw span").textContent = live ? "ZooWork agents: live" : "ZooWork: simulator";
  $("#zw").title = live ? "Agent calls go to your ZooWork managed agents through server.js" : "Run `node server.js` with ZOOWORK_API_URL set to use real ZooWork agents";

  // first-run help
  const help = document.createElement("div");
  help.className = "help";
  help.innerHTML = `<h3>Welcome to the shop floor</h3>
    <ul>
      <li>Shoppers' agents walk in through the door. Your <b>ZooWork agents</b> (the little robots) answer them.</li>
      <li><b>Billboard</b>: prompt the promo engine to write a new offer.</li>
      <li><b>Goods shelf</b>: check stock and fraud on every transaction.</li>
      <li><b>Service counter</b>: chats and phone calls the agent answers for you.</li>
      <li><b>Monitoring table</b>: the full dashboard and your approvals.</li>
    </ul>
    <p class="note" style="color:#5B6A62">Click to walk, or use WASD and E. Keys 1–4 jump to a station.</p>
    <button class="btn primary" id="helpGo">Open the shop</button>`;
  $("#stage").appendChild(help);
  help.querySelector("#helpGo").onclick = e => { e.stopPropagation(); help.remove(); openShop(); };
}

function openShop() {
  feed("@concierge", "shop is open. Agents are online.");
  spawnVisitor("shop");
  setTimeout(() => spawnVisitor("service"), 1800);
  setTimeout(() => spawnVisitor("bot"), 5200);
  setTimeout(() => spawnVisitor("service"), 8000);
  (function next() { setTimeout(() => { spawnVisitor(); next(); }, rand(4500, 8000)); })();
  setTimeout(ringPhone, 16000);
  setInterval(() => { if (Math.random() < 0.6) ringPhone(); }, 55000);
  // idle agents wander a little so the floor feels alive
  setInterval(() => {
    const c = AG.concierge; if (c.path) return;
    c.moveTo(rand(520, 700), rand(340, 420));
  }, 7000);
}

// direct link: index.html#play skips the intro
if (location.hash === "#play") startGame();
