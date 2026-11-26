"""Modell ↔ gespeichertes JSON, ausgeschrieben je Klasse.

Fehlende Felder bekommen Standardwerte; so lassen sich neue Felder
hinzufügen, ohne alte Speicherstände zu brechen.
"""

from __future__ import annotations

from typing import Any

from .const import DEFAULT_AUFNAHME_TAGE
from .model import (
    OeffnungConfig,
    PlanConfig,
    RaumConfig,
    RaumzonenModel,
    RegelConfig,
    SensorConfig,
    ZoneConfig,
)


def regel_from_dict(data: dict[str, Any]) -> RegelConfig:
    """Regel aus JSON."""
    d = RegelConfig()
    return RegelConfig(
        belegt_nach_s=float(data.get("belegt_nach_s", d.belegt_nach_s)),
        frei_nach_s=float(data.get("frei_nach_s", d.frei_nach_s)),
        rand_cm=float(data.get("rand_cm", d.rand_cm)),
        schlaefer_halten=bool(data.get("schlaefer_halten", d.schlaefer_halten)),
        weg_rahmen=int(data.get("weg_rahmen", d.weg_rahmen)),
        weg_cm=float(data.get("weg_cm", d.weg_cm)),
        max_personen=int(data.get("max_personen", d.max_personen)),
        hund_ignorieren=bool(data.get("hund_ignorieren", d.hund_ignorieren)),
    )


def regel_to_dict(regel: RegelConfig) -> dict[str, Any]:
    """Regel als JSON."""
    return {
        "belegt_nach_s": regel.belegt_nach_s,
        "frei_nach_s": regel.frei_nach_s,
        "rand_cm": regel.rand_cm,
        "schlaefer_halten": regel.schlaefer_halten,
        "weg_rahmen": regel.weg_rahmen,
        "weg_cm": regel.weg_cm,
        "max_personen": regel.max_personen,
        "hund_ignorieren": regel.hund_ignorieren,
    }


def zone_from_dict(data: dict[str, Any]) -> ZoneConfig:
    """Zone aus JSON."""
    return ZoneConfig(
        id=str(data["id"]),
        name=str(data.get("name", data["id"])),
        form=dict(data["form"]),
        art=str(data.get("art", "normal")),
        regel=regel_from_dict(data.get("regel", {})),
        fuehrt_zu=str(data.get("fuehrt_zu", "")),
    )


def zone_to_dict(zone: ZoneConfig) -> dict[str, Any]:
    """Zone als JSON."""
    return {
        "id": zone.id,
        "name": zone.name,
        "form": zone.form,
        "art": zone.art,
        "regel": regel_to_dict(zone.regel),
        "fuehrt_zu": zone.fuehrt_zu,
    }


def raum_from_dict(data: dict[str, Any]) -> RaumConfig:
    """Raum aus JSON."""
    sensor = data.get("sensor", {})
    return RaumConfig(
        id=str(data["id"]),
        name=str(data.get("name", data["id"])),
        sensor=SensorConfig(
            art=str(sensor.get("art", SensorConfig().art)),
            device_id=str(sensor.get("device_id", "")),
            quelle=str(sensor.get("quelle", SensorConfig().quelle)),
            mqtt_topic=str(sensor.get("mqtt_topic", "")),
            x=float(sensor.get("x", 0.0)),
            y=float(sensor.get("y", 0.0)),
            winkel=float(sensor.get("winkel", 0.0)),
            reichweite_cm=float(
                sensor.get("reichweite_cm", SensorConfig().reichweite_cm)
            ),
            oeffnung_grad=float(
                sensor.get("oeffnung_grad", SensorConfig().oeffnung_grad)
            ),
        ),
        art=str(data.get("art", RaumConfig.__dataclass_fields__["art"].default)),
        zonen=[zone_from_dict(z) for z in data.get("zonen", [])],
        ansicht_winkel=float(data.get("ansicht_winkel", 0.0)),
        umriss=[[float(x), float(y)] for x, y in data.get("umriss", [])],
        oeffnungen=[oeffnung_from_dict(o) for o in data.get("oeffnungen", [])],
        bereich_id=str(data.get("bereich_id", "")),
        haus_x=float(data.get("haus_x", 0.0)),
        haus_y=float(data.get("haus_y", 0.0)),
        haus_winkel=float(data.get("haus_winkel", 0.0)),
        haus_gesetzt=bool(data.get("haus_gesetzt", False)),
        aufnahme=bool(data.get("aufnahme", True)),
        aufnahme_tage=int(data.get("aufnahme_tage", DEFAULT_AUFNAHME_TAGE)),
        melder=[str(m) for m in data.get("melder", [])],
        melder_nachlauf_s=float(data.get("melder_nachlauf_s", 0.0)),
        stockwerke=[str(x) for x in data.get("stockwerke", [])],
    )


def oeffnung_from_dict(data: dict[str, Any]) -> OeffnungConfig:
    """Öffnung aus JSON."""
    return OeffnungConfig(
        kante=int(data["kante"]),
        von=float(data["von"]),
        bis=float(data["bis"]),
        art=str(data.get("art", "tuer")),
        anschlag=str(data.get("anschlag", "anfang")),
        aufgehen=str(data.get("aufgehen", "innen")),
        fuehrt_zu=str(data.get("fuehrt_zu", "")),
    )


def oeffnung_to_dict(o: OeffnungConfig) -> dict[str, Any]:
    """Öffnung als JSON."""
    return {
        "kante": o.kante,
        "von": o.von,
        "bis": o.bis,
        "art": o.art,
        "anschlag": o.anschlag,
        "aufgehen": o.aufgehen,
        "fuehrt_zu": o.fuehrt_zu,
    }


def raum_to_dict(raum: RaumConfig) -> dict[str, Any]:
    """Raum als JSON."""
    return {
        "id": raum.id,
        "name": raum.name,
        "sensor": {
            "art": raum.sensor.art,
            "device_id": raum.sensor.device_id,
            "quelle": raum.sensor.quelle,
            "mqtt_topic": raum.sensor.mqtt_topic,
            "x": raum.sensor.x,
            "y": raum.sensor.y,
            "winkel": raum.sensor.winkel,
            "reichweite_cm": raum.sensor.reichweite_cm,
            "oeffnung_grad": raum.sensor.oeffnung_grad,
        },
        "art": raum.art,
        "zonen": [zone_to_dict(z) for z in raum.zonen],
        "ansicht_winkel": raum.ansicht_winkel,
        "umriss": raum.umriss,
        "oeffnungen": [oeffnung_to_dict(o) for o in raum.oeffnungen],
        "bereich_id": raum.bereich_id,
        "haus_x": raum.haus_x,
        "haus_y": raum.haus_y,
        "haus_winkel": raum.haus_winkel,
        "haus_gesetzt": raum.haus_gesetzt,
        "aufnahme": raum.aufnahme,
        "aufnahme_tage": raum.aufnahme_tage,
        "melder": list(raum.melder),
        "melder_nachlauf_s": raum.melder_nachlauf_s,
        "stockwerke": list(raum.stockwerke),
    }


def plan_from_dict(data: dict[str, Any]) -> PlanConfig:
    """Grundriss aus JSON."""
    return PlanConfig(
        id=str(data["id"]),
        name=str(data.get("name", data["id"])),
        datei=str(data["datei"]),
        cm_pro_px=float(data["cm_pro_px"]),
        breite_px=int(data["breite_px"]),
        hoehe_px=int(data["hoehe_px"]),
        x=float(data.get("x", 0.0)),
        y=float(data.get("y", 0.0)),
        stockwerk=str(data.get("stockwerk", "")),
    )


def plan_to_dict(plan: PlanConfig) -> dict[str, Any]:
    """Grundriss als JSON."""
    return {
        "id": plan.id,
        "name": plan.name,
        "datei": plan.datei,
        "cm_pro_px": plan.cm_pro_px,
        "breite_px": plan.breite_px,
        "hoehe_px": plan.hoehe_px,
        "x": plan.x,
        "y": plan.y,
        "stockwerk": plan.stockwerk,
    }


def model_from_dict(data: dict[str, Any]) -> RaumzonenModel:
    """Ganzes Modell aus JSON; prüft es auch."""
    model = RaumzonenModel(
        raeume=[raum_from_dict(r) for r in data.get("raeume", [])],
        plaene=[plan_from_dict(p) for p in data.get("plaene", [])],
    )
    model.validate()
    return model


def model_to_dict(model: RaumzonenModel) -> dict[str, Any]:
    """Ganzes Modell als JSON."""
    return {
        "raeume": [raum_to_dict(r) for r in model.raeume],
        "plaene": [plan_to_dict(p) for p in model.plaene],
    }
