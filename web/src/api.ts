// API client, shared types and the live shop stream.
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const hasBody = opts.body !== undefined;
  const r = await fetch("/api" + path, {
    method: opts.method ?? (hasBody ? "POST" : "GET"),
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(opts.body) : undefined,
  });
  if (r.status === 204) return undefined as T;
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error || `Request failed (${r.status})`);
  return j as T;
}

// ---------------------------------------------------------------- types
export type Merchant = {
  id: number; slug: string; name: string; category: string; tagline: string | null;
  owner_name: string | null; owner_email: string | null; phone: string | null; website: string | null; city: string | null;
  currency: string; timezone: string; plan: string;
  discount_cap: number; refund_review_over: number; risk_threshold: number; house_offer: string; simulate: number; billboard_mode: "artwork" | "text" | "off";
  created_at: string;
  description: string | null; source_url: string | null; source_platform: string | null; theme: string | null; import_notes: string | null;
  product_count?: number; customer_count?: number; waiting?: number; last_activity?: string | null;
  totals?: Record<string, number>; live?: boolean;
};
export type Overview = {
  revenue: number; orders: number; handled: number; blocked: number; waiting: number; openTickets: number; flagged: number;
  promoSeen: number; activeCall: boolean; inShop: number; hourly: { h: string; v: number }[];
};
export type Agent = { id: number; key: string; handle: string; name: string; line: string; job: string; version: string; zoowork_agent_id: string | null; enabled: boolean; actions: number; busy: boolean };
export type Product = { id: number; sku: string; name: string; category: string; price: number; cost: number; stock: number; sold: number; swatch: string; image_url: string | null; product_url: string | null; tx_count: number; to_review: number; blocked: number };
export type Screen = { text: string; score: number; verdict: string; action: string; why: string[]; cites: string[]; source: string };
export type Txn = { id: number; code: string; sku: string; buyer_handle: string; customer_id: number | null; customer_name: string | null; qty: number; amount: number; type: "order" | "refund"; flags: string[]; flag_labels: string[]; risk: number; status: string; screen: Screen | null; created_at: string };
export type Ticket = { id: number; room_id: number; customer_id: number; customer_name: string; tier: string; risk: number; phone: string; handle: string; platform: string; topic: string; status: "agent" | "staff" | "resolved"; typing: boolean; last_text: string | null; created_at: string };
export type Message = { id: number; sender: string; role: "buyer" | "agent" | "staff" | "sys"; text: string; cites: string[]; source: string | null; created_at: string };
export type CallLine = { who: "agent" | "caller" | "staff"; text: string; cites?: string[]; source?: string };
export type Call = { id: number; customer_id: number; customer_name: string; phone: string; topic: string; status: "ringing" | "live" | "ended"; staff: boolean; handled_by: string | null; lines: CallLine[]; started_at: string; ended_at: string | null };
export type Approval = { id: number; code: string; customer_name: string; order_code: string; amount: number; risk: number; recommendation: string; reasons: string[]; status: string; ticket_id: number | null };
export type Promo = { id: number; prompt: string; headline: string; body: string; sku: string; product: string; pct: number; price: number; list: number; margin: number; competitor: number; segment: string; ends: string; lift: number; needs_approval: boolean; agent_text: string; cites: string[]; source: string; status: string; seen: number;
  image_status: "designing" | "ready" | "failed" | null; image_url: string | null; image_note: string | null; created_at: string; published_at: string | null };
export type Decision = { id: number; agent: string; decision: string; basis: string; version: string; created_at: string };
export type ShopEvent = { id: number; actor: string; text: string; kind: string; created_at: string };
export type Customer = { id: number; name: string; tier: string; ltv: number; return_rate: number; risk: number; phone: string; city: string; last_order: string };
export type AgentReply = { text: string; data: unknown; cites: string[]; source: "zoowork" | "sim"; ms: number };

export type Spot = { to: "door" | "gate" | "shelf" | "queue"; index?: number };
export type Billboard = { headline: string; body: string; image?: string | null; promoId?: number; mode?: string };
export type FloorVisitor = { id: string; handle: string; platform: string; kind: "shop" | "service" | "bot"; label: string; spot: Spot };
export type StreamMsg =
  | { type: "snapshot"; live: boolean; visitors: FloorVisitor[]; busy: string[]; ringing: boolean; billboard: Billboard }
  | { type: "floor"; op: string; [k: string]: unknown }
  | { type: "changed"; keys: string[] }
  | { type: "event"; event: ShopEvent }
  | { type: "toast"; text: string; open?: string; ticketId?: number }
  | { type: "busy"; busy: string[] };

// ---------------------------------------------------------------- hooks
export function useM<T>(mid: number, key: (string | number)[], path: string, enabled = true) {
  return useQuery({ queryKey: [mid, ...key], queryFn: () => api<T>(`/merchants/${mid}${path}`), enabled });
}

// POST an action for this merchant; the stream refetches what changed, and we refetch everything on settle as a fallback.
export function useAction<V = void, R = unknown>(mid: number, fn: (v: V) => { path: string; body?: unknown; method?: string }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: V) => { const r = fn(v); return api<R>(`/merchants/${mid}${r.path}`, { method: r.method ?? "POST", body: r.body ?? {} }); },
    onSettled: () => qc.invalidateQueries({ queryKey: [mid] }),
  });
}

export const useHealth = () => useQuery({ queryKey: ["health"], queryFn: () => api<{ ok: boolean; zoowork: boolean; tavily: boolean; claude: boolean }>("/health"), staleTime: 60_000 });

export type Theme = { wall: string; floorA: string; floorB: string; accent: string; trim: string; vibe?: string };
export type ImportPreview = {
  url: string; platform: "tiktok" | "amazon" | "shopify" | "etsy" | "web"; method: "claude" | "zoowork" | "rules";
  merchant: { name: string; category: string; tagline: string; description: string; city: string | null; website: string; house_offer: string };
  products: { name: string; price: number; category: string; image_url: string | null; product_url: string | null }[];
  theme: Theme; sources: { url: string; title: string }[]; warnings: string[];
};
export const PLATFORM_LABEL: Record<string, string> = { tiktok: "TikTok Shop", amazon: "Amazon", shopify: "Shopify", etsy: "Etsy", web: "Website" };
export const parseTheme = (s: string | null | undefined): Theme | null => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
// CSS custom properties that repaint the shop room
export const themeVars = (t: Theme | null): Record<string, string> => t ? {
  "--room-wall": t.wall, "--room-floor-a": t.floorA, "--room-floor-b": t.floorB, "--room-accent": t.accent, "--room-trim": t.trim,
} : {};

// Live stream: refetches what changed and hands everything else to the caller.
export function useShopStream(mid: number, onMessage: (m: StreamMsg) => void) {
  const qc = useQueryClient();
  const cb = useRef(onMessage);
  cb.current = onMessage;
  useEffect(() => {
    const es = new EventSource(`/api/merchants/${mid}/stream`);
    es.onmessage = e => {
      const msg = JSON.parse(e.data) as StreamMsg;
      if (msg.type === "changed") {
        for (const k of msg.keys) {
          const [name, id] = k.split(":");
          qc.invalidateQueries({ queryKey: id ? [mid, name, Number(id)] : [mid, name] });
        }
      }
      if (msg.type === "event") qc.invalidateQueries({ queryKey: [mid, "events"] });
      cb.current(msg);
    };
    return () => es.close();
  }, [mid, qc]);
}

export const money = (n: number) => "$" + Math.round(n).toLocaleString();
export const hhmm = (iso: string) => new Date(iso).toTimeString().slice(0, 5);
export const ago = (iso?: string | null) => {
  if (!iso) return "never";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  return s < 60 ? "just now" : s < 3600 ? `${Math.round(s / 60)} min ago` : s < 86400 ? `${Math.round(s / 3600)} h ago` : `${Math.round(s / 86400)} d ago`;
};
