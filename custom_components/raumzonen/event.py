"""Ereignis-Entitäten: Kommen und Gehen je Raum, Raumwechsel im Haus.

Damit lassen sich Automationen bauen, die schon beim Hereinkommen reagieren
(„betreten“ kommt, sobald eine neue Figur in einer Tür- oder Treppen-Zone
auftaucht) oder beim Hinausgehen („verlassen“). „Raumwechsel“ meldet, von wo
nach wo jemand gegangen ist.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.event import EventEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import RaumzonenConfigEntry
from .const import DOMAIN, SIGNAL_WEG
from .controller import RoomController
from .core.room import BETRETEN, UNTERWEGS, VERLASSEN
from .entity import room_device_key


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RaumzonenConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Je Raum „Kommen und Gehen“, fürs Haus „Raumwechsel“."""
    entities: list[EventEntity] = [
        KommenGehen(entry.entry_id, c) for c in entry.runtime_data.controllers.values()
    ]
    entities.append(Raumwechsel(entry.entry_id))
    async_add_entities(entities)


class KommenGehen(EventEntity):
    """Jemand kommt in den Raum oder geht hinaus."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_event_types = [BETRETEN, UNTERWEGS, VERLASSEN]  # noqa: RUF012
    _attr_name = "Kommen und Gehen"
    _attr_icon = "mdi:door-open"

    def __init__(self, entry_id: str, controller: RoomController) -> None:
        """Ein Raum."""
        self.controller = controller
        self._attr_unique_id = f"{entry_id}_{controller.raum.id}_kommen_gehen"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, room_device_key(entry_id, controller.raum.id))}
        )

    async def async_added_to_hass(self) -> None:
        """Beim Controller anmelden."""
        await super().async_added_to_hass()
        self.async_on_remove(self.controller.add_kommen_gehen_listener(self._melden))

    @callback
    def _melden(self, daten: dict[str, Any]) -> None:
        self._trigger_event(
            daten["richtung"],
            {
                "tuer": daten["tuer"],
                "zone_id": daten["zone_id"],
                "fuehrt_zu": daten["fuehrt_zu"],
                "treppe": daten["treppe"],
            },
        )
        self.async_write_ha_state()


class Raumwechsel(EventEntity):
    """Jemand ist von einem Raum in einen anderen gegangen."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_event_types = ["raumwechsel"]  # noqa: RUF012
    _attr_name = "Raumwechsel"
    _attr_icon = "mdi:transit-transfer"

    def __init__(self, entry_id: str) -> None:
        """Am Hauptgerät."""
        self._attr_unique_id = f"{entry_id}_raumwechsel"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, entry_id)})

    async def async_added_to_hass(self) -> None:
        """Auf Wege hören."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_WEG, self._melden)
        )

    @callback
    def _melden(self, daten: dict[str, Any]) -> None:
        self._trigger_event("raumwechsel", dict(daten))
        self.async_write_ha_state()
