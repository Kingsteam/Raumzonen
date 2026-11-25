"""Meldungen des Aqara FP400 (Zigbee2MQTT, erweiterter Konverter) lesen.

Reines Python. Der Konverter veröffentlicht je Rahmen:

* ``tracking_targets``: Liste von Zielen ``{"id", "x", "y", "moving"?,
  "type"?, ...}``,
* ``targets_xy``: dieselben Ziele als Text ``"id:x:y;id:x:y"`` oder
  ``"none"``,
* ``tracking_last_update``: Zeitstempel des Rahmens.

Zigbee2MQTT schickt bei *jeder* Änderung (z. B. Helligkeit) den ganzen
Zustand mit den alten Zielen erneut. Ein neuer Rahmen ist es nur, wenn sich
``tracking_last_update`` geändert hat.

Software-Zonen des Konverters (``software_zone_N_config``) sind JSON:
``{"name", "x_min", "x_max", "y_min", "y_max", "absence_timeout",
"rotation"?}`` oder ``"clear"``.
"""

from __future__ import annotations

import json
import math
from typing import Any

from .geometry import converter_rect
from .tracks import Target

UNAVAILABLE = frozenset({"unknown", "unavailable", "", "None"})


def parse_targets_xy(state: str | None) -> list[Target] | None:
    """``"0:-120:225;1:12:263"`` → Ziele; ``"none"`` → leer; sonst ``None``."""
    if state is None or state in UNAVAILABLE:
        return None
    if state == "none":
        return []
    out = []
    for part in state.split(";"):
        bits = part.split(":")
        if len(bits) != 3:
            raise ValueError(f"Unlesbares Ziel {part!r}")
        out.append(Target(int(bits[0]), float(bits[1]), float(bits[2])))
    return out


def _target(item: dict[str, Any]) -> Target:
    x, y = float(item["x"]), float(item["y"])
    if not (math.isfinite(x) and math.isfinite(y)):
        raise ValueError("Koordinate ist keine Zahl")
    moving = item.get("moving")
    kind = item.get("type")
    return Target(
        int(item["id"]),
        x,
        y,
        moving if isinstance(moving, bool) else None,
        kind if isinstance(kind, str) else None,
    )


def parse_payload(payload: dict[str, Any]) -> tuple[str, list[Target]] | None:
    """Zustandsmeldung von Zigbee2MQTT → (Rahmen-Kennung, Ziele).

    ``None``, wenn die Meldung keinen Rahmen enthält. Die Kennung ist
    ``tracking_last_update``; gleiche Kennung = alter Rahmen.
    """
    stamp = payload.get("tracking_last_update")
    if not isinstance(stamp, str) or not stamp:
        return None
    raw = payload.get("tracking_targets")
    if isinstance(raw, list):
        return stamp, [_target(t) for t in raw if isinstance(t, dict)]
    targets = parse_targets_xy(payload.get("targets_xy"))
    if targets is None:
        return None
    return stamp, targets


def parse_availability(payload: str) -> bool | None:
    """Verfügbarkeit von Zigbee2MQTT: ``online``/``offline`` oder JSON."""
    text = payload.strip()
    if text.startswith("{"):
        try:
            text = str(json.loads(text).get("state", ""))
        except ValueError, AttributeError:
            return None
    if text == "online":
        return True
    if text == "offline":
        return False
    return None


def parse_converter_zone(value: str | None) -> dict[str, Any] | None:
    """Software-Zone des Konverters → Form ``vieleck`` (oder ``None``)."""
    if not value or value in UNAVAILABLE or value == "clear":
        return None
    data = json.loads(value)
    rect = converter_rect(
        float(data["x_min"]),
        float(data["x_max"]),
        float(data["y_min"]),
        float(data["y_max"]),
        float(data.get("rotation", 0) or 0),
    )
    return {
        "name": str(data.get("name") or "Zone"),
        "form": {
            "art": "vieleck",
            "punkte": [[round(x, 1), round(y, 1)] for x, y in rect.points],
        },
    }


# Felder eines Ziels, die in die eigene Aufnahme kommen (sofern geliefert).
RAW_KEYS = (
    "id",
    "x",
    "y",
    "moving",
    "type",
    "posture",
    "moving_points",
    "micro_points",
    "tracking_state",
)


def raw_targets(payload: dict[str, Any]) -> list[dict[str, Any]] | None:
    """Rohziele für die Aufnahme: nur bekannte Felder, Werte unverändert."""
    raw = payload.get("tracking_targets")
    if not isinstance(raw, list):
        return None
    return [
        {k: item[k] for k in RAW_KEYS if k in item}
        for item in raw
        if isinstance(item, dict)
    ]


def reported_count(payload: dict[str, Any]) -> int | None:
    """Wie viele Ziele der Sensor gemeldet hat (``target_count``), sonst ``None``.

    Ist die Zahl größer als die Liste der Ziele, hat der Funkweg (Ember) den
    Rahmen abgeschnitten.
    """
    value = payload.get("target_count")
    return value if isinstance(value, int) and not isinstance(value, bool) else None
