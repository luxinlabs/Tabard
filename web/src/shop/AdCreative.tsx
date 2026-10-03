// A billboard ad. Shows the ZooWork designer's artwork when it exists; until then, a laid-out ad built from the offer.
import { money, type Merchant, type Product, type Promo } from "../api";

export function AdCreative({ promo, merchant, product, size = "card", onRetry }: {
  promo: Promo; merchant: Merchant; product?: Product; size?: "card" | "page"; onRetry?: () => void;
}) {
  if (promo.image_status === "ready" && promo.image_url) {
    return <figure className={`ad ad-${size} ad-art`}><img src={promo.image_url} alt={`${promo.headline}. ${promo.body}`} /></figure>;
  }
  return (
    <figure className={`ad ad-${size}`} aria-label={`${promo.headline}. ${promo.body}`}>
      <div className="ad-copy">
        <span className="ad-brand">{merchant.name}</span>
        <span className="ad-badge">{promo.pct}% off</span>
        <h3 className="ad-headline">{promo.headline}</h3>
        <p className="ad-body">{promo.body}</p>
        <div className="ad-price"><b>{money(promo.price)}</b><s>{money(promo.list)}</s></div>
        <span className="ad-ends">{promo.segment} · ends {promo.ends}</span>
      </div>
      <div className="ad-visual" style={{ background: product?.swatch }}>
        {product?.image_url ? <img src={product.image_url} alt="" referrerPolicy="no-referrer" /> : <span className="ad-initial">{promo.product.slice(0, 1)}</span>}
        <span className="ad-product">{promo.product}</span>
      </div>
      {promo.image_status === "designing" && <figcaption className="ad-status"><span className="spin" /> ZooWork designer is painting the artwork. About two minutes.</figcaption>}
      {promo.image_status === "failed" && <figcaption className="ad-status bad">Artwork failed: {promo.image_note}{onRetry && <button className="linkbtn" onClick={onRetry}>Try again</button>}</figcaption>}
    </figure>
  );
}
