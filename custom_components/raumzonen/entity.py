"""Gemeinsame Grundlage der Entitäten: ein Gerät je Raum."""

from __future__ import annotations

from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .controller import RoomController


def room_device_key(entry_id: str, raum_id: str) -> str:
    """Kennung des Raum-Geräts im Geräteregister."""
    return f"{entry_id}_{raum_id}"


class RaumzonenEntity(Entity):
    """Entität eines Raums; schreibt ihren Zustand nur bei Änderung."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry_id: str, controller: RoomController, key: str) -> None:
        """``key`` macht die unique_id im Raum eindeutig."""
        self.controller = controller
        raum = controller.raum
        self._attr_unique_id = f"{entry_id}_{raum.id}_{key}"
        # Das Gerät selbst legt __init__.py an (mit via_device_id).
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, room_device_key(entry_id, raum.id))}
        )
        self._last: Any = object()

    def _snapshot(self) -> Any:
        """Was sich ändern muss, damit neu geschrieben wird."""
        raise NotImplementedError

    async def async_added_to_hass(self) -> None:
        """Beim Controller anmelden."""
        await super().async_added_to_hass()
        self._last = self._snapshot()
        self.async_on_remove(self.controller.add_listener(self._changed))

    @callback
    def _changed(self) -> None:
        snap = self._snapshot()
        if snap != self._last:
            self._last = snap
            self.async_write_ha_state()
