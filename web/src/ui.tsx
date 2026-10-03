// Small shared UI pieces.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { money } from "./api";

export const RiskPill = ({ risk }: { risk: number }) => <span className={`pill ${risk > 60 ? "p-bad" : risk > 30 ? "p-warn" : "p-good"}`}>Risk {risk}</span>;

export const Cites = ({ cites }: { cites?: string[] }) =>
  cites?.length ? <div className="cites">{cites.map((c, i) => <span key={i} className={`chip ${c.startsWith("tavily") ? "tv" : ""}`}>{c}</span>)}</div> : null;

export const Source = ({ source }: { source?: string | null }) =>
  source === "zoowork" ? <span className="pill p-forest">ZooWork live</span> : source ? <span className="pill p-neutral">Simulated</span> : null;

const STATUS_TONE: Record<string, string> = { Paid: "p-good", Blocked: "p-bad", "Needs review": "p-warn", Held: "p-warn", Released: "p-good", Refunded: "p-neutral", "Exchange offered": "p-forest", Denied: "p-bad", "Photo requested": "p-warn" };
export const StatusPill = ({ status }: { status: string }) => <span className={`pill ${STATUS_TONE[status] || "p-neutral"}`}>{status}</span>;

export const Thinking = ({ children }: { children: ReactNode }) => <div className="thinking"><span className="spin" />{children}</div>;
export const ErrorNote = ({ error }: { error: unknown }) => error ? <div className="guard stop" role="alert">{(error as Error).message}</div> : null;

export function Modal({ title, who, onClose, children }: { title: string; who: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-h"><h2>{title}</h2><span className="who">{who}</span><button className="x" ref={closeRef} onClick={onClose} aria-label="Close">×</button></div>
        <div className="sheet-b">{children}</div>
      </div>
    </div>
  );
}

// Single-series bar chart: revenue by hour. The last bar is the current hour.
export function RevenueChart({ data }: { data: { h: string; v: number }[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const w = 560, h = 210, padL = 44, padB = 24, padT = 10;
  const max = Math.max(500, ...data.map(d => d.v));
  const step = max > 4000 ? 2000 : max > 2000 ? 1000 : 500;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const bw = (w - padL) / Math.max(1, data.length), barW = Math.max(6, bw - 10);
  const y = (v: number) => padT + (h - padT - padB) * (1 - v / top);
  const bar = (x: number, v: number) => {
    if (v <= 0) return "";
    const y0 = y(0), y1 = y(v), r = Math.min(4, y0 - y1);
    return `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + barW - r} Q${x + barW},${y1} ${x + barW},${y1 + r} V${y0} Z`;
  };
  const fmt = (t: number) => (t ? "$" + (t / 1000).toFixed(t % 1000 ? 1 : 0) + "k" : "$0");
  return (
    <div className="chart" ref={box}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Revenue by hour today">
        {ticks.map(t => <g key={t}><line className="gl" x1={padL} x2={w} y1={y(t)} y2={y(t)} /><text className="ax" x={padL - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
        {data.map((d, i) => {
          const x = padL + i * bw + 5, now = i === data.length - 1;
          return (
            <g key={d.h} onMouseMove={e => { const r = box.current!.getBoundingClientRect(); setTip({ x: e.clientX - r.left, y: e.clientY - r.top, text: `${d.h}:00 · ${money(d.v)}${now ? " (so far)" : ""}` }); }} onMouseLeave={() => setTip(null)}>
              <rect className="hit" x={x - 5} y={padT} width={bw} height={h - padT - padB} />
              <path className={`bar ${now ? "now" : ""}`} d={bar(x, d.v)} />
              <text className="ax" x={x + barW / 2} y={h - 6} textAnchor="middle">{d.h}:00</text>
            </g>
          );
        })}
      </svg>
      {tip && <div className="tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
    </div>
  );
}
