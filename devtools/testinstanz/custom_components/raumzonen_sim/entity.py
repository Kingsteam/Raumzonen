"""Geräte „Simulierter FP400“ (Schlafzimmer) und „Simulierter FP400 Flur“."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from . import DOMAIN

NAMEN = {
    "fp400": "Simulierter FP400",
    "fp400_flur": "Simulierter FP400 Flur",
    "melder_kueche": "Simulierter Melder Küche",
    "melder_bad": "Simulierter Melder Bad",
}
BEREICHE = {"melder_kueche": "Küche", "melder_bad": "Bad"}


def device(key: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, key)},
        name=NAMEN[key],
        manufacturer="Aqara",
        model="Melder (Simulation)" if key in BEREICHE else "FP400 (Simulation)",
        suggested_area=BEREICHE.get(key),
    )


class SimEntity(Entity):
    _attr_has_entity_name = True
    _attr_should_poll = False
