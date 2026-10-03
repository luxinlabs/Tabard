// Shop-floor animation. The server decides what happens (who arrives, who says what); this class only draws it.
// It owns the entity layer inside the stage and runs its own requestAnimationFrame loop outside React.
import type { FloorVisitor, Spot } from "../api";

export const W = 1200, H = 720;
export type StationName = "billboard" | "shelves" | "service" | "monitor" | "rooms";
export const STATIONS: Record<StationName, { x: number; y: number }> = {
  billboard: { x: 240, y: 222 },
  shelves: { x: 905, y: 238 },
  service: { x: 880, y: 560 },
  monitor: { x: 250, y: 600 },
  rooms: { x: 600, y: 470 },
};
// furniture you can't walk through (stage coordinates, at foot level)
const BLOCKS = [[60, 400, 440, 548], [780, 395, 1160, 505], [0, 0, 1200, 190]];
const blocked = (x: number, y: number) => BLOCKS.some(([l, t, r, b]) => x > l && x < r && y > t && y < b);
const AGENT_POSTS: Record<string, [number, number, string, string]> = {
  gatekeeper: [705, 668, "#B03A3C", "#F2C98B"],
  concierge: [600, 380, "#2F4A3C", "#E0A1AB"],
  promo: [455, 222, "#A45F6A", "#F2C98B"],
  stylist: [700, 238, "#2F4A3C", "#F2C98B"],
  returns: [1125, 240, "#9A6512", "#F6EAD3"],
  service: [970, 392, "#2F4A3C", "#9CC7AE"],
};
const AGENT_SPOTS: Record<string, [number, number]> = { shelves: [905, 250] };

const SKIN = ["#F1C9A5", "#D7A27A", "#A8714F", "#7A4E33", "#F5D7BE"];
const HAIR = ["#2B2018", "#5A3A22", "#1B1B1B", "#8C5A2B", "#C9A15A"];
const SHIRT = ["#7C9EB2", "#C98B5B", "#8E6BAF", "#5F8F6B", "#C2665A", "#D4A84F"];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function personSVG(shirt: string, skin: string, hair: string) {
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
function robotSVG(body: string, accent: string, bad = false) {
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

class Ent {
  el: HTMLDivElement;
  path: { x: number; y: number } | null = null;
  private sayT?: number;
  constructor(layer: HTMLElement, public x: number, public y: number, svg: string, name: string, cls: string, public speed: number, onClick?: () => void) {
    this.el = document.createElement("div");
    this.el.className = "ent " + cls;
    this.el.innerHTML = svg;
    const tag = document.createElement("span");
    tag.className = "name"; tag.textContent = name;
    this.el.appendChild(tag);
    if (onClick) { this.el.classList.add("clickable"); this.el.addEventListener("click", e => { e.stopPropagation(); onClick(); }); }
    layer.appendChild(this.el);
    this.place();
  }
  place() { this.el.style.transform = `translate(${this.x - 22}px, ${this.y - 62}px)`; this.el.style.zIndex = String(Math.round(this.y)); }
  moveTo(x: number, y: number) { this.path = { x, y }; this.el.classList.add("walking"); }
  step(dt: number) {
    if (!this.path) return false;
    const dx = this.path.x - this.x, dy = this.path.y - this.y, d = Math.hypot(dx, dy), s = this.speed * dt;
    if (d <= s) { this.x = this.path.x; this.y = this.path.y; this.path = null; this.el.classList.remove("walking"); this.place(); return true; }
    this.x += (dx / d) * s; this.y += (dy / d) * s; this.place();
    return false;
  }
  say(text: string, ms = 2600, tone = "") {
    window.clearTimeout(this.sayT);
    this.el.querySelector(".bubble")?.remove();
    const b = document.createElement("div");
    b.className = "bubble " + tone; b.textContent = text;
    this.el.appendChild(b);
    this.sayT = window.setTimeout(() => b.remove(), ms);
  }
  remove() { this.el.classList.add("gone"); window.setTimeout(() => this.el.remove(), 500); }
}

export class Floor {
  private agents = new Map<string, Ent>();
  private visitors = new Map<string, Ent>();
  private me: Ent;
  private keys = new Set<string>();
  private raf = 0;
  private last = performance.now();
  private arrive: (() => void) | null = null;
  paused = false;
  nearest: StationName | null = null;

  constructor(
    private stage: HTMLElement,
    private layer: HTMLElement,
    private opts: { open: (s: StationName) => void; onNear: (s: StationName | null) => void; agentInfo: (key: string) => string; scale: () => number },
  ) {
    for (const [k, [x, y, body, accent]] of Object.entries(AGENT_POSTS)) {
      const e: Ent = new Ent(layer, x, y, robotSVG(body, accent), "@" + k, "agent", 110, () => e.say(opts.agentInfo(k), 3200));
      this.agents.set(k, e);
    }
    this.me = new Ent(layer, 600, 560, personSVG("#A45F6A", "#F1C9A5", "#2B2018"), "You (owner)", "you", 260);
    stage.addEventListener("click", this.onStageClick);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.stage.removeEventListener("click", this.onStageClick);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.layer.innerHTML = "";
  }

  // ---------------------------------------------------------- server-driven
  private spotXY(s: Spot): [number, number] {
    switch (s.to) {
      case "gate": return [600 + rand(-15, 15), 652];
      case "door": return [600 + rand(-20, 20), 765];
      case "shelf": return [650 + (s.index ?? 0) * 42 + rand(-8, 8), 285 + rand(-15, 20)];
      case "queue": { const i = s.index ?? 0; return [1000 - (i % 2) * 6, Math.min(545 + i * 40, 695)]; }
    }
  }
  private who(id: string) { return id.startsWith("agent:") ? this.agents.get(id.slice(6)) : this.visitors.get(id); }

  spawn(v: FloorVisitor, atSpot = false) {
    if (this.visitors.has(v.id)) return;
    const h = hash(v.handle);
    const svg = v.kind === "bot" ? robotSVG("#4A4A4A", "#FF5A5A", true) : personSVG(SHIRT[h % SHIRT.length], SKIN[h % SKIN.length], HAIR[(h >> 3) % HAIR.length]);
    const [x, y] = atSpot ? this.spotXY(v.spot) : [600 + rand(-20, 20), 760];
    this.visitors.set(v.id, new Ent(this.layer, x, y, svg, v.label, v.kind === "bot" ? "bot" : "", rand(95, 120)));
  }
  snapshot(visitors: FloorVisitor[]) {
    for (const [id, e] of this.visitors) if (!visitors.find(v => v.id === id)) { e.remove(); this.visitors.delete(id); }
    for (const v of visitors) this.spawn(v, true);
  }
  handle(op: string, m: Record<string, any>) {
    switch (op) {
      case "spawn": return this.spawn(m.visitor);
      case "move": { const e = this.visitors.get(m.id); if (e) { const [x, y] = this.spotXY(m as Spot); e.moveTo(x, y); } return; }
      case "remove": { const e = this.visitors.get(m.id); if (e) { e.remove(); this.visitors.delete(m.id); } return; }
      case "say": return this.who(m.who)?.say(m.text, 2800, m.tone);
      case "coin": { const e = this.visitors.get(m.id); if (e) this.coin(e.x, e.y, m.text, m.bad); return; }
      case "alarm": { const g = this.stage.querySelector(".gate"); g?.classList.add("alarm"); window.setTimeout(() => g?.classList.remove("alarm"), 1300); return; }
      case "agent": {
        const a = this.agents.get(m.key); if (!a) return;
        const [x, y] = m.to === "home" ? AGENT_POSTS[m.key] : AGENT_SPOTS[m.to] || AGENT_POSTS[m.key];
        a.moveTo(x, y); return;
      }
    }
  }
  setBusy(busy: string[]) {
    for (const [k, a] of this.agents) a.el.classList.toggle("busy", busy.includes(k));
  }
  private coin(x: number, y: number, text: string, bad?: boolean) {
    const c = document.createElement("div");
    c.className = "coin" + (bad ? " bad" : ""); c.textContent = text;
    c.style.left = x - 20 + "px"; c.style.top = y - 90 + "px";
    this.layer.appendChild(c); window.setTimeout(() => c.remove(), 1400);
  }

  // ---------------------------------------------------------- you
  goTo(name: StationName) {
    if (this.paused) return;
    const st = STATIONS[name];
    this.me.moveTo(st.x, st.y);
    this.arrive = () => this.opts.open(name);
  }
  private onStageClick = (e: MouseEvent) => {
    if (this.paused) return;
    const station = (e.target as HTMLElement).closest<HTMLElement>("[data-station]");
    if (station) return this.goTo(station.dataset.station as StationName);
    const r = this.stage.getBoundingClientRect(), s = this.opts.scale();
    const x = Math.max(30, Math.min(1170, (e.clientX - r.left) / s)), y = Math.max(215, Math.min(700, (e.clientY - r.top) / s));
    if (blocked(x, y)) return;
    const t = document.createElement("div");
    t.className = "target"; t.style.left = x - 11 + "px"; t.style.top = y - 5 + "px";
    this.layer.appendChild(t); window.setTimeout(() => t.remove(), 800);
    this.arrive = null;
    this.me.moveTo(x, y);
  };
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.paused || /input|textarea|select/i.test((e.target as HTMLElement).tagName)) return;
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { this.keys.add(k); e.preventDefault(); }
    if ((k === "e" || k === " ") && this.nearest) { e.preventDefault(); this.opts.open(this.nearest); }
    const hot = ({ "1": "billboard", "2": "shelves", "3": "service", "4": "monitor", "5": "rooms" } as Record<string, StationName>)[k];
    if (hot) this.goTo(hot);
  };
  private onKeyUp = (e: KeyboardEvent) => { this.keys.delete(e.key.toLowerCase()); };
  setPaused(p: boolean) { this.paused = p; if (p) { this.keys.clear(); this.me.path = null; this.arrive = null; this.me.el.classList.remove("walking"); } }

  private loop = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    const me = this.me;
    if (!this.paused && this.keys.size) {
      me.path = null; this.arrive = null;
      let vx = 0, vy = 0;
      if (this.keys.has("a") || this.keys.has("arrowleft")) vx--;
      if (this.keys.has("d") || this.keys.has("arrowright")) vx++;
      if (this.keys.has("w") || this.keys.has("arrowup")) vy--;
      if (this.keys.has("s") || this.keys.has("arrowdown")) vy++;
      const l = Math.hypot(vx, vy) || 1;
      const nx = Math.max(30, Math.min(1170, me.x + (vx / l) * me.speed * dt)), ny = Math.max(215, Math.min(700, me.y + (vy / l) * me.speed * dt));
      if (!blocked(nx, ny)) { me.x = nx; me.y = ny; }
      me.el.classList.add("walking"); me.place();
    } else if (!me.path) me.el.classList.remove("walking");
    if (me.step(dt) && this.arrive) { const a = this.arrive; this.arrive = null; a(); }
    for (const e of this.agents.values()) e.step(dt);
    for (const e of this.visitors.values()) e.step(dt);

    let best: StationName | null = null, bd = 95;
    for (const [n, st] of Object.entries(STATIONS) as [StationName, { x: number; y: number }][]) {
      const d = Math.hypot(me.x - st.x, me.y - st.y);
      if (d < bd) { bd = d; best = n; }
    }
    if (best !== this.nearest) { this.nearest = best; this.opts.onNear(best); }
    this.raf = requestAnimationFrame(this.loop);
  };
}
