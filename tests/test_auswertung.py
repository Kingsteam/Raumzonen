"""Auswertung der Aufnahme: wer war wann wo (erfundene Daten)."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from custom_components.raumzonen.core.auswertung import (
    KURZ,
    MAX_LUECKE_S,
    Auswertung,
)
from custom_components.raumzonen.core.geometry import Polygon

T0 = datetime(2000, 1, 1, tzinfo=UTC)
BETT = Polygon([(0, 0), (200, 0), (200, 160), (0, 160)])
TUER = Polygon([(300, 0), (400, 0), (400, 60), (300, 60)])


def zeile(s: float, spuren: list, ziele: list | None = ()) -> dict:
    return {
        "zeit": (T0 + timedelta(seconds=s)).isoformat(timespec="milliseconds"),
        "ziele": None if ziele is None else list(ziele),
        "spuren": spuren,
    }


def neu(bis: float = 3600.0) -> Auswertung:
    return Auswertung(
        {"bett": BETT, "tuer": TUER}, T0.timestamp(), T0.timestamp() + bis
    )


def fig(ergebnis: dict, key: str) -> dict:
    return next(f for f in ergebnis["figuren"] if f["figur"] == key)


def zone(ergebnis: dict, zone_id: str) -> dict:
    return next(z for z in ergebnis["zonen"] if z["zone_id"] == zone_id)


def test_schlaefer_bekommt_ruhezeit() -> None:
    """Der Sensor schweigt minutenlang; wer danach noch da ist, war da."""
    a = neu()
    a.add({"format": "fp400-trace/2"})
    a.add(zeile(0, [["r-1", 100, 80, False, []]]))
    a.add(zeile(600, [["r-1", 101, 80, False, []]]))  # 10 min still
    e = a.ergebnis(T0.timestamp() + 900)
    f = fig(e, "f1")
    assert f["sekunden"] == 900
    assert zone(e, "bett")["sekunden"] == 900
    assert zone(e, "bett")["abschnitte"] == [[T0.timestamp(), T0.timestamp() + 900]]
    assert f["zonen"] == {"bett": 900}


def test_zwei_im_bett() -> None:
    """Zwei Figuren zugleich: Summe doppelt, belegt nur einmal."""
    a = neu()
    a.add(zeile(0, [["r-1", 50, 80, False, []], ["r-2", 150, 80, False, []]]))
    a.add(zeile(300, [["r-1", 50, 80, False, []], ["r-2", 150, 80, False, []]]))
    z = zone(a.ergebnis(T0.timestamp() + 600), "bett")
    assert (z["sekunden"], z["belegt_s"]) == (1200, 600)
    assert z["figuren"] == ["f1", "f2"]


def test_gehaltene_und_verschwundene_zaehlen_kurz() -> None:
    a = neu()
    a.add(zeile(0, [["r-1", 100, 80, True, []]]))  # gehalten
    a.add(zeile(600, []))
    e = a.ergebnis()
    assert fig(e, "f1")["sekunden"] == MAX_LUECKE_S


def test_neustart_gibt_neue_figur() -> None:
    """Fehlt eine Kennung und kommt wieder, ist es eine neue Figur."""
    a = neu()
    a.add(zeile(0, [["r-1", 350, 30, False, []]]))
    a.add(zeile(30, [["r-1", 350, 30, False, []]]))
    a.add(zeile(31, []))
    a.add(zeile(100, [["r-1", 100, 80, False, []]]))
    e = a.ergebnis(T0.timestamp() + 200)
    keys = {f["figur"] for f in e["figuren"]}
    assert keys == {"f1", "f2"}
    assert fig(e, "f1")["zonen"] == {"tuer": 31}
    assert fig(e, "f2")["zonen"] == {"bett": 100}
    assert zone(e, "bett")["figuren"] == ["f2"]


def test_stoerung_und_platzhalter_zaehlen_nicht() -> None:
    a = neu()
    a.add(zeile(0, [["r-1", 100, 80, False, ["stoerung"]]]))
    a.add(zeile(0.1, [["r-2", 100, 80, False, ["wiederhergestellt"]]]))
    a.add(zeile(100, []))
    assert a.ergebnis()["figuren"] == []


def test_hund_wird_erkannt() -> None:
    a = neu()
    a.add(zeile(0, [["r-1", 350, 30, False, ["hund"]]]))
    a.add(zeile(50, [["r-1", 350, 30, False, ["hund"]]]))
    e = a.ergebnis(T0.timestamp() + 50)
    assert fig(e, "f1")["hund"] is True


def test_zeitraum_wird_beschnitten() -> None:
    """Vor dem Beginn zählt nichts, nach dem Ende auch nicht."""
    a = Auswertung({"bett": BETT}, T0.timestamp() + 100, T0.timestamp() + 200)
    a.add(zeile(0, [["r-1", 100, 80, False, []]]))
    a.add(zeile(150, [["r-1", 100, 80, False, []]]))
    a.add(zeile(500, [["r-1", 100, 80, False, []]]))
    e = a.ergebnis()
    assert fig(e, "f1")["sekunden"] == 100
    assert fig(e, "f1")["erst"] == T0.timestamp() + 100


def test_ohne_sensor_nur_kurz() -> None:
    a = neu()
    a.add(zeile(0, [["r-1", 100, 80, False, []]], ziele=None))
    a.add(zeile(900, [["r-1", 100, 80, False, []]]))
    e = a.ergebnis(T0.timestamp() + 900)
    assert fig(e, "f1")["sekunden"] == MAX_LUECKE_S


def test_kurze_spuren_zusammengefasst() -> None:
    a = neu()
    a.add(zeile(0, [["r-1", 100, 80, False, []], ["r-2", 350, 30, False, []]]))
    a.add(zeile(2, [["r-1", 100, 80, False, []]]))
    a.add(zeile(100, [["r-1", 100, 80, False, []]]))
    e = a.ergebnis(T0.timestamp() + 100)
    assert [f["figur"] for f in e["figuren"]] == ["f1", KURZ]
    assert fig(e, KURZ)["sekunden"] == 2


def test_feine_zellen() -> None:
    """5-cm-Zellen: zwei Liegeplätze 10 cm auseinander bleiben getrennt."""
    a = neu()
    a.add(zeile(0, [["r-1", 50, 80, False, []]]))
    a.add(zeile(100, [["r-1", 60, 80, False, []]]))
    e = a.ergebnis(T0.timestamp() + 200)
    zellen = {(i, j): s for i, j, s in fig(e, "f1")["zellen"]}
    assert zellen == {(10, 16): 100, (12, 16): 100}
    assert e["zelle_cm"] == 5


def test_schnell_genug() -> None:
    """Ein Tag mit Rahmen alle 0,3 s (rund 290 000 Zeilen) in wenigen Sekunden."""
    import time

    a = Auswertung({"bett": BETT, "tuer": TUER}, T0.timestamp(), T0.timestamp() + 86400)
    zeilen = [
        zeile(i * 0.3, [["r-1", 100 + (i % 7), 80, False, []]]) for i in range(50_000)
    ]
    start = time.perf_counter()
    a.add_all(zeilen)
    a.ergebnis()
    # 50 000 Zeilen; ein ganzer Tag ist etwa sechsmal so viel.
    assert time.perf_counter() - start < 2.0
