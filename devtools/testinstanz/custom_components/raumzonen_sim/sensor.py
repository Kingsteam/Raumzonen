"""Sensoren wie beim Konverter: targets_xy und tracking_last_update."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import SIGNAL, Player, Walker
from .entity import SimEntity, device


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    players: list[Player | Walker] = entry.runtime_data
    async_add_entities(
        SimSensor(player, key, name)
        for player in players
        for key, name in (
            ("targets_xy", "Targets xy"),
            ("tracking_last_update", "Tracking last update"),
        )
    )


class SimSensor(SimEntity, SensorEntity):
    def __init__(self, player: Player | Walker, key: str, name: str) -> None:
        self.player = player
        self.key = key
        self._attr_name = name
        # Wie beim Konverter: der Schlüssel steht in der unique_id.
        prefix = "sim_fp400" if player.key == "fp400" else f"sim_{player.key}"
        self._attr_unique_id = f"{prefix}_{key}_zigbee2mqtt"
        self._attr_device_info = device(player.key)

    @property
    def native_value(self) -> str:
        return self.player.targets if self.key == "targets_xy" else self.player.stamp

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, f"{SIGNAL}_{self.player.key}", self._frame
            )
        )

    @callback
    def _frame(self) -> None:
        self.async_write_ha_state()
