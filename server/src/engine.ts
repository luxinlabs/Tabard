// The shop engine: one per merchant. While someone has the shop open, simulated buyer agents walk in and the
// merchant's ZooWork agents answer them. Everything that happens is written to the database, and the engine
// streams two kinds of messages to the browser:
//   floor   – choreography for the shop-floor animation (spawn, move, say, coin, …)
//   changed – which data sets changed, so the client refetches them
import { all, get, insert, iso, parse, run, type Row } from "./db.ts";
import { BOT_ASKS, CALL_SCRIPTS, TICKET_SCRIPTS, type AgentKey } from "./catalog.ts";
import { publish, subscriberCount, onSubscribersChange } from "./bus.ts";
import { runAgent, type AgentResult } from "./zoowork.ts";
import { HttpError } from "./merchants.ts";
import * as Q from "./queries.ts";

export type Spot = { to: "door" | "gate" | "shelf" | "queue"; index?: number };
export type Visitor = { id: string; handle: string; platform: string; kind: "shop" | "service" | "bot"; label: string; customerId: number | null; roomId: number | null; ticketId?: number; spot: Spot };

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const money = (n: number) => "$" + Math.round(n).toLocaleString();
const STOP = Symbol("stop");

export class Engine {
  visitors = new Map<string, Visitor>();
  busy = new Set<string>();
  typing = new Set<number>();
  live = false;
  private gen = 0;
  private timers: NodeJS.Timeout[] = [];
  private runners = new Set<number>();
  private callRunning = false;
  private seq = 0;

  constructor(public mid: number) {}

  // ------------------------------------------------------------ plumbing
  merchant() {
    const m = get("SELECT * FROM merchants WHERE id = ?", this.mid);
    if (!m) throw new HttpError(404, "merchant not found");
    return m;
  }
  private emit(msg: Record<string, unknown>) { publish(this.mid, msg); }
  floor(op: string, data: Record<string, unknown> = {}) { this.emit({ type: "floor", op, ...data }); }
  changed(...keys: string[]) { this.emit({ type: "changed", keys }); }
  toast(text: string, open?: string, ticketId?: number) { this.emit({ type: "toast", text, open, ticketId }); }
  event(actor: string, text: string, kind = "info") {
    const id = insert("INSERT INTO events (merchant_id, actor, text, kind, created_at) VALUES (?, ?, ?, ?, ?)", this.mid, actor, text, kind, iso());
    this.emit({ type: "event", event: get("SELECT * FROM events WHERE id = ?", id) });
  }
  decision(agentHandle: string, decision: string, basis: string) {
    const v = get("SELECT version FROM agents WHERE merchant_id = ? AND handle = ?", this.mid, agentHandle)?.version || "—";
    insert("INSERT INTO decisions (merchant_id, agent, decision, basis, version, created_at) VALUES (?, ?, ?, ?, ?, ?)", this.mid, agentHandle, decision, basis, v, iso());
    this.changed("decisions");
  }
  livePromo() { return get("SELECT * FROM promos WHERE merchant_id = ? AND status = 'live'", this.mid) || null; }

  async ask(key: AgentKey, input: unknown, extra: { customer?: Row | null; stats?: Record<string, number>; pendingApproval?: boolean } = {}): Promise<AgentResult> {
    const agentRow = get("SELECT * FROM agents WHERE merchant_id = ? AND key = ?", this.mid, key);
    this.busy.add(key);
    this.emit({ type: "busy", busy: [...this.busy] });
    try {
      return await runAgent(key, input, {
        merchant: this.merchant(), agentRow, customer: extra.customer, stats: extra.stats, pendingApproval: extra.pendingApproval,
        products: all("SELECT * FROM products WHERE merchant_id = ?", this.mid), promo: this.livePromo(),
      });
    } finally {
      this.busy.delete(key);
      run("UPDATE agents SET actions = actions + 1 WHERE merchant_id = ? AND key = ?", this.mid, key);
      this.emit({ type: "busy", busy: [...this.busy] });
      this.changed("agents");
    }
  }

  snapshot() {
    const p = this.livePromo(), m = this.merchant();
    const ringing = get("SELECT id FROM calls WHERE merchant_id = ? AND status = 'ringing'", this.mid);
    return {
      type: "snapshot", live: this.live, visitors: [...this.visitors.values()], busy: [...this.busy], ringing: !!ringing,
      billboard: p ? { headline: p.headline, body: p.body } : { headline: m.house_offer, body: "Click to write a new offer with the promo engine" },
    };
  }

  // ------------------------------------------------------------ lifecycle
  start() {
    if (this.live || !this.merchant().simulate) return;
    this.live = true;
    const g = ++this.gen;
    this.event("@concierge", "shop is open, agents online");
    // put customers with open tickets back in the queue, and resume their conversations
    for (const t of all("SELECT t.*, r.handle, r.platform FROM tickets t JOIN rooms r ON r.id = t.room_id WHERE t.merchant_id = ? AND t.status != 'resolved'", this.mid)) {
      const c = get("SELECT name FROM customers WHERE id = ?", t.customer_id);
      const v = this.addVisitor({ handle: t.handle, platform: t.platform, kind: "service", customerId: t.customer_id, roomId: t.room_id, label: t.handle, ticketId: t.id, spot: { to: "queue", index: 0 } });
      void c; void v;
      if (t.status === "agent") this.runTicket(t.id);
    }
    this.layoutQueue();
    this.emit(this.snapshot());
    const loop = () => { if (g !== this.gen) return; this.spawn(); this.timers.push(setTimeout(loop, rand(4500, 8000))); };
    this.timers.push(setTimeout(() => this.spawn("shop"), 800));
    this.timers.push(setTimeout(() => this.spawn("bot"), 5000));
    this.timers.push(setTimeout(loop, 3000));
    this.timers.push(setTimeout(() => this.ring(), 16_000));
    this.timers.push(setInterval(() => { if (Math.random() < 0.6) this.ring(); }, 55_000));
  }
  stop() {
    if (!this.live) return;
    this.live = false; this.gen++;
    this.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    this.timers = [];
    this.visitors.clear();
    this.emit(this.snapshot());
  }
  private async wait(ms: number, g: number) {
    await sleep(ms);
    if (g !== this.gen) throw STOP;
  }

  // ------------------------------------------------------------ visitors
  private addVisitor(v: Omit<Visitor, "id">) {
    const visitor = { ...v, id: `v${++this.seq}` };
    this.visitors.set(visitor.id, visitor);
    this.floor("spawn", { visitor });
    this.changed("overview");
    return visitor;
  }
  private move(v: Visitor, spot: Spot) { v.spot = spot; this.floor("move", { id: v.id, ...spot }); }
  private removeVisitor(v: Visitor) { this.visitors.delete(v.id); this.floor("remove", { id: v.id }); this.changed("overview"); }
  private say(who: string, text: string, tone = "") { this.floor("say", { who, text, tone }); }

  spawn(kindOverride?: Visitor["kind"]) {
    if (!this.live) return;
    if (this.visitors.size >= 9 && !kindOverride) return;
    const customers = all("SELECT * FROM customers WHERE merchant_id = ?", this.mid);
    const products = all("SELECT * FROM products WHERE merchant_id = ? AND stock > 0", this.mid);
    const r = Math.random();
    let kind = kindOverride || (r < 0.45 ? "shop" : r < 0.75 ? "service" : "bot");
    if (kind === "shop" && (!products.length || !customers.length)) kind = "bot";
    if (kind === "service" && !customers.length) kind = "bot";
    const platform = pick(["Muse", "Dots"]);
    const c = kind === "bot" ? null : pick(customers);
    const handle = c
      ? `@${platform.toLowerCase()}/${c.name.split(" ")[0].toLowerCase()}.${(c.name.split(" ")[1] || "x")[0].toLowerCase()}`
      : pick(["@shopbot-", "@fastcart-", "@dropgrab-"]) + Math.random().toString(36).slice(2, 5);
    const v = this.addVisitor({ handle, platform: c ? platform : "Unverified", kind: kind as Visitor["kind"], label: handle, customerId: c?.id ?? null, roomId: null, spot: { to: "door" } });
    this.visitorFlow(v, c).catch(e => { if (e !== STOP) console.error(e); });
  }

  private async visitorFlow(v: Visitor, c: Row | null) {
    const g = this.gen;
    this.move(v, { to: "gate" });
    await this.wait(1400, g);
    this.say("agent:gatekeeper", `Checking ${v.handle}…`);
    await this.wait(1300, g);

    if (v.kind === "bot") {
      const ask = pick(BOT_ASKS);
      this.say(v.id, ask, "bad");
      await this.wait(1600, g);
      const r = await this.ask("gatekeeper", { handle: v.handle, bot: true });
      this.say("agent:gatekeeper", "Blocked: no signature, abnormal rate.", "bad");
      this.floor("alarm");
      this.floor("coin", { id: v.id, text: "Blocked", bad: true });
      const roomId = insert("INSERT INTO rooms (merchant_id, handle, platform, kind, intent, state, opened_at, closed_at) VALUES (?, ?, 'Unverified', 'bot', ?, 'blocked', ?, ?)", this.mid, v.handle, ask, iso(), iso());
      insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, created_at) VALUES (?, ?, ?, 'buyer', ?, ?)", this.mid, roomId, v.handle, ask, iso());
      insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, cites, source, created_at) VALUES (?, ?, '@gatekeeper', 'sys', ?, ?, ?, ?)", this.mid, roomId, r.text, JSON.stringify(r.cites), r.source, iso());
      const limited = get("SELECT * FROM products WHERE merchant_id = ? ORDER BY (name LIKE '%limited%') DESC, stock DESC LIMIT 1", this.mid);
      if (limited) {
        const qty = pick([12, 24, 40]);
        insert("INSERT INTO transactions (merchant_id, code, sku, room_id, buyer_handle, qty, amount, type, flags, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'order', ?, 'Blocked', ?)",
          this.mid, this.txCode(), limited.sku, roomId, v.handle, qty, qty * limited.price, JSON.stringify(["no_signature", "bulk_limited", "new_handle"]), iso());
      }
      this.decision("@gatekeeper", `Blocked ${v.handle} for 30 days`, "No signature, rate, Tavily lookup");
      this.event("@gatekeeper", `blocked ${v.handle} at the door`, "block");
      this.changed("overview", "transactions", "products", "rooms");
      await this.wait(800, g);
      this.move(v, { to: "door" });
      await this.wait(1300, g);
      this.removeVisitor(v);
      return;
    }

    this.say("agent:gatekeeper", `Verified ${v.platform} agent ✓`, "good");
    this.event("@gatekeeper", `verified ${v.handle} (${v.platform}) and opened a room`);
    if (v.kind === "shop") return this.shopFlow(v, c!, g);
    return this.serviceFlow(v, c!);
  }

  private txCode() {
    const last = get("SELECT code FROM transactions WHERE merchant_id = ? ORDER BY id DESC LIMIT 1", this.mid)?.code;
    return "TX-" + ((last ? parseInt(String(last).slice(3)) : 9000) + 1);
  }

  private async shopFlow(v: Visitor, c: Row, g: number) {
    const products = all("SELECT * FROM products WHERE merchant_id = ? AND stock > 0", this.mid);
    const promo = this.livePromo();
    // shoppers lean toward the billboard item when there is one
    const p = promo && Math.random() < 0.45 ? products.find(x => x.sku === promo.sku) || pick(products) : pick(products);
    const want = pick([`Do you have the ${p.name.toLowerCase()} in stock?`, `Looking for ${p.category.toLowerCase()}, something like the ${p.name.toLowerCase()}?`, `Best price on the ${p.name.toLowerCase()} for a returning customer?`]);
    const roomId = insert("INSERT INTO rooms (merchant_id, handle, platform, kind, customer_id, intent, state, opened_at) VALUES (?, ?, ?, 'shop', ?, ?, 'open', ?)", this.mid, v.handle, v.platform, c.id, want, iso());
    v.roomId = roomId;
    const msg = (sender: string, role: string, text: string, r?: AgentResult) =>
      insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, cites, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", this.mid, roomId, sender, role, text, JSON.stringify(r?.cites || []), r?.source || null, iso());

    this.move(v, { to: "shelf", index: Math.floor(Math.random() * 6) });
    await this.wait(3400, g);
    this.say(v.id, want, "buyer"); msg(v.handle, "buyer", want);
    this.event(v.handle, want);
    await this.wait(1200, g);
    const st = await this.ask("stylist", { product: p }, { customer: c });
    this.say("agent:stylist", st.text); msg("@stylist", "agent", st.text, st);
    this.event("@stylist", `suggested ${p.name} to ${v.handle}`);
    await this.wait(2200, g);

    let price = Math.round(p.price * 0.9), reason = "returning-customer rate";
    if (promo && promo.sku === p.sku) { price = promo.price; reason = "billboard offer"; run("UPDATE promos SET seen = seen + 1 WHERE id = ?", promo.id); }
    const offer = `${money(price)} for you (${reason}).`;
    this.say("agent:promo", offer); msg("@promo", "agent", offer);
    this.event("@promo", `offered ${money(price)} on ${p.name} (${reason})`);
    await this.wait(1800, g);

    const accept = Math.random() < (reason === "billboard offer" ? 0.95 : 0.78);
    if (accept) {
      this.say(v.id, "Accepted. Checking out.", "buyer"); msg(v.handle, "buyer", "Accepted. Checking out.");
      await this.wait(900, g);
      this.floor("coin", { id: v.id, text: "+" + money(price) });
      insert("INSERT INTO transactions (merchant_id, code, sku, room_id, buyer_handle, customer_id, qty, amount, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'order', 'Paid', ?)",
        this.mid, this.txCode(), p.sku, roomId, v.handle, c.id, price, iso());
      run("UPDATE products SET stock = stock - 1, sold = sold + 1 WHERE id = ?", p.id);
      run("UPDATE rooms SET state = 'sold', closed_at = ? WHERE id = ?", iso(), roomId);
      this.event("@concierge", `order confirmed for ${v.handle}: ${p.name}, ${money(price)}`, "sale");
      this.decision("@promo", `Offered ${money(price)} on ${p.name}`, reason);
      this.changed("overview", "transactions", "products", "rooms", "promos");
    } else {
      this.say(v.id, "Too pricey. Will compare elsewhere.", "buyer"); msg(v.handle, "buyer", "Too pricey. Will compare elsewhere.");
      run("UPDATE rooms SET state = 'left', closed_at = ? WHERE id = ?", iso(), roomId);
      this.event(v.handle, "left without buying");
      this.changed("rooms");
    }
    await this.wait(1200, g);
    this.move(v, { to: "door" });
    await this.wait(3400, g);
    this.removeVisitor(v);
  }

  // ------------------------------------------------------------ service tickets
  private layoutQueue() {
    const open = all("SELECT id FROM tickets WHERE merchant_id = ? AND status != 'resolved' ORDER BY id", this.mid).map(r => r.id);
    let i = 0;
    for (const id of open) {
      const v = [...this.visitors.values()].find(x => x.ticketId === id);
      if (!v) continue;
      if (v.spot.to !== "queue" || v.spot.index !== i) this.move(v, { to: "queue", index: i });
      i++;
    }
  }

  private async serviceFlow(v: Visitor, c: Row) {
    const topic = c.risk > this.merchant().risk_threshold ? "refund" : pick(["where", "size", "where", "human", "refund"]);
    const intent = this.script({ topic, customer_id: c.id })[0];
    const roomId = insert("INSERT INTO rooms (merchant_id, handle, platform, kind, customer_id, intent, state, opened_at) VALUES (?, ?, ?, 'service', ?, ?, 'open', ?)", this.mid, v.handle, v.platform, c.id, intent, iso());
    const tid = insert("INSERT INTO tickets (merchant_id, room_id, customer_id, topic, created_at) VALUES (?, ?, ?, ?, ?)", this.mid, roomId, c.id, topic, iso());
    v.roomId = roomId; v.ticketId = tid;
    this.layoutQueue();
    this.changed("tickets", "overview");
    await sleep(2600);
    this.runTicket(tid);
  }

  private script(t: Row) {
    const c = get("SELECT * FROM customers WHERE id = ?", t.customer_id)!;
    const item = get("SELECT name FROM products WHERE merchant_id = ? ORDER BY id LIMIT 1", this.mid)?.name?.toLowerCase() || "item";
    return (TICKET_SCRIPTS[t.topic] || TICKET_SCRIPTS.where).map(s => s.replace("{order}", c.last_order || "my order").replace("{item}", item));
  }
  ticket(tid: number) {
    const t = get("SELECT t.*, r.handle FROM tickets t JOIN rooms r ON r.id = t.room_id WHERE t.id = ? AND t.merchant_id = ?", tid, this.mid);
    if (!t) throw new HttpError(404, "ticket not found");
    return t;
  }

  async runTicket(tid: number) {
    if (this.runners.has(tid)) return;
    this.runners.add(tid);
    try {
      for (;;) {
        const t = this.ticket(tid);
        if (t.status === "resolved") return;
        if (t.status === "staff") return; // staff took over; handing back restarts the runner
        const script = this.script(t);
        if (t.step >= script.length) { this.resolveTicket(tid, "agent"); return; }
        run("UPDATE tickets SET step = step + 1 WHERE id = ?", tid);
        this.buyerSays(t, script[t.step]);
        await this.agentReplies(tid, script[t.step]);
        await sleep(rand(3500, 5500));
      }
    } catch (e) { console.error(e); } finally { this.runners.delete(tid); }
  }

  private visitorFor(tid: number) { return [...this.visitors.values()].find(v => v.ticketId === tid); }

  buyerSays(t: Row, text: string) {
    insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, created_at) VALUES (?, ?, ?, 'buyer', ?, ?)", this.mid, t.room_id, t.handle, text, iso());
    const v = this.visitorFor(t.id);
    if (v) this.say(v.id, text, "buyer");
    this.event(t.handle, text, "service");
    this.changed("tickets", `ticket:${t.id}`);
  }

  async agentReplies(tid: number, text: string) {
    const t0 = this.ticket(tid);
    const c = get("SELECT * FROM customers WHERE id = ?", t0.customer_id)!;
    this.typing.add(tid); this.changed("tickets", `ticket:${tid}`);
    let r: AgentResult;
    const pendingApproval = !!get("SELECT 1 FROM approvals WHERE merchant_id = ? AND customer_id = ? AND status = 'waiting'", this.mid, c.id);
    try { r = await this.ask("service", text, { customer: c, pendingApproval }); } finally { this.typing.delete(tid); }
    const t = this.ticket(tid);
    if (t.status !== "agent") { this.changed("tickets", `ticket:${tid}`); return; }
    insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, cites, source, created_at) VALUES (?, ?, '@service', 'agent', ?, ?, ?, ?)", this.mid, t.room_id, r.text, JSON.stringify(r.cites), r.source, iso());
    this.say("agent:service", r.text.length > 70 ? r.text.slice(0, 68) + "…" : r.text);
    this.event("@service", r.text.length > 90 ? r.text.slice(0, 88) + "…" : r.text, "service");
    if (r.data?.approval && !get("SELECT 1 FROM approvals WHERE merchant_id = ? AND customer_id = ? AND status = 'waiting'", this.mid, c.id)) {
      const n = (get("SELECT COUNT(*) AS n FROM approvals WHERE merchant_id = ?", this.mid)!.n as number) + 2210;
      const order = get("SELECT * FROM transactions WHERE merchant_id = ? AND customer_id = ? AND type = 'order' ORDER BY id DESC LIMIT 1", this.mid, c.id);
      insert("INSERT INTO approvals (merchant_id, code, customer_id, order_code, amount, risk, recommendation, reasons, ticket_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        this.mid, `RF-${n}`, c.id, c.last_order, order?.amount ?? 150, c.risk, "Deny refund, offer exchange", JSON.stringify(["3rd return in 60 days", `Risk score ${c.risk}`]), tid, iso());
      this.decision("@returns", `Sent ${c.last_order} refund for human approval`, `Risk ${c.risk} above ${this.merchant().risk_threshold}`);
      this.event("@returns", `needs the owner's call on a refund for ${c.name}`, "risk");
      this.toast(`@returns needs your call on a refund for ${c.name}.`, "monitor");
      this.changed("approvals", "overview");
    }
    if (r.data?.handoff) {
      run("UPDATE tickets SET status = 'staff' WHERE id = ?", tid);
      this.sys(t.room_id, "@service asked for a person. The agent is paused until you reply or hand it back.");
      this.toast(`${c.name} asked for a person at the service counter.`, "service", tid);
    }
    this.changed("tickets", `ticket:${tid}`);
  }

  private sys(roomId: number, text: string) {
    insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, created_at) VALUES (?, ?, 'system', 'sys', ?, ?)", this.mid, roomId, text, iso());
  }

  resolveTicket(tid: number, by: "agent" | "staff") {
    const t = this.ticket(tid);
    if (t.status === "resolved") return;
    const c = get("SELECT name FROM customers WHERE id = ?", t.customer_id)!;
    run("UPDATE tickets SET status = 'resolved', resolved_by = ?, resolved_at = ? WHERE id = ?", by, iso(), tid);
    run("UPDATE rooms SET state = 'resolved', closed_at = ? WHERE id = ?", iso(), t.room_id);
    this.sys(t.room_id, by === "agent" ? "Resolved by @service without staff." : "Marked resolved by you.");
    this.event(by === "agent" ? "@service" : "you", `closed ticket CS-${tid} for ${c.name}`, "service");
    this.decision(by === "agent" ? "@service" : "@staff/you", `Closed CS-${tid} (${t.topic})`, by === "agent" ? "Policy + customer history" : "Staff");
    const v = this.visitorFor(tid);
    if (v) {
      v.ticketId = undefined;
      this.say(v.id, "Thanks!", "good");
      this.move(v, { to: "door" });
      setTimeout(() => this.visitors.has(v.id) && this.removeVisitor(v), 3500);
    }
    this.layoutQueue();
    this.changed("tickets", `ticket:${tid}`, "overview");
  }

  // staff actions from the service counter
  async customerSays(tid: number, text: string) {
    const t = this.ticket(tid);
    if (t.status === "resolved") throw new HttpError(409, "ticket is resolved");
    this.buyerSays(t, text);
    if (t.status === "agent") await this.agentReplies(tid, text);
  }
  staffSays(tid: number, text: string) {
    const t = this.ticket(tid);
    if (t.status === "resolved") throw new HttpError(409, "ticket is resolved");
    if (t.status !== "staff") run("UPDATE tickets SET status = 'staff' WHERE id = ?", tid);
    insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, created_at) VALUES (?, ?, '@staff/you', 'staff', ?, ?)", this.mid, t.room_id, text, iso());
    this.say("agent:service", "(staff) " + text.slice(0, 50));
    this.event("you", `replied to ${t.handle}`, "staff");
    this.changed("tickets", `ticket:${tid}`);
  }
  setStaff(tid: number, staff: boolean) {
    const t = this.ticket(tid);
    if (t.status === "resolved") throw new HttpError(409, "ticket is resolved");
    run("UPDATE tickets SET status = ? WHERE id = ?", staff ? "staff" : "agent", tid);
    this.sys(t.room_id, staff ? "You joined. @service will wait for you." : "You handed the conversation back to @service.");
    this.changed("tickets", `ticket:${tid}`);
    if (!staff) this.runTicket(tid);
  }

  // ------------------------------------------------------------ phone calls
  ring() {
    if (get("SELECT 1 FROM calls WHERE merchant_id = ? AND status IN ('ringing','live')", this.mid)) return null;
    const customers = all("SELECT * FROM customers WHERE merchant_id = ?", this.mid);
    if (!customers.length) return null;
    const c = pick(customers);
    const topic = c.risk > this.merchant().risk_threshold ? "refund" : pick(["where", "size"]);
    const id = insert("INSERT INTO calls (merchant_id, customer_id, topic, status, started_at) VALUES (?, ?, ?, 'ringing', ?)", this.mid, c.id, topic, iso());
    this.floor("phone", { ringing: true });
    this.event("phone", `incoming call from ${c.name}`, "call");
    this.toast(`📞 ${c.name} is calling the shop. @service will pick up.`, "phone");
    this.changed("calls", "overview");
    setTimeout(() => { if (get("SELECT 1 FROM calls WHERE id = ? AND status = 'ringing'", id)) this.answer(id); }, 6000);
    return id;
  }
  private call(cid: number) {
    const k = get("SELECT * FROM calls WHERE id = ? AND merchant_id = ?", cid, this.mid);
    if (!k) throw new HttpError(404, "call not found");
    return { ...k, lines: parse<Row[]>(k.lines, []) } as Row;
  }
  private pushLine(cid: number, line: Row) {
    const k = this.call(cid);
    k.lines.push(line);
    run("UPDATE calls SET lines = ? WHERE id = ?", JSON.stringify(k.lines), cid);
    this.changed("calls");
  }
  async answer(cid: number) {
    const k = this.call(cid);
    if (k.status !== "ringing" || this.callRunning) return;
    this.callRunning = true;
    try {
      const c = get("SELECT * FROM customers WHERE id = ?", k.customer_id)!;
      run("UPDATE calls SET status = 'live', started_at = ? WHERE id = ?", iso(), cid);
      this.floor("phone", { ringing: false });
      this.say("agent:service", `${this.merchant().name}, how can I help?`);
      this.pushLine(cid, { who: "agent", text: `Hi ${c.name.split(" ")[0]}, this is ${this.merchant().name}. How can I help?` });
      for (const line of CALL_SCRIPTS[k.topic] || CALL_SCRIPTS.where) {
        await sleep(2600);
        if (this.call(cid).status !== "live") return;
        this.pushLine(cid, { who: "caller", text: line });
        if (this.call(cid).staff) continue;
        const r = await this.ask("service", line, { customer: c });
        const now = this.call(cid);
        if (now.status !== "live" || now.staff) continue;
        this.pushLine(cid, { who: "agent", text: r.text, cites: r.cites, source: r.source });
        this.say("agent:service", "📞 " + r.text.slice(0, 60) + "…");
      }
      await sleep(1800);
      const end = this.call(cid);
      if (end.status === "live") this.endCall(cid, end.staff ? "staff" : "agent");
    } finally { this.callRunning = false; }
  }
  endCall(cid: number, by: "agent" | "staff") {
    const k = this.call(cid);
    if (k.status === "ended") return;
    if (k.status === "ringing") this.floor("phone", { ringing: false });
    const c = get("SELECT name FROM customers WHERE id = ?", k.customer_id)!;
    run("UPDATE calls SET status = 'ended', handled_by = ?, ended_at = ? WHERE id = ?", by, iso(), cid);
    const secs = Math.round((Date.now() - new Date(k.started_at).getTime()) / 1000);
    this.event("@service", `finished a ${secs}s call with ${c.name}`, "call");
    this.decision(by === "agent" ? "@service" : "@staff/you", `Phone call with ${c.name} (${k.topic})`, "Moss: customer + policy lookups");
    this.changed("calls", "overview");
  }
  takeOverCall(cid: number) {
    const k = this.call(cid);
    if (k.status !== "live") throw new HttpError(409, "call is not live");
    run("UPDATE calls SET staff = 1 WHERE id = ?", cid);
    this.pushLine(cid, { who: "staff", text: "(You joined the call.)" });
  }
  staffOnCall(cid: number, text: string) {
    const k = this.call(cid);
    if (k.status !== "live") throw new HttpError(409, "call is not live");
    this.pushLine(cid, { who: "staff", text });
  }

  // ------------------------------------------------------------ approvals and fraud
  decideApproval(aid: number, status: string) {
    const a = get("SELECT a.*, c.name FROM approvals a JOIN customers c ON c.id = a.customer_id WHERE a.id = ? AND a.merchant_id = ?", aid, this.mid);
    if (!a) throw new HttpError(404, "approval not found");
    run("UPDATE approvals SET status = ?, decided_at = ? WHERE id = ?", status, iso(), aid);
    run("UPDATE transactions SET status = ? WHERE merchant_id = ? AND customer_id = ? AND type = 'refund' AND status = 'Needs review'", status === "Photo requested" ? "Held" : status, this.mid, a.customer_id);
    if (a.ticket_id) {
      const t = get("SELECT * FROM tickets WHERE id = ?", a.ticket_id);
      if (t && t.status !== "resolved") insert("INSERT INTO messages (merchant_id, room_id, sender, role, text, created_at) VALUES (?, ?, '@concierge', 'agent', ?, ?)", this.mid, t.room_id, `The owner reviewed the request: ${status.toLowerCase()}.`, iso());
    }
    this.decision("@staff/you", `${a.code}: ${status}`, "Decided at the monitoring table");
    this.event("you", `decided ${a.code} for ${a.name}: ${status.toLowerCase()}`, "staff");
    this.changed("approvals", "transactions", "products", "overview", "tickets");
  }

  decideTransaction(txid: number, status: string) {
    const t = get("SELECT * FROM transactions WHERE id = ? AND merchant_id = ?", txid, this.mid);
    if (!t) throw new HttpError(404, "transaction not found");
    run("UPDATE transactions SET status = ? WHERE id = ?", status, txid);
    if (t.type === "refund" && t.customer_id) run("UPDATE approvals SET status = ?, decided_at = ? WHERE merchant_id = ? AND customer_id = ? AND status = 'waiting'", status, iso(), this.mid, t.customer_id);
    this.decision("@staff/you", `${t.code}: ${status}`, "Decided at the goods shelf");
    this.event("you", `${t.code} → ${status.toLowerCase()}`, "staff");
    this.changed("transactions", "products", "approvals", "overview");
  }

  async screen(txid: number) {
    const t = get("SELECT * FROM transactions WHERE id = ? AND merchant_id = ?", txid, this.mid);
    if (!t) throw new HttpError(404, "transaction not found");
    const r = await this.ask("returns", { code: t.code, type: t.type, flags: parse(t.flags, []) });
    run("UPDATE transactions SET screen = ? WHERE id = ?", JSON.stringify({ text: r.text, ...r.data, cites: r.cites, source: r.source }), txid);
    this.decision("@returns", `Screened ${t.code}: ${r.data.verdict}`, r.data.why.join(", ") || "No signals");
    this.event("@returns", `screened ${t.code}: risk ${r.data.score}, ${String(r.data.verdict).toLowerCase()}`, "risk");
    this.changed("transactions");
    return r;
  }

  async scanAll() {
    const todo = all("SELECT id FROM transactions WHERE merchant_id = ? AND flags != '[]' AND screen IS NULL", this.mid);
    this.floor("agent", { key: "returns", to: "shelves" });
    this.say("agent:returns", "Scanning every shelf…");
    for (const t of todo) await this.screen(t.id);
    const waiting = get("SELECT COUNT(*) AS n FROM transactions WHERE merchant_id = ? AND flags != '[]' AND status IN ('Needs review','Held')", this.mid)!.n;
    this.say("agent:returns", `Done. ${waiting} need you.`, waiting ? "bad" : "good");
    this.floor("agent", { key: "returns", to: "home" });
    this.toast(`@returns screened ${todo.length} flagged transactions. ${waiting} need your decision.`, "shelves");
    return { screened: todo.length, waiting };
  }

  // ------------------------------------------------------------ promos
  async generatePromo(prompt: string) {
    const r = await this.ask("promo", prompt);
    if (!r.data) throw new HttpError(400, r.text);
    const d = r.data;
    const id = insert(`INSERT INTO promos (merchant_id, prompt, headline, body, sku, product, pct, price, list, margin, competitor, segment, ends, lift, needs_approval, agent_text, cites, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      this.mid, prompt, d.headline, d.body, d.sku, d.product, d.pct, d.price, d.list, d.margin, d.competitor, d.segment, d.ends, d.lift, d.needsApproval ? 1 : 0, r.text, JSON.stringify(r.cites), r.source, iso());
    this.event("you", `asked @promo: "${prompt.slice(0, 60)}"`, "promo");
    this.changed("promos");
    return Q.promos(this.mid).find(p => p.id === id);
  }
  publishPromo(pid: number) {
    const p = get("SELECT * FROM promos WHERE id = ? AND merchant_id = ?", pid, this.mid);
    if (!p) throw new HttpError(404, "promo not found");
    run("UPDATE promos SET status = 'retired' WHERE merchant_id = ? AND status = 'live'", this.mid);
    run("UPDATE promos SET status = 'live', published_at = ?, seen = 0 WHERE id = ?", iso(), pid);
    this.floor("billboard", { headline: p.headline, body: p.body });
    this.say("agent:promo", "New offer is live! Telling buyer agents.", "good");
    this.decision("@promo", `Published "${p.headline}"`, p.needs_approval ? `${p.pct}% approved by owner` : "Inside margin rule");
    this.event("@promo", `new billboard: ${p.headline}`, "promo");
    this.changed("promos", "overview");
    setTimeout(() => this.spawn("shop"), 600);
    setTimeout(() => this.spawn("shop"), 2400);
  }

  async summary() {
    const o = Q.overview(this.mid);
    return this.ask("concierge", "Summarize the shift so far", { stats: { revenue: o.revenue, orders: o.orders, handled: o.handled, blocked: o.blocked, waiting: o.waiting } });
  }
}

// ---------------------------------------------------------------- registry
const engines = new Map<number, Engine>();
const stopTimers = new Map<number, NodeJS.Timeout>();
export function engine(mid: number) {
  let e = engines.get(mid);
  if (!e) engines.set(mid, (e = new Engine(mid)));
  return e;
}
// Open a shop while someone is watching it (its own /stream, or mission control); close it 15 s after the last viewer leaves.
let missionViewers = 0;
const watched = (mid: number) => subscriberCount(mid) > 0 || missionViewers > 0;
function scheduleStop(mid: number) {
  clearTimeout(stopTimers.get(mid));
  stopTimers.set(mid, setTimeout(() => { if (!watched(mid)) engine(mid).stop(); }, 15_000));
}
onSubscribersChange((mid, count) => {
  clearTimeout(stopTimers.get(mid));
  if (count > 0) { try { engine(mid).start(); } catch (e) { console.error(e); } }
  else scheduleStop(mid);
});
// mission control keeps every simulated shop open
export function startAllSimulated() {
  for (const m of all("SELECT id FROM merchants WHERE simulate = 1")) {
    clearTimeout(stopTimers.get(m.id));
    try { engine(m.id).start(); } catch (e) { console.error(e); }
  }
}
export function missionOpened() { missionViewers++; startAllSimulated(); }
export function missionClosed() {
  missionViewers = Math.max(0, missionViewers - 1);
  if (missionViewers === 0) for (const id of engines.keys()) if (!watched(id)) scheduleStop(id);
}
export const missionWatching = () => missionViewers > 0;
export const engineIfAny = (mid: number) => engines.get(mid);
