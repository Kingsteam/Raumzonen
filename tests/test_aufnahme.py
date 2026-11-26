"""Eigene Aufnahme je Raum (``fp400-trace/2``), nur mit simulierten Daten."""

from __future__ import annotations

from datetime import timedelta
import gzip
import json
from pathlib import Path
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY

from .helpers import SimFp400
from .test_init import stored
from .test_model import example_model

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


@pytest.fixture
def model() -> dict[str, Any]:
    return example_model()


@pytest.fixture
async def entry(
    hass: HomeAssistant,
    hass_storage: dict[str, Any],
    mqtt: Any,
    model: dict[str, Any],
    freezer: FrozenDateTimeFactory,
) -> MockConfigEntry:
    # Die Testuhr läuft schon beim Laden, sonst passen Zeitgeber nicht zu ihr.
    hass_storage[STORAGE_KEY] = stored(model)
    entry = MockConfigEntry(domain=DOMAIN, title=NAME)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
def sim(
    hass: HomeAssistant, entry: MockConfigEntry, freezer: FrozenDateTimeFactory
) -> SimFp400:
    return SimFp400(hass, freezer)


async def flush(hass: HomeAssistant) -> None:
    """Puffer jetzt schreiben (statt auf den 10-s-Zeitgeber zu warten).

    Im Test vergleicht Home Assistant Zeitgeber mit der echten Uhr der
    Schleife; wann genau der 10-s-Zeitgeber feuert, schwankt darum um die
    echte Ladezeit. Inhalte prüfen wir deshalb nach einem ausdrücklichen
    Schreiben, den Zeitgeber selbst mit Spielraum.
    """
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        for controller in entry.runtime_data.controllers.values():
            if controller.aufnahme is not None:
                await controller.aufnahme.async_flush()
    await hass.async_block_till_done()


def lines(folder: Path) -> list[dict[str, Any]]:
    out = []
    for path in sorted(folder.glob("*.jsonl.gz")):
        with gzip.open(path, "rt", encoding="utf-8") as f:
            out += [json.loads(t) for t in f if t.strip()]
    return out


async def test_schreibt_von_selbst(
    hass: HomeAssistant, sim: SimFp400, aufnahme_ordner: Path
) -> None:
    folder = aufnahme_ordner / "schlafzimmer"
    await sim.frame((0, -150, 200))
    assert lines(folder) == []  # noch im Puffer
    await sim.wait(30)  # Zeitgeber alle 10 s, mit Spielraum
    assert len(lines(folder)) == 2


async def test_inhalt(
    hass: HomeAssistant, sim: SimFp400, aufnahme_ordner: Path
) -> None:
    folder = aufnahme_ordner / "schlafzimmer"
    await sim.frame((0, -150, 200), (1, 50, 100), gemeldet=3)
    await flush(hass)
    [kopf, rahmen] = lines(folder)
    assert kopf == {
        "format": "fp400-trace/2",
        "raum_id": "schlafzimmer",
        "sensor": {"x": 0.0, "y": 0.0, "winkel": 0.0},
    }
    # Rohziele unverändert (Sensorkoordinaten), vor jeder Filterung.
    assert rahmen["ziele"] == [
        {"id": 0, "x": -150, "y": 200, "moving": False, "type": "person"},
        {"id": 1, "x": 50, "y": 100, "moving": False, "type": "person"},
    ]
    assert rahmen["gemeldet"] == 3
    assert [s[0] for s in rahmen["spuren"]] == ["schlafzimmer-1", "schlafzimmer-2"]


async def test_ausfall_wird_aufgezeichnet(
    hass: HomeAssistant, sim: SimFp400, aufnahme_ordner: Path
) -> None:
    await sim.lie_in_bed()
    await sim.offline()
    await flush(hass)
    letzte = lines(aufnahme_ordner / "schlafzimmer")[-1]
    assert letzte["ziele"] is None  # Sensor nicht verfügbar
    assert len(letzte["spuren"]) == 1  # die Figur bleibt


async def test_entladen_schreibt_rest(
    hass: HomeAssistant, entry: MockConfigEntry, sim: SimFp400, aufnahme_ordner: Path
) -> None:
    await sim.lie_in_bed()
    assert await hass.config_entries.async_unload(entry.entry_id)
    rahmen = [z for z in lines(aufnahme_ordner / "schlafzimmer") if "zeit" in z]
    assert len(rahmen) == 12


@pytest.mark.parametrize(
    "model",
    [{"raeume": [{**example_model()["raeume"][0], "aufnahme": False}]}],
)
async def test_abschaltbar(
    hass: HomeAssistant, entry: MockConfigEntry, sim: SimFp400, aufnahme_ordner: Path
) -> None:
    await sim.lie_in_bed()
    await sim.wait(30)
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert not aufnahme_ordner.exists()


async def test_alte_tage_werden_geloescht(
    hass: HomeAssistant, sim: SimFp400, aufnahme_ordner: Path
) -> None:
    folder = aufnahme_ordner / "schlafzimmer"
    folder.mkdir(parents=True)
    heute = dt_util.now().date()
    alt = folder / f"{(heute - timedelta(days=31)).isoformat()}.jsonl.gz"
    jung = folder / f"{(heute - timedelta(days=29)).isoformat()}.jsonl.gz"
    fremd = folder / "notiz.txt"
    for path in (alt, jung, fremd):
        path.write_bytes(b"")
    await sim.frame((0, -150, 200))
    await flush(hass)  # das erste Schreiben des Tages räumt auf
    assert not alt.exists()
    assert jung.exists()
    assert fremd.exists()


async def test_abruf_hoechstens_24_h(
    hass: HomeAssistant, sim: SimFp400, hass_ws_client
) -> None:
    await sim.frame((0, -150, 200))
    client = await hass_ws_client(hass)
    now = dt_util.utcnow()
    for von, bis in ((now - timedelta(hours=25), now), (now, now)):
        await client.send_json_auto_id(
            {
                "type": f"{DOMAIN}/aufnahme/get",
                "raum_id": "schlafzimmer",
                "von": von.isoformat(),
                "bis": bis.isoformat(),
            }
        )
        msg = await client.receive_json()
        assert not msg["success"]
        assert msg["error"]["code"] == "invalid"
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/aufnahme/get",
            "raum_id": "schlafzimmer",
            "von": "gestern",
            "bis": now.isoformat(),
        }
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "invalid"


async def test_auswertung(hass: HomeAssistant, sim: SimFp400, hass_ws_client) -> None:
    """Wer war wann wo: aus der Aufnahme, auch ohne Rahmen in der Ruhe."""
    for _ in range(5):
        await sim.frame((0, -150, 200))
        await sim.wait(1)
    await sim.wait(120)  # Sensor schweigt, die Figur liegt ruhig
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/auswertung/get", "raum_id": "schlafzimmer", "stunden": 1}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    result = msg["result"]
    assert result["stunden"] == 1
    assert result["zelle_cm"] == 5
    [figur] = result["figuren"]
    assert figur["sekunden"] >= 120
    assert figur["zellen"]
    assert {z["zone_id"] for z in result["zonen"]} == {
        z["id"] for z in example_model()["raeume"][0]["zonen"]
    }


async def test_auswertung_ohne_aufnahme(
    hass: HomeAssistant, hass_ws_client, model: dict[str, Any], sim: SimFp400
) -> None:
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        for controller in entry.runtime_data.controllers.values():
            controller.aufnahme = None
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/auswertung/get", "raum_id": "schlafzimmer", "stunden": 3}
    )
    msg = await client.receive_json()
    assert msg["error"]["code"] == "off"
