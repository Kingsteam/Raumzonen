"""Zwei erfundene Bewegungsmelder (Küche, Bad), die abwechselnd auslösen."""

from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval

from .entity import SimEntity, device

# Takt (s): Küche 25 s an je Minute, Bad 15 s an, kurz nach der Küche.
TAKT = {"melder_kueche": (0, 25), "melder_bad": (30, 15)}


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities(SimMelder(key) for key in TAKT)


class SimMelder(SimEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.MOTION
    _attr_name = "Bewegung"

    def __init__(self, key: str) -> None:
        self.key = key
        self._attr_unique_id = f"sim_{key}_bewegung"
        self._attr_device_info = device(key)
        self._attr_is_on = False

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_track_time_interval(self.hass, self._tick, timedelta(seconds=1))
        )

    @callback
    def _tick(self, now: datetime) -> None:
        start, dauer = TAKT[self.key]
        on = (now.second - start) % 60 < dauer
        if on != self._attr_is_on:
            self._attr_is_on = on
            self.async_write_ha_state()
