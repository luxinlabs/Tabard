// Agent room: every conversation between agents (buyer agents and the shop's agents), mirrored to Band, plus team
// rooms where the owner @mentions agents to discuss something.
import { useEffect, useRef, useState } from "react";
import { useAction, useHealth, useM, hhmm, ago, type Room, type RoomThread } from "../api";
import { Cites, ErrorNote, Source } from "../ui";

const AGENTS = ["concierge", "stylist", "promo", "service", "returns", "gatekeeper"] as const;
const COLORS: Record<string, string> = { concierge: "#2F4A3C", stylist: "#3E6B4A", promo: "#A45F6A", service: "#2F5D6B", returns: "#9A6512", gatekeeper: "#B03A3C" };
const FILTERS = [["all", "All"], ["team", "Team"], ["shop", "Shopping"], ["service", "Service"], ["bot", "Blocked bots"]] as const;
const KIND: Record<string, [string, string]> = { team: ["Team", "p-forest"], shop: ["Shopping", "p-good"], service: ["Service", "p-neutral"], bot: ["Bot", "p-bad"] };

// highlight @mentions inside message text
function Mentions({ text }: { text: string }) {
  return <>{text.split(/(@[a-z][\w/.-]*[\w])/gi).map((part, i) => part.startsWith("@") ? <span key={i} className="mention">{part}</span> : part)}</>;
}

export function AgentRoomsPanel({ mid, roomId, setRoomId }: { mid: number; roomId: number | null; setRoomId: (id: number | null) => void }) {
  const rooms = useM<Room[]>(mid, ["rooms"], "/rooms");
  const health = useHealth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [topic, setTopic] = useState("");
  const create = useAction<string, { id: number }>(mid, t => ({ path: "/rooms", body: { topic: t } }));
  const list = (rooms.data ?? []).filter(r => filter === "all" || r.kind === filter);
  const current = roomId ?? list[0]?.id ?? null;

  return (
    <>
      <div className="bandbar">
        {health.data?.band
          ? <span className="pill p-good">Band connected</span>
          : <span className="pill p-neutral">Band not connected</span>}
        <span className="note">{health.data?.band
          ? "Every room below is also a Band chat room. Agents post as themselves, @mention whoever should act, and hand work to each other through their Band inboxes."
          : "Rooms run locally. Add the BAND_KEY_* agent keys to server/.env to mirror every room to Band and route hand-offs through it."}</span>
      </div>
      <div className="grid-side rooms-grid">
        <div className="panel">
          <form className="newroom" onSubmit={e => { e.preventDefault(); if (topic.trim()) create.mutate(topic.trim(), { onSuccess: r => { setRoomId(r.id); setTopic(""); setFilter("all"); } }); }}>
            <input className="input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="New team room, e.g. Weekend plan" aria-label="Team room topic" />
            <button className="btn primary" disabled={create.isPending || !topic.trim()}>Open</button>
          </form>
          <ErrorNote error={create.error} />
          <div className="subtabs roomfilters" role="tablist">{FILTERS.map(([k, label]) => <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>{label}</button>)}</div>
          <ul className="tickets">
            {list.map(r => (
              <li key={r.id}><button className="tk" aria-current={r.id === current} onClick={() => setRoomId(r.id)}>
                <span className="av" style={{ background: r.kind === "team" ? "#2F4A3C" : r.kind === "bot" ? "#B03A3C" : "#A45F6A" }}>{r.kind === "team" ? "T" : (r.customer_name ?? r.handle).replace("@", "").slice(0, 2).toUpperCase()}</span>
                <span className="t1"><span>{r.kind === "team" ? r.intent : r.customer_name ?? r.handle}</span><span className={`pill ${KIND[r.kind]?.[1] ?? "p-neutral"}`}>{KIND[r.kind]?.[0] ?? r.kind}</span></span>
                <span className="t2">{r.band_chat_id ? "◆ " : ""}{r.last_text ?? "No messages yet"}</span>
              </button></li>
            ))}
            {!list.length && <li className="note pad">No rooms here yet.</li>}
          </ul>
        </div>
        <div className="panel chat">{current ? <Thread mid={mid} id={current} key={current} /> : <div className="ringcard"><span className="big">No rooms yet</span><span className="note">Open a team room, or wait for buyer agents to arrive.</span></div>}</div>
      </div>
    </>
  );
}

function Thread({ mid, id }: { mid: number; id: number }) {
  const t = useM<RoomThread>(mid, ["room", id], `/rooms/${id}`);
  const [text, setText] = useState("");
  const say = useAction<string>(mid, body => ({ path: `/rooms/${id}/messages`, body: { text: body } }));
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const r = t.data;
  useEffect(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; }, [r?.messages.length, r?.typing.length]);
  if (!r) return <div className="pad note">Loading…</div>;
  const members = [...new Set(r.messages.map(m => m.sender).filter(s => s !== "system"))];
  const mention = (a: string) => { setText(v => (v.includes(`@${a}`) ? v : `${v}${v && !v.endsWith(" ") ? " " : ""}@${a} `)); input.current?.focus(); };

  return (
    <>
      <div className="chat-h">
        <b>{r.kind === "team" ? r.intent : r.customer_name ?? r.handle}</b>
        <span className="mono note">{r.kind === "team" ? "team room" : `${r.handle} · via ${r.platform}`} · opened {ago(r.opened_at)}</span>
        {r.band.chatId
          ? <span className="pill p-good" title={`Band chat ${r.band.chatId}`}>On Band · {r.band.sent} sent{r.band.failed ? ` · ${r.band.failed} failed` : ""}</span>
          : <span className="pill p-neutral">{r.band.live ? "Not on Band yet" : "Local room"}</span>}
      </div>
      <div className="members">{members.map(m => <span key={m} className={`chip ${m.startsWith("@") && AGENTS.includes(m.slice(1) as never) ? "" : "tv"}`}>{m}</span>)}</div>
      <div className="msgs" ref={box} aria-live="polite">
        {r.messages.map(m => m.role === "sys"
          ? <div key={m.id} className="m sys"><div className="tx">{m.text}</div></div>
          : <div key={m.id} className={`m ${m.role === "buyer" ? "buyer" : m.role === "staff" ? "staff" : "agent"} roommsg`}>
              <span className="from">
                <i className="dot-av" style={{ background: COLORS[m.sender.slice(1)] ?? (m.role === "staff" ? "#A45F6A" : "#7C9EB2") }} />
                {m.sender} · {hhmm(m.created_at)}
                {m.band_status === "sent" && <span className="bandok" title="Delivered through Band">◆ Band</span>}
                {m.band_status === "failed" && <span className="bandfail" title="Band delivery failed">Band failed</span>}
              </span>
              <div className="tx"><Mentions text={m.text} /></div>
              {(m.cites.length > 0 || m.source) && <div className="howmeta">{m.source && <Source source={m.source} />}<Cites cites={m.cites} /></div>}
            </div>)}
        {r.typing.map(a => <div key={a} className="m agent"><span className="from">@{a}</span><div className="tx">thinking…</div></div>)}
      </div>
      <ErrorNote error={say.error} />
      <div className="mentionbar">{AGENTS.map(a => <button key={a} type="button" onClick={() => mention(a)}>@{a}</button>)}</div>
      <form className="compose" onSubmit={e => { e.preventDefault(); const v = text.trim(); if (!v) return; setText(""); say.mutate(v); }}>
        <input ref={input} className="input" value={text} onChange={e => setText(e.target.value)} placeholder="Message the room as the owner. @mention agents to bring them in." aria-label="Message" />
        <button className="btn primary" type="submit" disabled={say.isPending}>Send</button>
      </form>
    </>
  );
}
