"""Ersteinrichtung von Raumzonen.

Es gibt nur eine Instanz. Räume, Sensoren und Zonen werden danach einzeln
über die Optionen eingerichtet (``options_flow.py``); hier wird nur bestätigt.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
import voluptuous as vol

from .const import DOMAIN, NAME


class RaumzonenConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config-Flow: nur eine Instanz, ein Bestätigungsschritt."""

    VERSION = 1
    MINOR_VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Räume und Zonen einrichten (siehe options_flow.py)."""
        from .options_flow import RaumzonenOptionsFlow

        return RaumzonenOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Erster und einziger Schritt."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})
        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))
