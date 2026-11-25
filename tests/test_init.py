"""Tests für Einrichten, Laden und Entladen."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import MqttMockHAClient

from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY, STORAGE_VERSION

from .test_model import example_model


def stored(data: dict[str, Any]) -> dict[str, Any]:
    return {
        "version": STORAGE_VERSION,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": data,
    }


async def test_setup_with_empty_store(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    assert entry.runtime_data.controllers == {}
    device = dr.async_get(hass).async_get(entry.runtime_data.main_device_id)
    assert device is not None
    assert device.entry_type is dr.DeviceEntryType.SERVICE
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED


@pytest.mark.parametrize("expected_lingering_timers", [True])
async def test_setup_builds_rooms(
    hass: HomeAssistant, hass_storage: dict[str, Any], mqtt: MqttMockHAClient
) -> None:
    hass_storage[STORAGE_KEY] = stored(example_model())
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    controller = entry.runtime_data.controllers["schlafzimmer"]
    assert set(controller.room.zones) == {"bett", "tuer", "hund"}
    assert controller.problem is None
    devices = dr.async_get(hass).async_get_devices(
        identifiers={(DOMAIN, f"{entry.entry_id}_schlafzimmer")}
    )
    assert len(devices) == 1
    room_device = devices[0]
    assert room_device.via_device_id == entry.runtime_data.main_device_id
    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_without_mqtt_room_reports_problem(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    """Ohne MQTT läuft die Integration weiter; der Raum meldet das Problem."""
    hass_storage[STORAGE_KEY] = stored(example_model())
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    assert "MQTT" in entry.runtime_data.controllers["schlafzimmer"].problem


async def test_broken_store_is_not_overwritten(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    broken = example_model()
    broken["raeume"][0]["zonen"][0]["regel"]["frei_nach_s"] = -1
    hass_storage[STORAGE_KEY] = stored(broken)
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.SETUP_ERROR
    assert hass_storage[STORAGE_KEY]["data"] == broken
