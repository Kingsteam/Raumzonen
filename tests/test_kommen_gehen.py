"""Kommen und Gehen an Tür-Zonen (erfundene Abläufe)."""

from __future__ import annotations

from custom_components.raumzonen.core.room import BETRETEN, VERLASSEN
from custom_components.raumzonen.core.tracks import Target

from .test_room import room, run


def test_herein_durch_die_tuer_sofort() -> None:
    r = room()
    run(r, [(0.0, [Target(0, 40, 30)])])
    (ev,) = r.durchgaenge_holen()
    assert (ev.zone_id, ev.richtung, ev.t) == ("tuer", BETRETEN, 0.0)
    # Weiter in den Raum: kein weiteres Ereignis.
    run(r, [(0.3 + i * 0.3, [Target(0, 40 + i * 20, 30 + i * 20)]) for i in range(8)])
    assert r.durchgaenge_holen() == []


def test_neue_figur_mitten_im_raum_ist_kein_betreten() -> None:
    r = room()
    run(r, [(0.0, [Target(0, 300, 300)])])
    assert r.durchgaenge_holen() == []


def test_hinaus_durch_die_tuer() -> None:
    r = room()
    run(r, [(i * 0.3, [Target(0, 300 - i * 30, 250 - i * 25)]) for i in range(10)])
    r.durchgaenge_holen()
    run(r, [(3.0, [Target(0, 40, 30)]), (3.3, [])])
    r.advance(6)
    (ev,) = r.durchgaenge_holen()
    assert (ev.zone_id, ev.richtung) == ("tuer", VERLASSEN)
    assert ev.t < 5.0


def test_kein_verlassen_ohne_tuer() -> None:
    """Wer mitten im Raum verschwindet, wird gehalten und geht nicht hinaus."""
    r = room()
    run(r, [(i * 0.3, [Target(0, 300, 300)]) for i in range(5)])
    run(r, [(2.0, [])])
    r.advance(30)
    assert r.durchgaenge_holen() == []
