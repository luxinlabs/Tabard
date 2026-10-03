// Goods shelf: stock and sales per item, every transaction, and fraud screening by the @returns agent.
import { Fragment, useState } from "react";
import { useAction, useM, money, hhmm, type Product, type Txn } from "../api";
import { Cites, ErrorNote, RiskPill, Source, StatusPill } from "../ui";

export function GoodsPanel({ mid }: { mid: number }) {
  const products = useM<Product[]>(mid, ["products"], "/products");
  const all = useM<Txn[]>(mid, ["transactions"], "/transactions");
  const [sel, setSel] = useState<string | null>(null);
  const scan = useAction<void, { screened: number; waiting: number }>(mid, () => ({ path: "/scan" }));
  const flaggedFirst = products.data?.find(p => p.to_review > 0)?.sku;
  const sku = sel ?? flaggedFirst ?? products.data?.[0]?.sku ?? null;
  const toReview = all.data?.filter(t => t.flags.length && ["Needs review", "Held"].includes(t.status)).length ?? 0;
  const blocked = all.data?.filter(t => t.status === "Blocked").length ?? 0;
  const maxStock = Math.max(1, ...(products.data ?? []).map(p => p.stock));

  return (
    <>
      <div className="scanbar">
        <button className="btn primary" onClick={() => scan.mutate()} disabled={scan.isPending}>{scan.isPending ? "Scanning…" : "Scan all goods with @returns"}</button>
        <span className="note">{all.data?.length ?? 0} recent transactions · <b style={{ color: "var(--warn)" }}>{toReview} need review</b> · <b style={{ color: "var(--bad)" }}>{blocked} blocked</b></span>
        {scan.data && <span className="pill p-forest">Screened {scan.data.screened}, {scan.data.waiting} need you</span>}
      </div>
      <ErrorNote error={scan.error} />
      <div className="grid2">
        <div className="panel"><div className="panel-h"><span className="label">Goods</span><span className="note">Click a row to see its transactions</span></div>
          <div className="tbl"><table>
            <thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Sold</th><th>Fraud</th></tr></thead>
            <tbody>
              {products.data?.map(p => {
                const low = p.stock < 6;
                return (
                  <tr key={p.sku} className={`row ${p.sku === sku ? "sel" : ""}`} tabIndex={0} onClick={() => setSel(p.sku)} onKeyDown={e => e.key === "Enter" && setSel(p.sku)}>
                    <td>{p.image_url ? <img className="thumb inline" src={p.image_url} alt="" referrerPolicy="no-referrer" /> : <span className="swatch" style={{ background: p.swatch }} />}{p.name}<span className="sub mono">{p.sku}</span></td>
                    <td className="num">{money(p.price)}</td>
                    <td className="num">{p.stock}{low && <> <span className="pill p-warn">Low</span></>}<div className="meter"><i style={{ width: `${(p.stock / maxStock) * 100}%`, background: low ? "var(--warn)" : "var(--forest)" }} /></div></td>
                    <td className="num">{p.sold}</td>
                    <td>{p.to_review > 0 && <span className="pill p-warn">{p.to_review} to review</span>} {p.blocked > 0 && <span className="pill p-bad">{p.blocked} blocked</span>}{!p.to_review && !p.blocked && <span className="pill p-good">Clean</span>}</td>
                  </tr>
                );
              })}
              {products.data?.length === 0 && <tr><td colSpan={5} className="note">No products yet. Add a catalog on the store profile page.</td></tr>}
            </tbody>
          </table></div>
        </div>
        {sku && <Detail mid={mid} product={products.data?.find(p => p.sku === sku)} sku={sku} />}
      </div>
    </>
  );
}

function Detail({ mid, product, sku }: { mid: number; product?: Product; sku: string }) {
  const txs = useM<Txn[]>(mid, ["transactions", sku], `/transactions?sku=${encodeURIComponent(sku)}`);
  const screen = useAction<number>(mid, id => ({ path: `/transactions/${id}/screen` }));
  const decide = useAction<{ id: number; status: string }>(mid, b => ({ path: `/transactions/${b.id}/decision`, body: { status: b.status } }));
  if (!product) return null;
  return (
    <div className="panel">
      <div className="panel-h"><span><b>{product.name}</b> <span className="note">· {product.category} · margin {Math.round(((product.price - product.cost) / product.price) * 100)}%</span></span><span className="label">{txs.data?.length ?? 0} transactions</span></div>
      <ErrorNote error={screen.error || decide.error} />
      <div className="tbl"><table>
        <thead><tr><th>Txn</th><th>Buyer agent</th><th>Amount</th><th>Risk</th><th>Status</th></tr></thead>
        <tbody>
          {txs.data?.map(t => (
            <Fragment key={t.id}>
              <tr>
                <td className="mono">{t.code}<span className="sub">{hhmm(t.created_at)} · {t.type}</span></td>
                <td><span className="mono" style={{ fontSize: 12 }}>{t.buyer_handle}</span><span className="sub">{t.customer_name ?? "No linked customer"} · qty {t.qty}</span></td>
                <td className="num">{money(t.amount)}</td>
                <td>{t.flags.length ? <RiskPill risk={t.risk} /> : <span className="pill p-good">Clean</span>}</td>
                <td><StatusPill status={t.status} /></td>
              </tr>
              {t.flags.length > 0 && <tr><td colSpan={5} style={{ paddingTop: 0 }}>
                <div className="why">{t.flag_labels.map(f => <span key={f}>• {f}</span>)}</div>
                {t.screen && <div className="verdict"><b>@returns:</b> {t.screen.text} <Source source={t.screen.source} /><Cites cites={t.screen.cites} /></div>}
                {["Needs review", "Held"].includes(t.status) && <div className="acts">
                  {!t.screen && <button className="btn" disabled={screen.isPending} onClick={() => screen.mutate(t.id)}>Screen with @returns</button>}
                  {t.type === "refund" ? <>
                    <button className="btn primary" onClick={() => decide.mutate({ id: t.id, status: "Exchange offered" })}>Offer exchange</button>
                    <button className="btn" onClick={() => decide.mutate({ id: t.id, status: "Refunded" })}>Refund</button>
                    <button className="btn danger" onClick={() => decide.mutate({ id: t.id, status: "Denied" })}>Deny</button>
                  </> : <>
                    <button className="btn primary" onClick={() => decide.mutate({ id: t.id, status: "Released" })}>Release</button>
                    <button className="btn danger" onClick={() => decide.mutate({ id: t.id, status: "Blocked" })}>Cancel and block</button>
                  </>}
                </div>}
              </td></tr>}
            </Fragment>
          ))}
          {txs.data?.length === 0 && <tr><td colSpan={5} className="note">No transactions yet.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}
