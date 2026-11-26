"""Simulierter Aqara FP400 für die Testinstanz (wird nicht ausgeliefert).

Spielt anonymisierte Aufnahmen (aus ``RAUMZONEN_AUFNAHMEN``, sonst eine
erfundene Szene) in einer Schleife ab, über dieselben Entitäten wie der erweiterte Zigbee2MQTT-Konverter:
``sensor.*_targets_xy``, ``sensor.*_tracking_last_update`` und
``text.*_software_zone_N_config``. Lange Pausen werden auf wenige Sekunden
gekürzt, damit es im Panel etwas zu sehen gibt.

Dazu ein zweiter Sensor „Simulierter FP400 Flur“: eine erfundene Figur geht
den Flur entlang und wieder zurück (für den Hausplan mit zwei Räumen), und
zwei Bewegungsmelder (Küche, Bad) für Räume nur mit Meldern.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
import json
import math
import os
from pathlib import Path

from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.typing import ConfigType

DOMAIN = "raumzonen_sim"
SIGNAL = f"{DOMAIN}_frame"
CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)
PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR, Platform.TEXT]
DATEN = Path(__file__).resolve().parents[4] / "tests" / "daten"
# Ausschnitt um jedes Aufstehen: so viele Sekunden davor und danach.
VORHER_S = 90.0
NACHHER_S = 45.0
MAX_PAUSE_S = 4.0


# Erfundene Szene im Schlafzimmer (Sensorkoordinaten, cm), falls keine
# Aufnahmen da sind: Tür → Bett, liegen, aufstehen, hinaus, kurz leer.
TUER = (-55.0, 31.0)
BETT = (-122.0, 192.0)


def _szene() -> list[tuple[float, list[list[float]]]]:
    rows: list[tuple[float, list[list[float]]]] = []
    t = 0.0

    def gehen(a: tuple[float, float], b: tuple[float, float], dauer: float) -> None:
        nonlocal t
        schritte = int(dauer / 0.3)
        for i in range(schritte + 1):
            f = i / schritte
            rows.append((t, [[0, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]]))
            t += 0.3

    gehen(TUER, BETT, 4.0)
    for i in range(80):  # liegen: kleine Sprünge, ab und zu eine Pause
        rows.append(
            (t, [[0, BETT[0] + 4 * math.sin(i), BETT[1] + 3 * math.cos(i * 1.7)]])
        )
        t += 3.5 if i % 15 == 14 else 0.5
    gehen(BETT, TUER, 2.4)
    for _ in range(10):
        rows.append((t, []))
        t += 0.5
    return rows


def _ordner() -> list[Path]:
    """Aufnahmen: aus RAUMZONEN_AUFNAHMEN (privat) oder tests/daten."""
    env = os.environ.get("RAUMZONEN_AUFNAHMEN")
    return [Path(env)] if env else [DATEN]


def _ausschnitte() -> list[list[tuple[float, list[list[float]]]]]:
    """Abschnitte rund um die beschrifteten Ereignisse aller Aufnahmen."""
    out = []
    paths = [p for d in _ordner() for p in sorted(d.glob("*-nacht-*.json"))]
    for path in paths:
        data = json.loads(path.read_text(encoding="utf-8"))
        for ereignis in data.get("ereignisse", []):
            t0 = ereignis["t"]
            rows = [
                (t, targets)
                for t, targets in data["rahmen"]
                if t0 - VORHER_S <= t <= t0 + NACHHER_S and targets is not None
            ]
            if len(rows) > 20:
                out.append(rows)
    if not out:
        # Ohne Aufnahmen (öffentliches Repo): die erfundene Szene.
        out.append(_szene())
    return out


class Player:
    """Spielt die Abschnitte nacheinander ab und meldet jeden Rahmen."""

    key = "fp400"

    def __init__(
        self, hass: HomeAssistant, parts: list[list[tuple[float, list[list[float]]]]]
    ) -> None:
        self.hass = hass
        self.parts = parts
        self.part = 0
        self.index = 0
        self.targets = "none"
        self.stamp = ""
        self._cancel = None

    @callback
    def start(self) -> None:
        if self.parts:
            self._cancel = async_call_later(self.hass, 1, self._step)

    @callback
    def stop(self) -> None:
        if self._cancel:
            self._cancel()
            self._cancel = None

    @callback
    def _step(self, _now: datetime | None = None) -> None:
        rows = self.parts[self.part]
        t, targets = rows[self.index]
        self.targets = (
            ";".join(f"{int(i)}:{round(x)}:{round(y)}" for i, x, y in targets) or "none"
        )
        self.stamp = datetime.now(UTC).isoformat(timespec="milliseconds")
        async_dispatcher_send(self.hass, f"{SIGNAL}_{self.key}")
        self.index += 1
        if self.index >= len(rows):
            self.index = 0
            self.part = (self.part + 1) % len(self.parts)
            wait = 3.0
        else:
            wait = min(MAX_PAUSE_S, max(0.1, rows[self.index][0] - t))
        self._cancel = async_call_later(self.hass, timedelta(seconds=wait), self._step)


# Weg im Flur in Sensorkoordinaten (cm): Der Sensor hängt an der Stirnseite
# und schaut den Flur entlang. Erfunden, keine Aufnahme.
FLUR_WEG = [(0.0, 60.0), (10.0, 400.0)]
FLUR_SCHRITT_S = 0.4
FLUR_CM_S = 80.0


class Walker:
    """Eine Figur geht den Flur hin und zurück, dazwischen kurze Pausen."""

    key = "fp400_flur"

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.targets = "none"
        self.stamp = ""
        self.t = 0.0
        self._cancel = None

    @callback
    def start(self) -> None:
        self._cancel = async_call_later(self.hass, 1, self._step)

    @callback
    def stop(self) -> None:
        if self._cancel:
            self._cancel()
            self._cancel = None

    def position(self, t: float) -> tuple[float, float] | None:
        (x0, y0), (x1, y1) = FLUR_WEG
        weg_s = math.hypot(x1 - x0, y1 - y0) / FLUR_CM_S
        runde = 2 * weg_s + 12  # hin, 4 s Pause, zurück, 8 s niemand da
        u = t % runde
        if u < weg_s:
            f = u / weg_s
        elif u < weg_s + 4:
            f = 1.0
        elif u < 2 * weg_s + 4:
            f = 1 - (u - weg_s - 4) / weg_s
        else:
            return None
        wobble = 6 * math.sin(t * 3)
        return x0 + (x1 - x0) * f + wobble, y0 + (y1 - y0) * f

    @callback
    def _step(self, _now: datetime | None = None) -> None:
        self.t += FLUR_SCHRITT_S
        pos = self.position(self.t)
        self.targets = "none" if pos is None else f"0:{round(pos[0])}:{round(pos[1])}"
        self.stamp = datetime.now(UTC).isoformat(timespec="milliseconds")
        async_dispatcher_send(self.hass, f"{SIGNAL}_{self.key}")
        self._cancel = async_call_later(
            self.hass, timedelta(seconds=FLUR_SCHRITT_S), self._step
        )


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Legt den Eintrag beim ersten Start von selbst an."""
    if DOMAIN in config and not hass.config_entries.async_entries(DOMAIN):
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN, context={"source": SOURCE_IMPORT}
            )
        )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    players = [
        Player(hass, await hass.async_add_executor_job(_ausschnitte)),
        Walker(hass),
    ]
    entry.runtime_data = players
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    for player in players:
        player.start()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    for player in entry.runtime_data:
        player.stop()
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
