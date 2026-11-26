# Vertrag `raumzonen/1`

Was Raumzonen anderen Integrationen (zuerst dem Homebrain) liefert. Gilt ab
Raumzonen 0.4.0. Abgestimmt mit dem Homebrain (`docs/KONZEPT.md`, Abschnitt
„Schnittstelle zum Homebrain“). Beispiele aus einem simulierten Lauf liegen
in `docs/homebrain/beispiele/`; `tests/test_vertrag.py` prüft, dass sie zum
Code passen.

## Grundregeln

1. **Nur lesen.** Nichts in diesem Vertrag schaltet etwas im Haus.
2. **Neue Felder dürfen dazukommen**, die Bedeutung bestehender Felder ändert
   sich nie. Abnehmer ignorieren unbekannte Felder. Eine inkompatible
   Änderung bekommt einen neuen Namen (`raumzonen/2`).
3. **Fehlt ein Wert (`null`), heißt das „weiß nicht“**, nie „nein“ und nie
   0. Beispiele: `mikro` ist ohne Quelle MQTT immer `null`; `sicherheit`
   ist in 0.4.0 immer `null` und darf nicht als 0 % gelesen werden; `haus`
   ist `null`, solange der Raum nicht im Hausplan liegt.
4. **Schweigen heißt nicht „niemand da“.** Der FP400 schickt in Ruhe
   minutenlang nichts. Raumzonen hält die Figur (`gehalten`); eine gehaltene
   Spur ist eine Aussage („jemand ist vermutlich noch da“), kein Fehler.
5. **Spur-Kennungen (`spur_id`) gelten nur bis zum nächsten Neuladen.** Nach
   jedem Laden (auch Speichern im Panel) beginnen sie neu; `spuren_seit`
   sagt, ab wann. Nicht dauerhaft speichern.
6. **Positionen gibt es nur hier**, nie in Entitäten oder Ereignissen.
7. Einheiten: Längen in **cm**, Zeiten in **s**, Winkel in **Grad**,
   Zeitpunkte als ISO 8601 in UTC, `sicherheit` in **Prozent** (50 bis 100).

## Wege

### Python (gleiche Home-Assistant-Instanz)

```python
from custom_components.raumzonen.api import get_api

api = get_api(hass)  # None, wenn Raumzonen nicht installiert ist
if api is not None and api.schema == "raumzonen/1":
    aufbau = api.raeume()  # Liste wie beispiele/raeume.json
    jetzt = api.momentaufnahme()  # wie beispiele/momentaufnahme.json
    jetzt = api.momentaufnahme("schlafzimmer")  # nur ein Raum
    abmelden = api.abonnieren(meldung, arten={"zone", "sensor", "geladen"})
```

* `meldung(nachricht)` wird in der Ereignisschleife aufgerufen (wie ein
  `@callback`): kurz halten, nichts blockieren. Wirft sie einen Fehler, wird
  er protokolliert; Raumzonen läuft weiter.
* `arten`: Teilmenge von `zone`, `sensor`, `spur`, `geladen`.
  Standard: `zone`, `sensor`, `geladen`. Optional `raum_id`.
* `get_api(hass)` ist der feste Zugang; dahinter liegt
  `hass.data["raumzonen_api"]`, das sich ändern darf.
* `api.geladen`: `False` zwischen Entladen und Laden. Der Verteiler bleibt
  über das Neuladen erhalten; **Abos bleiben bestehen**.

### WebSocket (für alle angemeldeten Nutzer)

| Befehl | Antwort |
|---|---|
| `raumzonen/v1/schema` | `{"schema", "geladen", "raeume"}` |
| `raumzonen/v1/snapshot` (`raum_id` optional) | Momentaufnahme |
| `raumzonen/v1/subscribe` (`arten`, `raum_id` optional) | Ergebnis: Momentaufnahme; danach Ereignisse = Meldungen |
| `raumzonen/aufnahme/get` (`raum_id`, `von`, `bis`) | **nur Admins**: Zeilen der eigenen Aufnahme, höchstens 24 h je Abruf |

## Meldungen im Abo

Jede Meldung: `{"schema", "seq", "art", "raum_id", "zeit", "daten"}`.
`seq` zählt **je Abo** ab 1 lückenlos hoch; fehlt eine Nummer, wurde eine
Meldung verpasst (dann eine Momentaufnahme holen). Beim WebSocket ist jedes
`raumzonen/v1/subscribe` ein eigenes Abo.

| Art | Wann | `daten` |
|---|---|---|
| `zone` | sofort, wenn sich `belegt`, `zustand`, `personen`, `mensch` oder `hund` einer Zone ändert | eine Zone (siehe unten) |
| `sensor` | sofort, wenn sich `erreichbar`, `daten_frisch`, `unvollstaendig` oder `problem` ändert | Sensor |
| `spur` | wenn sich an den Spuren etwas ändert, **höchstens zweimal je Sekunde je Raum**; in Ruhe nichts | `{"spuren_seit", "spuren": [...]}` |
| `geladen` | nach jedem Laden von Raumzonen | Aufbau aller Räume (wie `raeume()`); `raum_id` ist leer |

Nach `geladen` am besten eine neue Momentaufnahme holen.

## Aufbau (`raeume()`)

| Feld | Bedeutung |
|---|---|
| `raum_id`, `name`, `art` | Raum; `art` `radar` (FP400 mit Zonen und Spuren) oder ab 0.8.0 `melder` (nur Bewegungs-/Präsenzmelder: eine Zone `anwesenheit` = ganzer Raum, keine Spuren, keine Positionen) |
| `melder` | ab 0.8.0, nur bei `art` `melder`: `entity_id` der Melder (leer bei Radar-Räumen) |
| `bereich_id` | Bereich in Home Assistant, falls zugeordnet, sonst `null` |
| `haus` | Lage des Raums im Hausplan: `x`, `y` (cm), `winkel` (Grad); `null`, solange nicht gesetzt (ab 0.5.0 im Panel unter „Haus“ einstellbar) |
| `sensor` | `device_id`, `quelle` (`mqtt`/`entitaet`), `lage` (`x`, `y`, `winkel` im Raum), `reichweite_cm`, `oeffnung_grad` |
| `umriss` | Wände als Punkte im Raum (cm), leer = nicht gezeichnet |
| `oeffnungen` | ab 0.6.0: Türen und offene Stellen in den Wänden: `kante` (Wand von Ecke `kante` zu `kante`+1), `von`/`bis` (cm ab dieser Ecke), `art` `tuer` oder `offen`; ab 0.6.2 bei Türen `anschlag` (`anfang`/`ende`: Scharnier an welcher Seite) und `aufgehen` (`innen`/`aussen`); ab 0.8.0 `fuehrt_zu` wie bei `raender`. Nur Zeichnung; „betreten/verlassen“ erkennt Raumzonen an Zonen der Art `ausgang` |
| `zonen` | alle Zonen: `zone_id`, `name`, `art`, `form` |
| `raender` | Türen (`art` `ausgang`): `rand_id`, `name`, `form`, `fuehrt_zu` |
| `stellen` | Stellen (`art` `stelle` oder `hundeplatz`): `stelle_id`, `name`, `art`, `form` |

`fuehrt_zu`: `"aussen"` (draußen oder Raum ohne Sensor), eine andere
`raum_id`, oder `null` (noch nicht eingetragen = weiß nicht).

Zonenarten: `normal` (Bett, Bereich), `durchgang` (ab 0.6.0: Gang, nur
durchgehen), `ausgang` (Tür), `stelle` (Platz zum
Beobachten, z. B. Ofen, Sessel), `hundeplatz`, `stoerquelle` (Punkte dort
zählen nirgends).

Formen: `vieleck` (`punkte`), `rechteck` (`mitte`, `breite`, `tiefe`,
`winkel`), `zellen` (`groesse`, `zellen`, optional `x0`, `y0`); alles in
Raumkoordinaten (cm).

## Momentaufnahme

`{"schema", "zeit", "raeume": [...]}`, je Raum:

| Feld | Bedeutung |
|---|---|
| `daten_ok` | wie `sensor.daten_frisch` |
| `spuren_seit` | ab wann die `spur_id` gelten |
| `sensor` | siehe unten |
| `zonen` | alle Zonen |
| `stellen` | je Stelle: `stelle_id`, `ziel_da`, `seit`, `bewegt`, `spuren` (Liste `spur_id`) |
| `spuren` | alle Spuren |

### Sensor

| Feld | Bedeutung |
|---|---|
| `erreichbar` | verbunden und nicht als offline gemeldet |
| `daten_frisch` | erreichbar **und** nicht abgeschnitten. Heißt **nicht** „hat gerade gemeldet“ (Grundregel 4) |
| `letzte_meldung_vor_s` | Sekunden seit dem letzten Rahmen, `null` = noch keiner |
| `unvollstaendig` | `true`: Der Sensor meldete mehr Ziele, als ankamen (Funkweg schneidet ab). `null`: nicht bekannt (nur mit Quelle MQTT bekannt) |
| `problem` | Text, falls die Verbindung nicht klappt, sonst `null` |

### Zone

| Feld | Bedeutung |
|---|---|
| `zone_id`, `raum_id`, `name`, `art` | |
| `belegt` | Entscheidung von Raumzonen (wie die Entität „belegt“) |
| `zustand` | `belegt`, `frei` oder `unklar` (wenn `daten_ok` falsch ist; `belegt` bleibt dann der letzte Stand) |
| `sicherheit` | Prozent 50 bis 100; **in 0.4.0 immer `null` = weiß nicht** (kommt in Phase 4b). Unter 60 % gilt der Zustand als `unklar` |
| `grund` | letzter Grund des Wechsels: `betreten`, `verlassen` oder `ausgang` (durch eine Tür gegangen); `null` = seit dem Laden noch kein Wechsel. Weitere Gründe können dazukommen (geplant für 4b: Schläfer gehalten, Daten fehlen) |
| `daten_ok` | wie beim Raum |
| `personen` | gezählte Personen (wie die Entität „Personen“) |
| `mensch`, `hund` | Spuren in der Zone, die gerade als Mensch bzw. vermutlich Hund gelten |
| `seit` | Zeitpunkt des letzten Wechsels, `null` = unbekannt |

### Spur

| Feld | Bedeutung |
|---|---|
| `spur_id` | `<raum_id>-<nummer>`, gültig bis zum Neuladen |
| `neu_seit_laden` | `true`: kam nach dem ersten Rahmen nach dem Laden dazu. `false`: war schon im ersten Rahmen da, hat nur eine neue Nummer bekommen (der Mensch war vermutlich schon vorher im Raum) |
| `x`, `y` | Position im Raum (cm); ab 0.7.0 gegen Zittern geglättet (in Ruhe stark, bei Bewegung kaum) |
| `gehalten` | der Sensor sieht sie gerade nicht, Raumzonen hält sie |
| `bewegt` | bewegt sich gerade (nach Raumzonen, nicht nach dem Sensor) |
| `still_seit`, `still_s` | seit wann bzw. wie lange ruhig; `null` während Bewegung |
| `geschwindigkeit` | cm/s über die letzten 1,5 s, `null` = zu wenig Punkte |
| `mikro` | Mikro-/Atempunkte des Sensors (nur Quelle MQTT, Firmware ab 0060), sonst `null` |
| `art_sensor` | Art laut Sensor (`person`, `pet`, …) oder `null` |
| `herkunft` | wie die Spur entstand; **in 0.4.0 immer `unbekannt`**. Ab 4b: `tuer`, `aufgetaucht`, `abdeckung`, `wiederhergestellt` |
| `klasse`, `klasse_punkte` | Einstufung; in 0.4.0 `hund` (Hinweis aus Hundeplatz) oder `unklar`, Punkte leer |
| `in_zonen` | Zonen, in denen die Spur steht (ohne Stellen) |
| `an_stellen` | Stellen, an denen die Spur steht |
| `tags` | Merkmale: `hund` (vermutlich Hund), `stoerung` (in einer Störquelle), `echo` (verworfenes Echo); weitere können dazukommen |
| `seit`, `zuletzt` | erster und letzter Rahmen mit dieser Spur |

## Aufnahme abrufen (nur Admins)

`raumzonen/aufnahme/get` liefert Zeilen im Format `fp400-trace/2`
(`docs/DATENFORMAT.md`): zuerst eine Kopfzeile mit Lage des Sensors, dann je
Rahmen `zeit`, `ziele` (roh, Sensorkoordinaten, vor jeder Filterung),
`spuren` und ggf. `gemeldet`. Höchstens 24 h und 200 000 Zeilen je Abruf.
Die Aufnahme ist je Raum abschaltbar (Panel, „Sensor und Raum“) und wird
nach `aufnahme_tage` (Standard 30) gelöscht.

## Was in Phase 4b dazukommt

`herkunft`, `klasse`/`klasse_punkte`, `sicherheit` und `zustand` „unklar“
bei geringer Sicherheit; `api.hinweise_abonnieren()` mit `hinweis/1`.
Bestehende Felder behalten ihre Bedeutung.
