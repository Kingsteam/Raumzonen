"""Tests für die Sensor-Lage und die Bewegungskarte."""

from __future__ import annotations

import pytest

from custom_components.raumzonen.core.heat import BUCKET_S, KEEP_S, HeatMap
from custom_components.raumzonen.core.pose import Pose
from custom_components.raumzonen.core.tracks import Target


def test_identity_pose_changes_nothing() -> None:
    target = Target(1, 10, 20, True, "person")
    assert Pose().target_to_room(target) is target


def test_pose_rotation_and_back() -> None:
    """Sensor an (100, 0), schaut nach links (+90°): geradeaus wird -x."""
    pose = Pose(100, 0, 90)
    x, y = pose.to_room(0, 200)
    assert (x, y) == pytest.approx((-100, 0))
    assert pose.to_sensor(x, y) == pytest.approx((0, 200))
    moved = pose.target_to_room(Target(3, 0, 200, True, "pet"))
    assert (moved.x, moved.y, moved.moving, moved.type) == pytest.approx(
        (-100, 0, True, "pet")
    )
    assert pose.points_to_room([[0, 100]]) == [[0.0, 0.0]]


def test_heat_counts_and_window() -> None:
    heat = HeatMap(cell_cm=20)
    heat.add(1000, [(5, 5), (25, 5)], 2)
    heat.add(1001, [(5, 5)], 500)  # lange Pause zählt nur bis 60 s
    cells = heat.query(1001, 15)
    assert cells[(0, 0)] == pytest.approx(62)
    assert cells[(1, 0)] == pytest.approx(2)
    # Viel später: alter Teil fällt aus dem Fenster und wird aufgeräumt.
    later = 1000 + KEEP_S + 2 * BUCKET_S
    heat.add(later, [(5, 5)], 1)
    assert heat.query(later, 24 * 60) == {(0, 0): pytest.approx(1)}
    heat.add(later, [(float("nan"), 0)], 1)
