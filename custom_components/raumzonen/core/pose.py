"""Lage eines Sensors im Raum (und später eines Raums im Haus).

Reines Python. Der FP400 meldet Punkte in *seinem* Koordinatensystem:
x quer, y geradeaus vom Sensor weg, ungefähr cm. Im Raumplan liegt der
Sensor an ``(x, y)`` und schaut in Richtung ``winkel`` (Grad, gegen den
Uhrzeigersinn; 0° = in Richtung +y des Raums). So wie der Sprinkler im
Gartenplan: Position, Richtung, Reichweite, Öffnungswinkel.

Ohne Angabe (0, 0, 0°) sind Raum- und Sensorkoordinaten gleich; so bleiben
ältere Zonen gültig.
"""

from __future__ import annotations

from dataclasses import dataclass
import math

from .tracks import Target


@dataclass(frozen=True, slots=True)
class Pose:
    """Position und Drehung."""

    x: float = 0.0
    y: float = 0.0
    winkel: float = 0.0

    @property
    def identity(self) -> bool:
        """Keine Verschiebung und keine Drehung."""
        return self.x == 0 and self.y == 0 and self.winkel == 0

    def to_room(self, xs: float, ys: float) -> tuple[float, float]:
        """Sensor- → Raumkoordinaten."""
        a = math.radians(self.winkel)
        c, s = math.cos(a), math.sin(a)
        return self.x + xs * c - ys * s, self.y + xs * s + ys * c

    def to_sensor(self, xr: float, yr: float) -> tuple[float, float]:
        """Raum- → Sensorkoordinaten."""
        a = math.radians(-self.winkel)
        c, s = math.cos(a), math.sin(a)
        dx, dy = xr - self.x, yr - self.y
        return dx * c - dy * s, dx * s + dy * c

    def target_to_room(self, target: Target) -> Target:
        """Ein Ziel in Raumkoordinaten (Bewegung und Art bleiben)."""
        if self.identity:
            return target
        x, y = self.to_room(target.x, target.y)
        return Target(target.id, x, y, target.moving, target.type)

    def points_to_room(self, points: list[list[float]]) -> list[list[float]]:
        """Ecken einer Form aus Sensor- in Raumkoordinaten."""
        return [
            [round(v, 1) for v in self.to_room(float(x), float(y))] for x, y in points
        ]
