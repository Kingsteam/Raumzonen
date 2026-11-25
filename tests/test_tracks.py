"""Tests für die Spurbildung: Figuren verschwinden nicht plötzlich."""

from __future__ import annotations

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
    assert (track.x, track.y) == (20, 0)
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
