"""KI-Vorschläge: das Gesamtsystem für eine KI beschreiben, Vorschläge holen.

Ablauf (nur auf Knopfdruck eines Admins im Panel):

1. ``beschreibung()`` baut ein JSON (Format ``raumzonen-ki/1``): Räume, Zonen
   mit Regeln, Türen und ihre Verbindungen, Sensoren und Melder (Lage im
   Plan, Reichweite laut Plan, Einstellungen am Gerät), die Lage jetzt, die
   letzten Wege und die Automationen, die Anzeigen von Raumzonen oder die
   Melder benutzen.
2. ``anweisung()`` legt den Prompt mit den Optionen zur Verbesserung und dem
   festen Antwortformat ``raumzonen-vorschlag/1`` darum.
3. Geschickt wird über die KI-Schnittstelle von Home Assistant
   (``ai_task.generate_data``); welche KI das ist, stellt der Besitzer in
   Home Assistant ein.
4. ``vorschlaege_lesen()`` prüft die Antwort. Jeder Vorschlag bekommt einen
   Fingerabdruck; verworfene werden gemerkt und beim nächsten Lauf weder
   gezeigt noch der KI erneut nahegelegt.

Raumzonen setzt angenommene Vorschläge nur selbst um, wenn sie die eigenen
Zonen-Regeln betreffen (``zone_regel``). Alles andere (Automationen, Geräte)
wird als „angenommen“ gemerkt und von dem umgesetzt, der dafür zuständig ist.
Es wird nichts im Haus geschaltet.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
import hashlib
import json
import math
import re
from typing import Any

FORMAT = "raumzonen-ki/1"
VORSCHLAG_FORMAT = "raumzonen-vorschlag/1"
ARTEN = (
    "zone_regel",
    "zone_form",
    "tuer_zone",
    "melder_einstellung",
    "sensor_lage",
    "automation",
    "sonstiges",
)
# Diese Arten setzt Raumzonen nach „Annehmen“ selbst um.
SELBST_UMSETZBAR = frozenset({"zone_regel"})
MAX_VORSCHLAEGE = 20
MAX_TEXT = 600
# Felder einer Zonen-Regel, die ein Vorschlag ändern darf, mit Grenzen.
REGEL_FELDER = {
    "belegt_nach_s": (0.0, 600.0),
    "frei_nach_s": (0.0, 3600.0),
    "rand_cm": (0.0, 200.0),
}
# Einstellungen am Melder, die die Beschreibung mitliefert (Endung der
# ``number``-Entität am Gerät).
GERAETE_EINSTELLUNGEN = (
    "maximum_range",
    "minimum_range",
    "fading_time",
    "radar_sensitivity",
    "detection_delay",
    "absence_delay_timer",
    "motion_sensitivity",
)


def fingerabdruck(v: Mapping[str, Any]) -> str:
    """Gleich gemeinter Vorschlag = gleicher Abdruck (Art, Raum, Ziel, Titel)."""
    titel = re.sub(r"\s+", " ", str(v.get("titel", "")).strip().lower())
    kern = "|".join(
        [
            str(v.get("art", "")),
            str(v.get("raum") or ""),
            str(v.get("ziel") or ""),
            titel,
        ]
    )
    return hashlib.sha1(kern.encode()).hexdigest()[:16]


def _json_aus_text(text: str) -> Any:
    """Das erste JSON-Objekt in einer Antwort (auch in ```json … ```)."""
    if isinstance(text, (dict, list)):
        return text
    text = str(text)
    start = text.find("{")
    if start < 0:
        raise ValueError("Antwort enthält kein JSON")
    tiefe = 0
    in_text = False
    escape = False
    for i in range(start, len(text)):
        c = text[i]
        if in_text:
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == '"':
                in_text = False
        elif c == '"':
            in_text = True
        elif c == "{":
            tiefe += 1
        elif c == "}":
            tiefe -= 1
            if tiefe == 0:
                return json.loads(text[start : i + 1])
    raise ValueError("JSON in der Antwort ist nicht vollständig")


def _kurz(wert: Any, laenge: int = MAX_TEXT) -> str:
    return str(wert or "").strip()[:laenge]


def vorschlaege_lesen(
    antwort: Any,
    raum_ids: Iterable[str],
    verworfen: Iterable[str] = (),
) -> list[dict[str, Any]]:
    """Antwort der KI prüfen; Unbrauchbares und Verworfenes fällt weg."""
    daten = _json_aus_text(antwort)
    liste = daten.get("vorschlaege") if isinstance(daten, dict) else None
    if not isinstance(liste, list):
        raise ValueError("Antwort hat keine Liste „vorschlaege“")
    raeume = set(raum_ids)
    weg = set(verworfen)
    out: list[dict[str, Any]] = []
    gesehen: set[str] = set()
    for roh in liste:
        if not isinstance(roh, dict):
            continue
        art = str(roh.get("art", "sonstiges"))
        if art not in ARTEN:
            art = "sonstiges"
        raum = roh.get("raum") or None
        if raum is not None and str(raum) not in raeume:
            raum = None
        aenderung = roh.get("aenderung")
        if not isinstance(aenderung, dict):
            aenderung = {"text": _kurz(aenderung)} if aenderung else {}
        v = {
            "art": art,
            "raum": raum,
            "ziel": _kurz(roh.get("ziel"), 120) or None,
            "titel": _kurz(roh.get("titel"), 140),
            "begruendung": _kurz(roh.get("begruendung")),
            "nutzen": _kurz(roh.get("nutzen"), 300),
            "aenderung": aenderung,
        }
        if not v["titel"]:
            continue
        if art == "zone_regel" and not _regel_aenderung(v):
            # Ohne gültige Zahlen nur als Hinweis behalten.
            v["art"] = "sonstiges"
        v["id"] = fingerabdruck(v)
        if v["id"] in weg or v["id"] in gesehen:
            continue
        gesehen.add(v["id"])
        v["selbst"] = v["art"] in SELBST_UMSETZBAR
        out.append(v)
        if len(out) >= MAX_VORSCHLAEGE:
            break
    return out


def _regel_aenderung(v: Mapping[str, Any]) -> dict[str, float]:
    """Gültige Regel-Werte eines Vorschlags (leer = keine)."""
    if not v.get("raum") or not v.get("ziel"):
        return {}
    out: dict[str, float] = {}
    for feld, (lo, hi) in REGEL_FELDER.items():
        wert = v.get("aenderung", {}).get(feld)
        if isinstance(wert, bool) or not isinstance(wert, (int, float)):
            continue
        if math.isfinite(wert) and lo <= wert <= hi:
            out[feld] = float(wert)
    return out


def regel_aenderung(v: Mapping[str, Any]) -> dict[str, float]:
    """Öffentlich für ``websocket_api``: Werte, die beim Annehmen gesetzt werden."""
    return _regel_aenderung(v)


def anweisung(beschreibung: Mapping[str, Any], verworfen: Iterable[str]) -> str:
    """Prompt: Rolle, Ziele, Optionen, Regeln, Antwortformat, dann die Daten."""
    verworfen_titel = list(verworfen)
    return (
        "Du bist Fachberater für Präsenzerkennung in einem Haus mit Home Assistant. "
        "Unten steht die vollständige Beschreibung des Systems „Raumzonen“ als JSON "
        f"(Format {FORMAT}): Räume mit Wänden und Türen, Zonen mit Rollen und "
        "Haltezeiten, Radarsensoren (FP400, liefern Positionen) und Präsenzmelder "
        "(nur an/aus) mit ihrer Lage im Plan und ihren Einstellungen am Gerät, die "
        "Lage jetzt, die letzten erkannten Wege zwischen Räumen und die Automationen, "
        "die davon abhängen.\n\n"
        "Ziel: zuverlässig erkennen, wer wo ist, schnell und ohne Fehlalarm, und "
        "Automationen, die dazu passen (keine doppelten Wartezeiten, keine alten "
        "Quellen neben Raumzonen, Licht geht weder zu früh noch zu spät aus).\n\n"
        "Prüfe besonders:\n"
        "1. Haltezeiten: Frei-Zeit der Zone + Nachlauf des Melders + for: in der "
        "Automation soll die gewünschte Gesamtzeit ergeben, nicht mehr.\n"
        "2. Reichweite der Melder: Einstellung am Gerät gegen „reichweite_plan_m“ "
        "(zu groß = sieht ins Nachbarzimmer, zu klein = Ecken fehlen).\n"
        "3. Türen: Fehlt vor einer Tür eine Tür-Zone („hat_tuer_zone“: false)? "
        "Sind Türen auf beiden Seiten verbunden („gegenstueck“)?\n"
        "4. Zonen: zu klein/zu groß, überlappend, falsche Rolle, Zonen ohne "
        "Automation, Automationen mit Quellen außerhalb von Raumzonen.\n"
        "5. Melder-Räume, die einen Radarsensor im selben Bereich haben.\n"
        "6. Alles andere, was das Zusammenspiel klarer oder robuster macht.\n\n"
        "Regeln: Schlage nur vor, was sich aus den Daten begründen lässt. Nenne "
        "Räume und Zonen mit ihren Kennungen aus dem JSON. Ein Vorschlag je "
        "Änderung. Höchstens "
        f"{MAX_VORSCHLAEGE} Vorschläge, die wichtigsten zuerst. Schreibe auf "
        "Deutsch, kurz und verständlich für einen Laien. Schlage nichts vor, was "
        "Licht oder Geräte direkt von Raumzonen aus schaltet; Raumzonen meldet nur.\n"
        + (
            "Diese Vorschläge hat der Besitzer schon verworfen, schlage sie und "
            "ähnliche nicht wieder vor: " + "; ".join(verworfen_titel[:50]) + "\n"
            if verworfen_titel
            else ""
        )
        + "\nAntworte NUR mit JSON in genau diesem Format "
        f"({VORSCHLAG_FORMAT}):\n"
        '{"vorschlaege": [{"art": "'
        + "|".join(ARTEN)
        + '", "raum": "<raum_id oder null>", "ziel": "<zone_id, entity_id oder '
        'automation-id oder null>", "titel": "<ein Satz>", "begruendung": "<warum, '
        'mit Zahlen aus den Daten>", "aenderung": {<bei zone_regel: belegt_nach_s, '
        'frei_nach_s, rand_cm als Zahlen; sonst {"text": "was genau"}>}, '
        '"nutzen": "<was besser wird>"}]}\n\n'
        "Beschreibung:\n" + json.dumps(beschreibung, ensure_ascii=False)
    )
