// Service counter: buyer agents queued for help (the @service agent auto-replies) and phone calls.
import { useEffect, useRef, useState } from "react";
import { useAction, useM, type Call, type Message, type Ticket } from "../api";
import { Cites, ErrorNote, RiskPill } from "../ui";

export function ServicePanel({ mid, tab, setTab, ticketId, setTicketId }: { mid: number; tab: "chat" | "phone"; setTab: (t: "chat" | "phone") => void; ticketId: number | null; setTicketId: (id: number | null) => void }) {
  const tickets = useM<Ticket[]>(mid, ["tickets"], "/tickets");
  const calls = useM<Call[]>(mid, ["calls"], "/calls");
  const open = tickets.data?.filter(t => t.status !== "resolved").length ?? 0;
  const current = calls.data?.find(c => c.status !== "ended");
  return (
    <>
      <div className="subtabs" role="tablist">
        <button role="tab" aria-selected={tab === "chat"} onClick={() => setTab("chat")}>Chats {open ? <span className="num">({open})</span> : null}</button>
        <button role="tab" aria-selected={tab === "phone"} onClick={() => setTab("phone")}>Phone {current ? `· ${current.status}` : ""}</button>
      </div>
      {tab === "chat"
        ? <Chats mid={mid} tickets={tickets.data ?? []} ticketId={ticketId} setTicketId={setTicketId} />
        : <Phone mid={mid} calls={calls.data ?? []} />}
    </>
  );
}

function Chats({ mid, tickets, ticketId, setTicketId }: { mid: number; tickets: Ticket[]; ticketId: number | null; setTicketId: (id: number | null) => void }) {
  const selected = tickets.find(t => t.id === ticketId) ?? tickets.find(t => t.status !== "resolved") ?? tickets[0];
  const sendCustomer = useAction<void>(mid, () => ({ path: "/visitors", body: { kind: "service" } }));
  return (
    <div className="grid-side">
      <div className="panel">
        <div className="panel-h"><span className="label">At the counter</span>
          <button className="btn" style={{ padding: "3px 9px", fontSize: 12 }} onClick={() => sendCustomer.mutate()} disabled={sendCustomer.isPending}>+ Send a customer</button>
        </div>
        <ErrorNote error={sendCustomer.error} />
        <ul className="tickets">
          {tickets.length ? tickets.map(t => {
            const st = t.status === "resolved" ? ["Resolved", "p-neutral"] : t.status === "staff" ? ["You", "p-rose"] : t.typing ? ["Typing…", "p-forest"] : ["Agent", "p-good"];
            return (
              <li key={t.id}><button className="tk" aria-current={t.id === selected?.id} onClick={() => setTicketId(t.id)}>
                <span className="av" style={{ background: t.status === "resolved" ? "#9AA39E" : "#A45F6A" }}>{t.customer_name.split(" ").map(s => s[0]).join("")}</span>
                <span className="t1"><span>{t.customer_name}</span><span className={`pill ${st[1]}`}>{st[0]}</span></span>
                <span className="t2">{t.last_text ?? "Walking to the counter…"}</span>
              </button></li>
            );
          }) : <li className="note pad">The queue is empty. Buyer agents line up here when they need help.</li>}
        </ul>
      </div>
      <div className="panel chat">{selected ? <Conversation mid={mid} t={selected} key={selected.id} /> : <div className="ringcard"><span className="big">No one at the counter yet</span><span className="note">Send a customer in to try it.</span></div>}</div>
    </div>
  );
}

function Conversation({ mid, t }: { mid: number; t: Ticket }) {
  const detail = useM<Ticket & { messages: Message[] }>(mid, ["ticket", t.id], `/tickets/${t.id}`);
  const [as, setAs] = useState<"customer" | "staff">("customer");
  const [text, setText] = useState("");
  const say = useAction<{ as: string; text: string }>(mid, b => ({ path: `/tickets/${t.id}/messages`, body: b }));
  const staff = useAction<boolean>(mid, s => ({ path: `/tickets/${t.id}/staff`, body: { staff: s } }));
  const resolve = useAction<void>(mid, () => ({ path: `/tickets/${t.id}/resolve` }));
  const box = useRef<HTMLDivElement>(null);
  const msgs = detail.data?.messages ?? [];
  useEffect(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; }, [msgs.length, t.typing]);
  const done = t.status === "resolved";
  return (
    <>
      <div className="chat-h"><b>{t.customer_name}</b><span className="mono note">{t.handle} · via {t.platform}</span><span className="pill p-rose">{t.tier}</span><RiskPill risk={t.risk} />
        {done ? <span className="pill p-neutral">Resolved</span> : t.status === "staff" ? <span className="pill p-rose">You're handling this</span> : <span className={`status-dot ${t.typing ? "busy" : ""}`}>@service auto-replying</span>}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn" disabled={done || staff.isPending} onClick={() => { staff.mutate(t.status !== "staff"); if (t.status !== "staff") setAs("staff"); }}>{t.status === "staff" ? "Hand back to agent" : "Take over"}</button>
          <button className="btn" disabled={done || resolve.isPending} onClick={() => resolve.mutate()}>Mark resolved</button>
        </span>
      </div>
      <div className="msgs" ref={box} aria-live="polite">
        {msgs.map(m => m.role === "sys"
          ? <div key={m.id} className="m sys"><div className="tx">{m.text}</div></div>
          : <div key={m.id} className={`m ${m.role}`}><span className="from">{m.sender}{m.source === "zoowork" ? " · ZooWork" : ""}</span><div className="tx">{m.text}</div><Cites cites={m.cites} /></div>)}
        {t.typing && <div className="m agent"><span className="from">@service</span><div className="tx">typing…</div></div>}
      </div>
      <ErrorNote error={say.error || staff.error || resolve.error} />
      <form className="compose" onSubmit={e => { e.preventDefault(); const v = text.trim(); if (!v || done) return; setText(""); say.mutate({ as, text: v }); }}>
        <span className="seg" role="group" aria-label="Speak as">
          <button type="button" aria-pressed={as === "customer"} onClick={() => setAs("customer")}>As customer</button>
          <button type="button" aria-pressed={as === "staff"} onClick={() => setAs("staff")}>As staff</button>
        </span>
        <input className="input" value={text} onChange={e => setText(e.target.value)} disabled={done} placeholder={as === "staff" ? "Write to the buyer agent as staff" : "Type as the customer to test the agent"} />
        <button className="btn primary" type="submit" disabled={done}>Send</button>
      </form>
    </>
  );
}

function Phone({ mid, calls }: { mid: number; calls: Call[] }) {
  const current = calls.find(c => c.status !== "ended");
  const past = calls.filter(c => c.status === "ended");
  const ring = useAction<void>(mid, () => ({ path: "/calls" }));
  const act = useAction<{ id: number; what: string; text?: string }>(mid, b => ({ path: `/calls/${b.id}/${b.what}`, body: b.text ? { text: b.text } : {} }));
  const [voice, setVoice] = useState(false);
  const [line, setLine] = useState("");
  const spoken = useRef<Record<number, number>>({});
  const tr = useRef<HTMLDivElement>(null);

  // read new lines aloud when voice is on
  useEffect(() => {
    if (!current || !("speechSynthesis" in window)) return;
    const from = spoken.current[current.id] ?? (voice ? current.lines.length - 1 : current.lines.length);
    if (voice) current.lines.slice(Math.max(0, from)).forEach(l => {
      const u = new SpeechSynthesisUtterance(l.text); u.rate = 1.05; u.pitch = l.who === "caller" ? 1.2 : 1; speechSynthesis.speak(u);
    });
    spoken.current[current.id] = current.lines.length;
    if (tr.current) tr.current.scrollTop = tr.current.scrollHeight;
  }, [current?.id, current?.lines.length, voice]);
  useEffect(() => () => { if ("speechSynthesis" in window) speechSynthesis.cancel(); }, []);

  return (
    <div className="grid2">
      <div>
        <ErrorNote error={ring.error || act.error} />
        {!current ? (
          <div className="panel ringcard"><span className="big">The line is quiet</span><span className="note">Calls come in on their own every minute or so. @service picks up, and you can listen in or take over.</span>
            <button className="btn primary" onClick={() => ring.mutate()} disabled={ring.isPending}>Simulate an incoming call</button></div>
        ) : current.status === "ringing" ? (
          <div className="panel ringcard"><span className="label">Incoming call</span><span className="big">{current.customer_name}</span><span className="mono note">{current.phone}</span>
            <div className="wave"><i /><i /><i /><i /><i /></div><span className="note">@service answers automatically in a few seconds.</span>
            <button className="btn primary" onClick={() => act.mutate({ id: current.id, what: "answer" })}>Let the agent answer now</button></div>
        ) : (
          <div className="call">
            <div className="call-top"><span className="who">{current.customer_name}</span><span className="mono note">{current.phone}</span><div className="wave" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <span className={`pill ${current.staff ? "p-rose" : "p-good"}`}>{current.staff ? "You're on the line" : "@service on the line"}</span></div>
            <div className="transcript" ref={tr}>
              {current.lines.map((l, i) => <div className="l" key={i}><b>{l.who === "agent" ? "Agent" : l.who === "staff" ? "You" : current.customer_name.split(" ")[0]}</b>{l.text}<Cites cites={l.cites} /></div>)}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn danger" onClick={() => act.mutate({ id: current.id, what: "end" })}>End call</button>
              <button className="btn" disabled={current.staff} onClick={() => act.mutate({ id: current.id, what: "takeover" })}>Take over the call</button>
              <label className="note" style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={voice} onChange={e => { setVoice(e.target.checked); if (!e.target.checked) speechSynthesis.cancel(); }} /> Play voice</label>
            </div>
            {current.staff && <form style={{ display: "flex", gap: 8 }} onSubmit={e => { e.preventDefault(); if (!line.trim()) return; act.mutate({ id: current.id, what: "say", text: line.trim() }); setLine(""); }}>
              <input className="input" value={line} onChange={e => setLine(e.target.value)} placeholder={`Say something to ${current.customer_name.split(" ")[0]}`} autoFocus /><button className="btn primary">Say</button></form>}
            <span className="note">Simulated call. In production the voice loop runs on LiveKit or Pipecat with Twilio, and @service answers with Moss lookups on each turn.</span>
          </div>
        )}
      </div>
      <div className="panel"><div className="panel-h"><span className="label">Recent calls</span></div>
        {past.length ? <div className="tbl"><table><thead><tr><th>Caller</th><th>Topic</th><th>Length</th><th>Handled by</th></tr></thead><tbody>
          {past.map(c => <tr key={c.id}><td>{c.customer_name}</td><td>{c.topic}</td><td className="num">{c.ended_at ? Math.round((+new Date(c.ended_at) - +new Date(c.started_at)) / 1000) + "s" : "—"}</td>
            <td>{c.handled_by === "agent" ? <span className="pill p-good">@service</span> : <span className="pill p-rose">You</span>}</td></tr>)}
        </tbody></table></div> : <div className="pad note">No calls yet today.</div>}
      </div>
    </div>
  );
}
