"""Geräte „Simulierter FP400“ (Schlafzimmer) und „Simulierter FP400 Flur“."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from . import DOMAIN

NAMEN = {"fp400": "Simulierter FP400", "fp400_flur": "Simulierter FP400 Flur"}


def device(key: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, key)},
        name=NAMEN[key],
        manufacturer="Aqara",
        model="FP400 (Simulation)",
    )


class SimEntity(Entity):
    _attr_has_entity_name = True
    _attr_should_poll = False
