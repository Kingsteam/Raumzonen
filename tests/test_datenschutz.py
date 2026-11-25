"""Wächter: Testdaten dürfen keine persönlichen Angaben enthalten.

Erlaubt sind nur relative Zeiten, Ziel-IDs, x/y und neutrale Signalnamen.
"""

from __future__ import annotations

import json
from pathlib import Path
import re

import pytest

from custom_components.raumzonen.core.trace import FORMAT

from .conftest import AUFNAHMEN, DATEN

FORBIDDEN = [
    re.compile(r"0x[0-9a-f]{16}", re.I),  # IEEE-Adresse
    re.compile(r"\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}"),  # Datum mit Uhrzeit
    re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),  # IP-Adresse
    re.compile(r"nabu\.casa|ui\.nabu|token|bearer", re.I),
    re.compile(r"\b(sensor|binary_sensor|input_boolean|light|switch)\.[a-z0-9_]+"),
]
ALLOWED_KEYS = {
    "format",
    "name",
    "dauer_s",
    "einheit",
    "rahmen",
    "signale",
    "ereignisse",
    "liegt",
}
ALLOWED_SIGNALS = {"im_bett", "flur", "bad"}

FILES = sorted(DATEN.glob("*.json")) + (
    sorted(AUFNAHMEN.glob("*.json")) if AUFNAHMEN else []
)


@pytest.mark.parametrize("path", FILES, ids=lambda p: p.name)
def test_no_personal_data(path) -> None:
    text = path.read_text(encoding="utf-8")
    for pattern in FORBIDDEN:
        assert not pattern.search(text), f"{path.name}: {pattern.pattern}"


@pytest.mark.parametrize(
    "path", [p for p in FILES if "nacht" in p.name], ids=lambda p: p.name
)
def test_trace_has_only_allowed_fields(path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["format"] == FORMAT
    assert set(data) <= ALLOWED_KEYS
    assert set(data["signale"]) <= ALLOWED_SIGNALS
    first = data["rahmen"][0][0]
    assert 0 <= first < 3600, "Zeiten müssen relativ zum Ausschnitt sein"
    for _, targets in data["rahmen"]:
        for row in targets or []:
            assert len(row) in (3, 5)


# Öffentliche Texte (Repo ist öffentlich): keine Adressen, Geräte-IDs oder
# Verweise auf private Repos.
TEXTE = [
    p
    for p in Path(__file__).parent.parent.glob("**/*.md")
    if "node_modules" not in p.parts and ".git" not in p.parts
]
TEXT_VERBOTEN = [
    re.compile(r"\b(?!127\.0\.0\.1\b)(?:\d{1,3}\.){3}\d{1,3}\b"),
    re.compile(r"[a-z0-9]{20,}\.ui\.nabu\.casa", re.IGNORECASE),
    re.compile(r"0x[0-9a-f]{16}", re.IGNORECASE),
    re.compile(r"Kingsteam/\.homeassistant"),
]


@pytest.mark.parametrize("path", TEXTE, ids=lambda p: p.name)
def test_texte_ohne_private_angaben(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    for pattern in TEXT_VERBOTEN:
        assert not pattern.search(text), f"{path}: {pattern.pattern}"
