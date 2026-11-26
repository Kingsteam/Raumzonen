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
"""

from __future__ import annotations

import copy
from datetime import timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util, slugify
import voluptuous as vol

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
from .model import REGEL_VORLAGEN, RaumConfig, SensorConfig
from .panel import async_reload_keep_panel
from .serialize import (
    oeffnung_from_dict,
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
                }
            )
        ],
        # Nur Melder-Räume
        vol.Optional("melder"): [str],
        vol.Optional("melder_nachlauf_s"): vol.Coerce(float),
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
            raum.oeffnungen = [
                oeffnung_from_dict({**o, "fuehrt_zu": o.get("fuehrt_zu") or ""})
                for o in msg["oeffnungen"]
            ]
        if "melder" in msg:
            raum.melder = [_melder_key(hass, m) for m in msg["melder"]]
        for key in ("aufnahme", "aufnahme_tage", "melder_nachlauf_s"):
            if key in msg:
                setattr(raum, key, msg[key])
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
        for tuer in msg["tueren"]:
            raum = model.raum(tuer["raum_id"])
            ziel = tuer["fuehrt_zu"] or ""
            if "oeffnung" in tuer:
                if not 0 <= tuer["oeffnung"] < len(raum.oeffnungen):
                    raise KeyError(tuer["oeffnung"])
                raum.oeffnungen[tuer["oeffnung"]].fuehrt_zu = ziel
            elif "zone_id" in tuer:
                zone = next(z for z in raum.zonen if z.id == tuer["zone_id"])
                zone.fuehrt_zu = ziel
            else:
                raise KeyError("tuer")
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
    melder = []
    for entry in entities.entities.values():
        if entry.domain != "binary_sensor" or entry.disabled_by is not None:
            continue
        klasse = entry.device_class or entry.original_device_class
        if klasse not in MELDER_KLASSEN:
            continue
        if entry.platform == DOMAIN:
            continue  # eigene Entitäten nicht als Melder anbieten
        state = hass.states.get(entry.entity_id)
        melder.append(
            {
                "id": entry.id,
                "entity_id": entry.entity_id,
                "name": (state.name if state else None)
                or entry.name
                or entry.original_name
                or entry.entity_id,
                "klasse": klasse,
                "bereich_id": _area_of(entry, devices),
                "benutzt_von": benutzt.get(entry.id) or benutzt.get(entry.entity_id),
            }
        )
    melder.sort(key=lambda m: (m["bereich_id"] or "~", m["name"]))
    fp400 = []
    for device in devices.devices.values():
        found = find_fp400_entities(hass, device.id)
        if found.targets_xy is None and found.last_update is None:
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
            if m["bereich_id"] == b["bereich_id"] and not m["benutzt_von"]
        ]
        if frei:
            vorschlaege.append({**b, "melder": frei[:MAX_MELDER]})
    return {
        "melder": melder,
        "fp400": fp400,
        "bereiche": bereiche,
        "vorschlaege": vorschlaege,
    }


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
