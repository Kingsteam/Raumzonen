"""Quelle „Entitäten“: targets_xy + tracking_last_update eines simulierten Geräts."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY
from custom_components.raumzonen.discovery import (
    converter_zones,
    find_fp400_entities,
    suggest_topic,
)

from .helpers import entity_id
from .test_init import stored
from .test_model import example_model

BED_ZONE = '{"name":"Bett","x_min":-250,"x_max":-50,"y_min":120,"y_max":280}'


def sim_device(hass: HomeAssistant) -> str:
    """Ein FP400 wie von Zigbee2MQTT angelegt (erfundene Kennungen)."""
    mqtt_entry = MockConfigEntry(domain="mqtt")
    mqtt_entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=mqtt_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0xtest")},
        name="Testsensor",
        manufacturer="Aqara",
    )
    reg = er.async_get(hass)
    for domain, key in (
        ("sensor", "targets_xy"),
        ("sensor", "tracking_last_update"),
        ("text", "software_zone_1_config"),
        ("text", "software_zone_2_config"),
    ):
        reg.async_get_or_create(
            domain,
            "mqtt",
            f"0xtest_{key}_zigbee2mqtt",
            config_entry=mqtt_entry,
            device_id=device.id,
            suggested_object_id=f"testsensor_{key}",
        )
    hass.states.async_set("text.testsensor_software_zone_1_config", BED_ZONE)
    hass.states.async_set("text.testsensor_software_zone_2_config", "clear")
    return device.id


async def test_discovery(hass: HomeAssistant) -> None:
    device_id = sim_device(hass)
    found = find_fp400_entities(hass, device_id)
    assert found.targets_xy == "sensor.testsensor_targets_xy"
    assert found.last_update == "sensor.testsensor_tracking_last_update"
    assert set(found.zone_configs) == {1, 2}
    zones = converter_zones(hass, device_id)
    assert [z["name"] for z in zones] == ["Bett"]
    assert suggest_topic(hass, device_id) == "zigbee2mqtt/Testsensor"


async def test_entity_source(
    hass: HomeAssistant, hass_storage: dict[str, Any], freezer: FrozenDateTimeFactory
) -> None:
    device_id = sim_device(hass)
    # Stand beim Start: jemand liegt im Bett.
    hass.states.async_set("sensor.testsensor_targets_xy", "0:-150:200")
    hass.states.async_set("sensor.testsensor_tracking_last_update", "t0")
    model = example_model()
    model["raeume"][0]["sensor"] = {"quelle": "entitaet", "device_id": device_id}
    hass_storage[STORAGE_KEY] = stored(model)
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    bed_id = entity_id(hass, "binary_sensor", "_bett_belegt")

    async def tick(seconds: float) -> None:
        freezer.tick(timedelta(seconds=seconds))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    await tick(4)
    assert hass.states.get(bed_id).state == "on"

    # Gehen zur Tür: jede neue Zeit in tracking_last_update ist ein Rahmen.
    path = [(-130, 170), (-100, 140), (-70, 110), (-40, 80), (0, 50), (40, 30)]
    for n, (x, y) in enumerate(path, 1):
        hass.states.async_set("sensor.testsensor_targets_xy", f"0:{x}:{y}")
        hass.states.async_set("sensor.testsensor_tracking_last_update", f"t{n}")
        await tick(0.3)
    assert hass.states.get(bed_id).state == "off"

    # Nur targets_xy ändert sich, ohne neuen Rahmen: wird nicht gezählt.
    controller = entry.runtime_data.controllers["schlafzimmer"]
    frames = controller.frames
    hass.states.async_set("sensor.testsensor_targets_xy", "0:-150:200")
    await tick(1)
    assert controller.frames == frames


async def test_entity_source_missing_entities(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    mqtt_entry = MockConfigEntry(domain="mqtt")
    mqtt_entry.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=mqtt_entry.entry_id, identifiers={("mqtt", "leer")}, name="Leer"
    )
    model = example_model()
    model["raeume"][0]["sensor"] = {"quelle": "entitaet", "device_id": device.id}
    hass_storage[STORAGE_KEY] = stored(model)
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert "nicht gefunden" in entry.runtime_data.controllers["schlafzimmer"].problem
    connected = hass.states.get(entity_id(hass, "binary_sensor", "_sensor_verbunden"))
    assert connected.state == "off"
