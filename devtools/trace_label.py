"""Aufnahmen (``fp400-trace/1``) mit Ereignissen „aufgestanden“ beschriften.

Die Beschriftung ist die „Wahrheit“, gegen die die Tests den Kern prüfen.
Sie entsteht nicht aus dem alten Bett-Schalter (der hat viele Fehlalarme),
sondern aus dem Weg der Figur:

* Eine Figur verlässt die Bett-Fläche und ist spätestens ``MAX_BED_TO_DOOR_S``
  später in der Tür-Fläche, **und**
* im Flur oder Bad wird innerhalb von ``MAX_DOOR_TO_NEIGHBOUR_S`` Präsenz
  gemeldet.

Zeitpunkt des Ereignisses ist der Moment, in dem die Figur die Bett-Fläche
zuletzt verlassen hat. ``liegt`` sind die Zeiträume vom Hinlegen (Signal
``im_bett`` geht an, plus ``SETTLE_S``) bis kurz vor dem nächsten Aufstehen.

Beispiel::

    python devtools/trace_label.py <aufnahmen>/schlafzimmer-nacht-*.json \
        --zones tests/daten/schlafzimmer-zonen.json
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

MAX_BED_TO_DOOR_S = 6.0
MAX_DOOR_TO_NEIGHBOUR_S = 60.0
MIN_LYING_S = 600.0
SETTLE_S = 30.0
BEFORE_EVENT_S = 3.0


def _inside(zone: dict[str, Any], x: float, y: float) -> bool:
    """Punkt im (ggf. gedrehten) Rechteck, wie der Konverter es rechnet."""
    rot = zone.get("rotation", 0)
    if rot:
        a = -rot * math.pi / 180
        c, s = math.cos(a), math.sin(a)
        x, y = x * c - y * s, x * s + y * c
    return zone["x_min"] <= x < zone["x_max"] and zone["y_min"] <= y < zone["y_max"]


def _on_times(series: list[list[Any]]) -> list[float]:
    return [t for t, v in series if v is True]


def _on_periods(series: list[list[Any]], end: float) -> list[tuple[float, float]]:
    out, start = [], None
    for t, v in series:
        if v is True and start is None:
            start = t
        elif v is not True and start is not None:
            out.append((start, t))
            start = None
    if start is not None:
        out.append((start, end))
    return out


def label(trace: dict[str, Any], bed: dict[str, Any], door: dict[str, Any]) -> None:
    """Ergänzt ``ereignisse`` und ``liegt`` in der Aufnahme."""
    neighbour = sorted(
        _on_times(trace["signale"].get("flur", []))
        + _on_times(trace["signale"].get("bad", []))
    )
    last_in_bed: dict[int, float] = {}
    events: list[float] = []
    for t, targets in trace["rahmen"]:
        for tid, x, y in targets or []:
            if _inside(bed, x, y):
                last_in_bed[tid] = t
            elif _inside(door, x, y) and tid in last_in_bed:
                left = last_in_bed[tid]
                if t - left > MAX_BED_TO_DOOR_S:
                    continue
                if events and left - events[-1] < 60:
                    continue
                if any(t - 5 <= n <= t + MAX_DOOR_TO_NEIGHBOUR_S for n in neighbour):
                    events.append(left)
                    del last_in_bed[tid]
    trace["ereignisse"] = [{"t": e, "art": "aufgestanden"} for e in events]

    lying = []
    starts = [
        a
        for a, b in _on_periods(trace["signale"].get("im_bett", []), trace["dauer_s"])
        if b - a >= MIN_LYING_S
    ]
    prev_event = -1e9
    for e in events:
        cands = [s for s in starts if prev_event < s < e]
        if cands:
            a, b = cands[0] + SETTLE_S, e - BEFORE_EVENT_S
            if b - a > 60:
                lying.append([round(a, 1), round(b, 1)])
        prev_event = e
    trace["liegt"] = lying


def main() -> None:
    """Kommandozeile."""
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("traces", nargs="+")
    p.add_argument("--zones", required=True, help="JSON mit 'bett' und 'tuer'")
    args = p.parse_args()
    zones = json.loads(Path(args.zones).read_text(encoding="utf-8"))
    for path in args.traces:
        trace = json.loads(Path(path).read_text(encoding="utf-8"))
        label(trace, zones["bett"], zones["tuer"])
        Path(path).write_text(
            json.dumps(trace, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        print(
            path,
            "aufgestanden:",
            [e["t"] for e in trace["ereignisse"]],
            "liegt:",
            trace["liegt"],
        )


if __name__ == "__main__":
    main()
