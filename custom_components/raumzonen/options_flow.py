"""Einrichtung über die Oberfläche (Optionen der Integration).

Bis die Zeichenoberfläche kommt (Phase 3), wird hier eingerichtet:

* **Raum hinzufügen**: Name, FP400-Gerät, Quelle (MQTT oder Entitäten).
* **Zonen aus dem Konverter übernehmen**: die Software-Zonen, die schon im
  Zigbee2MQTT-Konverter gezeichnet sind, mit einer Rolle (Bett, Tür, ...).
* **Zone einstellen**: Name, Art und Regeln.
* **Zone löschen**, **Raum löschen**.

Jede Aktion: Kopie des Modells → ändern → ganz prüfen → speichern →
Integration neu laden. Nichts davon schaltet etwas im Haus.
"""

from __future__ import annotations

import copy
from typing import Any

from homeassistant.config_entries import ConfigFlowResult, OptionsFlow
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.selector import (
    BooleanSelector,
    DeviceSelector,
    DeviceSelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)
from homeassistant.util import slugify
import voluptuous as vol

from .const import (
    MAX_BELEGT_NACH_S,
    MAX_FREI_NACH_S,
    MAX_PERSONEN,
    MAX_RAND_CM,
    MAX_WEG_CM,
    MAX_WEG_RAHMEN,
    QUELLE_MQTT,
    QUELLEN,
)
from .core.room import ART_NORMAL, ZONE_ARTEN
from .discovery import converter_zones, suggest_topic
from .model import (
    RaumConfig,
    RaumzonenModel,
    RegelConfig,
    SensorConfig,
    ZoneConfig,
    regel_vorlage,
)

ROLLE_UEBERSPRINGEN = "ueberspringen"
ROLLE_BETT = "bett"
# Rolle beim Übernehmen → (Zonenart, Regel-Vorlage)
ROLLEN: dict[str, tuple[str, str]] = {
    "normal": (ART_NORMAL, "normal"),
    ROLLE_BETT: (ART_NORMAL, "bett"),
    "ausgang": ("ausgang", "ausgang"),
    "hundeplatz": ("hundeplatz", "hundeplatz"),
    "stoerquelle": ("stoerquelle", "stoerquelle"),
    "stelle": ("stelle", "stelle"),
    "durchgang": ("durchgang", "durchgang"),
}
MAX_KONVERTER_ZONEN = 8


def _unique_id(base: str, taken: set[str]) -> str:
    slug = slugify(base) or "zone"
    candidate, n = slug, 2
    while candidate in taken:
        candidate = f"{slug}_{n}"
        n += 1
    return candidate


def _number(lo: float, hi: float, step: float, unit: str) -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=lo,
            max=hi,
            step=step,
            unit_of_measurement=unit,
            mode=NumberSelectorMode.BOX,
        )
    )


class RaumzonenOptionsFlow(OptionsFlow):
    """Menü und Formulare."""

    def __init__(self) -> None:
        """Merkt sich Zwischenschritte."""
        self._raum: dict[str, Any] = {}
        self._raum_id: str | None = None
        self._zone_key: str | None = None
        self._found: list[dict[str, Any]] = []

    # -- Hilfen ----------------------------------------------------------------

    @property
    def _model(self) -> RaumzonenModel:
        return self.config_entry.runtime_data.store.model

    async def _async_save(self, model: RaumzonenModel) -> ConfigFlowResult:
        store = self.config_entry.runtime_data.store
        model.validate()
        old = store.model
        store.model = model
        try:
            await store.async_save()
        except ValueError:
            store.model = old
            raise
        self.hass.config_entries.async_schedule_reload(self.config_entry.entry_id)
        return self.async_create_entry(data={})

    def _raum_options(self, radar: bool = False) -> list[dict[str, str]]:
        return [
            {"value": r.id, "label": r.name}
            for r in self._model.raeume
            if not (radar and r.ist_melder)
        ]

    def _zone_options(self) -> list[dict[str, str]]:
        return [
            {"value": f"{r.id}/{z.id}", "label": f"{r.name}: {z.name}"}
            for r in self._model.raeume
            for z in r.zonen
        ]

    # -- Menü ----------------------------------------------------------------

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Hauptmenü."""
        options = ["raum_neu"]
        if self._model.raeume:
            options += ["zonen_import", "raum_loeschen"]
        if self._zone_options():
            options[2:2] = ["zone_waehlen", "zone_loeschen"]
        return self.async_show_menu(step_id="init", menu_options=options)

    # -- Raum ----------------------------------------------------------------

    async def async_step_raum_neu(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Name, Gerät, Quelle."""
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input["name"].strip()
            if not name:
                errors["name"] = "name_fehlt"
            elif dr.async_get(self.hass).async_get(user_input["device_id"]) is None:
                errors["device_id"] = "geraet_fehlt"
            else:
                self._raum = {**user_input, "name": name}
                if user_input["quelle"] == QUELLE_MQTT:
                    return await self.async_step_raum_mqtt()
                return await self._async_add_raum("")
        schema = vol.Schema(
            {
                vol.Required("name"): TextSelector(),
                vol.Required("device_id"): DeviceSelector(
                    DeviceSelectorConfig(integration="mqtt")
                ),
                vol.Required("quelle", default=QUELLE_MQTT): SelectSelector(
                    SelectSelectorConfig(
                        options=list(QUELLEN),
                        translation_key="quelle",
                        mode=SelectSelectorMode.LIST,
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="raum_neu",
            data_schema=self.add_suggested_values_to_schema(schema, user_input),
            errors=errors,
        )

    async def async_step_raum_mqtt(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """MQTT-Thema (vorgeschlagen aus dem Gerätenamen)."""
        errors: dict[str, str] = {}
        if user_input is not None and "mqtt_topic" in user_input:
            topic = user_input["mqtt_topic"].strip()
            if not topic or any(c in topic for c in "+#") or topic.endswith("/"):
                errors["mqtt_topic"] = "thema_ungueltig"
            else:
                return await self._async_add_raum(topic)
        suggested = suggest_topic(self.hass, self._raum["device_id"])
        return self.async_show_form(
            step_id="raum_mqtt",
            data_schema=vol.Schema(
                {vol.Required("mqtt_topic", default=suggested): TextSelector()}
            ),
            errors=errors,
        )

    async def _async_add_raum(self, topic: str) -> ConfigFlowResult:
        model = copy.deepcopy(self._model)
        raum_id = _unique_id(self._raum["name"], {r.id for r in model.raeume})
        model.raeume.append(
            RaumConfig(
                id=raum_id,
                name=self._raum["name"],
                sensor=SensorConfig(
                    device_id=self._raum["device_id"],
                    quelle=self._raum["quelle"],
                    mqtt_topic=topic,
                ),
            )
        )
        return await self._async_save(model)

    async def async_step_raum_loeschen(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Raum mit allen Zonen löschen."""
        if user_input is not None:
            model = copy.deepcopy(self._model)
            model.remove(user_input["raum_id"])
            return await self._async_save(model)
        return self.async_show_form(
            step_id="raum_loeschen",
            data_schema=vol.Schema(
                {
                    vol.Required("raum_id"): SelectSelector(
                        SelectSelectorConfig(options=self._raum_options())
                    )
                }
            ),
        )

    # -- Zonen aus dem Konverter ---------------------------------------------

    async def async_step_zonen_import(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Raum wählen."""
        if user_input is not None:
            self._raum_id = user_input["raum_id"]
            raum = self._model.raum(self._raum_id)
            self._found = converter_zones(
                self.hass, raum.sensor.device_id, raum.sensor.pose
            )
            if not self._found:
                return self.async_abort(reason="keine_konverter_zonen")
            return await self.async_step_zonen_rollen()
        return self.async_show_form(
            step_id="zonen_import",
            data_schema=vol.Schema(
                {
                    vol.Required("raum_id"): SelectSelector(
                        SelectSelectorConfig(options=self._raum_options(radar=True))
                    )
                }
            ),
        )

    async def async_step_zonen_rollen(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Für jede Software-Zone eine Rolle wählen."""
        found = {
            z["nummer"]: z for z in self._found if z["nummer"] <= MAX_KONVERTER_ZONEN
        }
        if user_input is not None and any(k.startswith("zone_") for k in user_input):
            assert self._raum_id is not None
            model = copy.deepcopy(self._model)
            raum = model.raum(self._raum_id)
            for number, zone in found.items():
                rolle = user_input.get(f"zone_{number}", ROLLE_UEBERSPRINGEN)
                if rolle == ROLLE_UEBERSPRINGEN:
                    continue
                art, vorlage = ROLLEN[rolle]
                zone_id = slugify(zone["name"]) or f"zone_{number}"
                raum.zonen = [z for z in raum.zonen if z.id != zone_id]
                raum.zonen.append(
                    ZoneConfig(
                        id=zone_id,
                        name=zone["name"],
                        form=zone["form"],
                        art=art,
                        regel=regel_vorlage(vorlage),
                    )
                )
            return await self._async_save(model)
        rollen = [ROLLE_UEBERSPRINGEN, *ROLLEN]
        schema = vol.Schema(
            {
                vol.Required(f"zone_{n}", default="normal"): SelectSelector(
                    SelectSelectorConfig(options=rollen, translation_key="rolle")
                )
                for n in found
            }
        )
        names = "\n".join(f"- {n}: {z['name']}" for n, z in found.items())
        return self.async_show_form(
            step_id="zonen_rollen",
            data_schema=schema,
            description_placeholders={"zonen": names},
        )

    # -- Zone einstellen / löschen -------------------------------------------

    async def async_step_zone_waehlen(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Zone wählen."""
        if user_input is not None:
            self._zone_key = user_input["zone"]
            return await self.async_step_zone_einstellen()
        return self.async_show_form(
            step_id="zone_waehlen",
            data_schema=vol.Schema(
                {
                    vol.Required("zone"): SelectSelector(
                        SelectSelectorConfig(options=self._zone_options())
                    )
                }
            ),
        )

    def _find_zone(self, model: RaumzonenModel, key: str) -> ZoneConfig:
        raum_id, zone_id = key.split("/", 1)
        return next(z for z in model.raum(raum_id).zonen if z.id == zone_id)

    async def async_step_zone_einstellen(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Name, Art und Regeln einer Zone."""
        assert self._zone_key is not None
        errors: dict[str, str] = {}
        if user_input is not None and "frei_nach_s" in user_input:
            model = copy.deepcopy(self._model)
            zone = self._find_zone(model, self._zone_key)
            zone.name = user_input["name"].strip() or zone.name
            zone.art = user_input["art"]
            zone.regel = RegelConfig(
                belegt_nach_s=float(user_input["belegt_nach_s"]),
                frei_nach_s=float(user_input["frei_nach_s"]),
                rand_cm=float(user_input["rand_cm"]),
                schlaefer_halten=bool(user_input["schlaefer_halten"]),
                weg_rahmen=int(user_input["weg_rahmen"]),
                weg_cm=float(user_input["weg_cm"]),
                max_personen=int(user_input["max_personen"]),
                hund_ignorieren=bool(user_input["hund_ignorieren"]),
            )
            try:
                return await self._async_save(model)
            except ValueError:
                errors["base"] = "ungueltig"
        zone = self._find_zone(self._model, self._zone_key)
        r = zone.regel
        schema = vol.Schema(
            {
                vol.Required("name", default=zone.name): TextSelector(),
                vol.Required("art", default=zone.art): SelectSelector(
                    SelectSelectorConfig(
                        options=list(ZONE_ARTEN), translation_key="art"
                    )
                ),
                vol.Required("belegt_nach_s", default=r.belegt_nach_s): _number(
                    0, MAX_BELEGT_NACH_S, 0.5, "s"
                ),
                vol.Required("frei_nach_s", default=r.frei_nach_s): _number(
                    0, MAX_FREI_NACH_S, 0.5, "s"
                ),
                vol.Required("rand_cm", default=r.rand_cm): _number(
                    0, MAX_RAND_CM, 5, "cm"
                ),
                vol.Required(
                    "schlaefer_halten", default=r.schlaefer_halten
                ): BooleanSelector(),
                vol.Required("weg_rahmen", default=r.weg_rahmen): _number(
                    1, MAX_WEG_RAHMEN, 1, ""
                ),
                vol.Required("weg_cm", default=r.weg_cm): _number(
                    0, MAX_WEG_CM, 5, "cm"
                ),
                vol.Required("max_personen", default=r.max_personen): _number(
                    0, MAX_PERSONEN, 1, ""
                ),
                vol.Required(
                    "hund_ignorieren", default=r.hund_ignorieren
                ): BooleanSelector(),
            }
        )
        return self.async_show_form(
            step_id="zone_einstellen", data_schema=schema, errors=errors
        )

    async def async_step_zone_loeschen(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Eine Zone löschen."""
        if user_input is not None:
            model = copy.deepcopy(self._model)
            raum_id, zone_id = user_input["zone"].split("/", 1)
            raum = model.raum(raum_id)
            raum.zonen = [z for z in raum.zonen if z.id != zone_id]
            return await self._async_save(model)
        return self.async_show_form(
            step_id="zone_loeschen",
            data_schema=vol.Schema(
                {
                    vol.Required("zone"): SelectSelector(
                        SelectSelectorConfig(options=self._zone_options())
                    )
                }
            ),
        )
