"""Räume nur mit Bewegungsmeldern; Räume im Panel anlegen und löschen."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY
from custom_components.raumzonen.model import RaumzonenModel
from custom_components.raumzonen.serialize import model_from_dict

from .test_entity_source import sim_device
from .test_init import stored
from .test_model import example_model

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


def melder(hass: HomeAssistant, name: str, area: str | None = None) -> er.RegistryEntry:
    """Ein erfundener Bewegungsmelder."""
    other = MockConfigEntry(domain="zha")
    other.add_to_hass(hass)
    entry = er.async_get(hass).async_get_or_create(
        "binary_sensor",
        "zha",
        f"melder_{name}",
        config_entry=other,
        suggested_object_id=f"melder_{name}",
        original_device_class="motion",
    )
    if area:
        er.async_get(hass).async_update_entity(entry.entity_id, area_id=area)
    hass.states.async_set(entry.entity_id, "off", {"device_class": "motion"})
    return er.async_get(hass).async_get(entry.entity_id)


@pytest.fixture
async def loaded(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    mqtt: Any,
    freezer: FrozenDateTimeFactory,
) -> MockConfigEntry:
    model = example_model()
    model["raeume"][0]["sensor"]["device_id"] = sim_device(hass)
    hass_storage[STORAGE_KEY] = stored(model)
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def test_modell_prueft_melder_raeume() -> None:
    data = example_model()
    data["raeume"].append(
        {"id": "flur", "name": "Flur", "art": "melder", "melder": ["abc"]}
    )
    model = model_from_dict(data)
    assert model.raum("flur").ist_melder
    data["raeume"][1]["melder"] = []
    with pytest.raises(ValueError, match="mindestens ein Melder"):
        model_from_dict(data)
    data["raeume"][1]["melder"] = ["abc"]
    data["raeume"][1]["zonen"] = example_model()["raeume"][0]["zonen"][:1]
    with pytest.raises(ValueError, match="keine eigenen Zonen"):
        model_from_dict(data)


def test_loeschen_raeumt_tueren_auf() -> None:
    data = example_model()
    data["raeume"].append(
        {
            "id": "flur",
            "name": "Flur",
            "art": "melder",
            "melder": ["abc"],
            "umriss": [[0, 0], [100, 0], [100, 100], [0, 100]],
            "oeffnungen": [
                {"kante": 0, "von": 10, "bis": 80, "fuehrt_zu": "schlafzimmer"}
            ],
        }
    )
    tuer = next(z for z in data["raeume"][0]["zonen"] if z.get("art") == "ausgang")
    tuer["fuehrt_zu"] = "flur"
    model: RaumzonenModel = model_from_dict(data)
    model.remove("flur")
    model.validate()
    assert all(z.fuehrt_zu != "flur" for z in model.raeume[0].zonen)
    model.remove("schlafzimmer")
    assert model.raeume == []


async def test_melder_raum_anlegen_und_belegen(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    freezer: FrozenDateTimeFactory,
) -> None:
    flur = ar.async_get(hass).async_create("Flur")
    eins = melder(hass, "eins", flur.id)
    melder(hass, "zwei", flur.id)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": f"{DOMAIN}/kandidaten/get"})
    msg = await client.receive_json()
    assert msg["success"], msg
    k = msg["result"]
    assert {m["entity_id"] for m in k["melder"]} >= {eins.entity_id}
    [vorschlag] = [v for v in k["vorschlaege"] if v["bereich_id"] == flur.id]
    assert len(vorschlag["melder"]) == 2
    assert [f["name"] for f in k["fp400"]] == ["Testsensor"]
    assert k["fp400"][0]["benutzt"] is True

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/create",
            "name": "Flur",
            "art": "melder",
            "bereich_id": flur.id,
            "melder": vorschlag["melder"],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    assert msg["result"]["raum"]["melder"] == vorschlag["melder"]
    await hass.async_block_till_done()

    state_id = er.async_get(hass).async_get_entity_id(
        "binary_sensor", DOMAIN, f"{loaded.entry_id}_flur_anwesenheit_belegt"
    )
    assert state_id is not None
    assert hass.states.get(state_id).state == "off"
    # Keine Personen-Zählung bei Meldern.
    assert (
        er.async_get(hass).async_get_entity_id(
            "sensor", DOMAIN, f"{loaded.entry_id}_flur_figuren"
        )
        is None
    )

    hass.states.async_set(eins.entity_id, "on", {"device_class": "motion"})
    await hass.async_block_till_done()
    assert hass.states.get(state_id).state == "on"

    # Melder aus: Figur wird gehalten, dann frei (kein plötzliches Verschwinden).
    hass.states.async_set(eins.entity_id, "off", {"device_class": "motion"})
    await hass.async_block_till_done()
    assert hass.states.get(state_id).state == "on"
    freezer.tick(timedelta(seconds=30))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(state_id).state == "off"

    # Melder nicht erreichbar: nichts ändert sich, Sensor gilt als getrennt.
    hass.states.async_set(eins.entity_id, "on", {"device_class": "motion"})
    await hass.async_block_till_done()
    for m in ("eins", "zwei"):
        hass.states.async_set(f"binary_sensor.melder_{m}", "unavailable")
    await hass.async_block_till_done()
    freezer.tick(timedelta(hours=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get(state_id).state == "on"

    # Bereits benutzte Melder sind markiert, der Vorschlag ist weg.
    await client.send_json_auto_id({"type": f"{DOMAIN}/kandidaten/get"})
    msg = await client.receive_json()
    assert not [v for v in msg["result"]["vorschlaege"] if v["bereich_id"] == flur.id]
    assert {m["benutzt_von"] for m in msg["result"]["melder"]} == {"flur"}


async def test_melder_ueberlebt_umbenennen(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    eins = melder(hass, "eins")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/create",
            "name": "Bad",
            "art": "melder",
            "melder": [eins.entity_id],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    # Gespeichert wird die feste Kennung, nicht der Name der Entität.
    assert msg["result"]["raum"]["melder"] == [eins.id]
    await hass.async_block_till_done()
    er.async_get(hass).async_update_entity(
        eins.entity_id, new_entity_id="binary_sensor.bad_bewegung"
    )
    hass.states.async_set("binary_sensor.bad_bewegung", "on")
    await hass.config_entries.async_reload(loaded.entry_id)
    await hass.async_block_till_done()
    controller = loaded.runtime_data.controllers["bad"]
    assert controller.melder_entities() == ["binary_sensor.bad_bewegung"]
    assert controller.room.states["anwesenheit"].occupied


async def test_raum_anlegen_radar_und_loeschen(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    device_id = loaded.runtime_data.store.model.raeume[0].sensor.device_id
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/create",
            "name": "Schlafzimmer",
            "art": "radar",
            "device_id": device_id,
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    raum = msg["result"]["raum"]
    assert raum["id"] == "schlafzimmer_2"
    assert raum["sensor"]["mqtt_topic"] == "zigbee2mqtt/Testsensor"
    await hass.async_block_till_done()

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/delete", "raum_id": "schlafzimmer_2"}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    assert [r.id for r in loaded.runtime_data.store.model.raeume] == ["schlafzimmer"]
    devices = dr.async_entries_for_config_entry(dr.async_get(hass), loaded.entry_id)
    assert len(devices) == 2  # Hauptgerät und das eine Schlafzimmer

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/create", "name": "X", "art": "melder", "melder": []}
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "invalid"


async def test_nur_admins(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_read_only_access_token,
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    for message in (
        {"type": f"{DOMAIN}/kandidaten/get"},
        {"type": f"{DOMAIN}/room/create", "name": "X", "art": "melder"},
        {"type": f"{DOMAIN}/room/delete", "raum_id": "schlafzimmer"},
    ):
        await client.send_json_auto_id(message)
        msg = await client.receive_json()
        assert msg["error"]["code"] == "unauthorized"


async def test_tuer_in_der_wand_fuehrt_zu(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    eins = melder(hass, "eins")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/create",
            "name": "Flur",
            "art": "melder",
            "melder": [eins.entity_id],
        }
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": "flur",
            "zonen": [],
            "umriss": [[0, 0], [200, 0], [200, 300], [0, 300]],
            "oeffnungen": [{"kante": 0, "von": 20, "bis": 110, "art": "tuer"}],
            "melder_nachlauf_s": 30,
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/haus/save",
            "raeume": [],
            "tueren": [{"raum_id": "flur", "oeffnung": 0, "fuehrt_zu": "schlafzimmer"}],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = loaded.runtime_data.store.model.raum("flur")
    assert raum.oeffnungen[0].fuehrt_zu == "schlafzimmer"
    assert raum.melder_nachlauf_s == 30
