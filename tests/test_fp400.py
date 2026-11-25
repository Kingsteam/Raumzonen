"""Tests für das Lesen der FP400-Meldungen."""

from __future__ import annotations

import pytest

from custom_components.raumzonen.core.fp400 import (
    parse_availability,
    parse_converter_zone,
    parse_payload,
    parse_targets_xy,
)
from custom_components.raumzonen.core.geometry import shape_from_dict
from custom_components.raumzonen.core.tracks import Target


def test_targets_xy() -> None:
    assert parse_targets_xy("0:-120:225;1:12:263") == [
        Target(0, -120, 225),
        Target(1, 12, 263),
    ]
    assert parse_targets_xy("none") == []
    assert parse_targets_xy("unavailable") is None
    assert parse_targets_xy(None) is None
    with pytest.raises(ValueError):
        parse_targets_xy("0:1")


def test_payload_prefers_tracking_targets() -> None:
    stamp, targets = parse_payload(
        {
            "tracking_last_update": "a",
            "tracking_targets": [
                {"id": 2, "x": 1, "y": 2, "moving": True, "type": "pet"}
            ],
            "targets_xy": "9:9:9",
        }
    )
    assert stamp == "a"
    assert targets == [Target(2, 1, 2, True, "pet")]


def test_payload_fallback_and_no_frame() -> None:
    assert parse_payload({"tracking_last_update": "b", "targets_xy": "none"}) == (
        "b",
        [],
    )
    assert parse_payload({"illuminance": 3}) is None
    assert parse_payload({"tracking_last_update": "c"}) is None
    with pytest.raises(ValueError):
        parse_payload(
            {
                "tracking_last_update": "d",
                "tracking_targets": [{"id": 1, "x": "nan", "y": 0}],
            }
        )


@pytest.mark.parametrize(
    ("payload", "expected"),
    [("online", True), ("offline", False), ('{"state":"offline"}', False), ("?", None)],
)
def test_availability(payload: str, expected: bool | None) -> None:
    assert parse_availability(payload) is expected


def test_converter_zone_rotated() -> None:
    zone = parse_converter_zone(
        '{"name":"Bett","x_min":-300,"x_max":-110,"y_min":20,"y_max":177,"rotation":-32}'
    )
    assert zone is not None
    assert zone["name"] == "Bett"
    shape = shape_from_dict(zone["form"])
    assert shape.contains(-170, 200)  # gleicher Punkt wie im Konverter: im Bett
    assert parse_converter_zone("clear") is None
    assert parse_converter_zone("unknown") is None
