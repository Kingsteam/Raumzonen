"""Ende-zu-Ende mit simuliertem FP400 über MQTT (nie die echte Installation)."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import Event, HomeAssistant, State
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    mock_restore_cache,
)

from custom_components.raumzonen.const import (
    DOMAIN,
    EVENT_ZONE,
    MAX_AUFGESTANDEN_S,
    NAME,
    STORAGE_KEY,
)

from .helpers import SimFp400, entity_id
from .test_init import stored
from .test_model import example_model

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


@pytest.fixture
async def sim(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    mqtt: Any,
    freezer: FrozenDateTimeFactory,
) -> SimFp400:
    hass_storage[STORAGE_KEY] = stored(example_model())
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return SimFp400(hass, freezer)


def bed(hass: HomeAssistant) -> State:
    state = hass.states.get(entity_id(hass, "binary_sensor", "_bett_belegt"))
    assert state is not None
    return state


async def test_entities_created(hass: HomeAssistant, sim: SimFp400) -> None:
    assert bed(hass).state == "off"
    assert bed(hass).attributes["device_class"] == "occupancy"
    people = hass.states.get(entity_id(hass, "sensor", "_bett_personen"))
    assert people is not None
    assert people.state == "0"
    connected = hass.states.get(entity_id(hass, "binary_sensor", "_sensor_verbunden"))
    assert connected is not None
    assert connected.state == "on"


async def test_lying_and_getting_up(hass: HomeAssistant, sim: SimFp400) -> None:
    events: list[Event] = async_capture_events(hass, EVENT_ZONE)
    await sim.lie_in_bed()
    assert bed(hass).state == "on"
    assert bed(hass).attributes["personen"] == 1
    # Lange Stille im Liegen ändert nichts.
    await sim.wait(1800)
    assert bed(hass).state == "on"
    # Der Weg zur Tür dauert 6 Rahmen zu 0,3 s = 1,8 s; danach muss das Bett
    # frei sein, also deutlich innerhalb der Grenze.
    await sim.walk_to_door()
    assert MAX_AUFGESTANDEN_S >= 0.3 * 6
    assert bed(hass).state == "off"
    assert bed(hass).attributes["grund"] == "ausgang"
    frees = [e for e in events if e.data["zone_id"] == "bett" and not e.data["belegt"]]
    assert len(frees) == 1
    assert frees[0].data["raum_id"] == "schlafzimmer"


async def test_old_frame_repeated_is_ignored(
    hass: HomeAssistant, sim: SimFp400
) -> None:
    """Zigbee2MQTT wiederholt den Zustand bei anderen Änderungen; kein neuer Rahmen."""
    await sim.lie_in_bed()
    controller = next(iter(hass.config_entries.async_entries(DOMAIN))).runtime_data
    frames = controller.controllers["schlafzimmer"].frames
    await sim.repeat_old()
    assert controller.controllers["schlafzimmer"].frames == frames
    assert bed(hass).state == "on"


async def test_offline_keeps_bed(hass: HomeAssistant, sim: SimFp400) -> None:
    await sim.lie_in_bed()
    await sim.offline()
    await sim.wait(600)
    assert bed(hass).state == "on"
    connected = hass.states.get(entity_id(hass, "binary_sensor", "_sensor_verbunden"))
    assert connected is not None
    assert connected.state == "off"
    # Wieder da: weiter wie vorher.
    await sim.frame((0, -150, 201))
    assert connected.entity_id
    assert hass.states.get(connected.entity_id).state == "on"
    assert bed(hass).state == "on"


async def test_broken_payload_is_ignored(hass: HomeAssistant, sim: SimFp400) -> None:
    from pytest_homeassistant_custom_component.common import async_fire_mqtt_message

    from .helpers import TOPIC

    await sim.lie_in_bed()
    async_fire_mqtt_message(hass, TOPIC, "kein json")
    async_fire_mqtt_message(
        hass, TOPIC, '{"tracking_last_update":"x","tracking_targets":[{"id":1}]}'
    )
    await hass.async_block_till_done()
    assert bed(hass).state == "on"


@pytest.mark.parametrize(
    ("first_frame", "expected"),
    [(None, "on"), ([(0, -150, 205)], "on"), ([], "off")],
)
async def test_restart_keeps_sleeper(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    mqtt: Any,
    freezer: FrozenDateTimeFactory,
    first_frame: list | None,
    expected: str,
) -> None:
    """Nach einem Neustart bleibt das Bett belegt, bis Daten etwas anderes zeigen."""
    hass_storage[STORAGE_KEY] = stored(example_model())
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    # Die entity_id ist beim ersten Start noch nicht bekannt; Home Assistant
    # bildet sie aus Raum und Zone.
    mock_restore_cache(hass, [State("binary_sensor.schlafzimmer_bett", "on")])
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    sim = SimFp400(hass, freezer)
    assert bed(hass).entity_id == "binary_sensor.schlafzimmer_bett"
    assert bed(hass).state == "on"
    await sim.wait(1200)  # ruhiger Schläfer: lange keine Rahmen
    assert bed(hass).state == "on"
    if first_frame is not None:
        await sim.frame(*first_frame)
        await sim.wait(5)
    assert bed(hass).state == expected
