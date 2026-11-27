"""Tests für die Raumlogik mit erfundenen, gezielten Abläufen."""

from __future__ import annotations

import dataclasses

import pytest

from custom_components.raumzonen.core.geometry import Polygon, rotated_rect
from custom_components.raumzonen.core.room import (
    ART_AUSGANG,
    ART_HUNDEPLATZ,
    ART_STOERQUELLE,
    TAG_HUND,
    Room,
    Zone,
    ZoneEvent,
    ZoneRule,
)
from custom_components.raumzonen.core.tracks import Target

# Raum: Bett links (schräg), Tür rechts unten, Hundeplatz oben rechts.
BED = rotated_rect(-150, 200, 200, 160, -30)
DOOR = Polygon(((0, 0), (90, 0), (90, 60), (0, 60)))
DOG = Polygon(((60, 250), (160, 250), (160, 330), (60, 330)))
BED_RULE = ZoneRule(
    belegt_nach_s=3,
    frei_nach_s=2,
    rand_cm=25,
    schlaefer_halten=True,
    max_personen=1,
)


def room(**rule: object) -> Room:
    bed_rule = dataclasses.replace(BED_RULE, **rule)
    return Room(
        [
            Zone("bett", "Bett", BED, rule=bed_rule),
            Zone("tuer", "Tür", DOOR, art=ART_AUSGANG, rule=ZoneRule(0, 2)),
            Zone("hund", "Hundeplatz", DOG, art=ART_HUNDEPLATZ),
        ]
    )


def run(r: Room, frames: list[tuple[float, list[Target] | None]]) -> list[ZoneEvent]:
    """Rahmen abspielen, Zeitregeln dazwischen genau auslösen."""
    events: list[ZoneEvent] = []
    for t, targets in frames:
        events += r.advance(t)
        events += r.update(t, targets)
    return events


def lie_down(r: Room, t0: float = 0) -> float:
    """Jemand legt sich hin und liegt eine Weile still."""
    run(r, [(t0 + i * 0.3, [Target(0, -150, 200 + i)]) for i in range(20)])
    assert r.states["bett"].occupied
    return t0 + 6


def walk_out(t0: float, tid: int = 0) -> list[tuple[float, list[Target]]]:
    """Weg vom Bett zur Tür, ein Rahmen alle 0,3 s."""
    path = [
        (-130, 170),
        (-100, 140),
        (-70, 110),
        (-40, 80),
        (0, 50),
        (40, 30),
        (60, 20),
    ]
    return [(t0 + i * 0.3, [Target(tid, x, y)]) for i, (x, y) in enumerate(path)]


def free_time(events: list[ZoneEvent], zone: str = "bett") -> float | None:
    return next((e.t for e in events if e.zone_id == zone and not e.occupied), None)


def test_becomes_occupied_after_delay() -> None:
    r = room()
    ev = run(r, [(0, [Target(0, -150, 200)]), (2.9, [Target(0, -150, 201)])])
    assert not ev
    ev = r.tick(3.0)
    assert [(e.zone_id, e.occupied) for e in ev] == [("bett", True)]


def test_getting_up_within_five_seconds() -> None:
    """Aufstehen und zur Tür: frei nach höchstens 5 s (Ziel des Besitzers)."""
    r = room()
    t = lie_down(r)
    left_bed = t + 0.3  # zweiter Punkt des Weges ist außerhalb des Betts
    ev = run(r, walk_out(t))
    assert (free := free_time(ev)) is not None
    assert free - left_bed <= 5.0


def test_getting_up_into_room_frees_bed() -> None:
    """Aufstehen ohne Tür (zum Schrank): bewegte Rahmen draußen reichen."""
    r = room()
    t = lie_down(r)
    path = [(-40, 220), (-10, 230), (20, 240), (50, 250), (60, 250)]
    ev = run(r, [(t + i * 0.3, [Target(0, x, y)]) for i, (x, y) in enumerate(path)])
    for i in range(10):
        ev += run(r, [(t + 2 + i, [Target(0, 60, 250)])])
    assert free_time(ev) is not None


def test_single_jump_keeps_bed() -> None:
    """Der Schläfer springt um 50 cm hinaus und liegt dann still: bleibt belegt."""
    r = room()
    t = lie_down(r)
    # Einzelner Ausreißer weit über den Rand, danach Schweigen (wie in Ruhe).
    ev = run(r, [(t, [Target(0, -20, 260)])])
    ev += r.tick(t + 600)
    ev += run(r, [(t + 600, [Target(0, -20, 260)]), (t + 610, [Target(0, -140, 205)])])
    assert free_time(ev) is None


def test_sensor_loses_sleeper_keeps_bed() -> None:
    """Das Ziel verschwindet aus der Liste: die Figur wird gehalten."""
    r = room()
    t = lie_down(r)
    ev = run(r, [(t + i, []) for i in range(1, 400, 10)])
    ev += r.tick(t + 3600)
    assert free_time(ev) is None
    assert r.states["bett"].count == 1


def test_new_id_at_bed_edge_takes_over_sleeper() -> None:
    """Nach dem Verlust taucht die Person mit neuer ID am Bettrand auf und geht."""
    r = room()
    t = lie_down(r)
    run(r, [(t + 1, [])])
    ev = run(r, walk_out(t + 100, tid=7))
    assert free_time(ev) is not None
    assert len(r.tracker.tracks) <= 1


def test_echo_left_in_bed_is_dropped() -> None:
    """Der Sensor lässt beim Aufstehen einen starren Punkt im Bett zurück."""
    r = room()
    t = lie_down(r)
    frames = [
        (ft, [Target(5, -160, 190), *targets]) for ft, targets in walk_out(t + 5, tid=0)
    ]
    ev = run(r, [(t + 0.5, [Target(0, -150, 219), Target(5, -160, 190)]), *frames])
    assert free_time(ev) is not None
    # Der starre Punkt kommt im nächsten Rahmen wieder, zählt aber nicht mehr.
    ev = run(r, [(t + 9 + i, [Target(5, -160, 190)]) for i in range(6)])
    assert not r.states["bett"].occupied


def test_two_people_keep_bed_when_one_leaves() -> None:
    """Ohne „höchstens 1 Person“ bleibt die zweite Person im Bett gezählt."""
    r = room(max_personen=0)
    t = lie_down(r)
    run(r, [(t + 0.5, [Target(0, -150, 219), Target(5, -200, 230)])])
    run(
        r,
        [(t + 0.5 + i, [Target(0, -150, 219), Target(5, -200, 230)]) for i in range(5)],
    )
    frames = [(ft, [Target(5, -200, 230), *tg]) for ft, tg in walk_out(t + 8, tid=0)]
    ev = run(r, frames)
    assert free_time(ev) is None
    assert r.states["bett"].count == 1


def test_hysteresis_band() -> None:
    """Am Rand zittern macht eine normale Zone nicht frei."""
    zone = Polygon(((0, 0), (100, 0), (100, 100), (0, 100)))
    r = Room(
        [
            Zone(
                "z",
                "Z",
                zone,
                rule=ZoneRule(belegt_nach_s=0, frei_nach_s=1, rand_cm=20),
            )
        ]
    )
    frames = [(i * 0.5, [Target(0, 95 + (i % 2) * 20, 50)]) for i in range(20)]
    ev = run(r, frames)
    assert [e.occupied for e in ev] == [True]
    ev = run(r, [(11 + i * 0.5, [Target(0, 140, 50)]) for i in range(5)])
    assert [e.occupied for e in ev] == [False]


def test_dog_hint_and_ignore() -> None:
    """Lange ruhig auf dem Hundeplatz → vermutlich Hund; zählt dann nicht im Bett."""
    r = room(hund_ignorieren=True)
    run(r, [(i, [Target(3, 100, 300)]) for i in range(0, 70, 5)])
    track = next(iter(r.tracker.tracks.values()))
    assert TAG_HUND in track.tags
    # Der Hund springt ins Bett.
    path = [(50, 280), (0, 260), (-60, 240), (-120, 220), (-140, 210)]
    run(r, [(70 + i * 0.3, [Target(3, x, y)]) for i, (x, y) in enumerate(path)])
    run(r, [(75 + i, [Target(3, -140, 210)]) for i in range(5)])
    assert not r.states["bett"].occupied


def test_pet_type_from_sensor() -> None:
    r = room(hund_ignorieren=True)
    run(r, [(i, [Target(3, -150, 200, False, "pet")]) for i in range(6)])
    assert not r.states["bett"].occupied


def test_interference_zone_ignored() -> None:
    zone = Polygon(((0, 0), (100, 0), (100, 100), (0, 100)))
    curtain = Polygon(((60, 0), (100, 0), (100, 100), (60, 100)))
    r = Room(
        [
            Zone("z", "Z", zone, rule=ZoneRule(belegt_nach_s=0)),
            Zone("v", "Vorhang", curtain, art=ART_STOERQUELLE),
        ]
    )
    run(r, [(i, [Target(0, 80, 50)]) for i in range(5)])
    assert not r.states["z"].occupied
    assert r.states["v"].occupied


def test_unavailable_keeps_state() -> None:
    r = room()
    t = lie_down(r)
    ev = run(r, [(t + 1, None)])
    ev += r.tick(t + 3600)
    assert not r.available
    assert r.states["bett"].occupied
    assert free_time(ev) is None


def test_duplicate_zone_ids_rejected() -> None:
    import pytest

    with pytest.raises(ValueError):
        Room([Zone("a", "A", DOOR), Zone("a", "B", DOOR)])
    with pytest.raises(ValueError):
        Room([Zone("a", "A", DOOR, art="falsch")])


def test_restore_sleeper_placeholder() -> None:
    """Nach Neustart: Platzhalter hält das Bett, bis echte Rahmen kommen."""
    r = room()
    r.restore("bett", 0)
    assert r.states["bett"].occupied
    assert r.figure_count == 0  # Platzhalter zählt nicht als Figur
    ev = r.advance(5000)
    assert free_time(ev) is None
    # Erster echter Rahmen: niemand im Bett → frei nach „frei nach“.
    ev = run(r, [(5000, [])])
    ev += r.advance(5003)
    assert free_time(ev) == pytest.approx(5002)


def test_restore_then_sleeper_seen() -> None:
    r = room()
    r.restore("bett", 0)
    ev = run(r, [(100, [Target(4, -150, 205)])])
    ev += r.advance(200)
    assert free_time(ev) is None
    assert r.states["bett"].count == 1


def test_person_bleibt_person_wenn_sensor_art_wechselt() -> None:
    """Liegender bewegt sich, der Sensor meldet ihn plötzlich als Vorhang.

    Nachgestellt (erfundene Werte) nach einer Nacht, in der das Bett dadurch
    frei wurde, obwohl niemand aufgestanden war.
    """
    r = room()
    frames = [
        (i * 0.3, [Target(1, -150, 200 + i % 3, False, "person")]) for i in range(100)
    ]
    run(r, frames)
    assert r.states["bett"].occupied
    t0 = 30.0
    run(
        r,
        [
            (t0 + i * 0.3, [Target(1, -150 + (i % 5) * 6, 195, True, "curtain")])
            for i in range(40)
        ],
    )
    assert r.states["bett"].occupied
    assert r.figure_count == 1
    (track,) = r.tracker.tracks.values()
    assert "stoerung" not in track.tags


def test_kurze_person_dann_vorhang_ist_stoerung() -> None:
    """Ein Vorhang, der anfangs kurz als Person gemeldet wird, bleibt Störung."""
    r = room()
    run(r, [(i * 0.3, [Target(1, 300, 300, True, "person")]) for i in range(5)])
    run(r, [(2 + i * 0.3, [Target(1, 300, 300, True, "curtain")]) for i in range(10)])
    assert r.figure_count == 0


def _liegt_mit_hund(r: Room) -> float:
    """Jemand liegt still im Bett, der Hund liegt vor dem Bett (erfunden)."""
    frames = [
        (i * 0.3, [Target(0, -150, 200 + i % 2), Target(1, 40, 150, False, "pet")])
        for i in range(70)
    ]
    run(r, frames)
    assert r.states["bett"].occupied
    return 21.0


def test_tausch_mit_hund_haelt_das_bett() -> None:
    """Der Sensor hängt das Ziel des Schläfers an den Hund: Bett bleibt belegt."""
    r = room()
    t = _liegt_mit_hund(r)
    # Ziel 0 springt zum Hund, Ziel 1 (Hund) ist im selben Rahmen weg.
    events = run(r, [(t + i * 0.3, [Target(0, 30, 140)]) for i in range(30)])
    assert r.states["bett"].occupied
    assert r.states["bett"].count == 1
    # Nach 9 s findet der Sensor den Schläfer mit neuer ID wieder.
    events += run(
        r,
        [
            (t + 9 + i * 0.3, [Target(0, 30, 140), Target(2, -148, 205)])
            for i in range(10)
        ],
    )
    assert r.states["bett"].occupied
    assert free_time(events) is None


def test_aufstehen_mit_hund_daneben_bleibt_schnell() -> None:
    """Steht der Schläfer auf und der Hund bleibt sichtbar: kein Tausch."""
    r = room()
    t = _liegt_mit_hund(r)
    path = walk_out(t)
    frames = [(ts, [*tg, Target(1, 40, 150, False, "pet")]) for ts, tg in path]
    events = run(r, frames)
    events += r.advance(t + 10)
    left = free_time(events)
    assert left is not None
    assert left - t <= 5.0


def test_tausch_dann_zur_tuer_gibt_das_bett_frei() -> None:
    """Nach einem Tausch geht das Ziel zur Tür: es war doch der Schläfer."""
    r = room()
    t = _liegt_mit_hund(r)
    events = run(r, [(t, [Target(0, 30, 140)])])
    assert r.states["bett"].occupied
    events += run(
        r,
        [(t + 0.3 + i * 0.3, [Target(0, 30 + i * 5, 140 - i * 30)]) for i in range(5)],
    )
    events += r.advance(t + 6)
    left = free_time(events)
    assert left is not None
    assert left - t <= 5.0


def test_tausch_ohne_wiederfinden_gibt_spaeter_frei() -> None:
    """Findet der Sensor niemanden mehr im Bett, wird es nach einer Minute frei."""
    r = room()
    t = _liegt_mit_hund(r)
    run(r, [(t + i * 0.3, [Target(0, 30, 140)]) for i in range(5)])
    assert r.states["bett"].occupied
    events = r.advance(t + 30)
    assert r.states["bett"].occupied
    events += r.advance(t + 70)
    assert not r.states["bett"].occupied
    assert free_time(events) is not None
