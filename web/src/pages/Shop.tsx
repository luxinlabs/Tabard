// The shop floor for one merchant.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useHealth, useM, useShopStream, money, parseTheme, themeVars, PLATFORM_LABEL, type Agent, type Merchant, type Overview, type Product, type ShopEvent, type StreamMsg } from "../api";
import { Floor, H, W, type StationName } from "../shop/floor";
import { Modal } from "../ui";
import { PromoPanel } from "../shop/PromoPanel";
import { ServicePanel } from "../shop/ServicePanel";
import { GoodsPanel } from "../shop/GoodsPanel";
import { DashboardPanel } from "../shop/DashboardPanel";

type Toast = { id: number; text: string; open?: string; ticketId?: number };
const TITLES: Record<StationName, [string, string]> = {
  billboard: ["Promo engine", "The billboard · Sell more"],
  shelves: ["Goods & fraud check", "The shelf · Lose less"],
  service: ["Customer service", "The counter · Run leaner"],
  monitor: ["Monitoring table", "Everything in the shop, live"],
};

export default function Shop() {
  const mid = Number(useParams().mid);
  const merchant = useM<Merchant>(mid, ["merchant"], "");
  const o = useM<Overview>(mid, ["overview"], "/overview");
  const products = useM<Product[]>(mid, ["products"], "/products");
  const agents = useM<Agent[]>(mid, ["agents"], "/agents");
  const health = useHealth();

  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const floor = useRef<Floor | null>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const [near, setNear] = useState<StationName | null>(null);
  const [modal, setModal] = useState<StationName | null>(null);
  const [serviceTab, setServiceTab] = useState<"chat" | "phone">("chat");
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [billboard, setBillboard] = useState({ headline: "", body: "" });
  const [ringing, setRinging] = useState(false);
  const [busy, setBusy] = useState<string[]>([]);
  const [ticker, setTicker] = useState<ShopEvent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [help, setHelp] = useState(() => { try { return !localStorage.getItem("tabard-help-seen"); } catch { return true; } });
  const agentJobs = useRef<Record<string, string>>({});
  agentJobs.current = Object.fromEntries((agents.data ?? []).map(a => [a.key, `${a.name} · ${a.job}`]));

  const open = useCallback((s: StationName) => setModal(s), []);
  const close = useCallback(() => setModal(null), []);

  // fit the 1200×720 stage to the window
  useLayoutEffect(() => {
    const fit = () => {
      const vw = (viewport.current?.clientWidth ?? 1200) - 32;
      const vh = window.innerHeight - 140;
      const s = Math.max(0.3, Math.min(vw / W, Math.max(vh, 360) / H, 1.25));
      scaleRef.current = s; setScale(s);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const f = new Floor(stageRef.current!, layerRef.current!, { open, onNear: setNear, agentInfo: k => agentJobs.current[k] ?? k, scale: () => scaleRef.current });
    floor.current = f;
    return () => { f.destroy(); floor.current = null; };
  }, [mid, open]);
  useEffect(() => { floor.current?.setPaused(!!modal || help); }, [modal, help]);
  useEffect(() => { floor.current?.setBusy(busy); }, [busy]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 6500);
  }, []);

  useShopStream(mid, (m: StreamMsg) => {
    const f = floor.current;
    switch (m.type) {
      case "snapshot": f?.snapshot(m.visitors); setBillboard(m.billboard); setRinging(m.ringing); setBusy(m.busy); break;
      case "floor":
        if (m.op === "billboard") setBillboard({ headline: String(m.headline), body: String(m.body) });
        else if (m.op === "phone") setRinging(!!m.ringing);
        else f?.handle(m.op, m);
        break;
      case "busy": setBusy(m.busy); break;
      case "event": setTicker(t => [m.event, ...t].slice(0, 8)); break;
      case "toast": toast(m); break;
    }
  });

  const openFromToast = (t: Toast) => {
    setToasts(ts => ts.filter(x => x.id !== t.id));
    if (t.open === "phone") { setServiceTab("phone"); setModal("service"); }
    else if (t.open === "service") { setServiceTab("chat"); if (t.ticketId) setTicketId(t.ticketId); setModal("service"); }
    else if (t.open === "monitor" || t.open === "shelves" || t.open === "billboard") setModal(t.open);
  };

  if (merchant.error) return <div className="page"><p>{(merchant.error as Error).message}</p><Link to="/merchants">Back to shops</Link></div>;
  const m = merchant.data, d = o.data;
  const flaggedSkus = new Set((products.data ?? []).filter(p => p.to_review > 0).map(p => p.sku));
  const rows = products.data ? [products.data.slice(0, 3), products.data.slice(3, 6), products.data.slice(6, 9)] : [[], [], []];
  const counterBadge = (d?.openTickets ?? 0) + (ringing ? 1 : 0);

  return (
    <div id="game">
      <header className="hud">
        <div className="brand"><Link to="/" className="brandlink"><b>Tabard</b></Link><span>{m ? `${m.name} · ${m.category}` : "…"}</span></div>
        <span className={`zw ${health.data?.zoowork ? "live" : ""}`} title={health.data?.zoowork ? "Agent calls go to your ZooWork managed agents" : "Set ZOOWORK_API_URL on the server to use real ZooWork agents"}><i /><span>{health.data?.zoowork ? "ZooWork agents: live" : "ZooWork: simulator"}</span></span>
        <nav className="hudnav"><Link to={`/m/${mid}/profile`}>Store profile</Link><Link to="/">Switch shop</Link></nav>
        <div className="stats">
          <button className="stat" onClick={() => setModal("monitor")}><small>Revenue today</small><b>{money(d?.revenue ?? 0)}</b></button>
          <button className="stat" onClick={() => setModal("monitor")}><small>Orders</small><b>{d?.orders ?? 0}</b></button>
          <button className="stat" onClick={() => setModal("service")}><small>In the shop</small><b>{d?.inShop ?? 0}</b></button>
          <button className="stat" onClick={() => setModal("shelves")}><small>Bots blocked</small><b>{d?.blocked ?? 0}</b></button>
          <button className={`stat ${d?.waiting ? "alert" : ""}`} onClick={() => setModal("monitor")}><small>Needs you</small><b>{d?.waiting ?? 0}</b></button>
        </div>
      </header>

      <div id="viewport" ref={viewport}>
        <div id="stageBox" style={{ width: W * scale, height: H * scale }}>
          <div id="stage" ref={stageRef} style={{ transform: `scale(${scale})`, ...themeVars(parseTheme(m?.theme)) } as React.CSSProperties} aria-label="Shop floor">
            <div className="wall" />
            <div className="shopname">{m?.name ?? ""}<small>{m?.city ?? ""}</small></div>
            {m?.source_platform && <div className="platform-sign">From {PLATFORM_LABEL[m.source_platform] ?? "the web"}</div>}
            {m?.source_platform && m.tagline && <div className="shoptag">{m.tagline}</div>}
            <div className="rug" />
            <div className="plant" style={{ left: 14, top: 600 }} />
            <div className="plant" style={{ left: 1140, top: 620 }} />

            <Station id="billboard" name="billboard" near={near} label="Promo engine" k="1" open={open}>
              <div className="board"><div className="bulbs" /><div className="eyebrow">Today at {m?.name ?? "the shop"}</div><h4>{billboard.headline || m?.house_offer}</h4><p>{billboard.body}</p></div>
            </Station>
            <Station id="shelves" name="shelves" near={near} label="Goods & fraud check" k="2" open={open} badge={d?.flagged}>
              <div className="unit">{rows.map((r, i) => <div className="shelf" key={i}>{r.flatMap(p => Array.from({ length: Math.max(1, Math.min(4, Math.ceil(p.stock / 12))) }, (_, j) =>
                <span key={p.sku + j} className={`item ${p.image_url && j === 0 ? "photo" : ""} ${j === 0 && flaggedSkus.has(p.sku) ? "flag" : ""}`} style={{ backgroundColor: p.swatch, backgroundImage: p.image_url && j === 0 ? `url("${p.image_url}")` : undefined, height: 26 + (j % 2) * 6 }} title={p.name} />))}</div>)}</div>
            </Station>
            <Station id="counter" name="service" near={near} label="Customer service" k="3" open={open} badge={counterBadge}>
              <div className="counter-top" />
              <div className={`phone ${ringing ? "ringing" : ""}`} onClick={e => { e.stopPropagation(); setServiceTab("phone"); setModal("service"); }} />
              <div className="bell" />
              <div className="counter-front"><span>Customer service</span></div>
            </Station>
            <Station id="monitor" name="monitor" near={near} label="Monitoring table" k="4" open={open} badge={d?.waiting}>
              <div className="screens">
                <div className="screen"><i /><i /><i /><i /><i /><i /></div>
                <div className="screen text">{(agents.data ?? []).map(a => <div className="dotline" key={a.key}><b className={busy.includes(a.key) ? "r" : ""} />{a.handle}</div>)}</div>
                <div className="screen"><i /><i /><i /><i /><i /></div>
              </div>
              <div className="desk" />
            </Station>

            <div className="gate"><span>Gatekeeper</span></div>
            <div className="door" />
            <div id="ents" ref={layerRef} />

            {help && (
              <div className="help" onClick={e => e.stopPropagation()}>
                <h3>Welcome to the shop floor</h3>
                <ul>
                  <li>Shoppers' agents walk in through the door. Your <b>ZooWork agents</b> (the little robots) answer them.</li>
                  <li><b>Billboard</b>: prompt the promo engine to write a new offer.</li>
                  <li><b>Goods shelf</b>: check stock and fraud on every transaction.</li>
                  <li><b>Service counter</b>: chats and phone calls the agent answers for you.</li>
                  <li><b>Monitoring table</b>: the full dashboard and your approvals.</li>
                </ul>
                <p className="note" style={{ color: "#5B6A62" }}>Click to walk, or use WASD and E. Keys 1–4 jump to a station. Everything you see is saved for this store.</p>
                <button className="btn primary" onClick={() => { setHelp(false); try { localStorage.setItem("tabard-help-seen", "1"); } catch { /* private mode */ } }}>Open the shop</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="ticker">
        <span className="label">Agent room feed</span>
        <div className="items">{ticker.map(e => <span className="it new" key={e.id}><b>{e.actor}</b> {e.text}</span>)}</div>
        <span className="helpbar">Click to walk · <kbd>WASD</kbd> move · <kbd>E</kbd> use · <kbd>1</kbd>–<kbd>4</kbd> jump</span>
      </footer>

      {modal && m && (
        <Modal title={TITLES[modal][0]} who={TITLES[modal][1]} onClose={close}>
          {modal === "billboard" && <PromoPanel m={m} onPublished={p => { close(); toast({ text: `Billboard updated. Buyer agents asking for ${p.product} now get ${money(p.price)}.` }); }} />}
          {modal === "service" && <ServicePanel mid={mid} tab={serviceTab} setTab={setServiceTab} ticketId={ticketId} setTicketId={setTicketId} />}
          {modal === "shelves" && <GoodsPanel mid={mid} />}
          {modal === "monitor" && <DashboardPanel mid={mid} />}
        </Modal>
      )}

      <div id="toasts" aria-live="polite">{toasts.map(t => <div className="toast" key={t.id} onClick={() => openFromToast(t)}>{t.text}</div>)}</div>
    </div>
  );
}

function Station({ id, name, near, label, k, open, badge, children }: { id: string; name: StationName; near: StationName | null; label: string; k: string; open: (s: StationName) => void; badge?: number; children: React.ReactNode }) {
  return (
    <div className={`station ${near === name ? "near" : ""}`} id={id} data-station={name} tabIndex={0} role="button" aria-label={label}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(name); } }}>
      <div className="glow" />
      {children}
      <span className="tag"><kbd>{k}</kbd>{label}</span>
      {!!badge && <span className="badge">{badge}</span>}
    </div>
  );
}
