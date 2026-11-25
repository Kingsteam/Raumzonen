"""Gemeinsame Fixtures."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

DATEN = Path(__file__).parent / "daten"
# Die echten (anonymisierten) Nächte liegen im privaten Repo haus-privat,
# Ordner raumzonen/aufnahmen. Pfad über RAUMZONEN_AUFNAHMEN angeben.
AUFNAHMEN = (
    Path(os.environ["RAUMZONEN_AUFNAHMEN"])
    if os.environ.get("RAUMZONEN_AUFNAHMEN")
    else None
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Lädt Integrationen aus custom_components in jedem Test."""


@pytest.fixture
def mqtt(mqtt_mock):
    """Simuliertes MQTT.

    Der MQTT-Client von Home Assistant hinterlässt im Test einen Zeitgeber
    (``_async_misc``); Tests damit setzen ``expected_lingering_timers``.
    """
    return mqtt_mock


@pytest.fixture(autouse=True)
def aufnahme_ordner(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Aufnahmen je Test in einen leeren Ordner, nie in einen gemeinsamen."""
    monkeypatch.setattr(
        "custom_components.raumzonen.aufnahme.aufnahme_dir",
        lambda _hass, raum_id: tmp_path / "aufnahmen" / raum_id,
    )
    return tmp_path / "aufnahmen"
