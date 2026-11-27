"""Figuren markieren (ich, Hund) und Aufräumen."""

from __future__ import annotations

import pytest

from custom_components.raumzonen.core.room import (
    MARK_HUND,
    MARK_ICH,
    TAG_HUND,
)
from custom_components.raumzonen.core.tracks import Target

from .test_room import lie_down, room, run


def _ids(r) -> list[int]:
    return sorted(r.tracker.tracks)


def test_ich_gibt_es_nur_einmal() -> None:
    r = room()
    run(r, [(0, [Target(0, 300, 300), Target(1, 400, 100)])])
    a, b = _ids(r)
    r.markieren(a, MARK_ICH, 0.1)
    r.markieren(b, MARK_ICH, 0.2)
    assert r.tracker.tracks[a].markierung is None
    assert r.tracker.tracks[b].markierung == MARK_ICH


def test_markierter_hund_zaehlt_nicht() -> None:
    r = room()
    lie_down(r)
    (tid,) = _ids(r)
    assert r.figure_count == 1
    r.markieren(tid, MARK_HUND, 6.1)
    assert TAG_HUND in r.tracker.tracks[tid].tags
    assert r.figure_count == 0
    assert r.states["bett"].count == 0
    # Die Markierung bleibt, auch wenn sich der Hund bewegt.
    run(r, [(6.5 + i * 0.3, [Target(0, -150 + 5 * i, 200)]) for i in range(10)])
    assert TAG_HUND in r.tracker.tracks[tid].tags
    # Das Bett wird frei, weil nur der Hund drin liegt.
    run(r, [(12 + i * 0.3, [Target(0, -100, 200)]) for i in range(20)])
    assert not r.states["bett"].occupied


def test_markierung_wieder_weg() -> None:
    r = room()
    run(r, [(0, [Target(0, 300, 300)])])
    (tid,) = _ids(r)
    r.markieren(tid, MARK_HUND, 0.1)
    r.markieren(tid, None, 0.2)
    assert r.tracker.tracks[tid].markierung is None
    assert r.figure_count == 1


def test_unbekannte_markierung() -> None:
    r = room()
    run(r, [(0, [Target(0, 300, 300)])])
    with pytest.raises(ValueError):
        r.markieren(_ids(r)[0], "katze", 0.1)
    with pytest.raises(KeyError):
        r.markieren(99, MARK_ICH, 0.1)


def test_aufraeumen_behaelt_nur_gewuenschte() -> None:
    r = room()
    run(r, [(0, [Target(0, 300, 300), Target(1, 400, 100), Target(2, 200, 50)])])
    keep = _ids(r)[0]
    r.aufraeumen([keep], 0.1)
    assert _ids(r) == [keep]
    # Meldet der Sensor die entfernten Ziele weiter an derselben Stelle,
    # kommen sie nicht zurück.
    run(r, [(0.4, [Target(0, 300, 300), Target(1, 400, 100), Target(2, 200, 50)])])
    assert _ids(r) == [keep]
    # Bewegt sich ein entferntes Ziel, ist es wieder eine echte Figur.
    run(r, [(0.7, [Target(0, 300, 300), Target(1, 250, 160)])])
    assert len(r.tracker.tracks) == 2


def test_aufraeumen_entfernt_gehaltene_geister() -> None:
    r = room()
    lie_down(r)
    # Sensor meldet nichts mehr: die Figur im Bett wird gehalten (Regel 4).
    run(r, [(7, [])])
    assert len(r.tracker.tracks) == 1
    r.aufraeumen([], 7.1)
    assert r.tracker.tracks == {}
    assert r.figure_count == 0
    # Das Bett wird danach regulär frei (Wartezeit der Regel).
    events = r.advance(20)
    assert not r.states["bett"].occupied
    assert any(e.zone_id == "bett" and not e.occupied for e in events)
