"""Hilfen für Tests mit simuliertem FP400 (nie die echte Installation)."""

from __future__ import annotations

from datetime import timedelta
import json
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    async_fire_mqtt_message,
    async_fire_time_changed,
)

from custom_components.raumzonen.const import DOMAIN

TOPIC = "zigbee2mqtt/Testsensor"


class SimFp400:
    """Schickt Rahmen wie Zigbee2MQTT mit dem erweiterten Konverter."""

    def __init__(self, hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
        self.hass = hass
        self.freezer = freezer
        self.n = 0

    async def frame(
        self,
        *targets: tuple[int, float, float],
        moving: bool = False,
        gemeldet: int | None = None,
    ) -> None:
        self.n += 1
        payload: dict[str, Any] = {
            "illuminance": 5,
            "tracking_last_update": f"rahmen-{self.n}",
            "tracking_targets": [
                {"id": i, "x": x, "y": y, "moving": moving, "type": "person"}
                for i, x, y in targets
            ],
            "targets_xy": ";".join(f"{i}:{x}:{y}" for i, x, y in targets) or "none",
        }
        if gemeldet is not None:
            # Mehr gemeldet als geliefert: der Funkweg hat abgeschnitten.
            payload["target_count"] = gemeldet
        async_fire_mqtt_message(self.hass, TOPIC, json.dumps(payload))
        await self.hass.async_block_till_done()

    async def repeat_old(self) -> None:
        """Zigbee2MQTT schickt den alten Stand wegen einer anderen Änderung."""
        payload = {"illuminance": 6, "tracking_last_update": f"rahmen-{self.n}"}
        payload["tracking_targets"] = []
        async_fire_mqtt_message(self.hass, TOPIC, json.dumps(payload))
        await self.hass.async_block_till_done()

    async def offline(self) -> None:
        async_fire_mqtt_message(
            self.hass, f"{TOPIC}/availability", '{"state":"offline"}'
        )
        await self.hass.async_block_till_done()

    async def wait(self, seconds: float) -> None:
        """Zeit vergehen lassen (in kleinen Schritten, damit Zeitregeln greifen)."""
        steps = max(1, round(seconds / 0.1))
        for _ in range(steps):
            self.freezer.tick(timedelta(seconds=seconds / steps))
            async_fire_time_changed(self.hass)
            await self.hass.async_block_till_done()

    async def lie_in_bed(self) -> None:
        for i in range(12):
            await self.frame((0, -150, 200 + i % 3))
            await self.wait(0.3)
        await self.wait(4)

    async def walk_to_door(self, tid: int = 0) -> None:
        path = [(-130, 170), (-100, 140), (-70, 110), (-40, 80), (0, 50), (40, 30)]
        for x, y in path:
            await self.frame((tid, x, y), moving=True)
            await self.wait(0.3)


def entity_id(hass: HomeAssistant, domain: str, unique_suffix: str) -> str:
    """entity_id über die unique_id finden (Endung reicht)."""
    for entry in er.async_get(hass).entities.values():
        if (
            entry.platform == DOMAIN
            and entry.domain == domain
            and entry.unique_id.endswith(unique_suffix)
        ):
            return entry.entity_id
    raise KeyError(unique_suffix)
