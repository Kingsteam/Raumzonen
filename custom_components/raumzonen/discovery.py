"""Entitäten eines FP400-Geräts finden (über das Entitätsregister).

Gesucht wird über die ``unique_id`` der von Zigbee2MQTT angelegten
Entitäten, nicht über die ``entity_id`` (die lässt sich umbenennen).
"""

from __future__ import annotations

from dataclasses import dataclass, field
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import DEFAULT_MQTT_BASIS
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
