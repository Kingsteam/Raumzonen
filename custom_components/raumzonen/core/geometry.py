"""Flächen im Raum: Vieleck, gedrehtes Rechteck, Zellen.

Reines Python ohne Home Assistant. Alle Maße in Zentimetern im
Koordinatensystem des Sensors (so, wie der FP400 sie meldet: x quer,
y vom Sensor weg). Winkel in Grad, positiv gegen den Uhrzeigersinn, wie im
Zigbee2MQTT-Konverter (``rotation`` der Software-Zonen).

Jede Form kann zwei Fragen beantworten:

* ``contains(x, y)``: liegt der Punkt in der Fläche?
* ``distance(x, y)``: wie weit ist der Punkt vom Rand entfernt? Negativ
  innen, positiv außen. Damit lassen sich Randstreifen (Hysterese) bauen:
  „drinnen“ heißt ``distance <= 0``, „sicher draußen“ heißt
  ``distance > rand_cm``.
"""

from __future__ import annotations

from dataclasses import dataclass
import math

type Point = tuple[float, float]


def _seg_dist(px: float, py: float, a: Point, b: Point) -> float:
    """Abstand eines Punktes zu einer Strecke."""
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    length2 = dx * dx + dy * dy
    if length2 == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / length2))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def _area2(points: list[Point]) -> float:
    """Doppelte vorzeichenbehaftete Fläche (Schnürsenkelformel)."""
    return sum(
        x1 * y2 - x2 * y1
        for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1], strict=True)
    )


def _segments_cross(a: Point, b: Point, c: Point, d: Point) -> bool:
    """Prüft, ob sich die Strecken a-b und c-d echt schneiden (nicht am Ende)."""

    def orient(p: Point, q: Point, r: Point) -> float:
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])

    o1, o2 = orient(a, b, c), orient(a, b, d)
    o3, o4 = orient(c, d, a), orient(c, d, b)
    return o1 * o2 < 0 and o3 * o4 < 0


@dataclass(frozen=True, slots=True)
class Polygon:
    """Vieleck mit mindestens drei Ecken, ohne Selbstüberschneidung."""

    points: tuple[Point, ...]

    def __post_init__(self) -> None:
        """Prüft die Form."""
        pts = list(self.points)
        if len(pts) < 3:
            raise ValueError("Ein Vieleck braucht mindestens drei Ecken")
        if any(not (math.isfinite(x) and math.isfinite(y)) for x, y in pts):
            raise ValueError("Ecken müssen endliche Zahlen sein")
        if abs(_area2(pts)) < 1e-6:
            raise ValueError("Das Vieleck hat keine Fläche")
        n = len(pts)
        for i in range(n):
            for j in range(i + 1, n):
                if abs(i - j) in (1, n - 1):
                    continue
                if _segments_cross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n]):
                    raise ValueError("Die Kanten des Vielecks überschneiden sich")

    @property
    def edges(self) -> list[tuple[Point, Point]]:
        """Kanten als Paare von Ecken."""
        pts = list(self.points)
        return list(zip(pts, pts[1:] + pts[:1], strict=True))

    @property
    def area(self) -> float:
        """Fläche in cm²."""
        return abs(_area2(list(self.points))) / 2

    def contains(self, x: float, y: float) -> bool:
        """Punkt im Vieleck (Rand zählt als innen)."""
        inside = False
        for (x1, y1), (x2, y2) in self.edges:
            if _seg_dist(x, y, (x1, y1), (x2, y2)) < 1e-9:
                return True
            if (y1 > y) != (y2 > y):
                xc = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
                if x < xc:
                    inside = not inside
        return inside

    def distance(self, x: float, y: float) -> float:
        """Abstand zum Rand: negativ innen, positiv außen."""
        d = min(_seg_dist(x, y, a, b) for a, b in self.edges)
        return -d if self.contains(x, y) else d


def rotated_rect(
    cx: float, cy: float, width: float, depth: float, angle_deg: float
) -> Polygon:
    """Gedrehtes Rechteck um seine Mitte als Vieleck.

    ``width`` liegt vor dem Drehen entlang x, ``depth`` entlang y.
    """
    if width <= 0 or depth <= 0:
        raise ValueError("Breite und Tiefe müssen größer als 0 sein")
    a = math.radians(angle_deg)
    c, s = math.cos(a), math.sin(a)
    hw, hd = width / 2, depth / 2
    corners = [(-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd)]
    return Polygon(tuple((cx + u * c - v * s, cy + u * s + v * c) for u, v in corners))


def converter_rect(
    x_min: float, x_max: float, y_min: float, y_max: float, rotation: float = 0
) -> Polygon:
    """Software-Zone des Zigbee2MQTT-Konverters als Vieleck.

    Der Konverter dreht den *Punkt* um ``-rotation`` und prüft ihn gegen das
    Rechteck. Gleichwertig: das Rechteck um ``+rotation`` drehen.
    """
    a = math.radians(rotation)
    c, s = math.cos(a), math.sin(a)
    corners = [(x_min, y_min), (x_max, y_min), (x_max, y_max), (x_min, y_max)]
    return Polygon(tuple((u * c - v * s, u * s + v * c) for u, v in corners))


@dataclass(frozen=True, slots=True)
class Cells:
    """Fläche aus Rasterzellen (z. B. 25 cm), gemalt wie beim Gartenplan.

    ``cells`` sind (Spalte, Zeile); Zelle (i, j) deckt
    ``[x0 + i*size, x0 + (i+1)*size) x [y0 + j*size, y0 + (j+1)*size)`` ab.
    """

    size: float
    cells: frozenset[tuple[int, int]]
    x0: float = 0.0
    y0: float = 0.0

    def __post_init__(self) -> None:
        """Prüft das Raster."""
        if not self.size > 0:
            raise ValueError("Zellgröße muss größer als 0 sein")
        if not self.cells:
            raise ValueError("Mindestens eine Zelle wählen")

    def _cell_of(self, x: float, y: float) -> tuple[int, int]:
        return (
            math.floor((x - self.x0) / self.size),
            math.floor((y - self.y0) / self.size),
        )

    def contains(self, x: float, y: float) -> bool:
        """Punkt in einer der Zellen."""
        return self._cell_of(x, y) in self.cells

    def _cell_dist(self, x: float, y: float, cell: tuple[int, int]) -> float:
        left = self.x0 + cell[0] * self.size
        top = self.y0 + cell[1] * self.size
        dx = max(left - x, 0.0, x - (left + self.size))
        dy = max(top - y, 0.0, y - (top + self.size))
        return math.hypot(dx, dy)

    def distance(self, x: float, y: float) -> float:
        """Abstand zum Rand: negativ innen, positiv außen."""
        if not self.contains(x, y):
            return min(self._cell_dist(x, y, c) for c in self.cells)
        # Innen: Abstand zur nächsten Zelle, die nicht dazugehört.
        ci, cj = self._cell_of(x, y)
        best = math.inf
        reach = 1
        while reach < 64:
            for i in range(ci - reach, ci + reach + 1):
                for j in range(cj - reach, cj + reach + 1):
                    if (i, j) not in self.cells:
                        best = min(best, self._cell_dist(x, y, (i, j)))
            if best <= reach * self.size:
                break
            reach += 1
        return -best


type Shape = Polygon | Cells


def inner_point(shape: Shape) -> Point:
    """Ein Punkt, der sicher in der Fläche liegt (für Platzhalter)."""
    if isinstance(shape, Cells):
        i, j = min(shape.cells)
        return (shape.x0 + (i + 0.5) * shape.size, shape.y0 + (j + 0.5) * shape.size)
    xs = [p[0] for p in shape.points]
    ys = [p[1] for p in shape.points]
    cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
    if shape.contains(cx, cy):
        return cx, cy
    # Nicht konvex: Raster absuchen, tiefster Punkt gewinnt.
    best, best_d = shape.points[0], 0.0
    steps = 24
    for a in range(1, steps):
        for b in range(1, steps):
            x = min(xs) + (max(xs) - min(xs)) * a / steps
            y = min(ys) + (max(ys) - min(ys)) * b / steps
            d = shape.distance(x, y)
            if d < best_d:
                best, best_d = (x, y), d
    return best


def shape_from_dict(data: dict) -> Shape:
    """Form aus gespeicherten Daten (``art``: vieleck, rechteck, zellen)."""
    kind = data.get("art")
    if kind == "vieleck":
        return Polygon(tuple((float(x), float(y)) for x, y in data["punkte"]))
    if kind == "rechteck":
        return rotated_rect(
            float(data["mitte"][0]),
            float(data["mitte"][1]),
            float(data["breite"]),
            float(data["tiefe"]),
            float(data.get("winkel", 0)),
        )
    if kind == "zellen":
        return Cells(
            size=float(data["groesse"]),
            cells=frozenset((int(i), int(j)) for i, j in data["zellen"]),
            x0=float(data.get("x0", 0)),
            y0=float(data.get("y0", 0)),
        )
    raise ValueError(f"Unbekannte Form: {kind!r}")
