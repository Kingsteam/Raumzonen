"""Zeigt, welche Automationen und Skripte Anzeigen eines Raums nutzen.

Nur lesen: Raumzonen sucht über die Abfragen von Home Assistant
(``automations_with_entity``, ``scripts_with_entity``), welche Automationen
und Skripte eine Entität des Raums nennen, und liefert für das Panel Name,
an/aus, zuletzt ausgelöst, Kategorie, Labels und den Weg in den Editor.
Geändert wird nichts.
"""

from __future__ import annotations

import json
from typing import Any

from homeassistant.components.automation import (
    DATA_COMPONENT as AUTOMATIONEN,
    automations_with_entity,
)
from homeassistant.components.script import DOMAIN as SKRIPT, scripts_with_entity
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    category_registry as cr,
    entity_registry as er,
    label_registry as lr,
)

from .model import RaumConfig


def raum_entitaeten(
    hass: HomeAssistant, entry_id: str, raum: RaumConfig, raum_ids: list[str]
) -> list[str]:
    """Entitäten eines Raums: eigene Anzeigen, Sensor und Melder.

    Eigene Anzeigen tragen ``<entry>_<raum>_…`` in der unique_id. Weil eine
    Raum-Kennung der Anfang einer anderen sein kann (``bad``, ``bad_oben``),
    zählt jede Anzeige zum Raum mit der längsten passenden Kennung.
    """
    reg = er.async_get(hass)
    out: list[str] = []
    vorne = f"{entry_id}_"
    for eintrag in er.async_entries_for_config_entry(reg, entry_id):
        uid = eintrag.unique_id or ""
        if not uid.startswith(vorne):
            continue
        rest = uid[len(vorne) :]
        passend = [r for r in raum_ids if rest.startswith(f"{r}_")]
        if passend and max(passend, key=len) == raum.id:
            out.append(eintrag.entity_id)
    if not raum.ist_melder and raum.sensor.device_id:
        out += [
            e.entity_id
            for e in er.async_entries_for_device(reg, raum.sensor.device_id)
            if e.disabled_by is None
        ]
    for kennung in raum.melder:
        if (eintrag := reg.async_get(kennung)) is not None:
            out.append(eintrag.entity_id)
    return list(dict.fromkeys(out))


def _kommt_vor(teil: Any, entity_id: str) -> bool:
    return teil is not None and entity_id in json.dumps(teil, default=str)


def verwendung(hass: HomeAssistant, entitaeten: list[str]) -> list[dict[str, Any]]:
    """Automationen und Skripte, die eine der Entitäten nennen."""
    gefunden: dict[str, set[str]] = {}
    for entity_id in entitaeten:
        for nutzer in automations_with_entity(hass, entity_id) + scripts_with_entity(
            hass, entity_id
        ):
            gefunden.setdefault(nutzer, set()).add(entity_id)
    reg = er.async_get(hass)
    kategorien = cr.async_get(hass)
    labels = lr.async_get(hass)
    out = []
    for nutzer, benutzt in gefunden.items():
        domain = nutzer.split(".", 1)[0]
        komponente = hass.data.get(AUTOMATIONEN if domain == "automation" else SKRIPT)
        entitaet = komponente.get_entity(nutzer) if komponente else None
        roh = getattr(entitaet, "raw_config", None) or {}
        eintrag = reg.async_get(nutzer)
        kategorie = None
        if (
            eintrag
            and (kid := eintrag.categories.get(domain))
            and (k := kategorien.async_get_category(scope=domain, category_id=kid))
        ):
            kategorie = k.name
        state = hass.states.get(nutzer)
        ausloeser = (
            roh.get("triggers", roh.get("trigger")) if domain == "automation" else None
        )
        if domain == "automation":
            kennung = getattr(entitaet, "unique_id", None) or roh.get("id")
            editor = f"/config/automation/edit/{kennung}" if kennung else None
        else:
            editor = f"/config/script/edit/{nutzer.split('.', 1)[1]}"
        out.append(
            {
                "entity_id": nutzer,
                "art": "automation" if domain == "automation" else "skript",
                "name": (state.name if state else None) or nutzer,
                "an": state.state == "on" if state and domain == "automation" else None,
                "zuletzt": state.attributes.get("last_triggered") if state else None,
                "kategorie": kategorie,
                "labels": sorted(
                    lab.name
                    for lid in (eintrag.labels if eintrag else ())
                    if (lab := labels.async_get_label(lid))
                ),
                "editor": editor,
                "entitaeten": [
                    {
                        "entity_id": e,
                        "name": (s.name if (s := hass.states.get(e)) else e),
                        "loest_aus": _kommt_vor(ausloeser, e),
                    }
                    # Auslöser zuerst, dann nach Name.
                    for e in sorted(
                        benutzt, key=lambda e: (not _kommt_vor(ausloeser, e), e)
                    )
                ],
            }
        )
    out.sort(key=lambda a: (a["art"] != "automation", str(a["name"]).lower()))
    return out
