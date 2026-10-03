port module Mission exposing (Model, Msg, init, subscriptions, update, view)

{-| Mission control: every merchant's agents and every agent-to-agent message, in one place.

Reads the Tabard API at /api/mission (snapshot, wire, links, room threads) and its SSE stream.
When the API can't be reached it shows sample data and keeps retrying.

-}

import Data exposing (Kind(..), Post, Room, Tone(..))
import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as D exposing (Decoder)
import Set exposing (Set)
import Svg
import Svg.Attributes as SA
import Time


port missionConnect : String -> Cmd msg


port missionEvent : (D.Value -> msg) -> Sub msg


port missionStatus : (String -> msg) -> Sub msg



-- TYPES


type alias Totals =
    { merchants : Int
    , live : Int
    , openRooms : Int
    , messagesLastHour : Int
    , approvalsWaiting : Int
    , blockedToday : Int
    , revenueToday : Int
    }


type alias AgentInfo =
    { key : String
    , handle : String
    , name : String
    , line : String
    , enabled : Bool
    , busy : Bool
    , zoowork : Bool
    , messagesLastHour : Int
    }


type alias Merchant =
    { id : Int
    , name : String
    , category : String
    , live : Bool
    , openRooms : Int
    , approvalsWaiting : Int
    , blockedToday : Int
    , revenueToday : Int
    , ordersToday : Int
    , lastActivity : Maybe String
    , agents : List AgentInfo
    }


type alias Snapshot =
    { totals : Totals, merchants : List Merchant }


type alias WireItem =
    { id : Int
    , time : String
    , merchantId : Int
    , merchant : String
    , roomId : String
    , roomKind : String
    , platform : String
    , from : String
    , fromRole : String
    , to : List String
    , text : String
    , cites : List String
    , source : Maybe String
    }


type alias Link =
    { from : String, to : String, count : Int }


type Conn
    = Connecting
    | Live
    | Polling
    | Offline


{-| Which conversations a message belongs to. Across: a merchant agent and an outside agent.
Inside: merchant agents handing work to each other. Staff: a person stepped in. System: gatekeeper notes.
-}
type Lane
    = Across
    | Inside
    | Staff
    | System


type Thread
    = NoThread
    | Loading WireItem
    | Loaded WireItem Room
    | Failed WireItem


type alias Model =
    { api : String
    , conn : Conn
    , totals : Totals
    , merchants : List Merchant
    , wire : List WireItem -- newest first
    , pending : List WireItem -- held while paused, newest first
    , serverLinks : Maybe (List Link)
    , paused : Bool
    , merchantFilter : Maybe Int
    , handleFilter : Maybe String
    , platformFilter : String
    , lanes : Set String
    , search : String
    , thread : Thread
    }


wireCap : Int
wireCap =
    400


init : String -> ( Model, Cmd Msg )
init api =
    ( { api = api
      , conn = Connecting
      , totals = sampleTotals
      , merchants = sampleMerchants
      , wire = sampleWire
      , pending = []
      , serverLinks = Nothing
      , paused = False
      , merchantFilter = Nothing
      , handleFilter = Nothing
      , platformFilter = ""
      , lanes = Set.fromList [ "across", "inside", "staff" ]
      , search = ""
      , thread = NoThread
      }
    , fetchSnapshot api
    )



-- HTTP


fetchSnapshot : String -> Cmd Msg
fetchSnapshot api =
    Http.get { url = api ++ "/mission", expect = Http.expectJson GotSnapshot snapshotDecoder }


fetchWire : String -> Maybe Int -> Cmd Msg
fetchWire api after =
    Http.get
        { url =
            api
                ++ "/mission/wire?limit=200"
                ++ (after |> Maybe.map (\a -> "&after=" ++ String.fromInt a) |> Maybe.withDefault "")
        , expect = Http.expectJson GotWire (D.list wireDecoder)
        }


fetchLinks : String -> Cmd Msg
fetchLinks api =
    Http.get { url = api ++ "/mission/links?minutes=60", expect = Http.expectJson GotLinks (D.list linkDecoder) }


fetchThread : String -> WireItem -> Cmd Msg
fetchThread api item =
    Http.get
        { url = api ++ "/mission/rooms/" ++ String.fromInt item.merchantId ++ "/" ++ item.roomId
        , expect = Http.expectJson (GotThread item) (D.field "room" roomDecoder)
        }



-- UPDATE


type Msg
    = GotSnapshot (Result Http.Error Snapshot)
    | GotWire (Result Http.Error (List WireItem))
    | GotLinks (Result Http.Error (List Link))
    | GotThread WireItem (Result Http.Error Room)
    | StreamStatus String
    | StreamEvent D.Value
    | Poll
    | Retry
    | RefreshLinks
    | TogglePause
    | FilterMerchant (Maybe Int)
    | FilterHandle (Maybe String)
    | FilterPlatform String
    | ToggleLane String
    | Search String
    | Open WireItem
    | CloseThread


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotSnapshot (Ok snap) ->
            let
                firstContact =
                    model.conn == Connecting || model.conn == Offline
            in
            ( { model
                | totals = snap.totals
                , merchants = snap.merchants
                , conn =
                    if firstContact then
                        Polling

                    else
                        model.conn
                , wire =
                    if firstContact then
                        []

                    else
                        model.wire
                , thread =
                    if firstContact then
                        NoThread

                    else
                        model.thread
              }
            , if firstContact then
                Cmd.batch [ fetchWire model.api Nothing, fetchLinks model.api, missionConnect (model.api ++ "/mission/stream") ]

              else
                Cmd.none
            )

        GotSnapshot (Err _) ->
            if model.conn == Connecting || model.conn == Offline then
                ( { model | conn = Offline }, Cmd.none )

            else
                ( model, Cmd.none )

        GotWire (Ok items) ->
            ( ingest (List.reverse items) model, Cmd.none )

        GotWire (Err _) ->
            ( model, Cmd.none )

        GotLinks (Ok ls) ->
            ( { model | serverLinks = Just ls }, Cmd.none )

        GotLinks (Err _) ->
            ( model, Cmd.none )

        GotThread item (Ok room) ->
            ( { model | thread = Loaded item room }, Cmd.none )

        GotThread item (Err _) ->
            ( { model | thread = Failed item }, Cmd.none )

        StreamStatus "open" ->
            if model.conn == Offline then
                ( model, Cmd.none )

            else
                ( { model | conn = Live }, Cmd.none )

        StreamStatus _ ->
            if model.conn == Live then
                ( { model | conn = Polling }, Cmd.none )

            else
                ( model, Cmd.none )

        StreamEvent value ->
            case D.decodeValue eventDecoder value of
                Ok (WireEvent item) ->
                    ( ingest [ item ] model, Cmd.none )

                Ok (TotalsEvent t) ->
                    ( { model | totals = t }, Cmd.none )

                Ok (MerchantEvent m) ->
                    ( { model
                        | merchants =
                            if List.any (\x -> x.id == m.id) model.merchants then
                                List.map
                                    (\x ->
                                        if x.id == m.id then
                                            m

                                        else
                                            x
                                    )
                                    model.merchants

                            else
                                model.merchants ++ [ m ]
                      }
                    , Cmd.none
                    )

                Err _ ->
                    ( model, Cmd.none )

        Poll ->
            ( model, Cmd.batch [ fetchWire model.api (lastId model), fetchSnapshot model.api ] )

        Retry ->
            ( model, fetchSnapshot model.api )

        RefreshLinks ->
            ( model, fetchLinks model.api )

        TogglePause ->
            if model.paused then
                ( { model | paused = False, wire = List.take wireCap (model.pending ++ model.wire), pending = [] }, Cmd.none )

            else
                ( { model | paused = True }, Cmd.none )

        FilterMerchant m ->
            ( { model | merchantFilter = m }, Cmd.none )

        FilterHandle h ->
            ( { model | handleFilter = h }, Cmd.none )

        FilterPlatform p ->
            ( { model | platformFilter = p }, Cmd.none )

        ToggleLane key ->
            ( { model
                | lanes =
                    if Set.member key model.lanes then
                        Set.remove key model.lanes

                    else
                        Set.insert key model.lanes
              }
            , Cmd.none
            )

        Search s ->
            ( { model | search = s }, Cmd.none )

        Open item ->
            if model.conn == Offline then
                ( { model | thread = sampleThread item }, Cmd.none )

            else
                ( { model | thread = Loading item }, fetchThread model.api item )

        CloseThread ->
            ( { model | thread = NoThread }, Cmd.none )


{-| Add new items (newest first), skipping ones already seen. Paused: hold them aside.
-}
ingest : List WireItem -> Model -> Model
ingest items model =
    let
        seen =
            Set.fromList (List.map .id (model.pending ++ model.wire))

        fresh =
            List.filter (\i -> not (Set.member i.id seen)) items
    in
    if List.isEmpty fresh then
        model

    else if model.paused then
        { model | pending = List.take wireCap (fresh ++ model.pending) }

    else
        { model | wire = List.take wireCap (fresh ++ model.wire) }


lastId : Model -> Maybe Int
lastId model =
    List.maximum (List.map .id (model.pending ++ model.wire))


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ missionEvent StreamEvent
        , missionStatus StreamStatus
        , case model.conn of
            Offline ->
                Time.every 10000 (\_ -> Retry)

            Polling ->
                Time.every 3000 (\_ -> Poll)

            _ ->
                Sub.none
        , if model.conn == Live || model.conn == Polling then
            Time.every 15000 (\_ -> RefreshLinks)

          else
            Sub.none
        ]



-- CLASSIFY


merchantHandles : Model -> Set String
merchantHandles model =
    model.merchants
        |> List.concatMap (.agents >> List.map .handle)
        |> (++) [ "@gatekeeper", "@concierge", "@stylist", "@promo", "@service", "@returns" ]
        |> Set.fromList


lane : Set String -> WireItem -> Lane
lane ours item =
    case item.fromRole of
        "sys" ->
            System

        "staff" ->
            Staff

        "agent" ->
            if not (List.isEmpty item.to) && List.all (\h -> Set.member h ours) item.to then
                Inside

            else
                Across

        _ ->
            Across


laneKey : Lane -> String
laneKey l =
    case l of
        Across ->
            "across"

        Inside ->
            "inside"

        Staff ->
            "staff"

        System ->
            "sys"


{-| Outside agents collapse to their platform, so the graph stays readable: @muse/priya.r -> @muse/*
-}
collapse : Set String -> String -> String -> String
collapse ours platform handle =
    if Set.member handle ours || String.startsWith "@staff" handle then
        handle

    else
        "@" ++ String.toLower platform ++ "/*"


visible : Model -> List WireItem
visible model =
    let
        ours =
            merchantHandles model

        q =
            String.toLower (String.trim model.search)

        matches item =
            (model.merchantFilter == Nothing || model.merchantFilter == Just item.merchantId)
                && (model.platformFilter == "" || item.platform == model.platformFilter)
                && Set.member (laneKey (lane ours item)) model.lanes
                && (case model.handleFilter of
                        Nothing ->
                            True

                        Just h ->
                            List.member h (List.map (collapse ours item.platform) (item.from :: item.to))
                   )
                && (q == "" || String.contains q (String.toLower (item.text ++ " " ++ item.from ++ " " ++ String.join " " item.to ++ " " ++ item.merchant)))
    in
    List.filter matches model.wire


{-| Server links when available (60-minute window); otherwise derived from the messages on screen.
-}
links : Model -> List Link
links model =
    case ( model.serverLinks, model.merchantFilter ) of
        ( Just ls, Nothing ) ->
            ls

        _ ->
            let
                ours =
                    merchantHandles model

                pairs =
                    model.wire
                        |> List.filter (\i -> model.merchantFilter == Nothing || model.merchantFilter == Just i.merchantId)
                        |> List.filter (\i -> i.fromRole /= "sys")
                        |> List.concatMap (\i -> List.map (\t -> ( collapse ours i.platform i.from, collapse ours i.platform t )) i.to)
            in
            pairs
                |> List.foldl (\p d -> Dict.update p (\c -> Just (Maybe.withDefault 0 c + 1)) d) Dict.empty
                |> Dict.toList
                |> List.map (\( ( from, to ), c ) -> Link from to c)



-- VIEW


view : Model -> Html Msg
view model =
    let
        items =
            visible model

        platforms =
            model.wire |> List.map .platform |> Set.fromList |> Set.toList
    in
    div [ class "mission" ]
        [ div [ class "mission-bar" ]
            [ connBadge model.conn
            , span [ class "note" ] [ text (connNote model) ]
            ]
        , div [ class "kpis six" ]
            [ kpi "Merchants" (String.fromInt model.totals.live ++ " / " ++ String.fromInt model.totals.merchants) "stores with agents on duty"
            , kpi "Rooms" (String.fromInt model.totals.openRooms) "open conversations with outside agents"
            , kpi "Traffic" (String.fromInt model.totals.messagesLastHour) "agent messages in the last hour"
            , kpi "Needs you" (String.fromInt model.totals.approvalsWaiting) "decisions waiting for a person"
            , kpi "Blocked" (String.fromInt model.totals.blockedToday) "bad bots turned away today"
            , kpi "Revenue" (money model.totals.revenueToday) "agent-assisted sales today"
            ]
        , div [ class "mission-grid" ]
            [ aside [ class "panel" ]
                [ div [ class "panel-h" ] [ span [ class "label" ] [ text "Merchants" ], span [ class "pill p-neutral num" ] [ text (String.fromInt (List.length model.merchants)) ] ]
                , ul [ class "rooms" ]
                    (li [] [ merchantAll model ] :: List.map (\m -> li [] [ merchantCard model m ]) model.merchants)
                ]
            , section [ class "panel" ]
                [ div [ class "panel-h" ]
                    [ span [ class "label" ] [ text "The wire · every agent message" ]
                    , button [ class "btn", onClick TogglePause ]
                        [ text
                            (if model.paused then
                                "Resume" ++ pendingNote model

                             else
                                "Pause"
                            )
                        ]
                    ]
                , div [ class "wire-filters" ]
                    [ laneToggle model "across" "Across companies"
                    , laneToggle model "inside" "Inside the store"
                    , laneToggle model "staff" "Staff"
                    , laneToggle model "sys" "System"
                    , select [ onInput FilterPlatform, attribute "aria-label" "Platform" ]
                        (option [ value "", selected (model.platformFilter == "") ] [ text "All platforms" ]
                            :: List.map (\p -> option [ value p, selected (model.platformFilter == p) ] [ text p ]) platforms
                        )
                    , input [ class "wire-search", placeholder "Search messages, handles, stores", value model.search, onInput Search ] []
                    ]
                , case model.handleFilter of
                    Just h ->
                        div [ class "wire-active" ] [ text "Showing messages to or from ", span [ class "chip" ] [ text h ], button [ class "btn", onClick (FilterHandle Nothing) ] [ text "Clear" ] ]

                    Nothing ->
                        text ""
                , if List.isEmpty items then
                    div [ class "empty" ] [ text "No messages match these filters yet." ]

                  else
                    div [ class "wire" ] (List.map (wireRow model) items)
                ]
            , aside [ class "mission-side" ]
                [ viewThread model
                , div [ class "panel" ]
                    [ div [ class "panel-h" ] [ span [ class "label" ] [ text "Who talks to whom" ], span [ class "note" ] [ text "click a handle to filter" ] ]
                    , graph model
                    ]
                ]
            ]
        ]


connBadge : Conn -> Html msg
connBadge conn =
    case conn of
        Live ->
            span [ class "pill p-good" ] [ span [ class "dot" ] [], text "Live stream" ]

        Polling ->
            span [ class "pill p-warn" ] [ text "Live · polling every 3 s" ]

        Connecting ->
            span [ class "pill p-neutral" ] [ text "Connecting…" ]

        Offline ->
            span [ class "pill p-rose" ] [ text "Offline · sample data" ]


connNote : Model -> String
connNote model =
    case model.conn of
        Offline ->
            "Can't reach " ++ model.api ++ "/mission. Start the Tabard API (cd server && npm run dev). Retrying every 10 s."

        _ ->
            "Reading " ++ model.api ++ "/mission · every merchant, every agent conversation"


pendingNote : Model -> String
pendingNote model =
    if List.isEmpty model.pending then
        ""

    else
        " (" ++ String.fromInt (List.length model.pending) ++ " new)"


kpi : String -> String -> String -> Html msg
kpi tag value_ note =
    div [ class "kpi" ] [ span [ class "tag" ] [ text tag ], b [ class "num" ] [ text value_ ], small [] [ text note ] ]


money : Int -> String
money n =
    let
        group s =
            if String.length s <= 3 then
                s

            else
                group (String.dropRight 3 s) ++ "," ++ String.right 3 s
    in
    "$" ++ group (String.fromInt n)


merchantAll : Model -> Html Msg
merchantAll model =
    button [ class "room", attribute "aria-current" (boolString (model.merchantFilter == Nothing)), onClick (FilterMerchant Nothing) ]
        [ span [ class "r1" ] [ span [ class "who" ] [ text "All merchants" ] ]
        , span [ class "intent" ] [ text (String.fromInt (List.length model.wire) ++ " messages on the wire") ]
        ]


merchantCard : Model -> Merchant -> Html Msg
merchantCard model m =
    button [ class "room", attribute "aria-current" (boolString (model.merchantFilter == Just m.id)), onClick (FilterMerchant (Just m.id)) ]
        [ span [ class "r1" ]
            [ span [ class "who" ] [ text m.name ]
            , if m.approvalsWaiting > 0 then
                span [ class "pill p-warn" ] [ text (String.fromInt m.approvalsWaiting ++ " need you") ]

              else if m.live then
                span [ class "pill p-good" ] [ text "Live" ]

              else
                span [ class "pill p-neutral" ] [ text "Idle" ]
            ]
        , span [ class "intent" ]
            [ text (m.category ++ " · " ++ String.fromInt m.openRooms ++ " rooms · " ++ money m.revenueToday ++ " · " ++ String.fromInt m.blockedToday ++ " blocked") ]
        , span [ class "agents-row" ] (List.map agentChip m.agents)
        , span [ class "handle" ] [ text ("last activity " ++ Maybe.withDefault "—" m.lastActivity) ]
        ]


agentChip : AgentInfo -> Html msg
agentChip a =
    span
        [ classList [ ( "chip", True ), ( "busy", a.busy ), ( "off", not a.enabled ) ]
        , title (a.name ++ " · " ++ a.line ++ " · " ++ String.fromInt a.messagesLastHour ++ " msgs/h · " ++ (if a.zoowork then "ZooWork" else "simulated"))
        ]
        [ text a.handle ]


laneToggle : Model -> String -> String -> Html Msg
laneToggle model key label =
    button [ class ("lane lane-" ++ key), attribute "aria-pressed" (boolString (Set.member key model.lanes)), onClick (ToggleLane key) ] [ text label ]


wireRow : Model -> WireItem -> Html Msg
wireRow model item =
    let
        l =
            laneKey (lane (merchantHandles model) item)

        isOpen =
            case model.thread of
                Loaded i _ ->
                    i.id == item.id

                Loading i ->
                    i.id == item.id

                Failed i ->
                    i.id == item.id

                NoThread ->
                    False
    in
    button [ class ("wire-row lane-" ++ l), attribute "aria-current" (boolString isOpen), onClick (Open item) ]
        [ span [ class "wire-meta" ]
            [ span [ class "mono" ] [ text item.time ]
            , span [ class "store-tag" ] [ text item.merchant ]
            , span [ class "route mono" ]
                [ span [ class ("who-" ++ item.fromRole) ] [ text item.from ]
                , if List.isEmpty item.to then
                    text ""

                  else
                    span [ class "arrow" ] [ text " → " ]
                , text (String.join ", " item.to)
                ]
            , case item.source of
                Just "zoowork" ->
                    span [ class "pill p-good src" ] [ text "ZooWork" ]

                Just "sim" ->
                    span [ class "pill p-neutral src" ] [ text "sim" ]

                _ ->
                    text ""
            ]
        , span [ class "wire-text" ] [ text item.text ]
        , if List.isEmpty item.cites then
            text ""

          else
            span [ class "cite" ] (List.map (\c -> span [ classList [ ( "tv", String.startsWith "tavily" c ) ] ] [ text c ]) item.cites)
        ]


viewThread : Model -> Html Msg
viewThread model =
    let
        frame item body =
            div [ class "panel thread" ]
                (div [ class "panel-h" ]
                    [ span [ class "label" ] [ text (item.merchant ++ " · room " ++ item.roomId) ]
                    , button [ class "btn", onClick CloseThread, attribute "aria-label" "Close thread" ] [ text "×" ]
                    ]
                    :: body
                )
    in
    case model.thread of
        NoThread ->
            text ""

        Loading item ->
            frame item [ div [ class "empty" ] [ text "Loading the room…" ] ]

        Failed item ->
            frame item [ div [ class "empty" ] [ text "Couldn't load this room." ] ]

        Loaded item room ->
            frame item
                [ div [ class "roomhead" ]
                    [ h2 [] [ text room.intent ]
                    , span [ class "meta" ] [ text (room.handle ++ " · via " ++ room.platform ++ " · " ++ room.line ++ " · opened " ++ room.opened) ]
                    , pill room.state
                    ]
                , div [ class "members" ] (List.map (\m -> span [ classList [ ( "chip", True ), ( "buyer", m == room.handle ) ] ] [ text m ]) room.members)
                , div [ class "feed thread-feed" ] (List.map (threadPost item) room.posts)
                ]


threadPost : WireItem -> Post -> Html msg
threadPost item p =
    let
        k =
            case p.kind of
                Buyer ->
                    "buyer"

                Sys ->
                    "sys"

                Agent ->
                    ""
    in
    div [ classList [ ( "msg " ++ k, True ), ( "hit", p.from == item.from && p.text == item.text ) ] ]
        [ div [ class "from" ] [ text p.from ]
        , div [ class "body" ]
            [ div [ class "text" ] [ text p.text ]
            , if List.isEmpty p.cites then
                text ""

              else
                div [ class "cite" ] (List.map (\c -> span [ classList [ ( "tv", String.startsWith "tavily" c ) ] ] [ text c ]) p.cites)
            , case p.payload of
                Just payload ->
                    div [ class "payload" ] [ text payload ]

                Nothing ->
                    text ""
            , if p.approval then
                div [ class "approve" ] [ span [] [ text "Waiting for a person. Decide it in the merchant's console." ] ]

              else
                text ""
            ]
        ]


pill : ( String, Tone ) -> Html msg
pill ( label, tone ) =
    span
        [ class
            ("pill "
                ++ (case tone of
                        Good ->
                            "p-good"

                        Warn ->
                            "p-warn"

                        Bad ->
                            "p-bad"

                        Neutral ->
                            "p-neutral"

                        Rose ->
                            "p-rose"
                   )
            )
        ]
        [ text label ]


boolString : Bool -> String
boolString b =
    if b then
        "true"

    else
        "false"



-- GRAPH


{-| Senders on the left, receivers on the right, one curve per pair; thicker means more messages.
-}
graph : Model -> Html Msg
graph model =
    let
        ls =
            links model |> List.sortBy (\l -> negate l.count) |> List.take 14

        total keep =
            ls |> List.filter keep |> List.map .count |> List.sum

        order side =
            ls
                |> List.map side
                |> Set.fromList
                |> Set.toList
                |> List.sortBy (\name -> negate (total (\l -> side l == name)))

        lefts =
            order .from

        rights =
            order .to

        rows =
            Basics.max (List.length lefts) (List.length rights)

        h =
            toFloat (Basics.max 1 rows) * 26 + 16

        yOf names name =
            names
                |> List.indexedMap Tuple.pair
                |> List.filter (\( _, n ) -> n == name)
                |> List.head
                |> Maybe.map (\( i, _ ) -> 16 + toFloat i * 26 + (toFloat (rows - List.length names) * 13))
                |> Maybe.withDefault 0

        maxCount =
            ls |> List.map .count |> List.maximum |> Maybe.withDefault 1 |> toFloat

        ours =
            merchantHandles model

        isOutside n =
            not (Set.member n ours) && not (String.startsWith "@staff" n)

        x1 =
            118

        x2 =
            182

        edge l =
            let
                ya =
                    yOf lefts l.from

                yb =
                    yOf rights l.to

                d =
                    "M" ++ f x1 ++ " " ++ f ya ++ " C" ++ f 150 ++ " " ++ f ya ++ " " ++ f 150 ++ " " ++ f yb ++ " " ++ f x2 ++ " " ++ f yb

                dim =
                    case model.handleFilter of
                        Just hf ->
                            hf /= l.from && hf /= l.to

                        Nothing ->
                            False
            in
            Svg.path
                [ SA.d d
                , SA.class
                    ("edge"
                        ++ (if isOutside l.from || isOutside l.to then
                                " across"

                            else
                                " inside"
                           )
                        ++ (if dim then
                                " dim"

                            else
                                ""
                           )
                    )
                , SA.strokeWidth (f (1.5 + 9 * toFloat l.count / maxCount))
                ]
                [ Svg.title [] [ Svg.text (l.from ++ " → " ++ l.to ++ ": " ++ String.fromInt l.count ++ " messages") ] ]

        nodeLabel anchor x names name =
            Svg.g
                [ SA.class
                    ("node"
                        ++ (if isOutside name then
                                " outside"

                            else
                                " ours"
                           )
                        ++ (if model.handleFilter == Just name then
                                " on"

                            else
                                ""
                           )
                    )
                , Html.Events.onClick
                    (FilterHandle
                        (if model.handleFilter == Just name then
                            Nothing

                         else
                            Just name
                        )
                    )
                ]
                [ Svg.circle [ SA.cx (f x), SA.cy (f (yOf names name)), SA.r "4" ] []
                , Svg.text_
                    [ SA.x
                        (f
                            (if anchor == "end" then
                                x - 8

                             else
                                x + 8
                            )
                        )
                    , SA.y (f (yOf names name + 4))
                    , SA.textAnchor anchor
                    ]
                    [ Svg.text (shorten name) ]
                ]
    in
    if List.isEmpty ls then
        div [ class "empty" ] [ text "No conversations yet." ]

    else
        div [ class "graph" ]
            [ Svg.svg [ SA.viewBox ("0 0 300 " ++ f h), SA.width "100%", attribute "role" "img", attribute "aria-label" "Who talks to whom" ]
                (List.map edge ls
                    ++ List.map (nodeLabel "end" x1 lefts) lefts
                    ++ List.map (nodeLabel "start" x2 rights) rights
                )
            , div [ class "legend" ]
                [ span [ class "k across" ] [ text "across companies" ]
                , span [ class "k inside" ] [ text "inside the store" ]
                ]
            ]


f : Float -> String
f =
    String.fromFloat


shorten : String -> String
shorten s =
    if String.length s > 17 then
        String.left 16 s ++ "…"

    else
        s



-- DECODERS


snapshotDecoder : Decoder Snapshot
snapshotDecoder =
    D.map2 Snapshot (D.field "totals" totalsDecoder) (D.field "merchants" (D.list merchantDecoder))


totalsDecoder : Decoder Totals
totalsDecoder =
    D.map7 Totals
        (intOr0 "merchants")
        (intOr0 "live")
        (intOr0 "openRooms")
        (intOr0 "messagesLastHour")
        (intOr0 "approvalsWaiting")
        (intOr0 "blockedToday")
        (intOr0 "revenueToday")


merchantDecoder : Decoder Merchant
merchantDecoder =
    D.succeed Merchant
        |> andMap (D.field "id" D.int)
        |> andMap (D.field "name" D.string)
        |> andMap (D.oneOf [ D.field "category" D.string, D.succeed "" ])
        |> andMap (boolOr False "live")
        |> andMap (intOr0 "openRooms")
        |> andMap (intOr0 "approvalsWaiting")
        |> andMap (intOr0 "blockedToday")
        |> andMap (intOr0 "revenueToday")
        |> andMap (intOr0 "ordersToday")
        |> andMap (D.maybe (D.field "lastActivity" D.string))
        |> andMap (D.oneOf [ D.field "agents" (D.list agentDecoder), D.succeed [] ])


agentDecoder : Decoder AgentInfo
agentDecoder =
    D.succeed AgentInfo
        |> andMap (D.field "key" D.string)
        |> andMap (D.field "handle" D.string)
        |> andMap (D.oneOf [ D.field "name" D.string, D.field "handle" D.string ])
        |> andMap (D.oneOf [ D.field "line" D.string, D.succeed "" ])
        |> andMap (boolOr True "enabled")
        |> andMap (boolOr False "busy")
        |> andMap (boolOr False "zoowork")
        |> andMap (intOr0 "messagesLastHour")


wireDecoder : Decoder WireItem
wireDecoder =
    D.succeed WireItem
        |> andMap (D.field "id" D.int)
        |> andMap (D.field "time" D.string)
        |> andMap (D.field "merchantId" D.int)
        |> andMap (D.field "merchant" D.string)
        |> andMap (D.field "roomId" D.string)
        |> andMap (D.oneOf [ D.field "roomKind" D.string, D.succeed "" ])
        |> andMap (D.oneOf [ D.field "platform" D.string, D.succeed "Unknown" ])
        |> andMap (D.field "from" D.string)
        |> andMap (D.oneOf [ D.field "fromRole" D.string, D.succeed "agent" ])
        |> andMap (D.oneOf [ D.field "to" (D.list D.string), D.succeed [] ])
        |> andMap (D.field "text" D.string)
        |> andMap (D.oneOf [ D.field "cites" (D.list D.string), D.succeed [] ])
        |> andMap (D.maybe (D.field "source" D.string))


linkDecoder : Decoder Link
linkDecoder =
    D.map3 Link (D.field "from" D.string) (D.field "to" D.string) (D.field "count" D.int)


type Event
    = WireEvent WireItem
    | TotalsEvent Totals
    | MerchantEvent Merchant


eventDecoder : Decoder Event
eventDecoder =
    D.field "type" D.string
        |> D.andThen
            (\t ->
                case t of
                    "message" ->
                        D.map WireEvent wireDecoder

                    "totals" ->
                        D.map TotalsEvent totalsDecoder

                    "merchant" ->
                        D.map MerchantEvent merchantDecoder

                    _ ->
                        D.fail ("unknown event " ++ t)
            )


{-| The Room shape from /console/rooms.
-}
roomDecoder : Decoder Room
roomDecoder =
    D.succeed Room
        |> andMap (D.field "id" D.string)
        |> andMap (D.oneOf [ D.field "platform" D.string, D.succeed "" ])
        |> andMap (D.field "handle" D.string)
        |> andMap (D.maybe (D.field "customerId" D.string))
        |> andMap (D.field "state" toneLabelDecoder)
        |> andMap (D.oneOf [ D.field "intent" D.string, D.succeed "" ])
        |> andMap (D.oneOf [ D.field "opened" D.string, D.succeed "" ])
        |> andMap (D.oneOf [ D.field "line" D.string, D.succeed "" ])
        |> andMap (D.oneOf [ D.field "members" (D.list D.string), D.succeed [] ])
        |> andMap (D.field "posts" (D.list postDecoder))


postDecoder : Decoder Post
postDecoder =
    D.map6 Post
        (D.field "from" D.string)
        (D.field "kind" D.string
            |> D.map
                (\k ->
                    case k of
                        "buyer" ->
                            Buyer

                        "sys" ->
                            Sys

                        _ ->
                            Agent
                )
        )
        (D.field "text" D.string)
        (D.maybe (D.field "payload" D.string))
        (D.oneOf [ D.field "cites" (D.list D.string), D.succeed [] ])
        (boolOr False "approval")


toneLabelDecoder : Decoder ( String, Tone )
toneLabelDecoder =
    D.map2 Tuple.pair
        (D.field "label" D.string)
        (D.field "tone" D.string
            |> D.map
                (\t ->
                    case t of
                        "good" ->
                            Good

                        "warn" ->
                            Warn

                        "bad" ->
                            Bad

                        "rose" ->
                            Rose

                        _ ->
                            Neutral
                )
        )


andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap =
    D.map2 (|>)


intOr0 : String -> Decoder Int
intOr0 name =
    D.oneOf [ D.field name D.int, D.succeed 0 ]


boolOr : Bool -> String -> Decoder Bool
boolOr default name =
    D.oneOf [ D.field name D.bool, D.succeed default ]



-- SAMPLE DATA (shown when the API is offline)


sampleTotals : Totals
sampleTotals =
    { merchants = 2, live = 0, openRooms = 6, messagesLastHour = List.length sampleWire, approvalsWaiting = 1, blockedToday = 2, revenueToday = 3412 }


sampleAgents : List AgentInfo
sampleAgents =
    [ AgentInfo "gatekeeper" "@gatekeeper" "Gatekeeper" "Lose less" True False False 4
    , AgentInfo "concierge" "@concierge" "Concierge" "All" True True False 9
    , AgentInfo "stylist" "@stylist" "Stylist" "Sell more" True False False 3
    , AgentInfo "promo" "@promo" "Promo engine" "Sell more" True False False 3
    , AgentInfo "service" "@service" "Service" "Run leaner" True False False 2
    , AgentInfo "returns" "@returns" "Risk screener" "Lose less" True False False 3
    ]


sampleMerchants : List Merchant
sampleMerchants =
    [ Merchant 1 "Linden & Oak" "DTC apparel" False 4 1 1 2140 9 (Just "10:46") sampleAgents
    , Merchant 2 "Kiln & Co" "Ceramics" False 2 0 1 1272 5 (Just "10:52") sampleAgents
    ]


{-| Linden & Oak's rooms come from the console's sample data; Kiln & Co gets two of its own.
-}
sampleRooms : List ( Int, String, Room )
sampleRooms =
    List.map (\r -> ( 1, "Linden & Oak", r )) Data.rooms
        ++ [ ( 2
             , "Kiln & Co"
             , { id = "k1"
               , platform = "Dots"
               , handle = "@dots/agent-91c2"
               , customer = Nothing
               , state = ( "Negotiating", Good )
               , intent = "Four speckled stoneware mugs, gift wrapped"
               , opened = "10:49"
               , line = "Sell more"
               , members = [ "@dots/agent-91c2", "@concierge", "@stylist", "@promo" ]
               , posts =
                    [ Data.post "@gatekeeper" Sys "Verified @dots/agent-91c2. Room opened."
                    , Data.post "@dots/agent-91c2" Buyer "Looking for a set of four speckled stoneware mugs as a wedding gift, under $120, gift wrapped."
                    , Data.post "@concierge" Agent "@stylist, which mug sets do we have four of in the speckled glaze?"
                    , { from = "@stylist", kind = Agent, text = "The Oatmeal Speckle mug, 12 oz: 23 in stock, $28 each. It's the most-gifted item this month.", payload = Nothing, cites = [ "moss · catalog · 5 ms" ], approval = False }
                    , Data.post "@concierge" Agent "@promo, can we bundle four with gift wrap?"
                    , { from = "@promo", kind = Agent, text = "Set of four for $104, gift wrap included. That's inside the bundle margin rule.", payload = Just """{ "type":"offer", "sku":"KC-MUG-OAT-x4", "price":104.00, "list":112.00 }""", cites = [ "tavily · competitor price · 760 ms" ], approval = False }
                    , Data.post "@dots/agent-91c2" Buyer "Accepting. Please include a card that says \"For Sam and Jo\"."
                    ]
               }
             )
           , ( 2
             , "Kiln & Co"
             , { id = "k2"
               , platform = "Unverified"
               , handle = "@mugflip-22"
               , customer = Nothing
               , state = ( "Blocked", Bad )
               , intent = "60 × limited ash-glaze plates"
               , opened = "10:52"
               , line = "Lose less"
               , members = [ "@mugflip-22", "@gatekeeper" ]
               , posts =
                    [ Data.post "@mugflip-22" Buyer "Buy 60 ash-glaze plates, the limited run. Ship to 15 addresses."
                    , { from = "@gatekeeper", kind = Sys, text = "No platform signature. Handle 2 hours old. Tavily: operator resells limited ceramics. Blocked for 30 days.", payload = Nothing, cites = [ "tavily · operator lookup · 880 ms" ], approval = False }
                    ]
               }
             )
           ]


sampleWire : List WireItem
sampleWire =
    let
        ours =
            Set.fromList [ "@gatekeeper", "@concierge", "@stylist", "@promo", "@service", "@returns" ]

        items =
            sampleRooms
                |> List.concatMap
                    (\( mid, mname, r ) ->
                        List.indexedMap
                            (\i p ->
                                { id = 0
                                , time = r.opened ++ ":" ++ String.padLeft 2 '0' (String.fromInt (modBy 60 (i * 9)))
                                , merchantId = mid
                                , merchant = mname
                                , roomId = r.id
                                , roomKind = r.line
                                , platform = r.platform
                                , from = p.from
                                , fromRole = sampleRole p
                                , to = recipients ours r p
                                , text = p.text
                                , cites = p.cites
                                , source = Just "sim"
                                }
                            )
                            r.posts
                    )
    in
    items
        |> List.sortBy .time
        |> List.indexedMap (\i item -> { item | id = i + 1 })
        |> List.reverse


sampleRole : Post -> String
sampleRole p =
    case p.kind of
        Buyer ->
            "buyer"

        Sys ->
            "sys"

        Agent ->
            if String.startsWith "@staff" p.from then
                "staff"

            else
                "agent"


{-| The same rule the API uses: @mentions in the text; otherwise agents speak to the buyer and buyers to the concierge.
-}
recipients : Set String -> Room -> Post -> List String
recipients ours room p =
    let
        mentioned =
            p.text
                |> String.words
                |> List.filter (String.startsWith "@")
                |> List.map (String.filter (\c -> Char.isAlphaNum c || List.member c [ '@', '/', '.', '-', '_' ]))
                |> List.map (\w -> if String.endsWith "." w then String.dropRight 1 w else w)
                |> List.filter (\w -> w /= p.from && (Set.member w ours || w == room.handle))
    in
    case p.kind of
        Sys ->
            []

        Buyer ->
            if List.isEmpty mentioned then
                [ "@concierge" ]

            else
                mentioned

        Agent ->
            if List.isEmpty mentioned then
                [ room.handle ]

            else
                mentioned


sampleThread : WireItem -> Thread
sampleThread item =
    case List.filter (\( mid, _, r ) -> mid == item.merchantId && r.id == item.roomId) sampleRooms |> List.head of
        Just ( _, _, room ) ->
            Loaded item room

        Nothing ->
            Failed item
