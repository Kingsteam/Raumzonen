"""WebSocket-Befehle für das Panel „Raumzonen“ und für Abnehmer.

Lesen dürfen alle angemeldeten Nutzer (Live-Punkte für alle); ändern und
Aufnahmen abrufen nur Admins. Keiner der Befehle schaltet etwas im Haus.

Für das Panel:

* ``raumzonen/rooms/get``: Räume mit Zonen, Regeln, Ansicht; dazu Vorlagen,
  Zonenarten, Grenzen und ob der Nutzer ändern darf (alle).
* ``raumzonen/room/save``: Zonen, Ansicht, Umriss und Aufnahme eines Raums
  ersetzen.
  Gespeichert wird nur, wenn das ganze Modell gültig ist; danach lädt die
  Integration neu (das Panel bleibt offen). Nur Admins.
* ``raumzonen/live/subscribe``: Figuren, Spuren, Rohziele und Zustand je
  Zone, höchstens fünfmal je Sekunde (alle).
* ``raumzonen/heat/get``: Bewegungskarte der letzten Minuten (alle).
* ``raumzonen/converter_zones/get``: Software-Zonen aus dem Konverter als
  Vorschlag zum Übernehmen. Nur Admins.
* ``raumzonen/haus/save``: Lage der Räume im Hausplan (x, y, Drehung) und
  wohin Türen führen. Nur Admins.

Vertrag ``raumzonen/1`` (``vertrag.py``, ``api.py``):

* ``raumzonen/v1/schema``: Name des Vertrags und Aufbau der Räume (alle).
* ``raumzonen/v1/snapshot``: Momentaufnahme (alle).
* ``raumzonen/v1/subscribe``: Meldungen ``zone``/``sensor``/``spur``/
  ``geladen`` (alle).
* ``raumzonen/aufnahme/get``: eigene Aufnahme eines Raums, höchstens 24 h am
  Stück. Nur Admins.
* ``raumzonen/auswertung/get``: aus der Aufnahme der letzten Stunden: wer war
  wann in welcher Zone, feine Bewegungskarte je Figur. Nur Admins.
* ``raumzonen/kandidaten/get``: was sich als Raum anlegen lässt (FP400-Geräte,
  Bewegungs- und Präsenzmelder, Bereiche mit Meldern als Vorschlag). Nur Admins.
* ``raumzonen/room/create``, ``raumzonen/room/delete``: Raum anlegen oder
  löschen (Kopie, prüfen, speichern, neu laden). Nur Admins.
* ``raumzonen/plan/import``: Wände, Türen und Lage im Haus für mehrere Räume
  auf einmal (aus einem Grundriss, den das Panel erkannt hat), dazu das Bild
  als Hintergrund. Nur Admins.
* ``raumzonen/plan/bild/get``: Bild eines Grundrisses (alle).
* ``raumzonen/plan/delete``: Grundriss löschen. Nur Admins.
"""

from __future__ import annotations

import copy
from datetime import timedelta
import re
from typing import TYPE_CHECKING, Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    floor_registry as fr,
)
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util, slugify
import voluptuous as vol

from . import plaene as plan_dateien
from .api import ARTEN, async_get_api
from .const import (
    DOMAIN,
    MAX_AUFNAHME_TAGE,
    MAX_BELEGT_NACH_S,
    MAX_FREI_NACH_S,
    MAX_MELDER,
    MAX_NACHLAUF_S,
    MAX_PERSONEN,
    MAX_RAND_CM,
    MAX_WEG_CM,
    MAX_WEG_RAHMEN,
    MAX_ZONEN_JE_RAUM,
    MELDER_KLASSEN,
    QUELLE_ENTITAET,
    QUELLE_MQTT,
    RAUM_MELDER,
    RAUM_RADAR,
)
from .core.room import ZONE_ARTEN
from .discovery import converter_zones, find_fp400_entities, suggest_topic
from .ki import (
    anweisung as ki_anweisung,
    regel_aenderung as ki_regel_aenderung,
    vorschlaege_lesen as ki_vorschlaege_lesen,
)
from .ki_daten import beschreibung as ki_beschreibung
from .model import (
    REGEL_VORLAGEN,
    PlanConfig,
    RaumConfig,
    SensorConfig,
    tueren_abgleichen,
)
from .panel import async_reload_keep_panel
from .serialize import (
    melder_lage_from_dict,
    oeffnungen_from_list,
    plan_to_dict,
    raum_to_dict,
    regel_from_dict,
    regel_to_dict,
    zone_from_dict,
)

if TYPE_CHECKING:
    from . import RaumzonenConfigEntry
    from .controller import RoomController

LIVE_MIN_INTERVAL_S = 0.2
HEAT_MINUTES = (15, 60, 24 * 60)
AUSWERTUNG_STUNDEN = (1, 3, 8, 12, 24)
# Gleiche Frage innerhalb dieser Zeit: Ergebnis wiederverwenden.
AUSWERTUNG_CACHE_S = 60.0


def _entry(hass: HomeAssistant) -> RaumzonenConfigEntry | None:
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        return entry
    return None


def _controller(hass: HomeAssistant, raum_id: str) -> RoomController | None:
    entry = _entry(hass)
    if entry is None:
        return None
    return entry.runtime_data.controllers.get(raum_id)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Befehle anmelden (einmal)."""
    for command in (
        ws_rooms_get,
        ws_room_save,
        ws_live,
        ws_heat,
        ws_converter_zones,
        ws_haus_save,
        ws_v1_schema,
        ws_v1_snapshot,
        ws_v1_subscribe,
        ws_aufnahme_get,
        ws_auswertung_get,
        ws_kandidaten_get,
        ws_room_create,
        ws_room_delete,
        ws_room_umwandeln,
        ws_wege_get,
        ws_handy_ziele,
        ws_ki_status,
        ws_ki_beschreibung,
        ws_ki_laufen,
        ws_ki_entscheiden,
        ws_handy_senden,
        ws_plan_import,
        ws_plan_bild_get,
        ws_plan_delete,
    ):
        websocket_api.async_register_command(hass, command)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/rooms/get"})
@callback
def ws_rooms_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Räume und alles, was das Panel zum Zeichnen braucht."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    connection.send_result(
        msg["id"],
        {
            "raeume": [raum_to_dict(r) for r in entry.runtime_data.store.model.raeume],
            "plaene": [plan_to_dict(p) for p in entry.runtime_data.store.model.plaene],
            # Stockwerke und Bereiche aus Home Assistant (für die Auswahl im Plan).
            **_haus_struktur(hass),
            "vorlagen": {k: regel_to_dict(v) for k, v in REGEL_VORLAGEN.items()},
            "arten": list(ZONE_ARTEN),
            "darf_aendern": connection.user.is_admin,
            "grenzen": {
                "belegt_nach_s": MAX_BELEGT_NACH_S,
                "frei_nach_s": MAX_FREI_NACH_S,
                "rand_cm": MAX_RAND_CM,
                "weg_cm": MAX_WEG_CM,
                "weg_rahmen": MAX_WEG_RAHMEN,
                "max_personen": MAX_PERSONEN,
                "zonen_je_raum": MAX_ZONEN_JE_RAUM,
                "aufnahme_tage": MAX_AUFNAHME_TAGE,
                "melder": MAX_MELDER,
                "melder_nachlauf_s": MAX_NACHLAUF_S,
            },
        },
    )


ZONE_SCHEMA = vol.Schema(
    {
        vol.Optional("id"): vol.Any(None, str),
        vol.Required("name"): str,
        vol.Required("art"): vol.In(ZONE_ARTEN),
        vol.Required("form"): dict,
        vol.Optional("regel", default={}): dict,
        # Nur bei Türen: "aussen", eine andere Raum-ID oder leer (weiß nicht).
        vol.Optional("fuehrt_zu", default=""): vol.Any(None, str),
        # Nur in Melder-Räumen: welche Melder die Zone melden.
        vol.Optional("melder", default=[]): [str],
        # Nur bei Türen: bestimmte Tür im anderen Raum.
        vol.Optional("gegenstueck", default=""): vol.Any(None, str),
    }
)

MELDER_LAGE_SCHEMA = vol.Schema(
    {
        vol.Required(key): vol.Coerce(float)
        for key in ("x", "y", "winkel", "reichweite_cm", "oeffnung_grad")
    }
)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/room/save",
        vol.Required("raum_id"): str,
        vol.Required("zonen"): [ZONE_SCHEMA],
        vol.Optional("ansicht_winkel"): vol.Coerce(float),
        # Nur die Lage des Sensors; Gerät und Quelle bleiben im Options-Flow.
        vol.Optional("sensor"): vol.Schema(
            {
                vol.Optional(key): vol.Coerce(float)
                for key in ("x", "y", "winkel", "reichweite_cm", "oeffnung_grad")
            }
        ),
        vol.Optional("umriss"): [
            vol.ExactSequence([vol.Coerce(float), vol.Coerce(float)])
        ],
        vol.Optional("aufnahme"): bool,
        vol.Optional("aufnahme_tage"): int,
        # Türen und offene Stellen in den Wänden (Abschnitt einer Wand in cm).
        vol.Optional("oeffnungen"): [
            vol.Schema(
                {
                    vol.Required("kante"): int,
                    vol.Required("von"): vol.Coerce(float),
                    vol.Required("bis"): vol.Coerce(float),
                    vol.Required("art"): str,
                    vol.Optional("anschlag", default="anfang"): str,
                    vol.Optional("aufgehen", default="innen"): str,
                    vol.Optional("fuehrt_zu", default=""): vol.Any(None, str),
                    vol.Optional("id"): vol.Any(None, str),
                    vol.Optional("name"): vol.Any(
                        None, vol.All(str, vol.Length(max=60))
                    ),
                    vol.Optional("gegenstueck"): vol.Any(None, str),
                }
            )
        ],
        # Nur Melder-Räume
        vol.Optional("melder"): [str],
        vol.Optional("melder_nachlauf_s"): vol.Coerce(float),
        vol.Optional("melder_lagen"): {str: MELDER_LAGE_SCHEMA},
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Zonen eines Raums ersetzen: Kopie → prüfen → speichern → neu laden."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    try:
        raum = model.raum(msg["raum_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    try:
        zonen = []
        taken: set[str] = set()
        for data in msg["zonen"]:
            zone_id = data.get("id") or ""
            if not zone_id or zone_id in taken:
                zone_id = _new_id(data["name"], taken)
            taken.add(zone_id)
            zonen.append(
                zone_from_dict(
                    {
                        **data,
                        "id": zone_id,
                        "fuehrt_zu": data.get("fuehrt_zu") or "",
                        "melder": [
                            _melder_key(hass, m) for m in data.get("melder", [])
                        ],
                        "regel": regel_to_dict(regel_from_dict(data.get("regel", {}))),
                    }
                )
            )
        raum.zonen = zonen
        for key, value in msg.get("sensor", {}).items():
            setattr(raum.sensor, key, value)
        if "ansicht_winkel" in msg:
            raum.ansicht_winkel = msg["ansicht_winkel"]
        if "umriss" in msg:
            raum.umriss = [list(p) for p in msg["umriss"]]
        if "oeffnungen" in msg:
            raum.oeffnungen = oeffnungen_from_list(
                [
                    {**o, "fuehrt_zu": o.get("fuehrt_zu") or ""}
                    for o in msg["oeffnungen"]
                ]
            )
        if "melder" in msg:
            raum.melder = [_melder_key(hass, m) for m in msg["melder"]]
        if "melder_lagen" in msg:
            raum.melder_lagen = {
                _melder_key(hass, k): melder_lage_from_dict(v)
                for k, v in msg["melder_lagen"].items()
            }
        for key in ("aufnahme", "aufnahme_tage", "melder_nachlauf_s"):
            if key in msg:
                setattr(raum, key, msg[key])
        tueren_abgleichen(model, {raum.id})
        model.validate()
    except (ValueError, TypeError, KeyError) as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    store.model = model
    await store.async_save()
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"], {"raum": raum_to_dict(raum)})


def _new_id(name: str, taken: set[str]) -> str:
    base = slugify(name) or "zone"
    candidate, n = base, 2
    while candidate in taken:
        candidate = f"{base}_{n}"
        n += 1
    return candidate


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/live/subscribe", vol.Required("raum_id"): str}
)
@callback
def ws_live(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Live-Daten eines Raums, gedrosselt auf höchstens 5 je Sekunde."""
    controller = _controller(hass, msg["raum_id"])
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    state: dict[str, Any] = {"timer": None, "last": 0.0}

    @callback
    def _send(_now: Any = None) -> None:
        state["timer"] = None
        state["last"] = hass.loop.time()
        connection.send_message(
            websocket_api.event_message(msg["id"], controller.live())
        )

    @callback
    def _changed() -> None:
        if state["timer"] is not None:
            return
        wait = LIVE_MIN_INTERVAL_S - (hass.loop.time() - state["last"])
        if wait <= 0:
            _send()
        else:
            state["timer"] = async_call_later(hass, wait, _send)

    remove = controller.add_listener(_changed)

    @callback
    def _unsub() -> None:
        remove()
        if state["timer"] is not None:
            state["timer"]()

    connection.subscriptions[msg["id"]] = _unsub
    connection.send_result(msg["id"])
    _send()


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/heat/get",
        vol.Required("raum_id"): str,
        vol.Required("minuten"): vol.In(HEAT_MINUTES),
    }
)
@callback
def ws_heat(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Bewegungskarte."""
    controller = _controller(hass, msg["raum_id"])
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    connection.send_result(msg["id"], controller.heat_cells(msg["minuten"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/converter_zones/get",
        vol.Required("raum_id"): str,
    }
)
@websocket_api.require_admin
@callback
def ws_converter_zones(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Software-Zonen des Konverters als Vorschlag."""
    controller = _controller(hass, msg["raum_id"])
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    connection.send_result(
        msg["id"],
        {
            "zonen": converter_zones(
                hass, controller.raum.sensor.device_id, controller.raum.sensor.pose
            )
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/haus/save",
        vol.Required("raeume"): [
            vol.Schema(
                {
                    vol.Required("raum_id"): str,
                    vol.Required("x"): vol.Coerce(float),
                    vol.Required("y"): vol.Coerce(float),
                    vol.Required("winkel"): vol.Coerce(float),
                    vol.Optional("stockwerke"): [str],
                    vol.Optional("bereich_id"): vol.Any(None, str),
                }
            )
        ],
        # Lage und Zuschnitt der Grundrisse im Hintergrund.
        vol.Optional("plaene", default=[]): [
            vol.Schema(
                {
                    vol.Required("plan_id"): str,
                    vol.Required("x"): vol.Coerce(float),
                    vol.Required("y"): vol.Coerce(float),
                    vol.Optional("winkel", default=0.0): vol.Coerce(float),
                    vol.Optional("zuschnitt", default=[]): [vol.Coerce(float)],
                    vol.Optional("cm_pro_px"): vol.Coerce(float),
                    # Stockwerk aus Home Assistant; leer = auf jedem Stockwerk.
                    vol.Optional("stockwerk"): vol.Any(None, str),
                }
            )
        ],
        # Wohin Türen führen (wie im Raum), damit ein Speichern reicht.
        vol.Optional("tueren", default=[]): [
            vol.Schema(
                {
                    vol.Required("raum_id"): str,
                    # Tür-Zone (Radar-Räume) oder Öffnung in der Wand (Index).
                    vol.Exclusive("zone_id", "tuer"): str,
                    vol.Exclusive("oeffnung", "tuer"): int,
                    vol.Required("fuehrt_zu"): vol.Any(None, str),
                    # Bestimmte Tür im anderen Raum (Schlüssel wie im Panel).
                    vol.Optional("gegenstueck"): vol.Any(None, str),
                    vol.Optional("name"): vol.Any(
                        None, vol.All(str, vol.Length(max=60))
                    ),
                }
            )
        ],
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_haus_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Lage der Räume im Hausplan: Kopie → prüfen → speichern → neu laden."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    try:
        for lage in msg["raeume"]:
            raum = model.raum(lage["raum_id"])
            raum.haus_x, raum.haus_y = lage["x"], lage["y"]
            # -180 < winkel <= 180, damit 270° und -90° gleich gespeichert werden
            winkel = (lage["winkel"] + 180) % 360 - 180
            raum.haus_winkel = 180.0 if winkel == -180 else winkel
            raum.haus_gesetzt = True
            if "stockwerke" in lage:
                raum.stockwerke = list(dict.fromkeys(lage["stockwerke"]))
            if "bereich_id" in lage:
                raum.bereich_id = lage["bereich_id"] or ""
        for daten in msg["plaene"]:
            plan = next(p for p in model.plaene if p.id == daten["plan_id"])
            plan.x, plan.y = daten["x"], daten["y"]
            w = (daten["winkel"] + 180) % 360 - 180
            plan.winkel = 180.0 if w == -180 else w
            plan.zuschnitt = [round(v, 1) for v in daten["zuschnitt"]]
            if "cm_pro_px" in daten:
                plan.cm_pro_px = daten["cm_pro_px"]
            if "stockwerk" in daten:
                plan.stockwerk = daten["stockwerk"] or ""
        vorrang: set[str] = set()
        for tuer in msg["tueren"]:
            raum = model.raum(tuer["raum_id"])
            ziel = tuer["fuehrt_zu"] or ""
            ding: Any
            if "oeffnung" in tuer:
                if not 0 <= tuer["oeffnung"] < len(raum.oeffnungen):
                    raise KeyError(tuer["oeffnung"])
                ding = raum.oeffnungen[tuer["oeffnung"]]
                if tuer.get("name") is not None:
                    ding.name = tuer["name"].strip()
            elif "zone_id" in tuer:
                ding = next(z for z in raum.zonen if z.id == tuer["zone_id"])
            else:
                raise KeyError("tuer")
            ding.fuehrt_zu = ziel
            if "gegenstueck" in tuer:
                alt = ding.gegenstueck
                ding.gegenstueck = tuer["gegenstueck"] or ""
                # Die alte Gegenseite zeigt nicht mehr hierher.
                if (
                    alt
                    and alt != ding.gegenstueck
                    and (partner := model.tueren().get(alt))
                ):
                    partner[1].gegenstueck = ""
                vorrang.add(raum.id)
        tueren_abgleichen(model, vorrang)
        model.validate()
    except KeyError, StopIteration:
        connection.send_error(msg["id"], "not_found", "Raum oder Tür nicht gefunden")
        return
    except (ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    store.model = model
    await store.async_save()
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"])


# -- Vertrag raumzonen/1 --------------------------------------------------------


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/v1/schema"})
@callback
def ws_v1_schema(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Vertrag und Aufbau der Räume."""
    api = async_get_api(hass)
    connection.send_result(
        msg["id"],
        {"schema": api.schema, "geladen": api.geladen, "raeume": api.raeume()},
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/v1/snapshot", vol.Optional("raum_id"): str}
)
@callback
def ws_v1_snapshot(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Momentaufnahme aller (oder eines) Raums."""
    connection.send_result(
        msg["id"], async_get_api(hass).momentaufnahme(msg.get("raum_id"))
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/v1/subscribe",
        vol.Optional("arten", default=["zone", "sensor", "geladen"]): [vol.In(ARTEN)],
        vol.Optional("raum_id"): str,
    }
)
@callback
def ws_v1_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Meldungen nach Vertrag; zuerst kommt die Momentaufnahme als Ergebnis."""
    api = async_get_api(hass)
    if not msg["arten"]:
        connection.send_error(msg["id"], "invalid", "Keine Arten gewählt")
        return

    @callback
    def _meldung(nachricht: dict[str, Any]) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], nachricht))

    connection.subscriptions[msg["id"]] = api.abonnieren(
        _meldung, msg["arten"], msg.get("raum_id")
    )
    connection.send_result(msg["id"], api.momentaufnahme(msg.get("raum_id")))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/aufnahme/get",
        vol.Required("raum_id"): str,
        vol.Required("von"): str,
        vol.Required("bis"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_aufnahme_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Eigene Aufnahme eines Raums (nur Admins, höchstens 24 h)."""
    controller = _controller(hass, msg["raum_id"])
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    if controller.aufnahme is None:
        connection.send_error(msg["id"], "off", "Aufnahme ist für diesen Raum aus")
        return
    von, bis = dt_util.parse_datetime(msg["von"]), dt_util.parse_datetime(msg["bis"])
    if von is None or bis is None:
        connection.send_error(msg["id"], "invalid", "Zeit nicht lesbar (ISO 8601)")
        return
    await controller.aufnahme.async_flush()
    try:
        zeilen = await controller.aufnahme.async_read(von, bis)
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"], {"zeilen": zeilen})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/auswertung/get",
        vol.Required("raum_id"): str,
        vol.Required("stunden"): vol.In(AUSWERTUNG_STUNDEN),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_auswertung_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Wer war wann wo, aus der eigenen Aufnahme (nur Admins)."""
    controller = _controller(hass, msg["raum_id"])
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    if controller.aufnahme is None:
        connection.send_error(msg["id"], "off", "Aufnahme ist für diesen Raum aus")
        return
    stunden = msg["stunden"]
    now = dt_util.utcnow()
    cached = controller.auswertung_cache.get(stunden)
    if cached and (now - cached[0]).total_seconds() < AUSWERTUNG_CACHE_S:
        connection.send_result(msg["id"], cached[1])
        return
    zonen = {z: zone.shape for z, zone in controller.room.zones.items()}
    try:
        result = await controller.aufnahme.async_auswerten(
            now - timedelta(hours=stunden), now, zonen
        )
    except (OSError, ValueError) as err:
        connection.send_error(msg["id"], "failed", str(err))
        return
    result["stunden"] = stunden
    controller.auswertung_cache[stunden] = (now, result)
    connection.send_result(msg["id"], result)


# -- Räume anlegen und löschen ---------------------------------------------------


def _haus_struktur(hass: HomeAssistant) -> dict[str, Any]:
    floors = fr.async_get(hass)
    areas = ar.async_get(hass)
    stockwerke = sorted(
        floors.async_list_floors(),
        key=lambda f: (f.level if f.level is not None else 0, f.name),
    )
    return {
        "stockwerke_ha": [
            {"id": f.floor_id, "name": f.name, "level": f.level, "icon": f.icon}
            for f in stockwerke
        ],
        "bereiche_ha": [
            {"id": a.id, "name": a.name, "stockwerk": a.floor_id}
            for a in sorted(areas.async_list_areas(), key=lambda a: a.name)
        ],
    }


def _melder_key(hass: HomeAssistant, value: str) -> str:
    """Feste Kennung im Entitätsregister (überlebt Umbenennen), sonst entity_id."""
    entry = er.async_get(hass).async_get(value)
    return entry.id if entry is not None else value


def _area_of(entry: er.RegistryEntry, devices: dr.DeviceRegistry) -> str | None:
    if entry.area_id:
        return entry.area_id
    if entry.device_id and (device := devices.async_get(entry.device_id)):
        return device.area_id
    return None


# Integrationen, deren Melder keine Bewegungs- oder Präsenzmelder im Raum sind.
_TYP_PLATTFORM = {
    "unifiprotect": "Kamera",
    "reolink": "Kamera",
    "frigate": "Kamera",
    "browser_mod": "Tablet (Browser)",
    "fully_kiosk": "Tablet",
    "template": "Vorlage",
    "group": "Gruppe",
    "bayesian": "Vorlage",
}
_BEREICH_NR = re.compile(r"_occupancy_(\d+)(?:_|$)")
_RADAR_WORTE = ("radar", "mmwave", "presence", "breathe", "human", "fp1", "fp2", "fp3")


def melder_typ(
    entry: er.RegistryEntry, device: dr.DeviceEntry | None, klasse: str
) -> str:
    """Art des Melders in Worten: Radar, Bewegungsmelder, Kamera, Tablet ..."""
    if entry.platform in _TYP_PLATTFORM:
        return _TYP_PLATTFORM[entry.platform]
    modell = " ".join(
        x for x in (device.model if device else "", device.name if device else "") if x
    ).lower()
    if "camera" in modell or "cam " in f"{modell} ":
        return "Kamera"
    if "door" in modell or "window" in modell or "contact" in modell:
        return "Kontakt (Tür/Fenster)"
    if any(w in modell for w in _RADAR_WORTE):
        return "Radar (Anwesenheit)"
    if klasse == "motion":
        return "Bewegungsmelder"
    if device is None:
        return "Anwesenheit (ohne Gerät)"
    return "Anwesenheit"


def kandidaten(hass: HomeAssistant, raeume: list[RaumConfig]) -> dict[str, Any]:
    """Was sich als Raum anlegen lässt; bereits benutzte Melder sind markiert."""
    entities = er.async_get(hass)
    devices = dr.async_get(hass)
    areas = ar.async_get(hass)
    benutzt: dict[str, str] = {}
    for raum in raeume:
        for key in raum.melder:
            benutzt[key] = raum.id
    geraete_benutzt = {r.sensor.device_id for r in raeume if not r.ist_melder}
    # Radarsensoren (FP400) erkennen: ihre Belegt-Anzeigen sind keine Melder.
    fp400_ids: set[str] = set()
    for device in devices.devices.values():
        found = find_fp400_entities(hass, device.id)
        if found.targets_xy is not None or found.last_update is not None:
            fp400_ids.add(device.id)
    melder = []
    for entry in entities.entities.values():
        if entry.domain != "binary_sensor" or entry.disabled_by is not None:
            continue
        klasse = entry.device_class or entry.original_device_class
        if klasse not in MELDER_KLASSEN:
            continue
        if entry.platform == DOMAIN:
            continue  # eigene Entitäten nicht als Melder anbieten
        von = benutzt.get(entry.id) or benutzt.get(entry.entity_id)
        # Gehört zu einem Radarsensor: der wird als Radar-Raum angelegt. Schon
        # benutzte bleiben in der Liste (mit Namen), damit man sie abwählen kann.
        angeboten = entry.device_id not in fp400_ids
        if not angeboten and not von:
            continue
        state = hass.states.get(entry.entity_id)
        device = devices.async_get(entry.device_id) if entry.device_id else None
        name = (
            (state.name if state else None)
            or entry.name
            or entry.original_name
            or entry.entity_id
        )
        if not angeboten and (m := _BEREICH_NR.search(entry.unique_id or "")):
            # Alle heißen „… Belegung“; die Nummer des Bereichs macht sie unterscheidbar.
            name = f"{name} (Bereich {m.group(1)} des Sensors)"
        melder.append(
            {
                "id": entry.id,
                "entity_id": entry.entity_id,
                "name": name,
                "klasse": klasse,
                "device_id": entry.device_id,
                "bereich_id": _area_of(entry, devices),
                "benutzt_von": von,
                "geraet": (device.name_by_user or device.name) if device else None,
                "typ": "Radarsensor (Zone)"
                if not angeboten
                else melder_typ(entry, device, klasse),
                "modell": " ".join(x for x in (device.manufacturer, device.model) if x)
                if device
                else None,
                "angeboten": angeboten,
            }
        )
    melder.sort(key=lambda m: (m["bereich_id"] or "~", m["name"]))
    fp400 = []
    for device in devices.devices.values():
        if device.id not in fp400_ids:
            continue
        fp400.append(
            {
                "device_id": device.id,
                "name": device.name_by_user or device.name or device.id,
                "bereich_id": device.area_id,
                "mqtt_topic": suggest_topic(hass, device.id),
                "benutzt": device.id in geraete_benutzt,
            }
        )
    bereiche = [
        {"bereich_id": a.id, "name": a.name}
        for a in sorted(areas.async_list_areas(), key=lambda a: a.name)
    ]
    raum_bereiche = {r.bereich_id for r in raeume if r.bereich_id}
    vorschlaege = []
    for b in bereiche:
        if b["bereich_id"] in raum_bereiche:
            continue
        frei = [
            m["id"]
            for m in melder
            if m["bereich_id"] == b["bereich_id"]
            and not m["benutzt_von"]
            and m["typ"] not in ("Kamera", "Tablet", "Tablet (Browser)")
        ]
        radar = [
            g for g in fp400 if g["bereich_id"] == b["bereich_id"] and not g["benutzt"]
        ]
        if radar:
            # Ein Radarsensor im Bereich: der ist genauer als Bewegungsmelder.
            vorschlaege.append(
                {**b, "art": "radar", "device_id": radar[0]["device_id"], "melder": []}
            )
        elif frei:
            vorschlaege.append({**b, "art": "melder", "melder": frei[:MAX_MELDER]})
    return {
        "melder": melder,
        "fp400": fp400,
        "bereiche": bereiche,
        "vorschlaege": vorschlaege,
    }


KI_SPEICHER = f"{DOMAIN}_ki"
KI_DIENST = ("ai_task", "generate_data")


async def _ki_speicher(hass: HomeAssistant) -> tuple[Store, dict[str, Any]]:
    """Gemerkte Vorschläge (offen, angenommen, verworfen); einmal geladen."""
    if KI_SPEICHER not in hass.data:
        store: Store = Store(hass, 1, f"{DOMAIN}.ki")
        daten = await store.async_load() or {}
        daten.setdefault("offen", [])
        daten.setdefault("angenommen", [])
        daten.setdefault("verworfen", {})
        daten.setdefault("letzter_lauf", None)
        hass.data[KI_SPEICHER] = (store, daten)
    return hass.data[KI_SPEICHER]


def _ki_entitaeten(hass: HomeAssistant) -> list[dict[str, str]]:
    return [
        {"entity_id": st.entity_id, "name": st.name}
        for st in hass.states.async_all("ai_task")
    ]


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/ki/status"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_ki_status(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Ob eine KI da ist, und die gemerkten Vorschläge."""
    _, daten = await _ki_speicher(hass)
    connection.send_result(
        msg["id"],
        {
            "verfuegbar": hass.services.has_service(*KI_DIENST),
            "ki": _ki_entitaeten(hass),
            "offen": daten["offen"],
            "angenommen": daten["angenommen"][-20:],
            "verworfen": len(daten["verworfen"]),
            "letzter_lauf": daten["letzter_lauf"],
        },
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/ki/beschreibung"})
@websocket_api.require_admin
@callback
def ws_ki_beschreibung(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Die Beschreibung, die an die KI geht (zum Ansehen)."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    connection.send_result(
        msg["id"],
        ki_beschreibung(
            hass,
            entry.entry_id,
            entry.runtime_data.store.model,
            entry.runtime_data.controllers,
        ),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/ki/laufen",
        vol.Optional("entity_id"): vol.Any(None, str),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_ki_laufen(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Beschreibung an die KI schicken und neue Vorschläge holen (nur Knopfdruck)."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    if not hass.services.has_service(*KI_DIENST):
        connection.send_error(
            msg["id"],
            "keine_ki",
            "In Home Assistant ist keine KI für Aufgaben eingerichtet",
        )
        return
    store, daten = await _ki_speicher(hass)
    model = entry.runtime_data.store.model
    besch = ki_beschreibung(hass, entry.entry_id, model, entry.runtime_data.controllers)
    verworfen_titel = [v.get("titel", "") for v in daten["verworfen"].values()]
    angenommen_ids = {v["id"] for v in daten["angenommen"]}
    aufruf: dict[str, Any] = {
        "task_name": "Raumzonen: Verbesserungsvorschläge",
        "instructions": ki_anweisung(besch, verworfen_titel),
    }
    if msg.get("entity_id"):
        aufruf["entity_id"] = msg["entity_id"]
    try:
        antwort = await hass.services.async_call(
            *KI_DIENST, aufruf, blocking=True, return_response=True
        )
        vorschlaege = ki_vorschlaege_lesen(
            (antwort or {}).get("data", ""),
            [r.id for r in model.raeume],
            set(daten["verworfen"]) | angenommen_ids,
        )
    except (HomeAssistantError, ValueError) as err:
        connection.send_error(msg["id"], "ki_fehler", str(err))
        return
    daten["offen"] = vorschlaege
    daten["letzter_lauf"] = dt_util.utcnow().isoformat(timespec="seconds")
    await store.async_save(daten)
    connection.send_result(msg["id"], {"offen": vorschlaege})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/ki/entscheiden",
        vol.Required("id"): str,
        vol.Required("annehmen"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_ki_entscheiden(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Vorschlag annehmen (Zonen-Regel: gleich umsetzen) oder verwerfen (merken)."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store, daten = await _ki_speicher(hass)
    vorschlag = next((v for v in daten["offen"] if v["id"] == msg["id"]), None)
    if vorschlag is None:
        connection.send_error(msg["id"], "not_found", "Vorschlag nicht gefunden")
        return
    jetzt = dt_util.utcnow().isoformat(timespec="seconds")
    umgesetzt = False
    if msg["annehmen"] and vorschlag.get("selbst"):
        werte = ki_regel_aenderung(vorschlag)
        modell = copy.deepcopy(entry.runtime_data.store.model)
        try:
            raum = modell.raum(vorschlag["raum"])
            zone = next(z for z in raum.zonen if z.id == vorschlag["ziel"])
        except KeyError, StopIteration:
            connection.send_error(msg["id"], "not_found", "Zone nicht gefunden")
            return
        for feld, wert in werte.items():
            setattr(zone.regel, feld, wert)
        try:
            modell.validate()
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        entry.runtime_data.store.model = modell
        await entry.runtime_data.store.async_save()
        async_reload_keep_panel(hass, entry.entry_id)
        umgesetzt = True
    daten["offen"] = [v for v in daten["offen"] if v["id"] != msg["id"]]
    if msg["annehmen"]:
        daten["angenommen"].append({**vorschlag, "zeit": jetzt, "umgesetzt": umgesetzt})
        daten["angenommen"] = daten["angenommen"][-100:]
    else:
        daten["verworfen"][vorschlag["id"]] = {
            "titel": vorschlag["titel"],
            "zeit": jetzt,
        }
    await store.async_save(daten)
    connection.send_result(msg["id"], {"umgesetzt": umgesetzt})


HANDY_PRAEFIX = "mobile_app_"


def handy_ziele(hass: HomeAssistant) -> list[dict[str, str]]:
    """Handys mit der Home-Assistant-App (Benachrichtigungsdienste der App)."""
    namen = {
        f"{HANDY_PRAEFIX}{slugify(e.data.get('device_name') or e.title)}": e.title
        for e in hass.config_entries.async_entries("mobile_app")
    }
    return [
        {
            "dienst": dienst,
            "name": namen.get(dienst, dienst.removeprefix(HANDY_PRAEFIX)),
        }
        for dienst in sorted(hass.services.async_services_for_domain("notify"))
        if dienst.startswith(HANDY_PRAEFIX)
    ]


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/handy/ziele"})
@websocket_api.require_admin
@callback
def ws_handy_ziele(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Handys, an die der Assistent geschickt werden kann."""
    connection.send_result(msg["id"], {"ziele": handy_ziele(hass)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/handy/senden",
        vol.Required("raum_id"): str,
        vol.Required("dienst"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_handy_senden(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Nachricht ans Handy: Antippen öffnet den Assistenten dieses Raums.

    Nur auf Knopfdruck im Panel und nur an Handys mit der App (keine anderen
    Dienste); Raumzonen schaltet damit nichts im Haus.
    """
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    try:
        raum = entry.runtime_data.store.model.raum(msg["raum_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    if msg["dienst"] not in {z["dienst"] for z in handy_ziele(hass)}:
        connection.send_error(msg["id"], "invalid", "Kein Handy mit der App")
        return
    pfad = f"/raumzonen?assistent={raum.id}"
    await hass.services.async_call(
        "notify",
        msg["dienst"],
        {
            "title": "Raumzonen",
            "message": f"Sensor im Raum „{raum.name}“ einmessen: tippen zum Öffnen.",
            "data": {"url": pfad, "clickAction": pfad, "tag": f"raumzonen_{raum.id}"},
        },
        blocking=True,
    )
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/wege/get"})
@websocket_api.require_admin
@callback
def ws_wege_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Die letzten Wege durchs Haus (nur im Speicher, neueste zuletzt)."""
    wege = hass.data.get(f"{DOMAIN}_wege")
    knoten = wege.knoten if wege is not None else {}
    connection.send_result(
        msg["id"],
        {
            "wege": [
                {
                    "zeit": w.t,
                    "von": w.von,
                    "nach": w.nach,
                    "tuer": knoten[w.tuer].name if w.tuer in knoten else "",
                    "genau": w.genau,
                }
                for w in (wege.liste if wege is not None else [])
            ],
            "tueren": len(knoten),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/kandidaten/get"})
@websocket_api.require_admin
@callback
def ws_kandidaten_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Geräte, Melder und Bereiche, aus denen sich Räume anlegen lassen."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    connection.send_result(
        msg["id"], kandidaten(hass, entry.runtime_data.store.model.raeume)
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/room/create",
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=60)),
        vol.Required("art"): vol.In((RAUM_RADAR, RAUM_MELDER)),
        vol.Optional("bereich_id"): vol.Any(None, str),
        # Melder-Raum
        vol.Optional("melder"): [str],
        # Radar-Raum
        vol.Optional("device_id"): str,
        vol.Optional("quelle"): vol.In((QUELLE_MQTT, QUELLE_ENTITAET)),
        vol.Optional("mqtt_topic"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_create(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Neuen Raum anlegen: Kopie, prüfen, speichern, neu laden."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    name = msg["name"].strip()
    raum_id = _new_id(name, {r.id for r in model.raeume})
    bereich = msg.get("bereich_id") or ""
    if bereich and ar.async_get(hass).async_get_area(bereich) is None:
        connection.send_error(msg["id"], "invalid", "Bereich nicht gefunden")
        return
    if msg["art"] == RAUM_MELDER:
        raum = RaumConfig(
            id=raum_id,
            name=name,
            art=RAUM_MELDER,
            bereich_id=bereich,
            melder=[_melder_key(hass, m) for m in msg.get("melder", [])],
            # Sensor gibt es nicht; die Quelle muss trotzdem gültig sein.
            sensor=SensorConfig(quelle=QUELLE_ENTITAET),
        )
    else:
        device_id = msg.get("device_id", "")
        if dr.async_get(hass).async_get(device_id) is None:
            connection.send_error(msg["id"], "invalid", "Gerät nicht gefunden")
            return
        quelle = msg.get("quelle", QUELLE_MQTT)
        topic = msg.get("mqtt_topic") or suggest_topic(hass, device_id)
        raum = RaumConfig(
            id=raum_id,
            name=name,
            bereich_id=bereich,
            sensor=SensorConfig(
                device_id=device_id,
                quelle=quelle,
                mqtt_topic=topic if quelle == QUELLE_MQTT else "",
            ),
        )
    model.raeume.append(raum)
    try:
        model.validate()
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    store.model = model
    await store.async_save()
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"], {"raum": raum_to_dict(raum)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/room/umwandeln",
        vol.Required("raum_id"): str,
        vol.Required("device_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_umwandeln(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Melder-Raum in einen Radar-Raum umwandeln (FP400 statt Melder).

    Name, Bereich, Stockwerke, Wände, Türen, Lage im Haus und gezeichnete
    Zonen bleiben. „Anwesenheit“ bleibt (automatisch über den ganzen Raum),
    damit die Anzeige in Home Assistant weiter dieselbe ist.
    """
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    try:
        raum = model.raum(msg["raum_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    device_id = msg["device_id"]
    if not raum.ist_melder:
        connection.send_error(msg["id"], "invalid", "Der Raum hat schon einen Sensor")
        return
    found = find_fp400_entities(hass, device_id)
    if dr.async_get(hass).async_get(device_id) is None or (
        found.targets_xy is None and found.last_update is None
    ):
        connection.send_error(msg["id"], "invalid", "Kein Radarsensor (FP400)")
        return
    if any(r.sensor.device_id == device_id for r in model.raeume if not r.ist_melder):
        connection.send_error(
            msg["id"], "invalid", "Dieser Sensor gehört schon zu einem anderen Raum"
        )
        return
    mitte = (
        [
            sum(p[0] for p in raum.umriss) / len(raum.umriss),
            sum(p[1] for p in raum.umriss) / len(raum.umriss),
        ]
        if raum.umriss
        else [0.0, 0.0]
    )
    raum.art = RAUM_RADAR
    raum.sensor = SensorConfig(
        device_id=device_id,
        quelle=QUELLE_MQTT,
        mqtt_topic=suggest_topic(hass, device_id),
        x=round(mitte[0]),
        y=round(mitte[1]),
    )
    raum.melder = []
    raum.melder_lagen = {}
    for zone in raum.zonen:
        zone.melder = []
    # „Anwesenheit“ entsteht in Radar-Räumen mit Wänden von selbst (gleiche
    # Kennung, also dieselbe Anzeige in Home Assistant).
    try:
        model.validate()
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    store.model = model
    await store.async_save()
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"], {"raum": raum_to_dict(raum)})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/room/delete", vol.Required("raum_id"): str}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_room_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Raum mit Zonen löschen (das Panel fragt vorher nach)."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    try:
        model.raum(msg["raum_id"])
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    model.remove(msg["raum_id"])
    model.validate()
    store.model = model
    await store.async_save()
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"])


OEFFNUNG_SCHEMA = vol.Schema(
    {
        vol.Required("kante"): int,
        vol.Required("von"): vol.Coerce(float),
        vol.Required("bis"): vol.Coerce(float),
        vol.Required("art"): str,
        vol.Optional("anschlag", default="anfang"): str,
        vol.Optional("aufgehen", default="innen"): str,
        vol.Optional("fuehrt_zu", default=""): vol.Any(None, str),
    }
)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan/import",
        # Bild des Grundrisses als Hintergrund (optional).
        vol.Optional("plan"): vol.Schema(
            {
                vol.Required("name"): vol.All(str, vol.Length(min=1, max=60)),
                vol.Required("mime"): vol.In(tuple(plan_dateien.ENDUNG)),
                vol.Required("bild"): str,
                vol.Required("cm_pro_px"): vol.Coerce(float),
                vol.Required("breite_px"): int,
                vol.Required("hoehe_px"): int,
                vol.Optional("x", default=0.0): vol.Coerce(float),
                vol.Optional("y", default=0.0): vol.Coerce(float),
                vol.Optional("stockwerk", default=""): vol.Any(None, str),
            }
        ),
        vol.Required("raeume"): vol.All(
            [
                vol.Schema(
                    {
                        vol.Required("raum_id"): str,
                        vol.Required("umriss"): vol.All(
                            [vol.ExactSequence([vol.Coerce(float), vol.Coerce(float)])],
                            vol.Length(min=3),
                        ),
                        vol.Optional("oeffnungen", default=[]): [OEFFNUNG_SCHEMA],
                        vol.Optional("stockwerke"): [str],
                        vol.Required("haus"): vol.Schema(
                            {
                                vol.Required("x"): vol.Coerce(float),
                                vol.Required("y"): vol.Coerce(float),
                                vol.Required("winkel"): vol.Coerce(float),
                            }
                        ),
                    }
                )
            ]
        ),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_plan_import(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Grundriss übernehmen: Kopie, alle Räume ändern, prüfen, speichern, neu laden."""
    entry = _entry(hass)
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Raumzonen ist nicht geladen")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    try:
        for data in msg["raeume"]:
            raum = model.raum(data["raum_id"])
            raum.umriss = [list(p) for p in data["umriss"]]
            raum.oeffnungen = oeffnungen_from_list(
                [
                    {**o, "fuehrt_zu": o.get("fuehrt_zu") or ""}
                    for o in data["oeffnungen"]
                ]
            )
            winkel = (data["haus"]["winkel"] + 180) % 360 - 180
            raum.haus_x, raum.haus_y = data["haus"]["x"], data["haus"]["y"]
            if "stockwerke" in data:
                raum.stockwerke = list(dict.fromkeys(data["stockwerke"]))
            raum.haus_winkel = 180.0 if winkel == -180 else winkel
            raum.haus_gesetzt = True
        roh: bytes | None = None
        if plan := msg.get("plan"):
            roh = plan_dateien.dekodieren(plan["bild"], plan["mime"])
            plan_id = _new_id(plan["name"], {p.id for p in model.plaene})
            model.plaene.append(
                PlanConfig(
                    id=plan_id,
                    name=plan["name"],
                    datei=f"{plan_id}.{plan_dateien.ENDUNG[plan['mime']]}",
                    cm_pro_px=plan["cm_pro_px"],
                    breite_px=plan["breite_px"],
                    hoehe_px=plan["hoehe_px"],
                    x=plan["x"],
                    y=plan["y"],
                    stockwerk=plan.get("stockwerk") or "",
                )
            )
        elif not msg["raeume"]:
            raise ValueError("Nichts zu übernehmen")
        model.validate()
    except KeyError:
        connection.send_error(msg["id"], "not_found", "Raum nicht gefunden")
        return
    except (ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    if roh is not None:
        await hass.async_add_executor_job(
            plan_dateien.schreiben, hass, model.plaene[-1].datei, roh
        )
    store.model = model
    await store.async_save()
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"])


def _plan(hass: HomeAssistant, plan_id: str) -> PlanConfig | None:
    entry = _entry(hass)
    if entry is None:
        return None
    return next(
        (p for p in entry.runtime_data.store.model.plaene if p.id == plan_id), None
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan/bild/get", vol.Required("plan_id"): str}
)
@websocket_api.async_response
async def ws_plan_bild_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Bild eines Grundrisses (Base64)."""
    plan = _plan(hass, msg["plan_id"])
    if plan is None:
        connection.send_error(msg["id"], "not_found", "Grundriss nicht gefunden")
        return
    try:
        bild = await hass.async_add_executor_job(plan_dateien.lesen, hass, plan.datei)
    except OSError:
        connection.send_error(msg["id"], "not_found", "Bild des Grundrisses fehlt")
        return
    endung = plan.datei.rsplit(".", 1)[-1]
    connection.send_result(
        msg["id"], {"mime": plan_dateien.MIME.get(endung, "image/jpeg"), "bild": bild}
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan/delete", vol.Required("plan_id"): str}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_plan_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Grundriss samt Bild löschen (Räume bleiben, wie sie sind)."""
    entry = _entry(hass)
    plan = _plan(hass, msg["plan_id"])
    if entry is None or plan is None:
        connection.send_error(msg["id"], "not_found", "Grundriss nicht gefunden")
        return
    store = entry.runtime_data.store
    model = copy.deepcopy(store.model)
    model.plaene = [p for p in model.plaene if p.id != plan.id]
    store.model = model
    await store.async_save()
    await hass.async_add_executor_job(plan_dateien.loeschen, hass, plan.datei)
    async_reload_keep_panel(hass, entry.entry_id)
    connection.send_result(msg["id"])
