"""Grundrisse als Hintergrundbilder: Dateien unter ``<config>/raumzonen/plaene/``.

Die Bilder bleiben in Home Assistant (nicht im Recorder, nicht im Repo). Das
Panel lädt sie über den WebSocket ``raumzonen/plan/bild/get``.
"""

from __future__ import annotations

import base64
import binascii
from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import DOMAIN, MAX_PLAN_BYTES

ENDUNG = {"image/jpeg": "jpg", "image/png": "png"}
MIME = {v: k for k, v in ENDUNG.items()}


def ordner(hass: HomeAssistant) -> Path:
    """Ordner der Grundrisse."""
    return Path(hass.config.path(DOMAIN, "plaene"))


def dekodieren(daten: str, mime: str) -> bytes:
    """Bild aus Base64; prüft Art und Größe (``ValueError``)."""
    if mime not in ENDUNG:
        raise ValueError("Nur JPEG oder PNG")
    try:
        roh = base64.b64decode(daten, validate=True)
    except (binascii.Error, ValueError) as err:
        raise ValueError("Bild nicht lesbar") from err
    if len(roh) > MAX_PLAN_BYTES:
        raise ValueError("Bild zu groß")
    kopf = {"image/jpeg": b"\xff\xd8\xff", "image/png": b"\x89PNG"}[mime]
    if not roh.startswith(kopf):
        raise ValueError("Bild passt nicht zur Art")
    return roh


def schreiben(hass: HomeAssistant, datei: str, roh: bytes) -> None:
    """Datei schreiben (im Executor aufrufen)."""
    folder = ordner(hass)
    folder.mkdir(parents=True, exist_ok=True)
    (folder / datei).write_bytes(roh)


def lesen(hass: HomeAssistant, datei: str) -> str:
    """Datei als Base64 (im Executor aufrufen)."""
    return base64.b64encode((ordner(hass) / datei).read_bytes()).decode("ascii")


def loeschen(hass: HomeAssistant, datei: str) -> None:
    """Datei löschen, falls vorhanden (im Executor aufrufen)."""
    (ordner(hass) / datei).unlink(missing_ok=True)
