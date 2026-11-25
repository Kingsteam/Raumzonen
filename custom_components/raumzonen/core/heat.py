"""Bewegungskarte: wo sich in letzter Zeit jemand aufgehalten hat.

Reines Python. Zählt je Rasterzelle (Standard 20 cm), wie viele Sekunden
dort eine sichtbare Figur war, in Fünf-Minuten-Fächern für höchstens 24 h.
Nur im Speicher; nach einem Neustart beginnt die Karte leer. Dient im Panel
als Hilfe beim Einzeichnen der Zonen.
"""

from __future__ import annotations

from collections import OrderedDict
from collections.abc import Iterable
import math

CELL_CM = 20.0
BUCKET_S = 300.0
KEEP_S = 24 * 3600.0
# Längere Pausen zwischen Rahmen zählen nur bis zu dieser Dauer (ein ruhig
# Liegender wird oft minutenlang nicht gemeldet, ist aber da).
MAX_GAP_S = 60.0

type Cell = tuple[int, int]


class HeatMap:
    """Aufenthaltsdauer je Zelle in Zeitfächern."""

    def __init__(self, cell_cm: float = CELL_CM) -> None:
        """Leere Karte."""
        self.cell_cm = cell_cm
        self._buckets: OrderedDict[int, dict[Cell, float]] = OrderedDict()

    def add(
        self, now: float, points: Iterable[tuple[float, float]], seconds: float
    ) -> None:
        """``seconds`` Aufenthalt an jedem Punkt verbuchen."""
        seconds = min(max(seconds, 0.0), MAX_GAP_S)
        if seconds <= 0:
            return
        key = int(now // BUCKET_S)
        bucket = self._buckets.get(key)
        if bucket is None:
            bucket = self._buckets[key] = {}
            self._prune(now)
        for x, y in points:
            if not (math.isfinite(x) and math.isfinite(y)):
                continue
            cell = (math.floor(x / self.cell_cm), math.floor(y / self.cell_cm))
            bucket[cell] = bucket.get(cell, 0.0) + seconds

    def _prune(self, now: float) -> None:
        oldest = int((now - KEEP_S) // BUCKET_S)
        while self._buckets and next(iter(self._buckets)) < oldest:
            self._buckets.popitem(last=False)

    def query(self, now: float, minutes: float) -> dict[Cell, float]:
        """Summe der letzten ``minutes`` Minuten je Zelle."""
        first = int((now - minutes * 60) // BUCKET_S)
        out: dict[Cell, float] = {}
        for key, bucket in self._buckets.items():
            if key < first:
                continue
            for cell, value in bucket.items():
                out[cell] = out.get(cell, 0.0) + value
        return out
