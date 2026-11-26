"""Tests für die Spurbildung: Figuren verschwinden nicht plötzlich."""

from __future__ import annotations

import math

from custom_components.raumzonen.core.tracks import (
    ACTIVE,
    HELD,
    Target,
    Tracker,
    TrackerSettings,
)


def test_same_id_keeps_track() -> None:
    tr = Tracker()
    tr.update(0, [Target(0, 0, 0)])
    tr.update(0.3, [Target(0, 20, 0)])
    assert len(tr.tracks) == 1
    track = next(iter(tr.tracks.values()))
    # rohe Sensorposition; x/y sind geglättet (Filter gegen Zittern)
    assert (track.raw_x, track.raw_y) == (20, 0)
    assert track.moves_in_row == 1


def test_id_switch_takes_over_nearest_track() -> None:
    """Der Sensor wechselt nachts die ID; die Spur bleibt dieselbe."""
    tr = Tracker()
    tr.update(0, [Target(0, 100, 100)])
    first = next(iter(tr.tracks))
    tr.update(10, [Target(3, 130, 120)])
    assert list(tr.tracks) == [first]
    assert tr.tracks[first].sensor_id == 3


def test_far_new_target_is_new_track() -> None:
    tr = Tracker()
    tr.update(0, [Target(0, 0, 0)])
    tr.update(0.3, [Target(0, 0, 0), Target(1, 300, 0)])
    assert len(tr.tracks) == 2


def test_missing_target_is_held_then_ends() -> None:
    tr = Tracker(TrackerSettings(hold_s=10))
    tr.update(0, [Target(0, 0, 0)])
    tr.update(1, [])
    track = next(iter(tr.tracks.values()))
    assert track.state == HELD
    tr.tick(10.5)
    assert track.track_id in tr.tracks
    tr.tick(11)
    assert not tr.tracks
    assert [t.track_id for t in tr.ended] == [track.track_id]


def test_silence_changes_nothing() -> None:
    """Kein Rahmen heißt nicht „weg“: der Sensor schweigt in Ruhe minutenlang."""
    tr = Tracker(TrackerSettings(hold_s=5))
    tr.update(0, [Target(0, 0, 0)])
    tr.tick(3600)
    assert next(iter(tr.tracks.values())).state == ACTIVE


def test_unavailable_holds_everything() -> None:
    tr = Tracker(TrackerSettings(hold_s=1))
    tr.update(0, [Target(0, 0, 0)])
    tr.update(1, [])
    tr.update(1.5, None)
    tr.tick(100)
    assert not tr.available
    assert len(tr.tracks) == 1


def test_held_track_comes_back() -> None:
    tr = Tracker(TrackerSettings(hold_s=10))
    tr.update(0, [Target(0, 0, 0)])
    tid = next(iter(tr.tracks))
    tr.update(1, [])
    tr.update(5, [Target(4, 40, 30)])
    assert list(tr.tracks) == [tid]
    assert tr.tracks[tid].state == ACTIVE


def test_hold_time_from_room_logic() -> None:
    tr = Tracker(TrackerSettings(hold_s=1), hold_time=lambda t: float("inf"))
    tr.update(0, [Target(0, 0, 0)])
    tr.update(1, [])
    tr.tick(10_000)
    assert len(tr.tracks) == 1


def test_takeover_gate_for_sleepers() -> None:
    """Gehaltene Schläfer dürfen von weiter weg übernommen werden."""
    settings = TrackerSettings(gate_cm=50, takeover_cm=150)
    tr = Tracker(settings, hold_time=lambda t: 1e9, takeover_allowed=lambda t: True)
    tr.update(0, [Target(0, 0, 0)])
    tid = next(iter(tr.tracks))
    tr.update(1, [])
    tr.update(1.1, [Target(5, 120, 0)])
    assert list(tr.tracks) == [tid]


def test_smoothing_and_motion() -> None:
    tr = Tracker()
    for i, x in enumerate([0, 2, 60, 1, 3]):
        tr.update(i * 0.2, [Target(0, x, 0)])
    track = next(iter(tr.tracks.values()))
    assert track.smoothed(0.8, 1.0) == (2, 0)
    assert track.moving(0.8, tr.settings)
    assert not Tracker().settings.motion_cm > 100


# -- Filter gegen Zittern ---------------------------------------------------


def test_filter_beruhigt_ruhige_figur() -> None:
    """Liegt jemand still, springen die rohen Punkte; die Figur kaum."""
    roh = Tracker(TrackerSettings(filter_min_hz=0))
    glatt = Tracker()
    spruenge_roh, spruenge_glatt = [], []
    last = {}
    for i in range(120):
        t = i * 0.3
        target = Target(1, 100 + 25 * (-1) ** i, 200 + 15 * ((i % 3) - 1))
        for name, tr, out in (("r", roh, spruenge_roh), ("g", glatt, spruenge_glatt)):
            tr.update(t, [target])
            [track] = tr.tracks.values()
            if name in last:
                out.append(math.hypot(track.x - last[name][0], track.y - last[name][1]))
            last[name] = (track.x, track.y)
    assert max(spruenge_glatt[20:]) < max(spruenge_roh[20:]) / 2


def test_filter_folgt_beim_gehen() -> None:
    """Beim Gehen (1 m/s) hängt die Figur höchstens 40 cm hinterher."""
    tr = Tracker()
    for i in range(30):
        t = i * 0.3
        tr.update(t, [Target(1, 30.0 * i, 0.0)])
    [track] = tr.tracks.values()
    assert abs(track.raw_x - track.x) < 40
    assert track.raw_x == 30.0 * 29


def test_filter_nach_langer_stille_kein_freifahrtschein() -> None:
    """Nach Minuten ohne Rahmen springt ein einzelner Ausreißer nicht voll durch."""
    tr = Tracker()
    for i in range(20):
        tr.update(i * 0.3, [Target(1, 100.0, 200.0)])
    tr.update(300.0, [Target(1, 160.0, 200.0)])  # 60 cm Ausreißer nach 5 min
    [track] = tr.tracks.values()
    assert track.raw_x == 160.0
    assert track.x < 150.0


def test_filter_aus() -> None:
    tr = Tracker(TrackerSettings(filter_min_hz=0))
    tr.update(0.0, [Target(1, 0.0, 0.0)])
    tr.update(0.3, [Target(1, 50.0, 0.0)])
    [track] = tr.tracks.values()
    assert (track.x, track.raw_x) == (50.0, 50.0)
