"""Türen: Namen, feste Kennungen und Verbindung mit der Tür im Nachbarraum."""

from __future__ import annotations

from custom_components.raumzonen.const import QUELLE_ENTITAET, RAUM_MELDER
from custom_components.raumzonen.model import (
    OeffnungConfig,
    RaumConfig,
    RaumzonenModel,
    SensorConfig,
    tueren_abgleichen,
)
from custom_components.raumzonen.serialize import (
    model_from_dict,
    model_to_dict,
    oeffnungen_from_list,
)

WAND = [[0.0, 0.0], [400.0, 0.0], [400.0, 300.0], [0.0, 300.0]]


def raum(raum_id: str, *tueren: str) -> RaumConfig:
    return RaumConfig(
        id=raum_id,
        name=raum_id.title(),
        art=RAUM_MELDER,
        melder=[f"melder_{raum_id}"],
        sensor=SensorConfig(quelle=QUELLE_ENTITAET),
        umriss=[list(p) for p in WAND],
        oeffnungen=[
            OeffnungConfig(kante=0, von=50 + 100 * i, bis=130 + 100 * i, id=t)
            for i, t in enumerate(tueren)
        ],
    )


def test_kennungen_werden_vergeben() -> None:
    daten = [
        {"kante": 0, "von": 0, "bis": 80},
        {"kante": 0, "von": 100, "bis": 180, "id": "o1"},
        {"kante": 0, "von": 200, "bis": 280, "id": "o1"},
    ]
    ids = [o.id for o in oeffnungen_from_list(daten)]
    assert ids[1] == "o1"
    assert len(set(ids)) == 3


def test_verbinden_beidseitig_und_loesen() -> None:
    a, b, c = raum("flur", "t1"), raum("kueche", "t1"), raum("bad", "t1")
    model = RaumzonenModel(raeume=[a, b, c])
    a.oeffnungen[0].gegenstueck = "kueche/#t1"
    tueren_abgleichen(model, {"flur"})
    model.validate()
    assert b.oeffnungen[0].gegenstueck == "flur/#t1"
    assert (a.oeffnungen[0].fuehrt_zu, b.oeffnungen[0].fuehrt_zu) == (
        "kueche",
        "flur",
    )
    # Umhängen auf das Bad: die Küche zeigt nicht mehr auf den Flur.
    a.oeffnungen[0].gegenstueck = "bad/#t1"
    tueren_abgleichen(model, {"flur"})
    assert c.oeffnungen[0].gegenstueck == "flur/#t1"
    assert b.oeffnungen[0].gegenstueck == ""
    # Gespeichert und wieder geladen bleibt alles gleich.
    again = model_from_dict(model_to_dict(model))
    assert again.raum("flur").oeffnungen[0].gegenstueck == "bad/#t1"
    # Raum löschen: die Verbindung verschwindet.
    model.remove("bad")
    assert a.oeffnungen[0].gegenstueck == ""


def test_verbindung_ins_leere_wird_geloest() -> None:
    a = raum("flur", "t1")
    a.oeffnungen[0].gegenstueck = "gibtsnicht/#t9"
    model = RaumzonenModel(raeume=[a, raum("kueche", "t1")])
    tueren_abgleichen(model, {"flur"})
    assert a.oeffnungen[0].gegenstueck == ""


def test_wege_zwei_radar_raeume() -> None:
    from custom_components.raumzonen.core.wege import TuerKnoten, Wege

    w = Wege()
    w.setze(
        {
            "a/t": TuerKnoten("a/t", "a", "b", frozenset({"b/t"})),
            "b/t": TuerKnoten("b/t", "b", "a", frozenset({"a/t"})),
        },
        set(),
    )
    assert w.tuer_belegt("a/t", 100.0) is None
    weg = w.tuer_belegt("b/t", 103.0)
    assert weg is not None
    assert (weg.von, weg.nach, weg.genau) == ("a", "b", True)
    # Dieselben Meldungen zählen nicht noch einmal.
    assert w.tuer_belegt("a/t", 104.0) is None
    # Zu spät: kein Weg.
    assert w.tuer_belegt("b/t", 200.0) is None


def test_wege_mit_melder_raum() -> None:
    from custom_components.raumzonen.core.wege import TuerKnoten, Wege

    w = Wege()
    w.setze({"a/t": TuerKnoten("a/t", "a", "m")}, {"m"})
    w.tuer_belegt("a/t", 10.0)
    weg = w.raum_belegt("m", 14.0)
    assert weg is not None
    assert (weg.von, weg.nach, weg.genau) == ("a", "m", False)
    # Umgekehrt: erst der Melder-Raum, dann die Tür im Radar-Raum.
    w.raum_belegt("m", 50.0)
    weg = w.tuer_belegt("a/t", 52.0)
    assert weg is not None
    assert (weg.von, weg.nach) == ("m", "a")
    assert len(w.liste) == 2


def test_wege_knoten_aus_tueren() -> None:
    from custom_components.raumzonen.model import ZoneConfig, wege_knoten

    a, b = raum("flur", "t1"), raum("kueche", "t1")
    for r in (a, b):
        r.art = "radar"
        r.melder = []
        r.sensor = SensorConfig(device_id="x")
        # Tür-Zone vor der Öffnung (Wand unten, 50 bis 130 cm).
        r.zonen.append(
            ZoneConfig(
                id="tuer",
                name="Tür",
                art="ausgang",
                form={
                    "art": "rechteck",
                    "mitte": [90, 30],
                    "breite": 80,
                    "tiefe": 60,
                    "winkel": 0,
                },
            )
        )
    a.oeffnungen[0].gegenstueck = "kueche/#t1"
    model = RaumzonenModel(raeume=[a, b, raum("bad", "t1")])
    tueren_abgleichen(model, {"flur"})
    knoten, melder = wege_knoten(model)
    assert knoten["flur/tuer"].partner == frozenset({"kueche/tuer"})
    assert knoten["kueche/tuer"].ziel == "flur"
    assert melder == {"bad"}
