"""Aufnahmen eines FP400 aus dem Home-Assistant-Verlauf anonymisiert exportieren.

Liest Verlaufsdateien im Format der Home-Assistant-REST-API
(``/api/history/period/...?minimal_response&no_attributes``, eine Datei je
Entität) und schreibt daraus Testdateien im Format ``fp400-trace/1``
(siehe ``docs/DATENFORMAT.md``).

Was in die Ausgabe kommt: Zeit in Sekunden ab Beginn des Ausschnitts, Ziel-ID,
x, y (ca. cm im Sensorsystem), dazu grobe Vergleichssignale (an/aus) unter
neutralen Namen. Was **nicht** hineinkommt: Datum und Uhrzeit, Entitätsnamen,
Gerätenamen, IEEE-Adressen, Personennamen, Adressen.

Das Skript läuft nur lokal mit Dateien, die man vorher selbst geholt hat; es
spricht nie mit Home Assistant.

Beispiel::

    python devtools/trace_export.py \
        --xy targets_xy.json --frames tracking_last_update.json \
        --signal im_bett=bett.json --signal flur=flur.json --signal bad=bad.json \
        --split-on im_bett --name schlafzimmer-nacht --out <aufnahmen>
"""

from __future__ import annotations

import argparse
from datetime import datetime
import json
from pathlib import Path
from typing import Any

FORMAT = "fp400-trace/1"
# Ein Rahmen und die zugehörige Positionsänderung kommen in derselben
# MQTT-Nachricht, landen im Verlauf aber mit leicht verschiedenen Zeiten.
MERGE_S = 0.2


def _load(path: str) -> list[tuple[float, str]]:
    """Liest eine Verlaufsdatei: Liste von (Zeit als Unix-Sekunden, Zustand)."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    rows = data[0] if data and isinstance(data[0], list) else data
    return [
        (datetime.fromisoformat(r["last_changed"]).timestamp(), str(r["state"]))
        for r in rows
    ]


def parse_targets_xy(state: str) -> list[list[int]] | None:
    """``"0:-120:225;1:12:263"`` → ``[[0,-120,225],[1,12,263]]``; Ausfall → None."""
    if state == "none":
        return []
    if state in ("unknown", "unavailable", "", "None"):
        return None
    out = []
    for part in state.split(";"):
        tid, x, y = part.split(":")
        out.append([int(tid), round(float(x)), round(float(y))])
    return out


def merge_frames(
    xy: list[tuple[float, str]], frames: list[tuple[float, str]]
) -> list[tuple[float, list[list[int]] | None]]:
    """Zeitreihe aller Rahmen mit dem jeweils gültigen Ziel-Stand."""
    times = sorted({t for t, _ in xy} | {t for t, _ in frames})
    unavailable = {t for t, s in frames if s in ("unavailable", "unknown")}
    out: list[tuple[float, list[list[int]] | None]] = []
    i = 0
    current: list[list[int]] | None = None
    last_t = -1e18
    for t in times:
        while i < len(xy) and xy[i][0] <= t + MERGE_S:
            current = parse_targets_xy(xy[i][1])
            i += 1
        targets = None if t in unavailable else current
        if out and t - last_t < MERGE_S and out[-1][1] == targets:
            continue
        out.append((t, targets))
        last_t = t
    return out


def on_periods(signal: list[tuple[float, str]]) -> list[tuple[float, float]]:
    """Zeiträume, in denen ein Signal ``on`` war."""
    out = []
    start = None
    for t, s in signal:
        if s == "on" and start is None:
            start = t
        elif s != "on" and start is not None:
            out.append((start, t))
            start = None
    if start is not None:
        out.append((start, signal[-1][0]))
    return out


def segments(
    signal: list[tuple[float, str]],
    min_on_s: float = 600,
    join_gap_s: float = 3 * 3600,
    pad_s: float = 600,
) -> list[tuple[float, float]]:
    """Ausschnitte rund um längere An-Zeiten (z. B. Nächte)."""
    periods = [(a, b) for a, b in on_periods(signal) if b - a >= min_on_s]
    clusters: list[list[float]] = []
    for a, b in periods:
        if clusters and a - clusters[-1][1] < join_gap_s:
            clusters[-1][1] = b
        else:
            clusters.append([a, b])
    return [(a - pad_s, b + pad_s) for a, b in clusters]


def _rel(t: float, t0: float) -> float:
    return round(t - t0, 1)


def build_trace(
    name: str,
    frames: list[tuple[float, list[list[int]] | None]],
    signals: dict[str, list[tuple[float, str]]],
    start: float,
    end: float,
) -> dict[str, Any]:
    """Ein Ausschnitt als ``fp400-trace/1``; alle Zeiten relativ zu ``start``."""
    rows = [[_rel(t, start), v] for t, v in frames if start <= t < end]
    # Stand zu Beginn mitnehmen, damit der Ausschnitt nicht leer anfängt.
    before = [v for t, v in frames if t < start]
    if before and (not rows or rows[0][0] > 0):
        rows.insert(0, [0.0, before[-1]])
    sig_out: dict[str, list[list[Any]]] = {}
    for key, sig in signals.items():
        values = [s for t, s in sig if t < start]
        series: list[list[Any]] = []
        if values:
            series.append([0.0, values[-1] == "on"])
        for t, s in sig:
            if start <= t < end:
                state = None if s in ("unavailable", "unknown") else s == "on"
                if not series or series[-1][1] != state:
                    series.append([_rel(t, start), state])
        sig_out[key] = series
    return {
        "format": FORMAT,
        "name": name,
        "dauer_s": _rel(end, start),
        "einheit": "cm (ungefähr), Koordinaten des Sensors",
        "rahmen": rows,
        "signale": sig_out,
    }


def main() -> None:
    """Kommandozeile."""
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--xy", required=True, help="Verlauf von sensor.<fp400>_targets_xy")
    p.add_argument(
        "--frames", help="Verlauf von sensor.<fp400>_tracking_last_update (Rahmen)"
    )
    p.add_argument(
        "--signal",
        action="append",
        default=[],
        help="neutraler_name=datei.json (an/aus-Signal zum Vergleich)",
    )
    p.add_argument("--split-on", help="Signal, nach dem in Ausschnitte geteilt wird")
    p.add_argument("--name", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()

    xy = _load(args.xy)
    frames_raw = _load(args.frames) if args.frames else []
    signals = {}
    for item in args.signal:
        key, path = item.split("=", 1)
        signals[key] = _load(path)
    frames = merge_frames(xy, frames_raw)
    if args.split_on:
        parts = segments(signals[args.split_on])
    else:
        parts = [(frames[0][0], frames[-1][0] + 1)]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for n, (a, b) in enumerate(parts, 1):
        trace = build_trace(f"{args.name}-{n}", frames, signals, a, b)
        path = out / f"{args.name}-{n}.json"
        path.write_text(
            json.dumps(trace, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        print(f"{path}: {len(trace['rahmen'])} Rahmen, {trace['dauer_s'] / 3600:.1f} h")


if __name__ == "__main__":
    main()
