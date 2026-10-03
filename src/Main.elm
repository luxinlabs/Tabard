port module Main exposing (main)

{-| Tabard merchant console. Rooms rail | room tabs | customer desk, plus the system design doc.
-}

import Browser
import Browser.Dom as Dom
import Data exposing (..)
import Design
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput, onSubmit)
import Mission
import Task
import Time


port saveView : String -> Cmd msg


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type View
    = Console
    | MissionControl
    | DesignDoc


type Tab
    = Conversation
    | Refunds
    | Security
    | DecisionLog


type Call
    = NoCall
    | OnCall Int
    | CallEnded


type alias Model =
    { view : View
    , tab : Tab
    , current : String
    , rooms : List Room
    , refunds : List Refund
    , log : List LogEntry
    , compose : String
    , call : Call
    , zone : Time.Zone
    , mission : Mission.Model
    }


{-| `saved` is the last view from localStorage ("" if none); `hash` is location.hash;
`api` is the Tabard API base URL, e.g. http://localhost:4000/api.
-}
type alias Flags =
    { saved : String, hash : String, api : String }


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        startView =
            if String.startsWith "#d-" flags.hash || flags.hash == "#design" || flags.saved == "design" then
                DesignDoc

            else if flags.hash == "#mission" || flags.saved == "mission" then
                MissionControl

            else
                Console

        ( mission, missionCmd ) =
            Mission.init flags.api
    in
    ( { view = startView
      , tab = Conversation
      , current = "r1"
      , rooms = Data.rooms
      , refunds = Data.refunds
      , log = Data.log
      , compose = ""
      , call = NoCall
      , zone = Time.utc
      , mission = mission
      }
    , Cmd.batch [ Task.perform GotZone Time.here, scrollToEnd "feed", Cmd.map MissionMsg missionCmd ]
    )



-- UPDATE


type Msg
    = NoOp
    | GotZone Time.Zone
    | SelectView View
    | SelectTab Tab
    | SelectRoom String
    | Decide String String
    | Decided String String Time.Posix
    | ComposeInput String
    | ComposeSubmit
    | TakeOver
    | StartCall
    | CallTick
    | EndCall
    | MissionMsg Mission.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        GotZone zone ->
            ( { model | zone = zone }, Cmd.none )

        SelectView v ->
            ( { model | view = v }, saveView (viewKey v) )

        SelectTab t ->
            ( { model | tab = t }
            , if t == Conversation then
                scrollToEnd "feed"

              else
                Cmd.none
            )

        SelectRoom id ->
            ( { model | current = id, tab = Conversation, call = NoCall }, scrollToEnd "feed" )

        Decide refId act ->
            ( model, Task.perform (Decided refId act) Time.now )

        Decided refId act now ->
            let
                entry =
                    { time = clock model.zone now
                    , agent = "@staff/you"
                    , decision = refId ++ ": " ++ act
                    , basis = "Approved in console"
                    , version = "—"
                    }

                decided =
                    { model
                        | refunds =
                            List.map
                                (\f ->
                                    if f.id == refId then
                                        { f | decision = Just act }

                                    else
                                        f
                                )
                                model.refunds
                        , log = entry :: model.log
                    }
            in
            if refId == "RF-2207" then
                ( decided
                    |> updateRoom "r2"
                        (\r ->
                            { r
                                | state = ( "Resolved", Neutral )
                                , posts = r.posts ++ [ post "@concierge" Agent ("The store's decision on " ++ refId ++ ": " ++ String.toLower act ++ ". I'll tell the buyer agent now.") ]
                            }
                        )
                , scrollToEnd "feed"
                )

            else
                ( decided, Cmd.none )

        ComposeInput s ->
            ( { model | compose = s }, Cmd.none )

        ComposeSubmit ->
            let
                text =
                    String.trim model.compose
            in
            if text == "" then
                ( model, Cmd.none )

            else
                ( { model | compose = "" }
                    |> updateRoom model.current (joinStaff >> addPost (post "@staff/you" Agent text))
                , scrollToEnd "feed"
                )

        TakeOver ->
            ( model
                |> updateRoom model.current
                    (joinStaff >> addPost (post "@staff/you" Sys "Staff joined the room. Agents will wait for you before replying to the buyer."))
            , Cmd.batch [ scrollToEnd "feed", Task.attempt (\_ -> NoOp) (Dom.focus "composeInput") ]
            )

        StartCall ->
            ( { model | call = OnCall 1 }, scrollToEnd "calllog" )

        CallTick ->
            case model.call of
                OnCall shown ->
                    if shown >= List.length (currentScript model) then
                        endCall model

                    else
                        ( { model | call = OnCall (shown + 1) }, scrollToEnd "calllog" )

                _ ->
                    ( model, Cmd.none )

        EndCall ->
            endCall model

        MissionMsg m ->
            let
                ( mission, cmd ) =
                    Mission.update m model.mission
            in
            ( { model | mission = mission }, Cmd.map MissionMsg cmd )


endCall : Model -> ( Model, Cmd Msg )
endCall model =
    case model.call of
        OnCall _ ->
            ( { model | call = CallEnded }
                |> updateRoom model.current
                    (addPost (post "@service" Sys "Phone call finished. Transcript attached to this room." |> (\m -> { m | cites = [ "voice · 1 call · moss lookups 3" ] })))
            , scrollToEnd "feed"
            )

        _ ->
            ( model, Cmd.none )


updateRoom : String -> (Room -> Room) -> Model -> Model
updateRoom id f model =
    { model
        | rooms =
            List.map
                (\r ->
                    if r.id == id then
                        f r

                    else
                        r
                )
                model.rooms
    }


joinStaff : Room -> Room
joinStaff r =
    if List.member "@staff/you" r.members then
        r

    else
        { r | members = r.members ++ [ "@staff/you" ] }


addPost : Post -> Room -> Room
addPost m r =
    { r | posts = r.posts ++ [ m ] }


currentRoom : Model -> Maybe Room
currentRoom model =
    List.filter (\r -> r.id == model.current) model.rooms |> List.head


currentScript : Model -> List CallLine
currentScript model =
    currentRoom model
        |> Maybe.andThen .customer
        |> Maybe.map callScript
        |> Maybe.withDefault []


scrollToEnd : String -> Cmd Msg
scrollToEnd id =
    Task.attempt (\_ -> NoOp) (Dom.setViewportOf id 0 1.0e9)


clock : Time.Zone -> Time.Posix -> String
clock zone t =
    pad (Time.toHour zone t) ++ ":" ++ pad (Time.toMinute zone t)


pad : Int -> String
pad =
    String.fromInt >> String.padLeft 2 '0'


viewKey : View -> String
viewKey v =
    case v of
        Console ->
            "console"

        MissionControl ->
            "mission"

        DesignDoc ->
            "design"



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ case model.call of
            OnCall _ ->
                Time.every 1600 (\_ -> CallTick)

            _ ->
                Sub.none
        , Sub.map MissionMsg (Mission.subscriptions model.mission)
        ]



-- VIEW


view : Model -> Html Msg
view model =
    div [ class "wrap" ]
        [ header [ class "top" ]
            [ div [ class "brand" ] [ h1 [] [ text "Tabard" ], span [] [ text "Merchant copilot · answers the shopper's agent" ] ]
            , div [ class "store" ] [ span [ class "dot" ] [], text " Linden & Oak · DTC apparel · agents online" ]
            ]
        , div [ class "views", attribute "role" "tablist", attribute "aria-label" "Views" ]
            [ tabButton "Merchant console" (model.view == Console) (SelectView Console)
            , tabButton "Mission control" (model.view == MissionControl) (SelectView MissionControl)
            , tabButton "System design" (model.view == DesignDoc) (SelectView DesignDoc)
            , span [ class "sample" ] [ text "Prototype · all store and customer data is sample data" ]
            ]
        , viewConsole model
        , main_ [ id "view-mission", hidden (model.view /= MissionControl) ] [ Html.map MissionMsg (Mission.view model.mission) ]

        -- The design doc stays laid out when off screen so its diagrams size correctly.
        , main_ [ id "view-design", classList [ ( "offstage", model.view /= DesignDoc ) ] ] [ Design.view ]
        ]


tabButton : String -> Bool -> Msg -> Html Msg
tabButton label selected msg =
    button [ attribute "role" "tab", ariaSelected selected, onClick msg ] [ text label ]


ariaSelected : Bool -> Attribute msg
ariaSelected b =
    attribute "aria-selected" (boolString b)


boolString : Bool -> String
boolString b =
    if b then
        "true"

    else
        "false"


pill : ( String, Tone ) -> Html msg
pill ( label, tone ) =
    span [ class ("pill " ++ toneClass tone) ] [ text label ]


toneClass : Tone -> String
toneClass tone =
    case tone of
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


riskTone : Int -> Tone
riskTone risk =
    if risk > 60 then
        Bad

    else if risk > 30 then
        Warn

    else
        Good


toneVar : Tone -> String
toneVar tone =
    case tone of
        Bad ->
            "var(--bad)"

        Warn ->
            "var(--warn)"

        _ ->
            "var(--good)"


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


customerName : Room -> String
customerName r =
    r.customer
        |> Maybe.andThen customer
        |> Maybe.map .name
        |> Maybe.withDefault "Unknown buyer"



-- CONSOLE


viewConsole : Model -> Html Msg
viewConsole model =
    let
        waiting =
            List.length (List.filter (\f -> f.decision == Nothing) model.refunds)
    in
    main_ [ id "view-console", hidden (model.view /= Console) ]
        [ div [ class "kpis" ]
            [ kpi "Revenue" "$3,412" "agent-assisted sales today · 14 orders"
            , kpi "Efficiency" "41" "service rooms closed without staff"
            , kpi "Risk" (String.fromInt waiting) "refunds waiting for your approval"
            , kpi "Risk" "17" "unverified bots refused entry"
            ]
        , div [ class "console" ]
            [ aside [ class "panel" ]
                [ div [ class "panel-h" ] [ span [ class "label" ] [ text "Live rooms" ], span [ class "pill p-neutral num" ] [ text (String.fromInt (List.length model.rooms)) ] ]
                , ul [ class "rooms" ] (List.map (viewRoomRow model.current) model.rooms)
                ]
            , section [ class "panel" ]
                [ div [ class "tabs", attribute "role" "tablist", attribute "aria-label" "Room views" ]
                    [ tabButton "Conversation" (model.tab == Conversation) (SelectTab Conversation)
                    , button [ attribute "role" "tab", ariaSelected (model.tab == Refunds), onClick (SelectTab Refunds) ]
                        [ text "Refunds", span [ class "count" ] [ text (String.fromInt waiting) ] ]
                    , tabButton "Security & fraud" (model.tab == Security) (SelectTab Security)
                    , tabButton "Decision log" (model.tab == DecisionLog) (SelectTab DecisionLog)
                    ]
                , viewTab model
                ]
            , aside [ class "panel desk" ] (viewDesk model)
            ]
        ]


kpi : String -> String -> String -> Html msg
kpi tag value note =
    div [ class "kpi" ] [ span [ class "tag" ] [ text tag ], b [ class "num" ] [ text value ], small [] [ text note ] ]


viewRoomRow : String -> Room -> Html Msg
viewRoomRow current r =
    li []
        [ button [ class "room", attribute "aria-current" (boolString (r.id == current)), onClick (SelectRoom r.id) ]
            [ span [ class "r1" ] [ span [ class "who" ] [ text (customerName r) ], pill r.state ]
            , span [ class "intent" ] [ text r.intent ]
            , span [ class "handle" ] [ text (r.handle ++ " · " ++ r.platform ++ " · " ++ r.opened) ]
            ]
        ]


viewTab : Model -> Html Msg
viewTab model =
    case model.tab of
        Conversation ->
            viewConversation model

        Refunds ->
            div []
                [ div [ class "pad note" ] [ text "The returns screener scores every request. Refunds over $150, or with a risk score above 60, stop here and wait for a person (ZooWork approval step)." ]
                , table_ [ "Case", "Customer", "Amount", "Screener", "Why", "Action" ] (List.map viewRefundRow model.refunds)
                ]

        Security ->
            div []
                [ div [ class "pad note" ] [ text "Every agent is checked before it gets a room: Band identity, platform signature, rate limits, and a Tavily lookup on unknown operators." ]
                , table_ [ "Agent", "Claims to be", "Checks", "Risk", "Result" ]
                    (List.map
                        (\a ->
                            tr []
                                [ td [ class "mono" ] [ text a.handle ]
                                , td [] [ text a.claims ]
                                , td [] [ reasons a.checks ]
                                , td [ class "num" ] [ text (String.fromInt a.risk) ]
                                , td [] [ pill a.result ]
                                ]
                        )
                        agentsSeen
                    )
                , div [ class "pad" ] [ span [ class "label" ] [ text "Fraud signals today" ] ]
                , table_ [ "Time", "Signal", "Raised by", "Severity" ]
                    (List.map
                        (\s -> tr [] [ td [ class "mono" ] [ text s.time ], td [] [ text s.text ], td [ class "mono" ] [ text s.by ], td [] [ pill s.severity ] ])
                        signals
                    )
                ]

        DecisionLog ->
            div []
                [ div [ class "pad note" ] [ text "Each decision an agent makes is written down with the inputs it used. Agent prompt and policy changes are versioned in git with Entire Checkpoints, so you can see which version made the call." ]
                , table_ [ "Time", "Agent", "Decision", "Based on", "Agent version" ]
                    (List.map
                        (\l -> tr [] [ td [ class "mono" ] [ text l.time ], td [ class "mono" ] [ text l.agent ], td [] [ text l.decision ], td [ class "note" ] [ text l.basis ], td [ class "mono" ] [ text l.version ] ])
                        model.log
                    )
                ]


table_ : List String -> List (Html msg) -> Html msg
table_ heads rows =
    div [ class "tbl-wrap" ]
        [ table [] [ thead [] [ tr [] (List.map (\h -> th [] [ text h ]) heads) ], tbody [] rows ] ]


reasons : List String -> Html msg
reasons items =
    div [ class "reasons" ] (List.map (\x -> span [] [ text x ]) items)


viewRefundRow : Refund -> Html Msg
viewRefundRow f =
    let
        primaryAct =
            case f.rec of
                "Approve" ->
                    "Refunded"

                "Ask for photo" ->
                    "Photo requested"

                _ ->
                    "Exchange offered"

        action =
            case f.decision of
                Nothing ->
                    div [ class "actions" ]
                        [ button [ class "btn primary", onClick (Decide f.id primaryAct) ] [ text f.rec ]
                        , button [ class "btn", onClick (Decide f.id "Refunded") ] [ text "Refund" ]
                        , button [ class "btn danger", onClick (Decide f.id "Declined") ] [ text "Decline" ]
                        ]

                Just status ->
                    span [ class "pill p-neutral" ] [ text status ]
    in
    tr []
        [ td [ class "mono" ] [ text f.id, span [ class "sub" ] [ text f.order ] ]
        , td [] [ text f.cust ]
        , td [ class "num" ] [ text (money f.amt) ]
        , td [] [ pill ( "Risk " ++ String.fromInt f.risk, riskTone f.risk ), span [ class "sub" ] [ text f.rec ] ]
        , td [] [ reasons f.why ]
        , td [] [ action ]
        ]


viewConversation : Model -> Html Msg
viewConversation model =
    case currentRoom model of
        Nothing ->
            div [ class "empty" ] [ text "No room selected." ]

        Just r ->
            let
                decision =
                    model.refunds |> List.filter (\f -> f.id == "RF-2207") |> List.head |> Maybe.andThen .decision
            in
            div []
                [ div [ class "roomhead" ]
                    [ h2 [] [ text (customerName r) ]
                    , span [ class "meta" ]
                        [ text "Band room "
                        , span [ class "mono" ] [ text (r.id ++ "-" ++ String.filter (\c -> not (List.member c [ '@', '/', '.' ])) r.handle) ]
                        , text (" · via " ++ r.platform ++ " · " ++ r.line)
                        ]
                    ]
                , div [ class "members" ]
                    (List.map (\m -> span [ classList [ ( "chip", True ), ( "buyer", m == r.handle ) ] ] [ text m ]) r.members)
                , div [ class "feed", id "feed", attribute "aria-live" "polite" ] (List.map (viewPost decision) r.posts)
                , Html.form [ class "compose", onSubmit ComposeSubmit ]
                    [ input
                        [ id "composeInput"
                        , placeholder "Step in as staff: @mention an agent or write to the buyer agent"
                        , autocomplete False
                        , value model.compose
                        , onInput ComposeInput
                        ]
                        []
                    , button [ class "btn primary", type_ "submit" ] [ text "Send to room" ]
                    ]
                ]


viewPost : Maybe String -> Post -> Html Msg
viewPost decision m =
    let
        kindClass =
            case m.kind of
                Buyer ->
                    "buyer"

                Sys ->
                    "sys"

                Agent ->
                    ""

        approval =
            if not m.approval then
                []

            else
                case decision of
                    Nothing ->
                        [ div [ class "approve" ]
                            [ span [] [ text "Waiting for you" ]
                            , button [ class "btn primary", onClick (Decide "RF-2207" "Exchange offered") ] [ text "Offer exchange" ]
                            , button [ class "btn", onClick (Decide "RF-2207" "Refunded") ] [ text "Refund anyway" ]
                            , button [ class "btn danger", onClick (Decide "RF-2207" "Declined") ] [ text "Decline" ]
                            ]
                        ]

                    Just status ->
                        [ div [ class "approve" ] [ span [] [ text "Decision: ", b [] [ text status ], text " by you" ] ] ]
    in
    div [ class ("msg " ++ kindClass) ]
        [ div [ class "from" ] [ text m.from ]
        , div [ class "body" ]
            ([ div [ class "text" ] [ text m.text ] ]
                ++ cites m.cites
                ++ (case m.payload of
                        Just p ->
                            [ div [ class "payload" ] [ text p ] ]

                        Nothing ->
                            []
                   )
                ++ approval
            )
        ]


cites : List String -> List (Html msg)
cites items =
    if List.isEmpty items then
        []

    else
        [ div [ class "cite" ]
            (List.map (\c -> span [ classList [ ( "tv", String.startsWith "tavily" c ) ] ] [ text c ]) items)
        ]



-- CUSTOMER DESK


viewDesk : Model -> List (Html Msg)
viewDesk model =
    case currentRoom model of
        Nothing ->
            []

        Just r ->
            case r.customer |> Maybe.andThen customer of
                Nothing ->
                    [ div [ class "panel-h" ] [ span [ class "label" ] [ text "Customer desk" ] ]
                    , div [ class "empty" ] [ text "This agent was blocked before it could link to a customer.", br [] [], br [] [], text "No account, no orders, nothing reserved." ]
                    ]

                Just c ->
                    let
                        risk =
                            toneVar (riskTone c.risk)

                        returnColor =
                            if c.returnRate > 40 then
                                "var(--bad)"

                            else
                                "var(--forest)"
                    in
                    [ div [ class "panel-h" ] [ span [ class "label" ] [ text "Customer desk" ], pill ( c.tier, Rose ) ]
                    , div [ class "who" ] [ h3 [] [ text c.name ], span [ class "note" ] [ text (c.since ++ " · represented by " ++ r.handle) ] ]
                    , dl [ class "facts", style "margin" "0" ]
                        [ fact "Lifetime value" (money c.ltv) [] Nothing
                        , fact "Orders" (String.fromInt c.orders) [] Nothing
                        , fact "Return rate" (String.fromInt c.returnRate ++ "%") [] (Just ( c.returnRate, returnColor ))
                        , fact "Risk score" (String.fromInt c.risk ++ " / 100") [ style "color" risk ] (Just ( c.risk, risk ))
                        ]
                    , div [ class "prefs" ] (List.map (\s -> span [ class "chip" ] [ text s ]) (c.sizes ++ c.prefs))
                    , div [ class "deskbtns" ]
                        [ button [ class "btn primary", onClick StartCall ] [ text "Call customer" ]
                        , button [ class "btn", onClick TakeOver ] [ text "Take over room" ]
                        ]
                    , viewCall model c
                    , div [ class "panel-h" ] [ span [ class "label" ] [ text "Purchase history" ] ]
                    , ul [ class "orders" ]
                        (List.map
                            (\h ->
                                li []
                                    [ span [] [ text h.item ]
                                    , span [ class "num" ] [ text (money h.amount) ]
                                    , span [ class "d mono" ] [ text (h.order ++ " · " ++ h.date) ]
                                    , span [ class "d" ] [ text h.outcome ]
                                    ]
                            )
                            c.history
                        )
                    ]


fact : String -> String -> List (Attribute msg) -> Maybe ( Int, String ) -> Html msg
fact label value ddAttrs meter =
    div []
        (dt [] [ text label ]
            :: dd ddAttrs [ text value ]
            :: (case meter of
                    Just ( pct, color ) ->
                        [ span [ class "meter" ] [ i [ style "width" (String.fromInt pct ++ "%"), style "background" color ] [] ] ]

                    Nothing ->
                        []
               )
        )


viewCall : Model -> Customer -> Html Msg
viewCall model c =
    case model.call of
        NoCall ->
            text ""

        CallEnded ->
            div [ class "call" ] [ div [ class "status" ] [ span [] [ text "Call ended · transcript posted to the room" ] ] ]

        OnCall shown ->
            div [ class "call" ]
                [ div [ class "status" ]
                    [ span [] [ text ("On call · " ++ c.phone) ]
                    , span [ class "wave", attribute "aria-hidden" "true" ] (List.repeat 5 (i [] []))
                    ]
                , div [ class "calllog", id "calllog" ]
                    (List.map
                        (\l -> div [ class "l" ] (b [] [ text (l.who ++ ":") ] :: text l.text :: cites (Maybe.withDefault [] (Maybe.map List.singleton l.cite))))
                        (List.take shown (currentScript model))
                    )
                , div [ style "display" "flex", style "gap" "8px", style "flex-wrap" "wrap" ]
                    [ button [ class "btn danger", onClick EndCall ] [ text "End call" ]
                    , span [ class "note", style "align-self" "center" ] [ text "Simulated. Voice: LiveKit · lookups: Moss" ]
                    ]
                ]
