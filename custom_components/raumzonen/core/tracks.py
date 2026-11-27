"""Spuren: aus den Punkten des Sensors werden Figuren, die nicht verschwinden.

Grundsatz: **Eine Figur löst sich nicht plötzlich in Luft auf.**

Der FP400 meldet je Rahmen eine Liste von Zielen (ID, x, y, teils Bewegung
und Art). Daraus werden hier Spuren (``Track``) mit eigener, stabiler Nummer:

* Ein Ziel mit derselben Sensor-ID gehört zur selben Spur, solange der
  Sprung plausibel ist.
* Wechselt der Sensor die ID (passiert nachts öfter), übernimmt das neue Ziel
  die nächstgelegene freie Spur, wenn es nah genug ist.
* Fehlt ein Ziel im Rahmen, wird die Spur **gehalten** (Zustand ``held``) und
  bleibt an ihrer letzten Stelle. Wie lange, entscheidet die Raumlogik über
  ``hold_time`` (z. B. im Bett unbegrenzt, an der Tür nur kurz).
* **Kommt kein Rahmen, ändert sich nichts.** Der Sensor schickt in Ruhe oft
  minutenlang nichts; Stille heißt nicht „weg“.
* Ein Ausfall (Sensor nicht erreichbar) hält ebenfalls alles fest und wird
  nur gemeldet (``available``).

Reines Python ohne Home Assistant; die Zeit kommt von außen (Sekunden).
"""

from __future__ import annotations

from collections import deque
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
import math
import statistics

ACTIVE = "active"
HELD = "held"
# Toleranz für Zeitvergleiche (Gleitkomma: 0.3 + 1.0 - 0.3 ist nicht genau 1.0).
EPS_S = 1e-6


@dataclass(frozen=True, slots=True)
class Target:
    """Ein Ziel aus einem Sensor-Rahmen."""

    id: int
    x: float
    y: float
    moving: bool | None = None
    type: str | None = None


@dataclass(slots=True)
class TrackerSettings:
    """Einstellungen der Spurbildung (Standardwerte aus den Aufnahmen)."""

    # Größter Abstand, über den ein Ziel mit *anderer* ID eine Spur übernimmt.
    gate_cm: float = 90.0
    # Gehaltene Spuren in Ruhezonen (Bett) dürfen weiter weg übernommen werden:
    # nach einer Weile meldet der Sensor die Person oft mit neuer ID am Bettrand.
    takeover_cm: float = 150.0
    # Schnellste plausible Bewegung (Gehen ~1,5 m/s, großzügig).
    max_speed_cm_s: float = 300.0
    # Gleiche ID, aber Sprung größer als das: als neue Figur behandeln.
    max_jump_cm: float = 250.0
    # Haltezeit gehaltener Spuren, wenn die Raumlogik nichts anderes sagt.
    hold_s: float = 10.0
    # Glättung: Median der Positionen dieses Zeitfensters.
    smooth_s: float = 1.0
    # Ab dieser Strecke in ``motion_s`` Sekunden gilt eine Spur als bewegt,
    # wenn der Sensor selbst nichts dazu sagt.
    motion_cm: float = 30.0
    motion_s: float = 2.0
    # Positionsänderung unter diesem Wert zählt nicht als Bewegung
    # (Rahmen mit gleicher Position kommen in Ruhe etwa alle 10 s).
    still_cm: float = 5.0
    # Zittern herausrechnen (One-Euro-Filter): in Ruhe stark glätten, bei
    # Bewegung fast sofort folgen. 0 = aus. Werte gemessen an vier Nächten:
    # die größten Sprünge im Liegen (90 %-Wert) 27 → 17 cm, „aufgestanden“,
    # Tür und Bettrand ohne jede Verzögerung (die Raumlogik nimmt dafür die
    # rohe Position, siehe ``Room._membership``).
    filter_min_hz: float = 0.3
    # Wie schnell der Filter bei Bewegung aufmacht (je cm/s mehr Hz).
    filter_beta: float = 0.005
    # Glättung der Geschwindigkeitsschätzung.
    filter_d_hz: float = 1.0
    # Längster Zeitschritt, mit dem der Filter rechnet: Nach langer Stille
    # (FP400 schickt in Ruhe minutenlang nichts) soll ein einzelner Ausreißer
    # nicht ungefiltert durchgehen.
    filter_max_dt_s: float = 0.5


@dataclass(slots=True)
class Track:
    """Eine Figur im Raum."""

    track_id: int
    sensor_id: int
    x: float
    y: float
    first_seen: float
    last_seen: float
    last_moved: float
    state: str = ACTIVE
    held_since: float | None = None
    type: str | None = None
    sensor_moving: bool | None = None
    # Wie viele Rahmen in Folge sich die Position geändert hat.
    moves_in_row: int = 0
    # Für die Raumlogik (Hundehinweis, Störquelle, ...)
    tags: set[str] = field(default_factory=set)
    dog_score: float = 0.0
    # Vom Besitzer im Panel gesetzt: ``ich`` (die eigene Figur) oder ``hund``.
    # Lebt nur so lange wie die Spur (nach dem Neuladen ist sie weg).
    markierung: str | None = None
    # Rohe Position vom Sensor (``x``/``y`` sind gefiltert, wenn der Filter an
    # ist). Fangbereich und Bewegungserkennung rechnen mit der rohen Position.
    raw_x: float = 0.0
    raw_y: float = 0.0
    # Zustand des One-Euro-Filters: geschätzte Geschwindigkeit (cm/s).
    vx: float = 0.0
    vy: float = 0.0
    history: deque[tuple[float, float, float]] = field(
        default_factory=lambda: deque(maxlen=64)
    )

    def __post_init__(self) -> None:
        """Rohe Position am Anfang wie die Position."""
        if self.raw_x == 0.0 and self.raw_y == 0.0:
            self.raw_x, self.raw_y = self.x, self.y

    @property
    def visible(self) -> bool:
        """Im letzten Rahmen gesehen."""
        return self.state == ACTIVE

    def smoothed(self, now: float, window_s: float) -> tuple[float, float]:
        """Median der Positionen im Zeitfenster (gegen Einzelsprünge)."""
        pts = [(x, y) for t, x, y in self.history if t >= now - window_s]
        if len(pts) < 3:
            return self.x, self.y
        return (
            statistics.median(p[0] for p in pts),
            statistics.median(p[1] for p in pts),
        )

    def moving(self, now: float, settings: TrackerSettings) -> bool:
        """Gibt an, ob sich die Figur gerade bewegt."""
        if self.sensor_moving is not None and self.visible:
            return self.sensor_moving
        pts = [(x, y) for t, x, y in self.history if t >= now - settings.motion_s]
        if len(pts) < 2:
            return False
        x0, y0 = pts[0]
        return max(math.hypot(x - x0, y - y0) for x, y in pts) >= settings.motion_cm


type HoldTime = Callable[[Track], float]


class Tracker:
    """Ordnet Sensor-Ziele Spuren zu und hält verschwundene Figuren fest."""

    def __init__(
        self,
        settings: TrackerSettings | None = None,
        hold_time: HoldTime | None = None,
        takeover_allowed: Callable[[Track], bool] | None = None,
    ) -> None:
        """``hold_time``/``takeover_allowed`` kommen aus der Raumlogik."""
        self.settings = settings or TrackerSettings()
        self._hold_time = hold_time or (lambda _t: self.settings.hold_s)
        self._takeover_allowed = takeover_allowed or (lambda _t: False)
        self.tracks: dict[int, Track] = {}
        self.available = True
        self.last_frame: float | None = None
        self._next_id = 1
        # Spuren, die beim letzten Aufruf endeten (für Ereignisse).
        self.ended: list[Track] = []

    # -- Zuordnung ---------------------------------------------------------

    def _gate(self, track: Track, now: float) -> float:
        dt = max(0.0, now - track.last_seen)
        base = self.settings.gate_cm
        if track.state == HELD and self._takeover_allowed(track):
            base = max(base, self.settings.takeover_cm)
        return max(
            base, min(self.settings.max_jump_cm, dt * self.settings.max_speed_cm_s)
        )

    def _filter(self, track: Track, target: Target, now: float) -> tuple[float, float]:
        """One-Euro-Filter: Grenzfrequenz steigt mit der Geschwindigkeit.

        Steht die Figur, ist die Grenzfrequenz klein (stark geglättet); bewegt
        sie sich, wird sie groß (fast keine Verzögerung). Rechenaufwand: ein
        paar Multiplikationen je Rahmen.
        """
        s = self.settings
        if s.filter_min_hz <= 0:
            return target.x, target.y
        dt = min(max(now - track.last_seen, 1e-3), s.filter_max_dt_s)

        def alpha(hz: float) -> float:
            tau = 1.0 / (2 * math.pi * hz)
            return 1.0 / (1.0 + tau / dt)

        a_d = alpha(s.filter_d_hz)
        track.vx += a_d * ((target.x - track.x) / dt - track.vx)
        track.vy += a_d * ((target.y - track.y) / dt - track.vy)
        a = alpha(s.filter_min_hz + s.filter_beta * math.hypot(track.vx, track.vy))
        return track.x + a * (target.x - track.x), track.y + a * (target.y - track.y)

    def _assign(self, track: Track, target: Target, now: float) -> None:
        moved = math.hypot(target.x - track.raw_x, target.y - track.raw_y)
        if moved >= self.settings.still_cm:
            track.last_moved = now
            track.moves_in_row += 1
        else:
            track.moves_in_row = 0
        track.sensor_id = target.id
        track.x, track.y = self._filter(track, target, now)
        track.raw_x, track.raw_y = target.x, target.y
        track.last_seen = now
        track.state = ACTIVE
        track.held_since = None
        track.sensor_moving = target.moving
        if target.type is not None:
            track.type = target.type
        track.history.append((now, target.x, target.y))

    def _new_track(self, target: Target, now: float) -> Track:
        track = Track(
            track_id=self._next_id,
            sensor_id=target.id,
            x=target.x,
            y=target.y,
            first_seen=now,
            last_seen=now,
            last_moved=now,
            type=target.type,
            sensor_moving=target.moving,
        )
        track.history.append((now, target.x, target.y))
        self._next_id += 1
        self.tracks[track.track_id] = track
        return track

    def update(self, now: float, targets: Iterable[Target] | None) -> None:
        """Verarbeitet einen Rahmen. ``None`` heißt: Sensor nicht verfügbar."""
        self.ended = []
        if targets is None:
            self.available = False
            return
        self.available = True
        self.last_frame = now
        pending = list(targets)
        free = dict(self.tracks)

        # 1. Gleiche Sensor-ID bei plausiblem Sprung (sichtbare Spuren zuerst).
        for target in list(pending):
            match = next(
                (
                    t
                    for t in sorted(free.values(), key=lambda t: t.state != ACTIVE)
                    if t.sensor_id == target.id
                    and math.hypot(t.raw_x - target.x, t.raw_y - target.y)
                    <= max(self._gate(t, now), self.settings.max_jump_cm)
                ),
                None,
            )
            if match is not None:
                self._assign(match, target, now)
                del free[match.track_id]
                pending.remove(target)

        # 2. ID gewechselt: nächste freie Spur innerhalb des Fangbereichs.
        pairs = sorted(
            (
                (math.hypot(t.raw_x - g.x, t.raw_y - g.y), t.track_id, i)
                for i, g in enumerate(pending)
                for t in free.values()
            ),
        )
        used_targets: set[int] = set()
        for dist, track_id, i in pairs:
            if track_id not in free or i in used_targets:
                continue
            track = free[track_id]
            if dist <= self._gate(track, now):
                self._assign(track, pending[i], now)
                del free[track_id]
                used_targets.add(i)
        pending = [g for i, g in enumerate(pending) if i not in used_targets]

        # 3. Übrige Ziele sind neue Figuren.
        for target in pending:
            self._new_track(target, now)

        # 4. Nicht gesehene Spuren werden gehalten.
        for track in free.values():
            if track.state == ACTIVE:
                track.state = HELD
                track.held_since = now
                track.moves_in_row = 0
        self._expire(now)

    def tick(self, now: float) -> None:
        """Zeit vergeht ohne Rahmen: nur gehaltene Spuren können enden."""
        self.ended = []
        if self.available:
            self._expire(now)

    def _expire(self, now: float) -> None:
        for track in list(self.tracks.values()):
            if track.state != HELD or track.held_since is None:
                continue
            if now - track.held_since + EPS_S >= self._hold_time(track):
                self.ended.append(track)
                del self.tracks[track.track_id]

    def add_placeholder(self, x: float, y: float, now: float, tag: str) -> Track:
        """Gehaltene Spur ohne Sensor-Ziel (z. B. nach einem Neustart)."""
        track = self._new_track(Target(-1, x, y), now)
        track.state = HELD
        track.held_since = now
        track.tags.add(tag)
        return track

    def remove(self, track_id: int) -> Track | None:
        """Spur von außen beenden (z. B. Echo nach dem Aufstehen)."""
        track = self.tracks.pop(track_id, None)
        if track is not None:
            self.ended.append(track)
        return track
