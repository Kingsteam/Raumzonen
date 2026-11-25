"""Speicherung des Modells in ``.storage/raumzonen``.

Dünne Hülle um den Home-Assistant-``Store``, versioniert. Defekte Daten
werden nie still überschrieben: Das Laden bricht dann mit ``ValueError`` ab.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_MINOR_VERSION, STORAGE_VERSION
from .model import RaumzonenModel
from .serialize import model_from_dict, model_to_dict

type StoredData = dict[str, Any]


class _RaumzonenStorage(Store[StoredData]):
    """Store mit Migrationshaken."""

    async def _async_migrate_func(
        self,
        old_major_version: int,
        old_minor_version: int,
        old_data: StoredData,
    ) -> StoredData:
        """Migriert ältere Speicherformate. Bisher gibt es nur Version 1."""
        if old_major_version > STORAGE_VERSION:
            raise NotImplementedError("Speicherformat ist neuer als diese Version")
        return old_data


class RaumzonenStore:
    """Lädt und speichert das Modell."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialisiert den Speicher."""
        self._store = _RaumzonenStorage(
            hass, STORAGE_VERSION, STORAGE_KEY, minor_version=STORAGE_MINOR_VERSION
        )
        self.model = RaumzonenModel()

    async def async_load(self) -> RaumzonenModel:
        """Lädt die Daten oder legt ein leeres Modell an (``ValueError`` bei Fehlern)."""
        stored = await self._store.async_load()
        try:
            self.model = model_from_dict(stored or {})
        except (KeyError, TypeError) as err:
            raise ValueError(f"Gespeicherte Daten sind unvollständig: {err}") from err
        return self.model

    @callback
    def async_schedule_save(self) -> None:
        """Prüft und speichert gleich (gebündelt)."""
        self.model.validate()
        self._store.async_delay_save(lambda: model_to_dict(self.model), 1)

    async def async_save(self) -> None:
        """Prüft und speichert sofort."""
        self.model.validate()
        await self._store.async_save(model_to_dict(self.model))
