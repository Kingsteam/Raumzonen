"""Beschreibung des Gesamtsystems für die KI (Format ``raumzonen-ki/1``).

Liest nur: das Modell von Raumzonen, den Zustand der Räume, die Wege, die
Einstellungen der Melder am Gerät und die Automationen, die Anzeigen von
Raumzonen oder die Melder benutzen. Ändert nichts.
"""

from __future__ import annotations

import json
import math
from typing import TYPE_CHECKING, Any

from homeassistant.components.automation import (
    DATA_COMPONENT as AUTOMATIONEN,
    automations_with_entity,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.util import dt as dt_util

from .const import DOMAIN, MELDER_HALTE_S
from .core.room import ART_AUSGANG
from .ki import FORMAT, GERAETE_EINSTELLUNGEN
from .model import RaumConfig, RaumzonenModel, anwesenheit_zone, oeffnung_mitte
from .serialize import regel_to_dict

if TYPE_CHECKING:
    from .controller import RoomController

# Automationen werden gekürzt, damit die Beschreibung handlich bleibt.
MAX_AUTOMATION_ZEICHEN = 4000
MAX_WEGE = 50


def _flaeche_m2(umriss: list[list[float]]) -> float | None:
    if len(umriss) < 3:
        return None
    a = 0.0
    for (x1, y1), (x2, y2) in zip(umriss, umriss[1:] + umriss[:1], strict=True):
        a += x1 * y2 - x2 * y1
    return round(abs(a) / 2 / 10000, 1)


def _reichweite_plan_m(raum: RaumConfig, x: float, y: float) -> float | None:
    if len(raum.umriss) < 3:
        return None
    return round(max(math.dist((x, y), p) for p in raum.umriss) / 100, 2)


def _geraete_einstellungen(hass: HomeAssistant, entity_id: str) -> dict[str, Any]:
    """Reichweite, Nachlauf usw. am Gerät des Melders (``number``/``select``)."""
    reg = er.async_get(hass)
    eintrag = reg.async_get(entity_id)
    if eintrag is None or not eintrag.device_id:
        return {}
    out: dict[str, Any] = {}
    for e in er.async_entries_for_device(reg, eintrag.device_id):
        if e.domain not in ("number", "select"):
            continue
        for name in GERAETE_EINSTELLUNGEN:
            if e.entity_id.endswith(name):
                state = hass.states.get(e.entity_id)
                if state is None:
                    continue
                einheit = state.attributes.get("unit_of_measurement")
                out[name] = {
                    "wert": state.state,
                    "einheit": einheit,
                    "min": state.attributes.get("min"),
                    "max": state.attributes.get("max"),
                }
    return out


def _melder(hass: HomeAssistant, raum: RaumConfig) -> list[dict[str, Any]]:
    reg = er.async_get(hass)
    devices = dr.async_get(hass)
    out = []
    for key in raum.melder:
        entity_id = er.async_resolve_entity_id(reg, key) or key
        eintrag = reg.async_get(entity_id)
        device = (
            devices.async_get(eintrag.device_id)
            if eintrag and eintrag.device_id
            else None
        )
        state = hass.states.get(entity_id)
        lage = raum.melder_lagen.get(key)
        out.append(
            {
                "entity_id": entity_id,
                "name": state.name if state else entity_id,
                "zustand": state.state if state else None,
                "modell": " ".join(x for x in (device.manufacturer, device.model) if x)
                if device
                else None,
                "lage_cm": {"x": lage.x, "y": lage.y, "winkel": lage.winkel}
                if lage
                else None,
                "erfassung": (
                    "rundum" if lage and lage.oeffnung_grad >= 360 else "gerichtet"
                )
                if lage
                else None,
                "reichweite_plan_m": _reichweite_plan_m(raum, lage.x, lage.y)
                if lage
                else None,
                "einstellungen_am_geraet": _geraete_einstellungen(hass, entity_id),
            }
        )
    return out


def _zonen(
    hass: HomeAssistant,
    entry_id: str,
    raum: RaumConfig,
    controller: RoomController | None,
) -> list[dict[str, Any]]:
    reg = er.async_get(hass)
    out = []
    zonen = list(raum.zonen)
    ganz = anwesenheit_zone(raum) if not raum.ist_melder else None
    alle: list[tuple[str, str, str, dict[str, Any], list[str]]] = []
    if raum.ist_melder or ganz is not None:
        alle.append(
            ("anwesenheit", "Anwesenheit (ganzer Raum, automatisch)", "normal", {}, [])
        )
    for z in zonen:
        alle.append((z.id, z.name, z.art, regel_to_dict(z.regel), list(z.melder)))
    for zone_id, name, art, regel, melder in alle:
        entity_id = reg.async_get_entity_id(
            "binary_sensor", DOMAIN, f"{entry_id}_{raum.id}_{zone_id}_belegt"
        )
        zustand = None
        if controller is not None and zone_id in controller.room.states:
            st = controller.room.states[zone_id]
            zustand = {"belegt": st.occupied, "personen": st.count}
        out.append(
            {
                "zone_id": zone_id,
                "name": name,
                "art": art,
                "regel": regel,
                "melder": melder,
                "entity_id": entity_id,
                "jetzt": zustand,
            }
        )
    return out


def _tueren(raum: RaumConfig) -> list[dict[str, Any]]:
    out = []
    tuer_zonen = [z for z in raum.zonen if z.art == ART_AUSGANG]
    for o in raum.oeffnungen:
        p = oeffnung_mitte(raum, o)
        hat = False
        if p is not None:
            for z in tuer_zonen:
                punkte = z.form.get("punkte") or []
                mitte = z.form.get("mitte")
                if mitte is None and punkte:
                    mitte = [
                        sum(q[0] for q in punkte) / len(punkte),
                        sum(q[1] for q in punkte) / len(punkte),
                    ]
                if mitte is not None and math.dist(p, mitte) <= 100:
                    hat = True
        out.append(
            {
                "id": o.id,
                "name": o.name or ("Durchgang" if o.art == "offen" else "Tür"),
                "art": o.art,
                "breite_cm": round(o.bis - o.von),
                "fuehrt_zu": o.fuehrt_zu or None,
                "gegenstueck": o.gegenstueck or None,
                "hat_tuer_zone": hat,
            }
        )
    return out


def _automationen(hass: HomeAssistant, entity_ids: set[str]) -> list[dict[str, Any]]:
    if AUTOMATIONEN not in hass.data:
        return []
    gefunden: set[str] = set()
    for e in entity_ids:
        gefunden.update(automations_with_entity(hass, e))
    out = []
    for a in sorted(gefunden):
        entity = hass.data[AUTOMATIONEN].get_entity(a)
        state = hass.states.get(a)
        roh = getattr(entity, "raw_config", None) or {}
        text = json.dumps(roh, ensure_ascii=False, default=str)
        out.append(
            {
                "entity_id": a,
                "id": roh.get("id"),
                "name": state.name if state else a,
                "an": state.state == "on" if state else None,
                "nutzt": sorted(e for e in entity_ids if e in text),
                "konfiguration": roh
                if len(text) <= MAX_AUTOMATION_ZEICHEN
                else text[:MAX_AUTOMATION_ZEICHEN] + " …(gekürzt)",
            }
        )
    return out


def beschreibung(
    hass: HomeAssistant,
    entry_id: str,
    model: RaumzonenModel,
    controllers: dict[str, RoomController],
) -> dict[str, Any]:
    """Das ganze System als JSON für die KI."""
    areas = ar.async_get(hass)
    raeume = []
    relevante: set[str] = set()
    for raum in model.raeume:
        controller = controllers.get(raum.id)
        melder = _melder(hass, raum) if raum.ist_melder else []
        zonen = _zonen(hass, entry_id, raum, controller)
        relevante.update(z["entity_id"] for z in zonen if z["entity_id"])
        relevante.update(m["entity_id"] for m in melder)
        bereich = areas.async_get_area(raum.bereich_id) if raum.bereich_id else None
        eintrag: dict[str, Any] = {
            "raum_id": raum.id,
            "name": raum.name,
            "art": "melder" if raum.ist_melder else "radar",
            "bereich": bereich.name if bereich else None,
            "stockwerke": list(raum.stockwerke),
            "flaeche_m2": _flaeche_m2(raum.umriss),
            "hat_waende": len(raum.umriss) >= 3,
            "zonen": zonen,
            "tueren": _tueren(raum),
            "jetzt": {
                "sensor_erreichbar": controller.room.available if controller else None,
                "figuren": controller.room.figure_count() if controller else None,
            },
        }
        if raum.ist_melder:
            eintrag["melder"] = melder
            eintrag["halten_nach_melder_s"] = MELDER_HALTE_S + raum.melder_nachlauf_s
        else:
            eintrag["sensor"] = {
                "art": "FP400 (Radar mit Positionen)",
                "lage_cm": {
                    "x": raum.sensor.x,
                    "y": raum.sensor.y,
                    "winkel": raum.sensor.winkel,
                },
                "reichweite_cm": raum.sensor.reichweite_cm,
                "oeffnung_grad": raum.sensor.oeffnung_grad,
                "reichweite_plan_m": _reichweite_plan_m(
                    raum, raum.sensor.x, raum.sensor.y
                ),
            }
        raeume.append(eintrag)
    wege = hass.data.get(f"{DOMAIN}_wege")
    return {
        "format": FORMAT,
        "zeit": dt_util.now().isoformat(timespec="seconds"),
        "hinweise": {
            "einheiten": "Längen in cm im Plan, Zeiten in s",
            "radar_halten_s": "verlorene Figur wird bis 10 s gehalten, an Türen ca. 1 s",
            "melder_halten_s": MELDER_HALTE_S,
            "raumzonen_schaltet_nichts": True,
        },
        "raeume": raeume,
        "wege_letzte": [
            {
                "zeit": dt_util.utc_from_timestamp(w.t).isoformat(timespec="seconds"),
                "von": w.von,
                "nach": w.nach,
                "genau": w.genau,
            }
            for w in list(wege.liste)[-MAX_WEGE:]
        ]
        if wege is not None
        else [],
        "automationen": _automationen(hass, relevante),
    }
