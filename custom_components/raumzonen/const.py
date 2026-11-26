"""Konstanten von Raumzonen."""

from __future__ import annotations

import logging
from typing import Final

DOMAIN: Final = "raumzonen"
NAME: Final = "Raumzonen"
LOGGER = logging.getLogger(__package__)

STORAGE_KEY: Final = DOMAIN
STORAGE_VERSION: Final = 1
STORAGE_MINOR_VERSION: Final = 1

# Unterstützte Sensoren. Bisher nur der Aqara FP400 über Zigbee2MQTT mit dem
# erweiterten Konverter (liefert ``tracking_targets``/``targets_xy``).
SENSOR_FP400_Z2M: Final = "fp400_z2m"
SENSOR_ARTEN: Final = (SENSOR_FP400_Z2M,)

# Woher die Rahmen kommen:
# - mqtt: Zustandsmeldung von Zigbee2MQTT (mit Bewegung und Art der Ziele),
# - entitaet: Entitäten ``targets_xy`` und ``tracking_last_update`` des Geräts.
QUELLE_MQTT: Final = "mqtt"
QUELLE_ENTITAET: Final = "entitaet"
QUELLEN: Final = (QUELLE_MQTT, QUELLE_ENTITAET)
DEFAULT_MQTT_BASIS: Final = "zigbee2mqtt"

# Abdeckung des FP400 zum Einzeichnen (Standard, änderbar; laut Datenblatt
# des eigenen Geräts prüfen).
DEFAULT_REICHWEITE_CM: Final = 600.0
DEFAULT_OEFFNUNG_GRAD: Final = 120.0
MAX_REICHWEITE_CM: Final = 1500.0

# Arten von Räumen: mit Radarsensor (Positionen, Zonen) oder nur mit
# Bewegungs-/Präsenzmeldern aus Home Assistant (belegt ja/nein, für den
# Hausplan und das Bewegungsprofil des ganzen Hauses).
RAUM_RADAR: Final = "radar"
RAUM_MELDER: Final = "melder"
RAUM_ARTEN: Final = (RAUM_RADAR, RAUM_MELDER)
# Ein Melder-Raum hat genau eine Zone: der ganze Raum.
MELDER_ZONE_ID: Final = "anwesenheit"
MAX_MELDER: Final = 10
# Grundrisse als Hintergrund (Bilder unter <config>/raumzonen/plaene/).
MAX_PLAENE: Final = 10
MAX_STOCKWERKE: Final = 10
MAX_PLAN_BYTES: Final = 8 * 1024 * 1024
MAX_NACHLAUF_S: Final = 3600.0
# Diese Arten von Binärsensoren gelten als Melder.
MELDER_KLASSEN: Final = ("motion", "occupancy", "presence")

# Türen (Zonen der Art „ausgang“) führen in einen anderen Raum oder nach außen.
FUEHRT_ZU_AUSSEN: Final = "aussen"

# Eigene Aufnahme der Rohpositionen (nicht über den Recorder).
DEFAULT_AUFNAHME_TAGE: Final = 30
MAX_AUFNAHME_TAGE: Final = 365

# Ereignis für eigene Automationen: Zone belegt/frei.
EVENT_ZONE: Final = f"{DOMAIN}_zone"

# Ohne Rahmen so lange: Sensor gilt als still, nicht als weg. Nur Hinweis
# im Diagnose-Sensor, ändert keine Zone.
STILL_HINWEIS_S: Final = 15 * 60

# --- Grenzen für Regeln (werden beim Speichern geprüft) ---------------------
# Ziel des Besitzers: „aufgestanden“ höchstens 5 s nach dem Verlassen des Betts.
# Die Tests mit den Aufnahmen prüfen genau diese Grenze; nicht abschwächen.
MAX_AUFGESTANDEN_S: Final = 5.0

MAX_BELEGT_NACH_S: Final = 600.0
MAX_FREI_NACH_S: Final = 3600.0
MAX_RAND_CM: Final = 200.0
MAX_WEG_CM: Final = 500.0
MAX_WEG_RAHMEN: Final = 20
MAX_PERSONEN: Final = 10
# Koordinaten des FP400 reichen etwa ±6 m; mehr ist sicher ein Tippfehler.
MAX_KOORDINATE_CM: Final = 2000.0
MAX_ZONEN_JE_RAUM: Final = 32
MAX_ECKEN: Final = 64
MIN_ZELLE_CM: Final = 5.0
MAX_ZELLE_CM: Final = 200.0
