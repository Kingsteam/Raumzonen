"""Vertrag ``raumzonen/1``: Python-Schnittstelle und WebSocket (nur simuliert)."""

from __future__ import annotations

from datetime import timedelta
import json
from pathlib import Path
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.raumzonen.api import (
    API_KEY,
    RaumzonenApi,
    async_get_api,
    get_api,
)
from custom_components.raumzonen.const import DOMAIN, NAME, STORAGE_KEY

from .helpers import SimFp400
from .test_init import stored
from .test_model import example_model

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])

BEISPIELE = Path(__file__).parent.parent / "docs" / "homebrain" / "beispiele"


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


def api(hass: HomeAssistant) -> RaumzonenApi:
    found = hass.data[API_KEY]
    assert found is async_get_api(hass)
    assert found is get_api(hass)
    assert found.schema == "raumzonen/1"
    return found


def zone(snapshot: dict[str, Any], zone_id: str) -> dict[str, Any]:
    return next(z for z in snapshot["raeume"][0]["zonen"] if z["zone_id"] == zone_id)


async def test_aufbau(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    raeume = api(hass).raeume()
    assert [r["raum_id"] for r in raeume] == ["schlafzimmer"]
    raum = raeume[0]
    # Tür ohne Ziel eingetragen: „weiß nicht“, nicht „außen“.
    assert raum["raender"] == [
        {
            "rand_id": "tuer",
            "name": "Tür",
            "form": raum["zonen"][1]["form"],
            "fuehrt_zu": None,
        }
    ]
    assert [s["stelle_id"] for s in raum["stellen"]] == ["hund"]
    assert raum["sensor"]["reichweite_cm"] == 600
    assert raum["haus"] is None  # noch nicht im Hausplan: weiß nicht


async def test_ohne_raumzonen(hass: HomeAssistant) -> None:
    assert get_api(hass) is None


async def test_momentaufnahme_im_bett(hass: HomeAssistant, sim: SimFp400) -> None:
    await sim.lie_in_bed()
    snap = api(hass).momentaufnahme()
    assert snap["schema"] == "raumzonen/1"
    raum = snap["raeume"][0]
    assert raum["daten_ok"] is True
    assert raum["sensor"]["erreichbar"] is True
    assert raum["sensor"]["unvollstaendig"] is None  # ohne target_count unbekannt
    bett = zone(snap, "bett")
    assert bett["belegt"] is True
    assert bett["zustand"] == "belegt"
    assert bett["mensch"] == 1
    assert bett["sicherheit"] is None  # kommt in Phase 4b
    [spur] = raum["spuren"]
    assert spur["spur_id"].startswith("schlafzimmer-")
    assert spur["in_zonen"] == ["bett"]
    assert spur["herkunft"] == "unbekannt"
    assert spur["bewegt"] is False
    assert spur["still_s"] is not None
    assert spur["neu_seit_laden"] is False  # schon im ersten Rahmen da
    await sim.frame((0, -150, 200), (1, 50, 100))
    neu = api(hass).momentaufnahme()["raeume"][0]["spuren"]
    assert [s["neu_seit_laden"] for s in neu] == [False, True]


async def test_ausfall_ist_unklar_und_haelt(hass: HomeAssistant, sim: SimFp400) -> None:
    """Bei Ausfall: Zustand „unklar“, aber die Figur bleibt (Regel 4)."""
    await sim.lie_in_bed()
    await sim.offline()
    await sim.wait(60)
    snap = api(hass).momentaufnahme()
    raum = snap["raeume"][0]
    assert raum["daten_ok"] is False
    bett = zone(snap, "bett")
    assert bett["zustand"] == "unklar"
    assert bett["belegt"] is True
    assert len(raum["spuren"]) == 1


async def test_abgeschnitten_ist_nicht_frisch(
    hass: HomeAssistant, sim: SimFp400
) -> None:
    await sim.frame((0, -150, 200), (1, 50, 100), gemeldet=3)
    sensor = api(hass).momentaufnahme()["raeume"][0]["sensor"]
    assert sensor["unvollstaendig"] is True
    assert sensor["daten_frisch"] is False
    await sim.frame((0, -150, 200), (1, 50, 100), gemeldet=2)
    sensor = api(hass).momentaufnahme()["raeume"][0]["sensor"]
    assert sensor["daten_frisch"] is True


async def test_abo(hass: HomeAssistant, sim: SimFp400) -> None:
    meldungen: list[dict[str, Any]] = []
    abmelden = api(hass).abonnieren(meldungen.append, {"zone", "spur"})
    await sim.lie_in_bed()
    zonen = [m for m in meldungen if m["art"] == "zone"]
    assert zonen[-1]["daten"]["zone_id"] == "bett"
    assert zonen[-1]["daten"]["belegt"] is True
    # Nur bei Änderung, nicht je Rahmen.
    assert len([m for m in zonen if m["daten"]["zone_id"] == "bett"]) <= 3
    spuren = [m for m in meldungen if m["art"] == "spur"]
    # 12 Rahmen in 3,6 s: höchstens zweimal je Sekunde; in Ruhe nichts.
    assert 1 <= len(spuren) <= 8
    assert all(m["schema"] == "raumzonen/1" for m in meldungen)
    # Fortlaufend je Abo: Lücken zeigen verpasste Meldungen.
    assert [m["seq"] for m in meldungen] == list(range(1, len(meldungen) + 1))
    abmelden()
    meldungen.clear()
    await sim.walk_to_door()
    assert meldungen == []


async def test_abo_fehlerhafter_abnehmer(hass: HomeAssistant, sim: SimFp400) -> None:
    def kaputt(_m: dict[str, Any]) -> None:
        raise RuntimeError("Abnehmer kaputt")

    api(hass).abonnieren(kaputt, {"zone", "spur"})
    await sim.lie_in_bed()
    assert zone(api(hass).momentaufnahme(), "bett")["belegt"] is True


async def test_abo_ueberlebt_neuladen(
    hass: HomeAssistant, entry: MockConfigEntry, sim: SimFp400
) -> None:
    meldungen: list[dict[str, Any]] = []
    api(hass).abonnieren(meldungen.append, {"geladen", "zone"})
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert [m["art"] for m in meldungen] == ["geladen"]
    assert meldungen[0]["daten"][0]["raum_id"] == "schlafzimmer"
    await sim.lie_in_bed()
    assert any(m["art"] == "zone" for m in meldungen)


async def test_unbekannte_art(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    with pytest.raises(ValueError, match="Unbekannte"):
        api(hass).abonnieren(lambda _m: None, {"licht"})


async def test_websocket_v1(
    hass: HomeAssistant, sim: SimFp400, hass_ws_client, hass_read_only_access_token
) -> None:
    """Auch für Nicht-Admins: Momentaufnahme als Ergebnis, dann Meldungen."""
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json_auto_id({"type": f"{DOMAIN}/v1/schema"})
    msg = await client.receive_json()
    assert msg["result"]["schema"] == "raumzonen/1"
    assert msg["result"]["geladen"] is True
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/v1/subscribe", "arten": ["zone"], "raum_id": "schlafzimmer"}
    )
    msg = await client.receive_json()
    assert msg["success"]
    sub_id = msg["id"]
    assert zone(msg["result"], "bett")["belegt"] is False
    await sim.lie_in_bed()
    await client.send_json_auto_id({"type": "ping"})
    events = []
    while (msg := await client.receive_json())["type"] != "pong":
        assert msg["id"] == sub_id
        events.append(msg["event"])
    assert events
    assert events[-1]["daten"]["zone_id"] == "bett"
    assert events[-1]["daten"]["belegt"] is True


@pytest.mark.parametrize(
    "model",
    [
        {
            **example_model(),
            "raeume": [{**example_model()["raeume"][0], "aufnahme": True}],
        }
    ],
)
async def test_aufnahme_abrufen(
    hass: HomeAssistant, sim: SimFp400, hass_ws_client
) -> None:
    await sim.lie_in_bed()
    now = dt_util.utcnow()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {
            "type": f"{DOMAIN}/aufnahme/get",
            "raum_id": "schlafzimmer",
            "von": (now.replace(microsecond=0) - timedelta(hours=1)).isoformat(),
            "bis": (now + timedelta(minutes=1)).isoformat(),
        }
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    zeilen = msg["result"]["zeilen"]
    assert zeilen[0]["format"] == "fp400-trace/2"
    rahmen = [z for z in zeilen if z.get("ziele")]
    assert len(rahmen) == 12
    assert rahmen[0]["spuren"][0][0].startswith("schlafzimmer-")


def _keys(beispiel: Any, echt: Any, pfad: str) -> None:
    """Jedes Feld im Beispiel gibt es auch in echt (mit gleichem Typ)."""
    if isinstance(beispiel, dict):
        assert isinstance(echt, dict), pfad
        for key, value in beispiel.items():
            assert key in echt, f"{pfad}.{key} fehlt"
            _keys(value, echt[key], f"{pfad}.{key}")
    elif isinstance(beispiel, list) and beispiel and echt:
        _keys(beispiel[0], echt[0], f"{pfad}[0]")


async def test_beispiele_passen(hass: HomeAssistant, sim: SimFp400) -> None:
    """Die Beispiele im Vertrag entsprechen dem, was Raumzonen liefert."""
    await sim.lie_in_bed()
    meldungen: list[dict[str, Any]] = []
    api(hass).abonnieren(meldungen.append, {"zone", "spur"})
    await sim.walk_to_door()
    spur = next(m for m in reversed(meldungen) if m["art"] == "spur")
    await sim.wait(10)
    echt = {
        "raeume.json": api(hass).raeume(),
        "momentaufnahme.json": api(hass).momentaufnahme(),
        "meldung-zone.json": next(m for m in meldungen if m["art"] == "zone"),
        "meldung-spur.json": spur,
    }
    for name, wert in echt.items():
        beispiel = json.loads((BEISPIELE / name).read_text(encoding="utf-8"))
        _keys(beispiel, wert, name)
        _keys(wert, beispiel, name)
