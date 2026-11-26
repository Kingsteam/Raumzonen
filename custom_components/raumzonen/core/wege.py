"""Wege durchs Haus: wer ging durch welche Tür von welchem Raum in welchen.

Reines Python. Grundlage sind Tür-Zonen (Zonen der Art „ausgang“) und die
Verbindungen der Türen. Ein Weg entsteht, wenn kurz nacheinander

* die Tür-Zone in Raum A und dann die verbundene Tür-Zone in Raum B belegt
  werden (zwei Radar-Räume, am genauesten), oder
* die Tür-Zone in A belegt wird und danach der Melder-Raum B, in den die Tür
  führt, „jemand da“ meldet (oder umgekehrt: erst B, dann die Tür-Zone in A,
  die nach B führt: dann ging jemand von B nach A).

Jedes Belegt-Werden zählt höchstens für einen Weg. Die Liste der Wege liegt
nur im Speicher (die letzten ``MAX_WEGE``).
"""

from __future__ import annotations

from collections import deque
from collections.abc import Callable
from dataclasses import dataclass, field

FENSTER_S = 10.0
MAX_WEGE = 200


@dataclass(slots=True)
class TuerKnoten:
    """Eine Tür-Zone: Raum, wohin sie führt, und die Tür-Zonen gegenüber."""

    key: str
    raum: str
    ziel: str = ""
    partner: frozenset[str] = frozenset()
    name: str = ""


@dataclass(slots=True, frozen=True)
class Weg:
    """Ein Weg von Raum ``von`` nach Raum ``nach`` zur Zeit ``t``."""

    t: float
    von: str
    nach: str
    tuer: str
    genau: bool


@dataclass(slots=True)
class _Mark:
    t: float
    frei: bool = True


@dataclass
class Wege:
    """Sammelt Belegt-Meldungen von Tür-Zonen und Melder-Räumen."""

    fenster_s: float = FENSTER_S
    knoten: dict[str, TuerKnoten] = field(default_factory=dict)
    melder_raeume: set[str] = field(default_factory=set)
    liste: deque[Weg] = field(default_factory=lambda: deque(maxlen=MAX_WEGE))
    on_weg: Callable[[Weg], None] | None = None
    _tuer: dict[str, _Mark] = field(default_factory=dict)
    _melder: dict[str, _Mark] = field(default_factory=dict)

    def setze(self, knoten: dict[str, TuerKnoten], melder_raeume: set[str]) -> None:
        """Neuer Aufbau (nach dem Laden); alte Meldungen verfallen."""
        self.knoten = dict(knoten)
        self.melder_raeume = set(melder_raeume)
        self._tuer.clear()
        self._melder.clear()

    def _frisch(self, mark: _Mark | None, t: float) -> bool:
        return mark is not None and mark.frei and 0 <= t - mark.t <= self.fenster_s

    def _weg(self, weg: Weg) -> Weg:
        self.liste.append(weg)
        if self.on_weg is not None:
            self.on_weg(weg)
        return weg

    def tuer_belegt(self, key: str, t: float) -> Weg | None:
        """Tür-Zone ``key`` wurde belegt."""
        node = self.knoten.get(key)
        if node is None:
            return None
        mark = _Mark(t)
        self._tuer[key] = mark
        # Gegenüber war gerade jemand: von dort hierher.
        for p in sorted(node.partner, key=lambda k: -self._tuer.get(k, _Mark(-1e18)).t):
            alt = self._tuer.get(p)
            if self._frisch(alt, t) and p in self.knoten:
                alt.frei = mark.frei = False
                return self._weg(Weg(t, self.knoten[p].raum, node.raum, key, True))
        # Die Tür führt in einen Melder-Raum, der eben noch jemanden meldete.
        if node.ziel in self.melder_raeume and self._frisch(
            self._melder.get(node.ziel), t
        ):
            self._melder[node.ziel].frei = mark.frei = False
            return self._weg(Weg(t, node.ziel, node.raum, key, False))
        return None

    def raum_belegt(self, raum: str, t: float) -> Weg | None:
        """Melder-Raum ``raum`` meldet „jemand da“."""
        mark = _Mark(t)
        self._melder[raum] = mark
        kandidaten = [
            (self._tuer[k].t, k)
            for k, n in self.knoten.items()
            if n.ziel == raum and self._frisch(self._tuer.get(k), t)
        ]
        if not kandidaten:
            return None
        _, key = max(kandidaten)
        self._tuer[key].frei = mark.frei = False
        return self._weg(Weg(t, self.knoten[key].raum, raum, key, False))
