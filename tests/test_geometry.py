"""Tests für Flächen: Vieleck, gedrehtes Rechteck, Zellen."""

from __future__ import annotations

import math

import pytest

from custom_components.raumzonen.core.geometry import (
    Cells,
    Polygon,
    converter_rect,
    rotated_rect,
    shape_from_dict,
)

SQUARE = Polygon(((0, 0), (100, 0), (100, 100), (0, 100)))


def test_polygon_contains_and_distance() -> None:
    assert SQUARE.contains(50, 50)
    assert SQUARE.contains(0, 50)  # Rand zählt als innen
    assert not SQUARE.contains(150, 50)
    assert SQUARE.distance(50, 50) == pytest.approx(-50)
    assert SQUARE.distance(130, 50) == pytest.approx(30)
    assert SQUARE.distance(130, 140) == pytest.approx(50)
    assert SQUARE.area == pytest.approx(10000)


def test_concave_polygon() -> None:
    """L-Form: die Ecke außen gehört nicht dazu (Bett mit Nachttisch-Ausschnitt)."""
    shape = Polygon(((0, 0), (200, 0), (200, 100), (100, 100), (100, 200), (0, 200)))
    assert shape.contains(50, 150)
    assert not shape.contains(150, 150)
    assert shape.distance(150, 150) == pytest.approx(50)


@pytest.mark.parametrize(
    "points",
    [
        ((0, 0), (1, 1)),
        ((0, 0), (1, 1), (2, 2)),
        ((0, 0), (100, 100), (100, 0), (0, 100)),  # Schleife
        ((0, 0), (math.nan, 0), (0, 1)),
    ],
)
def test_invalid_polygons(points: tuple) -> None:
    with pytest.raises(ValueError):
        Polygon(points)


def test_rotated_rect_matches_angle() -> None:
    """Ein um 90° gedrehtes, 200 breites Rechteck ist danach 200 tief."""
    shape = rotated_rect(0, 0, 200, 50, 90)
    assert shape.contains(0, 90)
    assert not shape.contains(90, 0)
    with pytest.raises(ValueError):
        rotated_rect(0, 0, 0, 10, 0)


def test_converter_rect_matches_converter() -> None:
    """Gleiche Rechnung wie ``inZone`` im Zigbee2MQTT-Konverter (Punkt drehen)."""
    zone = {"x_min": -300, "x_max": -110, "y_min": 20, "y_max": 177, "rotation": -32}
    shape = converter_rect(**zone)
    a = -zone["rotation"] * math.pi / 180
    for x in range(-320, 40, 17):
        for y in range(-60, 300, 19):
            u = x * math.cos(a) - y * math.sin(a)
            v = x * math.sin(a) + y * math.cos(a)
            expected = (
                zone["x_min"] <= u < zone["x_max"]
                and zone["y_min"] <= v < zone["y_max"]
            )
            if abs(shape.distance(x, y)) > 0.5:  # genau auf dem Rand egal
                assert shape.contains(x, y) == expected, (x, y)


def test_cells() -> None:
    cells = Cells(size=50, cells=frozenset({(0, 0), (1, 0), (1, 1)}))
    assert cells.contains(10, 10)
    assert cells.contains(60, 60)
    assert not cells.contains(10, 60)
    assert cells.distance(10, 60) == pytest.approx(10)  # links von Zelle (1,1)
    assert cells.distance(25, 25) == pytest.approx(-25)
    with pytest.raises(ValueError):
        Cells(size=0, cells=frozenset({(0, 0)}))
    with pytest.raises(ValueError):
        Cells(size=10, cells=frozenset())


def test_shape_from_dict() -> None:
    assert isinstance(
        shape_from_dict({"art": "vieleck", "punkte": [[0, 0], [10, 0], [0, 10]]}),
        Polygon,
    )
    rect = shape_from_dict(
        {"art": "rechteck", "mitte": [0, 0], "breite": 10, "tiefe": 10, "winkel": 45}
    )
    assert rect.contains(0, 7)
    cells = shape_from_dict({"art": "zellen", "groesse": 25, "zellen": [[0, 0]]})
    assert cells.contains(5, 5)
    with pytest.raises(ValueError):
        shape_from_dict({"art": "kreis"})
