"""Aufnahmen im Format ``fp400-trace/1`` lesen und abspielen.

Format: siehe ``docs/DATENFORMAT.md``. Wird von den Tests benutzt und später
für die Vorschau „so hätte die Regel letzte Nacht entschieden“.
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any

from .room import Room, ZoneEvent
from .tracks import Target

FORMAT = "fp400-trace/1"

type Frame = tuple[float, list[Target] | None]


@dataclass(slots=True)
class Trace:
    """Eine Aufnahme."""

    name: str
    duration_s: float
    frames: list[Frame]
    signals: dict[str, list[tuple[float, bool | None]]]
    events: list[dict[str, Any]]
    lying: list[tuple[float, float]]


def _target(row: list[Any]) -> Target:
    """``[id, x, y]`` oder ``[id, x, y, moving, type]``."""
    moving = row[3] if len(row) > 3 else None
    kind = row[4] if len(row) > 4 else None
    return Target(int(row[0]), float(row[1]), float(row[2]), moving, kind)


def parse_trace(data: dict[str, Any]) -> Trace:
    """Prüft und wandelt eine Aufnahme."""
    if data.get("format") != FORMAT:
        raise ValueError(f"Kein {FORMAT}: {data.get('format')!r}")
    frames: list[Frame] = []
    last = -1.0
    for t, targets in data["rahmen"]:
        t = float(t)
        if t < last:
            raise ValueError("Rahmen sind nicht nach Zeit sortiert")
        last = t
        frames.append((t, None if targets is None else [_target(r) for r in targets]))
    return Trace(
        name=str(data.get("name", "")),
        duration_s=float(data.get("dauer_s", last)),
        frames=frames,
        signals={
            k: [(float(t), v) for t, v in series]
            for k, series in data.get("signale", {}).items()
        },
        events=list(data.get("ereignisse", [])),
        lying=[(float(a), float(b)) for a, b in data.get("liegt", [])],
    )


def load_trace(path: str | Path) -> Trace:
    """Liest eine Aufnahme aus einer Datei."""
    return parse_trace(json.loads(Path(path).read_text(encoding="utf-8")))


def replay(room: Room, trace: Trace) -> Iterator[ZoneEvent]:
    """Spielt die Aufnahme ab; Zeitregeln greifen genau zur richtigen Zeit."""
    for t, targets in trace.frames:
        yield from room.advance(t)
        yield from room.update(t, targets)
    yield from room.advance(trace.duration_s)
