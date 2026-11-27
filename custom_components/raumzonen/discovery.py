"""Entitäten eines FP400-Geräts finden (über das Entitätsregister).

Gesucht wird über die ``unique_id`` der von Zigbee2MQTT angelegten
Entitäten, nicht über die ``entity_id`` (die lässt sich umbenennen).
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import DATENSTROM_ZONE_CM, DATENSTROM_ZONE_NAME, DEFAULT_MQTT_BASIS
from .core.fp400 import parse_converter_zone
from .core.pose import Pose

_ZONE_RE = re.compile(r"software_zone_(\d+)_config")


@dataclass(slots=True)
class Fp400Entities:
    """Gefundene Entitäten eines FP400."""

    targets_xy: str | None = None
    last_update: str | None = None
    # Nummer der Software-Zone → entity_id der Text-Entität
    zone_configs: dict[int, str] = field(default_factory=dict)


def find_fp400_entities(hass: HomeAssistant, device_id: str) -> Fp400Entities:
    """Sucht die Entitäten des Konverters an einem Gerät."""
    found = Fp400Entities()
    for entry in er.async_entries_for_device(
        er.async_get(hass), device_id, include_disabled_entities=True
    ):
        uid = entry.unique_id or ""
        if entry.domain == "sensor" and "targets_xy" in uid:
            found.targets_xy = entry.entity_id
        elif entry.domain == "sensor" and "tracking_last_update" in uid:
            found.last_update = entry.entity_id
        elif entry.domain == "text" and (m := _ZONE_RE.search(uid)):
            found.zone_configs[int(m.group(1))] = entry.entity_id
    return found


def _zone_name(value: str | None) -> str | None:
    """Name einer Software-Zone aus ihrem Text, ``None`` = keine Zone."""
    if not value or value in ("clear", "unknown", "unavailable"):
        return None
    try:
        data = json.loads(value)
    except ValueError:
        return None
    if not isinstance(data, dict):
        return None
    return str(data.get("name") or "Zone")


def datenstrom(
    hass: HomeAssistant, device_id: str, ersetzt: dict[str, str] | None = None
) -> dict[str, Any]:
    """Prüft, ob der Positions-Strom des FP400 laufen kann.

    Der Zigbee-Treiber hält den Strom nur offen, solange beim Treiber
    mindestens eine Software-Zone eingetragen ist. ``fehlt`` heißt: alle
    Plätze melden sicher „clear“ (unbekannte oder nicht erreichbare Plätze
    zählen nicht als leer, dann wird nicht gewarnt). ``eigene`` heißt: die
    Zone von Raumzonen ist eingetragen (nur die darf „Zurück“ entfernen).
    ``ersetzt`` setzt Werte, die gerade geschrieben wurden, aber vom
    Treiber noch nicht bestätigt sind.
    """
    configs = find_fp400_entities(hass, device_id).zone_configs
    werte = []
    for entity_id in configs.values():
        if ersetzt and entity_id in ersetzt:
            werte.append(ersetzt[entity_id])
            continue
        state = hass.states.get(entity_id)
        werte.append(state.state if state else None)
    namen = [_zone_name(w) for w in werte]
    return {
        "fehlt": bool(werte) and all(w == "clear" for w in werte),
        "eigene": DATENSTROM_ZONE_NAME in namen,
    }


def datenstrom_platz(hass: HomeAssistant, device_id: str, an: bool) -> str | None:
    """Text-Entität, die für „an“ beschrieben bzw. für „aus“ geleert wird.

    „an“: der erste Platz, der sicher „clear“ ist (nie eine fremde Zone
    überschreiben). „aus“: der Platz mit der Zone von Raumzonen.
    """
    for _, entity_id in sorted(
        find_fp400_entities(hass, device_id).zone_configs.items()
    ):
        state = hass.states.get(entity_id)
        wert = state.state if state else None
        if an and wert == "clear":
            return entity_id
        if not an and _zone_name(wert) == DATENSTROM_ZONE_NAME:
            return entity_id
    return None


def datenstrom_zone() -> str:
    """Text der Software-Zone, die den Strom offen hält (ganzer Bereich)."""
    return json.dumps(
        {
            "name": DATENSTROM_ZONE_NAME,
            "x_min": -DATENSTROM_ZONE_CM,
            "x_max": DATENSTROM_ZONE_CM,
            "y_min": -DATENSTROM_ZONE_CM,
            "y_max": DATENSTROM_ZONE_CM,
            "absence_timeout": 5,
        },
        separators=(",", ":"),
    )


def suggest_topic(hass: HomeAssistant, device_id: str) -> str:
    """Vorschlag für das MQTT-Thema: ``zigbee2mqtt/<Gerätename>``.

    Zigbee2MQTT benennt Geräte in Home Assistant nach dem „friendly name“,
    der auch im Thema steht. Hat jemand das Gerät in Home Assistant
    umbenannt, stimmt der Vorschlag nicht; darum ist er änderbar.
    """
    device = dr.async_get(hass).async_get(device_id)
    if device is None or not device.name:
        return ""
    return f"{DEFAULT_MQTT_BASIS}/{device.name}"


def converter_zones(
    hass: HomeAssistant, device_id: str, pose: Pose | None = None
) -> list[dict[str, Any]]:
    """Die im Konverter eingerichteten Software-Zonen als Vorschläge.

    Der Konverter rechnet in Sensorkoordinaten; mit ``pose`` werden die
    Ecken in Raumkoordinaten umgerechnet.
    """
    out = []
    for number, entity_id in sorted(
        find_fp400_entities(hass, device_id).zone_configs.items()
    ):
        state = hass.states.get(entity_id)
        try:
            zone = parse_converter_zone(state.state if state else None)
        except ValueError, KeyError, TypeError:
            continue
        if zone is not None:
            if pose is not None and not pose.identity:
                zone["form"]["punkte"] = pose.points_to_room(zone["form"]["punkte"])
            out.append({"nummer": number, **zone})
    return out
