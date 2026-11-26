"""Gespeichertes Modell: Räume, Sensoren, Zonen und ihre Regeln.

Räume werden einzeln eingerichtet. Ein Radar-Raum hat einen Sensor (FP400)
mit Zonen; ein Melder-Raum liest einen oder mehrere Bewegungs- oder
Präsenzmelder und hat genau eine Zone, den ganzen Raum. Bezüge auf Geräte
laufen über die ``device_id`` aus dem Geräteregister, auf Melder über die
feste Kennung im Entitätsregister, nie über die ``entity_id`` (die lässt
sich umbenennen).

``validate()`` prüft IDs, Bezüge, Formen und Grenzen (``const.py``).
``build_room()`` macht aus einem gespeicherten Raum die Rechenlogik
(``core.room.Room``).
"""

from __future__ import annotations

import dataclasses
from dataclasses import dataclass, field
import math
from typing import Any

from .const import (
    DEFAULT_AUFNAHME_TAGE,
    DEFAULT_OEFFNUNG_GRAD,
    DEFAULT_REICHWEITE_CM,
    FUEHRT_ZU_AUSSEN,
    MAX_AUFNAHME_TAGE,
    MAX_BELEGT_NACH_S,
    MAX_ECKEN,
    MAX_FREI_NACH_S,
    MAX_KOORDINATE_CM,
    MAX_MELDER,
    MAX_NACHLAUF_S,
    MAX_PERSONEN,
    MAX_PLAENE,
    MAX_RAND_CM,
    MAX_REICHWEITE_CM,
    MAX_STOCKWERKE,
    MAX_WEG_CM,
    MAX_WEG_RAHMEN,
    MAX_ZELLE_CM,
    MAX_ZONEN_JE_RAUM,
    MELDER_ZONE_ID,
    MIN_ZELLE_CM,
    QUELLE_MQTT,
    QUELLEN,
    RAUM_ARTEN,
    RAUM_MELDER,
    RAUM_RADAR,
    SENSOR_ARTEN,
    SENSOR_FP400_Z2M,
)
from .core.geometry import Cells, Polygon, shape_from_dict
from .core.pose import Pose
from .core.room import ART_AUSGANG, ART_NORMAL, ZONE_ARTEN, Room, Zone, ZoneRule


@dataclass(slots=True)
class RegelConfig:
    """Regeln einer Zone (siehe ``core.room.ZoneRule``)."""

    belegt_nach_s: float = 1.0
    frei_nach_s: float = 5.0
    rand_cm: float = 20.0
    schlaefer_halten: bool = False
    weg_rahmen: int = 3
    weg_cm: float = 60.0
    max_personen: int = 0
    hund_ignorieren: bool = False

    def to_rule(self) -> ZoneRule:
        """Als Regel für den Rechenkern."""
        return ZoneRule(
            belegt_nach_s=self.belegt_nach_s,
            frei_nach_s=self.frei_nach_s,
            rand_cm=self.rand_cm,
            schlaefer_halten=self.schlaefer_halten,
            weg_rahmen=self.weg_rahmen,
            weg_cm=self.weg_cm,
            max_personen=self.max_personen,
            hund_ignorieren=self.hund_ignorieren,
        )

    def validate(self) -> None:
        """Prüft die Grenzen."""
        _range("belegt_nach_s", self.belegt_nach_s, 0, MAX_BELEGT_NACH_S)
        _range("frei_nach_s", self.frei_nach_s, 0, MAX_FREI_NACH_S)
        _range("rand_cm", self.rand_cm, 0, MAX_RAND_CM)
        _range("weg_cm", self.weg_cm, 0, MAX_WEG_CM)
        _range("weg_rahmen", self.weg_rahmen, 1, MAX_WEG_RAHMEN)
        _range("max_personen", self.max_personen, 0, MAX_PERSONEN)
        if not isinstance(self.weg_rahmen, int) or not isinstance(
            self.max_personen, int
        ):
            raise ValueError("weg_rahmen und max_personen müssen ganze Zahlen sein")


@dataclass(slots=True)
class ZoneConfig:
    """Eine gezeichnete Zone."""

    id: str
    name: str
    form: dict[str, Any]
    art: str = ART_NORMAL
    regel: RegelConfig = field(default_factory=RegelConfig)
    # Nur für Türen (Art „ausgang“): Raum-ID des Nachbarraums oder „aussen“.
    fuehrt_zu: str = ""
    # Nur in Melder-Räumen: diese Melder melden die Zone (einer an = belegt).
    melder: list[str] = field(default_factory=list)


@dataclass(slots=True)
class MelderLage:
    """Wo ein Melder im Raum hängt und wohin er schaut (nur Anzeige)."""

    x: float = 0.0
    y: float = 0.0
    winkel: float = 0.0
    reichweite_cm: float = 500.0
    oeffnung_grad: float = 100.0


@dataclass(slots=True)
class SensorConfig:
    """Der Sensor eines Raums."""

    art: str = SENSOR_FP400_Z2M
    # Gerät im Geräteregister von Home Assistant.
    device_id: str = ""
    quelle: str = QUELLE_MQTT
    # Thema der Zustandsmeldungen, z. B. ``zigbee2mqtt/<Gerätename>``.
    mqtt_topic: str = ""
    # Lage im Raumplan (cm) und Blickrichtung (Grad, gegen den Uhrzeigersinn,
    # 0° = Richtung +y des Raums). Ohne Angabe: Raum = Sensorkoordinaten.
    x: float = 0.0
    y: float = 0.0
    winkel: float = 0.0
    # Nur zum Einzeichnen der Abdeckung (Kreissegment).
    reichweite_cm: float = DEFAULT_REICHWEITE_CM
    oeffnung_grad: float = DEFAULT_OEFFNUNG_GRAD

    @property
    def pose(self) -> Pose:
        """Lage als Rechenobjekt."""
        return Pose(self.x, self.y, self.winkel)


OEFFNUNG_ARTEN = ("tuer", "offen")
# Tür: Scharnier an der Ecke ``kante`` (Anfang) oder am anderen Ende, und ob
# sie in den Raum oder nach außen aufgeht. Nur Zeichnung.
ANSCHLAG = ("anfang", "ende")
AUFGEHEN = ("innen", "aussen")


@dataclass(slots=True)
class OeffnungConfig:
    """Öffnung in einer Wand: Tür oder offener Durchgang (nur zur Anzeige)."""

    # Index der Wand: von Ecke ``kante`` zu Ecke ``kante + 1`` des Umrisses.
    kante: int
    # Abschnitt in cm ab der Ecke ``kante``.
    von: float
    bis: float
    art: str = "tuer"
    anschlag: str = "anfang"
    aufgehen: str = "innen"
    # Wohin sie führt: Raum-ID, „aussen“ oder leer (weiß nicht).
    fuehrt_zu: str = ""


@dataclass(slots=True)
class RaumConfig:
    """Ein Raum."""

    id: str
    name: str
    sensor: SensorConfig = field(default_factory=SensorConfig)
    zonen: list[ZoneConfig] = field(default_factory=list)
    art: str = RAUM_RADAR
    # Drehung der Ansicht im Panel (nur Anzeige, ändert keine Koordinaten).
    ansicht_winkel: float = 0.0
    # Umriss des Raums (Wände) als Ecken in cm, nur zur Orientierung.
    umriss: list[list[float]] = field(default_factory=list)
    # Türen und offene Stellen in den Wänden.
    oeffnungen: list[OeffnungConfig] = field(default_factory=list)
    # Bereich in Home Assistant (für Abnehmer wie das Homebrain).
    bereich_id: str = ""
    # Lage des Raums im Hausplan (cm, Grad); der Raum selbst bleibt gerade.
    haus_x: float = 0.0
    haus_y: float = 0.0
    haus_winkel: float = 0.0
    # Erst wahr, wenn der Raum im Hausplan liegt (0/0/0 kann echt sein).
    haus_gesetzt: bool = False
    # Eigene Aufnahme der Rohpositionen und Spuren.
    aufnahme: bool = True
    aufnahme_tage: int = DEFAULT_AUFNAHME_TAGE
    # Nur Melder-Räume: Kennungen der Melder im Entitätsregister.
    melder: list[str] = field(default_factory=list)
    # Nur Melder-Räume: so lange bleibt der Raum belegt, nachdem alle Melder
    # „aus“ melden (zusätzlich zu ihrer eigenen Nachlaufzeit).
    melder_nachlauf_s: float = 0.0
    # Stockwerke (IDs aus Home Assistant), auf denen der Raum liegt; eine
    # Treppe liegt auf zwei. Leer: das Stockwerk seines Bereichs.
    stockwerke: list[str] = field(default_factory=list)
    # Nur Melder-Räume: Lage der Melder im Plan (Kennung → Lage).
    melder_lagen: dict[str, MelderLage] = field(default_factory=dict)

    @property
    def ist_melder(self) -> bool:
        """Raum nur mit Bewegungs-/Präsenzmeldern."""
        return self.art == RAUM_MELDER


@dataclass(slots=True)
class PlanConfig:
    """Ein Grundriss als Hintergrundbild im Hausplan (Bild liegt als Datei bei).

    Bildpunkt (px, py) mit py nach unten liegt im Haus bei
    ``(x + px * cm_pro_px, y + (hoehe_px - py) * cm_pro_px)``.
    """

    id: str
    name: str
    datei: str
    cm_pro_px: float
    breite_px: int
    hoehe_px: int
    x: float = 0.0
    y: float = 0.0
    # Stockwerk (ID aus Home Assistant), leer = keins.
    stockwerk: str = ""
    # Drehung um den Bildursprung (oben links), Grad gegen den Uhrzeigersinn.
    winkel: float = 0.0
    # Zuschnitt in Bildpunkten [x0, y0, x1, y1]; leer = ganzes Bild.
    zuschnitt: list[float] = field(default_factory=list)


@dataclass(slots=True)
class RaumzonenModel:
    """Alles, was gespeichert wird."""

    raeume: list[RaumConfig] = field(default_factory=list)
    plaene: list[PlanConfig] = field(default_factory=list)

    def raum(self, raum_id: str) -> RaumConfig:
        """Raum nach ID (``KeyError``, wenn es ihn nicht gibt)."""
        for raum in self.raeume:
            if raum.id == raum_id:
                return raum
        raise KeyError(raum_id)

    def remove(self, raum_id: str) -> None:
        """Raum löschen; Türen, die dorthin führten, zeigen danach nirgendwohin."""
        self.raeume = [r for r in self.raeume if r.id != raum_id]
        for raum in self.raeume:
            for zone in raum.zonen:
                if zone.fuehrt_zu == raum_id:
                    zone.fuehrt_zu = ""
            for o in raum.oeffnungen:
                if o.fuehrt_zu == raum_id:
                    o.fuehrt_zu = ""

    def validate(self) -> None:
        """Prüft das ganze Modell; wirft ``ValueError`` mit Klartext."""
        _unique("Grundriss", [p.id for p in self.plaene])
        if len(self.plaene) > MAX_PLAENE:
            raise ValueError(f"höchstens {MAX_PLAENE} Grundrisse")
        for plan in self.plaene:
            _ident("Grundriss", plan.id)
            if not plan.datei or "/" in plan.datei or ".." in plan.datei:
                raise ValueError(f"Grundriss {plan.id}: Datei ungültig")
            _range("cm_pro_px", plan.cm_pro_px, 0.01, 100)
            _range("breite_px", plan.breite_px, 1, 20000)
            _range("hoehe_px", plan.hoehe_px, 1, 20000)
            for name in ("x", "y"):
                _range(name, getattr(plan, name), -100_000, 100_000)
            if plan.stockwerk and not _floor_id(plan.stockwerk):
                raise ValueError(f"Grundriss {plan.id}: Stockwerk ungültig")
            _range("Grundriss winkel", plan.winkel, -180, 180)
            if plan.zuschnitt:
                z = plan.zuschnitt
                if (
                    len(z) != 4
                    or not 0 <= z[0] < z[2] <= plan.breite_px
                    or not 0 <= z[1] < z[3] <= plan.hoehe_px
                ):
                    raise ValueError(f"Grundriss {plan.id}: Zuschnitt ungültig")
        _unique("Raum", [r.id for r in self.raeume])
        for raum in self.raeume:
            _ident("Raum", raum.id)
            if not raum.name.strip():
                raise ValueError(f"Raum {raum.id}: Name fehlt")
            if raum.sensor.art not in SENSOR_ARTEN:
                raise ValueError(
                    f"Raum {raum.id}: unbekannter Sensor {raum.sensor.art!r}"
                )
            if raum.art not in RAUM_ARTEN:
                raise ValueError(f"Raum {raum.id}: unbekannte Art {raum.art!r}")
            _unique(f"Stockwerk in {raum.id}", raum.stockwerke)
            if len(raum.stockwerke) > MAX_STOCKWERKE or any(
                not _floor_id(s) for s in raum.stockwerke
            ):
                raise ValueError(f"Raum {raum.id}: Stockwerke ungültig")
            if raum.ist_melder:
                _check_melder(raum)
            else:
                _check_sensor(raum.id, raum.sensor)
                if raum.melder:
                    raise ValueError(f"Raum {raum.id}: Melder nur bei Melder-Räumen")
            for name in ("haus_x", "haus_y"):
                _range(name, getattr(raum, name), -100_000, 100_000)
            _range("haus_winkel", raum.haus_winkel, -180, 180)
            _range("aufnahme_tage", raum.aufnahme_tage, 1, MAX_AUFNAHME_TAGE)
            _range("ansicht_winkel", raum.ansicht_winkel, -180, 180)
            if raum.umriss:
                _check_form(
                    f"{raum.id} (Umriss)", {"art": "vieleck", "punkte": raum.umriss}
                )
            _check_oeffnungen(raum, {r.id for r in self.raeume})
            if len(raum.zonen) > MAX_ZONEN_JE_RAUM:
                raise ValueError(f"Raum {raum.id}: höchstens {MAX_ZONEN_JE_RAUM} Zonen")
            _unique(f"Zone in {raum.id}", [z.id for z in raum.zonen])
            for zone in raum.zonen:
                _ident("Zone", zone.id)
                if not zone.name.strip():
                    raise ValueError(f"Zone {zone.id}: Name fehlt")
                if zone.melder and not raum.ist_melder:
                    raise ValueError(f"Zone {zone.id}: Melder nur in Melder-Räumen")
                if zone.art not in ZONE_ARTEN:
                    raise ValueError(f"Zone {zone.id}: unbekannte Art {zone.art!r}")
                if zone.fuehrt_zu:
                    if zone.art != ART_AUSGANG:
                        raise ValueError(f"Zone {zone.id}: „führt zu“ nur bei Türen")
                    _check_ziel(
                        f"Zone {zone.id}",
                        zone.fuehrt_zu,
                        raum.id,
                        {r.id for r in self.raeume},
                    )
                zone.regel.validate()
                _check_form(zone.id, zone.form)


def melder_zone(raum: RaumConfig) -> Zone:
    """Die eine Zone eines Melder-Raums: der ganze Raum."""
    if len(raum.umriss) >= 3:
        shape = Polygon([(x, y) for x, y in raum.umriss])
    else:
        shape = Polygon([(-500, -500), (500, -500), (500, 500), (-500, 500)])
    return Zone(
        id=MELDER_ZONE_ID,
        name="Anwesenheit",
        shape=shape,
        art=ART_NORMAL,
        rule=ZoneRule(belegt_nach_s=0.0, frei_nach_s=raum.melder_nachlauf_s, rand_cm=0),
    )


def build_room(raum: RaumConfig) -> Room:
    """Rechenlogik für einen gespeicherten Raum."""
    if raum.ist_melder:
        return Room(
            [
                melder_zone(raum),
                *(
                    Zone(
                        id=z.id,
                        name=z.name,
                        shape=shape_from_dict(z.form),
                        art=z.art,
                        rule=ZoneRule(
                            belegt_nach_s=0.0,
                            frei_nach_s=z.regel.frei_nach_s,
                            rand_cm=0,
                        ),
                    )
                    for z in raum.zonen
                ),
            ]
        )
    return Room(
        Zone(
            id=z.id,
            name=z.name,
            shape=shape_from_dict(z.form),
            art=z.art,
            rule=z.regel.to_rule(),
        )
        for z in raum.zonen
    )


# Vorlagen für Regeln (Werte aus vier aufgenommenen Nächten).
REGEL_VORLAGEN: dict[str, RegelConfig] = {
    "normal": RegelConfig(belegt_nach_s=1, frei_nach_s=5, rand_cm=20),
    "bett": RegelConfig(
        belegt_nach_s=3,
        frei_nach_s=2,
        rand_cm=25,
        schlaefer_halten=True,
        weg_rahmen=3,
        weg_cm=60,
        max_personen=1,
    ),
    "ausgang": RegelConfig(belegt_nach_s=0, frei_nach_s=2, rand_cm=10),
    "hundeplatz": RegelConfig(belegt_nach_s=5, frei_nach_s=30, rand_cm=20),
    "stoerquelle": RegelConfig(belegt_nach_s=0, frei_nach_s=5, rand_cm=0),
    "stelle": RegelConfig(belegt_nach_s=0, frei_nach_s=5, rand_cm=10),
    "durchgang": RegelConfig(belegt_nach_s=0, frei_nach_s=2, rand_cm=10),
}


def regel_vorlage(name: str) -> RegelConfig:
    """Kopie einer Vorlage (``KeyError`` bei unbekanntem Namen)."""
    return dataclasses.replace(REGEL_VORLAGEN[name])


def _check_melder(raum: RaumConfig) -> None:
    if not raum.melder:
        raise ValueError(f"Raum {raum.id}: mindestens ein Melder")
    if len(raum.melder) > MAX_MELDER:
        raise ValueError(f"Raum {raum.id}: höchstens {MAX_MELDER} Melder")
    _unique(f"Melder in {raum.id}", raum.melder)
    if any(not isinstance(m, str) or not m or len(m) > 255 for m in raum.melder):
        raise ValueError(f"Raum {raum.id}: Melder ungültig")
    for zone in raum.zonen:
        if not zone.melder:
            raise ValueError(f"Zone {zone.name}: Melder wählen, der sie meldet")
        if any(m not in raum.melder for m in zone.melder):
            raise ValueError(f"Zone {zone.name}: Melder gehört nicht zum Raum")
        if zone.id == MELDER_ZONE_ID:
            raise ValueError(f"Zone {zone.id}: Kennung ist vergeben")
    _range("melder_nachlauf_s", raum.melder_nachlauf_s, 0, MAX_NACHLAUF_S)
    for key, lage in raum.melder_lagen.items():
        if key not in raum.melder:
            raise ValueError(f"Raum {raum.id}: Lage für unbekannten Melder")
        for name in ("x", "y"):
            _range(name, getattr(lage, name), -MAX_KOORDINATE_CM, MAX_KOORDINATE_CM)
        _range("Melder winkel", lage.winkel, -180, 180)
        _range("reichweite_cm", lage.reichweite_cm, 50, MAX_REICHWEITE_CM)
        _range("oeffnung_grad", lage.oeffnung_grad, 10, 360)


def _check_ziel(was: str, ziel: str, raum_id: str, raum_ids: set[str]) -> None:
    if ziel and ziel != FUEHRT_ZU_AUSSEN and (ziel not in raum_ids or ziel == raum_id):
        raise ValueError(f"{was}: unbekannter Raum {ziel!r}")


def _check_oeffnungen(raum: RaumConfig, raum_ids: set[str]) -> None:
    n = len(raum.umriss)
    if raum.oeffnungen and n < 3:
        raise ValueError(f"Raum {raum.id}: Öffnungen brauchen Wände")
    if len(raum.oeffnungen) > MAX_ZONEN_JE_RAUM:
        raise ValueError(f"Raum {raum.id}: zu viele Öffnungen")
    for o in raum.oeffnungen:
        if o.art not in OEFFNUNG_ARTEN:
            raise ValueError(f"Raum {raum.id}: unbekannte Öffnung {o.art!r}")
        if o.anschlag not in ANSCHLAG or o.aufgehen not in AUFGEHEN:
            raise ValueError(f"Raum {raum.id}: unbekannter Türanschlag")
        if not isinstance(o.kante, int) or not 0 <= o.kante < n:
            raise ValueError(f"Raum {raum.id}: Öffnung an unbekannter Wand")
        (x1, y1), (x2, y2) = raum.umriss[o.kante], raum.umriss[(o.kante + 1) % n]
        laenge = math.hypot(x2 - x1, y2 - y1)
        if not (0 <= o.von < o.bis <= laenge + 0.5):
            raise ValueError(f"Raum {raum.id}: Öffnung liegt nicht auf der Wand")
        _check_ziel(f"Raum {raum.id} (Öffnung)", o.fuehrt_zu, raum.id, raum_ids)


def _check_sensor(raum_id: str, sensor: SensorConfig) -> None:
    for name in ("x", "y"):
        _range(
            f"Sensor {name}",
            getattr(sensor, name),
            -MAX_KOORDINATE_CM,
            MAX_KOORDINATE_CM,
        )
    _range("Sensor winkel", sensor.winkel, -180, 180)
    _range("reichweite_cm", sensor.reichweite_cm, 50, MAX_REICHWEITE_CM)
    _range("oeffnung_grad", sensor.oeffnung_grad, 10, 360)
    if sensor.quelle not in QUELLEN:
        raise ValueError(f"Raum {raum_id}: unbekannte Quelle {sensor.quelle!r}")
    if sensor.quelle == QUELLE_MQTT:
        topic = sensor.mqtt_topic
        if not topic or any(c in topic for c in "+#") or topic.endswith("/"):
            raise ValueError(f"Raum {raum_id}: MQTT-Thema ungültig")
    elif not sensor.device_id:
        raise ValueError(f"Raum {raum_id}: Gerät fehlt")


def _range(name: str, value: float, lo: float, hi: float) -> None:
    if isinstance(value, bool) or not isinstance(value, int | float):
        raise ValueError(f"{name} muss eine Zahl sein")
    if not math.isfinite(value) or not lo <= value <= hi:
        raise ValueError(f"{name} muss zwischen {lo} und {hi} liegen")


def _unique(what: str, ids: list[str]) -> None:
    seen = set()
    for i in ids:
        if i in seen:
            raise ValueError(f"{what}: ID {i!r} doppelt")
        seen.add(i)


def _floor_id(value: str) -> bool:
    return (
        isinstance(value, str)
        and 0 < len(value) <= 64
        and all(c.isalnum() or c in "_-" for c in value)
    )


def _ident(what: str, value: str) -> None:
    if not value or len(value) > 64 or not all(c.isalnum() or c in "_-" for c in value):
        raise ValueError(f"{what}: ungültige ID {value!r}")


def _check_form(zone_id: str, form: dict[str, Any]) -> None:
    try:
        shape = shape_from_dict(form)
    except (KeyError, TypeError, ValueError) as err:
        raise ValueError(f"Zone {zone_id}: Form ungültig: {err}") from err
    if isinstance(shape, Polygon):
        if len(shape.points) > MAX_ECKEN:
            raise ValueError(f"Zone {zone_id}: höchstens {MAX_ECKEN} Ecken")
        coords = [c for p in shape.points for c in p]
    else:
        assert isinstance(shape, Cells)
        if not MIN_ZELLE_CM <= shape.size <= MAX_ZELLE_CM:
            raise ValueError(
                f"Zone {zone_id}: Zellgröße {MIN_ZELLE_CM} bis {MAX_ZELLE_CM} cm"
            )
        coords = [
            v
            for i, j in shape.cells
            for v in (shape.x0 + i * shape.size, shape.y0 + j * shape.size)
        ]
    if any(abs(c) > MAX_KOORDINATE_CM for c in coords):
        raise ValueError(f"Zone {zone_id}: liegt außerhalb von ±{MAX_KOORDINATE_CM} cm")
