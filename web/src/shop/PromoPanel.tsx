// Billboard station: prompt the @promo agent, review the draft, publish it to the billboard.
import { useState } from "react";
import { useAction, useM, money, type Merchant, type Promo } from "../api";
import { Cites, ErrorNote, Source, Thinking } from "../ui";

const PRESETS: Record<string, string[]> = {
  default: [
    "15% off our best seller for returning customers this weekend",
    "Clear slow stock before the season ends, 25% off",
    "Win back lapsed customers with 10% off",
    "Gift idea for Gold members, 12% off today",
  ],
};

export function PromoPanel({ m, onPublished }: { m: Merchant; onPublished: (p: Promo) => void }) {
  const promos = useM<Promo[]>(m.id, ["promos"], "/promos");
  const [prompt, setPrompt] = useState(PRESETS.default[0]);
  const [draft, setDraft] = useState<Promo | null>(null);
  const generate = useAction<string, Promo>(m.id, p => ({ path: "/promos", body: { prompt: p } }));
  const publish = useAction<number>(m.id, id => ({ path: `/promos/${id}/publish` }));
  const live = promos.data?.find(p => p.status === "live");

  const run = () => generate.mutate(prompt.trim() || PRESETS.default[0], { onSuccess: setDraft });

  return (
    <div className="grid2">
      <div className="panel">
        <div className="panel-h"><span className="label">Prompt the promo engine</span><span className="pill p-rose">@promo · ZooWork agent</span></div>
        <div className="pad">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the offer you want, in plain words" aria-label="Offer prompt" />
          <div className="presets">{PRESETS.default.map(p => <button key={p} onClick={() => setPrompt(p)}>{p.length > 46 ? p.slice(0, 44) + "…" : p}</button>)}</div>
          <button className="btn primary" onClick={run} disabled={generate.isPending}>{generate.isPending ? "Drafting…" : "Generate offer"}</button>
          <p className="note" style={{ marginTop: 12 }}>The agent drafts copy, picks the price, checks margin and a competitor price. Discounts over {m.discount_cap}% need your approval before buyer agents see them.</p>
        </div>
        <div className="panel-h" style={{ borderTop: "1px solid var(--line)" }}><span className="label">On the billboard now</span></div>
        <div className="pad">
          {live
            ? <><b>{live.headline}</b><div className="note">{live.body}</div><div className="note" style={{ marginTop: 6 }}>Buyer agents that received it: <b className="num">{live.seen}</b></div></>
            : <span className="note">The house offer: {m.house_offer}. Generate a new one to replace it.</span>}
        </div>
        {!!promos.data?.filter(p => p.status === "retired").length && <>
          <div className="panel-h" style={{ borderTop: "1px solid var(--line)" }}><span className="label">Past offers</span></div>
          <ul className="feed">{promos.data.filter(p => p.status === "retired").slice(0, 5).map(p => <li key={p.id}><span className="t">{p.pct}%</span><span>{p.headline} <span className="note">· seen by {p.seen}</span></span></li>)}</ul>
        </>}
      </div>

      <div className="panel">
        <div className="panel-h"><span className="label">Draft</span>{draft && <Source source={draft.source} />}</div>
        <div className="pad">
          <ErrorNote error={generate.error || publish.error} />
          {generate.isPending ? <Thinking>@promo is drafting an offer…</Thinking>
            : !draft ? <div className="thinking" style={{ flexDirection: "column" }}><b style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--forest)" }}>Write a prompt, get a billboard.</b><span>The draft appears here.</span></div>
            : <>
              <div className="adcard"><div className="label" style={{ color: "#E0A1AB" }}>Billboard preview</div><h3>{draft.headline}</h3><p>{draft.body}</p></div>
              <div className="facts">
                <div><small>Price</small><b>{money(draft.price)}</b> <span className="note"><s>{money(draft.list)}</s></span></div>
                <div><small>Margin after</small><b>{draft.margin}%</b></div>
                <div><small>Competitor</small><b>{money(draft.competitor)}</b></div>
                <div><small>Audience</small><b>{draft.segment}</b></div>
                <div><small>Ends</small><b>{draft.ends}</b></div>
                <div><small>Expected lift</small><b>+{draft.lift}% conv.</b></div>
              </div>
              <div className={`guard ${draft.needs_approval ? "stop" : "ok"}`}>{draft.needs_approval ? `⚠ ${draft.pct}% is over your ${m.discount_cap}% discount rule. Approving it is your call.` : `✓ Inside your margin rule (≤ ${m.discount_cap}%). Safe to publish.`}</div>
              <p style={{ margin: "0 0 6px" }}>{draft.agent_text}</p>
              <Cites cites={draft.cites} />
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button className={`btn ${draft.needs_approval ? "rose" : "primary"}`} disabled={publish.isPending} onClick={() => publish.mutate(draft.id, { onSuccess: () => onPublished(draft) })}>
                  {draft.needs_approval ? "Approve and put on billboard" : "Put on billboard"}
                </button>
                <button className="btn" onClick={run}>Try again</button>
              </div>
            </>}
        </div>
      </div>
    </div>
  );
}
