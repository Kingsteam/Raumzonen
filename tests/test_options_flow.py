"""Tests für die Einrichtung über die Optionen (Raum, Zonen, Regeln)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY

from .test_entity_source import sim_device

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


@pytest.fixture
async def entry(hass: HomeAssistant, mqtt: Any) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _menu(hass: HomeAssistant, entry: MockConfigEntry, choice: str) -> dict:
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    assert choice in result["menu_options"]
    return await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": choice}
    )


async def _add_room(
    hass: HomeAssistant, entry: MockConfigEntry, device_id: str
) -> None:
    result = await _menu(hass, entry, "raum_neu")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"name": "Schlafzimmer", "device_id": device_id, "quelle": "mqtt"},
    )
    assert result["step_id"] == "raum_mqtt"
    schema = result["data_schema"].schema
    default = next(k for k in schema if k == "mqtt_topic").default()
    assert default == "zigbee2mqtt/Testsensor"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"mqtt_topic": default}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()


async def test_add_room_and_import_zones(
    hass: HomeAssistant, entry: MockConfigEntry, hass_storage: dict[str, Any]
) -> None:
    device_id = sim_device(hass)
    await _add_room(hass, entry, device_id)
    raeume = hass_storage[STORAGE_KEY]["data"]["raeume"]
    assert raeume[0]["id"] == "schlafzimmer"
    assert raeume[0]["sensor"]["mqtt_topic"] == "zigbee2mqtt/Testsensor"

    result = await _menu(hass, entry, "zonen_import")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"raum_id": "schlafzimmer"}
    )
    assert result["step_id"] == "zonen_rollen"
    assert "Bett" in result["description_placeholders"]["zonen"]
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"zone_1": "bett"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    zone = hass_storage[STORAGE_KEY]["data"]["raeume"][0]["zonen"][0]
    assert zone["id"] == "bett"
    assert zone["regel"]["schlaefer_halten"] is True
    assert zone["regel"]["frei_nach_s"] == 2
    # Nach dem Neuladen gibt es die Entität.
    assert entry.runtime_data.controllers["schlafzimmer"].room.zones["bett"]


async def test_adjust_and_delete_zone(
    hass: HomeAssistant, entry: MockConfigEntry, hass_storage: dict[str, Any]
) -> None:
    device_id = sim_device(hass)
    await _add_room(hass, entry, device_id)
    result = await _menu(hass, entry, "zonen_import")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"raum_id": "schlafzimmer"}
    )
    await hass.config_entries.options.async_configure(
        result["flow_id"], {"zone_1": "normal"}
    )
    await hass.async_block_till_done()

    result = await _menu(hass, entry, "zone_waehlen")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"zone": "schlafzimmer/bett"}
    )
    assert result["step_id"] == "zone_einstellen"
    values = {
        "name": "Bett",
        "art": "normal",
        "belegt_nach_s": 2,
        "frei_nach_s": 4,
        "rand_cm": 30,
        "schlaefer_halten": True,
        "weg_rahmen": 4,
        "weg_cm": 50,
        "max_personen": 1,
        "hund_ignorieren": True,
    }
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], values
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    regel = hass_storage[STORAGE_KEY]["data"]["raeume"][0]["zonen"][0]["regel"]
    assert regel["frei_nach_s"] == 4
    assert regel["hund_ignorieren"] is True

    result = await _menu(hass, entry, "zone_loeschen")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"zone": "schlafzimmer/bett"}
    )
    await hass.async_block_till_done()
    assert hass_storage[STORAGE_KEY]["data"]["raeume"][0]["zonen"] == []

    result = await _menu(hass, entry, "raum_loeschen")
    await hass.config_entries.options.async_configure(
        result["flow_id"], {"raum_id": "schlafzimmer"}
    )
    await hass.async_block_till_done()
    assert hass_storage[STORAGE_KEY]["data"]["raeume"] == []


async def test_invalid_topic_and_no_zones(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    device_id = sim_device(hass)
    hass.states.async_set("text.testsensor_software_zone_1_config", "clear")
    result = await _menu(hass, entry, "raum_neu")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"name": "Bad", "device_id": device_id, "quelle": "mqtt"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"mqtt_topic": "zigbee2mqtt/#"}
    )
    assert result["errors"] == {"mqtt_topic": "thema_ungueltig"}
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"mqtt_topic": "zigbee2mqtt/Testsensor"}
    )
    await hass.async_block_till_done()
    result = await _menu(hass, entry, "zonen_import")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"raum_id": "bad"}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "keine_konverter_zonen"
