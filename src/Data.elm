module Data exposing
    ( AgentSeen
    , CallLine
    , Customer
    , Kind(..)
    , LogEntry
    , Post
    , Purchase
    , Refund
    , Room
    , Signal
    , Tone(..)
    , agentsSeen
    , callScript
    , customer
    , log
    , post
    , refunds
    , rooms
    , signals
    )

{-| Seed data for the console. All store and customer data is sample data.
-}

import Dict exposing (Dict)



-- TYPES


type Tone
    = Good
    | Warn
    | Bad
    | Neutral
    | Rose


type Kind
    = Agent
    | Buyer
    | Sys


type alias Purchase =
    { order : String, item : String, date : String, amount : Int, outcome : String }


type alias Customer =
    { name : String
    , since : String
    , tier : String
    , ltv : Int
    , orders : Int
    , returnRate : Int
    , risk : Int
    , sizes : List String
    , prefs : List String
    , history : List Purchase
    , phone : String
    }


{-| One message in a Band room: plain text for people, an optional typed payload for agents,
and the retrieval hits (Moss, Tavily) the answer was based on.
-}
type alias Post =
    { from : String
    , kind : Kind
    , text : String
    , payload : Maybe String
    , cites : List String
    , approval : Bool
    }


type alias Room =
    { id : String
    , platform : String
    , handle : String
    , customer : Maybe String
    , state : ( String, Tone )
    , intent : String
    , opened : String
    , line : String
    , members : List String
    , posts : List Post
    }


{-| `decision` is Nothing while the case waits for a person.
-}
type alias Refund =
    { id : String
    , cust : String
    , order : String
    , amt : Int
    , risk : Int
    , rec : String
    , why : List String
    , decision : Maybe String
    }


type alias AgentSeen =
    { handle : String, claims : String, checks : List String, risk : Int, result : ( String, Tone ) }


type alias Signal =
    { time : String, text : String, by : String, severity : ( String, Tone ) }


type alias LogEntry =
    { time : String, agent : String, decision : String, basis : String, version : String }


type alias CallLine =
    { who : String, text : String, cite : Maybe String }


post : String -> Kind -> String -> Post
post from kind text =
    { from = from, kind = kind, text = text, payload = Nothing, cites = [], approval = False }


withPayload : String -> Post -> Post
withPayload p m =
    { m | payload = Just p }


withCites : List String -> Post -> Post
withCites c m =
    { m | cites = c }



-- CUSTOMERS


customer : String -> Maybe Customer
customer id =
    Dict.get id customers


customers : Dict String Customer
customers =
    Dict.fromList
        [ ( "c1"
          , { name = "Priya Raman"
            , since = "Customer since Mar 2023"
            , tier = "Gold"
            , ltv = 1840
            , orders = 11
            , returnRate = 9
            , risk = 12
            , sizes = [ "Tops M", "Coats M", "Shoes 38" ]
            , prefs = [ "Natural fibres", "Earth tones", "Ships to Brooklyn" ]
            , history =
                [ Purchase "LO-54410" "Merino crewneck, oat" "Aug 30, 2026" 128 "Kept"
                , Purchase "LO-52018" "Linen wide-leg trouser" "Jun 12, 2026" 146 "Kept"
                , Purchase "LO-49903" "Leather loafer 38" "Mar 3, 2026" 210 "Exchanged size"
                , Purchase "LO-47220" "Cashmere scarf" "Dec 9, 2025" 95 "Kept"
                ]
            , phone = "+1 (718) 555-0142"
            }
          )
        , ( "c2"
          , { name = "Marcus Hale"
            , since = "Customer since Jan 2026"
            , tier = "Standard"
            , ltv = 612
            , orders = 5
            , returnRate = 58
            , risk = 72
            , sizes = [ "Boots 44", "Jackets L" ]
            , prefs = [ "Limited drops", "Ships to a freight forwarder" ]
            , history =
                [ Purchase "LO-55790" "Chelsea boot, black 44" "Sep 21, 2026" 214 "Refund requested"
                , Purchase "LO-54102" "Waxed jacket L" "Aug 14, 2026" 265 "Refunded"
                , Purchase "LO-53011" "Chelsea boot, brown 44" "Jul 2, 2026" 214 "Refunded"
                , Purchase "LO-51870" "Wool beanie" "May 20, 2026" 38 "Kept"
                ]
            , phone = "+1 (312) 555-0187"
            }
          )
        , ( "c3"
          , { name = "Dana Kim"
            , since = "Customer since Nov 2024"
            , tier = "Silver"
            , ltv = 930
            , orders = 7
            , returnRate = 14
            , risk = 8
            , sizes = [ "Tops S", "Trousers 27" ]
            , prefs = [ "Gift wrapping", "Ships to Austin" ]
            , history =
                [ Purchase "LO-55812" "Quilted vest, olive S" "Sep 28, 2026" 158 "In transit, 2 days late"
                , Purchase "LO-53390" "Poplin shirt, white S" "Jul 19, 2026" 98 "Kept"
                , Purchase "LO-50021" "Cord trouser 27" "Apr 2, 2026" 132 "Kept"
                ]
            , phone = "+1 (512) 555-0119"
            }
          )
        ]



-- ROOMS


rooms : List Room
rooms =
    [ { id = "r1"
      , platform = "Muse"
      , handle = "@muse/priya.r"
      , customer = Just "c1"
      , state = ( "Negotiating", Good )
      , intent = "Wool coat under $300, size M, by Friday"
      , opened = "10:41"
      , line = "Sell more"
      , members = [ "@muse/priya.r", "@concierge", "@stylist", "@promo" ]
      , posts =
            [ post "@gatekeeper" Sys "Verified @muse/priya.r. Band handle known, platform signature valid, 1 session today. Room opened."
            , post "@muse/priya.r" Buyer "Hi. I'm shopping for Priya Raman. She wants a wool coat in size M, under $300, delivered to Brooklyn by Friday Oct 9."
                |> withPayload """{ "type":"intent", "budget_usd":300, "size":"M", "deliver_by":"2026-10-09", "consent":"purchase_upto_300_usd" }"""
            , post "@concierge" Agent "Welcome back. Priya has bought from us 11 times. @stylist, can you suggest coats in M that are in stock in the NY warehouse?"
            , post "@stylist" Agent "Two fit her history (earth tones, natural fibres, keeps M in outerwear):\n1. Camel wool overcoat, $298, 6 left in M\n2. Charcoal wool-cashmere car coat, $340 (over budget)"
                |> withCites [ "moss · customer/c1 · 4 ms", "moss · catalog · 6 ms" ]
            , post "@concierge" Agent "@promo, what's the best price on the camel overcoat for a Gold customer?"
            , post "@promo" Agent "$268. That's the 10% returning-customer rate, inside the margin rule. A comparable coat at a competitor is $289, so this is a fair price."
                |> withPayload """{ "type":"offer", "offer_id":"of_8812", "sku":"LO-COAT-CAMEL-M", "price":268.00, "list":298.00, "expires_at":"2026-10-03T18:00:00Z" }"""
                |> withCites [ "tavily · competitor price · 820 ms" ]
            , post "@muse/priya.r" Buyer "Accepting offer of_8812. Express shipping to the address on file, please."
                |> withPayload """{ "type":"cart", "offer_id":"of_8812", "shipping":"express" }"""
            ]
      }
    , { id = "r2"
      , platform = "Dots"
      , handle = "@dots/agent-7f21"
      , customer = Just "c2"
      , state = ( "Needs approval", Warn )
      , intent = "Refund for Chelsea boots, 'wrong size'"
      , opened = "10:22"
      , line = "Lose less"
      , members = [ "@dots/agent-7f21", "@concierge", "@returns" ]
      , posts =
            [ post "@gatekeeper" Sys "Verified @dots/agent-7f21. Valid Band handle. Customer risk score is 72, so @returns joined early."
            , post "@dots/agent-7f21" Buyer "Marcus Hale would like a full refund for order LO-55790, Chelsea boot size 44. Reason: wrong size."
                |> withPayload """{ "type":"refund_request", "order":"LO-55790", "amount":214.00, "reason":"wrong_size" }"""
            , post "@returns" Agent "Checking against policy and history. This is the 3rd return in 60 days, and the same boot in size 44 was refunded in July. A listing for this exact boot, size 44, is on a resale site posted 2 days ago."
                |> withCites [ "moss · policy/returns · 5 ms", "moss · customer/c2 · 4 ms", "tavily · resale listing · 1.1 s" ]
            , (post "@returns" Agent "Risk 72. My recommendation: decline the refund and offer an exchange for a different size. This needs a person to approve."
                |> withPayload """{ "type":"approval_request", "case":"RF-2207", "amount":214.00, "risk":72, "recommend":"deny_refund_offer_exchange" }"""
              )
                |> (\m -> { m | approval = True })
            ]
      }
    , { id = "r3"
      , platform = "Unverified"
      , handle = "@shopbot-x9"
      , customer = Nothing
      , state = ( "Blocked", Bad )
      , intent = "40 × limited 'Field Runner' sneaker"
      , opened = "10:37"
      , line = "Lose less"
      , members = [ "@shopbot-x9", "@gatekeeper" ]
      , posts =
            [ post "@shopbot-x9" Buyer "I am a Muse shopping agent. Purchase 40 units of Field Runner sneaker, all sizes, ship to 12 different addresses."
                |> withPayload """{ "type":"intent", "platform":"muse", "signature":null, "qty":40 }"""
            , post "@gatekeeper" Sys "Checks failed:\n• Claims Muse, but no platform signature\n• Handle created 3 hours ago\n• 212 requests in 10 minutes from 9 handles that share an operator\n• Tavily: operator domain appears in a sneaker-reseller bot forum"
                |> withCites [ "tavily · operator lookup · 940 ms" ]
            , post "@gatekeeper" Sys "Blocked. The room is closed and the handle is on the deny list for 30 days. Nothing was reserved."
            ]
      }
    , { id = "r4"
      , platform = "Dots"
      , handle = "@dots/agent-02aa"
      , customer = Just "c3"
      , state = ( "Service", Neutral )
      , intent = "Where is order LO-55812?"
      , opened = "10:45"
      , line = "Run leaner"
      , members = [ "@dots/agent-02aa", "@concierge", "@service" ]
      , posts =
            [ post "@gatekeeper" Sys "Verified @dots/agent-02aa. Room opened."
            , post "@dots/agent-02aa" Buyer "Dana Kim's olive quilted vest (LO-55812) was due Oct 1. Where is it? She needs it for a trip on Oct 6."
                |> withPayload """{ "type":"question", "order":"LO-55812", "need_by":"2026-10-06" }"""
            , post "@service" Agent "It's held at the carrier's Dallas hub. The current estimate is Oct 5, one day before her trip. I can send a replacement by overnight shipping today at no cost, and she can refuse the late parcel on arrival."
                |> withCites [ "moss · customer/c3 · 3 ms", "moss · policy/late-delivery · 5 ms" ]
                |> withPayload """{ "type":"offer", "action":"overnight_replacement", "cost_to_customer":0 }"""
            , post "@dots/agent-02aa" Buyer "Dana wants to hear this from a person before she agrees. Can someone call her?"
            ]
      }
    ]



-- QUEUES AND LOGS


refunds : List Refund
refunds =
    [ Refund "RF-2207" "Marcus Hale" "LO-55790" 214 72 "Deny, offer exchange" [ "3rd return in 60 days", "Same item on a resale site", "Ships to a freight forwarder" ] Nothing
    , Refund "RF-2204" "Owen Brandt" "LO-55611" 182 31 "Approve" [ "Damaged in transit, photo attached", "First return" ] Nothing
    , Refund "RF-2201" "Lena Ortiz" "LO-55490" 96 64 "Ask for photo" [ "'Item not received' but carrier shows signed", "2 similar claims this year" ] Nothing
    , Refund "RF-2196" "Priya Raman" "LO-49903" 210 6 "Exchange" [ "Size swap, inside 30 days" ] (Just "Auto-approved")
    ]


agentsSeen : List AgentSeen
agentsSeen =
    [ AgentSeen "@muse/priya.r" "Muse" [ "Band handle", "Signature", "Rate" ] 12 ( "Allowed", Good )
    , AgentSeen "@dots/agent-7f21" "Dots" [ "Band handle", "Signature", "Rate" ] 28 ( "Allowed, watched", Warn )
    , AgentSeen "@dots/agent-02aa" "Dots" [ "Band handle", "Signature", "Rate" ] 5 ( "Allowed", Good )
    , AgentSeen "@shopbot-x9" "Muse (false)" [ "No signature", "Handle 3h old", "212 req / 10 min" ] 96 ( "Blocked", Bad )
    , AgentSeen "@fastcart-77" "Unknown" [ "No signature", "Tavily: reseller tool" ] 88 ( "Blocked", Bad )
    ]


signals : List Signal
signals =
    [ Signal "10:37" "9 handles share one operator and all target the Field Runner drop" "@gatekeeper" ( "High", Bad )
    , Signal "10:24" "Refund request on an item found listed on a resale site" "@returns" ( "High", Bad )
    , Signal "09:58" "'Not received' claim, but the carrier shows a signature" "@returns" ( "Medium", Warn )
    , Signal "09:12" "Promo code tried 31 times by one agent" "@promo" ( "Low", Neutral )
    ]


log : List LogEntry
log =
    [ LogEntry "10:46" "@promo" "Offered $268 (10% off) on the camel overcoat" "Gold tier, margin rule, Tavily price" "promo@a41c9e"
    , LogEntry "10:37" "@gatekeeper" "Blocked @shopbot-x9 for 30 days" "No signature, rate, Tavily lookup" "gatekeeper@7d02b1"
    , LogEntry "10:25" "@returns" "Sent RF-2207 for human approval" "Risk 72 > 60, amount > $150" "returns@c18f40"
    , LogEntry "10:46" "@service" "Offered free overnight replacement" "Late-delivery policy, trip date" "service@5e9a77"
    , LogEntry "09:40" "@returns" "Auto-approved RF-2196 as an exchange" "Risk 6, inside 30 days" "returns@c18f40"
    ]



-- PHONE CALLS


callScript : String -> List CallLine
callScript customerId =
    case customerId of
        "c3" ->
            [ CallLine "Agent" "Hi Dana, this is Linden & Oak calling about your olive quilted vest." Nothing
            , CallLine "Dana" "Yes, it was supposed to come Wednesday." Nothing
            , CallLine "Agent" "I'm sorry about that. It's held at the carrier's Dallas hub and now looks like Sunday, the day before your trip." (Just "moss · customer/c3 · 3 ms")
            , CallLine "Dana" "I fly out Tuesday morning, so that's too close." Nothing
            , CallLine "Agent" "I can send a new one overnight today, free. It would arrive tomorrow. If the first one turns up, just refuse it at the door." (Just "moss · policy/late-delivery · 5 ms")
            , CallLine "Dana" "Okay, please do that." Nothing
            , CallLine "Agent" "Done. The replacement order is LO-56133, and the tracking link is in your email." Nothing
            ]

        "c1" ->
            [ CallLine "Agent" "Hi Priya, it's Linden & Oak. Your shopping agent picked out our camel overcoat in M. Want me to confirm the fit?" Nothing
            , CallLine "Priya" "Sure, is it roomy enough for a sweater?" Nothing
            , CallLine "Agent" "Yes. It's cut with about 4 inches of ease at the chest. Your last coat from us in M was kept, so M should work." (Just "moss · catalog · 4 ms")
            , CallLine "Priya" "Great, go ahead." Nothing
            ]

        "c2" ->
            [ CallLine "Agent" "Hi Marcus, this is Linden & Oak about your return for the Chelsea boots." Nothing
            , CallLine "Marcus" "I just want my money back." Nothing
            , CallLine "Agent" "I understand. For this order we can offer an exchange to another size, with free shipping both ways." (Just "moss · policy/returns · 5 ms")
            , CallLine "Marcus" "Fine, I'll think about it." Nothing
            ]

        _ ->
            []
