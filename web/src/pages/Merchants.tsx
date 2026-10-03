// Pick a shop, or open a new one.
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ago, money, themeVars, useHealth, PLATFORM_LABEL, type ImportPreview, type Merchant } from "../api";
import { ErrorNote, Thinking } from "../ui";

export default function Merchants() {
  const list = useQuery({ queryKey: ["merchants"], queryFn: () => api<Merchant[]>("/merchants") });
  const [creating, setCreating] = useState(false);
  return (
    <div className="page">
      <header className="pagehead">
        <div><Link to="/" className="brandlink"><b className="logo">Tabard</b></Link><p className="note">Each shop has its own agents, catalog, customers and history.</p></div>
        <button className="btn primary" onClick={() => setCreating(c => !c)}>{creating ? "Cancel" : "+ Open a new shop"}</button>
      </header>
      {creating && <NewMerchant onDone={() => setCreating(false)} />}
      <ErrorNote error={list.error} />
      <div className="shops">
        {list.data?.map(m => (
          <article className="shopcard" key={m.id}>
            <div className="shopcard-h"><h2>{m.name}</h2><span className="pill p-forest">{m.plan}</span></div>
            <p className="note">{m.category}{m.city ? ` · ${m.city}` : ""}</p>
            {m.tagline && <p className="tagline">{m.tagline}</p>}
            <dl className="mini">
              <div><dt>Owner</dt><dd>{m.owner_name || "—"}</dd></div>
              <div><dt>Products</dt><dd className="num">{m.product_count}</dd></div>
              <div><dt>Customers</dt><dd className="num">{m.customer_count}</dd></div>
              <div><dt>Needs you</dt><dd className="num" style={{ color: m.waiting ? "var(--bad)" : undefined }}>{m.waiting}</dd></div>
            </dl>
            <p className="note">Last activity {ago(m.last_activity)}</p>
            <div className="acts">
              <Link className="btn primary" to={`/m/${m.id}`}>Enter the shop</Link>
              <Link className="btn" to={`/m/${m.id}/profile`}>Store profile</Link>
            </div>
          </article>
        ))}
        {list.data?.length === 0 && <p className="note">No shops yet. Open the first one.</p>}
      </div>
    </div>
  );
}

export function NewMerchant({ onDone, onCreated }: { onDone: () => void; onCreated?: (m: Merchant) => void }) {
  const [mode, setMode] = useState<"link" | "manual">("link");
  return (
    <div className="panel pad newshop">
      <div className="newshop-h">
        <h2 className="formtitle">Open a new shop</h2>
        <span className="seg" role="group" aria-label="How to start">
          <button type="button" aria-pressed={mode === "link"} onClick={() => setMode("link")}>From a store link</button>
          <button type="button" aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>Fill in by hand</button>
        </span>
      </div>
      {mode === "link" ? <ImportFromLink onDone={onDone} onCreated={onCreated} /> : <ManualForm onDone={onDone} onCreated={onCreated} />}
    </div>
  );
}

function useCreated(onDone: () => void, onCreated?: (m: Merchant) => void) {
  const qc = useQueryClient();
  const nav = useNavigate();
  return (m: Merchant) => { qc.invalidateQueries({ queryKey: ["merchants"] }); onDone(); if (onCreated) onCreated(m); else nav(`/m/${m.id}/profile`); };
}

// Paste a TikTok Shop, Amazon, Shopify or any store link. Tavily reads it; the server designs the room from what it finds.
function ImportFromLink({ onDone, onCreated }: { onDone: () => void; onCreated?: (m: Merchant) => void }) {
  const health = useHealth();
  const done = useCreated(onDone, onCreated);
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState<ImportPreview | null>(null);
  const preview = useMutation({ mutationFn: (u: string) => api<ImportPreview>("/import/preview", { body: { url: u } }), onSuccess: setDraft });
  const create = useMutation({ mutationFn: (p: ImportPreview) => api<Merchant>("/import/create", { body: p }), onSuccess: done });
  const edit = (k: keyof ImportPreview["merchant"], v: string) => setDraft(d => d && { ...d, merchant: { ...d.merchant, [k]: v } });
  const dropProduct = (i: number) => setDraft(d => d && { ...d, products: d.products.filter((_, j) => j !== i) });

  return (
    <div className="importer">
      <form className="import-row" onSubmit={e => { e.preventDefault(); if (url.trim()) { setDraft(null); preview.mutate(url.trim()); } }}>
        <input className="input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@yourshop · amazon.com/stores/… · yourstore.com" aria-label="Store link" />
        <button className="btn primary" disabled={preview.isPending || !url.trim()}>{preview.isPending ? "Reading the store…" : "Read the store"}</button>
      </form>
      <p className="note" style={{ margin: 0 }}>
        Tavily reads the page and, for TikTok, Amazon or pages without prices, also searches the web. A ZooWork agent then builds the profile, catalog and a room that matches the brand. You can review everything before the shop is created.
        {health.data && !health.data.tavily && <b style={{ color: "var(--warn)" }}> TAVILY_API_KEY isn't set on the server yet, so importing won't work until it is.</b>}
      </p>
      {preview.isPending && <Thinking>Tavily is reading the store. This can take up to a minute…</Thinking>}
      <ErrorNote error={preview.error} />

      {draft && (
        <div className="import-preview" style={themeVars(draft.theme) as React.CSSProperties}>
          <div className="mini-room" aria-label="Room preview">
            <div className="mr-wall"><span className="mr-name">{draft.merchant.name}</span><span className="mr-sign">{PLATFORM_LABEL[draft.platform]}</span></div>
            <div className="mr-shelf">{draft.products.slice(0, 8).map((p, i) => p.image_url ? <img key={i} src={p.image_url} alt="" referrerPolicy="no-referrer" /> : <i key={i} />)}</div>
            <div className="mr-floor" />
          </div>
          <div className="import-meta">
            <span className="pill p-forest">{PLATFORM_LABEL[draft.platform]}</span>
            <span className="pill p-neutral">{draft.method === "claude" ? "Structured by Claude" : draft.method === "zoowork" ? "Structured by ZooWork agent" : "Parsed with rules"}</span>
            <span className="pill p-rose">Room: {draft.theme.vibe}</span>
            <span className="swatches">{(["wall", "accent", "trim", "floorA"] as const).map(k => <i key={k} style={{ background: draft.theme[k] }} title={k} />)}</span>
          </div>
          {draft.warnings.map(w => <div className="guard stop" key={w}>{w}</div>)}
          <div className="form">
            <label>Shop name<input className="input" value={draft.merchant.name} onChange={e => edit("name", e.target.value)} /></label>
            <label>What you sell<input className="input" value={draft.merchant.category} onChange={e => edit("category", e.target.value)} /></label>
            <label className="wide">Tagline<input className="input" value={draft.merchant.tagline} onChange={e => edit("tagline", e.target.value)} /></label>
            <label className="wide">House offer<input className="input" value={draft.merchant.house_offer} onChange={e => edit("house_offer", e.target.value)} /></label>
          </div>
          <div className="tbl"><table>
            <thead><tr><th></th><th>Product found</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {draft.products.map((p, i) => (
                <tr key={i}>
                  <td style={{ width: 44 }}>{p.image_url ? <img className="thumb" src={p.image_url} alt="" referrerPolicy="no-referrer" /> : <span className="thumb" />}</td>
                  <td>{p.name}<span className="sub">{p.category}</span></td>
                  <td className="num">{money(p.price)}</td>
                  <td><button className="linkbtn" onClick={() => dropProduct(i)}>Remove</button></td>
                </tr>
              ))}
              {!draft.products.length && <tr><td colSpan={4} className="note">No products found.</td></tr>}
            </tbody>
          </table></div>
          <p className="note">Read from: {draft.sources.map((s, i) => <span key={s.url}>{i ? ", " : ""}<a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a></span>)}. Customers in the simulation are sample shoppers; the storefront doesn't reveal real ones.</p>
          <ErrorNote error={create.error} />
          <button className="btn primary" disabled={create.isPending || !draft.merchant.name.trim()} onClick={() => create.mutate(draft)}>{create.isPending ? "Building the shop…" : `Create ${draft.merchant.name || "the shop"}`}</button>
        </div>
      )}
    </div>
  );
}

function ManualForm({ onDone, onCreated }: { onDone: () => void; onCreated?: (m: Merchant) => void }) {
  const done = useCreated(onDone, onCreated);
  const create = useMutation({ mutationFn: (body: Record<string, unknown>) => api<Merchant>("/merchants", { body }), onSuccess: done });
  return (
    <form onSubmit={e => { e.preventDefault(); create.mutate(Object.fromEntries(new FormData(e.currentTarget))); }}>
      <div className="form">
        <label>Shop name<input className="input" name="name" required maxLength={80} placeholder="e.g. Fern & Field" /></label>
        <label>What you sell<input className="input" name="category" placeholder="e.g. Plants and planters" /></label>
        <label>Owner name<input className="input" name="owner_name" /></label>
        <label>Owner email<input className="input" name="owner_email" type="email" /></label>
        <label>City<input className="input" name="city" /></label>
        <label>Website<input className="input" name="website" placeholder="example.com" /></label>
        <label>Start with
          <select className="input" name="sample" defaultValue="apparel">
            <option value="apparel">Sample apparel catalog and customers</option>
            <option value="ceramics">Sample ceramics catalog and customers</option>
            <option value="none">An empty shop</option>
          </select>
        </label>
      </div>
      <ErrorNote error={create.error} />
      <button className="btn primary" disabled={create.isPending}>{create.isPending ? "Opening…" : "Open shop"}</button>
    </form>
  );
}
