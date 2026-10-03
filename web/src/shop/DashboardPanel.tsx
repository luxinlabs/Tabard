// Monitoring table: everything in the shop at a glance.
import { useAction, useM, useHealth, money, hhmm, type Agent, type AgentReply, type Approval, type Decision, type Overview, type ShopEvent } from "../api";
import { Cites, ErrorNote, RevenueChart, RiskPill, Source, Thinking } from "../ui";

const APPROVE_AS: Record<string, [string, string]> = {
  "Approve refund": ["Approve", "Refunded"],
  "Ask for a photo": ["Ask for photo", "Photo requested"],
};

export function DashboardPanel({ mid }: { mid: number }) {
  const o = useM<Overview>(mid, ["overview"], "/overview");
  const approvals = useM<Approval[]>(mid, ["approvals"], "/approvals");
  const decisions = useM<Decision[]>(mid, ["decisions"], "/decisions");
  const agents = useM<Agent[]>(mid, ["agents"], "/agents");
  const events = useM<ShopEvent[]>(mid, ["events"], "/events?limit=60");
  const health = useHealth();
  const decide = useAction<{ id: number; status: string }>(mid, b => ({ path: `/approvals/${b.id}`, body: { status: b.status } }));
  const summary = useAction<void, AgentReply>(mid, () => ({ path: "/summary" }));
  const waiting = approvals.data?.filter(a => a.status === "waiting") ?? [];
  const d = o.data;

  const kpis: [string, string | number, string][] = d ? [
    ["Revenue", money(d.revenue), `${d.orders} agent-assisted orders today`],
    ["Revenue", d.promoSeen, "buyer agents got the billboard offer"],
    ["Efficiency", d.handled, "chats + calls closed without staff"],
    ["Efficiency", d.openTickets, "at the counter now"],
    ["Risk", d.blocked, "bots blocked at the door today"],
    ["Risk", d.waiting, "decisions waiting for you"],
  ] : [];

  return (
    <>
      <div className="kpis">{kpis.map((k, i) => <div className="kpi" key={i}><span className="k">{k[0]}</span><b>{k[1]}</b><small>{k[2]}</small></div>)}</div>
      <div className="dash">
        <div className="stack">
          <div className="panel"><div className="panel-h"><span className="label">Agent-assisted revenue by hour, today</span><span className="note">Rose bar = this hour, live</span></div>
            {d && <RevenueChart data={d.hourly} />}</div>
          <div className="panel"><div className="panel-h"><span className="label">Needs your approval</span>{waiting.length ? <span className="pill p-bad">{waiting.length} waiting</span> : <span className="pill p-good">All clear</span>}</div>
            <ErrorNote error={decide.error} />
            <div className="tbl"><table><thead><tr><th>Case</th><th>Customer</th><th>Amount</th><th>Screener</th><th>Decide</th></tr></thead><tbody>
              {approvals.data?.map(a => {
                const [label, status] = APPROVE_AS[a.recommendation] ?? ["Offer exchange", "Exchange offered"];
                return (
                  <tr key={a.id}>
                    <td className="mono">{a.code}<span className="sub">{a.order_code}</span></td>
                    <td>{a.customer_name}<span className="sub">{a.reasons.slice(0, 2).join(" · ")}</span></td>
                    <td className="num">{money(a.amount)}</td>
                    <td><RiskPill risk={a.risk} /><span className="sub">{a.recommendation}</span></td>
                    <td>{a.status === "waiting" ? <div className="acts" style={{ margin: 0 }}>
                      <button className="btn primary" onClick={() => decide.mutate({ id: a.id, status })}>{label}</button>
                      <button className="btn" onClick={() => decide.mutate({ id: a.id, status: "Refunded" })}>Refund</button>
                      <button className="btn danger" onClick={() => decide.mutate({ id: a.id, status: "Denied" })}>Deny</button>
                    </div> : <span className="pill p-neutral">{a.status}</span>}</td>
                  </tr>
                );
              })}
              {approvals.data?.length === 0 && <tr><td colSpan={5} className="note">Nothing has needed you yet.</td></tr>}
            </tbody></table></div>
          </div>
          <div className="panel"><div className="panel-h"><span className="label">Decision log</span><span className="note">Agent versions from Entire checkpoints</span></div>
            <div className="tbl" style={{ maxHeight: 280, overflowY: "auto" }}><table><thead><tr><th>Time</th><th>Agent</th><th>Decision</th><th>Version</th></tr></thead><tbody>
              {decisions.data?.slice(0, 40).map(l => <tr key={l.id}><td className="mono">{hhmm(l.created_at)}</td><td className="mono">{l.agent}</td><td>{l.decision}<span className="sub">{l.basis}</span></td><td className="mono note">{l.version}</td></tr>)}
            </tbody></table></div>
          </div>
        </div>
        <div className="stack">
          <div className="panel"><div className="panel-h"><span className="label">Shift summary</span><button className="btn" style={{ padding: "3px 10px", fontSize: 12 }} onClick={() => summary.mutate()} disabled={summary.isPending}>Ask @concierge</button></div>
            {summary.isPending ? <Thinking>@concierge is reading today's events…</Thinking>
              : summary.data ? <><div className="summary">{summary.data.text}</div><div className="pad" style={{ paddingTop: 0 }}><Source source={summary.data.source} /><Cites cites={summary.data.cites} /></div></>
              : <div className="pad note">Ask the concierge agent for a plain-language summary of the shift.</div>}
            <ErrorNote error={summary.error} />
          </div>
          <div className="panel"><div className="panel-h"><span className="label">Your ZooWork agents</span>{health.data?.zoowork ? <span className="pill p-forest">ZooWork live</span> : <span className="pill p-neutral">Simulator</span>}</div>
            <div className="tbl"><table><thead><tr><th>Agent</th><th>P&amp;L</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {agents.data?.map(a => <tr key={a.id}><td><span className="mono">{a.handle}</span><span className="sub">{a.job}</span></td><td style={{ whiteSpace: "nowrap" }}>{a.line}</td>
                <td><span className={`status-dot ${a.busy ? "busy" : ""}`}>{a.busy ? "Working" : a.enabled ? "Ready" : "Off"}</span></td><td className="num">{a.actions}</td></tr>)}
            </tbody></table></div>
          </div>
          <div className="panel"><div className="panel-h"><span className="label">Live room feed</span></div>
            <ul className="feed">{events.data?.map(f => <li key={f.id}><span className="t">{hhmm(f.created_at)}</span><span><span className="h">{f.actor}</span> {f.text}</span></li>)}</ul>
          </div>
        </div>
      </div>
    </>
  );
}
