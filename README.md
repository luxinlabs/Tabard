# Tabard: the merchant's shop floor

Shoppers now arrive as agents. In Tabard you run the shop: buyer agents walk in through the door, and your ZooWork agents (the little robots) answer them. Every merchant has their own profile, policies, agents, catalog, customers and history, all stored in the database.

## Run (full stack)

```sh
cd server && npm install
cd ../web && npm install
cd ../server && npm run dev:all   # API on :4000, React app on http://localhost:5173
```

Production: `cd web && npm run build`, then `cd server && npm start`. The API serves the built app on http://localhost:4000.

- `server/`: Node + Express 5 + SQLite (Node's built-in `node:sqlite`, so nothing to install). The database file is `server/data/tabard.db`; it is created and seeded with two sample shops on first boot. `npm run seed` resets it.
- `web/`: React 19 + TypeScript + Vite, with TanStack Query for data and React Router for pages.
- The shop engine (`server/src/engine.ts`) runs the simulated buyer agents for a shop while someone has it open. It writes everything to the database and streams it to the browser over Server-Sent Events.

### What the database keeps for each merchant

| Table | What's in it |
|---|---|
| `merchants` | Basic info (name, category, owner, contact, city, plan) and agent policies (discount cap, refund review limit, risk threshold, house offer) |
| `agents` | The six ZooWork agents, each with its ZooWork agent id, on/off switch and action count |
| `products`, `customers` | Catalog with stock and sales; customers with tier, lifetime value, return rate and risk |
| `rooms`, `messages` | Each buyer-agent session and every message in it |
| `tickets`, `calls` | Service conversations and phone calls, with transcripts |
| `transactions` | Orders and refunds, with fraud flags, status and the @returns verdict |
| `approvals`, `promos`, `decisions` | Decisions waiting for the owner, billboard offers, and the decision log with agent versions |
| `events` | The activity feed: everything that happened in the shop, in order |

### Import a shop from a store link (Tavily)

On the landing page, choose **Or open a new shop → From a store link** and paste a TikTok Shop, Amazon, Shopify, Etsy or any store URL.

1. **Tavily Extract** reads the page. If the page blocks it or returns too little (common on Amazon and TikTok), **Tavily Search** gathers what the web says about the store.
2. **Claude** (`claude-opus-5-5`, structured output) turns that text into a profile, up to 12 products with prices and images, and a room palette that fits the brand. Without `ANTHROPIC_API_KEY`, a rule-based parser does a simpler version.
3. You review and edit the preview, then create the shop. The room is drawn in the shop's colours, with product photos on the shelves and a sign for the platform.

Set `TAVILY_API_KEY` (required for importing) and optionally `ANTHROPIC_API_KEY` before starting the server. Customers in an imported shop are sample shoppers, because storefronts don't expose real ones.

### ZooWork agents

Tabard's merchant agents run on ZooWork managed agents through the official SDK (`@zoowork-ai/sdk`).

1. Create a Project API key in the ZooWork app (Settings → API Keys). It starts with `zwp_live_`.
2. Copy `server/.env.example` to `server/.env` and put the key in `ZOOWORK_API_KEY`. `server/.env` is ignored by git; never commit the key.
3. Restart the server. The top bar shows "ZooWork agents: live".

The first time a shop uses a role (for example the billboard's promo engine), the server creates a ZooWork agent named `tabard-<shop>-<role>`. The role's instructions go into the agent's persona (`SOUL.md`), and the agent runs on `ZOOWORK_MODEL` (default `litellm/claude-opus-5-5`). The server starts the agent and saves its id on the store profile page. To use an agent you built yourself in ZooWork, paste its id there instead. Each request opens a ZooWork session, sends the prompt and streams back the reply.

`ZOOWORK_AGENTS` sets which roles run live (default `promo,concierge`, i.e. the billboard and the shift summary). Set it to `all` to also run service, returns, stylist and gatekeeper live. That sends a ZooWork request for every simulated shopper, so expect more usage. Roles that aren't live, and any call that fails, use the built-in simulator, and the UI labels each reply "ZooWork live" or "Simulated".

**Ad artwork.** Promo agents get ZooWork's `designer` skill. After the offer is drafted (about 7 s), the same agent paints a 2400×840 billboard image in the background (about 2–3 minutes). The server downloads the image to `server/data/ads/` and shows it in the draft, on the shop's billboard and on the offer's ad page (`/m/:shop/ads/:offer`). Until it's ready, or without ZooWork, the ad is laid out from the offer text and product.

ZooWork chooses the offer and writes the copy; the server's rules still compute price and margin and decide when the owner must approve (discounts above the shop's cap).

### Stations

| Key | Station | Agent | P&L line |
|---|---|---|---|
| 1 | Billboard: prompt the promo engine, publish offers | @promo | Sell more |
| 2 | Goods shelf: stock, transactions, fraud scan | @returns | Lose less |
| 3 | Service counter: queued customers, auto-reply chat, phone calls | @service | Run leaner |
| 4 | Monitoring table: KPIs, revenue, approvals, agent status, decision log | @concierge | All |

The gatekeeper at the door verifies buyer agents and blocks bots. Controls: click to walk, WASD to move, E to use the nearest station, 1–4 to jump to a station.

The first single-file prototype (`index.html`, `game.js`, `zoowork.js`, `data.js`, `styles.css`, `server.js`) is still in the root for reference.

### API for the Elm console

`GET /api/merchants/:id/console/{rooms,customers,refunds,agents-seen,signals,log}` returns the shapes in `src/Data.elm`, and `POST /api/merchants/:id/console/refunds/:caseId/decision` records a refund decision. CORS is open to localhost.

### Mission control API (all merchants)

- `GET /api/mission`: fleet snapshot (totals, plus each merchant with its agents).
- `GET /api/mission/wire?merchant=&agent=&platform=&after=&limit=`: the agent-to-agent message feed.
- `GET /api/mission/links?minutes=60`: who talks to whom.
- `GET /api/mission/rooms/:merchantId/:roomId`: one full thread.
- `GET /api/mission/stream`: live events across all merchants.

While a mission stream is open, every shop with simulation on keeps running.

The merchant's copilot for the age of shopping agents.

## Merchant console (Elm)

```sh
npm install        # installs the Elm compiler locally
npm run build      # src/*.elm -> copilot.js (optimized)
```

Then serve the folder and open `copilot.html`, e.g. `python3 -m http.server` → http://localhost:8000/copilot.html.

For live data, start the Tabard API first: `cd server && npm install && npm run dev` (port 4000).
Use `copilot.html?api=<url>` to point at another API. Without the API, every view falls back to sample data.

Three views:
- **Merchant console**: one store's rooms, refunds, security, decision log and customer desk.
- **Mission control** (`copilot.html#mission`): every merchant's agents and every agent-to-agent message, live
  from `/api/mission` and `/api/mission/stream`, with a "who talks to whom" graph and full room threads.
- **System design**: the design doc.

- `src/Main.elm`: console (rooms, refunds, security, decision log, customer desk, simulated calls)
- `src/Data.elm`: sample data and types
- `src/Mission.elm`: mission control (fleet snapshot, the wire, links graph, threads, SSE via ports)
- `src/Design.elm`: system design doc (Mermaid diagrams render via the `<mermaid-diagram>` element in `copilot.html`)
- `copilot.css`: styles, light and dark
