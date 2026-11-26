"""Räume nur mit Bewegungsmeldern; Räume im Panel anlegen und löschen."""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    floor_registry as fr,
)
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.raumzonen.const import (
    DOMAIN,
    NAME,
    QUELLE_ENTITAET,
    RAUM_MELDER,
    STORAGE_KEY,
)
from custom_components.raumzonen.model import (
    OeffnungConfig,
    RaumConfig,
    RaumzonenModel,
    SensorConfig,
)
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
    with pytest.raises(ValueError, match="Melder wählen"):
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
    assert vorschlag["art"] == "melder"
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
        {"type": f"{DOMAIN}/plan/delete", "plan_id": "x"},
        {
            "type": f"{DOMAIN}/plan/import",
            "raeume": [
                {
                    "raum_id": "schlafzimmer",
                    "umriss": [[0, 0], [1, 0], [1, 1]],
                    "haus": {"x": 0, "y": 0, "winkel": 0},
                }
            ],
        },
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


async def test_grundriss_uebernehmen(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    eins = melder(hass, "eins")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/create",
            "name": "Kueche",
            "art": "melder",
            "melder": [eins.entity_id],
        }
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/plan/import",
            "raeume": [
                {
                    "raum_id": "kueche",
                    "umriss": [[0, 0], [400, 0], [400, 300], [0, 300]],
                    "oeffnungen": [
                        {
                            "kante": 1,
                            "von": 50,
                            "bis": 140,
                            "art": "tuer",
                            "fuehrt_zu": "schlafzimmer",
                        }
                    ],
                    "haus": {"x": 1200, "y": -300, "winkel": 0},
                }
            ],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = loaded.runtime_data.store.model.raum("kueche")
    assert raum.umriss[2] == [400, 300]
    assert raum.oeffnungen[0].fuehrt_zu == "schlafzimmer"
    assert (raum.haus_x, raum.haus_y, raum.haus_gesetzt) == (1200, -300, True)
    # Tür außerhalb der Wand: nichts wird gespeichert.
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/plan/import",
            "raeume": [
                {
                    "raum_id": "kueche",
                    "umriss": [[0, 0], [100, 0], [100, 100]],
                    "oeffnungen": [{"kante": 0, "von": 50, "bis": 400, "art": "tuer"}],
                    "haus": {"x": 0, "y": 0, "winkel": 0},
                }
            ],
        }
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "invalid"
    assert loaded.runtime_data.store.model.raum("kueche").umriss[2] == [400, 300]


PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="


async def test_grundriss_als_hintergrund(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    plan = {
        "name": "Erdgeschoss",
        "mime": "image/png",
        "bild": PNG,
        "cm_pro_px": 0.5,
        "breite_px": 1,
        "hoehe_px": 1,
        "x": 100,
        "y": 0,
    }
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/plan/import", "raeume": [], "plan": plan}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    [p] = (await client.receive_json())["result"]["plaene"]
    assert (p["id"], p["datei"], p["x"]) == ("erdgeschoss", "erdgeschoss.png", 100)
    datei = Path(hass.config.path(DOMAIN, "plaene", "erdgeschoss.png"))
    assert datei.exists()

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/plan/bild/get", "plan_id": "erdgeschoss"}
    )
    msg = await client.receive_json()
    assert msg["result"] == {"mime": "image/png", "bild": PNG}

    # Falsche Art oder kaputt: abgelehnt, nichts gespeichert.
    for bild, mime in ((PNG, "image/jpeg"), ("kein-bild", "image/png")):
        await client.send_json_auto_id(
            {
                "type": f"{DOMAIN}/plan/import",
                "raeume": [],
                "plan": {**plan, "bild": bild, "mime": mime},
            }
        )
        assert (await client.receive_json())["error"]["code"] == "invalid"
    await client.send_json_auto_id({"type": f"{DOMAIN}/plan/import", "raeume": []})
    assert (await client.receive_json())["error"]["code"] == "invalid"

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/plan/delete", "plan_id": "erdgeschoss"}
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    assert not datei.exists()
    assert loaded.runtime_data.store.model.plaene == []


async def test_stockwerke(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    """Räume auf Stockwerken; eine Treppe liegt auf zweien."""
    floors = fr.async_get(hass)
    eg = floors.async_create("Erdgeschoss", level=0)
    og = floors.async_create("Oben", level=1)
    treppe = ar.async_get(hass).async_create("Treppe", floor_id=og.floor_id)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    result = (await client.receive_json())["result"]
    assert [s["id"] for s in result["stockwerke_ha"]] == [eg.floor_id, og.floor_id]
    assert {"id": treppe.id, "name": "Treppe", "stockwerk": og.floor_id} in result[
        "bereiche_ha"
    ]
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/haus/save",
            "raeume": [
                {
                    "raum_id": "schlafzimmer",
                    "x": 0,
                    "y": 0,
                    "winkel": 0,
                    "stockwerke": [eg.floor_id, og.floor_id, og.floor_id],
                    "bereich_id": treppe.id,
                }
            ],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = loaded.runtime_data.store.model.raum("schlafzimmer")
    assert raum.stockwerke == [eg.floor_id, og.floor_id]
    assert raum.bereich_id == treppe.id
    assert api_raeume(hass)[0]["stockwerke"] == [eg.floor_id, og.floor_id]
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/haus/save",
            "raeume": [
                {
                    "raum_id": "schlafzimmer",
                    "x": 0,
                    "y": 0,
                    "winkel": 0,
                    "stockwerke": ["nicht gültig!"],
                }
            ],
        }
    )
    assert (await client.receive_json())["error"]["code"] == "invalid"


def api_raeume(hass: HomeAssistant) -> list:
    from custom_components.raumzonen.api import get_api

    return get_api(hass).raeume()


async def test_zonen_je_melder(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    freezer: FrozenDateTimeFactory,
) -> None:
    """Ein Melder meldet eine Zone (z. B. Zone eines FP2), der andere den Raum."""
    raum_m = melder(hass, "raum")
    sofa_m = melder(hass, "sofa")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/create",
            "name": "Wohnen",
            "art": "melder",
            "melder": [raum_m.entity_id, sofa_m.entity_id],
        }
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": "wohnen",
            "umriss": [[0, 0], [500, 0], [500, 400], [0, 400]],
            "zonen": [
                {
                    "name": "Sofa",
                    "art": "normal",
                    "form": {
                        "art": "vieleck",
                        "punkte": [[300, 250], [480, 250], [480, 380], [300, 380]],
                    },
                    "melder": [sofa_m.entity_id],
                }
            ],
            "melder_lagen": {
                sofa_m.entity_id: {
                    "x": 250,
                    "y": 0,
                    "winkel": 0,
                    "reichweite_cm": 500,
                    "oeffnung_grad": 100,
                }
            },
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = loaded.runtime_data.store.model.raum("wohnen")
    assert raum.zonen[0].melder == [sofa_m.id]
    assert list(raum.melder_lagen) == [sofa_m.id]
    reg = er.async_get(hass)
    sofa = reg.async_get_entity_id(
        "binary_sensor", DOMAIN, f"{loaded.entry_id}_wohnen_sofa_belegt"
    )
    ganz = reg.async_get_entity_id(
        "binary_sensor", DOMAIN, f"{loaded.entry_id}_wohnen_anwesenheit_belegt"
    )
    hass.states.async_set(raum_m.entity_id, "on")
    await hass.async_block_till_done()
    assert (hass.states.get(ganz).state, hass.states.get(sofa).state) == ("on", "off")
    hass.states.async_set(sofa_m.entity_id, "on")
    await hass.async_block_till_done()
    assert hass.states.get(sofa).state == "on"
    hass.states.async_set(sofa_m.entity_id, "off")
    await hass.async_block_till_done()
    for _ in range(3):  # Haltezeit, dann Nachlauf der Zone
        freezer.tick(timedelta(seconds=15))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
    assert (hass.states.get(ganz).state, hass.states.get(sofa).state) == ("on", "off")

    # Zone ohne Melder: abgelehnt.
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": "wohnen",
            "zonen": [
                {
                    "name": "Leer",
                    "art": "normal",
                    "form": {"art": "vieleck", "punkte": [[0, 0], [50, 0], [50, 50]]},
                }
            ],
        }
    )
    assert (await client.receive_json())["error"]["code"] == "invalid"


async def test_fp400_ist_kein_melder(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    """Belegt-Anzeigen eines FP400 stehen nicht als Melder da; er wird Radar-Raum."""
    kueche = ar.async_get(hass).async_create("Kueche")
    # Zweiter FP400 (noch keinem Raum zugeordnet) mit Belegt-Anzeige.
    mqtt_entry = MockConfigEntry(domain="mqtt")
    mqtt_entry.add_to_hass(hass)
    dev = dr.async_get(hass).async_get_or_create(
        config_entry_id=mqtt_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0xzwei")},
        name="Radar Kueche",
    )
    dr.async_get(hass).async_update_device(dev.id, area_id=kueche.id)
    reg = er.async_get(hass)
    reg.async_get_or_create(
        "sensor", "mqtt", "0xzwei_targets_xy_zigbee2mqtt", device_id=dev.id
    )
    belegt = reg.async_get_or_create(
        "binary_sensor",
        "mqtt",
        "0xzwei_occupancy_1",
        device_id=dev.id,
        original_device_class="occupancy",
    )
    eins = melder(hass, "eins", kueche.id)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/kandidaten/get"})
    k = (await client.receive_json())["result"]
    ids = {m["entity_id"] for m in k["melder"]}
    assert belegt.entity_id not in ids
    assert eins.entity_id in ids
    [v] = [v for v in k["vorschlaege"] if v["bereich_id"] == kueche.id]
    assert (v["art"], v["device_id"]) == ("radar", dev.id)


async def test_grundriss_nachtraeglich_skalieren(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    plan = {
        "name": "Oben",
        "mime": "image/png",
        "bild": PNG,
        "cm_pro_px": 0.5,
        "breite_px": 1,
        "hoehe_px": 1,
    }
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/plan/import", "raeume": [], "plan": plan}
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/haus/save",
            "raeume": [],
            "plaene": [
                {"plan_id": "oben", "x": 10, "y": 20, "winkel": 95, "cm_pro_px": 0.55}
            ],
        }
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    [p] = loaded.runtime_data.store.model.plaene
    assert (p.x, p.y, p.winkel, p.cm_pro_px) == (10, 20, 95, 0.55)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/haus/save",
            "raeume": [],
            "plaene": [{"plan_id": "oben", "x": 0, "y": 0, "cm_pro_px": 0}],
        }
    )
    assert (await client.receive_json())["error"]["code"] == "invalid"
    # Stockwerk nachträglich zuordnen und wieder entfernen.
    for wert, erwartet in (("og", "og"), (None, "")):
        await client.send_json_auto_id(
            {
                "type": f"{DOMAIN}/haus/save",
                "raeume": [],
                "plaene": [{"plan_id": "oben", "x": 0, "y": 0, "stockwerk": wert}],
            }
        )
        assert (await client.receive_json())["success"]
        await hass.async_block_till_done()
        [p] = loaded.runtime_data.store.model.plaene
        assert p.stockwerk == erwartet


async def test_melder_typ_und_benutzte_radar_anzeige(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    """Typ steht dabei; eine schon benutzte Radar-Anzeige bleibt mit Namen sichtbar."""
    mqtt_entry = MockConfigEntry(domain="mqtt")
    mqtt_entry.add_to_hass(hass)
    devices = dr.async_get(hass)
    reg = er.async_get(hass)
    radar = devices.async_get_or_create(
        config_entry_id=mqtt_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0xdrei")},
        name="Radar Flur",
    )
    reg.async_get_or_create(
        "sensor", "mqtt", "0xdrei_targets_xy_zigbee2mqtt", device_id=radar.id
    )
    belegt = reg.async_get_or_create(
        "binary_sensor",
        "mqtt",
        "0xdrei_occupancy_1",
        device_id=radar.id,
        original_device_class="occupancy",
        original_name="Belegung",
    )
    mm = devices.async_get_or_create(
        config_entry_id=mqtt_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0xvier")},
        name="Belegung Bad",
        manufacturer="Hersteller",
        model="Mini human breathe sensor",
    )
    praesenz = reg.async_get_or_create(
        "binary_sensor",
        "mqtt",
        "0xvier_presence",
        device_id=mm.id,
        original_device_class="presence",
    )
    eins = melder(hass, "eins")
    model = loaded.runtime_data.store.model
    model.raeume.append(
        RaumConfig(
            id="flur",
            name="Flur",
            art=RAUM_MELDER,
            melder=[belegt.id],
            sensor=SensorConfig(quelle=QUELLE_ENTITAET),
        )
    )
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/kandidaten/get"})
    k = {m["entity_id"]: m for m in (await client.receive_json())["result"]["melder"]}
    assert k[eins.entity_id]["typ"] == "Bewegungsmelder"
    assert k[praesenz.entity_id]["typ"] == "Radar (Anwesenheit)"
    assert k[praesenz.entity_id]["modell"] == "Hersteller Mini human breathe sensor"
    alt = k[belegt.entity_id]
    assert (alt["angeboten"], alt["benutzt_von"]) == (False, "flur")
    assert alt["name"] != belegt.id


async def test_melder_raum_in_radar_raum_umwandeln(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    """Melder-Raum mit Anzeigen eines FP400 wird Radar-Raum; Wände, Türen bleiben."""
    mqtt_entry = MockConfigEntry(domain="mqtt")
    mqtt_entry.add_to_hass(hass)
    reg = er.async_get(hass)
    radar = dr.async_get(hass).async_get_or_create(
        config_entry_id=mqtt_entry.entry_id,
        identifiers={("mqtt", "zigbee2mqtt_0xfuenf")},
        name="Radar Stube",
    )
    reg.async_get_or_create(
        "sensor", "mqtt", "0xfuenf_targets_xy_zigbee2mqtt", device_id=radar.id
    )
    belegt = reg.async_get_or_create(
        "binary_sensor",
        "mqtt",
        "0xfuenf_occupancy_3_zigbee2mqtt",
        device_id=radar.id,
        original_device_class="occupancy",
        original_name="Belegung",
    )
    model = loaded.runtime_data.store.model
    model.raeume.append(
        RaumConfig(
            id="stube",
            name="Stube",
            art=RAUM_MELDER,
            melder=[belegt.id],
            sensor=SensorConfig(quelle=QUELLE_ENTITAET),
            umriss=[[0.0, 0.0], [400.0, 0.0], [400.0, 300.0], [0.0, 300.0]],
            oeffnungen=[OeffnungConfig(kante=0, von=50, bis=130, id="o1")],
        )
    )
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/kandidaten/get"})
    k = {m["entity_id"]: m for m in (await client.receive_json())["result"]["melder"]}
    assert k[belegt.entity_id]["name"].endswith("(Bereich 3 des Sensors)")
    assert k[belegt.entity_id]["device_id"] == radar.id
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/umwandeln", "raum_id": "stube", "device_id": radar.id}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = loaded.runtime_data.store.model.raum("stube")
    assert (raum.ist_melder, raum.sensor.device_id, raum.melder) == (
        False,
        radar.id,
        [],
    )
    # „Anwesenheit“ ist keine eigene Zone, sondern kommt von selbst.
    assert raum.zonen == []
    assert "anwesenheit" in loaded.runtime_data.controllers["stube"].room.zones
    assert raum.oeffnungen[0].id == "o1"
    assert (raum.sensor.x, raum.sensor.y) == (200, 150)
    # Zweimal geht nicht: der Raum hat jetzt einen Sensor.
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/umwandeln", "raum_id": "stube", "device_id": radar.id}
    )
    assert (await client.receive_json())["error"]["code"] == "invalid"


async def test_wege_ereignis_und_abfrage(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    """Ein Weg wird als Ereignis gemeldet und ist über wege/get abrufbar."""
    from pytest_homeassistant_custom_component.common import async_capture_events

    from custom_components.raumzonen.core.wege import TuerKnoten

    wege = hass.data[f"{DOMAIN}_wege"]
    ereignisse = async_capture_events(hass, f"{DOMAIN}_weg")
    knoten = {
        "a/t": TuerKnoten("a/t", "a", "b", frozenset({"b/t"}), "Tür A"),
        "b/t": TuerKnoten("b/t", "b", "a", frozenset({"a/t"}), "Tür B"),
    }
    wege.knoten.update(knoten)
    wege.tuer_belegt("a/t", 1000.0)
    wege.tuer_belegt("b/t", 1002.0)
    await hass.async_block_till_done()
    assert [(e.data["von_id"], e.data["nach_id"]) for e in ereignisse] == [("a", "b")]
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/wege/get"})
    result = (await client.receive_json())["result"]
    assert result["wege"][-1]["tuer"] == "Tür B"


def test_radar_raum_hat_anwesenheit_von_selbst() -> None:
    """Mit Wänden: „Anwesenheit“ über den ganzen Raum; eigene Zone geht vor."""
    from custom_components.raumzonen.model import ZoneConfig, build_room

    raum = RaumConfig(
        id="stube",
        name="Stube",
        sensor=SensorConfig(device_id="x"),
        umriss=[[0.0, 0.0], [400.0, 0.0], [400.0, 300.0], [0.0, 300.0]],
    )
    room = build_room(raum)
    assert list(room.zones) == ["anwesenheit"]
    assert room.zones["anwesenheit"].shape.contains(200, 150)
    # Ohne Wände: keine.
    assert list(build_room(RaumConfig(id="b", name="B")).zones) == []
    # Eigene Zone gleicher Kennung: die eigene zählt.
    raum.zonen.append(
        ZoneConfig(
            id="anwesenheit",
            name="Ganzer Raum",
            form={"art": "vieleck", "punkte": [[0, 0], [100, 0], [100, 100]]},
        )
    )
    assert build_room(raum).zones["anwesenheit"].name == "Ganzer Raum"
