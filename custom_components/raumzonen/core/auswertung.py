"""Auswertung der eigenen Aufnahme: wer war wann wo, fein aufgelöst.

Reines Python. Liest Zeilen im Format ``fp400-trace/2`` (wie sie
``aufnahme.py`` schreibt) in zeitlicher Reihenfolge und zählt:

* je Figur die Aufenthaltsdauer in feinen Zellen (Standard 5 cm), daraus
  macht das Panel weiche Flecken (keine groben Kästchen);
* je Zone die Dauer und die Zeitabschnitte, in denen dort jemand war;
* je Figur Dauer, erster/letzter Zeitpunkt, Zonen, Mensch oder Hund.

Gezählt werden die geglätteten Positionen der Spuren (Raumkoordinaten).
Zeit zwischen zwei Zeilen gehört zu den Figuren der früheren Zeile. Der
Sensor schweigt bei Ruhe minutenlang; eine Figur, die in der nächsten Zeile
noch da ist, bekommt darum die ganze Pause (bis ``MAX_RUHE_S``). Gehaltene
Figuren, Figuren, die danach fehlen, und Zeiten ohne Sensor zählen höchstens
``MAX_LUECKE_S``.

Eine Figur ist eine Spur von ihrem Auftauchen bis zum Ende. Spuren tauchen
innerhalb einer Ladung nie wieder auf; fehlt eine Kennung in einer Zeile und
kommt später wieder (nach einem Neustart beginnt die Zählung neu), ist das
eine neue Figur.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from datetime import datetime
import math
from typing import Any

from .geometry import Shape

ZELLE_CM = 5.0
MAX_RUHE_S = 1800.0
MAX_LUECKE_S = 60.0
# Abschnitte in einer Zone, die weniger als so weit auseinander liegen,
# werden zusammengelegt (für die Zeitleiste).
ABSCHNITT_LUECKE_S = 120.0
# Kürzere Figuren werden zu „kurze Spuren“ zusammengefasst.
MIN_FIGUR_S = 10.0
MAX_FIGUREN = 30
KURZ = "kurz"
# Diese Spuren sind keine echten Figuren (Störquelle, Echo, Platzhalter).
NICHT_ZAEHLEN = frozenset({"stoerung", "echo", "wiederhergestellt"})

type Cell = tuple[int, int]


@dataclass(slots=True)
class _Figur:
    key: str
    nummer: int
    erst: float
    zuletzt: float = 0.0
    sekunden: float = 0.0
    hund_s: float = 0.0
    zellen: dict[Cell, float] = field(default_factory=dict)
    zonen: dict[str, float] = field(default_factory=dict)
    abschnitte: list[list[float]] = field(default_factory=list)


def _add_abschnitt(abschnitte: list[list[float]], t0: float, t1: float) -> None:
    if abschnitte and t0 - abschnitte[-1][1] <= ABSCHNITT_LUECKE_S:
        abschnitte[-1][1] = max(abschnitte[-1][1], t1)
    else:
        abschnitte.append([t0, t1])


class Auswertung:
    """Sammelt Zeile für Zeile; ``ergebnis()`` liefert die Zusammenfassung."""

    def __init__(
        self,
        zonen: Mapping[str, Shape],
        von: float,
        bis: float,
        zelle_cm: float = ZELLE_CM,
    ) -> None:
        """``zonen``: Zone → Form in Raumkoordinaten; Zeitraum in Sekunden."""
        self.zonen = dict(zonen)
        self.von = von
        self.bis = bis
        self.zelle_cm = zelle_cm
        self._zonen_je_zelle: dict[Cell, tuple[str, ...]] = {}
        self._figuren: dict[str, _Figur] = {}
        self._aktiv: dict[str, _Figur] = {}  # Spur-Kennung → Figur
        self._zone_s: dict[str, float] = dict.fromkeys(self.zonen, 0.0)
        self._zone_abschnitte: dict[str, list[list[float]]] = {
            z: [] for z in self.zonen
        }
        self._prev_t: float | None = None
        self._prev: list[tuple[_Figur, float, float, bool, bool]] = []
        self._prev_verfuegbar = True
        self.zeilen = 0

    def _zonen_von(self, cell: Cell) -> tuple[str, ...]:
        hit = self._zonen_je_zelle.get(cell)
        if hit is None:
            cx = (cell[0] + 0.5) * self.zelle_cm
            cy = (cell[1] + 0.5) * self.zelle_cm
            hit = tuple(z for z, s in self.zonen.items() if s.contains(cx, cy))
            self._zonen_je_zelle[cell] = hit
        return hit

    def _buchen(self, bis_t: float, noch_da: set[str] | None) -> None:
        """Zeit seit der letzten Zeile den Figuren der letzten Zeile gutschreiben."""
        if self._prev_t is None:
            return
        t0 = max(self._prev_t, self.von)
        for fig, x, y, gehalten, hund in self._prev:
            still_da = noch_da is None or fig.key in noch_da
            cap = (
                MAX_RUHE_S
                if still_da and not gehalten and self._prev_verfuegbar
                else MAX_LUECKE_S
            )
            t1 = min(bis_t, self._prev_t + cap, self.bis)
            dt = t1 - t0
            if dt <= 0:
                continue
            cell = (math.floor(x / self.zelle_cm), math.floor(y / self.zelle_cm))
            fig.zellen[cell] = fig.zellen.get(cell, 0.0) + dt
            fig.sekunden += dt
            fig.zuletzt = max(fig.zuletzt, t1)
            if hund:
                fig.hund_s += dt
            _add_abschnitt(fig.abschnitte, t0, t1)
            for z in self._zonen_von(cell):
                fig.zonen[z] = fig.zonen.get(z, 0.0) + dt
                self._zone_s[z] += dt
                _add_abschnitt(self._zone_abschnitte[z], t0, t1)

    def add(self, zeile: Mapping[str, Any]) -> None:
        """Eine Zeile der Aufnahme (Kopfzeilen werden übersprungen)."""
        if "format" in zeile:
            return
        try:
            t = datetime.fromisoformat(zeile["zeit"]).timestamp()
        except KeyError, TypeError, ValueError:
            return
        if self._prev_t is not None and t < self._prev_t:
            return
        if t >= self.bis:
            return
        jetzt: list[tuple[str, float, float, bool, bool]] = []
        for spur in zeile.get("spuren") or ():
            try:
                sid, x, y, gehalten, tags = spur[0], spur[1], spur[2], spur[3], spur[4]
                x, y = float(x), float(y)
            except IndexError, TypeError, ValueError:
                continue
            if not (math.isfinite(x) and math.isfinite(y)):
                continue
            tags = set(tags or ())
            if tags & NICHT_ZAEHLEN:
                continue
            jetzt.append((str(sid), x, y, bool(gehalten), "hund" in tags))
        # Spur-Kennung → Figur: nur wer schon in der letzten Zeile war, bleibt.
        aktiv: dict[str, _Figur] = {}
        for sid, *_ in jetzt:
            fig = self._aktiv.get(sid)
            if fig is None:
                nummer = len(self._figuren) + 1
                fig = _Figur(key=f"f{nummer}", nummer=nummer, erst=max(t, self.von))
                self._figuren[fig.key] = fig
            aktiv[sid] = fig
        self._buchen(t, {aktiv[sid].key for sid, *_ in jetzt})
        self._aktiv = aktiv
        self._prev = [(aktiv[sid], x, y, g, h) for sid, x, y, g, h in jetzt]
        self._prev_t = t
        self._prev_verfuegbar = zeile.get("ziele", []) is not None
        self.zeilen += 1

    def add_all(self, zeilen: Iterable[Mapping[str, Any]]) -> None:
        """Viele Zeilen nacheinander."""
        for zeile in zeilen:
            self.add(zeile)

    def ergebnis(self, ende: float | None = None) -> dict[str, Any]:
        """Zusammenfassung bis ``ende`` (Standard: Ende des Zeitraums); einmal aufrufen.

        Wer bei der letzten Zeile noch da war, ist es bis ``ende`` (der
        Sensor schweigt bei Ruhe), höchstens ``MAX_RUHE_S`` lang.
        """
        ende = self.bis if ende is None else min(ende, self.bis)
        self._buchen(ende, None)
        self._prev = []
        return self._zusammenfassen(self._figuren, self._zone_s, self._zone_abschnitte)

    def _zusammenfassen(
        self,
        figuren: dict[str, _Figur],
        zone_s: dict[str, float],
        zone_ab: dict[str, list[list[float]]],
    ) -> dict[str, Any]:
        echte = sorted(
            (f for f in figuren.values() if f.sekunden > 0),
            key=lambda f: -f.sekunden,
        )
        lang = [f for f in echte if f.sekunden >= MIN_FIGUR_S][:MAX_FIGUREN]
        kurz = [f for f in echte if f not in lang]
        if kurz:
            sammel = _Figur(key=KURZ, nummer=0, erst=min(f.erst for f in kurz))
            for f in kurz:
                sammel.sekunden += f.sekunden
                sammel.hund_s += f.hund_s
                sammel.zuletzt = max(sammel.zuletzt, f.zuletzt)
                for c, s in f.zellen.items():
                    sammel.zellen[c] = sammel.zellen.get(c, 0.0) + s
                for z, s in f.zonen.items():
                    sammel.zonen[z] = sammel.zonen.get(z, 0.0) + s
                for a in f.abschnitte:
                    sammel.abschnitte.append(list(a))
            sammel.abschnitte.sort()
            merged: list[list[float]] = []
            for a in sammel.abschnitte:
                _add_abschnitt(merged, a[0], a[1])
            sammel.abschnitte = merged
            lang.append(sammel)
        return {
            "von": self.von,
            "bis": self.bis,
            "zelle_cm": self.zelle_cm,
            "zeilen": self.zeilen,
            "zonen": [
                {
                    "zone_id": z,
                    # Summe über alle Figuren (zwei im Bett zählen doppelt).
                    "sekunden": round(zone_s[z], 1),
                    # Wie lange dort überhaupt jemand war.
                    "belegt_s": round(sum(b - a for a, b in zone_ab[z]), 1),
                    "abschnitte": [[round(a, 1), round(b, 1)] for a, b in zone_ab[z]],
                    "figuren": [
                        f.key for f in lang if f.zonen.get(z, 0.0) >= MIN_FIGUR_S
                    ],
                }
                for z in self.zonen
            ],
            "figuren": [
                {
                    "figur": f.key,
                    "nummer": f.nummer,
                    "hund": f.hund_s > f.sekunden / 2,
                    "sekunden": round(f.sekunden, 1),
                    "erst": round(f.erst, 1),
                    "zuletzt": round(f.zuletzt, 1),
                    "zonen": {
                        z: round(s, 1)
                        for z, s in sorted(f.zonen.items(), key=lambda kv: -kv[1])
                    },
                    "abschnitte": [[round(a, 1), round(b, 1)] for a, b in f.abschnitte],
                    "zellen": [
                        [i, j, round(s, 1)]
                        for (i, j), s in f.zellen.items()
                        if s >= 0.05
                    ],
                }
                for f in lang
            ],
        }
