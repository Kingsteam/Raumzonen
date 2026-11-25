"""Raumlogik: Zonen mit Regeln auf den Spuren.

Reines Python ohne Home Assistant. Ein ``Room`` bekommt die Rahmen eines
Sensors (``update``) und regelmäßig die Uhrzeit (``tick``) und meldet,
wann eine Zone belegt oder frei wird (``ZoneEvent``).

Regeln je Zone (``ZoneRule``):

* **belegt nach** ``belegt_nach_s``: so lange muss jemand drin sein.
* **frei nach** ``frei_nach_s``: so lange muss die Zone leer sein.
* **Randstreifen** ``rand_cm``: Hinein zählt ab dem Rand, hinaus erst, wenn
  die Figur weiter als ``rand_cm`` draußen ist (Hysterese gegen Zittern).
* **Schläfer halten** ``schlaefer_halten``: Wer drin liegt, bleibt drin, bis
  er *nachweislich* geht: mehrere bewegte Rahmen draußen
  (``weg_rahmen``), weit draußen (``weg_cm``) oder in einem Ausgang.
  Einzelne Sprünge, Aussetzer und verlorene Ziele lassen die Zone belegt.
* **höchstens Personen** ``max_personen``: Bei 1 werden beim Aufstehen
  zurückbleibende, unbewegte Ziele als Echo verworfen.
* **Hund nicht zählen** ``hund_ignorieren``: Figuren, die vermutlich der
  Hund sind, machen die Zone nicht belegt. Nur ein Hinweis, keine feste
  Regel: Ob eine Figur der Hund ist, ergibt sich aus der Art, die der Sensor
  meldet, oder aus längerem ruhigem Liegen auf einem Hundeplatz.

Arten von Zonen (``Zone.art``):

* ``normal``: eine Zone mit Belegung.
* ``ausgang``: Tür/Durchgang. Gehaltene Spuren enden hier schnell (die Figur
  hat den Raum verlassen); verlässt jemand eine Schläferzone in Richtung
  Ausgang, gilt das sofort als Weggehen.
* ``hundeplatz``: Hinweis für die Hunderkennung (der Hund wandert).
* ``stoerquelle``: Ziele hier zählen nirgends (Vorhang, Ventilator, ...).
* ``stelle``: markierte Stelle (z. B. Ofenstelle). Belegt, wenn dort ein
  Ziel steht; filtert nichts und wirkt auf keine andere Zone.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass, field
import math

from .geometry import Shape, inner_point
from .tracks import EPS_S, HELD, Target, Track, Tracker, TrackerSettings

ART_NORMAL = "normal"
ART_AUSGANG = "ausgang"
ART_HUNDEPLATZ = "hundeplatz"
ART_STOERQUELLE = "stoerquelle"
# Markierte Stelle (z. B. Ofenstelle): meldet, ob dort ein Ziel steht, und
# filtert nichts. Ob das eine Störung ist, entscheidet ein Abnehmer.
ART_STELLE = "stelle"
# Durchgangsbereich (Gang, Bereich vor dem Schrank): zählt wie eine normale
# Zone, ist aber kein Platz zum Verweilen. Abnehmer erkennen daran Wege.
ART_DURCHGANG = "durchgang"
ZONE_ARTEN = (
    ART_NORMAL,
    ART_AUSGANG,
    ART_HUNDEPLATZ,
    ART_STOERQUELLE,
    ART_STELLE,
    ART_DURCHGANG,
)

TAG_HUND = "hund"
TAG_STOERUNG = "stoerung"
TAG_ECHO = "echo"
# Platzhalter für eine Figur, die vor einem Neustart in einer Schläferzone lag.
TAG_WIEDERHERGESTELLT = "wiederhergestellt"
# Ein Ziel, das sich so lange nicht bewegt hat, kann beim Aufstehen ein Echo sein.
ECHO_STILL_S = 3.0
# So lange nach dem Verlassen des Betts zählt der Weg zur Tür noch als Aufstehen.
ECHO_WINDOW_S = 10.0

# Sensor-Arten, die sicher keine Person sind (Zigbee2MQTT-Konverter).
NOT_PERSON = frozenset(
    {"not_person", "fan", "curtain", "plant", "vacuum", "air_purifier"}
)


@dataclass(slots=True)
class ZoneRule:
    """Regeln einer Zone."""

    belegt_nach_s: float = 1.0
    frei_nach_s: float = 5.0
    rand_cm: float = 20.0
    schlaefer_halten: bool = False
    weg_rahmen: int = 3
    weg_cm: float = 60.0
    max_personen: int = 0
    hund_ignorieren: bool = False


@dataclass(slots=True)
class Zone:
    """Eine Fläche im Raum mit Regeln."""

    id: str
    name: str
    shape: Shape
    art: str = ART_NORMAL
    rule: ZoneRule = field(default_factory=ZoneRule)


@dataclass(slots=True)
class ZoneState:
    """Zustand einer Zone."""

    occupied: bool = False
    changed_at: float | None = None
    count: int = 0
    track_ids: frozenset[int] = frozenset()
    pending_since: float | None = None
    empty_since: float | None = None
    # Die letzte Figur ging durch einen Ausgang (Schläferzonen).
    left_via_exit: bool = False


@dataclass(frozen=True, slots=True)
class ZoneEvent:
    """Zone wurde belegt oder frei."""

    t: float
    zone_id: str
    occupied: bool
    reason: str = ""


@dataclass(slots=True)
class RoomSettings:
    """Einstellungen des Raums (zusätzlich zur Spurbildung)."""

    # Gehaltene Spuren im Ausgang enden nach so vielen Sekunden.
    exit_hold_s: float = 1.0
    # Hunderkennung: so viele Sekunden ruhig auf einem Hundeplatz.
    dog_after_s: float = 60.0


class Room:
    """Ein Raum mit einem Sensor und mehreren Zonen."""

    def __init__(
        self,
        zones: Iterable[Zone],
        tracker_settings: TrackerSettings | None = None,
        settings: RoomSettings | None = None,
    ) -> None:
        """Legt den Raum an; die Zonen-IDs müssen eindeutig sein."""
        self.zones: dict[str, Zone] = {}
        for zone in zones:
            if zone.id in self.zones:
                raise ValueError(f"Zone {zone.id!r} doppelt")
            if zone.art not in ZONE_ARTEN:
                raise ValueError(f"Unbekannte Zonenart {zone.art!r}")
            self.zones[zone.id] = zone
        self.settings = settings or RoomSettings()
        self.tracker = Tracker(
            tracker_settings,
            hold_time=self._hold_time,
            takeover_allowed=self._in_sleeper_zone,
        )
        self.states: dict[str, ZoneState] = {z: ZoneState() for z in self.zones}
        # (zone_id, track_id) → drin?
        self._inside: dict[tuple[str, int], bool] = {}
        # Sensor-IDs, deren Ziel an dieser Stelle als Echo gilt.
        self._suppressed: dict[int, tuple[float, float]] = {}
        # Spur → (Schläferzone, Zeit), die sie zuletzt verlassen hat.
        self._left_sleeper: dict[int, tuple[str, float]] = {}
        self._last_t: float | None = None

    # -- Hilfen für den Tracker -------------------------------------------

    def _in_sleeper_zone(self, track: Track) -> bool:
        return any(
            self._inside.get((z.id, track.track_id))
            for z in self.zones.values()
            if z.rule.schlaefer_halten
        )

    def _in_exit(self, track: Track) -> bool:
        return any(
            z.shape.contains(track.x, track.y)
            for z in self.zones.values()
            if z.art == ART_AUSGANG
        )

    def _hold_time(self, track: Track) -> float:
        if self._in_sleeper_zone(track):
            return math.inf
        if self._in_exit(track):
            return self.settings.exit_hold_s
        return self.tracker.settings.hold_s

    # -- Ablauf -------------------------------------------------------------

    @property
    def available(self) -> bool:
        """Gibt an, ob Daten vom Sensor kommen."""
        return self.tracker.available

    def update(self, now: float, targets: Iterable[Target] | None) -> list[ZoneEvent]:
        """Ein Rahmen vom Sensor (``None`` = Sensor nicht verfügbar)."""
        if targets is not None:
            targets = [t for t in targets if not self._is_suppressed(t)]
            self._drop_placeholders()
        self.tracker.update(now, targets)
        return self._evaluate(now)

    def restore(self, zone_id: str, now: float) -> None:
        """Zone war vor einem Neustart belegt: so weitermachen.

        In einer Schläferzone wird eine gehaltene Platzhalter-Figur gesetzt,
        denn der Sensor meldet einen ruhig Liegenden womöglich lange nicht.
        Der erste echte Rahmen ersetzt den Platzhalter; liegt dann niemand in
        der Zone, wird sie nach ``frei_nach_s`` frei.
        """
        zone = self.zones[zone_id]
        state = self.states[zone_id]
        state.occupied = True
        state.changed_at = now
        if zone.rule.schlaefer_halten and self.tracker.last_frame is None:
            x, y = inner_point(zone.shape)
            track = self.tracker.add_placeholder(x, y, now, TAG_WIEDERHERGESTELLT)
            self._inside[(zone_id, track.track_id)] = True
        self._evaluate(now)

    def _drop_placeholders(self) -> None:
        for track in list(self.tracker.tracks.values()):
            if TAG_WIEDERHERGESTELLT in track.tags:
                del self.tracker.tracks[track.track_id]
                for key in [k for k in self._inside if k[1] == track.track_id]:
                    del self._inside[key]

    @property
    def figure_count(self) -> int:
        """Figuren im Raum (ohne Störquellen und Platzhalter)."""
        return sum(
            1
            for t in self.tracker.tracks.values()
            if not t.tags & {TAG_STOERUNG, TAG_WIEDERHERGESTELLT}
        )

    def tick(self, now: float) -> list[ZoneEvent]:
        """Zeit vergeht ohne Rahmen."""
        self.tracker.tick(now)
        return self._evaluate(now)

    def _is_suppressed(self, target: Target) -> bool:
        pos = self._suppressed.get(target.id)
        if pos is None:
            return False
        if (
            math.hypot(target.x - pos[0], target.y - pos[1])
            <= 2 * self.tracker.settings.still_cm
        ):
            return True
        # Das Ziel hat sich bewegt: ab jetzt wieder echt.
        del self._suppressed[target.id]
        return False

    def _update_tags(self, track: Track, dt: float, now: float) -> None:
        if track.type in NOT_PERSON or any(
            z.shape.contains(track.x, track.y)
            for z in self.zones.values()
            if z.art == ART_STOERQUELLE
        ):
            track.tags.add(TAG_STOERUNG)
        else:
            track.tags.discard(TAG_STOERUNG)
        on_dog_place = any(
            z.shape.contains(track.x, track.y)
            for z in self.zones.values()
            if z.art == ART_HUNDEPLATZ
        )
        moving = track.moving(now, self.tracker.settings)
        if on_dog_place and not moving:
            track.dog_score = min(track.dog_score + dt, 4 * self.settings.dog_after_s)
        elif not on_dog_place and moving:
            track.dog_score = max(0.0, track.dog_score - 2 * dt)
        if track.type == "pet" or track.dog_score >= self.settings.dog_after_s:
            track.tags.add(TAG_HUND)
        elif track.type == "person" or track.dog_score == 0:
            track.tags.discard(TAG_HUND)

    def _membership(self, zone: Zone, track: Track) -> bool:
        key = (zone.id, track.track_id)
        before = self._inside.get(key, False)
        if track.state == HELD:
            return before
        d = zone.shape.distance(track.x, track.y)
        if d <= 0:
            return True
        if not before:
            return False
        rule = zone.rule
        if rule.schlaefer_halten and self._in_exit(track):
            # Aus dem Bett direkt in die Tür: sofort weg, auch im Randstreifen.
            return False
        if d <= rule.rand_cm:
            return True
        if not rule.schlaefer_halten:
            return False
        # Schläfer: nur mit Beweis hinaus.
        return not (
            track.moves_in_row >= rule.weg_rahmen or d > rule.rand_cm + rule.weg_cm
        )

    def _evaluate(self, now: float) -> list[ZoneEvent]:
        dt = 0.0 if self._last_t is None else max(0.0, now - self._last_t)
        self._last_t = now
        events: list[ZoneEvent] = []
        tracks = list(self.tracker.tracks.values())
        live = {t.track_id for t in tracks}
        for key in [k for k in self._inside if k[1] not in live]:
            del self._inside[key]
        for track_id in [k for k in self._left_sleeper if k not in live]:
            del self._left_sleeper[track_id]
        for track in tracks:
            self._update_tags(track, dt, now)

        for zone in self.zones.values():
            for track in tracks:
                key = (zone.id, track.track_id)
                was = self._inside.get(key, False)
                now_in = self._membership(zone, track)
                self._inside[key] = now_in
                if was and not now_in and zone.rule.schlaefer_halten:
                    self._left_sleeper[track.track_id] = (zone.id, now)

        # Echo: Wer aus einer Ein-Personen-Schläferzone zur Tür geht, lässt
        # kein unbewegtes Ziel im Bett zurück. Nur bei Weg zur Tür, denn ein
        # Weg in den Raum kann auch der Hund sein, der aufsteht.
        for track in tracks:
            left = self._left_sleeper.get(track.track_id)
            if left is None:
                continue
            zone_id, since = left
            if now - since > ECHO_WINDOW_S:
                del self._left_sleeper[track.track_id]
                continue
            if self._in_exit(track):
                del self._left_sleeper[track.track_id]
                # Durch die Tür: nicht noch „frei nach“ abwarten.
                self.states[zone_id].left_via_exit = True
                if self.zones[zone_id].rule.max_personen == 1:
                    self._drop_echoes(zone_id, track, now)

        for zone in self.zones.values():
            events += self._zone_step(zone, now)
        return events

    def _drop_echoes(self, zone_id: str, leaver: Track, now: float) -> None:
        for track in list(self.tracker.tracks.values()):
            if track is leaver or not self._inside.get((zone_id, track.track_id)):
                continue
            if TAG_HUND in track.tags or now - track.last_moved < ECHO_STILL_S:
                continue
            track.tags.add(TAG_ECHO)
            self._suppressed[track.sensor_id] = (track.x, track.y)
            self.tracker.remove(track.track_id)
            for key in [k for k in self._inside if k[1] == track.track_id]:
                del self._inside[key]

    def tracks_in_zone(self, zone_id: str) -> list[Track]:
        """Alle Spuren, die gerade in der Zone stehen (auch Hund, Störung)."""
        return [
            t
            for t in self.tracker.tracks.values()
            if self._inside.get((zone_id, t.track_id))
            and TAG_WIEDERHERGESTELLT not in t.tags
        ]

    def zones_of_track(self, track_id: int) -> list[str]:
        """Zonen, in denen eine Spur gerade steht."""
        return [z for z in self.zones if self._inside.get((z, track_id))]

    def _counting(self, zone: Zone) -> list[Track]:
        out = []
        for track in self.tracker.tracks.values():
            if not self._inside.get((zone.id, track.track_id)):
                continue
            if TAG_STOERUNG in track.tags and zone.art != ART_STOERQUELLE:
                continue
            if zone.rule.hund_ignorieren and TAG_HUND in track.tags:
                continue
            out.append(track)
        return out

    def _zone_step(self, zone: Zone, now: float) -> list[ZoneEvent]:
        state = self.states[zone.id]
        counting = self._counting(zone)
        state.count = len(counting)
        state.track_ids = frozenset(t.track_id for t in counting)
        rule = zone.rule
        via_exit, state.left_via_exit = state.left_via_exit, False
        if not state.occupied:
            state.empty_since = None
            if not counting:
                state.pending_since = None
                return []
            if state.pending_since is None:
                state.pending_since = now
            if now - state.pending_since + EPS_S >= rule.belegt_nach_s:
                state.occupied = True
                state.changed_at = now
                state.pending_since = None
                return [ZoneEvent(now, zone.id, True, "betreten")]
            return []
        state.pending_since = None
        if counting:
            state.empty_since = None
            return []
        if state.empty_since is None:
            state.empty_since = now
        if via_exit or now - state.empty_since + EPS_S >= rule.frei_nach_s:
            state.occupied = False
            state.changed_at = now
            state.empty_since = None
            return [
                ZoneEvent(now, zone.id, False, "ausgang" if via_exit else "verlassen")
            ]
        return []

    def advance(self, until: float) -> list[ZoneEvent]:
        """Alle Zeitregeln bis ``until`` genau zur fälligen Zeit auslösen."""
        events: list[ZoneEvent] = []
        last = None
        while (deadline := self.next_deadline()) is not None and deadline <= until:
            if last is not None and deadline <= last:
                break  # Sicherheitsnetz: nie endlos warten
            last = deadline
            events += self.tick(deadline)
        return events

    def next_deadline(self) -> float | None:
        """Nächster Zeitpunkt, zu dem sich ohne Rahmen etwas ändern kann."""
        times = []
        for zone_id, state in self.states.items():
            rule = self.zones[zone_id].rule
            if state.pending_since is not None:
                times.append(state.pending_since + rule.belegt_nach_s)
            if state.empty_since is not None:
                times.append(state.empty_since + rule.frei_nach_s)
        if not self.tracker.available:
            # Bei Ausfall enden keine Spuren; das wartet auf den nächsten Rahmen.
            return min(times) if times else None
        for track in self.tracker.tracks.values():
            if track.state == HELD and track.held_since is not None:
                hold = self._hold_time(track)
                if math.isfinite(hold):
                    times.append(track.held_since + hold)
        return min(times) if times else None
