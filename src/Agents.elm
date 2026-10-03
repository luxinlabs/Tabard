module Agents exposing (Model, Msg, init, subscriptions, update, view)

{-| Agents & integrations: the sponsor services Tabard runs on, live.

  - Band: every room is a Band chat room; agents post as themselves and @mention whoever should act.
  - ZooWork: the managed agents behind the promo engine and the concierge, including billboard artwork.
  - Tavily: storefront import and live competitor prices.

Reads the Tabard API (/health, /band/status, /merchants/:id/rooms, /merchants/:id/promos) and polls it.
When the API can't be reached it shows sample data and keeps retrying.

-}

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput, onSubmit)
import Http
import Json.Decode as D exposing (Decoder)
import Json.Encode as E
import Time



-- TYPES


type alias Health =
    { band : Bool, zoowork : Bool, zooworkRoles : List String, tavily : Bool }


type alias BandAgent =
    { role : String, handle : Maybe String, ok : Bool }


type alias MerchantRef =
    { id : Int, name : String, category : String }


type alias RoomRow =
    { id : Int
    , kind : String
    , handle : String
    , intent : Maybe String
    , customerName : Maybe String
    , messageCount : Int
    , bandSent : Int
    , bandChatId : Maybe String
    , lastText : Maybe String
    }


type alias Message =
    { id : Int
    , sender : String
    , role : String
    , text : String
    , cites : List String
    , source : Maybe String
    , bandStatus : Maybe String
    }


type alias Thread =
    { room : RoomRow
    , platform : String
    , messages : List Message
    , bandLive : Bool
    , bandFailed : Int
    , typing : List String
    }


type alias Promo =
    { id : Int
    , headline : String
    , body : String
    , product : String
    , pct : Int
    , price : Int
    , list : Int
    , status : String
    , source : Maybe String
    , imageUrl : Maybe String
    , imageStatus : Maybe String
    , seen : Int
    }


type Conn
    = Connecting
    | Online
    | Offline


type alias Model =
    { api : String
    , conn : Conn
    , health : Maybe Health
    , bandAgents : List BandAgent
    , merchants : List MerchantRef
    , merchant : Int
    , rooms : List RoomRow
    , filter : String
    , room : Maybe Int
    , thread : Maybe Thread
    , promos : List Promo
    , compose : String
    , topic : String
    , error : Maybe String
    }


init : String -> ( Model, Cmd Msg )
init api =
    ( { api = api
      , conn = Connecting
      , health = Nothing
      , bandAgents = []
      , merchants = []
      , merchant = 1
      , rooms = []
      , filter = "all"
      , room = Nothing
      , thread = Nothing
      , promos = []
      , compose = ""
      , topic = ""
      , error = Nothing
      }
    , Cmd.batch [ getHealth api, getBand api, getMerchants api ]
    )



-- HTTP


getHealth : String -> Cmd Msg
getHealth api =
    Http.get { url = api ++ "/health", expect = Http.expectJson GotHealth healthDecoder }


getBand : String -> Cmd Msg
getBand api =
    Http.get { url = api ++ "/band/status", expect = Http.expectJson GotBand (D.field "agents" (D.list bandAgentDecoder)) }


getMerchants : String -> Cmd Msg
getMerchants api =
    Http.get { url = api ++ "/merchants", expect = Http.expectJson GotMerchants (D.list merchantDecoder) }


merchantUrl : Model -> String -> String
merchantUrl model path =
    model.api ++ "/merchants/" ++ String.fromInt model.merchant ++ path


getRooms : Model -> Cmd Msg
getRooms model =
    Http.get { url = merchantUrl model "/rooms", expect = Http.expectJson GotRooms (D.list roomRowDecoder) }


getThread : Model -> Int -> Cmd Msg
getThread model id =
    Http.get { url = merchantUrl model ("/rooms/" ++ String.fromInt id), expect = Http.expectJson (GotThread id) threadDecoder }


getPromos : Model -> Cmd Msg
getPromos model =
    Http.get { url = merchantUrl model "/promos", expect = Http.expectJson GotPromos (D.list promoDecoder) }


postMessage : Model -> Int -> String -> Cmd Msg
postMessage model id body =
    Http.post
        { url = merchantUrl model ("/rooms/" ++ String.fromInt id ++ "/messages")
        , body = Http.jsonBody (E.object [ ( "text", E.string body ) ])
        , expect = Http.expectWhatever Sent
        }


postRoom : Model -> String -> Cmd Msg
postRoom model topic =
    Http.post
        { url = merchantUrl model "/rooms"
        , body = Http.jsonBody (E.object [ ( "topic", E.string topic ) ])
        , expect = Http.expectJson Created (D.field "id" D.int)
        }



-- DECODERS


healthDecoder : Decoder Health
healthDecoder =
    D.map4 Health
        (optBool "band")
        (optBool "zoowork")
        (D.oneOf [ D.field "zooworkRoles" (D.list D.string), D.succeed [] ])
        (optBool "tavily")


optBool : String -> Decoder Bool
optBool name =
    D.oneOf [ D.field name D.bool, D.succeed False ]


optString : String -> Decoder (Maybe String)
optString name =
    D.oneOf [ D.field name (D.nullable D.string), D.succeed Nothing ]


optInt : String -> Decoder Int
optInt name =
    D.oneOf [ D.field name D.int, D.succeed 0 ]


bandAgentDecoder : Decoder BandAgent
bandAgentDecoder =
    D.map3 BandAgent (D.field "role" D.string) (optString "handle") (optBool "ok")


merchantDecoder : Decoder MerchantRef
merchantDecoder =
    D.map3 MerchantRef (D.field "id" D.int) (D.field "name" D.string) (D.oneOf [ D.field "category" D.string, D.succeed "" ])


roomRowDecoder : Decoder RoomRow
roomRowDecoder =
    D.map8 RoomRow
        (D.field "id" D.int)
        (D.field "kind" D.string)
        (D.field "handle" D.string)
        (optString "intent")
        (optString "customer_name")
        (optInt "message_count")
        (optInt "band_sent")
        (optString "band_chat_id")
        |> D.andThen (\f -> D.map f (optString "last_text"))


messageDecoder : Decoder Message
messageDecoder =
    D.map7 Message
        (D.field "id" D.int)
        (D.field "sender" D.string)
        (D.field "role" D.string)
        (D.field "text" D.string)
        (D.oneOf [ D.field "cites" (D.list D.string), D.succeed [] ])
        (optString "source")
        (optString "band_status")


threadDecoder : Decoder Thread
threadDecoder =
    D.map6 Thread
        roomRowDecoder
        (D.oneOf [ D.field "platform" D.string, D.succeed "" ])
        (D.field "messages" (D.list messageDecoder))
        (D.oneOf [ D.at [ "band", "live" ] D.bool, D.succeed False ])
        (D.oneOf [ D.at [ "band", "failed" ] D.int, D.succeed 0 ])
        (D.oneOf [ D.field "typing" (D.list D.string), D.succeed [] ])


promoDecoder : Decoder Promo
promoDecoder =
    D.succeed Promo
        |> andMap (D.field "id" D.int)
        |> andMap (D.field "headline" D.string)
        |> andMap (D.field "body" D.string)
        |> andMap (D.field "product" D.string)
        |> andMap (D.field "pct" D.int)
        |> andMap (D.field "price" D.int)
        |> andMap (D.field "list" D.int)
        |> andMap (D.field "status" D.string)
        |> andMap (optString "source")
        |> andMap (optString "image_url")
        |> andMap (optString "image_status")
        |> andMap (optInt "seen")


andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap =
    D.map2 (|>)



-- UPDATE


type Msg
    = GotHealth (Result Http.Error Health)
    | GotBand (Result Http.Error (List BandAgent))
    | GotMerchants (Result Http.Error (List MerchantRef))
    | GotRooms (Result Http.Error (List RoomRow))
    | GotThread Int (Result Http.Error Thread)
    | GotPromos (Result Http.Error (List Promo))
    | SelectMerchant String
    | SelectRoom Int
    | SetFilter String
    | Compose String
    | Mention String
    | Send
    | Sent (Result Http.Error ())
    | Topic String
    | CreateRoom
    | Created (Result Http.Error Int)
    | Poll
    | Retry


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotHealth (Ok h) ->
            ( { model | health = Just h }, Cmd.none )

        GotHealth (Err _) ->
            ( model, Cmd.none )

        GotBand (Ok agents) ->
            ( { model | bandAgents = agents }, Cmd.none )

        GotBand (Err _) ->
            ( model, Cmd.none )

        GotMerchants (Ok ms) ->
            let
                m =
                    { model
                        | conn = Online
                        , merchants = ms
                        , merchant =
                            if List.any (\x -> x.id == model.merchant) ms then
                                model.merchant

                            else
                                List.head ms |> Maybe.map .id |> Maybe.withDefault 1
                    }
            in
            ( m, Cmd.batch [ getRooms m, getPromos m ] )

        GotMerchants (Err _) ->
            ( { model | conn = Offline, rooms = sampleRooms, thread = Just sampleThread, room = Just 1, promos = [] }, Cmd.none )

        GotRooms (Ok rs) ->
            let
                room =
                    case model.room of
                        Just id ->
                            Just id

                        Nothing ->
                            List.head (visible model.filter rs) |> Maybe.map .id
            in
            ( { model | rooms = rs, room = room }
            , case ( room, model.room ) of
                ( Just id, Nothing ) ->
                    getThread model id

                _ ->
                    Cmd.none
            )

        GotRooms (Err _) ->
            ( model, Cmd.none )

        GotThread id (Ok t) ->
            if model.room == Just id then
                ( { model | thread = Just t }, Cmd.none )

            else
                ( model, Cmd.none )

        GotThread _ (Err _) ->
            ( model, Cmd.none )

        GotPromos (Ok ps) ->
            ( { model | promos = ps }, Cmd.none )

        GotPromos (Err _) ->
            ( model, Cmd.none )

        SelectMerchant s ->
            let
                m =
                    { model | merchant = String.toInt s |> Maybe.withDefault model.merchant, room = Nothing, thread = Nothing, rooms = [], promos = [] }
            in
            ( m, Cmd.batch [ getRooms m, getPromos m ] )

        SelectRoom id ->
            ( { model | room = Just id, thread = Nothing }
            , if model.conn == Online then
                getThread model id

              else
                Cmd.none
            )

        SetFilter f ->
            ( { model | filter = f }, Cmd.none )

        Compose s ->
            ( { model | compose = s }, Cmd.none )

        Mention a ->
            let
                tag =
                    "@" ++ a
            in
            if String.contains tag model.compose then
                ( model, Cmd.none )

            else
                ( { model
                    | compose =
                        if String.isEmpty model.compose || String.endsWith " " model.compose then
                            model.compose ++ tag ++ " "

                        else
                            model.compose ++ " " ++ tag ++ " "
                  }
                , Cmd.none
                )

        Send ->
            case ( model.room, String.trim model.compose, model.conn ) of
                ( Just id, body, Online ) ->
                    if String.isEmpty body then
                        ( model, Cmd.none )

                    else
                        ( { model | compose = "", error = Nothing }, postMessage model id body )

                _ ->
                    ( model, Cmd.none )

        Sent (Ok ()) ->
            ( model, refreshThread model )

        Sent (Err _) ->
            ( { model | error = Just "Couldn't send the message. Is the Tabard API running?" }, Cmd.none )

        Topic s ->
            ( { model | topic = s }, Cmd.none )

        CreateRoom ->
            let
                t =
                    String.trim model.topic
            in
            if String.isEmpty t || model.conn /= Online then
                ( model, Cmd.none )

            else
                ( { model | topic = "", error = Nothing }, postRoom model t )

        Created (Ok id) ->
            let
                m =
                    { model | room = Just id, thread = Nothing, filter = "all" }
            in
            ( m, Cmd.batch [ getRooms m, getThread m id ] )

        Created (Err _) ->
            ( { model | error = Just "Couldn't open the team room." }, Cmd.none )

        Poll ->
            ( model, Cmd.batch [ getRooms model, refreshThread model ] )

        Retry ->
            ( model, Cmd.batch [ getHealth model.api, getBand model.api, getMerchants model.api, if model.conn == Online then getPromos model else Cmd.none ] )


refreshThread : Model -> Cmd Msg
refreshThread model =
    case model.room of
        Just id ->
            getThread model id

        Nothing ->
            Cmd.none


visible : String -> List RoomRow -> List RoomRow
visible filter rooms =
    if filter == "all" then
        rooms

    else
        List.filter (\r -> r.kind == filter) rooms


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.conn of
        Online ->
            Sub.batch [ Time.every 3000 (\_ -> Poll), Time.every 20000 (\_ -> Retry) ]

        _ ->
            Time.every 10000 (\_ -> Retry)



-- VIEW


agentKeys : List String
agentKeys =
    [ "concierge", "stylist", "promo", "service", "returns", "gatekeeper" ]


{-| Base of the web app (the API serves it in production): the API URL without its /api suffix.
-}
origin : Model -> String
origin model =
    if String.endsWith "/api" model.api then
        String.dropRight 4 model.api

    else
        model.api


view : Model -> Html Msg
view model =
    div [ class "agents-view" ]
        [ viewStatus model
        , viewMerchantPicker model
        , div [ class "agents-grid" ]
            [ section [ class "panel" ] (viewRooms model)
            , section [ class "panel" ] (viewThread model)
            ]
        , viewAds model
        ]


viewStatus : Model -> Html Msg
viewStatus model =
    let
        h =
            model.health

        on f =
            Maybe.map f h |> Maybe.withDefault False

        roles =
            Maybe.map .zooworkRoles h |> Maybe.withDefault []
    in
    div []
        [ case model.conn of
            Offline ->
                p [ class "callout" ] [ b [] [ text "API offline. " ], text "Showing sample data. Start the Tabard API (cd server && npm run dev) and this view connects on its own." ]

            _ ->
                text ""
        , div [ class "integrations" ]
            [ card "Band" "Agent-to-agent rooms" (on .band) <|
                if on .band then
                    [ p [] [ text "Every room is a Band chat room. Agents post as themselves and @mention whoever should act; the concierge hands work to specialists through their Band inboxes." ]
                    , div [ class "chips" ]
                        (List.map
                            (\a ->
                                span [ classList [ ( "chip", True ), ( "chip-bad", not a.ok ) ] ]
                                    [ text (Maybe.withDefault ("@" ++ a.role) a.handle) ]
                            )
                            model.bandAgents
                        )
                    ]

                else
                    [ p [] [ text "Not connected. Add BAND_KEY_* agent keys to server/.env to mirror every room to Band." ] ]
            , card "ZooWork" "Managed agents" (on .zoowork) <|
                if on .zoowork then
                    [ p [] [ text "The promo engine and concierge run as ZooWork agents (Claude Opus 5.5). The promo agent paints billboard artwork with ZooWork's designer skill." ]
                    , div [ class "chips" ] (List.map (\r -> span [ class "chip" ] [ text ("@" ++ r ++ " · live") ]) roles)
                    ]

                else
                    [ p [] [ text "Simulated. Add ZOOWORK_API_KEY to server/.env to run agents on ZooWork." ] ]
            , card "Tavily" "Web research" (on .tavily) <|
                [ p []
                    [ text
                        (if on .tavily then
                            "Reads storefront links (TikTok Shop, Amazon, any site) to build a shop, and finds live competitor prices for every promo offer."

                         else
                            "Not configured. Add TAVILY_API_KEY to server/.env to import shops from a link and price offers against the web."
                        )
                    ]
                ]
            ]
        ]


card : String -> String -> Bool -> List (Html Msg) -> Html Msg
card name role live body =
    div [ class "integration" ]
        (div [ class "integration-h" ]
            [ div [] [ span [ class "label" ] [ text role ], h3 [] [ text name ] ]
            , span
                [ class
                    ("pill "
                        ++ (if live then
                                "p-good"

                            else
                                "p-neutral"
                           )
                    )
                ]
                [ text
                    (if live then
                        "Live"

                     else
                        "Off"
                    )
                ]
            ]
            :: body
        )


viewMerchantPicker : Model -> Html Msg
viewMerchantPicker model =
    if List.isEmpty model.merchants then
        text ""

    else
        div [ class "picker" ]
            [ label [ for "agents-merchant", class "label" ] [ text "Shop" ]
            , select [ id "agents-merchant", onInput SelectMerchant ]
                (List.map
                    (\m -> option [ value (String.fromInt m.id), selected (m.id == model.merchant) ] [ text (m.name ++ " · " ++ m.category) ])
                    model.merchants
                )
            ]


viewRooms : Model -> List (Html Msg)
viewRooms model =
    [ div [ class "panel-h" ] [ span [ class "label" ] [ text "Agent rooms" ], span [ class "pill p-neutral" ] [ text (String.fromInt (List.length model.rooms)) ] ]
    , Html.form [ class "newroom", onSubmit CreateRoom ]
        [ input [ value model.topic, onInput Topic, placeholder "New team room, e.g. Weekend plan", attribute "aria-label" "Team room topic" ] []
        , button [ class "btn primary", type_ "submit", disabled (String.isEmpty (String.trim model.topic)) ] [ text "Open" ]
        ]
    , div [ class "roomfilters" ]
        (List.map
            (\( k, l ) -> button [ type_ "button", attribute "aria-pressed" (boolStr (model.filter == k)), onClick (SetFilter k) ] [ text l ])
            [ ( "all", "All" ), ( "team", "Team" ), ( "shop", "Shopping" ), ( "service", "Service" ), ( "bot", "Bots" ) ]
        )
    , ul [ class "rooms" ]
        (List.map (viewRoomRow model.room) (visible model.filter model.rooms |> List.take 40))
    ]


viewRoomRow : Maybe Int -> RoomRow -> Html Msg
viewRoomRow current r =
    li []
        [ button [ class "room", attribute "aria-current" (boolStr (current == Just r.id)), onClick (SelectRoom r.id) ]
            [ span [ class "r1" ]
                [ span [ class "who" ] [ text (roomTitle r) ]
                , span [ class ("pill " ++ kindTone r.kind) ] [ text (kindLabel r.kind) ]
                ]
            , span [ class "intent" ] [ text (Maybe.withDefault "No messages yet" r.lastText) ]
            , span [ class "handle" ]
                [ text
                    (r.handle
                        ++ (if r.bandChatId /= Nothing then
                                " · ◆ on Band (" ++ String.fromInt r.bandSent ++ ")"

                            else
                                ""
                           )
                    )
                ]
            ]
        ]


roomTitle : RoomRow -> String
roomTitle r =
    if r.kind == "team" then
        Maybe.withDefault "Team room" r.intent

    else
        Maybe.withDefault r.handle r.customerName


kindLabel : String -> String
kindLabel k =
    case k of
        "team" ->
            "Team"

        "shop" ->
            "Shopping"

        "service" ->
            "Service"

        "bot" ->
            "Blocked"

        _ ->
            k


kindTone : String -> String
kindTone k =
    case k of
        "team" ->
            "p-rose"

        "shop" ->
            "p-good"

        "bot" ->
            "p-bad"

        _ ->
            "p-neutral"


viewThread : Model -> List (Html Msg)
viewThread model =
    case model.thread of
        Nothing ->
            [ div [ class "empty" ] [ text "Choose a room, or open a team room and @mention agents." ] ]

        Just t ->
            [ div [ class "roomhead" ]
                [ h2 [] [ text (roomTitle t.room) ]
                , span [ class "meta" ]
                    [ text
                        (if t.room.kind == "team" then
                            "Team room · the owner and the shop's agents"

                         else
                            t.room.handle ++ " · via " ++ t.platform
                        )
                    ]
                , case t.room.bandChatId of
                    Just chat ->
                        span [ class "pill p-good", title ("Band chat " ++ chat) ]
                            [ text
                                ("On Band · "
                                    ++ String.fromInt t.room.bandSent
                                    ++ " sent"
                                    ++ (if t.bandFailed > 0 then
                                            " · " ++ String.fromInt t.bandFailed ++ " failed"

                                        else
                                            ""
                                       )
                                )
                            ]

                    Nothing ->
                        span [ class "pill p-neutral" ]
                            [ text
                                (if t.bandLive then
                                    "Not on Band yet"

                                 else
                                    "Local room"
                                )
                            ]
                ]
            , div [ class "feed agents-feed", id "agents-feed" ]
                (List.map viewMessage t.messages
                    ++ List.map (\a -> div [ class "msg sys" ] [ div [ class "from" ] [ text ("@" ++ a) ], div [ class "body" ] [ div [ class "text" ] [ text "thinking…" ] ] ]) t.typing
                )
            , case model.error of
                Just e ->
                    p [ class "callout" ] [ text e ]

                Nothing ->
                    text ""
            , div [ class "mentionbar" ] (List.map (\a -> button [ type_ "button", onClick (Mention a) ] [ text ("@" ++ a) ]) agentKeys)
            , Html.form [ class "compose", onSubmit Send ]
                [ input [ value model.compose, onInput Compose, placeholder "Message the room as the owner. @mention agents to bring them in.", attribute "aria-label" "Message" ] []
                , button [ class "btn primary", type_ "submit", disabled (model.conn /= Online) ] [ text "Send to room" ]
                ]
            ]


viewMessage : Message -> Html Msg
viewMessage m =
    div
        [ classList
            [ ( "msg", True )
            , ( "buyer", m.role == "buyer" )
            , ( "sys", m.role == "sys" )
            ]
        ]
        [ div [ class "from" ]
            [ text m.sender
            , case m.bandStatus of
                Just "sent" ->
                    span [ class "bandok", title "Delivered through Band" ] [ text "◆ Band" ]

                Just "failed" ->
                    span [ class "bandfail" ] [ text "Band failed" ]

                _ ->
                    text ""
            ]
        , div [ class "body" ]
            [ div [ class "text" ] (mentions m.text)
            , if List.isEmpty m.cites && m.source == Nothing then
                text ""

              else
                div [ class "cite" ]
                    ((case m.source of
                        Just "zoowork" ->
                            [ span [ class "zw" ] [ text "ZooWork live" ] ]

                        Just "sim" ->
                            [ span [] [ text "simulated" ] ]

                        _ ->
                            []
                     )
                        ++ List.map (\c -> span [ classList [ ( "tv", String.startsWith "tavily" c ) ] ] [ text c ]) m.cites
                    )
            ]
        ]


{-| Highlight @mentions inside message text.
-}
mentions : String -> List (Html Msg)
mentions s =
    String.words s
        |> List.map
            (\w ->
                if String.startsWith "@" w && String.length w > 1 then
                    span [ class "mention" ] [ text w ]

                else
                    text w
            )
        |> List.intersperse (text " ")


viewAds : Model -> Html Msg
viewAds model =
    section [ class "ads-section" ]
        [ div [ class "panel-h plain" ]
            [ span [ class "label" ] [ text "Ads from the promo engine" ]
            , span [ class "note" ] [ text "Drafted by the ZooWork promo agent; artwork painted with its designer skill" ]
            ]
        , if List.isEmpty model.promos then
            p [ class "note pad" ]
                [ text
                    (if model.conn == Online then
                        "No ads yet. Open the shop and prompt the billboard's promo engine."

                     else
                        "Ads appear here when the Tabard API is running."
                    )
                ]

          else
            div [ class "ads" ] (List.map (viewAd model) (List.take 12 model.promos))
        ]


viewAd : Model -> Promo -> Html Msg
viewAd model p =
    a [ class "ad-tile", href (origin model ++ "/m/" ++ String.fromInt model.merchant ++ "/ads/" ++ String.fromInt p.id), target "_blank", rel "noopener" ]
        [ case p.imageUrl of
            Just url ->
                img [ src (origin model ++ url), alt (p.headline ++ ". " ++ p.body) ] []

            Nothing ->
                div [ class "ad-text" ]
                    [ span [ class "ad-pct" ] [ text (String.fromInt p.pct ++ "% off") ]
                    , b [] [ text p.headline ]
                    , span []
                        [ text
                            (case p.imageStatus of
                                Just "designing" ->
                                    "Artwork being painted…"

                                Just "failed" ->
                                    "Artwork failed"

                                _ ->
                                    "No artwork"
                            )
                        ]
                    ]
        , div [ class "ad-meta" ]
            [ span [ class "ad-h" ] [ text p.headline ]
            , span [ class "note" ] [ text (p.product ++ " · $" ++ String.fromInt p.price ++ " (was $" ++ String.fromInt p.list ++ ") · seen by " ++ String.fromInt p.seen) ]
            , span [ class "ad-pills" ]
                [ span [ class ("pill " ++ statusTone p.status) ] [ text (statusLabel p.status) ]
                , if p.source == Just "zoowork" then
                    span [ class "pill p-good" ] [ text "ZooWork" ]

                  else
                    span [ class "pill p-neutral" ] [ text "Simulated" ]
                ]
            ]
        ]


statusLabel : String -> String
statusLabel s =
    case s of
        "live" ->
            "On the billboard"

        "draft" ->
            "Draft"

        _ ->
            "Past"


statusTone : String -> String
statusTone s =
    case s of
        "live" ->
            "p-good"

        "draft" ->
            "p-warn"

        _ ->
            "p-neutral"


boolStr : Bool -> String
boolStr b =
    if b then
        "true"

    else
        "false"



-- SAMPLE DATA (shown when the API is offline)


sampleRooms : List RoomRow
sampleRooms =
    [ { id = 1, kind = "team", handle = "@staff/you", intent = Just "Weekend plan", customerName = Nothing, messageCount = 4, bandSent = 4, bandChatId = Just "sample", lastText = Just "@promo: I'd push the camel wool overcoat at 10% off." }
    , { id = 2, kind = "shop", handle = "@muse/dana.k", intent = Just "Linen trousers", customerName = Just "Dana Kim", messageCount = 6, bandSent = 6, bandChatId = Just "sample", lastText = Just "@muse/dana.k: Accepted. Checking out." }
    ]


sampleThread : Thread
sampleThread =
    { room = { id = 1, kind = "team", handle = "@staff/you", intent = Just "Weekend plan", customerName = Nothing, messageCount = 4, bandSent = 4, bandChatId = Just "sample", lastText = Nothing }
    , platform = "Team"
    , messages =
        [ { id = 1, sender = "system", role = "sys", text = "Team room opened: Weekend plan. @mention an agent to bring it in.", cites = [], source = Nothing, bandStatus = Just "sent" }
        , { id = 2, sender = "@staff/you", role = "staff", text = "@stylist @promo what should we push this weekend?", cites = [], source = Nothing, bandStatus = Just "sent" }
        , { id = 3, sender = "@stylist", role = "agent", text = "Best sellers: Field Runner sneaker, Waxed jacket (5 left), Camel wool overcoat.", cites = [], source = Just "sim", bandStatus = Just "sent" }
        , { id = 4, sender = "@promo", role = "agent", text = "I'd push the camel wool overcoat this weekend at 10% off: 13 in stock and it fits the weather.", cites = [ "zoowork · 12.2 s" ], source = Just "zoowork", bandStatus = Just "sent" }
        ]
    , bandLive = True
    , bandFailed = 0
    , typing = []
    }
