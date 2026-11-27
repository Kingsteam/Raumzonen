"""Tests für die WebSocket-Befehle des Panels (simulierter Sensor)."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY
from custom_components.raumzonen.panel import PANEL_URL

from .helpers import SimFp400
from .test_entity_source import sim_device
from .test_init import stored
from .test_model import example_model

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


@pytest.fixture
async def loaded(
    hass: HomeAssistant, hass_storage: dict[str, Any], mqtt: Any
) -> MockConfigEntry:
    model = example_model()
    model["raeume"][0]["sensor"]["device_id"] = sim_device(hass)
    hass_storage[STORAGE_KEY] = stored(model)
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_panel_registered(hass: HomeAssistant, loaded: MockConfigEntry) -> None:
    panels = hass.data[frontend.DATA_PANELS]
    assert PANEL_URL in panels
    # Live-Punkte für alle (Entscheidung des Besitzers); ändern nur Admins.
    assert not panels[PANEL_URL].require_admin
    # Die Dashboard-Karte wird auf allen Seiten geladen (genau einmal).
    karten = [
        u
        for u in hass.data[frontend.DATA_EXTRA_MODULE_URL].urls
        if "raumzonen-karte.js" in u
    ]
    assert len(karten) == 1
    assert await hass.config_entries.async_unload(loaded.entry_id)
    assert PANEL_URL not in hass.data[frontend.DATA_PANELS]


async def test_rooms_get(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    msg = await client.receive_json()
    assert msg["success"]
    result = msg["result"]
    assert result["raeume"][0]["id"] == "schlafzimmer"
    assert result["raeume"][0]["sensor"]["reichweite_cm"] == 600
    assert result["vorlagen"]["bett"]["schlaefer_halten"] is True
    assert "ausgang" in result["arten"]
    assert result["darf_aendern"] is True


async def test_non_admins_read_only(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_read_only_access_token,
) -> None:
    """Nicht-Admins sehen alles, ändern nichts und holen keine Aufnahmen."""
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"]["darf_aendern"] is False
    for message in (
        {"type": f"{DOMAIN}/heat/get", "raum_id": "schlafzimmer", "minuten": 60},
        {"type": f"{DOMAIN}/v1/schema"},
        {"type": f"{DOMAIN}/v1/snapshot"},
    ):
        await client.send_json_auto_id(message)
        msg = await client.receive_json()
        assert msg["success"], message
    for message in (
        {"type": f"{DOMAIN}/room/save", "raum_id": "schlafzimmer", "zonen": []},
        {"type": f"{DOMAIN}/converter_zones/get", "raum_id": "schlafzimmer"},
        {
            "type": f"{DOMAIN}/aufnahme/get",
            "raum_id": "schlafzimmer",
            "von": "2000-01-01T00:00:00+00:00",
            "bis": "2000-01-01T01:00:00+00:00",
        },
        {"type": f"{DOMAIN}/auswertung/get", "raum_id": "schlafzimmer", "stunden": 1},
    ):
        await client.send_json_auto_id(message)
        msg = await client.receive_json()
        assert not msg["success"]
        assert msg["error"]["code"] == "unauthorized"
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/live/subscribe", "raum_id": "schlafzimmer"}
    )
    msg = await client.receive_json()
    assert msg["success"]


async def test_room_save(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_storage: dict[str, Any],
) -> None:
    client = await hass_ws_client(hass)
    zonen = [
        {
            "name": "Sofa",
            "art": "normal",
            "form": {
                "art": "vieleck",
                "punkte": [[0, 0], [100, 0], [100, 80], [0, 80]],
            },
            "regel": {"frei_nach_s": 7},
        },
        {
            "id": "tuer",
            "name": "Tür",
            "art": "ausgang",
            "form": {"art": "zellen", "groesse": 25, "zellen": [[0, 0], [1, 0]]},
            "fuehrt_zu": "aussen",
        },
    ]
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": "schlafzimmer",
            "zonen": zonen,
            "sensor": {"x": 50, "y": -10, "winkel": 15, "reichweite_cm": 500},
            "umriss": [[-300, -20], [300, -20], [300, 400], [-300, 400]],
            "aufnahme": False,
            "aufnahme_tage": 7,
            "oeffnungen": [
                {
                    "kante": 1,
                    "von": 50,
                    "bis": 140,
                    "art": "tuer",
                    "anschlag": "ende",
                    "aufgehen": "aussen",
                }
            ],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = hass_storage[STORAGE_KEY]["data"]["raeume"][0]
    assert [z["id"] for z in raum["zonen"]] == ["sofa", "tuer"]
    assert raum["zonen"][0]["regel"]["frei_nach_s"] == 7
    assert raum["zonen"][0]["regel"]["belegt_nach_s"] == 1.0  # Standard
    assert raum["sensor"]["winkel"] == 15
    assert raum["zonen"][1]["fuehrt_zu"] == "aussen"
    assert raum["zonen"][0]["fuehrt_zu"] == ""
    assert (raum["aufnahme"], raum["aufnahme_tage"]) == (False, 7)
    assert raum["oeffnungen"] == [
        {
            "kante": 1,
            "von": 50,
            "bis": 140,
            "art": "tuer",
            "anschlag": "ende",
            "aufgehen": "aussen",
            "fuehrt_zu": "",
            "id": "o1",
            "name": "",
            "gegenstueck": "",
        }
    ]
    assert raum["sensor"]["mqtt_topic"] == "zigbee2mqtt/Testsensor"  # unverändert
    # Panel bleibt beim eigenen Neuladen erhalten.
    assert PANEL_URL in hass.data[frontend.DATA_PANELS]
    entry = hass.config_entries.async_get_entry(loaded.entry_id)
    # Mit Wänden kommt „Anwesenheit“ für den ganzen Raum von selbst dazu.
    assert set(entry.runtime_data.controllers["schlafzimmer"].room.zones) == {
        "anwesenheit",
        "sofa",
        "tuer",
    }


async def test_room_save_rejects_invalid(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_storage: dict[str, Any],
) -> None:
    before = hass_storage[STORAGE_KEY]["data"]
    client = await hass_ws_client(hass)
    bad = {
        "name": "Kaputt",
        "art": "normal",
        "form": {"art": "vieleck", "punkte": [[0, 0], [1, 1]]},
    }
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/save", "raum_id": "schlafzimmer", "zonen": [bad]}
    )
    msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "invalid"
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": "schlafzimmer",
            "zonen": [],
            "sensor": {"winkel": 400},
        }
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "invalid"
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/save", "raum_id": "gibtsnicht", "zonen": []}
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "not_found"
    assert hass_storage[STORAGE_KEY]["data"] == before


async def test_live_and_heat(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    freezer: FrozenDateTimeFactory,
) -> None:
    sim = SimFp400(hass, freezer)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/live/subscribe", "raum_id": "schlafzimmer"}
    )
    sub_id = (await client.receive_json())["id"]
    first = await client.receive_json()
    assert first["id"] == sub_id
    assert first["event"]["figuren"] == []
    await sim.lie_in_bed()
    # Viele Rahmen, aber gedrosselt; der letzte Stand vor dem „pong“ zählt.
    await client.send_json_auto_id({"type": "ping"})
    last = None
    count = 0
    while (msg := await client.receive_json())["type"] != "pong":
        last = msg
        count += 1
    assert count < 12 * 2  # gedrosselt: nicht für jeden Rahmen und jede Prüfung
    assert last is not None
    live = last["event"]
    assert len(live["figuren"]) == 1
    figure = live["figuren"][0]
    assert figure["x"] == pytest.approx(-150)
    assert figure["spur"]
    assert live["zonen"]["bett"]["belegt"] is True
    assert live["ziele"][0][0] == 0

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/heat/get", "raum_id": "schlafzimmer", "minuten": 15}
    )
    msg = await client.receive_json()
    heat = msg["result"]
    assert heat["zelle_cm"] == 20
    assert sum(s for _, _, s in heat["zellen"]) > 3

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/converter_zones/get", "raum_id": "schlafzimmer"}
    )
    msg = await client.receive_json()
    assert [z["name"] for z in msg["result"]["zonen"]] == ["Bett"]


async def test_sensor_pose_moves_points_and_heat_survives_save(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    freezer: FrozenDateTimeFactory,
) -> None:
    """Sensor an (100, 0), um 90° gedreht: geradeaus 200 cm liegt bei (-100, 0)."""
    sim = SimFp400(hass, freezer)
    for _ in range(5):
        await sim.frame((0, 0, 200))
        await sim.wait(0.5)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/heat/get", "raum_id": "schlafzimmer", "minuten": 15}
    )
    before = (await client.receive_json())["result"]["zellen"]
    assert before
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": "schlafzimmer",
            "zonen": [],
            "sensor": {"x": 100, "y": 0, "winkel": 90},
        }
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/heat/get", "raum_id": "schlafzimmer", "minuten": 15}
    )
    assert (await client.receive_json())["result"]["zellen"] == before
    await sim.frame((0, 0, 200))
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/live/subscribe", "raum_id": "schlafzimmer"}
    )
    await client.receive_json()  # Ergebnis der Anmeldung
    live = (await client.receive_json())["event"]
    assert live["figuren"][0]["x"] == pytest.approx(-100, abs=0.2)
    assert live["figuren"][0]["y"] == pytest.approx(0, abs=0.2)


async def test_haus_save(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_storage: dict[str, Any],
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/haus/save",
            "raeume": [{"raum_id": "schlafzimmer", "x": 300, "y": -50, "winkel": 270}],
            "tueren": [
                {"raum_id": "schlafzimmer", "zone_id": "tuer", "fuehrt_zu": "aussen"}
            ],
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    raum = hass_storage[STORAGE_KEY]["data"]["raeume"][0]
    assert (raum["haus_x"], raum["haus_y"], raum["haus_winkel"]) == (300, -50, -90)
    assert raum["haus_gesetzt"] is True
    assert next(z for z in raum["zonen"] if z["id"] == "tuer")["fuehrt_zu"] == "aussen"
    for bad, code in (
        ({"raum_id": "keller", "x": 0, "y": 0, "winkel": 0}, "not_found"),
        ({"raum_id": "schlafzimmer", "x": 1e9, "y": 0, "winkel": 0}, "invalid"),
    ):
        await client.send_json_auto_id({"type": f"{DOMAIN}/haus/save", "raeume": [bad]})
        msg = await client.receive_json()
        assert msg["error"]["code"] == code
    for tuer, code in (
        (
            {"raum_id": "schlafzimmer", "zone_id": "fenster", "fuehrt_zu": None},
            "not_found",
        ),
        # „führt zu“ nur bei Türen; das Bett ist keine Tür
        (
            {"raum_id": "schlafzimmer", "zone_id": "bett", "fuehrt_zu": "aussen"},
            "invalid",
        ),
    ):
        await client.send_json_auto_id(
            {"type": f"{DOMAIN}/haus/save", "raeume": [], "tueren": [tuer]}
        )
        msg = await client.receive_json()
        assert msg["error"]["code"] == code


async def test_haus_save_nur_admin(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_read_only_access_token,
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json_auto_id({"type": f"{DOMAIN}/haus/save", "raeume": []})
    msg = await client.receive_json()
    assert msg["error"]["code"] == "unauthorized"


async def test_figuren_markieren_und_aufraeumen(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client,
    hass_read_only_access_token,
    freezer: FrozenDateTimeFactory,
) -> None:
    """Knöpfe „Das bin ich“, „Das ist der Hund“ und „Aufräumen“."""
    sim = SimFp400(hass, freezer)
    await sim.frame((0, 0, 200), (1, 100, 300), (2, -100, 250))
    controller = loaded.runtime_data.controllers["schlafzimmer"]
    ids = sorted(controller.room.tracker.tracks)
    assert len(ids) == 3
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/figur/markieren",
            "raum_id": "schlafzimmer",
            "figur": ids[0],
            "markierung": "ich",
        }
    )
    assert (await client.receive_json())["success"]
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/figur/markieren",
            "raum_id": "schlafzimmer",
            "figur": ids[1],
            "markierung": "hund",
        }
    )
    assert (await client.receive_json())["success"]
    live = controller.live()
    marks = {f["id"]: f["markierung"] for f in live["figuren"]}
    assert marks == {ids[0]: "ich", ids[1]: "hund", ids[2]: None}
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/figur/markieren",
            "raum_id": "schlafzimmer",
            "figur": 999,
            "markierung": "ich",
        }
    )
    assert (await client.receive_json())["error"]["code"] == "not_found"

    # Nur Admins dürfen markieren und aufräumen.
    viewer = await hass_ws_client(hass, hass_read_only_access_token)
    await viewer.send_json_auto_id(
        {"type": f"{DOMAIN}/figuren/aufraeumen", "raum_id": "schlafzimmer"}
    )
    assert (await viewer.receive_json())["error"]["code"] == "unauthorized"

    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/figuren/aufraeumen",
            "raum_id": "schlafzimmer",
            "behalten": [ids[0]],
        }
    )
    msg = await client.receive_json()
    assert msg["result"] == {"entfernt": 2}
    assert sorted(controller.room.tracker.tracks) == [ids[0]]
    # Dieselben Ziele an derselben Stelle kommen nicht zurück.
    await sim.wait(0.5)
    await sim.frame((0, 0, 200), (1, 100, 300), (2, -100, 250))
    assert sorted(controller.room.tracker.tracks) == [ids[0]]
