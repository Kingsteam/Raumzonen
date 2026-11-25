"""Software-Zonen des Konverters (fest, wie zur Zeit der Aufnahmen)."""

from __future__ import annotations

import json

from homeassistant.components.text import TextEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import DATEN
from .entity import SimEntity, device

NAMEN = {"bett": "Bett", "tuer": "Tür", "kasten": "Kasten"}


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    zonen = await hass.async_add_executor_job(
        lambda: json.loads(
            (DATEN / "schlafzimmer-zonen.json").read_text(encoding="utf-8")
        )
    )
    entities = []
    for n, key in enumerate(("bett", "tuer", "kasten"), 1):
        value = {"name": NAMEN[key], **zonen[key], "absence_timeout": 5}
        entities.append(SimZone(n, json.dumps(value, ensure_ascii=False)))
    async_add_entities(entities)


class SimZone(SimEntity, TextEntity):
    _attr_native_max = 255

    def __init__(self, number: int, value: str) -> None:
        self._attr_name = f"Software zone {number} config"
        self._attr_unique_id = f"sim_fp400_software_zone_{number}_config_zigbee2mqtt"
        self._attr_native_value = value
        self._attr_device_info = device("fp400")

    async def async_set_value(self, value: str) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()
