"""Tests für das Lesen und Abspielen von Aufnahmen."""

from __future__ import annotations

import pytest

from custom_components.raumzonen.core.geometry import Polygon
from custom_components.raumzonen.core.room import Room, Zone, ZoneRule
from custom_components.raumzonen.core.trace import parse_trace, replay


def trace_dict(frames: list) -> dict:
    return {"format": "fp400-trace/1", "name": "t", "dauer_s": 30, "rahmen": frames}


def test_parse_and_replay() -> None:
    trace = parse_trace(
        trace_dict(
            [[0, [[0, 50, 50]]], [1, [[0, 50, 50, True, "person"]]], [2, []], [3, None]]
        )
    )
    assert trace.frames[1][1][0].type == "person"
    assert trace.frames[3][1] is None
    zone = Polygon(((0, 0), (100, 0), (100, 100), (0, 100)))
    room = Room([Zone("z", "Z", zone, rule=ZoneRule(belegt_nach_s=0.5, frei_nach_s=1))])
    events = list(replay(room, trace))
    # Belegt nach 0,5 s; ab 2 s fehlt das Ziel (gehalten 10 s), ab 3 s Ausfall.
    assert [(e.t, e.occupied) for e in events] == [(0.5, True)]


def test_rejects_wrong_format_and_order() -> None:
    with pytest.raises(ValueError):
        parse_trace({"format": "anders", "rahmen": []})
    with pytest.raises(ValueError):
        parse_trace(trace_dict([[2, []], [1, []]]))
