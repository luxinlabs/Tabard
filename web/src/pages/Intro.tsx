// Landing page: what Tabard is, then two steps into a shop.
import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api, type Merchant } from "../api";
import { ErrorNote } from "../ui";
import { NewMerchant } from "./Merchants";

export default function Intro() {
  const nav = useNavigate();
  const shops = useQuery({ queryKey: ["merchants"], queryFn: () => api<Merchant[]>("/merchants") });
  const [picked, setPicked] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const shop = shops.data?.find(m => m.id === picked);

  return (
    <main className="landing">
      <b className="logo">Tabard</b>

      <section className="hero">
        <h1>Your shop's agents, answering the shopper's agents.</h1>
        <p>Shoppers now send AI agents to browse, compare and buy for them. Tabard gives a merchant a team of ZooWork agents that meet those buyer agents at the door. They answer questions, make offers, handle service and refunds, and turn away bad bots.</p>
        <p>You watch it all happen in your shop, and you step in only when an agent needs your approval.</p>
        <ul className="does">
          <li><b>Sell more</b>Recommendations and offers from the promo engine.</li>
          <li><b>Run leaner</b>Chats and phone calls answered by the service agent.</li>
          <li><b>Lose less</b>Fraud checks on every order, and bots blocked at the door.</li>
        </ul>
      </section>

      <section className="steps" aria-label="Get started">
        <div className="step">
          <div className="step-h"><span className="step-n">1</span><h2>Choose your shop</h2></div>
          <ErrorNote error={shops.error} />
          <div className="pick">
            {shops.data?.map(m => (
              <button key={m.id} aria-pressed={m.id === picked} onClick={() => setPicked(m.id)}>
                <b>{m.name}</b>
                <small>{m.category}{m.city ? ` · ${m.city}` : ""}</small>
              </button>
            ))}
          </div>
          {creating
            ? <NewMerchant onDone={() => setCreating(false)} onCreated={m => setPicked(m.id)} />
            : <button className="linkbtn" onClick={() => setCreating(true)}>Or open a new shop</button>}
        </div>

        <div className={`step ${shop ? "" : "off"}`}>
          <div className="step-h"><span className="step-n">2</span><h2>Enter the shop</h2></div>
          <p className="note" style={{ margin: 0 }}>{shop ? `${shop.name}'s agents are ready. Buyer agents start arriving as soon as you walk in.` : "Choose a shop first."}</p>
          <button className="btn primary big" style={{ alignSelf: "flex-start" }} disabled={!shop} onClick={() => shop && nav(`/m/${shop.id}`)}>
            {shop ? `Enter ${shop.name}` : "Enter the shop"}
          </button>
        </div>
      </section>
    </main>
  );
}
