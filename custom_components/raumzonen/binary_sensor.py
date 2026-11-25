"""Binärsensoren: Zone belegt, Sensor verbunden."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.const import STATE_ON, EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from . import RaumzonenConfigEntry
from .controller import RoomController
from .entity import RaumzonenEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RaumzonenConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Je Zone „belegt“, je Raum „Sensor verbunden“."""
    entities: list[RaumzonenEntity] = []
    for controller in entry.runtime_data.controllers.values():
        entities.append(SensorConnected(entry.entry_id, controller))
        entities += [
            ZoneOccupied(entry.entry_id, controller, zone_id)
            for zone_id in controller.room.zones
        ]
    async_add_entities(entities)


class ZoneOccupied(RaumzonenEntity, BinarySensorEntity, RestoreEntity):
    """Zone belegt."""

    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    def __init__(self, entry_id: str, controller: RoomController, zone_id: str) -> None:
        """Eine Zone."""
        super().__init__(entry_id, controller, f"{zone_id}_belegt")
        self.zone_id = zone_id
        self._attr_name = controller.room.zones[zone_id].name

    def _snapshot(self) -> Any:
        state = self.controller.room.states[self.zone_id]
        return (state.occupied, state.count, self.controller.room.available)

    async def async_added_to_hass(self) -> None:
        """Belegt-Zustand vor dem Neustart übernehmen (Figur bleibt)."""
        last = await self.async_get_last_state()
        if last is not None and last.state == STATE_ON:
            self.controller.restore_zone(self.zone_id)
        await super().async_added_to_hass()

    @property
    def is_on(self) -> bool:
        """Belegt."""
        return self.controller.room.states[self.zone_id].occupied

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Personen, Grund und Zeitpunkt der letzten Änderung."""
        state = self.controller.room.states[self.zone_id]
        changed = (
            dt_util.utc_from_timestamp(state.changed_at).isoformat()
            if state.changed_at is not None
            else None
        )
        return {
            "personen": state.count,
            "grund": self.controller.last_reason.get(self.zone_id),
            "geaendert": changed,
            "art": self.controller.room.zones[self.zone_id].art,
        }


class SensorConnected(RaumzonenEntity, BinarySensorEntity):
    """Sensor verbunden und verfügbar."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_translation_key = "sensor_verbunden"

    def __init__(self, entry_id: str, controller: RoomController) -> None:
        """Je Raum einer."""
        super().__init__(entry_id, controller, "sensor_verbunden")

    def _snapshot(self) -> Any:
        return (self.is_on, self.controller.problem)

    @property
    def is_on(self) -> bool:
        """Verbunden und verfügbar."""
        return self.controller.problem is None and self.controller.room.available

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Problem im Klartext."""
        return {"problem": self.controller.problem}
