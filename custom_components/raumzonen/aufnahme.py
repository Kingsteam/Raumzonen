"""Eigene Aufnahme der Rohpositionen und Spuren je Raum (nicht im Recorder).

Ablage: ``<config>/raumzonen/aufnahmen/<raum_id>/JJJJ-MM-TT.jsonl.gz``, je
Tag eine Datei (Ortszeit), eine Zeile je Rahmen im Format
``fp400-trace/2`` (siehe ``docs/DATENFORMAT.md``). Dateien älter als
``aufnahme_tage`` werden gelöscht. Die Daten bleiben lokal und sind nur für
Admins abrufbar (WebSocket ``raumzonen/aufnahme/get``); sie kommen nie ins
Repo (dort nur anonymisiert, ``fp400-trace/1``).

Aufgezeichnet wird **vor** jeder Filterung (Echo, Störquelle): die Rohziele
in Sensorkoordinaten, dazu die Spuren von Raumzonen in Raumkoordinaten.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
import gzip
import json
from pathlib import Path
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .const import DOMAIN, LOGGER
from .core.auswertung import MAX_RUHE_S, Auswertung
from .core.geometry import Shape
from .core.tracks import HELD, Track

FORMAT = "fp400-trace/2"
FLUSH_EVERY = timedelta(seconds=10)
# Höchstens so viel auf einmal abrufen (schützt Browser und Speicher).
MAX_ABRUF = timedelta(hours=24)
MAX_ZEILEN = 200_000
_ZEIT = '{"zeit":"'


def aufnahme_dir(hass: HomeAssistant, raum_id: str) -> Path:
    """Ordner der Aufnahmen eines Raums."""
    return Path(hass.config.path(DOMAIN, "aufnahmen", raum_id))


def spur_id(raum_id: str, track: Track) -> str:
    """Kennung einer Spur nach außen (stabil bis zum nächsten Neuladen)."""
    return f"{raum_id}-{track.track_id}"


class Aufnahme:
    """Puffert Rahmen und schreibt sie gebündelt (alle 10 s) auf die Platte."""

    def __init__(self, hass: HomeAssistant, raum_id: str, tage: int) -> None:
        """Noch ohne Zeitgeber; ``async_start`` startet."""
        self.hass = hass
        self.raum_id = raum_id
        self.tage = tage
        self.folder = aufnahme_dir(hass, raum_id)
        self._buffer: list[tuple[date, dict[str, Any]]] = []
        self._header_for: set[date] = set()
        self._pose: tuple[float, float, float] | None = None
        self._unsub: CALLBACK_TYPE | None = None
        self._last_prune: date | None = None

    @callback
    def async_start(self) -> None:
        """Regelmäßiges Schreiben starten."""
        self._unsub = async_track_time_interval(
            self.hass, self._async_flush_cb, FLUSH_EVERY
        )

    async def async_stop(self) -> None:
        """Rest schreiben und anhalten."""
        if self._unsub is not None:
            self._unsub()
            self._unsub = None
        await self.async_flush()

    @callback
    def add(
        self,
        now: datetime,
        roh: list[dict[str, Any]] | None,
        gemeldet: int | None,
        tracks: list[Track],
        pose: tuple[float, float, float],
    ) -> None:
        """Einen Rahmen merken (``roh`` = None heißt: Sensor nicht verfügbar)."""
        day = dt_util.as_local(now).date()
        if pose != self._pose or day not in self._header_for:
            self._buffer.append(
                (
                    day,
                    {
                        "format": FORMAT,
                        "raum_id": self.raum_id,
                        "sensor": {"x": pose[0], "y": pose[1], "winkel": pose[2]},
                    },
                )
            )
            self._header_for.add(day)
            self._pose = pose
        line: dict[str, Any] = {
            "zeit": now.isoformat(timespec="milliseconds"),
            "ziele": roh,
            "spuren": [
                [
                    spur_id(self.raum_id, t),
                    round(t.x, 1),
                    round(t.y, 1),
                    t.state == HELD,
                    sorted(t.tags),
                ]
                for t in tracks
            ],
        }
        if gemeldet is not None:
            line["gemeldet"] = gemeldet
        self._buffer.append((day, line))

    async def _async_flush_cb(self, _now: datetime) -> None:
        await self.async_flush()

    async def async_flush(self) -> None:
        """Gepufferte Zeilen anhängen; einmal am Tag alte Dateien löschen."""
        buffer, self._buffer = self._buffer, []
        today = dt_util.now().date()
        prune = self._last_prune != today
        self._last_prune = today
        if not buffer and not prune:
            return
        try:
            await self.hass.async_add_executor_job(
                _write,
                self.folder,
                buffer,
                today - timedelta(days=self.tage) if prune else None,
            )
        except OSError as err:
            LOGGER.warning("Aufnahme %s nicht geschrieben: %s", self.raum_id, err)

    async def async_read(self, von: datetime, bis: datetime) -> list[dict[str, Any]]:
        """Zeilen zwischen ``von`` und ``bis`` (höchstens 24 h)."""
        if bis <= von or bis - von > MAX_ABRUF:
            raise ValueError("Zeitraum muss größer 0 und höchstens 24 h sein")
        await self.async_flush()
        return await self.hass.async_add_executor_job(_read, self.folder, von, bis)

    async def async_auswerten(
        self, von: datetime, bis: datetime, zonen: dict[str, Shape]
    ) -> dict[str, Any]:
        """Wer war wann wo (``core/auswertung.py``), höchstens 24 h."""
        if bis <= von or bis - von > MAX_ABRUF:
            raise ValueError("Zeitraum muss größer 0 und höchstens 24 h sein")
        await self.async_flush()
        return await self.hass.async_add_executor_job(
            _auswerten, self.folder, von, bis, zonen
        )


def _write(
    folder: Path, buffer: list[tuple[date, dict[str, Any]]], prune_before: date | None
) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    by_day: dict[date, list[str]] = {}
    for day, line in buffer:
        by_day.setdefault(day, []).append(
            json.dumps(line, ensure_ascii=False, separators=(",", ":"))
        )
    for day, lines in by_day.items():
        # Gzip-Abschnitte lassen sich aneinanderhängen; Leser lesen alle.
        with gzip.open(
            folder / f"{day.isoformat()}.jsonl.gz", "at", encoding="utf-8"
        ) as f:
            f.write("\n".join(lines) + "\n")
    if prune_before is not None:
        for path in folder.glob("*.jsonl.gz"):
            try:
                if date.fromisoformat(path.name[:10]) < prune_before:
                    path.unlink()
            except ValueError:
                continue


def _lines(folder: Path, von: datetime, bis: datetime):
    """Zeilen der Tagesdateien rund um den Zeitraum, in Dateireihenfolge."""
    day = dt_util.as_local(von).date() - timedelta(days=1)
    last = dt_util.as_local(bis).date() + timedelta(days=1)
    while day <= last:
        path = folder / f"{day.isoformat()}.jsonl.gz"
        day += timedelta(days=1)
        if not path.exists():
            continue
        try:
            with gzip.open(path, "rt", encoding="utf-8") as f:
                for text in f:
                    if text.strip():
                        yield text
        except (OSError, EOFError) as err:
            # Eine angefangene Datei (Absturz beim Schreiben) liest bis zum Fehler.
            LOGGER.debug("Aufnahme %s nur teilweise lesbar: %s", path.name, err)


def _auswerten(
    folder: Path, von: datetime, bis: datetime, zonen: dict[str, Shape]
) -> dict[str, Any]:
    aus = Auswertung(zonen, von.timestamp(), bis.timestamp())
    # Zeilen beginnen mit der Zeit in UTC (gleich lang, Text vergleichbar):
    # alles deutlich vor dem Beginn überspringen, ohne es zu lesen.
    vorlauf = dt_util.as_utc(von) - timedelta(seconds=MAX_RUHE_S)
    lo = vorlauf.isoformat(timespec="milliseconds")
    for text in _lines(folder, von, bis):
        if text.startswith(_ZEIT) and text[len(_ZEIT) : len(_ZEIT) + len(lo)] < lo:
            continue
        try:
            line = json.loads(text)
        except ValueError:
            continue
        aus.add(line)
    return aus.ergebnis(min(bis.timestamp(), dt_util.utcnow().timestamp()))


def _read(folder: Path, von: datetime, bis: datetime) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    day = dt_util.as_local(von).date() - timedelta(days=1)
    last = dt_util.as_local(bis).date() + timedelta(days=1)
    header: dict[str, Any] | None = None
    while day <= last and len(out) < MAX_ZEILEN:
        path = folder / f"{day.isoformat()}.jsonl.gz"
        day += timedelta(days=1)
        if not path.exists():
            continue
        with gzip.open(path, "rt", encoding="utf-8") as f:
            for text in f:
                if not text.strip():
                    continue
                line = json.loads(text)
                if "format" in line:
                    header = line
                    continue
                t = datetime.fromisoformat(line["zeit"])
                if von <= t < bis:
                    if header is not None:
                        out.append(header)
                        header = None
                    out.append(line)
                    if len(out) >= MAX_ZEILEN:
                        break
    return out
