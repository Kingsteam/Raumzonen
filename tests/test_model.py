"""Tests für Modell, Prüfung und Speichern."""

from __future__ import annotations

import copy
from typing import Any

from homeassistant.core import HomeAssistant
import pytest

from custom_components.raumzonen.const import STORAGE_KEY
from custom_components.raumzonen.model import build_room
from custom_components.raumzonen.serialize import model_from_dict, model_to_dict
from custom_components.raumzonen.store import RaumzonenStore


def example_model() -> dict[str, Any]:
    """Ein Raum mit schrägem Bett, Tür und Hundeplatz (erfundene Werte)."""
    return {
        "raeume": [
            {
                "id": "schlafzimmer",
                "name": "Schlafzimmer",
                "sensor": {
                    "art": "fp400_z2m",
                    "device_id": "geraet1",
                    "quelle": "mqtt",
                    "mqtt_topic": "zigbee2mqtt/Testsensor",
                },
                "zonen": [
                    {
                        "id": "bett",
                        "name": "Bett",
                        "form": {
                            "art": "rechteck",
                            "mitte": [-150, 200],
                            "breite": 200,
                            "tiefe": 160,
                            "winkel": -30,
                        },
                        "regel": {
                            "belegt_nach_s": 3,
                            "frei_nach_s": 2,
                            "rand_cm": 25,
                            "schlaefer_halten": True,
                            "max_personen": 1,
                        },
                    },
                    {
                        "id": "tuer",
                        "name": "Tür",
                        "art": "ausgang",
                        "form": {
                            "art": "vieleck",
                            "punkte": [[0, 0], [90, 0], [90, 60], [0, 60]],
                        },
                    },
                    {
                        "id": "hund",
                        "name": "Hundeplatz",
                        "art": "hundeplatz",
                        "form": {
                            "art": "zellen",
                            "groesse": 25,
                            "zellen": [[3, 10], [4, 10], [3, 11]],
                        },
                    },
                ],
            }
        ]
    }


def test_roundtrip_fills_defaults() -> None:
    model = model_from_dict(example_model())
    data = model_to_dict(model)
    assert data["raeume"][0]["zonen"][1]["regel"]["frei_nach_s"] == 5.0
    assert model_to_dict(model_from_dict(data)) == data
    room = build_room(model.raeume[0])
    assert room.zones["bett"].rule.schlaefer_halten


def test_oeffnungen_und_durchgang() -> None:
    data = example_model()
    raum = data["raeume"][0]
    raum["umriss"] = [[-300, -20], [300, -20], [300, 400], [-300, 400]]
    raum["oeffnungen"] = [
        {"kante": 0, "von": 100, "bis": 190, "art": "tuer"},
        {"kante": 2, "von": 0, "bis": 600, "art": "offen"},
    ]
    raum["zonen"][0]["art"] = "durchgang"
    model = model_from_dict(data)
    again = model_to_dict(model)
    assert again["raeume"][0]["oeffnungen"][1]["art"] == "offen"
    # ältere Speicherstände: Scharnier am Anfang, geht nach innen auf
    assert again["raeume"][0]["oeffnungen"][0]["anschlag"] == "anfang"
    assert again["raeume"][0]["oeffnungen"][0]["aufgehen"] == "innen"
    assert model_to_dict(model_from_dict(again)) == again
    for bad, message in (
        ({"kante": 4, "von": 0, "bis": 10}, "unbekannter Wand"),
        ({"kante": 0, "von": 50, "bis": 700}, "nicht auf der Wand"),
        ({"kante": 0, "von": 90, "bis": 80}, "nicht auf der Wand"),
        ({"kante": 0, "von": 0, "bis": 10, "art": "fenster"}, "unbekannte Öffnung"),
        ({"kante": 0, "von": 0, "bis": 10, "anschlag": "oben"}, "Türanschlag"),
        ({"kante": 0, "von": 0, "bis": 10, "aufgehen": "hoch"}, "Türanschlag"),
    ):
        raum["oeffnungen"] = [bad]
        with pytest.raises(ValueError, match=message):
            model_from_dict(data)
    raum["umriss"] = []
    raum["oeffnungen"] = [{"kante": 0, "von": 0, "bis": 10}]
    with pytest.raises(ValueError, match="brauchen Wände"):
        model_from_dict(data)


def test_neue_felder() -> None:
    """Tür nach außen, Stelle, Lage im Haus, Aufnahme: speichern und lesen."""
    data = example_model()
    raum = data["raeume"][0]
    raum["zonen"][1]["fuehrt_zu"] = "aussen"
    raum["zonen"].append(
        {
            "id": "sessel",
            "name": "Sessel",
            "art": "stelle",
            "form": {"art": "vieleck", "punkte": [[100, 100], [150, 100], [150, 150]]},
        }
    )
    raum.update(bereich_id="bereich1", haus_x=300, haus_y=-50, haus_winkel=90)
    raum.update(aufnahme=False, aufnahme_tage=7)
    model = model_from_dict(data)
    again = model_to_dict(model)
    assert model_to_dict(model_from_dict(again)) == again
    r = model.raeume[0]
    assert r.zonen[1].fuehrt_zu == "aussen"
    assert r.zonen[3].art == "stelle"
    assert (r.haus_x, r.haus_y, r.haus_winkel) == (300, -50, 90)
    assert r.aufnahme is False
    assert r.aufnahme_tage == 7
    # Ohne die neuen Felder: Standardwerte (ältere Speicherstände). Die
    # Aufnahme ist an (je Raum abschaltbar, siehe docs/KONZEPT.md).
    old = model_from_dict(example_model()).raeume[0]
    assert old.aufnahme is True
    assert old.aufnahme_tage == 30
    assert old.zonen[1].fuehrt_zu == ""


@pytest.mark.parametrize(
    ("change", "message"),
    [
        (lambda d: d["raeume"].append(copy.deepcopy(d["raeume"][0])), "doppelt"),
        (lambda d: d["raeume"][0].update(id="mit leerzeichen"), "ungültige ID"),
        (
            lambda d: d["raeume"][0]["sensor"].update(art="anderer"),
            "unbekannter Sensor",
        ),
        (lambda d: d["raeume"][0]["zonen"][0].update(art="falsch"), "unbekannte Art"),
        (
            lambda d: d["raeume"][0]["zonen"][0]["regel"].update(belegt_nach_s=10_000),
            "belegt_nach_s",
        ),
        (lambda d: d["raeume"][0]["zonen"][0]["regel"].update(rand_cm=-1), "rand_cm"),
        (
            lambda d: d["raeume"][0]["zonen"][1]["form"].update(
                punkte=[[0, 0], [1, 1]]
            ),
            "Form ungültig",
        ),
        (
            lambda d: d["raeume"][0]["zonen"][1]["form"].update(
                punkte=[[0, 0], [9000, 0], [0, 10]]
            ),
            "außerhalb",
        ),
        (
            lambda d: d["raeume"][0]["zonen"][2]["form"].update(groesse=1),
            "Zellgröße",
        ),
        (lambda d: d["raeume"][0]["zonen"][0].update(name=" "), "Name fehlt"),
        (
            lambda d: d["raeume"][0]["sensor"].update(mqtt_topic="zigbee2mqtt/#"),
            "MQTT-Thema",
        ),
        (lambda d: d["raeume"][0]["sensor"].update(quelle="funk"), "Quelle"),
        (
            lambda d: d["raeume"][0]["sensor"].update(quelle="entitaet", device_id=""),
            "Gerät fehlt",
        ),
        (
            lambda d: d["raeume"][0]["zonen"][0].update(fuehrt_zu="aussen"),
            "nur bei Türen",
        ),
        (
            lambda d: d["raeume"][0]["zonen"][1].update(fuehrt_zu="dachboden"),
            "unbekannter Raum",
        ),
        (
            lambda d: d["raeume"][0]["zonen"][1].update(fuehrt_zu="schlafzimmer"),
            "unbekannter Raum",
        ),
        (lambda d: d["raeume"][0].update(aufnahme_tage=0), "aufnahme_tage"),
        (lambda d: d["raeume"][0].update(haus_winkel=400), "haus_winkel"),
    ],
)
def test_validate_rejects(change, message: str) -> None:
    data = example_model()
    change(data)
    with pytest.raises(ValueError, match=message):
        model_from_dict(data)


async def test_store_saves_and_loads(
    hass: HomeAssistant, hass_storage: dict[str, Any]
) -> None:
    store = RaumzonenStore(hass)
    await store.async_load()
    assert store.model.raeume == []
    store.model = model_from_dict(example_model())
    await store.async_save()
    assert hass_storage[STORAGE_KEY]["data"]["raeume"][0]["id"] == "schlafzimmer"
    again = RaumzonenStore(hass)
    await again.async_load()
    assert again.model == store.model
