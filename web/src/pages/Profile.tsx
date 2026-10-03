// Store profile: the merchant's basic information, policies, agents, customers and everything that has happened.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ago, hhmm, money, parseTheme, useM, PLATFORM_LABEL, type Agent, type Customer, type Merchant, type ShopEvent } from "../api";
import { ErrorNote, RiskPill } from "../ui";

const INFO: [keyof Merchant, string, string?][] = [
  ["name", "Shop name"], ["category", "What you sell"], ["tagline", "Tagline"], ["owner_name", "Owner name"],
  ["owner_email", "Owner email", "email"], ["phone", "Phone"], ["website", "Website"], ["city", "City"],
  ["currency", "Currency"], ["timezone", "Time zone"], ["plan", "Plan"],
];
const POLICY: [keyof Merchant, string, string][] = [
  ["discount_cap", "Max discount without approval", "%"],
  ["refund_review_over", "Refunds above this need you", "$"],
  ["risk_threshold", "Risk scores above this need you", "/100"],
];

export default function Profile() {
  const mid = Number(useParams().mid);
  const qc = useQueryClient();
  const nav = useNavigate();
  const merchant = useM<Merchant>(mid, ["merchant"], "");
  const agents = useM<Agent[]>(mid, ["agents"], "/agents");
  const customers = useM<Customer[]>(mid, ["customers"], "/customers");
  const events = useM<ShopEvent[]>(mid, ["events", "all"], "/events?limit=200");
  const [form, setForm] = useState<Partial<Merchant>>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (merchant.data) setForm(merchant.data); }, [merchant.data]);

  const save = useMutation({
    mutationFn: (body: Partial<Merchant>) => api<Merchant>(`/merchants/${mid}`, { method: "PATCH", body }),
    onSuccess: () => { setSaved(true); window.setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: [mid] }); qc.invalidateQueries({ queryKey: ["merchants"] }); },
  });
  const saveAgent = useMutation({
    mutationFn: (a: { key: string; body: Record<string, unknown> }) => api(`/merchants/${mid}/agents/${a.key}`, { method: "PATCH", body: a.body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [mid, "agents"] }),
  });
  const remove = useMutation({
    mutationFn: () => api(`/merchants/${mid}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["merchants"] }); nav("/merchants"); },
  });

  if (merchant.error) return <div className="page"><ErrorNote error={merchant.error} /><Link to="/merchants">Back to shops</Link></div>;
  const m = merchant.data;
  if (!m) return <div className="page note">Loading…</div>;
  const t = m.totals ?? {};
  const theme = parseTheme(m.theme);
  const set = (k: keyof Merchant, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const dirty = INFO.concat(POLICY as never).some(([k]) => String(form[k] ?? "") !== String(m[k] ?? "")) || form.house_offer !== m.house_offer || form.simulate !== m.simulate;

  return (
    <div className="page">
      <header className="pagehead">
        <div>
          <Link to="/merchants" className="note">← All shops</Link>
          <h1 className="pagetitle">{m.name}</h1>
          {m.source_url && <p className="note">Imported from <a href={m.source_url} target="_blank" rel="noreferrer">{PLATFORM_LABEL[m.source_platform ?? "web"]}</a> with Tavily{theme?.vibe ? ` · room: ${theme.vibe}` : ""} <span className="swatches">{theme && (["wall", "accent", "trim", "floorA"] as const).map(k => <i key={k} style={{ background: theme[k] }} />)}</span></p>}
          <p className="note">{m.category}{m.city ? ` · ${m.city}` : ""} · on Tabard since {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <Link className="btn primary" to={`/m/${mid}`}>Enter the shop</Link>
      </header>

      <div className="kpis">
        {([["Revenue", money(t.revenue ?? 0), "agent-assisted, all time"], ["Revenue", t.orders ?? 0, "orders"], ["Efficiency", t.tickets ?? 0, "service conversations"],
          ["Efficiency", t.calls ?? 0, "phone calls"], ["Risk", t.blocked ?? 0, "bots blocked"], ["All", t.rooms ?? 0, "buyer-agent rooms opened"]] as [string, string | number, string][])
          .map((k, i) => <div className="kpi" key={i}><span className="k">{k[0]}</span><b>{k[1]}</b><small>{k[2]}</small></div>)}
      </div>

      <div className="dash">
        <div className="stack">
          <form className="panel" onSubmit={e => { e.preventDefault(); save.mutate(form); }}>
            <div className="panel-h"><span className="label">Basic information</span>{saved && <span className="pill p-good">Saved</span>}</div>
            <div className="pad">
              <div className="form">
                {INFO.map(([k, label, type]) => <label key={k}>{label}<input className="input" type={type ?? "text"} value={String(form[k] ?? "")} onChange={e => set(k, e.target.value)} required={k === "name"} /></label>)}
              </div>
              <h3 className="formtitle" style={{ marginTop: 18 }}>Agent policies</h3>
              <p className="note">Your agents act on their own inside these limits and ask you about anything outside them.</p>
              <div className="form">
                {POLICY.map(([k, label, unit]) => <label key={k}>{label} <span className="note">({unit})</span><input className="input" type="number" min={0} value={Number(form[k] ?? 0)} onChange={e => set(k, Number(e.target.value))} /></label>)}
                <label className="wide">House offer on the billboard<input className="input" value={form.house_offer ?? ""} onChange={e => set("house_offer", e.target.value)} /></label>
                <label className="check"><input type="checkbox" checked={!!form.simulate} onChange={e => set("simulate", e.target.checked ? 1 : 0)} /> Simulate buyer agents while the shop is open</label>
              </div>
              <ErrorNote error={save.error} />
              <button className="btn primary" disabled={!dirty || save.isPending}>{save.isPending ? "Saving…" : "Save changes"}</button>
            </div>
          </form>

          <div className="panel">
            <div className="panel-h"><span className="label">ZooWork agents</span><span className="note">Paste each agent's ZooWork id to route it to your own agent</span></div>
            <ErrorNote error={saveAgent.error} />
            <div className="tbl"><table><thead><tr><th>Agent</th><th>Job</th><th>ZooWork agent id</th><th>On</th><th>Actions</th></tr></thead><tbody>
              {agents.data?.map(a => (
                <tr key={a.id}>
                  <td className="mono">{a.handle}<span className="sub">{a.version}</span></td>
                  <td>{a.job}<span className="sub">{a.line}</span></td>
                  <td><input className="input mono" style={{ minWidth: 150, fontSize: 12 }} defaultValue={a.zoowork_agent_id ?? ""} placeholder="agt_…" aria-label={`ZooWork id for ${a.handle}`}
                    onBlur={e => { if (e.target.value !== (a.zoowork_agent_id ?? "")) saveAgent.mutate({ key: a.key, body: { zoowork_agent_id: e.target.value } }); }} /></td>
                  <td><input type="checkbox" checked={a.enabled} onChange={e => saveAgent.mutate({ key: a.key, body: { enabled: e.target.checked } })} aria-label={`${a.handle} enabled`} /></td>
                  <td className="num">{a.actions}</td>
                </tr>
              ))}
            </tbody></table></div>
          </div>

          <div className="panel">
            <div className="panel-h"><span className="label">Customers</span><span className="note">{customers.data?.length ?? 0}</span></div>
            <div className="tbl"><table><thead><tr><th>Name</th><th>Tier</th><th>Lifetime value</th><th>Return rate</th><th>Risk</th></tr></thead><tbody>
              {customers.data?.map(c => <tr key={c.id}><td>{c.name}<span className="sub">{c.city} · {c.phone}</span></td><td>{c.tier}</td><td className="num">{money(c.ltv)}</td><td className="num">{c.return_rate}%</td><td><RiskPill risk={c.risk} /></td></tr>)}
              {customers.data?.length === 0 && <tr><td colSpan={5} className="note">No customers yet.</td></tr>}
            </tbody></table></div>
          </div>

          <div className="panel pad danger-zone">
            <b>Close this shop</b>
            <p className="note">Deletes the store and everything recorded for it: agents, catalog, customers, rooms, transactions and history.</p>
            <ErrorNote error={remove.error} />
            <button className="btn danger" onClick={() => { if (confirm(`Delete ${m.name} and all its data? This can't be undone.`)) remove.mutate(); }}>Delete shop</button>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-h"><span className="label">What's going on</span><span className="note">{t.events ?? 0} events recorded</span></div>
            <ul className="feed tall">
              {events.data?.map(e => <li key={e.id}><span className="t">{hhmm(e.created_at)}</span><span><span className="h">{e.actor}</span> {e.text} <span className="note">· {ago(e.created_at)}</span></span></li>)}
              {events.data?.length === 0 && <li className="note">Nothing yet. Enter the shop to open it.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
