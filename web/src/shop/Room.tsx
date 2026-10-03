// The shop room, drawn as an isometric diorama: floor slab, two walls in perspective, and furniture you walk around.
// Walls are skewed planes, so whatever hangs on them (billboard, shelves, the dashboard screen, the shop sign)
// is drawn in perspective for free. Furniture is SVG; each piece sits at the z-index of its front edge so
// people walking past go in front of or behind it.
import type { ReactNode } from "react";
import { money, type Agent, type Billboard, type Merchant, type Overview, type Product, type Theme } from "../api";
import type { StationName } from "./floor";
import { COUNTER, DOOR, H, RUG, SLAB, TABLE, TOP, U, V, W, WALL_H, iso, pts } from "./geometry";

type Props = {
  m?: Merchant; theme: Theme | null; products: Product[]; flagged: Set<string>; billboard: Billboard; ringing: boolean;
  o?: Overview; agents: Agent[]; busy: string[]; near: StationName | null;
  badges: Partial<Record<StationName, number>>; onPhone: () => void;
};

const DEFAULT: Theme = { wall: "#2F4A3C", floorA: "#D9C3A0", floorB: "#CDB28C", accent: "#A45F6A", trim: "#8A6644" };
// world → screen for SVG: maps the unit square (u, v) onto the floor diamond
const WORLD = `matrix(${U.x} ${U.y} ${V.x} ${V.y} ${TOP.x} ${TOP.y})`;

// an isometric box: top, front-left face (v = v1) and front-right face (u = u1)
function IsoBox({ u0, u1, v0, v1, h, b = 0, top, left, right, children }: { u0: number; u1: number; v0: number; v1: number; h: number; b?: number; top: string; left: string; right: string; children?: ReactNode }) {
  return (
    <g>
      <polygon points={pts(iso(u0, v1, h), iso(u1, v1, h), iso(u1, v1, b), iso(u0, v1, b))} fill={left} />
      <polygon points={pts(iso(u1, v0, h), iso(u1, v1, h), iso(u1, v1, b), iso(u1, v0, b))} fill={right} />
      <polygon points={pts(iso(u0, v0, h), iso(u1, v0, h), iso(u1, v1, h), iso(u0, v1, h))} fill={top} />
      {children}
    </g>
  );
}

// furniture layer: a full-stage SVG at the depth of the piece's front corner; only the piece itself takes clicks
function Piece({ z, children, className }: { z: number; children: ReactNode; className?: string }) {
  return <svg className={`piece ${className ?? ""}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ zIndex: Math.round(z) }} aria-hidden="true">{children}</svg>;
}

function Plant({ u, v, s = 1 }: { u: number; v: number; s?: number }) {
  const p = iso(u, v);
  return (
    <Piece z={p.y}>
      <g transform={`translate(${p.x} ${p.y}) scale(${s})`}>
        <ellipse cx="0" cy="2" rx="22" ry="9" fill="rgba(0,0,0,.25)" />
        <path d="M-15 -30 L15 -30 L11 0 L-11 0 Z" fill="#9A5B3A" />
        <ellipse cx="0" cy="-30" rx="15" ry="5" fill="#7A4429" />
        {[[-16, -62, -0.5], [14, -66, 0.5], [0, -84, 0], [-10, -80, -0.25], [11, -52, 0.8], [-20, -46, -0.9]].map(([x, y, r], i) =>
          <ellipse key={i} cx={x} cy={y} rx="10" ry="24" transform={`rotate(${r * 45} ${x} ${y})`} fill={i % 2 ? "#4E7F57" : "#3E6B4A"} />)}
      </g>
    </Piece>
  );
}

export function Room({ m, theme, products, flagged, billboard, ringing, o, agents, busy, near, badges, onPhone }: Props) {
  const t = theme ?? DEFAULT;
  const T = iso(0, 0), R = iso(1, 0), B = iso(1, 1), L = iso(0, 1);
  const shelfItems = products.slice(0, 12);
  const hourly = o?.hourly ?? [];
  const maxH = Math.max(1, ...hourly.map(h => h.v));
  const tag = (name: StationName, label: string, k: string, at: { x: number; y: number }) => (
    <button type="button" className={`tag ${near === name ? "near" : ""}`} data-station={name} style={{ left: at.x, top: at.y }} aria-label={label}>
      <kbd>{k}</kbd>{label}
    </button>
  );
  const badge = (name: StationName, at: { x: number; y: number }) => badges[name] ? <span className="badge" style={{ left: at.x, top: at.y }}>{badges[name]}</span> : null;
  const counterFront = iso(COUNTER.u1, COUNTER.v1);

  return (
    <>
      {/* ---------- floor: slab, planks, light and shadow ---------- */}
      <svg className="floor" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <defs>
          <pattern id="planks" patternUnits="userSpaceOnUse" width="1" height="0.06" patternTransform={WORLD}>
            <rect width="1" height="0.06" fill={t.floorA} />
            <rect y="0.03" width="1" height="0.03" fill={t.floorB} />
            <rect y="0.0285" width="1" height="0.0015" fill="rgba(0,0,0,.18)" />
            <rect y="0.0585" width="1" height="0.0015" fill="rgba(0,0,0,.18)" />
            {[0.13, 0.41, 0.77].map(x => <rect key={x} x={x} y="0" width="0.002" height="0.03" fill="rgba(0,0,0,.14)" />)}
            {[0.27, 0.58, 0.9].map(x => <rect key={x} x={x} y="0.03" width="0.002" height="0.03" fill="rgba(0,0,0,.14)" />)}
          </pattern>
          <radialGradient id="pool" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFF4D6" stopOpacity=".55" /><stop offset="1" stopColor="#FFF4D6" stopOpacity="0" /></radialGradient>
          <linearGradient id="ao-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
          <linearGradient id="doorlight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF6DD" stopOpacity=".55" /><stop offset="1" stopColor="#FFF6DD" stopOpacity="0" /></linearGradient>
        </defs>
        {/* slab edges under the front of the floor */}
        <polygon points={pts(L, B, { x: B.x, y: B.y + SLAB }, { x: L.x, y: L.y + SLAB })} fill={shade(t.trim, -0.25)} />
        <polygon points={pts(B, R, { x: R.x, y: R.y + SLAB }, { x: B.x, y: B.y + SLAB })} fill={shade(t.trim, -0.45)} />
        <polygon points={pts(T, R, B, L)} fill="url(#planks)" />
        {/* soft shadow along the base of both walls */}
        <polygon points={pts(T, R, iso(1, 0.09), iso(0, 0.09))} fill="url(#ao-r)" opacity=".7" />
        <polygon points={pts(T, L, iso(0.09, 1), iso(0.09, 0))} fill="rgba(0,0,0,.16)" />
        {/* daylight spilling in from the door */}
        <polygon points={pts(iso(0, DOOR.v0), iso(0, DOOR.v1), iso(0.34, DOOR.v1 + 0.04), iso(0.34, DOOR.v0 - 0.04))} fill="url(#doorlight)" />
        {/* rug */}
        <g transform={`${WORLD}`}>
          <ellipse cx={RUG.u} cy={RUG.v} rx={RUG.ru} ry={RUG.rv} fill="rgba(0,0,0,.12)" transform={`translate(0.006 0.006)`} />
          <ellipse cx={RUG.u} cy={RUG.v} rx={RUG.ru} ry={RUG.rv} fill={shade(t.accent, 0.35)} />
          <ellipse cx={RUG.u} cy={RUG.v} rx={RUG.ru * 0.82} ry={RUG.rv * 0.82} fill="none" stroke={t.accent} strokeWidth="0.008" />
          <ellipse cx={RUG.u} cy={RUG.v} rx={RUG.ru * 0.55} ry={RUG.rv * 0.55} fill={shade(t.accent, 0.5)} />
        </g>
        {/* pools of light from the ceiling lamps */}
        {[[0.47, 0.42, 0.26], [0.7, 0.24, 0.18], [0.24, 0.24, 0.16], [0.7, 0.62, 0.17]].map(([u, v, r], i) =>
          <ellipse key={i} cx={u} cy={v} rx={r} ry={r} fill="url(#pool)" transform={WORLD} style={{ mixBlendMode: "screen" }} />)}
      </svg>

      {/* ---------- left wall: the dashboard screen, the door and the shop sign ---------- */}
      <div className="wallplane left" style={{ left: L.x, top: L.y - WALL_H, width: U.x, height: WALL_H, ["--wall" as string]: t.wall, ["--trim" as string]: t.trim }}>
        <div className="wainscot" /><div className="baseboard" />
        <div className="sconce" style={{ left: 175 }} />
        {/* shop sign above the door */}
        <div className="shopsign" style={{ left: 18, top: 10, width: 200 }}>
          <b>{m?.name ?? ""}</b>
          <small>{m?.source_platform ? `From ${m.source_platform === "tiktok" ? "TikTok Shop" : m.source_platform === "amazon" ? "Amazon" : "the web"}` : m?.city ?? ""}</small>
        </div>
        {/* the door */}
        <div className="doorway" style={{ left: (1 - DOOR.v1) * U.x, width: (DOOR.v1 - DOOR.v0) * U.x }}><span>Open · agents welcome</span></div>
        {/* the live dashboard, mounted on the wall */}
        <div className={`wallscreen station-el ${near === "monitor" ? "near" : ""}`} data-station="monitor" role="button" tabIndex={-1} aria-label="Dashboard screen"
          style={{ left: (1 - 0.52) * U.x, top: 26, width: 0.4 * U.x, height: 128 }}>
          <div className="ws-h"><i className="live-dot" /> LIVE · {m?.name ?? ""}</div>
          <div className="ws-body">
            <div className="ws-kpi"><small>Revenue today</small><b>{money(o?.revenue ?? 0)}</b><small>{o?.orders ?? 0} orders · {o?.blocked ?? 0} bots blocked</small></div>
            <div className="ws-bars">{hourly.map((h, i) => <i key={h.h} className={i === hourly.length - 1 ? "now" : ""} style={{ height: `${Math.max(4, (h.v / maxH) * 100)}%` }} />)}</div>
          </div>
          <div className="ws-foot">
            <span className={o?.waiting ? "warn" : ""}>Needs you: {o?.waiting ?? 0}</span>
            <span className="ws-agents">{agents.map(a => <i key={a.key} title={a.handle} className={busy.includes(a.key) ? "busy" : ""} />)}</span>
          </div>
        </div>
      </div>

      {/* ---------- right wall: billboard and shelves ---------- */}
      <div className="wallplane right" style={{ left: T.x, top: T.y - WALL_H, width: U.x, height: WALL_H, ["--wall" as string]: t.wall, ["--trim" as string]: t.trim, ["--accent" as string]: t.accent }}>
        <div className="wainscot" /><div className="baseboard" />
        <div className="sconce" style={{ left: 205 }} />
        <div className={`billboard station-el ${near === "billboard" ? "near" : ""} ${billboard.image ? "has-art" : ""}`} data-station="billboard" role="button" tabIndex={-1} aria-label="Billboard"
          style={{ left: 0.05 * U.x, top: 26, width: 0.38 * U.x, height: 78 }}>
          {billboard.image
            ? <img src={billboard.image} alt={billboard.headline} />
            : <><div className="bulbs" /><div className="eyebrow">Today at {m?.name ?? "the shop"}</div><h4>{billboard.headline || m?.house_offer}</h4><p>{billboard.body}</p></>}
        </div>
        <div className={`wallshelves station-el ${near === "shelves" ? "near" : ""}`} data-station="shelves" role="button" tabIndex={-1} aria-label="Goods shelves"
          style={{ left: 0.44 * U.x, top: 10, width: 0.52 * U.x, height: 168 }}>
          {[0, 1, 2].map(row => (
            <div className="board" key={row}>
              {shelfItems.slice(row * 4, row * 4 + 4).map(p => (
                <span key={p.sku} className={`goods ${flagged.has(p.sku) ? "flag" : ""}`} title={p.name}>
                  {p.image_url ? <img src={p.image_url} alt="" referrerPolicy="no-referrer" /> : <i style={{ background: p.swatch }} />}
                  {p.stock > 12 && <i className="stack" style={{ background: p.swatch }} />}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- furniture ---------- */}
      <Plant u={0.97} v={0.22} />
      <Plant u={0.06} v={0.62} s={0.9} />

      {/* display table with folded stock */}
      <Piece z={iso(TABLE.u1, TABLE.v1).y}>
        <ellipse cx={iso((TABLE.u0 + TABLE.u1) / 2, (TABLE.v0 + TABLE.v1) / 2).x} cy={iso((TABLE.u0 + TABLE.u1) / 2, (TABLE.v0 + TABLE.v1) / 2).y + 6} rx="80" ry="34" fill="rgba(0,0,0,.18)" />
        <IsoBox {...TABLE} top={shade(t.trim, 0.25)} left={shade(t.trim, -0.1)} right={shade(t.trim, -0.3)} />
        {products.slice(0, 4).map((p, i) => {
          const u = TABLE.u0 + 0.025 + (i % 2) * 0.06, v = TABLE.v0 + 0.02 + Math.floor(i / 2) * 0.05;
          const layers = p.stock > 20 ? 3 : p.stock > 8 ? 2 : 1;
          return Array.from({ length: layers }, (_, k) => (
            <IsoBox key={p.sku + k} u0={u} u1={u + 0.045} v0={v} v1={v + 0.035} b={TABLE.h + k * 7} h={TABLE.h + (k + 1) * 7}
              top={shade(p.swatch, 0.15)} left={shade(p.swatch, -0.12 - k * 0.03)} right={shade(p.swatch, -0.3)} />));
        })}
      </Piece>

      {/* the gatekeeper's arch, just inside the door */}
      <Piece z={iso(0.1, DOOR.v1).y} className="gate">
        <path d={`M ${iso(0.1, DOOR.v0).x} ${iso(0.1, DOOR.v0).y} L ${iso(0.1, DOOR.v0, 118).x} ${iso(0.1, DOOR.v0, 118).y} L ${iso(0.1, DOOR.v1, 118).x} ${iso(0.1, DOOR.v1, 118).y} L ${iso(0.1, DOOR.v1).x} ${iso(0.1, DOOR.v1).y}`} fill="none" stroke={t.wall} strokeWidth="9" strokeLinejoin="round" />
        <text x={iso(0.1, (DOOR.v0 + DOOR.v1) / 2, 126).x} y={iso(0.1, (DOOR.v0 + DOOR.v1) / 2, 126).y} className="gate-label" textAnchor="middle">GATEKEEPER</text>
      </Piece>

      {/* customer service counter with phone, bell and register */}
      <Piece z={counterFront.y}>
        <g data-station="service" className={`station-svg ${near === "service" ? "near" : ""}`}>
          <ellipse cx={iso(0.71, 0.46).x} cy={iso(0.71, 0.46).y + 8} rx="120" ry="40" fill="rgba(0,0,0,.18)" />
          <IsoBox {...COUNTER} top="#EDE6D8" left={shade(t.trim, -0.05)} right={shade(t.trim, -0.32)} />
          <polygon points={pts(iso(COUNTER.u0, COUNTER.v1, COUNTER.h), iso(COUNTER.u1, COUNTER.v1, COUNTER.h), iso(COUNTER.u1, COUNTER.v1, COUNTER.h - 6), iso(COUNTER.u0, COUNTER.v1, COUNTER.h - 6))} fill={t.accent} />
          <text className="counter-text" transform={`matrix(0.894 0.447 0 1 ${iso(COUNTER.u0 + 0.04, COUNTER.v1, 22).x} ${iso(COUNTER.u0 + 0.04, COUNTER.v1, 22).y})`}>Customer service</text>
          <IsoBox u0={0.78} u1={0.83} v0={0.435} v1={0.47} b={COUNTER.h} h={COUNTER.h + 16} top="#2B2B2B" left="#3A3A3A" right="#1F1F1F" />
          <IsoBox u0={0.62} u1={0.66} v0={0.445} v1={0.48} b={COUNTER.h} h={COUNTER.h + 5} top="#D9B45A" left="#B8913A" right="#9C7A2C" />
        </g>
        <g className={`phone3d ${ringing ? "ringing" : ""}`} data-station="service" onClick={e => { e.stopPropagation(); onPhone(); }}>
          <IsoBox u0={0.68} u1={0.73} v0={0.44} v1={0.475} b={COUNTER.h} h={COUNTER.h + 9} top={shade(t.accent, 0.15)} left={t.accent} right={shade(t.accent, -0.25)} />
          {ringing && <text x={iso(0.705, 0.46, COUNTER.h + 30).x} y={iso(0.705, 0.46, COUNTER.h + 30).y} className="ring-label" textAnchor="middle">Ring!</text>}
        </g>
      </Piece>

      {/* rug station (agent room) */}
      <svg className="piece" viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ zIndex: 2 }} aria-hidden="true">
        <ellipse data-station="rooms" className={`station-svg rug-hit ${near === "rooms" ? "near" : ""}`} cx={RUG.u} cy={RUG.v} rx={RUG.ru} ry={RUG.rv} transform={WORLD} />
      </svg>

      {/* ---------- labels and badges ---------- */}
      <div className="labels">
        {tag("billboard", "Promo engine", "1", iso(0.24, 0, 70))}
        {tag("shelves", "Goods & fraud check", "2", iso(0.7, 0, 14))}
        {tag("service", "Customer service", "3", iso(0.71, COUNTER.v1, -24))}
        {tag("monitor", "Dashboard", "4", iso(0.04, 0.32, -4))}
        {tag("rooms", "Agent room", "5", iso(RUG.u, RUG.v + RUG.rv + 0.02))}
        {badge("shelves", iso(0.96, 0, 196))}
        {badge("service", iso(COUNTER.u1, COUNTER.v0, COUNTER.h + 30))}
        {badge("monitor", iso(0, 0.12, 184))}
      </div>
    </>
  );
}

// lighten (amt > 0) or darken (amt < 0) a hex colour
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return hex;
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(x => Math.round(amt >= 0 ? x + (255 - x) * amt : x * (1 + amt)));
  return `#${c.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("")}`;
}
