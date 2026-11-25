# Raumzonen: Konzept (Kurzfassung)

Hier steht, was für den Code wichtig ist, ohne hausspezifische Angaben.
Die vollständige Fassung mit Details zum Haushalt liegt privat beim
Besitzer.

## Ziel

Präsenzzonen für Radarsensoren (zuerst Aqara FP400 über Zigbee2MQTT) als
eigene Home-Assistant-Erweiterung. Zonen beliebig geformt (Vieleck,
gedrehtes Rechteck, gemalte Zellen), eigene Regeln je Zone, eine
Zeichenoberfläche wie beim Gartenplan von FlowerPower. Räume werden einzeln
eingerichtet; weitere Sensoren kommen dazu.

## Grundsätze (Entscheidungen des Besitzers)

1. **Eine Figur löst sich nicht plötzlich in Luft auf.** Spuren mit
   Haltezeit und Schwelle statt Sekundenflackern.
2. **„Aufgestanden“ höchstens 5 s** nach dem Verlassen des Betts, damit bald
   Licht kommt.
3. **Hundeplätze nur als Hilfe** (der Hund wandert), keine feste Regel.
4. **Keine versteckten Wartezeiten:** Jede Wartezeit steht sichtbar in der
   Regel der Zone.
5. Aufnahmen aus dem Recorder dürfen genutzt werden, aber nur anonymisiert.

## Aufbau

```
Sensor-Rahmen (MQTT/Entität)  ─►  Spuren (core/tracks.py)  ─►  Zonen + Regeln (core/room.py)  ─►  Entitäten/Ereignisse
                                         ▲                               │
                                         └──── Haltezeit je Ort ◄────────┘
```

* **Spuren** (`Tracker`): ordnet Ziele über Sensor-ID und Nähe zu; ID-Wechsel
  werden überbrückt; fehlende Ziele werden *gehalten*. Kein Rahmen = keine
  Änderung. Ausfall = alles bleibt, wird nur gemeldet.
* **Zonen** (`Room`): je Zone Form, Art und Regel. Arten: `normal`,
  `ausgang` (Tür), `hundeplatz` (Hinweis), `stoerquelle` (Vorhang,
  Ventilator).
* **Regeln** (`ZoneRule`): belegt nach, frei nach, Randstreifen (Hysterese),
  Schläfer halten (nur mit Beweis hinaus: bewegte Rahmen draußen, weit
  draußen oder Tür), höchstens Personen (Echo beim Aufstehen verwerfen),
  Hund nicht zählen.
* **Haltezeit hängt vom Ort ab**: in einer Schläferzone unbegrenzt, im
  Ausgang 1 s, sonst 10 s.

Empfohlene Bett-Regel nach den Aufnahmen: belegt nach 3 s, frei nach 2 s,
Randstreifen 25 cm, Schläfer halten, 3 Rahmen, 60 cm, höchstens 1 Person
(Auswertung von vier aufgenommenen Nächten; liegt privat beim Besitzer).

## Datenmodell (gespeichert in `.storage/raumzonen`)

```
raeume[]: id, name, sensor {art: "fp400_z2m", device_id}, zonen[]
zonen[]:  id, name, art, form, regel
form:     {art: "vieleck", punkte: [[x,y],...]}
        | {art: "rechteck", mitte: [x,y], breite, tiefe, winkel}
        | {art: "zellen", groesse, zellen: [[i,j],...], x0, y0}
regel:    belegt_nach_s, frei_nach_s, rand_cm, schlaefer_halten,
          weg_rahmen, weg_cm, max_personen, hund_ignorieren
```

Grenzen stehen in `const.py` und werden beim Speichern geprüft.

## Phasen

| Phase | Inhalt | Stand |
|---|---|---|
| 0 | Daten holen und auswerten (nur lesen) | erledigt |
| 1 | Grundgerüst + Rechenkern mit Tests gegen Aufnahmen | erledigt (0.1.0) |
| 2 | Sensor anbinden (MQTT `tracking_targets`/`targets_xy`), Entitäten je Zone | erledigt (0.2.0) |
| 3 | Zeichenoberfläche (Panel), Sensor-Lage mit Abdeckung, Live-Ansicht, Bewegungskarte | erledigt (0.3.0) |
| 4a | Aufnahme der Rohpositionen, Zonenart „Stelle“, Schnittstelle `raumzonen/1` (WebSocket, Python) | erledigt (0.4.0), Vertrag `docs/homebrain/VERTRAG-raumzonen-1.md` |
| 4b | Herkunft und Einstufung je Spur, Sicherheit und „unklar“ je Zone | geplant |
| 5 | Hausplan: Räume verbinden, Pseudoräume; Weg über Räume ggf. im Homebrain | offen, Entscheidung des Besitzers |

## Wissen über den FP400 (aus dem MIT-lizenzierten Konverter, nur Wissen)

* Ziele kommen als `tracking_targets` (id, x, y, ggf. moving, type, posture)
  und als Text `targets_xy` (`id:x:y;...`, `none` = leer).
* Positionen kommen nur, wenn mindestens eine Software-Zone im Konverter
  existiert.
* Ab Firmware 0060 heißt „moving“: es gibt bewegte Punkte (auch beim Atmen
  im Stand möglich).
* Ember-Koordinatoren schneiden Rahmen mit 3 oder mehr Zielen ab.

## Koordinaten (ab 0.3.0)

* **Sensor**: x quer, y geradeaus, so wie der FP400 meldet.
* **Raum**: eigener Plan in cm (x nach rechts, y nach oben im Panel). Der
  Sensor hat darin eine Lage (`sensor.x`, `sensor.y`) und eine
  Blickrichtung (`sensor.winkel`, 0° = +y, gegen den Uhrzeigersinn).
  `core/pose.py` rechnet Sensor → Raum. Zonen, Spuren, Bewegungskarte und
  Wände liegen in Raumkoordinaten. Ohne Angabe sind beide gleich.
* **Haus** (Phase 4): jeder Raum bekommt eine Lage im Hausplan; damit
  lassen sich Räume aneinanderlegen.

## Phase 5 (Entwurf): Hausplan und Weg über Räume

Idee des Besitzers vom 25.11.2026:

* Räume werden im **Hausplan** aneinandergelegt (Lage und Drehung je Raum).
* **Pseudoräume** ohne Radar, nur mit einfachen Bewegungsmeldern
  (`binary_sensor` mit Belegung/Bewegung), z. B. Vorraum oder Flur. Raumart
  `bewegungsmelder` (Platzhalter `RAUM_ARTEN` in `const.py`).
* **Übergänge** (Türen) verbinden Räume: Ausgangszone eines Radar-Raums ↔
  Pseudoraum ↔ Ausgangszone des nächsten Raums.
* **Weg einer Person**: Verlässt eine Figur Raum A durch die Tür, meldet
  kurz darauf der Vorraum und danach Raum B an seiner Tür eine neue Figur,
  wird sie als dieselbe Person verbunden (Zeitfenster je Übergang, z. B.
  2 bis 20 s; gemessene Werte aus den Aufnahmen: Bett → Tür 0,5–1,2 s, Tür →
  Flur 2–4 s). Ergebnis: Ereignis „Person von A nach B“, Zähler je Raum.
* Prüfen gegen Aufnahmen mehrerer Räume (gleiches anonymisiertes Format,
  mit zusätzlichen Signalen der Bewegungsmelder).

## Schnittstelle zum Homebrain

Stand 25.11.2026. Grundlage: die Wünsche aus dem Projekt „Lernendes Haus /
Homebrain“ (eine eigene Integration, die Hinweise aus vielen Quellen
zusammenführt). Der verbindliche Vertrag ist
`docs/homebrain/VERTRAG-raumzonen-1.md`.

### Rollenverteilung

* **Raumzonen** ist der Spezialist *innerhalb eines Raums mit Radar*: Spuren,
  Zonen, Stellen, Aufnahme der Rohpositionen. Raumzonen liefert **Hinweise
  mit Sicherheit und Grund**, entscheidet aber nichts über andere Quellen.
* **Homebrain** führt Hinweise zusammen (Radar und andere Quellen wie
  Kameras, Telefone, Kalender) und **verbindet die Räume**.
* Raumzonen schreibt **nie** etwas an den Sensor oder an Zigbee2MQTT (keine
  Störstellen, keine Zonen im Gerät). Das bleibt so.

Folge für Phase 4 (Hausplan, Pseudoräume, Weg über Räume): Wenn das
Homebrain die Räume verbindet, gehört der **Weg einer Person über Räume**
eher ins Homebrain. Raumzonen liefert dafür die Bausteine (Spur betritt/
verlässt über Tür X, Herkunft, Zeit). Der Hausplan in Raumzonen bliebe dann
eine Anzeige. **Entschieden (25.11.2026): Der Hausplan liegt in Raumzonen**
(siehe unten, „Entscheidungen des Besitzers zu 4a“).

### Die fünf Wünsche

| Nr. | Wunsch | Einschätzung | Phase |
|---|---|---|---|
| 1 | Rohpositionen aufzeichnen | **geht mit Aufwand** (mittel); ohnehin geplant | 4a |
| 2 | Sicherheit, „unklar“, Grund je Zone | **geht mit Aufwand**; „Grund“ gibt es schon | 4b |
| 3 | Herkunft, Dauer still, Mensch/Hund je Spur | **geht**; vieles ist intern schon da | 4b |
| 4 | Markierte Stellen (z. B. Ofenstelle) | **geht**, klein | 4a |
| 5 | Stabile Schnittstelle „raumzonen/1“ | **geht**; Teile gibt es schon | 4a/4b |

#### 1. Rohpositionen aufzeichnen (geht mit Aufwand, Phase 4a)

* Heute gibt es: das Aufnahmeformat `fp400-trace/1` (für Tests,
  anonymisiert) und die Bewegungskarte (nur Speicher, 24 h).
* Neu: eine **eigene, rollierende Aufnahme je Raum** in der Integration,
  nicht über den Recorder. Ablage `<config>/raumzonen/aufnahmen/<raum>/
  JJJJ-MM-TT.jsonl.gz`, eine Zeile je Rahmen. Aufbewahrung einstellbar,
  Standard **30 Tage**, danach automatisch gelöscht. Größe nach den
  Aufnahmen: etwa 5000 Rahmen je Nacht, gepackt grob 100 kB je Raum und Tag.
* Inhalt je Rahmen: Zeit, Rohziele des Sensors (ID, x, y in
  Sensorkoordinaten, `moving`, `type`, `posture`, `moving_points`,
  `micro_points`, soweit der Konverter sie liefert), `target_count` des
  Sensors (zeigt abgeschnittene Meldungen), dazu die Spuren von Raumzonen
  (Spur-Nummer, x/y im Raum, gehalten, Tags) und die Lage des Sensors.
* **Atem-/Mikropunkte** kommen nur über die Quelle **MQTT**
  (`tracking_targets`, Firmware ab 0060), nicht über `targets_xy`.
* Auch für einen Raum **ohne Zonen** (z. B. Küche: nur aufzeichnen).
* Aufgezeichnet wird **vor** jeder Filterung (Echo, Störquelle), sonst
  ließe sich das Ofen-Geisterziel nicht zählen.
* Abfrage: WebSocket `raumzonen/aufnahme/get` (Zeitraum, nur Admin) und
  Export ins anonymisierte Format `fp400-trace/1` für Tests.
* Datenschutz: Die Aufnahme zeigt, wo sich Menschen bewegt haben. Sie bleibt
  lokal, ist nur für Admins abrufbar, ist je Raum abschaltbar und kommt
  nie ins Repo (nur anonymisiert, Regel 6 in `CLAUDE.md`).
* Für eine **erste Messung ohne Raumzonen** kann man in Home Assistant die
  Entität `targets_xy` eines FP400 aktivieren; dann zeichnet der Recorder die
  Positionen auf. Das ist eine Einstellung an Home Assistant und deshalb hier
  nur ein Hinweis.

#### 2. Sicherheit, „unklar“ und Grund je Zone (geht mit Aufwand, Phase 4b)

* „Grund“ gibt es schon (`betreten`, `verlassen`, `ausgang`). Er wird zu
  Klartext erweitert, z. B. „Person liegt seit 2 h still im Bett“, „Figur
  gehalten, Sensor meldet seit 40 min nichts“.
* **„unklar“** neben belegt/frei, wenn: der Sensor nicht erreichbar ist,
  die letzte Meldung zu alt ist und keine Figur gehalten wird, Meldungen
  abgeschnitten sind (`target_count` größer als die Zahl der Ziele), oder
  nur ein Echo bzw. „vermutlich Hund“ die Zone hält.
* **Sicherheit 0–100 %** nach festen, getesteten Regeln (keine Blackbox),
  z. B. sichtbare, bewegte Person in der Zone: hoch; gehaltene Figur: sinkt
  langsam mit der Zeit ohne Meldung; nur Hund oder Echo: niedrig. Die Regeln
  werden gegen die Aufnahmen geprüft.
* Wichtig für bestehende Automationen: Der Binärsensor „belegt“ bleibt
  **an/aus** (Grundsatz: eine Figur verschwindet nicht). Zusätzlich je Zone
  ein Sensor „Zustand“ (`belegt`/`frei`/`unklar`) mit den Attributen
  `sicherheit` und `grund`. Diese Werte ändern sich selten und sind darum
  für den Recorder unbedenklich.

#### 3. Je Spur: Herkunft, Dauer still, Mensch/Hund (geht, Phase 4b)

* Schon intern vorhanden: erste Sichtung, letzte Bewegung (also „Dauer
  still“), Hundepunktwert, Art vom Sensor, Tags (gehalten, Echo, Störung).
* Neu: **Herkunft** beim Entstehen einer Spur: `tuer:<zone>` (kam durch
  einen Ausgang), `rand` (am Rand der Abdeckung oder an einer Wand
  aufgetaucht), `zone:<zone>` (in einer Zone aufgetaucht, z. B. Bett) oder
  `aufgetaucht` (mitten im Raum ohne Weg; typisch für Geisterziele). Bei
  einer Übernahme (neue Sensor-ID) bleibt die Herkunft der alten Spur.
* **Einstufung** `mensch`/`hund`/`unklar` mit Punktwert 0–100 aus: Art vom
  Sensor (`person`, `pet`), Hundeplätzen, Bewegungsmuster. Nur ein Hinweis;
  der Hund wandert (Grundsatz).
* Geliefert nur über Schnittstelle (WebSocket/Python), **nie als Entität
  oder Ereignis** (Positionen fluten sonst den Recorder).

#### 4. Markierte Stellen (geht, Phase 4a)

* Neue Zonenart **`stelle`** (Rolle „Stelle“ im Panel, z. B. „Ofenstelle“,
  „Fenster“, „Vorhang“): Raumzonen meldet, ob und seit wann ein Ziel dort
  steht, ob es sich bewegt und welche Herkunft es hat.
* Anders als „Ignorieren“ (Störquelle) **filtert eine Stelle nichts**. Ob
  das Ziel an der Ofenstelle echt ist, entscheidet das Homebrain mit dem
  Ofenzustand. Raumzonen setzt **keine Störstelle im Sensor**; das macht
  der Besitzer bei Bedarf selbst.
* Die Aufnahme (Nr. 1) erlaubt danach zu zählen, wie oft und wie lange an
  der Stelle ein Ziel auftauchte.

#### 5. Stabile Schnittstelle „raumzonen/1“ (geht, Phase 4a/4b)

Ein versionierter Vertrag. Ändert sich etwas, ohne Abnehmer zu brechen,
bleibt es `raumzonen/1` (neue Felder dürfen dazukommen, keine verschwinden);
sonst `raumzonen/2`, und die alte Version läuft eine Weile mit.

| Weg | Inhalt | Positionen? | Stand |
|---|---|---|---|
| Entitäten | je Zone belegt (an/aus), Zustand (belegt/frei/unklar) mit `sicherheit`, `grund`; je Raum Sensor verbunden, Figuren, `daten_ok` | nein | teils da |
| Ereignis `raumzonen_zone` | Zone belegt/frei mit Grund (für Automationen) | nein | da |
| WebSocket `raumzonen/v1/snapshot` und `raumzonen/v1/subscribe` | Räume, Zonen mit Zustand/Sicherheit/Grund, Spuren mit x/y im Raum, Herkunft, Dauer still, Einstufung, Stellen | ja | Vorstufe `live/subscribe` da |
| Python-Schnittstelle `custom_components/raumzonen/api.py` | `async_subscribe(hass, callback)` und `snapshot(hass)` mit denselben Daten, für ein Homebrain als eigene Integration | ja | neu |
| WebSocket `raumzonen/aufnahme/get` | Rohpositionen eines Zeitraums | ja | neu |
| MQTT-Ausgabe | gleiches Format auf einem lokalen Thema | ja | optional, **standardmäßig aus** |

Form einer Momentaufnahme (Vorschlag):

```json
{
  "vertrag": "raumzonen/1",
  "zeit": "…",
  "raum": "kueche",
  "daten_ok": true,
  "sensor": {"verbunden": true, "letzte_meldung_vor_s": 2.1, "abgeschnitten": false},
  "zonen": [
    {"id": "essbereich", "zustand": "belegt", "belegt": true, "sicherheit": 82,
     "grund": "Person sitzt seit 6 min still", "personen": 1}
  ],
  "stellen": [
    {"id": "ofenstelle", "ziel_da": true, "seit_s": 940, "bewegt": false,
     "spur": 7}
  ],
  "spuren": [
    {"spur": 7, "x": 412.0, "y": 188.5, "gehalten": false, "bewegt": false,
     "still_s": 940, "herkunft": "aufgetaucht", "einstufung": "unklar",
     "punkte": {"mensch": 35, "hund": 10}, "in_zonen": ["ofenstelle"]}
  ]
}
```

Gemeinsames Hinweis-Format: Das Homebrain plant ein Format „hinweis/1“.
Raumzonen kann seine Zonen- und Stellen-Zustände zusätzlich in diesem
Format liefern (Quelle, Raum, Zone/Stelle, Aussage, Sicherheit, Grund,
Zeit, gültig bis), sobald es festgelegt ist. Bis dahin ist der Vertrag
oben maßgeblich.

### Was ohnehin geplant war, was zusätzlich ist, was nicht hineingehört

* **Ohnehin geplant:** eigene Aufnahme (Nr. 1), Positionen nur über
  WebSocket, Raumkoordinaten, Hundehinweis, stabile Ereignisse.
* **Zusätzlich:** Sicherheit und Zustand „unklar“, Herkunft je Spur,
  Einstufung mit Punktwert, Zonenart „Stelle“, Python-Schnittstelle,
  versionierter Vertrag, optionale MQTT-Ausgabe.
* **Gehört nicht in Raumzonen:** entscheiden, ob ein Ziel am Ofen eine
  Störung ist (braucht den Ofenzustand); andere Quellen zusammenführen; Störstellen im Sensor setzen; vermutlich auch
  der Weg einer Person über mehrere Räume (siehe Rollenverteilung).

### Abgleich mit dem Homebrain-Entwurf 1

Der Entwurf der Homebrain-Seite (Abschnitt E, liegt privat beim Besitzer)
passte grundsätzlich; hier die Antworten auf seine offenen Punkte (E.7) und
die Abweichungen. Verbindlich ist inzwischen der Vertrag
`docs/homebrain/VERTRAG-raumzonen-1.md`.

**E.7.1 Datenmodell 1.1–1.3: passt, mit diesen Abweichungen**

* `raum_id` ist bei Raumzonen ein eigener, stabiler Schlüssel (aus dem
  Namen gebildet), nicht der HA-Bereich. Neu in 4a: Feld `bereich_id`
  (HA-Bereich) je Raum, damit das Homebrain zuordnen kann.
* `sensoren`: bisher ein Sensor je Raum. `erreichbar` = Verfügbarkeit von
  Zigbee2MQTT. **`daten_frisch` darf nicht „letzte Meldung neu“ heißen**: Der
  FP400 schweigt bei ruhig Liegenden bis zu einer Stunde, das ist kein
  Fehler. Vorschlag: `daten_frisch` = erreichbar und keine abgeschnittenen
  Meldungen; das Alter der letzten Meldung kommt getrennt als
  `letzte_meldung_vor_s`. `unvollstaendig` (Ember-Kürzung) gibt es nur mit
  der Quelle MQTT (`target_count` des Konverters).
* `raender`: Türen sind bei Raumzonen Zonen der Art „Ausgang“. Sie bekommen
  in 4a das Feld `fuehrt_zu` (Raum-ID oder `aussen`); `rand_id` ist die
  Zonen-ID.
* `stellen`: neue Zonenart „Stelle“ (4a). Der bisherige „Hundeplatz“ bleibt
  eine eigene Art (er wirkt auf die Hunderkennung), wird aber zusätzlich als
  Stelle gemeldet.
* Spur `spur_id`: stabil über Kennungswechsel des Sensors, aber **nicht über
  ein Neuladen** (Neustart, Speichern im Panel); danach beginnen neue
  Nummern. Form `<raum_id>-<nummer>`; ein Feld `neu_seit_laden` zeigt das an.
* `herkunft`: Werte `rand:<tür-zone>` (kam durch eine Tür), `abdeckung`
  (am Rand der Sensorabdeckung oder an einer Wand aufgetaucht; neu
  gegenüber dem Entwurf), `zone:<id>`, `aufgetaucht`, `unbekannt`.
* `klasse_punkte` „je Regel“: in 4b zuerst als Summe `mensch`/`hund`, die
  Aufschlüsselung je Regel danach.
* `mikro`: nur mit Quelle MQTT und Firmware ab 0060 (`micro_points`).
* Zonenzustand `sicherheit`: Raumzonen übernimmt die Bedeutung des Entwurfs
  (**50–100 %, wie sicher die gegebene Antwort ist**), nicht 0–100 %. Der
  Zustand „unklar“ entsteht, wenn `daten_ok` falsch ist oder die Sicherheit
  unter 60 % liegt; `belegt` an/aus bleibt trotzdem stehen.
* Einheiten: Entitäten in Prozent, `hinweis/1` als Zahl 0–1 (wie im
  Entwurf). Das wird im Vertrag ausdrücklich festgehalten.

**E.7.2 Raumkoordinaten und Hausplan**

* Ja: Jeder Raum hat ein festes, gerades Koordinatensystem in cm (Wände
  waagrecht/senkrecht im Panel). Die Lage des Sensors darin ist gespeichert;
  ändert sie sich, ändern sich Raumkoordinaten nicht.
* Vorschlag Hausplan: Die **Lage jedes Raums im Haus** (x, y, Drehung)
  speichert Raumzonen, weil es die Zeichenoberfläche hat, und liefert sie
  über `api.raeume()`. Die **Wege über Räume** berechnet das Homebrain.
  Entscheidung des Besitzers.

**E.7.3 Ränder/Türen mit `fuehrt_zu`:** Phase 4a (Feld an der Tür-Zone, im
Panel auswählbar).

**E.7.4 Rate 2 Meldungen/s je Raum:** passt. Der Rechenkern arbeitet je
Rahmen (bis etwa 3/s); die Python-Schnittstelle bündelt auf höchstens 2/s je
Raum, Zonenänderungen kommen sofort. Das Panel bleibt bei 5/s.

**E.7.5 Phasen für `api.py` und Abo**

* 4a: `async_get_api`, `schema`, `raeume()`, `momentaufnahme()`,
  `abonnieren()` für `zone`, `sensor` und `spur` (Spuren gibt es intern
  schon, das Abo ist günstig); WebSocket `raumzonen/v1/schema|snapshot|
  subscribe`, `raumzonen/aufnahme/get`. Felder, die erst 4b füllt
  (`herkunft`, `klasse`, `sicherheit`), sind in 4a schon da und stehen auf
  `unbekannt` bzw. leer.
* 4b: Herkunft, Klasse, Sicherheit/unklar, `hinweise_abonnieren()` mit
  `hinweis/1`.

**Vom Homebrain bestätigt (25.11.2026), gehört so in den Vertrag**

* Alle Abweichungen oben sind angenommen (Homebrain: SCHNITTSTELLE.md,
  Entwurf 2, Abschnitt 8). Das Homebrain speichert Spur-Kennungen nicht
  dauerhaft; `abdeckung` bekommt dort einen schwächeren Punktwert als
  `aufgetaucht`.
* **Schweigen heißt nicht „niemand da“.** Hinweise (`hinweis/1`) über
  ruhige Spuren bekommen ein langes `gueltig_bis` oder werden fortgeschrieben,
  solange Raumzonen die Spur hält. Sonst würden sie beim Homebrain
  fälschlich verfallen.
* **Fehlende Felder bedeuten „weiß nicht“, nicht „nein“** (z. B. `mikro`
  oder `unvollstaendig` ohne Quelle MQTT).
* Der Vertrag `docs/homebrain/VERTRAG-raumzonen-1.md` ist mit 0.4.0
  geschrieben (Phase 4a vom Besitzer freigegeben).

**Entscheidungen des Besitzers zu 4a (25.11.2026)**

* Hausplan in Raumzonen: **ja**. Türen bzw. Bereiche um Türen sind die
  Verbindungspunkte; daraus wird „betreten“/„verlassen“. In 0.4.0: Tür
  „führt zu“ und Felder für die Lage im Haus; in 0.5.0 das Anordnen der
  Räume im Panel (Ansicht „Haus“).
* Live-Punkte **für alle Nutzer**, nicht nur Admins. Ändern und Aufnahmen
  abrufen bleiben Admin-Sache.

**Weitere Abweichungen**

* WebSocket-Rechte: Raumzonen ist heute **nur für Admins**, weil Positionen
  zeigen, wo Menschen sind. Vorschlag: so lassen, mit einer Einstellung „auch
  normale Benutzer dürfen Live-Punkte sehen“ (für Tablets). Entscheidung des
  Besitzers.
* Aufnahme: Raumzonen zeichnet **Rohziele und Spuren** auf (mehr als der
  Entwurf), damit Geisterziele zählbar sind. Für Abnehmer braucht es echte
  Zeitstempel; dafür kommt ein Format `fp400-trace/2` (wie /1, aber mit
  Uhrzeit, Sensor- und Raumkoordinaten). `fp400-trace/1` bleibt das
  anonymisierte Format für Tests.
* Vertragstests: Beispieldateien kommen nach `docs/homebrain/beispiele/`
  (Momentaufnahme, Spur-Strom, Hinweise), mit einem Test, dass Raumzonen
  genau das erzeugt (4a).

### Vorschlag zur Reihenfolge

1. **Phase 4a:** Aufnahme der Rohpositionen (auch Raum ohne Zonen), Zonenart
   „Stelle“, WebSocket `raumzonen/v1/snapshot|subscribe` (aus dem heutigen
   `live/subscribe`), Python-Schnittstelle. Damit kann die Ofen-Messung
   starten.
2. **Phase 4b:** Herkunft, Einstufung, Sicherheit und „unklar“, geprüft
   gegen die Aufnahmen, dann die Entität „Zustand“.
3. Danach: Hausplan/Pseudoräume, je nach Entscheidung, was davon ins
   Homebrain gehört.
