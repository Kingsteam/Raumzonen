"""Sensoren: Personen je Zone, Figuren im Raum."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import RaumzonenConfigEntry
from .controller import RoomController
from .entity import RaumzonenEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: RaumzonenConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Je Zone „Personen“, je Raum „Figuren“."""
    entities: list[RaumzonenEntity] = []
    for controller in entry.runtime_data.controllers.values():
        if controller.raum.ist_melder:
            continue  # nur „belegt“, Personen weiß ein Melder nicht
        entities.append(RoomFigures(entry.entry_id, controller))
        entities += [
            ZonePeople(entry.entry_id, controller, zone_id)
            for zone_id in controller.room.zones
        ]
    async_add_entities(entities)


class ZonePeople(RaumzonenEntity, SensorEntity):
    """Wie viele Figuren zählen in der Zone."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_translation_key = "personen"

    def __init__(self, entry_id: str, controller: RoomController, zone_id: str) -> None:
        """Eine Zone."""
        super().__init__(entry_id, controller, f"{zone_id}_personen")
        self.zone_id = zone_id
        self._attr_translation_placeholders = {
            "zone": controller.room.zones[zone_id].name
        }

    def _snapshot(self) -> Any:
        return self.native_value

    @property
    def native_value(self) -> int:
        """Anzahl."""
        return self.controller.room.states[self.zone_id].count


class RoomFigures(RaumzonenEntity, SensorEntity):
    """Figuren im ganzen Raum (auch gehaltene)."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_translation_key = "figuren"

    def __init__(self, entry_id: str, controller: RoomController) -> None:
        """Je Raum einer."""
        super().__init__(entry_id, controller, "figuren")

    def _snapshot(self) -> Any:
        return self.native_value

    @property
    def native_value(self) -> int:
        """Anzahl."""
        return self.controller.room.figure_count
