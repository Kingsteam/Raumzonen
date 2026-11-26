"""Raumzonen: Präsenzzonen für Radarsensoren (Aqara FP400) in Home Assistant.

Die Integration lädt das gespeicherte Modell (Räume, Zonen, Regeln), baut
je Raum die Rechenlogik (``core/``) und verbindet sie mit dem Sensor
(``controller.py``). Je Zone entstehen „belegt“ und „Personen“, je Raum
„Sensor verbunden“ und „Figuren“. Die Integration **liest nur** und schaltet
nichts im Haus; Licht und Co. steuern eigene Automationen.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.typing import ConfigType

from .api import async_get_api
from .const import DOMAIN, LOGGER, NAME
from .controller import RoomController
from .entity import room_device_key
from .model import build_room
from .panel import async_register_panel, async_remove_panel
from .store import RaumzonenStore
from .websocket_api import async_register as async_register_websocket

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]


@dataclass(slots=True)
class RaumzonenData:
    """Laufzeitdaten eines Config-Entrys (``entry.runtime_data``)."""

    store: RaumzonenStore
    # Raum-ID → laufender Raum (Rechenlogik + Sensor).
    controllers: dict[str, RoomController] = field(default_factory=dict)
    main_device_id: str = ""


type RaumzonenConfigEntry = ConfigEntry[RaumzonenData]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """WebSocket-Befehle für das Panel anmelden (einmal)."""
    async_register_websocket(hass)
    async_get_api(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: RaumzonenConfigEntry) -> bool:
    """Richtet Raumzonen aus einem Config-Entry ein."""
    store = RaumzonenStore(hass)
    try:
        await store.async_load()
    except ValueError as err:
        # Nicht mit leerem Modell weitermachen: Das würde beim nächsten
        # Speichern die Daten überschreiben.
        raise ConfigEntryError(f"Gespeicherte Daten sind fehlerhaft: {err}") from err

    data = RaumzonenData(store=store)
    registry = dr.async_get(hass)
    main = registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=NAME,
        manufacturer=NAME,
        entry_type=dr.DeviceEntryType.SERVICE,
    )
    data.main_device_id = main.id
    # Geräte gelöschter Räume entfernen (samt ihren Entitäten).
    keys = {room_device_key(entry.entry_id, r.id) for r in store.model.raeume}
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        ids = {i for d, i in device.identifiers if d == DOMAIN}
        if ids and entry.entry_id not in ids and not ids & keys:
            registry.async_remove_device(device.id)
    for raum in store.model.raeume:
        registry.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, room_device_key(entry.entry_id, raum.id))},
            name=raum.name,
            manufacturer=NAME,
            model="Raum",
            via_device_id=main.id,
        )
        data.controllers[raum.id] = RoomController(hass, raum, build_room(raum))
    entry.runtime_data = data

    # Erst die Entitäten (sie stellen „belegt“ vom letzten Lauf wieder her),
    # dann die Sensoren verbinden.
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    for controller in data.controllers.values():
        await controller.async_start()
    async_get_api(hass).attach(store.model.raeume, data.controllers)
    await async_register_panel(hass)
    LOGGER.debug("Raumzonen eingerichtet: %s Räume", len(data.controllers))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: RaumzonenConfigEntry) -> bool:
    """Entlädt den Config-Entry und trennt die Sensoren."""
    async_get_api(hass).detach()
    for controller in entry.runtime_data.controllers.values():
        await controller.async_shutdown()
    async_remove_panel(hass)
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
