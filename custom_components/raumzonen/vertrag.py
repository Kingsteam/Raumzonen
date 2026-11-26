"""Datenformat des Vertrags ``raumzonen/1`` (für Abnehmer wie das Homebrain).

Eine Stelle, die aus den Innereien die vereinbarten Daten baut; benutzt von
der Python-Schnittstelle (``api.py``) und dem WebSocket ``raumzonen/v1/…``.
Vertrag in Worten: ``docs/homebrain/VERTRAG-raumzonen-1.md``; Beispiele in
``docs/homebrain/beispiele/``. Regeln:

* Neue Felder dürfen dazukommen; die Bedeutung bestehender ändert sich nie.
* Fehlt ein Wert (``None``), heißt das „weiß nicht“, nicht „nein“.
* Schweigen des Sensors heißt nicht „niemand da“: gehaltene Spuren bleiben.
* Positionen gibt es nur hier, nie als Entität oder Ereignis.
"""

from __future__ import annotations

import math
from typing import TYPE_CHECKING, Any

from homeassistant.util import dt as dt_util

from .aufnahme import spur_id
from .const import FUEHRT_ZU_AUSSEN
from .core.room import (
    ART_AUSGANG,
    ART_HUNDEPLATZ,
    ART_STELLE,
    TAG_HUND,
    TAG_STOERUNG,
    TAG_WIEDERHERGESTELLT,
)
from .core.tracks import HELD, Track
from .model import anwesenheit_zone, melder_zone

if TYPE_CHECKING:
    from .controller import RoomController
    from .model import RaumConfig

SCHEMA = "raumzonen/1"
# Stellen im Sinne des Vertrags (markierte Flächen ohne eigene Regel nach außen).
STELLEN_ARTEN = (ART_STELLE, ART_HUNDEPLATZ)


def _iso(ts: float | None) -> str | None:
    return None if ts is None else dt_util.utc_from_timestamp(ts).isoformat()


def raum_info(raum: RaumConfig, melder: list[str] | None = None) -> dict[str, Any]:
    """Aufbau eines Raums: Lage im Haus, Sensor, Zonen, Türen, Stellen.

    ``melder``: aktuelle ``entity_id`` der Melder eines Melder-Raums.
    """
    zonen = []
    raender = []
    stellen = []
    z = melder_zone(raum) if raum.ist_melder else anwesenheit_zone(raum)
    if z is not None:
        zonen.append(
            {
                "zone_id": z.id,
                "name": z.name,
                "art": z.art,
                "form": {"art": "vieleck", "punkte": [list(p) for p in z.shape.points]},
            }
        )
    for zone in raum.zonen:
        zonen.append(
            {"zone_id": zone.id, "name": zone.name, "art": zone.art, "form": zone.form}
        )
        if zone.art == ART_AUSGANG:
            raender.append(
                {
                    "rand_id": zone.id,
                    "name": zone.name,
                    "form": zone.form,
                    # Leer heißt: noch nicht eingetragen (weiß nicht).
                    "fuehrt_zu": zone.fuehrt_zu or None,
                }
            )
        if zone.art in STELLEN_ARTEN:
            stellen.append(
                {
                    "stelle_id": zone.id,
                    "name": zone.name,
                    "art": zone.art,
                    "form": zone.form,
                }
            )
    s = raum.sensor
    return {
        "raum_id": raum.id,
        "name": raum.name,
        "bereich_id": raum.bereich_id or None,
        # Stockwerke (IDs aus Home Assistant); leer = das Stockwerk des Bereichs.
        "stockwerke": list(raum.stockwerke),
        "art": raum.art,
        # None = noch nicht im Hausplan (weiß nicht).
        "haus": {"x": raum.haus_x, "y": raum.haus_y, "winkel": raum.haus_winkel}
        if raum.haus_gesetzt
        else None,
        # Nur Melder-Räume: welche Melder (entity_id, sonst None = weiß nicht).
        "melder": list(melder or []),
        "sensor": {
            "device_id": s.device_id or None,
            "quelle": s.quelle,
            "lage": {"x": s.x, "y": s.y, "winkel": s.winkel},
            "reichweite_cm": s.reichweite_cm,
            "oeffnung_grad": s.oeffnung_grad,
        },
        "umriss": raum.umriss,
        # Türen und offene Stellen in den Wänden: Wand ``kante`` (von Ecke
        # kante zu kante+1), Abschnitt ``von``/``bis`` in cm, ``art``.
        "oeffnungen": [
            {
                "kante": o.kante,
                "von": o.von,
                "bis": o.bis,
                "art": o.art,
                "anschlag": o.anschlag,
                "aufgehen": o.aufgehen,
                "fuehrt_zu": o.fuehrt_zu or None,
            }
            for o in raum.oeffnungen
        ],
        "zonen": zonen,
        "raender": raender,
        "stellen": stellen,
    }


def sensor_status(c: RoomController) -> dict[str, Any]:
    """Zustand des Sensors. ``daten_frisch`` heißt nicht „gerade gemeldet“."""
    erreichbar = c.room.available and c.problem is None
    age = None
    if c.last_frame_at is not None:
        age = round(dt_util.utcnow().timestamp() - c.last_frame_at.timestamp(), 1)
    return {
        "device_id": c.raum.sensor.device_id or None,
        "erreichbar": erreichbar,
        # Erreichbar und Meldungen vollständig. Ein schweigender Sensor bei
        # einem ruhig Liegenden ist frisch: Schweigen heißt nicht „weg“.
        "daten_frisch": erreichbar and c.unvollstaendig is not True,
        "letzte_meldung_vor_s": age,
        # None = weiß nicht (nur mit Quelle MQTT bekannt)
        "unvollstaendig": c.unvollstaendig,
        "problem": c.problem,
    }


def _zaehlbar(t: Track) -> bool:
    return not t.tags & {TAG_STOERUNG, TAG_WIEDERHERGESTELLT}


def zone_status(c: RoomController, zone_id: str) -> dict[str, Any]:
    """Zustand einer Zone."""
    state = c.room.states[zone_id]
    zone = c.room.zones[zone_id]
    drin = [t for t in c.room.tracks_in_zone(zone_id) if _zaehlbar(t)]
    hund = sum(1 for t in drin if TAG_HUND in t.tags)
    daten_ok = sensor_status(c)["daten_frisch"]
    zustand = "unklar" if not daten_ok else "belegt" if state.occupied else "frei"
    return {
        "zone_id": zone_id,
        "raum_id": c.raum.id,
        "name": zone.name,
        "art": zone.art,
        "belegt": state.occupied,
        "zustand": zustand,
        # Kommt in Phase 4b (50 bis 100 %, wie sicher die Antwort ist).
        "sicherheit": None,
        "grund": c.last_reason.get(zone_id),
        "daten_ok": daten_ok,
        "personen": state.count,
        "mensch": len(drin) - hund,
        "hund": hund,
        "seit": _iso(state.changed_at),
    }


def _speed(t: Track, now: float) -> float | None:
    pts = [(ts, x, y) for ts, x, y in t.history if ts >= now - 1.5]
    if len(pts) < 2 or pts[-1][0] <= pts[0][0]:
        return None
    (t0, x0, y0), (t1, x1, y1) = pts[0], pts[-1]
    return round(math.hypot(x1 - x0, y1 - y0) / (t1 - t0), 1)


def spur_status(c: RoomController, t: Track, now: float) -> dict[str, Any]:
    """Eine Spur in Raumkoordinaten."""
    bewegt = t.moving(now, c.room.tracker.settings)
    raw = c.last_raw.get(t.sensor_id) if t.state != HELD else None
    mikro = raw.get("micro_points") if raw else None
    zonen = c.room.zones_of_track(t.track_id)
    in_zonen = [z for z in zonen if c.room.zones[z].art not in STELLEN_ARTEN]
    an_stellen = [z for z in zonen if c.room.zones[z].art in STELLEN_ARTEN]
    return {
        "spur_id": spur_id(c.raum.id, t),
        "raum_id": c.raum.id,
        # False: war schon im ersten Rahmen nach dem Laden da (nur neu
        # nummeriert); True: kam danach dazu.
        "neu_seit_laden": c.first_frame_t is not None
        and t.first_seen > c.first_frame_t + 1e-6,
        "x": round(t.x, 1),
        "y": round(t.y, 1),
        "gehalten": t.state == HELD,
        "bewegt": bewegt,
        "still_seit": None if bewegt else _iso(t.last_moved),
        "still_s": None if bewegt else round(now - t.last_moved, 1),
        "geschwindigkeit": _speed(t, now),
        "mikro": mikro if isinstance(mikro, int | float) else None,
        "art_sensor": t.type,
        # Kommen in Phase 4b; bis dahin „weiß nicht“.
        "herkunft": "unbekannt",
        "klasse": "hund" if TAG_HUND in t.tags else "unklar",
        "klasse_punkte": {},
        "in_zonen": in_zonen,
        "an_stellen": an_stellen,
        "tags": sorted(t.tags),
        "seit": _iso(t.first_seen),
        "zuletzt": _iso(t.last_seen),
    }


def spuren(c: RoomController) -> list[dict[str, Any]]:
    """Alle Spuren eines Raums (ohne Platzhalter nach dem Neustart).

    Melder-Räume haben keine Positionen, darum keine Spuren.
    """
    if c.raum.ist_melder:
        return []
    now = dt_util.utcnow().timestamp()
    return [
        spur_status(c, t, now)
        for t in c.room.tracker.tracks.values()
        if TAG_WIEDERHERGESTELLT not in t.tags
    ]


def stellen_status(c: RoomController) -> list[dict[str, Any]]:
    """Je Stelle: steht dort ein Ziel, seit wann, welche Spuren."""
    out = []
    for zone_id, zone in c.room.zones.items():
        if zone.art not in STELLEN_ARTEN:
            continue
        state = c.room.states[zone_id]
        drin = c.room.tracks_in_zone(zone_id)
        out.append(
            {
                "stelle_id": zone_id,
                "ziel_da": state.occupied,
                "seit": _iso(state.changed_at),
                "bewegt": any(
                    t.moving(dt_util.utcnow().timestamp(), c.room.tracker.settings)
                    for t in drin
                ),
                "spuren": [spur_id(c.raum.id, t) for t in drin],
            }
        )
    return out


def raum_zustand(c: RoomController) -> dict[str, Any]:
    """Momentaufnahme eines Raums."""
    sensor = sensor_status(c)
    return {
        "raum_id": c.raum.id,
        "daten_ok": sensor["daten_frisch"],
        # Spur-Kennungen gelten ab diesem Zeitpunkt (neu nach jedem Laden).
        "spuren_seit": c.started_at.isoformat(),
        "sensor": sensor,
        "zonen": [zone_status(c, z) for z in c.room.zones],
        "stellen": stellen_status(c),
        "spuren": spuren(c),
    }


def momentaufnahme(
    controllers: dict[str, RoomController], raum_id: str | None = None
) -> dict[str, Any]:
    """Alle (oder ein) Raum jetzt."""
    return {
        "schema": SCHEMA,
        "zeit": dt_util.utcnow().isoformat(),
        "raeume": [
            raum_zustand(c)
            for rid, c in controllers.items()
            if raum_id is None or rid == raum_id
        ],
    }


def nachricht(art: str, raum_id: str, daten: Any, seq: int = 0) -> dict[str, Any]:
    """Eine Meldung im Abo (``seq`` zählt je Abo ab 1, Lücken = verpasst)."""
    return {
        "schema": SCHEMA,
        "seq": seq,
        "art": art,
        "raum_id": raum_id,
        "zeit": dt_util.utcnow().isoformat(),
        "daten": daten,
    }


__all__ = [
    "FUEHRT_ZU_AUSSEN",
    "SCHEMA",
    "momentaufnahme",
    "nachricht",
    "raum_info",
    "raum_zustand",
]
