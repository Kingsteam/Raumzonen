"""Panel „Raumzonen“ in der Seitenleiste.

Das Panel ist fertig gebautes JavaScript aus ``frontend/`` (Quelltext in
``frontend-src/``). Alle angemeldeten Nutzer sehen es und die Live-Punkte;
ändern dürfen nur Admins (das prüfen die WebSocket-Befehle, nicht das Panel).
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, LOGGER

PANEL_URL = "raumzonen"
PANEL_TITLE = "Raumzonen"
PANEL_ICON = "mdi:floor-plan"
WEBCOMPONENT = "raumzonen-panel"
STATIC_URL = f"/{DOMAIN}_static"
FRONTEND_DIR = Path(__file__).parent / "frontend"
PANEL_FILE = "raumzonen-panel.js"
_REGISTERED = f"{DOMAIN}_static_registered"
_KEEP_PANEL = f"{DOMAIN}_keep_panel"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Statische Dateien und Panel anmelden."""
    hass.data.pop(_KEEP_PANEL, None)
    if not hass.data.get(_REGISTERED):
        hass.data[_REGISTERED] = True
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)]
        )
    if PANEL_URL in hass.data.get(frontend.DATA_PANELS, {}):
        return
    version = await hass.async_add_executor_job(_file_version, PANEL_FILE)
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name=WEBCOMPONENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{STATIC_URL}/{PANEL_FILE}?v={version}",
        require_admin=False,
        config={},
    )


def _file_version(name: str) -> str:
    """Kurzer Prüfwert des Inhalts: neue Version = neue Adresse, kein alter Cache."""
    try:
        return hashlib.sha256((FRONTEND_DIR / name).read_bytes()).hexdigest()[:12]
    except OSError:
        LOGGER.warning("Datei des Panels fehlt: %s", FRONTEND_DIR / name)
        return "0"


@callback
def async_reload_keep_panel(hass: HomeAssistant, entry_id: str) -> None:
    """Neu laden, ohne das Panel kurz zu entfernen.

    Sonst springt der Browser, der gerade im Panel speichert, zur Übersicht.
    """
    hass.data[_KEEP_PANEL] = True
    hass.config_entries.async_schedule_reload(entry_id)


@callback
def async_remove_panel(hass: HomeAssistant) -> None:
    """Panel entfernen (beim Entladen, nicht bei unserem eigenen Neuladen)."""
    if hass.data.pop(_KEEP_PANEL, False):
        return
    if PANEL_URL in hass.data.get(frontend.DATA_PANELS, {}):
        frontend.async_remove_panel(hass, PANEL_URL)
