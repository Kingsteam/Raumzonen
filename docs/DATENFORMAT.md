# Aufnahmeformate

## Testdaten: `fp400-trace/1`

Eine Aufnahme ist eine JSON-Datei mit einem Ausschnitt der Sensordaten. Sie
dient als Testfall und später als Vorschau („so hätte die Regel entschieden“).
Erzeugt wird sie mit `devtools/trace_export.py`, beschriftet mit
`devtools/trace_label.py`; gelesen mit `core/trace.py`.

```json
{
  "format": "fp400-trace/1",
  "name": "schlafzimmer-nacht-1",
  "dauer_s": 47968.6,
  "einheit": "cm (ungefähr), Koordinaten des Sensors",
  "rahmen": [
    [0.0, [[0, -176, 117]]],
    [0.3, [[0, -181, 123], [1, 12, 263]]],
    [5.6, []],
    [9.0, null]
  ],
  "signale": {"im_bett": [[0.0, true], [1955.9, false]], "flur": [], "bad": []},
  "ereignisse": [{"t": 1955.9, "art": "aufgestanden"}],
  "liegt": [[630.0, 1952.9]]
}
```

| Feld | Bedeutung |
|---|---|
| `rahmen` | Zeit in Sekunden **ab Beginn des Ausschnitts** und die Ziele dieses Rahmens. Ein Ziel ist `[id, x, y]` oder `[id, x, y, bewegt, art]` (`bewegt` true/false, `art` wie im Konverter, z. B. `person`, `pet`). `[]` = Sensor sieht niemanden, `null` = Sensor nicht verfügbar |
| `signale` | grobe Vergleichssignale (an/aus) unter neutralen Namen: `im_bett` (bisheriger Schalter), `flur`, `bad` (Präsenz nebenan). `null` = unbekannt |
| `ereignisse` | Beschriftung, z. B. `aufgestanden` (Zeit, zu der die Figur das Bett verlassen hat) |
| `liegt` | Zeiträume, in denen jemand im Bett lag (für Fehlalarm-Tests) |

Koordinaten: x quer, y vom Sensor weg, ungefähr Zentimeter, so wie der
Zigbee2MQTT-Konverter sie meldet.

## Eigene Aufnahme der Integration: `fp400-trace/2`

Raumzonen zeichnet je Raum selbst auf (Phase 4a), lokal unter
`<config>/raumzonen/aufnahmen/<raum_id>/JJJJ-MM-TT.jsonl.gz`, eine
JSON-Zeile je Rahmen, gepackt. Abschaltbar je Raum; gelöscht nach
`aufnahme_tage` (Standard 30). **Diese Dateien enthalten echte Zeiten und
kommen nie ins Repo**; für Tests werden sie nach `fp400-trace/1`
anonymisiert.

```json
{"format": "fp400-trace/2", "raum_id": "schlafzimmer", "sensor": {"x": 0.0, "y": 0.0, "winkel": 0.0}}
{"zeit": "<ISO 8601, UTC>", "ziele": [{"id": 0, "x": -150, "y": 200, "moving": false, "type": "person"}], "spuren": [["schlafzimmer-1", -150.0, 200.0, false, []]], "gemeldet": 1}
{"zeit": "<ISO 8601, UTC>", "ziele": null, "spuren": [["schlafzimmer-1", -150.0, 200.0, true, []]]}
```

| Feld | Bedeutung |
|---|---|
| Kopfzeile | `format`, `raum_id`, Lage des Sensors im Raum. Kommt am Anfang jeder Datei und nach jeder Änderung der Lage wieder |
| `zeit` | Zeitpunkt des Rahmens |
| `ziele` | Rohziele des Sensors in **Sensorkoordinaten**, vor jeder Filterung: `id`, `x`, `y` und, soweit der Konverter sie liefert, `moving`, `type`, `posture`, `moving_points`, `micro_points`, `tracking_state`. `null` = Sensor nicht verfügbar |
| `spuren` | Spuren von Raumzonen nach dem Rahmen, in **Raumkoordinaten**: `[spur_id, x, y, gehalten, tags]` |
| `gemeldet` | `target_count` des Sensors, falls geliefert; größer als die Zahl der `ziele` = Rahmen abgeschnitten |

Abruf: WebSocket `raumzonen/aufnahme/get` (nur Admins, höchstens 24 h).

## Datenschutz

Für `fp400-trace/1` (alles im Repo) gilt: nicht enthalten und verboten: Datum und Uhrzeit, Namen von Personen, Geräten
oder Entitäten, IEEE-Adressen, IP-Adressen, Zugangsdaten. Der Test
`tests/test_datenschutz.py` prüft das für alle Dateien in `tests/daten/` und, wenn `RAUMZONEN_AUFNAHMEN` gesetzt ist, für die privaten Aufnahmen. Anonymisierte Aufnahmen liegen nicht in diesem öffentlichen Repo, sondern im privaten Repo `haus-privat` (Ordner `raumzonen/aufnahmen`).
