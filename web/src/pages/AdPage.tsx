// The public page for one offer: what a shopper (or a shopper's agent) sees, plus how the ad was made.
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api, useAction, useM, money, hhmm, parseTheme, themeVars, type Merchant, type Product, type Promo } from "../api";
import { AdCreative } from "../shop/AdCreative";
import { Cites, ErrorNote, Source } from "../ui";

export default function AdPage() {
  const { mid: midRaw, pid: pidRaw } = useParams();
  const mid = Number(midRaw), pid = Number(pidRaw);
  const merchant = useM<Merchant>(mid, ["merchant"], "");
  // poll while the designer is painting; this page isn't on the shop's live stream
  const promo = useQuery({
    queryKey: [mid, "promos", pid], queryFn: () => api<Promo>(`/merchants/${mid}/promos/${pid}`),
    refetchInterval: q => (q.state.data?.image_status === "designing" ? 5000 : false),
  });
  const products = useM<Product[]>(mid, ["products"], "/products");
  const artwork = useAction<void>(mid, () => ({ path: `/promos/${pid}/artwork` }));
  const p = promo.data, m = merchant.data;

  if (promo.error || merchant.error) return <div className="page"><ErrorNote error={promo.error || merchant.error} /><Link to="/">Back to Tabard</Link></div>;
  if (!p || !m) return <div className="page note">Loading…</div>;
  const product = products.data?.find(x => x.sku === p.sku);
  // what a buyer agent receives in its room when it asks about this product
  const payload = { type: "offer", offer_id: `of_${p.id}`, merchant: m.name, sku: p.sku, product: p.product, price: p.price, list: p.list, currency: m.currency, audience: p.segment, ends: p.ends };

  return (
    <main className="adpage" style={themeVars(parseTheme(m.theme)) as React.CSSProperties}>
      <nav className="adpage-nav"><Link to={`/m/${mid}`}>← Back to {m.name}</Link>
        <span className={`pill ${p.status === "live" ? "p-good" : p.status === "draft" ? "p-warn" : "p-neutral"}`}>{p.status === "live" ? "On the billboard now" : p.status === "draft" ? "Draft, not published" : "Past offer"}</span></nav>

      <AdCreative promo={p} merchant={m} product={product} size="page" onRetry={() => artwork.mutate()} />

      <header className="adpage-head">
        <span className="eyebrow">{m.name} · {m.category}</span>
        <h1>{p.headline}</h1>
        <p className="lede">{p.body}</p>
        <div className="adpage-price"><b>{money(p.price)}</b><s>{money(p.list)}</s><span className="pill p-rose">{p.pct}% off</span></div>
      </header>

      <section className="adpage-grid">
        <div className="panel pad">
          <h2>Offer details</h2>
          <dl className="specs">
            <div><dt>Product</dt><dd>{p.product} <span className="mono note">{p.sku}</span></dd></div>
            <div><dt>Price</dt><dd>{money(p.price)} (list {money(p.list)})</dd></div>
            <div><dt>Who it's for</dt><dd>{p.segment}</dd></div>
            <div><dt>Ends</dt><dd>{p.ends}</dd></div>
            {product && <div><dt>In stock</dt><dd>{product.stock}</dd></div>}
            <div><dt>Seen by buyer agents</dt><dd>{p.seen}</dd></div>
          </dl>
        </div>
        <div className="panel pad">
          <h2>For shopping agents</h2>
          <p className="note">Muse, Dots and other buyer agents receive this offer as structured data in their room, so they can act on it without reading the image.</p>
          <pre className="code">{JSON.stringify(payload, null, 2)}</pre>
        </div>
      </section>

      <section className="panel pad adpage-how">
        <h2>How this ad was made</h2>
        <ol className="howsteps">
          <li><b>The owner's prompt</b><span>"{p.prompt}"</span></li>
          <li><b>{p.source === "zoowork" ? "ZooWork promo agent" : "Simulator (ZooWork not used)"}</b><span>{p.agent_text}</span><span className="howmeta"><Source source={p.source} /><Cites cites={p.cites} /></span></li>
          <li><b>Shop rules</b><span>{p.margin}% margin after the discount. {p.needs_approval ? `${p.pct}% is above the ${m.discount_cap}% limit, so the owner had to approve it.` : `Inside the ${m.discount_cap}% limit, so no approval was needed.`}</span></li>
          <li><b>Artwork</b><span>{p.image_status === "ready" ? `Painted by the same ZooWork agent with its designer skill${p.image_note ? ` (${p.image_note.replace(/^designer skill · /, "took ")})` : ""}.`
            : p.image_status === "designing" ? "The ZooWork designer skill is painting it now."
            : p.image_status === "failed" ? `The designer couldn't finish: ${p.image_note}`
            : "No artwork: the offer was drafted without ZooWork."}</span>
            {p.source === "zoowork" && p.image_status !== "designing" && <button className="linkbtn" onClick={() => artwork.mutate()}>{p.image_status === "ready" ? "Paint a new version" : "Paint the artwork"}</button>}</li>
          {p.published_at && <li><b>Published</b><span>On the billboard at {hhmm(p.published_at)}.</span></li>}
        </ol>
        <ErrorNote error={artwork.error} />
      </section>
    </main>
  );
}
