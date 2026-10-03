// Build a shop from a storefront link (TikTok Shop, Amazon, Shopify, any site).
//   1. gather    – Tavily Extract reads the page; if it is blocked or thin, Tavily Search finds what the web says about the store.
//   2. structure – Claude turns the text into a profile, catalog and room theme (when ANTHROPIC_API_KEY is set);
//                  otherwise rule-based parsing does a simpler version.
//   3. preview   – nothing is saved until the owner confirms (POST /api/import/create).
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { HttpError } from "./merchants.ts";
import { askUtilityAgent, zooworkLive } from "./zoowork.ts";

const TAVILY = process.env.TAVILY_BASE_URL || "https://api.tavily.com"; // override only for local testing
export const tavilyConfigured = () => !!process.env.TAVILY_API_KEY;
const claudeConfigured = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

export type Platform = "tiktok" | "amazon" | "shopify" | "etsy" | "web";
export type Theme = { wall: string; floorA: string; floorB: string; accent: string; trim: string; vibe: string };
export type ImportedProduct = { name: string; price: number; category: string; image_url: string | null; product_url: string | null };
export type ImportPreview = {
  url: string; platform: Platform; method: "claude" | "zoowork" | "rules";
  merchant: { name: string; category: string; tagline: string; description: string; city: string | null; website: string; house_offer: string };
  products: ImportedProduct[];
  theme: Theme;
  sources: { url: string; title: string }[];
  warnings: string[];
};

// ---------------------------------------------------------------- platform
export function detectPlatform(raw: string): { url: URL; platform: Platform } {
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { throw new HttpError(400, "That doesn't look like a link. Paste the full store URL."); }
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) throw new HttpError(400, "Paste a public http(s) store link.");
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname)) throw new HttpError(400, "Paste a public store link.");
  const h = url.hostname.toLowerCase();
  const platform: Platform = h.includes("tiktok") ? "tiktok" : /(^|\.)amazon\./.test(h) || h.includes("amzn.") ? "amazon" : h.includes("etsy.") ? "etsy" : h.includes("myshopify.") || h.includes("shopify.") ? "shopify" : "web";
  return { url, platform };
}
const PLATFORM_NAME: Record<Platform, string> = { tiktok: "TikTok Shop", amazon: "Amazon", shopify: "Shopify", etsy: "Etsy", web: "website" };

// ---------------------------------------------------------------- 1. gather with Tavily
type Gathered = { text: string; images: string[]; sources: { url: string; title: string }[]; answer: string | null; warnings: string[] };

async function tavily<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(TAVILY + path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (r.status === 401 || r.status === 403) throw new HttpError(502, "Tavily rejected the API key. Check TAVILY_API_KEY on the server.");
  if (r.status === 429 || r.status === 432 || r.status === 433) throw new HttpError(502, "Tavily's rate or usage limit was reached. Try again in a minute.");
  if (!r.ok) throw new HttpError(502, `Tavily returned ${r.status}.`);
  return r.json() as Promise<T>;
}

const goodImage = (u: string) => /^https:\/\//.test(u) && /\.(jpe?g|png|webp)(\?|$)/i.test(u) && !/(sprite|logo|icon|favicon|badge|pixel|transparent|placeholder)/i.test(u);

async function gather(url: URL, platform: Platform): Promise<Gathered> {
  if (!tavilyConfigured()) throw new HttpError(400, "Importing from a link needs Tavily. Set TAVILY_API_KEY on the server and restart it.");
  const warnings: string[] = [];
  const sources: Gathered["sources"] = [];
  let text = "", images: string[] = [], answer: string | null = null;

  // Extract: read the storefront page itself
  type ExtractRes = { results: { url: string; raw_content: string; images?: string[] }[]; failed_results: { url: string; error: string }[] };
  const ex = await tavily<ExtractRes>("/extract", { urls: [url.href], extract_depth: "advanced", include_images: true, format: "markdown", timeout: 45 });
  for (const r of ex.results) { text += r.raw_content + "\n\n"; images.push(...(r.images ?? [])); sources.push({ url: r.url, title: "Storefront page (Tavily Extract)" }); }
  if (ex.failed_results.length) warnings.push(`Tavily couldn't read the page directly (${ex.failed_results[0].error}). Used web search instead.`);

  // Search: when the page is blocked or thin (common on Amazon and TikTok), ask the web about the store
  if (text.trim().length < 1500 || platform === "tiktok" || platform === "amazon" || !/\$\s?\d/.test(text)) {
    const handle = url.pathname.split("/").filter(Boolean).find(p => p.startsWith("@"))?.slice(1) ?? url.pathname.split("/").filter(Boolean).pop() ?? "";
    const q = `${handle || url.hostname} ${PLATFORM_NAME[platform]} store products prices`.trim();
    type SearchRes = { answer?: string; images?: (string | { url: string })[]; results: { title: string; url: string; content: string; raw_content?: string }[] };
    const s = await tavily<SearchRes>("/search", {
      query: q, search_depth: "advanced", max_results: 8, include_answer: "advanced", include_raw_content: "markdown", include_images: true,
      ...(platform === "web" || platform === "shopify" ? { include_domains: [url.hostname] } : {}),
    });
    answer = s.answer ?? null;
    for (const r of s.results) { text += `# ${r.title}\n${(r.raw_content || r.content || "").slice(0, 6000)}\n\n`; sources.push({ url: r.url, title: r.title }); }
    images.push(...(s.images ?? []).map(i => (typeof i === "string" ? i : i.url)));
  }
  if (!text.trim()) throw new HttpError(422, "Tavily couldn't find anything about that store. Check the link, or try the store's own website.");
  images = [...new Set(images.filter(goodImage))].slice(0, 40);
  return { text: text.slice(0, 120_000), images, sources: sources.slice(0, 10), answer, warnings };
}

// ---------------------------------------------------------------- 2a. structure with Claude
const HEX = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const ShopSchema = z.object({
  name: z.string().describe("The store's brand name"),
  category: z.string().describe("What the store sells, 2-4 words, e.g. 'Handmade candles'"),
  tagline: z.string().describe("A one-line tagline in the store's own voice"),
  description: z.string().describe("Two sentences about the store, from the source text"),
  city: z.string().nullable().describe("City or region if stated, else null"),
  house_offer: z.string().describe("A plausible standing offer for returning customers, e.g. '10% off for returning customers'"),
  products: z.array(z.object({
    name: z.string(), price: z.number().describe("Price in USD as a number; estimate from context if missing"),
    category: z.string(), image_url: z.string().nullable(), product_url: z.string().nullable(),
  })).describe("Up to 12 real products found in the text. Use only image URLs from the provided list."),
  theme: z.object({
    wall: HEX.describe("Main wall colour of the shop room, dark enough for cream text"),
    floorA: HEX.describe("Light floor tile colour"), floorB: HEX.describe("Second, slightly different light floor tile colour"),
    accent: HEX.describe("Brand accent colour"), trim: HEX.describe("Wood or trim colour for shelves and counter"),
    vibe: z.string().describe("3-6 words describing the room's look"),
  }).describe("A room palette that matches the brand"),
});

async function structureWithClaude(g: Gathered, url: URL, platform: Platform): Promise<Structured> {
  const client = new Anthropic();
  const res = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(ShopSchema) },
    system: "You turn scraped storefront text into a shop profile for a retail simulation. Use only facts from the source text for names, products and prices; when a price is missing, estimate a realistic one. Pick a room palette that fits the brand.",
    messages: [{
      role: "user",
      content: `Storefront: ${url.href} (${PLATFORM_NAME[platform]})\n\n` +
        (g.answer ? `Search summary:\n${g.answer}\n\n` : "") +
        `Image URLs found on the page:\n${g.images.join("\n") || "(none)"}\n\nSource text:\n${g.text}`,
    }],
  });
  if (res.stop_reason === "refusal") throw new HttpError(422, "The model declined to read this store.");
  const p = res.parsed_output;
  if (!p) throw new Error("Claude returned no parsable output");
  const allowed = new Set(g.images);
  return {
    merchant: { name: p.name, category: p.category, tagline: p.tagline, description: p.description, city: p.city, website: url.hostname, house_offer: p.house_offer },
    products: p.products.slice(0, 12).map(x => ({ ...x, price: Math.max(1, Math.round(x.price)), image_url: x.image_url && allowed.has(x.image_url) ? x.image_url : null })),
    theme: p.theme,
  };
}

// ---------------------------------------------------------------- 2b. structure with a ZooWork agent (no Anthropic key needed)
const IMPORTER_SOUL = "You turn scraped storefront text into a shop profile for a retail simulation. Use only facts from the source text for names, products and prices; when a price is missing, estimate a realistic one in USD. Choose a room palette that fits the brand. Reply with one JSON object only.";

async function structureWithZooWork(g: Gathered, url: URL, platform: Platform): Promise<Structured> {
  const reply = await askUtilityAgent("importer", IMPORTER_SOUL,
    `Storefront: ${url.href} (${PLATFORM_NAME[platform]})\n\n` + (g.answer ? `Search summary:\n${g.answer}\n\n` : "") +
    `Image URLs found on the page (use only these for image_url):\n${g.images.join("\n") || "(none)"}\n\nSource text:\n${g.text.slice(0, 60_000)}\n\n` +
    `Reply with one JSON object: {"name": brand name, "category": what the store sells in 2-4 words, "tagline": one line in the store's voice, ` +
    `"description": two sentences, "city": city or null, "house_offer": a standing offer for returning customers, ` +
    `"products": up to 12 real products [{"name", "price": number in USD, "category", "image_url": one of the listed URLs or null, "product_url": URL or null}], ` +
    `"theme": {"wall", "floorA", "floorB", "accent", "trim": hex colours like #2F4A3C (wall dark enough for cream text, floors light), "vibe": 3-6 words}}`);
  const m = reply.match(/\{[\s\S]*\}/);
  const parsed = ShopSchema.safeParse(m ? JSON.parse(m[0]) : null);
  if (!parsed.success) throw new Error("the importer agent's reply didn't match the shop schema");
  const p = parsed.data, allowed = new Set(g.images);
  return {
    merchant: { name: p.name, category: p.category, tagline: p.tagline, description: p.description, city: p.city, website: url.hostname, house_offer: p.house_offer },
    products: p.products.slice(0, 12).map(x => ({ ...x, price: Math.max(1, Math.round(x.price)), image_url: x.image_url && allowed.has(x.image_url) ? x.image_url : null })),
    theme: p.theme,
  };
}

// ---------------------------------------------------------------- 2c. structure with rules (no model available)
const PALETTES: [RegExp, Theme][] = [
  [/beauty|skin|cosmetic|makeup|fragrance|lip|serum/i, { wall: "#7E4A5A", floorA: "#F6E8EA", floorB: "#FBF2F3", accent: "#D98FA0", trim: "#B98A84", vibe: "soft blush boutique" }],
  [/electronic|tech|gadget|phone|laptop|headphone|charger|audio/i, { wall: "#1F2A44", floorA: "#E3E7EF", floorB: "#F1F3F8", accent: "#3B82C4", trim: "#6B7A90", vibe: "cool modern tech store" }],
  [/kitchen|home|decor|ceramic|candle|furniture|bedding|mug/i, { wall: "#6B4F3A", floorA: "#F1E6D8", floorB: "#F8F1E7", accent: "#C47A5A", trim: "#9C7350", vibe: "warm homeware studio" }],
  [/coffee|tea|snack|food|chocolate|sauce|spice|bakery/i, { wall: "#7A3E2A", floorA: "#F5E9DA", floorB: "#FBF3E8", accent: "#D9A441", trim: "#8A5A3B", vibe: "cosy pantry shop" }],
  [/toy|kid|baby|game|puzzle/i, { wall: "#2E5E8C", floorA: "#FFF3D6", floorB: "#FFF9EA", accent: "#E86A4A", trim: "#C9A15A", vibe: "bright playful toy shop" }],
  [/sport|fitness|outdoor|yoga|gym|bike|camp/i, { wall: "#24543F", floorA: "#E6EFE8", floorB: "#F2F7F3", accent: "#E07B39", trim: "#8A6A44", vibe: "fresh outdoor outfitter" }],
  [/book|stationery|paper|pen|journal/i, { wall: "#4A3B5C", floorA: "#EEE8DD", floorB: "#F7F2EA", accent: "#B5654A", trim: "#7E5A3C", vibe: "quiet bookshop" }],
  [/jewel|ring|necklace|watch/i, { wall: "#2B2A3A", floorA: "#EFEBE4", floorB: "#F8F5F0", accent: "#C9A44C", trim: "#8E7A5A", vibe: "polished jewellery counter" }],
  [/pet|dog|cat/i, { wall: "#3E5A4A", floorA: "#F3EEDF", floorB: "#FAF6EC", accent: "#D27D4E", trim: "#9C7350", vibe: "friendly pet shop" }],
  [/apparel|clothing|fashion|dress|shirt|shoe|sneaker|jacket|wear/i, { wall: "#2F4A3C", floorA: "#EFE7D6", floorB: "#F7F1E4", accent: "#A45F6A", trim: "#8A6644", vibe: "calm apparel boutique" }],
];
const DEFAULT_THEME: Theme = { wall: "#2F4A3C", floorA: "#EFE7D6", floorB: "#F7F1E4", accent: "#A45F6A", trim: "#8A6644", vibe: "classic corner shop" };

function themeFor(text: string): { theme: Theme; category: string } {
  let best: [Theme, number, string] = [DEFAULT_THEME, 0, "General store"];
  for (const [re, t] of PALETTES) {
    const n = (text.match(new RegExp(re.source, "gi")) || []).length;
    if (n > best[1]) best = [t, n, re.source.split("|")[0].replace(/^\w/, c => c.toUpperCase())];
  }
  return { theme: best[0], category: best[2] };
}

type Structured = Omit<ImportPreview, "url" | "platform" | "method" | "sources" | "warnings">;

function structureWithRules(g: Gathered, url: URL, platform: Platform): Structured {
  const lines = g.text.split("\n").map(l => l.replace(/[*_#>`]/g, "").trim()).filter(Boolean);
  // name: first heading, else the handle in the URL, else the domain
  const heading = g.text.match(/^#\s+(.{3,60})$/m)?.[1]?.replace(/[|–-].*$/, "").trim();
  const handle = url.pathname.split("/").filter(Boolean).find(p => p.startsWith("@"))?.slice(1);
  const domainName = url.hostname.replace(/^www\./, "").split(".")[0];
  const usableHeading = heading && !/^(amazon|tiktok|etsy|shopify)\b|results for|sign in|page not found/i.test(heading) ? heading : undefined;
  const name = (usableHeading || handle || domainName)
    .replace(/[-_.]/g, " ").replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60);
  // products: a line with a $ price, or a markdown link followed by a price
  const products: ImportedProduct[] = [];
  const seen = new Set<string>();
  const PRICE = /\$\s?(\d{1,4}(?:[.,]\d{2})?)/;
  for (let i = 0; i < lines.length && products.length < 12; i++) {
    const m = lines[i].match(PRICE) ?? lines[i + 1]?.match(PRICE);
    if (!m) continue;
    const link = lines[i].match(/\[([^\]]{4,90})\]\((https?:[^)]+)\)/);
    let pname = (link?.[1] ?? lines[i].replace(PRICE, "").replace(/\(https?:[^)]*\)/g, "")).replace(/[[\]()|]/g, " ").replace(/\s+/g, " ").trim();
    if (pname.length < 4 || pname.length > 90 || /shipping|subtotal|total|off|save|coupon|cart|reviews?$/i.test(pname)) continue;
    pname = pname.slice(0, 70);
    if (seen.has(pname.toLowerCase())) continue;
    seen.add(pname.toLowerCase());
    products.push({ name: pname, price: Math.max(1, Math.round(parseFloat(m[1].replace(",", ".")))), category: "", image_url: g.images[products.length] ?? null, product_url: link?.[2] ?? null });
  }
  const { theme, category } = themeFor(g.text);
  products.forEach(p => (p.category = category));
  const desc = lines.find(l => l.length > 80 && l.length < 300 && !PRICE.test(l)) ?? `${name} sells on ${PLATFORM_NAME[platform]}.`;
  return {
    merchant: { name, category, tagline: desc.split(/(?<=\.)\s/)[0].slice(0, 120), description: desc, city: null, website: url.hostname, house_offer: "10% off for returning customers" },
    products, theme,
  };
}

// platform touches: TikTok gets neon trim, Amazon gets its orange
function platformTouch(t: Theme, platform: Platform): Theme {
  if (platform === "tiktok") return { ...t, accent: "#FE2C55", trim: t.trim, vibe: t.vibe + ", TikTok neon" };
  if (platform === "amazon") return { ...t, accent: "#FF9900", vibe: t.vibe + ", Amazon orange" };
  return t;
}

// ---------------------------------------------------------------- competitor price for the promo engine
// Search the web for what the same kind of product sells for elsewhere; median of the prices found near ours.
export async function competitorPrice(product: string, listPrice: number, ownSite?: string | null): Promise<{ price: number; count: number; ms: number; sources: string[] } | null> {
  if (!tavilyConfigured()) return null;
  const t0 = Date.now();
  type SearchRes = { results: { url: string; content: string }[] };
  const s = await tavily<SearchRes>("/search", { query: `${product} price`, search_depth: "basic", max_results: 8 });
  const own = ownSite?.replace(/^www\./, "");
  const prices: number[] = [], sources = new Set<string>();
  for (const r of s.results) {
    if (own && r.url.includes(own)) continue;
    for (const m of r.content.matchAll(/\$\s?(\d{1,4}(?:[.,]\d{2})?)/g)) {
      const v = parseFloat(m[1].replace(",", "."));
      if (v >= listPrice * 0.35 && v <= listPrice * 2.5) { prices.push(v); sources.add(new URL(r.url).hostname.replace(/^www\./, "")); }
    }
  }
  if (prices.length < 2) return null;
  prices.sort((a, b) => a - b);
  return { price: Math.round(prices[Math.floor(prices.length / 2)]), count: prices.length, ms: Date.now() - t0, sources: [...sources].slice(0, 4) };
}

// ---------------------------------------------------------------- entry point
export async function previewImport(raw: string): Promise<ImportPreview> {
  const { url, platform } = detectPlatform(raw);
  const g = await gather(url, platform);
  let method: ImportPreview["method"] = "rules";
  let s: Structured;
  if (claudeConfigured()) {
    try { s = await structureWithClaude(g, url, platform); method = "claude"; }
    catch (e) {
      if (e instanceof HttpError) throw e;
      console.warn("[import] Claude structuring failed, using rules:", (e as Error).message);
      g.warnings.push("Claude couldn't structure the store, so simpler rule-based parsing was used.");
      s = structureWithRules(g, url, platform);
    }
  } else if (zooworkLive()) {
    try { s = await structureWithZooWork(g, url, platform); method = "zoowork"; }
    catch (e) {
      if (e instanceof HttpError) throw e;
      console.warn("[import] ZooWork structuring failed, using rules:", (e as Error).message);
      g.warnings.push("The ZooWork importer couldn't structure the store, so simpler rule-based parsing was used.");
      s = structureWithRules(g, url, platform);
    }
  } else {
    s = structureWithRules(g, url, platform);
    g.warnings.push("Parsed with simple rules. Set ZOOWORK_API_KEY or ANTHROPIC_API_KEY on the server for a more accurate catalog and theme.");
  }
  if (!s.products.length) g.warnings.push("No products with prices were found. The shop will start with an empty catalog; you can still open it.");
  return { url: url.href, platform, method, merchant: s.merchant, products: s.products, theme: platformTouch(s.theme, platform), sources: g.sources, warnings: g.warnings };
}
