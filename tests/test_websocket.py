"""Tests für die WebSocket-Befehle des Panels (simulierter Sensor)."""

from __future__ import annotations

from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
)

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


async def test_kommen_und_gehen(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    freezer: FrozenDateTimeFactory,
) -> None:
    """Figur taucht in der Tür auf: Ereignis „betreten“, Entität und Live-Daten."""
    events = async_capture_events(hass, f"{DOMAIN}_tuer")
    sim = SimFp400(hass, freezer)
    await sim.frame((0, 40, 30))
    await hass.async_block_till_done()
    assert [e.data["richtung"] for e in events] == ["betreten"]
    assert events[0].data["tuer"] == "Tür"
    state = hass.states.get("event.schlafzimmer_kommen_und_gehen")
    assert state is not None
    assert state.attributes["event_type"] == "betreten"
    assert state.attributes["tuer"] == "Tür"
    live = loaded.runtime_data.controllers["schlafzimmer"].live()
    assert live["kommen_gehen"][0]["richtung"] == "betreten"
    assert hass.states.get("event.raumzonen_raumwechsel") is not None


async def test_datenstrom(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client: Any
) -> None:
    """Ohne Zone beim Treiber warnt das Panel.

    Der Knopf trägt nur in einen leeren Platz ein, „Zurück“ leert nur die
    eigene Zone.
    """
    from homeassistant.core import ServiceCall

    geschrieben: list[dict[str, Any]] = []

    async def set_value(call: ServiceCall) -> None:
        geschrieben.append(dict(call.data))
        hass.states.async_set(call.data["entity_id"], call.data["value"])

    hass.services.async_register("text", "set_value", set_value)
    client = await hass_ws_client(hass)

    async def stand() -> dict[str, Any]:
        await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
        return (await client.receive_json())["result"]["datenstrom"]["schlafzimmer"]

    # Zone 1 ist eine fremde Zone (Bett): der Strom läuft, keine Warnung.
    assert await stand() == {"fehlt": False, "eigene": False}

    # Unklarer Zustand zählt nicht als leer.
    hass.states.async_set("text.testsensor_software_zone_1_config", "unknown")
    assert (await stand())["fehlt"] is False

    hass.states.async_set("text.testsensor_software_zone_1_config", "clear")
    assert await stand() == {"fehlt": True, "eigene": False}

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/datenstrom/set", "raum_id": "schlafzimmer", "an": True}
    )
    msg = await client.receive_json()
    assert msg["result"] == {"fehlt": False, "eigene": True}
    assert geschrieben[-1]["entity_id"] == "text.testsensor_software_zone_1_config"
    assert '"name":"Raumzonen Datenstrom"' in geschrieben[-1]["value"]
    assert await stand() == {"fehlt": False, "eigene": True}

    # Zweimal an schreibt nichts neu.
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/datenstrom/set", "raum_id": "schlafzimmer", "an": True}
    )
    await client.receive_json()
    assert len(geschrieben) == 1

    # Eine fremde Zone in Platz 2 bleibt beim Zurücknehmen unberührt.
    hass.states.async_set(
        "text.testsensor_software_zone_2_config",
        '{"name":"Fremd","x_min":0,"x_max":10,"y_min":0,"y_max":10}',
    )
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/datenstrom/set", "raum_id": "schlafzimmer", "an": False}
    )
    msg = await client.receive_json()
    assert msg["result"] == {"fehlt": False, "eigene": False}
    assert geschrieben[-1] == {
        "entity_id": "text.testsensor_software_zone_1_config",
        "value": "clear",
    }
    assert hass.states.get("text.testsensor_software_zone_2_config").state.startswith(
        '{"name":"Fremd"'
    )


async def test_datenstrom_kein_platz_und_nur_admin(
    hass: HomeAssistant,
    loaded: MockConfigEntry,
    hass_ws_client: Any,
    hass_read_only_access_token: str,
) -> None:
    """Belegte Plätze werden nie überschrieben; ändern dürfen nur Admins."""
    hass.states.async_set(
        "text.testsensor_software_zone_2_config",
        '{"name":"Fremd","x_min":0,"x_max":10,"y_min":0,"y_max":10}',
    )
    client = await hass_ws_client(hass)
    # Zone 1 (Bett) ist fremd und Platz 2 auch: „an“ ist schon nicht nötig,
    # aber ohne eigene Zone wird ein Platz gesucht und keiner gefunden.
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/datenstrom/set", "raum_id": "schlafzimmer", "an": True}
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "kein_platz"

    leser = await hass_ws_client(hass, hass_read_only_access_token)
    await leser.send_json_auto_id(
        {"type": f"{DOMAIN}/datenstrom/set", "raum_id": "schlafzimmer", "an": True}
    )
    msg = await leser.receive_json()
    assert msg["error"]["code"] == "unauthorized"


async def test_room_save_veralteter_stand(
    hass: HomeAssistant, loaded: MockConfigEntry, hass_ws_client: Any
) -> None:
    """Ein Panel mit altem Stand überschreibt nicht still (z. B. die Lage).

    Gerät A (Handy) misst ein und speichert; Gerät B hat den Raum vorher
    geladen und speichert danach mit seinem alten Stand: abgelehnt.
    """
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    raum = (await client.receive_json())["result"]["raeume"][0]
    alt = raum["stand"]
    assert len(alt) == 16

    zonen = raum["zonen"]
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": raum["id"],
            "stand": alt,
            "zonen": zonen,
            "sensor": {"x": 42, "y": 17, "winkel": 33},
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    neu = msg["result"]["raum"]["stand"]
    assert neu != alt
    await hass.async_block_till_done()

    # Nach dem Neuladen liefert rooms/get denselben neuen Stand.
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    geladen = (await client.receive_json())["result"]["raeume"][0]
    assert geladen["stand"] == neu
    assert geladen["sensor"]["x"] == 42

    # Gerät B mit altem Stand: abgelehnt, die Lage bleibt.
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/room/save",
            "raum_id": raum["id"],
            "stand": alt,
            "zonen": zonen,
            "sensor": {"x": 0, "y": 0, "winkel": 0},
        }
    )
    msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "veraltet"
    await client.send_json_auto_id({"type": f"{DOMAIN}/rooms/get"})
    assert (await client.receive_json())["result"]["raeume"][0]["sensor"]["x"] == 42

    # Ohne Stand (ältere Abnehmer) wird wie bisher gespeichert.
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/room/save", "raum_id": raum["id"], "zonen": zonen}
    )
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
