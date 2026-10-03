module Sponsors exposing (view)

{-| The Sponsors page: which sponsors Tabard uses, how, and where to see each one in the app.
Kept to what the code does; planned integrations are marked as planned.
-}

import Html exposing (..)
import Html.Attributes exposing (..)


type Status
    = InBuild
    | Planned


type alias Sponsor =
    { name : String
    , role : String
    , status : Status
    , summary : String
    , uses : List String
    , seeIt : String
    , code : List String
    }


sponsors : List Sponsor
sponsors =
    [ { name = "ZooWork"
      , role = "Agent runtime"
      , status = InBuild
      , summary = "Runs the merchant's agents as ZooWork managed agents on Claude Opus 5.5: one agent per store and role, created on first use with its role written into the agent's persona."
      , uses =
            [ "The promo engine and the concierge run on ZooWork by default; set ZOOWORK_AGENTS to move more roles over. Roles not on ZooWork fall back to built-in rules, and every message records which one answered (zoowork or sim)."
            , "Promo agent: picks the product, discount and ad copy. The store's rules still set price, margin, and when the owner has to approve."
            , "The same promo agent paints a 2400×840 billboard with ZooWork's designer skill; the owner chooses whether the shop's board shows it."
            , "Importer agent: turns scraped storefront text into a new shop."
            ]
      , seeIt = "Agents & integrations → Ads gallery; the ZooWork badge on messages in Mission control."
      , code = [ "server/src/zoowork.ts", "ZOOWORK_API_KEY", "ZOOWORK_AGENTS" ]
      }
    , { name = "Band"
      , role = "Agent-to-agent rooms"
      , status = InBuild
      , summary = "Every Tabard room is a real Band chat room. Seven Band agents take part: concierge, stylist, promo, service, returns, gatekeeper, and a shopper agent that speaks for Muse and Dots buyers."
      , uses =
            [ "Each message is posted to Band as the agent who said it, with @mentions for whoever should act."
            , "Handoffs run through Band: when the concierge @mentions the stylist or promo agent, that agent pulls the request from its own Band inbox (GET /messages/next), answers in the room, and marks it processed."
            , "Agents' reasoning is posted as thought events beside the messages."
            , "The owner can open a team room and @mention agents to discuss a plan."
            ]
      , seeIt = "Agents & integrations → Band status and agent rooms; Mission control shows every Band conversation across stores."
      , code = [ "server/src/band.ts", "api.band.ai /api/v1/agent/chats" ]
      }
    , { name = "Tavily"
      , role = "Web research"
      , status = InBuild
      , summary = "Brings the outside web into the store when the answer isn't in the merchant's own data."
      , uses =
            [ "Import a shop from a link (TikTok Shop, Amazon, Shopify or any site): Tavily Extract reads the storefront page, and Tavily Search fills in what the page hides or blocks."
            , "Competitor pricing: every promo offer is checked against the web. The competitor price is the median of the prices Tavily Search finds for that product."
            ]
      , seeIt = "Mission control and the merchant list (imported shops); promo offers cite \"tavily · N prices\"."
      , code = [ "server/src/importer.ts", "TAVILY_API_KEY" ]
      }
    , { name = "Moss"
      , role = "Fast retrieval"
      , status = Planned
      , summary = "Planned as the sub-10 ms lookup layer over the catalog, policies and customer history, fast enough for live phone calls."
      , uses =
            [ "Today the agents' \"moss · …\" citations are simulated labels showing where Moss lookups would go."
            , "Next: index catalog, policies and customer/{id}, and run a lookup on every chat and call turn."
            ]
      , seeIt = "System design → Phone calls and Getting real data."
      , code = []
      }
    , { name = "Entire"
      , role = "Agent provenance"
      , status = Planned
      , summary = "Planned for the development side: git checkpoints of the agent sessions behind each change to agent prompts, policies and code."
      , uses =
            [ "Today the decision log records an agent version on every decision (for example promo@a41c9e)."
            , "Next: link those versions to Entire checkpoints, so \"why did the screener start refusing this?\" has an answer."
            ]
      , seeIt = "Merchant console → Decision log."
      , code = []
      }
    ]


view : Html msg
view =
    let
        live =
            List.filter (\s -> s.status == InBuild) sponsors |> List.length
    in
    div [ class "sponsor-page" ]
        [ div [ class "sponsor-intro" ]
            [ span [ class "eyebrow" ] [ text "Sponsors" ]
            , h2 [] [ text "Who powers Tabard, and how" ]
            , p [ class "lede" ]
                [ text
                    (String.fromInt live
                        ++ " sponsors are wired into the running app; "
                        ++ String.fromInt (List.length sponsors - live)
                        ++ " are planned. Live connection status is on the Agents & integrations tab."
                    )
                ]
            ]
        , div [ class "sponsor-grid" ] (List.map card sponsors)
        , p [ class "note sponsor-foot" ]
            [ text "Also built with: Claude (Anthropic API) to structure imported shops, Elm, React, Node.js, Express and SQLite. Buyer agents (Muse, Dots) are simulated." ]
        ]


card : Sponsor -> Html msg
card s =
    article [ class "sp sponsor-card" ]
        [ div [ class "sponsor-head" ]
            [ span [ class "role" ] [ text s.role ]
            , case s.status of
                InBuild ->
                    span [ class "pill p-good" ] [ text "In the build" ]

                Planned ->
                    span [ class "pill p-neutral" ] [ text "Planned" ]
            ]
        , h3 [] [ text s.name ]
        , p [] [ text s.summary ]
        , span [ class "label" ] [ text "How we use it" ]
        , ul [] (List.map (\u -> li [] [ text u ]) s.uses)
        , span [ class "label" ] [ text "See it in the app" ]
        , p [ class "note" ] [ text s.seeIt ]
        , if List.isEmpty s.code then
            text ""

          else
            div [ class "cite" ] (List.map (\c -> span [] [ text c ]) s.code)
        ]
