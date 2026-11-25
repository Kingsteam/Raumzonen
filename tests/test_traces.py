"""Tests mit echten, anonymisierten Aufnahmen eines FP400 im Schlafzimmer.

Die Aufnahmen (``schlafzimmer-nacht-*.json``) stammen aus vier Nächten. Sie
liegen nicht in diesem öffentlichen Repo, sondern im privaten Repo
``haus-privat`` (Ordner ``raumzonen/aufnahmen``). Dort laufen diese Tests
bei jeder Änderung und täglich gegen ``main``; lokal mit
``RAUMZONEN_AUFNAHMEN=<Ordner> pytest tests/test_traces.py``. Vor jedem
Release ist das Pflicht (``CLAUDE.md``, Regel 3, vom Besitzer so geändert).
Beschriftet sind sie mit ``devtools/trace_label.py``: „aufgestanden“ heißt,
die Figur ging vom Bett zur Tür und im Flur oder Bad wurde kurz danach
Präsenz gemeldet; ``liegt`` sind die Zeiten dazwischen im Bett.

Diese Tests prüfen die Ziele des Besitzers. Nicht abschwächen:

* „aufgestanden“ höchstens ``MAX_AUFGESTANDEN_S`` (5 s) nach dem Verlassen
  des Betts,
* im Liegen (Sprünge ±50 cm, Aussetzer, ID-Wechsel, Hund) kein Fehlalarm.
"""

from __future__ import annotations

from functools import cache
import json

import pytest

from custom_components.raumzonen.const import MAX_AUFGESTANDEN_S
from custom_components.raumzonen.core.geometry import converter_rect
from custom_components.raumzonen.core.room import (
    ART_AUSGANG,
    Room,
    Zone,
    ZoneEvent,
    ZoneRule,
)
from custom_components.raumzonen.core.trace import Trace, load_trace, replay

from .conftest import AUFNAHMEN, DATEN

NIGHTS = sorted(AUFNAHMEN.glob("schlafzimmer-nacht-*.json")) if AUFNAHMEN else []
if not NIGHTS:
    pytest.skip(
        "Aufnahmen liegen im privaten Repo haus-privat "
        "(RAUMZONEN_AUFNAHMEN setzen); dort laufen diese Tests.",
        allow_module_level=True,
    )
ZONES = json.loads((DATEN / "schlafzimmer-zonen.json").read_text(encoding="utf-8"))

# Empfohlene Regel fürs Bett (so auch in docs/KONZEPT.md beschrieben).
BED_RULE = ZoneRule(
    belegt_nach_s=3,
    frei_nach_s=2,
    rand_cm=25,
    schlaefer_halten=True,
    weg_rahmen=3,
    weg_cm=60,
    max_personen=1,
)


def make_room() -> Room:
    return Room(
        [
            Zone("bett", "Bett", converter_rect(**ZONES["bett"]), rule=BED_RULE),
            Zone(
                "tuer",
                "Tür",
                converter_rect(**ZONES["tuer"]),
                art=ART_AUSGANG,
                rule=ZoneRule(belegt_nach_s=0, frei_nach_s=2),
            ),
        ]
    )


@cache
def played(path: str) -> tuple[Trace, list[ZoneEvent]]:
    trace = load_trace(path)
    events = [e for e in replay(make_room(), trace) if e.zone_id == "bett"]
    return trace, events


def real_getups(trace: Trace) -> list[float]:
    """Aufstehen, das eine Liegezeit beendet (nicht bloß am Bett vorbei)."""
    ends = [b for _, b in trace.lying]
    return [e["t"] for e in trace.events if any(0 < e["t"] - b < 10 for b in ends)]


def free_events_while_lying(trace: Trace, events: list[ZoneEvent]) -> list[float]:
    return [
        e.t
        for e in events
        if not e.occupied and any(a < e.t < b for a, b in trace.lying)
    ]


def test_recordings_present() -> None:
    assert len(NIGHTS) >= 4
    total = sum(len(real_getups(load_trace(p))) for p in NIGHTS)
    assert total >= 8, "zu wenige beschriftete Aufstehvorgänge"


@pytest.mark.parametrize("path", NIGHTS, ids=lambda p: p.stem)
def test_getting_up_detected_within_limit(path) -> None:
    trace, events = played(str(path))
    frees = [e.t for e in events if not e.occupied]
    for t in real_getups(trace):
        later = [f - t for f in frees if f >= t - 1]
        assert later, f"Aufstehen bei {t} s nicht erkannt"
        assert later[0] <= MAX_AUFGESTANDEN_S, (
            f"Aufstehen bei {t} s erst nach {later[0]:.1f} s erkannt"
        )


def test_no_false_alarms_while_lying() -> None:
    """Über alle Nächte höchstens 2 kurze Freimeldungen im Liegen.

    Die verbleibenden Fälle in den Aufnahmen sind echte Bewegungen (jemand
    geht kurz Richtung Tür und legt sich nach 3 bis 4 s wieder hin).
    """
    false_free = []
    for path in NIGHTS:
        trace, events = played(str(path))
        false_free += free_events_while_lying(trace, events)
    assert len(false_free) <= 2, false_free


def test_better_than_old_switch() -> None:
    """Vergleich mit dem bisherigen Bett-Schalter (Signal ``im_bett``)."""
    old = new = 0
    for path in NIGHTS:
        trace, events = played(str(path))
        new += len(free_events_while_lying(trace, events))
        old += sum(
            1
            for t, v in trace.signals["im_bett"]
            if v is False and any(a < t < b for a, b in trace.lying)
        )
    assert old >= 5  # so viele Fehlalarme hatte der alte Schalter
    assert new < old


@pytest.mark.parametrize("path", NIGHTS, ids=lambda p: p.stem)
def test_every_exit_from_occupied_bed_within_limit(path) -> None:
    """Auch Aufstehen ohne lange Liegezeit davor (z. B. nach kurzem Hinlegen)."""
    trace, events = played(str(path))
    checked = 0
    for e in trace.events:
        t = e["t"]
        before = [ev for ev in events if ev.t <= t - 1]
        if not before or not before[-1].occupied:
            continue  # Bett war gar nicht belegt (nur vorbeigegangen)
        checked += 1
        later = [ev.t - t for ev in events if ev.t > t - 1 and not ev.occupied]
        assert later, t
        assert later[0] <= MAX_AUFGESTANDEN_S, (t, later[0])
    assert checked >= 1
