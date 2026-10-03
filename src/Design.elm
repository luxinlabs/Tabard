module Design exposing (view)

{-| The system design doc: a long-form page with a sticky table of contents.
Diagrams render through the <mermaid-diagram> custom element defined in copilot.html.
-}

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "doc" ]
        [ nav [ class "toc", attribute "aria-label" "Design sections" ]
            (List.map (\( anchor, label ) -> a [ href ("#" ++ anchor) ] [ text label ]) toc)
        , div [ class "docbody" ]
            [ idea, architecture, sponsors, integrations, agents, protocol, flow, voice, frontEnd, mission, realData, dataModel, demo, risks ]
        ]


toc : List ( String, String )
toc =
    [ ( "d-idea", "The idea" )
    , ( "d-arch", "Architecture" )
    , ( "d-sponsors", "Sponsor roles" )
    , ( "d-live", "Sponsors, as built" )
    , ( "d-agents", "Merchant agents" )
    , ( "d-room", "Room protocol" )
    , ( "d-flow", "A session, step by step" )
    , ( "d-voice", "Phone calls" )
    , ( "d-front", "Front end" )
    , ( "d-mission", "Mission control" )
    , ( "d-realdata", "Getting real data" )
    , ( "d-data", "Data model" )
    , ( "d-demo", "Demo script" )
    , ( "d-risks", "Risks and open questions" )
    ]


docSection : String -> String -> String -> List (Html msg) -> Html msg
docSection anchor eyebrow title body =
    section [ id anchor ] (span [ class "eyebrow" ] [ text eyebrow ] :: h2 [] [ text title ] :: body)


diagram : String -> Html msg
diagram source =
    div [ class "diagram" ] [ node "mermaid-diagram" [ attribute "src" source ] [] ]


codeBlock : String -> Html msg
codeBlock source =
    pre [ class "code" ] [ text source ]


mono : String -> Html msg
mono s =
    span [ class "mono" ] [ text s ]


steps : List (List (Html msg)) -> Html msg
steps items =
    ol [ class "steps" ] (List.map (\content -> li [] [ div [] content ]) items)


card : String -> String -> List (Html msg) -> Html msg
card role title body =
    div [ class "sp" ] (span [ class "role" ] [ text role ] :: h3 [] [ text title ] :: body)



-- SECTIONS


idea : Html msg
idea =
    docSection "d-idea"
        "The idea"
        "Shoppers now arrive as agents. Tabard gives the merchant agents to answer them."
        [ p [ class "lede" ] [ text "When a buyer agent from Muse or Dots shows up, Tabard opens a Band room for that session. The merchant's own agents join it: they verify the buyer agent, advise, price, check out, handle returns and turn away bad bots. The owner watches every room live from one console and steps in only when an agent asks for approval." ]
        , p []
            [ text "Each merchant agent maps to one line of the P&L from the deck: "
            , b [] [ text "Sell more" ]
            , text " (stylist, promo, win-back), "
            , b [] [ text "Run leaner" ]
            , text " (service, store ops), "
            , b [] [ text "Lose less" ]
            , text " (returns screener, gatekeeper)."
            ]
        ]


architecture : Html msg
architecture =
    docSection "d-arch"
        "Architecture"
        "Five layers"
        [ p [] [ text "Buyer agents enter through a gatekeeper. Each session becomes a Band room. Merchant agents run as ZooWork managed agents, pull context from Moss and the web from Tavily, and act on the store through one commerce API. The Tabard API writes every room message and decision to SQLite and streams them out: per merchant to the console, and across all merchants to Mission control." ]
        , diagram architectureChart
        , div [ class "callout" ]
            [ b [] [ text "Build note." ]
            , text " Muse and Dots can't join Band rooms today. For the demo, build the buyer agents yourselves: a Claude agent on Band that plays \"Priya's Muse agent\", with a persona and a shopping goal. Keep the gatekeeper interface generic so a real buyer agent could connect later through an HTTP or MCP endpoint."
            ]
        ]


architectureChart : String
architectureChart =
    """flowchart LR
  subgraph S["Shopper side"]
    MU["Muse agent"]
    DO["Dots agent"]
    PH["Customer on phone"]
  end
  subgraph E["Entry"]
    GK["Gatekeeper<br/>identity + rate limit"]
    VO["Voice gateway<br/>LiveKit / Pipecat"]
  end
  subgraph B["Band"]
    RM(("Session room<br/>one per shopper"))
  end
  subgraph Z["ZooWork managed agents"]
    CO["Concierge"]
    ST["Stylist"]
    PR["Promo"]
    SV["Service"]
    RS["Returns screener"]
  end
  subgraph K["Knowledge and tools"]
    MO[("Moss indexes<br/>catalog, policy, customer")]
    TV["Tavily<br/>web search"]
    API["Store API<br/>orders, stock, refunds"]
  end
  subgraph T["Tabard API"]
    DB[("Express + SQLite<br/>rooms, messages, decisions")]
  end
  subgraph C["Tabard front end"]
    UI["Merchant console<br/>one store"]
    MC["Mission control<br/>every store"]
  end
  MU --> GK
  DO --> GK
  GK --> RM
  PH --> VO --> SV
  RM <--> CO
  CO -. "@mention" .-> ST
  CO -. "@mention" .-> PR
  CO -. "@mention" .-> SV
  CO -. "@mention" .-> RS
  ST --> MO
  SV --> MO
  RS --> MO
  PR --> TV
  GK --> TV
  RS --> API
  CO --> API
  RM -- "room events" --> DB
  RS -- "approval request" --> DB
  DB -- "SSE per merchant" --> UI
  DB -- "SSE fan-in" --> MC"""


integrations : Html msg
integrations =
    docSection "d-live"
        "Sponsors, as built"
        "How Band, ZooWork and Tavily run in the shop today"
        [ p [ class "lede" ] [ text "Each sponsor is wired into the running app, not just the design. The Agents & integrations tab shows their live status, every Band room, and the ads the promo agent made." ]
        , div [ class "sponsors" ]
            [ card "Agent-to-agent rooms"
                "Band"
                [ p [] [ text "Every Tabard room is a real Band chat room. Seven Band agents take part: concierge, stylist, promo, service, returns, gatekeeper, and a shopper agent that speaks for Muse and Dots buyers." ]
                , ul []
                    [ li [] [ text "Each message is posted as the agent who said it, with @mentions for whoever should act." ]
                    , li [] [ text "The concierge hands work to @stylist and @promo through Band: the specialist pulls the request from its own Band inbox (", mono "GET /messages/next", text "), answers in the room and marks it processed." ]
                    , li [] [ text "The owner opens team rooms and @mentions agents to discuss a plan." ]
                    ]
                ]
            , card "Managed agents"
                "ZooWork"
                [ p [] [ text "The promo engine and the concierge are ZooWork managed agents on Claude Opus 5.5, one per store and role, created on first use with the role in their persona." ]
                , ul []
                    [ li [] [ text "Promo agent picks the product, discount and copy; store rules still set price, margin and when the owner must approve." ]
                    , li [] [ text "The same agent paints a 2400×840 billboard with ZooWork's designer skill; the owner chooses whether the room's board shows it." ]
                    , li [] [ text "A shared importer agent turns scraped storefront text into a shop." ]
                    ]
                ]
            , card "Web research"
                "Tavily"
                [ p [] [ text "Brings the outside web into the store." ]
                , ul []
                    [ li [] [ text "Open a shop from a TikTok Shop, Amazon or any store link: Tavily Extract reads the page, Tavily Search fills in what the page hides." ]
                    , li [] [ text "Every promo offer is priced against the web: the competitor price is the median of prices Tavily finds for that product." ]
                    ]
                ]
            ]
        , h3 [] [ text "One shopping session, end to end" ]
        , diagram liveFlowChart
        ]


liveFlowChart : String
liveFlowChart =
    """sequenceDiagram
  participant B as Shopper agent (Band)
  participant C as @concierge (Band)
  participant S as @stylist (Band)
  participant P as @promo (Band + ZooWork)
  participant T as Tavily
  B->>C: "Do you have linen trousers in stock?"
  C->>S: @stylist suggest something in stock
  Note over S: pulls the request from its Band inbox
  S->>C: "Try the linen wide-leg trouser, 23 in stock"
  C->>P: @promo best price for this buyer?
  P->>T: competitor prices (when drafting offers)
  P->>B: "$131 for you (returning-customer rate)"
  B->>C: "Accepted. Checking out."
"""


sponsors : Html msg
sponsors =
    docSection "d-sponsors"
        "Sponsor roles"
        "Each sponsor does one clear job"
        [ div [ class "sponsors" ]
            [ card "Agent runtime"
                "ZooWork"
                [ p [] [ text "Hosts every merchant agent as a managed agent, with its tools and the store's knowledge." ]
                , ul []
                    [ li [] [ text "Concierge, stylist, promo, service, returns screener" ]
                    , li [] [ text "Human approval step for refunds over $150 and for any price override. This is the \"Approve\" button in the console." ]
                    , li [] [ text "Builder UI lets the merchant edit agent policy without code" ]
                    ]
                ]
            , card "Agent-to-agent channel"
                "Band"
                [ p [] [ text "One room per shopper session. The buyer agent, merchant agents and staff all share it." ]
                , ul []
                    [ li [] [ text "@mentions route work: the concierge mentions @returns, and only that agent reads the message" ]
                    , li [] [ text "Stable handles let the gatekeeper check who an agent is" ]
                    , li [] [ text "Staff join the same room to take over" ]
                    ]
                ]
            , card "Fast retrieval"
                "Moss"
                [ p [] [ text "Lookups under 10 ms over the catalog, policies and customer history. Fast enough for a live phone call." ]
                , ul []
                    [ li [] [ text "Indexes: ", mono "catalog", text ", ", mono "policies", text ", ", mono "customer/{id}" ]
                    , li [] [ text "Used by voice and chat agents on every turn" ]
                    , li [] [ text "Not a voice engine: pair it with LiveKit or Pipecat" ]
                    ]
                ]
            , card "Outside world"
                "Tavily"
                [ p [] [ text "Web search when the answer isn't in the store's own data." ]
                , ul []
                    [ li [] [ text "Promo: competitor prices for the same item" ]
                    , li [] [ text "Gatekeeper: look up an unknown agent operator or domain" ]
                    , li [] [ text "Returns: check a resale listing for an item reported as defective" ]
                    ]
                ]
            , card "Agent provenance"
                "Entire"
                [ p [] [ text "Checkpoints record the agent sessions behind each change to the agents' prompts, policies and code." ]
                , ul []
                    [ li [] [ text "The decision log shows which agent version made each call" ]
                    , li [] [ text "Lets you answer \"why did the screener start refusing this?\"" ]
                    , li [] [ text "Also documents your own hackathon build" ]
                    ]
                ]
            ]
        ]


agents : Html msg
agents =
    let
        row cells =
            tr [] (List.map (\c -> td [] [ text c ]) cells)
    in
    docSection "d-agents"
        "Merchant agents"
        "Who sits in the room"
        [ div [ class "tbl-wrap panel" ]
            [ table [ class "agents" ]
                [ thead [] [ tr [] (List.map (\h -> th [] [ text h ]) [ "Handle", "P&L line", "Job", "Tools", "Needs a person when" ]) ]
                , tbody []
                    [ row [ "@gatekeeper", "Lose less", "Verifies the buyer agent before a room opens. Rate-limits. Blocks bulk resale bots.", "Band identity, Tavily, risk rules", "Never. Blocks, then reports." ]
                    , row [ "@concierge", "All", "Speaks for the store in the room. Reads intent and @mentions the right specialist.", "Store API, Moss", "The buyer agent asks for a person" ]
                    , row [ "@stylist", "Sell more", "Recommends items using fit history and what's in stock.", "Moss catalog + customer", "Never" ]
                    , row [ "@promo", "Sell more", "Makes offers within margin rules. Checks competitor prices.", "Tavily, pricing rules", "Discount above 15%" ]
                    , row [ "@service", "Run leaner", "Order status, exchanges, sizing questions, phone calls.", "Store API, Moss, voice", "The customer is upset or the issue repeats" ]
                    , row [ "@returns", "Lose less", "Scores refund requests for abuse and checks them against policy.", "Store API, Moss policy, Tavily", "Over $150 or risk above 60" ]
                    ]
                ]
            ]
        ]


protocol : Html msg
protocol =
    docSection "d-room"
        "Room protocol"
        "Messages carry plain text and a typed payload"
        [ p [] [ text "Agents talk in natural language so humans can follow along, and attach a JSON payload so the other side can act on it without guessing. The console renders the text and shows the payload under it." ]
        , codeBlock """// buyer agent → room
{ "type": "intent",
  "on_behalf_of": { "email_hash": "sha256:9f2c…", "consent": "purchase_upto_300_usd" },
  "goal": "wool coat, size M, under $300, arrives by Fri Oct 9",
  "platform": "muse", "signature": "ed25519:…" }

// @promo → buyer agent
{ "type": "offer", "offer_id": "of_8812", "sku": "LO-COAT-CAMEL-M",
  "price": 268.00, "list": 298.00, "reason": "returning_customer_10pct",
  "expires_at": "2026-10-03T18:00:00Z" }

// @returns → console (needs a person)
{ "type": "approval_request", "case": "RF-2207", "amount": 214.00,
  "risk": 72, "signals": ["3rd return in 60d", "listed on resale site"],
  "recommend": "deny_refund_offer_exchange" }

Message types: intent · question · recommendation · offer · cart · checkout
               · refund_request · verdict · approval_request · handoff · block"""
        ]


flow : Html msg
flow =
    docSection "d-flow"
        "A session, step by step"
        "From buyer agent to order"
        [ diagram """sequenceDiagram
  participant B as Buyer agent (Muse)
  participant G as @gatekeeper
  participant R as Band room
  participant C as @concierge
  participant S as @stylist
  participant P as @promo
  participant U as Console (owner)
  B->>G: connect + signed intent
  G->>G: check handle, signature, rate
  G->>R: open room, invite buyer + concierge
  R-->>U: room.opened
  B->>R: intent: wool coat, M, under $300
  C->>S: @stylist suggest from stock + fit history
  S->>R: recommendation (2 coats, Moss hits)
  C->>P: @promo price for returning customer
  P->>R: offer $268 (Tavily: competitor at $289)
  B->>R: cart + checkout
  C->>R: order LO-56120 confirmed
  R-->>U: order.created, revenue +$268"""
        ]


voice : Html msg
voice =
    docSection "d-voice"
        "Phone calls"
        "The Call button on the customer desk"
        [ steps
            [ [ text "The owner clicks ", b [] [ text "Call customer" ], text ". The console asks the backend to start an outbound call through LiveKit or Pipecat with Twilio for the phone line. For the demo, a browser call is enough." ]
            , [ text "The ", b [] [ text "@service" ], text " agent runs the voice loop: speech to text, then the LLM, then text to speech." ]
            , [ text "On every caller turn, ", b [] [ text "Moss" ], text " searches ", mono "customer/{id}", text " and ", mono "policies", text " and adds the hits to the prompt. Lookups take under 10 ms, so the agent doesn't leave silence on the line." ]
            , [ text "The call transcript is posted into the same Band room, so the call and the agent chat end up in one history." ]
            ]
        ]


frontEnd : Html msg
frontEnd =
    docSection "d-front"
        "Front end"
        "One app, three views"
        [ p [] [ text "Merchant console is one store's view: everything is clickable from one screen, so a judge can follow a session without changing pages. Mission control is the view across every store. System design is this document." ]
        , div [ class "screens" ]
            [ card "Left" "Live rooms" [ p [] [ text "One row per Band room: which platform the buyer agent came from, its intent, and its state (negotiating, refund, service, blocked). Click a row to open it." ] ]
            , card "Center" "Room tabs" [ p [] [ text "Conversation (agent-to-agent transcript with payloads and the search hits behind each answer), Refunds (approval queue), Security & fraud (agents seen, signals), Decision log (with agent versions)." ] ]
            , card "Right" "Customer desk" [ p [] [ text "Who the buyer agent represents: lifetime value, return rate, risk, sizes, purchase history. The Call customer button starts a voice session with a live transcript." ] ]
            ]
        , h3 [] [ text "Stack" ]
        , ul []
            [ li [] [ b [] [ text "Front end:" ], text " Elm, compiled to one page (", mono "copilot.html", text "). Live events arrive over Server-Sent Events through a port; if the API is down, the app falls back to sample data and retries." ]
            , li [] [ b [] [ text "Backend:" ], text " the Tabard API, Node + Express + SQLite on port 4000. REST under ", mono "/api/merchants/:id/…", text " for one store, ", mono "/api/mission/…", text " across all stores, ", mono "/api/import/…", text " to create a merchant from a store link (Tavily gathers the data, Claude or rules structure it), and SSE streams for one store and for all of them. It runs a shop simulation for each merchant while someone is watching." ]
            , li [] [ b [] [ text "Agents:" ], text " ZooWork managed agents. Each one connects to Band through the Band SDK adapter." ]
            , li [] [ b [] [ text "Store:" ], text " a Shopify dev store, or a seeded mock API with ~40 products and ~20 customers." ]
            ]
        ]


mission : Html msg
mission =
    let
        row cells =
            tr [] (List.map (\c -> td [] [ c ]) cells)
    in
    docSection "d-mission"
        "Mission control"
        "Every merchant's agents, every conversation, one screen"
        [ p [ class "lede" ] [ text "The console shows one store. Mission control answers the operator's question for the whole fleet: which of our agents are talking to which outside agents right now, what are they saying, and where does a person need to step in." ]
        , div [ class "screens" ]
            [ card "Left" "Merchants" [ p [] [ text "Every store with its agents on duty, open rooms, revenue, bots blocked and decisions waiting. Click one to narrow everything to that store." ] ]
            , card "Center" "The wire" [ p [] [ text "Every agent message across all stores, newest first, as sender → receivers. Filter by lane, platform, handle or text. Pause holds new messages aside without losing them." ] ]
            , card "Right" "Thread + graph" [ p [] [ text "Click a message to open its whole room, with that message highlighted. The graph shows who talks to whom in the last hour; line weight is message count. Click a handle to filter the wire." ] ]
            ]
        , h3 [] [ text "Four lanes" ]
        , ul []
            [ li [] [ b [] [ text "Across companies." ], text " A merchant agent and an outside agent (Muse, Dots, an unverified bot). This is the new channel the product exists for." ]
            , li [] [ b [] [ text "Inside the store." ], text " Merchant agents handing work to each other: the concierge @mentions the stylist, the service agent hands a refund to @returns." ]
            , li [] [ b [] [ text "Staff." ], text " A person stepped into a room." ]
            , li [] [ b [] [ text "System." ], text " Gatekeeper verdicts and room notes." ]
            ]
        , h3 [] [ text "Who a message is to" ]
        , p [] [ text "Band rooms are group chats, so the API derives receivers: the handles @mentioned in the text; otherwise an agent or staff message goes to the room's buyer agent, and a buyer message goes to @concierge. System messages have no receiver, and a sender is never its own receiver. The graph collapses outside agents to their platform (", mono "@muse/*", text ", ", mono "@dots/*", text ", ", mono "@unverified/*", text ") so it stays readable." ]
        , h3 [] [ text "Endpoints" ]
        , div [ class "tbl-wrap panel" ]
            [ table [ class "agents" ]
                [ thead [] [ tr [] (List.map (\h -> th [] [ text h ]) [ "Endpoint", "Returns" ]) ]
                , tbody []
                    [ row [ text "GET /api/mission", text "Fleet totals, plus each merchant with its counts and agents (busy, enabled, ZooWork or simulated, messages in the last hour)" ]
                    , row [ text "GET /api/mission/wire", text "Agent messages oldest → newest. Filters: merchant, agent (matches sender or receiver), platform, after (message id, for polling), limit (≤ 500)" ]
                    , row [ text "GET /api/mission/links?minutes=60", text "Sender → receiver pairs with message counts, busiest first (window up to 24 h)" ]
                    , row [ text "GET /api/mission/rooms/:merchant/:room", text "One room's full thread, in the console's Room shape" ]
                    , row [ text "GET /api/mission/stream", text "SSE. On connect: totals and every merchant. Then message events as they happen, totals when they change (at most every 2 s), merchant events when a store's counts change" ]
                    ]
                ]
            ]
        , codeBlock """// one wire item
{ "id": 12345, "time": "10:41:03", "merchantId": 1, "merchant": "Linden & Oak",
  "roomId": "r88", "roomKind": "shop", "platform": "Muse",
  "from": "@promo", "fromRole": "agent", "to": ["@muse/priya.r"],
  "text": "$268. That's the 10% returning-customer rate…",
  "cites": ["tavily · competitor price · 820 ms"], "source": "zoowork" }

// stream events
{ "type": "message",  ...wire item }
{ "type": "totals",   "merchants": 2, "live": 2, "openRooms": 7, "messagesLastHour": 143,
                      "approvalsWaiting": 3, "blockedToday": 5, "revenueToday": 3412 }
{ "type": "merchant", ...one merchant from GET /api/mission }"""
        , div [ class "callout" ]
            [ b [] [ text "Reliability." ]
            , text " The view loads the snapshot and the last 200 messages over REST, then switches to the stream. If the stream drops, it polls the wire every 3 s with after=<last id> and drops duplicates by id. If the API is unreachable, it shows sample data and retries every 10 s. While a mission stream is open, every merchant with simulation on keeps running."
            ]
        ]


realData : Html msg
realData =
    let
        row cells =
            tr [] (List.map (\c -> td [] [ text c ]) cells)
    in
    docSection "d-realdata"
        "Getting real data"
        "From simulated buyer agents to real ones"
        [ p [ class "lede" ] [ text "Today the buyer agents are simulated. Most of what the console shows can come from real sources now. This section is the plan for the next team: what each source gives us, how it gets into Tabard, and which view shows it." ]
        , div [ class "callout" ]
            [ b [] [ text "What a merchant can and can't see." ]
            , text " A merchant sees what an agent sends to the store: who it is, what it searches, what it puts in the cart, and what it buys. It never sees the shopper's private chat with that agent. Design every feature around the first and never promise the second."
            ]
        , h3 [] [ text "Sources, in the order to build them" ]
        , div [ class "tbl-wrap panel" ]
            [ table [ class "agents" ]
                [ thead [] [ tr [] (List.map (\h -> th [] [ text h ]) [ "Source", "What we get", "How it enters Tabard", "Shows up in" ]) ]
                , tbody []
                    [ row [ "1. Tabard as the agent endpoint (MCP server + Universal Commerce Protocol)", "Real agent requests: catalog searches, questions, carts, checkouts", "Each merchant gets an MCP and UCP endpoint. Every tool call becomes a room message (role buyer), and our agents' replies are posted back. Test with Claude or ChatGPT connectors acting as the buyer agent.", "Rooms, the wire, who-talks-to-whom" ]
                    , row [ "2. Agent identity: Visa Trusted Agent Protocol / Web Bot Auth", "A signed identity on every agent request (HTTP Message Signatures, Ed25519), checked against Visa's key directory", "Gatekeeper middleware checks the signature before a room opens and stores the key id and result on the room. Or verify at the edge (Cloudflare, Akamai) and read the verdict header.", "Security & fraud, agents seen, blocked count" ]
                    , row [ "3. Shopify app (Admin API + webhooks)", "Orders, including Muse orders paid with Shop Pay; products, customers, returns", "OAuth app install per merchant. orders/create, refunds/create and returns webhooks write to transactions and approvals; the catalog sync feeds products and Moss.", "Revenue, purchase history, refunds queue" ]
                    , row [ "4. Stripe / PayPal webhooks", "Agentic checkouts (Stripe Link single-use cards, PayPal), refunds, disputes, Radar risk scores", "Payment webhooks attach to transactions; Radar and dispute signals add to the risk score.", "Revenue, fraud signals, risk score" ]
                    , row [ "5. Edge and bot logs (Cloudflare Logpush / bot analytics)", "Every agent and bot that touched the site, verified or not, request rates, blocks", "A periodic import into an agents_seen table, grouped by operator and signature status.", "Security & fraud, Mission control totals" ]
                    , row [ "6. Service channels (helpdesk, Twilio / LiveKit)", "Customer messages, call transcripts", "Helpdesk webhooks open service rooms; call transcripts go into the calls table and the room.", "Customer desk, calls, service rooms" ]
                    , row [ "7. Band rooms with partners", "True agent-to-agent conversation in a shared room", "Once a buyer platform or a partner's agent joins Band, rooms are live Band rooms instead of local ones. The room protocol stays the same.", "Everything; this is the end state" ]
                    ]
                ]
            ]
        , h3 [] [ text "One rule for the data model" ]
        , p [] [ text "Normalize every source into the tables we already have (rooms, messages, transactions, approvals, decisions) and record where each row came from in a source column. Real and simulated traffic can then run side by side, and the simulator can be switched off store by store as real sources come online." ]
        , ul []
            [ li [] [ b [] [ text "Today:" ], text " only messages and promos have ", mono "source", text ", with values ", mono "zoowork", text " (written by a ZooWork agent call), ", mono "sim", text " or null (people and fixed lines: buyer text, staff, system notes). The wire's source badge reads it." ]
            , li [] [ b [] [ text "Next:" ], text " add the new values ", mono "mcp", text ", ", mono "ucp", text ", ", mono "shopify", text ", ", mono "stripe", text ", ", mono "tap", text " and ", mono "cloudflare", text ", and add a source column to transactions, rooms, customers and products, which don't have one yet." ]
            , li [] [ b [] [ text "Not sources:" ], text " Band is a delivery channel, tracked separately in ", mono "messages.band_status", text " (sent | failed), ", mono "band_message_id", text " and ", mono "rooms.band_chat_id", text "; a message can be zoowork and sent over Band. Tavily is a lookup, recorded in a message's cites and in import sources." ]
            ]
        , h3 [] [ text "Privacy and consent" ]
        , ul []
            [ li [] [ text "Store only what agents send us. Hash emails and payment references, and keep raw request bodies only as long as disputes need them." ]
            , li [] [ text "Ask each merchant for the narrowest OAuth scopes (read orders, write refunds only if they turn on auto-refunds)." ]
            , li [] [ text "Show the merchant which sources are connected, and let them disconnect any of them." ]
            ]
        , h3 [] [ text "Open questions to check first" ]
        , ul []
            [ li [] [ text "How Shopify labels orders that Muse places through Shop Pay (sales channel, app id or order tags), so we can tell agent orders from human ones." ]
            , li [] [ text "Which buyer agents actually send Trusted Agent Protocol signatures today, and from which platforms." ]
            , li [] [ text "Whether Muse can find Shopify development stores, or only live stores in Shopify Catalog." ]
            , li [] [ text "How Dots connects to merchants (no public merchant integration found yet)." ]
            ]
        ]


dataModel : Html msg
dataModel =
    docSection "d-data"
        "Data model"
        "Thirteen tables, one SQLite file"
        [ p [] [ text "Every table except merchants carries merchant_id, so one database holds the whole fleet. Mission control reads across it; the console reads one merchant's slice." ]
        , codeBlock """merchants     (id, slug, name, category, owner, city, currency, timezone, plan,
               discount_cap, refund_review_over, risk_threshold, house_offer, simulate,
               description, source_url, source_platform, theme, import_notes)
agents        (merchant_id, key, handle, name, line, job, version, zoowork_agent_id, enabled, actions)
customers     (merchant_id, name, tier, ltv, return_rate, risk, phone, city, last_order)
products      (merchant_id, sku, name, category, price, cost, stock, sold, image_url, product_url)
rooms         (merchant_id, handle, platform, kind shop|service|bot, customer_id, intent,
               state open|sold|left|blocked|resolved, opened_at, closed_at)
messages      (merchant_id, room_id, sender, role buyer|agent|staff|sys, text, cites, source zoowork|sim)
tickets       (merchant_id, room_id, customer_id, topic, status agent|staff|resolved)
transactions  (merchant_id, code, sku, room_id, buyer_handle, customer_id, qty, amount,
               type order|refund, flags, status, screen)
calls         (merchant_id, customer_id, topic, status ringing|live|ended, staff, lines)
approvals     (merchant_id, code, customer_id, order_code, amount, risk, recommendation, reasons, status)
promos        (merchant_id, prompt, headline, sku, pct, price, margin, competitor, status draft|live|retired)
decisions     (merchant_id, agent, decision, basis, version, created_at)
events        (merchant_id, actor, text, kind, created_at)    -- the shop's activity feed"""
        ]


demo : Html msg
demo =
    docSection "d-demo"
        "Demo script"
        "Three minutes, three P&L lines, one fleet view"
        [ steps
            [ [ b [] [ text "Sell more." ], text " Priya's Muse agent asks for a wool coat. Stylist and promo answer in the room. The order lands and the revenue figure goes up." ]
            , [ b [] [ text "Lose less." ], text " A bot claiming to be Muse asks for 40 limited sneakers. The gatekeeper finds no valid signature, runs a Tavily lookup on the operator and blocks it. It shows up in the Security tab." ]
            , [ b [] [ text "Lose less." ], text " Marcus's Dots agent asks for a third refund. The screener flags a resale listing and sends it to the owner, who taps \"Offer exchange\"." ]
            , [ b [] [ text "Run leaner." ], text " From Dana's desk, click Call customer. The service agent explains the delivery delay, with the Moss lookups shown as they happen." ]
            , [ b [] [ text "Every store at once." ], text " Open Mission control. Both stores' agents talk on the wire live. Click @dots/* in the graph to see only Dots traffic, then open a room to read the whole thread." ]
            ]
        ]


risks : Html msg
risks =
    docSection "d-risks"
        "Risks and open questions"
        "Settle these first"
        [ ul []
            [ li [] [ b [] [ text "Real buyer agents." ], text " No public way exists yet for Muse or Dots to join a Band room. Simulate them, and say so in the pitch." ]
            , li [] [ b [] [ text "Identity." ], text " The \"signature\" check is a design placeholder. In the demo, the gatekeeper trusts known Band handles and a shared secret per simulated platform." ]
            , li [] [ b [] [ text "Voice in time." ], text " Phone calls are the riskiest part. Fallback: a browser voice session, or a scripted call that still makes live Moss lookups." ]
            , li [] [ b [] [ text "Entire's role." ], text " Entire works on the development side (git checkpoints of agent sessions), not at runtime. Show it in the decision log as agent versions, and don't present it as a runtime monitor." ]
            , li [] [ b [] [ text "Scope." ], text " Build three agents well (concierge, stylist, returns) before adding promo and service." ]
            ]
        ]
