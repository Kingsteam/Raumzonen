"""Ein Raum im Betrieb: Rahmen empfangen, Rechenkern füttern, Zeit planen.

Liest nur. Schaltet nichts im Haus. Meldet Änderungen an die Entitäten und
als Ereignis ``raumzonen_zone`` für eigene Automationen.

Quellen der Rahmen:

* **MQTT** (empfohlen): Zustandsmeldung von Zigbee2MQTT, mit Bewegung und
  Art der Ziele. Ein Rahmen zählt nur, wenn ``tracking_last_update`` neu ist.
  Verfügbarkeit über ``<thema>/availability``.
* **Entitäten**: ``sensor.*_targets_xy`` und ``sensor.*_tracking_last_update``
  des Geräts; jede neue Zeit in ``tracking_last_update`` ist ein Rahmen.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
import json
from typing import Any

from homeassistant.components import mqtt
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_state_change_event,
)
from homeassistant.util import dt as dt_util

from .aufnahme import Aufnahme
from .const import DOMAIN, EVENT_ZONE, LOGGER, QUELLE_MQTT
from .core.fp400 import (
    parse_availability,
    parse_payload,
    parse_targets_xy,
    raw_targets,
    reported_count,
)
from .core.heat import HeatMap
from .core.room import TAG_WIEDERHERGESTELLT, Room, ZoneEvent
from .core.tracks import HELD, Target
from .discovery import find_fp400_entities
from .model import RaumConfig


class RoomController:
    """Verbindet einen ``Room`` mit seinem Sensor."""

    def __init__(self, hass: HomeAssistant, raum: RaumConfig, room: Room) -> None:
        """Noch ohne Verbindung; ``async_start`` verbindet."""
        self.hass = hass
        self.raum = raum
        self.room = room
        self.last_reason: dict[str, str] = {}
        self.frames = 0
        self.last_frame_at: datetime | None = None
        self.problem: str | None = None
        self._last_stamp: str | None = None
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._timer: CALLBACK_TYPE | None = None
        # Für das Panel: letzte Rohziele und die Bewegungskarte (nur Speicher).
        self.last_targets: list[Target] | None = None
        # Die Karte überlebt das Neuladen der Integration (z. B. nach dem
        # Speichern im Panel), aber keinen Neustart von Home Assistant.
        self.heat: HeatMap = hass.data.setdefault(f"{DOMAIN}_heat", {}).setdefault(
            raum.id, HeatMap()
        )
        self._last_frame_t: float | None = None
        # Für Abnehmer (Schnittstelle raumzonen/1)
        self.started_at = dt_util.utcnow()
        # Zeit des ersten Rahmens nach dem Laden (Spuren davor: nicht neu).
        self.first_frame_t: float | None = None
        self.unvollstaendig: bool | None = None
        self.last_raw: dict[int, dict[str, Any]] = {}
        self.aufnahme: Aufnahme | None = (
            Aufnahme(hass, raum.id, raum.aufnahme_tage) if raum.aufnahme else None
        )

    # -- Lebenszyklus --------------------------------------------------------

    async def async_start(self) -> None:
        """Verbindet die Quelle. Fehler legen nur diesen Raum lahm."""
        if self.aufnahme is not None:
            self.aufnahme.async_start()
        try:
            if self.raum.sensor.quelle == QUELLE_MQTT:
                await self._async_start_mqtt()
            else:
                self._start_entities()
        except Exception as err:
            self.problem = f"Sensor nicht verbunden: {err}"
            LOGGER.warning("Raum %s: %s", self.raum.name, self.problem)
            self._notify()

    async def async_shutdown(self) -> None:
        """Trennt alles und schreibt die Aufnahme zu Ende."""
        self.async_stop()
        if self.aufnahme is not None:
            await self.aufnahme.async_stop()

    @callback
    def async_stop(self) -> None:
        """Trennt alles."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._timer is not None:
            self._timer()
            self._timer = None

    async def _async_start_mqtt(self) -> None:
        topic = self.raum.sensor.mqtt_topic
        if not await mqtt.async_wait_for_mqtt_client(self.hass):
            raise RuntimeError("MQTT ist nicht eingerichtet")
        self._unsubs.append(
            await mqtt.async_subscribe(self.hass, topic, self._on_mqtt_state)
        )
        self._unsubs.append(
            await mqtt.async_subscribe(
                self.hass, f"{topic}/availability", self._on_mqtt_availability
            )
        )

    def _start_entities(self) -> None:
        found = find_fp400_entities(self.hass, self.raum.sensor.device_id)
        if found.targets_xy is None or found.last_update is None:
            raise RuntimeError(
                "Entitäten targets_xy/tracking_last_update am Gerät nicht gefunden "
                "(in Zigbee2MQTT sind sie anfangs deaktiviert)"
            )
        xy_id, clock_id = found.targets_xy, found.last_update

        @callback
        def _on_change(event: Event[EventStateChangedData]) -> None:
            new = event.data["new_state"]
            if new is None:
                return
            if new.state == STATE_UNAVAILABLE:
                self._frame(None)
                return
            if event.data["entity_id"] != clock_id or new.state == self._last_stamp:
                return
            self._last_stamp = new.state
            xy = self.hass.states.get(xy_id)
            self._frame_from_xy(xy.state if xy else None)

        self._unsubs.append(
            async_track_state_change_event(self.hass, [xy_id, clock_id], _on_change)
        )
        # Stand beim Start als ersten Rahmen nehmen (Home Assistant kennt ihn).
        xy = self.hass.states.get(xy_id)
        if xy is not None and xy.state not in ("unknown", ""):
            clock = self.hass.states.get(clock_id)
            self._last_stamp = clock.state if clock else None
            self._frame_from_xy(xy.state)

    # -- Empfang ---------------------------------------------------------------

    @callback
    def _on_mqtt_state(self, msg: mqtt.ReceiveMessage) -> None:
        try:
            payload = json.loads(msg.payload)
            parsed = parse_payload(payload) if isinstance(payload, dict) else None
        except (ValueError, TypeError, KeyError) as err:
            LOGGER.debug("Raum %s: Meldung unlesbar: %s", self.raum.name, err)
            return
        if parsed is None:
            return
        stamp, targets = parsed
        if stamp == self._last_stamp:
            return  # alter Rahmen, nur mit anderer Änderung neu verschickt
        self._last_stamp = stamp
        self._frame(targets, raw_targets(payload), reported_count(payload))

    @callback
    def _on_mqtt_availability(self, msg: mqtt.ReceiveMessage) -> None:
        online = parse_availability(str(msg.payload))
        if online is False:
            self._frame(None)

    def _frame_from_xy(self, state: str | None) -> None:
        try:
            targets = parse_targets_xy(state)
        except ValueError as err:
            LOGGER.debug("Raum %s: %s", self.raum.name, err)
            return
        self._frame(targets)

    @callback
    def _frame(
        self,
        targets: list[Target] | None,
        raw: list[dict[str, Any]] | None = None,
        gemeldet: int | None = None,
    ) -> None:
        if targets is not None:
            if raw is None:
                raw = [{"id": t.id, "x": t.x, "y": t.y} for t in targets]
            self.last_raw = {r["id"]: r for r in raw if "id" in r}
            self.unvollstaendig = None if gemeldet is None else gemeldet > len(targets)
            pose = self.raum.sensor.pose
            targets = [pose.target_to_room(t) for t in targets]
        now = dt_util.utcnow()
        t = now.timestamp()
        self._count_heat(t)
        events = self.room.advance(t)
        events += self.room.update(t, targets)
        if targets is not None:
            self.frames += 1
            self.last_frame_at = now
            self.problem = None
            self.last_targets = targets
            self._last_frame_t = t
            if self.first_frame_t is None:
                self.first_frame_t = t
        else:
            self._last_frame_t = None
        if self.aufnahme is not None:
            s = self.raum.sensor
            self.aufnahme.add(
                now,
                raw if targets is not None else None,
                gemeldet,
                list(self.room.tracker.tracks.values()),
                (s.x, s.y, s.winkel),
            )
        self._handle(events)

    def _count_heat(self, now: float) -> None:
        """Seit dem letzten Rahmen waren die sichtbaren Figuren dort, wo sie waren."""
        if self._last_frame_t is None:
            return
        points = [
            (track.x, track.y)
            for track in self.room.tracker.tracks.values()
            if track.visible and TAG_WIEDERHERGESTELLT not in track.tags
        ]
        self.heat.add(now, points, now - self._last_frame_t)

    @callback
    def _on_timer(self, now: datetime) -> None:
        self._timer = None
        self._handle(self.room.advance(now.timestamp()))

    @callback
    def _handle(self, events: list[ZoneEvent]) -> None:
        for event in events:
            zone = self.room.zones[event.zone_id]
            self.last_reason[event.zone_id] = event.reason
            self.hass.bus.async_fire(
                EVENT_ZONE,
                {
                    "raum_id": self.raum.id,
                    "raum": self.raum.name,
                    "zone_id": zone.id,
                    "zone": zone.name,
                    "belegt": event.occupied,
                    "grund": event.reason,
                },
            )
        self._schedule()
        self._notify()

    def _schedule(self) -> None:
        if self._timer is not None:
            self._timer()
            self._timer = None
        deadline = self.room.next_deadline()
        if deadline is None:
            return
        self._timer = async_track_point_in_utc_time(
            self.hass, self._on_timer, datetime.fromtimestamp(deadline, UTC)
        )

    # -- Für Entitäten ---------------------------------------------------------

    @callback
    def restore_zone(self, zone_id: str) -> None:
        """Zone war vor dem Neustart belegt (von der Entität gemeldet)."""
        if zone_id in self.room.zones and not self.room.states[zone_id].occupied:
            self.room.restore(zone_id, dt_util.utcnow().timestamp())
            self._schedule()
            self._notify()

    @callback
    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Benachrichtigung bei jeder Auswertung (Entitäten prüfen selbst)."""
        self._listeners.append(listener)

        def _remove() -> None:
            self._listeners.remove(listener)

        return _remove

    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    def live(self, trail_s: float = 6.0) -> dict[str, Any]:
        """Momentaufnahme für das Panel (Positionen nur hier, nie in Entitäten)."""
        now = dt_util.utcnow().timestamp()
        tracks = []
        for track in self.room.tracker.tracks.values():
            tracks.append(
                {
                    "id": track.track_id,
                    "sensor_id": track.sensor_id,
                    "x": round(track.x, 1),
                    "y": round(track.y, 1),
                    "gehalten": track.state == HELD,
                    "bewegt": track.moving(now, self.room.tracker.settings),
                    "art": track.type,
                    "tags": sorted(track.tags),
                    "spur": [
                        [round(x, 1), round(y, 1)]
                        for t, x, y in track.history
                        if t >= now - trail_s
                    ],
                }
            )
        age = None
        if self.last_frame_at is not None:
            age = round(now - self.last_frame_at.timestamp(), 1)
        return {
            "raum_id": self.raum.id,
            "verfuegbar": self.room.available,
            "problem": self.problem,
            "rahmen": self.frames,
            "letzter_rahmen_vor_s": age,
            "figuren": tracks,
            "ziele": [
                [t.id, round(t.x, 1), round(t.y, 1)] for t in self.last_targets or []
            ],
            "zonen": {
                zone_id: {
                    "belegt": state.occupied,
                    "personen": state.count,
                    "grund": self.last_reason.get(zone_id),
                }
                for zone_id, state in self.room.states.items()
            },
        }

    def heat_cells(self, minutes: float) -> dict[str, Any]:
        """Bewegungskarte der letzten Minuten für das Panel."""
        cells = self.heat.query(dt_util.utcnow().timestamp(), minutes)
        return {
            "zelle_cm": self.heat.cell_cm,
            "minuten": minutes,
            "zellen": [[i, j, round(s, 1)] for (i, j), s in cells.items()],
        }

    def diagnostics(self) -> dict[str, Any]:
        """Zustand für Diagnose (ohne Positionen)."""
        return {
            "verfuegbar": self.room.available,
            "rahmen": self.frames,
            "problem": self.problem,
            "figuren": self.room.figure_count,
            "zonen": {
                z: {"belegt": s.occupied, "personen": s.count}
                for z, s in self.room.states.items()
            },
        }
