# Raumzonen (`raumzonen`): Hinweise für Claude

Eigene Home-Assistant-Integration für Präsenzzonen mit Radarsensoren (zuerst
Aqara FP400 über Zigbee2MQTT). Der Besitzer ist kein Entwickler: antworte auf
Deutsch, in einfacher Sprache, und erkläre, was du änderst und warum.

**Dieses Repo ist öffentlich** (Entscheidung des Besitzers, 25.11.2026,
damit der Marketplace von Home Assistant installieren und aktualisieren
kann). Regel 5 gilt darum besonders streng. Was privat bleiben muss
(Aufnahmen, Auswertungen, Haushaltsprofil), liegt im privaten Repo
`Kingsteam/haus-privat`, Ordner `raumzonen/`. Das alte private Repo mit der
ganzen Geschichte heißt `Kingsteam/Raumzonen-private` (Archiv).

## Zweck und Stand

Zonen in beliebiger Form (Vieleck, gedrehtes Rechteck, Zellen), Regeln je
Zone, Spuren, die nicht plötzlich verschwinden. Konzept: `docs/KONZEPT.md`
(allgemeine Fassung; die vollständige und die Auswertung der Aufnahmen
liegen in `haus-privat/raumzonen/docs/`).

Stand 0.18.0: **Phase 0 bis 4a, Hausplan, Türen in Wänden.** Rechenkern in reinem Python, getestet gegen
anonymisierte Aufnahmen; Sensor-Anbindung (MQTT oder Entitäten, nur lesen),
Entitäten je Zone und Raum, Ereignis `raumzonen_zone`, Einrichtung über den
Options-Flow; Panel „Raumzonen“ (sehen alle, ändern nur Admins) mit
Raumplan, Zonen zeichnen, Sensor-Lage mit Abdeckung, Live-Figuren und
Bewegungskarte, Hausplan (Räume anordnen, anlegen, übernehmen, löschen, Türen verbinden, Bewegungsprofil), Melder-Räume (nur Bewegungs-/Präsenzmelder, Melder im Plan, Zonen je Melder), Assistent „Sensor umsetzen/einmessen“, Grundriss übernehmen (UniFi-PDF, Bilder) samt Hintergrund im Plan (ausrichten, drehen, zuschneiden), Maße, Öffnungen mit Griffen, Stockwerke (aus Home Assistant, Raum auf mehreren möglich), Zonen-Vorschläge, Auswertung „wer war wann wo“ aus der Aufnahme; eigene Aufnahme je Raum (`fp400-trace/2`); Zonenart
„Stelle“, Tür „führt zu“; Schnittstelle `raumzonen/1` für das Homebrain
(`docs/homebrain/VERTRAG-raumzonen-1.md`); simulierte Test-Instanz.
**Keine Steuerung.** Nicht mit echter Hardware getestet.
Nächstes: 4b (Herkunft, Einstufung, Sicherheit, `hinweis/1`); siehe
`docs/KONZEPT.md`.

## Regeln (nicht verhandelbar)

1. **Nie gegen die echte Installation entwickeln oder testen**, auch nicht
   über ein Home-Assistant-MCP-Werkzeug. Nur Tests mit simulierten Daten und
   Aufnahmen. Lesen aus der echten Installation nur, wenn der Besitzer es für
   eine Auswertung ausdrücklich erlaubt, und dann **nur lesen**. Ausnahme
   (Besitzer, 25.11.2026): ein **fertiges Release** über den Marketplace
   installieren oder aktualisieren (`ha_manage_hacs`), wenn der Besitzer es
   für diese Version will. Seit 26.11.2026 (Hausregel): Updates eigener
   Releases samt Neustart sind erlaubt; den Neustart **nicht selbst
   auslösen**, sondern bei der Haus-Sitzung anmelden (Postfach
   `projekte/postfach/an-haus.md` im Haus-Repo; weil dieses Repo hier nicht
   erreichbar ist, per send_message an „Lernendes Haus“ oder „Tablets“ mit
   der Bitte um Eintrag).
2. **Nichts im Haus schalten.** Diese Integration meldet Zustände; sie
   schaltet kein Licht und keine Geräte. Automationen macht der Besitzer.
3. **„Aufgestanden“ höchstens 5 s** (`MAX_AUFGESTANDEN_S` in `const.py`).
   Die Tests in `tests/test_traces.py` prüfen das an echten Aufnahmen. Die
   Aufnahmen liegen privat (`haus-privat/raumzonen/aufnahmen`); ohne sie
   überspringt das öffentliche Repo diese Tests (vom Besitzer am 25.11.2026
   so entschieden). Dafür laufen sie in `haus-privat` bei jeder Änderung und
   täglich gegen `main`, und **vor jedem Release lokal mit
   `RAUMZONEN_AUFNAHMEN=<Ordner>`; ohne grünen Lauf kein Release.** Tests und
   Grenze sonst nie abschwächen, überspringen oder löschen; ändern nur nach
   Rücksprache.
4. **Eine Figur löst sich nicht in Luft auf.** Kein Rahmen heißt nicht
   „weg“; fehlende Ziele werden gehalten. Neue Regeln dürfen das nicht
   aufweichen (Tests in `tests/test_tracks.py`, `tests/test_room.py`).
5. **Keine Geheimnisse und keine persönlichen Daten ins Repo**: keine Tokens,
   Nabu-Casa- oder andere Adressen, IP-Adressen, Namen von Personen, echte
   Entitäts- oder Gerätenamen, IEEE-Adressen, Datum/Uhrzeit von Aufnahmen.
   Auch nicht in Tests, Commit-Texten, Beispielen oder Bildern.
   `tests/test_datenschutz.py` prüft die Testdaten.
6. **Aufnahmen nur anonymisiert**: Zeit relativ, Ziel-ID, x, y, ggf.
   bewegt/Art, neutrale Signalnamen (`docs/DATENFORMAT.md`). Rohdaten aus
   Home Assistant nur im Scratchpad, nie im Repo. Auch anonymisierte
   Aufnahmen kommen **nicht** in dieses öffentliche Repo, nur nach
   `haus-privat/raumzonen/aufnahmen`.
7. Keinen Pull Request ohne ausdrücklichen Auftrag. Arbeiten auf einem Zweig.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `custom_components/raumzonen/__init__.py` | `async_setup_entry`/`async_unload_entry`, `RaumzonenData` in `entry.runtime_data` (Store, Rechenlogik je Raum, Hauptgerät) |
| `config_flow.py` | Ersteinrichtung: nur eine Instanz, nur bestätigen |
| `options_flow.py` | Raum hinzufügen (Gerät, Quelle, MQTT-Thema), Zonen aus dem Konverter übernehmen (Rolle → Art + Regel-Vorlage), Zone einstellen/löschen, Raum löschen. Jede Aktion: Kopie, prüfen, speichern, neu laden |
| `controller.py` | `RoomController`: Quelle verbinden (MQTT: Rahmen nur bei neuem `tracking_last_update`, `<thema>/availability`; Entitäten: Rahmen bei neuer Zeit in `tracking_last_update`; Melder: „an“ = Figur in jeder Zone dieses Melders, sonst in der Raummitte; alle nicht erreichbar = Ausfall), Rechenkern füttern, Zeitregeln mit `async_track_point_in_utc_time`, Ereignis `raumzonen_zone`, `restore_zone` |
| `panel.py` | Panel `/raumzonen` (für alle Nutzer, `mdi:floor-plan`), statische Dateien unter `/raumzonen_static`, `?v=<sha256>`; eigenes Neuladen `async_reload_keep_panel`, damit das Panel beim Speichern offen bleibt |
| `websocket_api.py` | Lesen für alle: `rooms/get` (mit `darf_aendern`, Stockwerke `stockwerke_ha` und Bereiche `bereiche_ha` aus Home Assistant), `live/subscribe` (gedrosselt 5/s), `heat/get`, `v1/schema`, `v1/snapshot`, `v1/subscribe`. Nur Admins: `room/save` (Zonen, Sensor-Lage, Umriss, Aufnahme; ganzes Modell prüfen, speichern, neu laden), `converter_zones/get`, `aufnahme/get`, `auswertung/get`, `haus/save` (Lage der Räume, Ziele der Türen: Zonen und Öffnungen), `kandidaten/get` (FP400, Melder, Bereiche als Vorschlag), `room/create`, `room/delete`, `plan/import` (Wände, Türen, Lage mehrerer Räume, Bild), `plan/delete`; für alle zusätzlich `plan/bild/get` |
| `vertrag.py` | baut die Daten des Vertrags `raumzonen/1` (Aufbau, Momentaufnahme, Zone, Sensor, Spur, Stelle) |
| `api.py` | `get_api(hass)` für Abnehmer; Verteiler `RaumzonenApi` in `hass.data["raumzonen_api"]`: `seq` je Abo, `raeume()`, `momentaufnahme()`, `abonnieren()`; überlebt das Neuladen (`attach`/`detach`), Spuren höchstens 2/s und nur bei Änderung |
| `plaene.py` | Grundriss-Bilder als Dateien unter `<config>/raumzonen/plaene/` (JPEG/PNG, geprüft, höchstens 8 MB); Lage im Haus in `PlanConfig` (`model.py`) |
| `aufnahme.py` | eigene Aufnahme je Raum (`fp400-trace/2`, gzip je Tag, alle 10 s schreiben, alte Tage löschen, Abruf bis 24 h) |
| `discovery.py` | Entitäten des FP400 über `unique_id` finden, Themen-Vorschlag, Software-Zonen des Konverters lesen |
| `entity.py`, `binary_sensor.py`, `sensor.py` | je Zone „belegt“ (RestoreEntity) und „Personen“, je Raum „Sensor verbunden“ und „Figuren“; Zustand wird nur bei Änderung geschrieben (keine Positionen in Attributen, schont den Recorder) |
| `const.py` | Konstanten und Grenzen (u. a. `MAX_AUFGESTANDEN_S`) |
| `model.py` | Datenklassen Raum/Sensor/Zone/Regel/Öffnung, `validate()`, `build_room()`, `remove()`; Melder-Räume (`art` `melder`, `melder` = feste Kennungen im Entitätsregister, eine Zone `anwesenheit` aus `melder_zone()`, weitere Zonen mit `melder` je Zone, `melder_lagen` nur Anzeige); Radar-Räume mit Wänden bekommen `anwesenheit_zone()` (ganzer Raum, Vorlage „normal“) automatisch, eine eigene Zone gleicher Kennung geht vor; `PlanConfig` mit `winkel`, `zuschnitt`, `stockwerk` |
| `serialize.py` | Modell ↔ JSON, je Klasse ausgeschrieben, Standardwerte für fehlende Felder |
| `store.py` | `Store`-Hülle, Schlüssel `raumzonen`, versioniert; defekte Daten → `ValueError`, nie überschreiben |
| `core/geometry.py` | Vieleck, gedrehtes Rechteck, Zellen; `contains`, `distance` (negativ innen); `converter_rect` rechnet wie der Konverter |
| `core/tracks.py` | `Tracker`: Spuren aus Sensor-Zielen, ID-Wechsel, Halten, Ausfall |
| `core/room.py` | `Room`: Zonen, Regeln, Hund/Störquelle/Echo, `ZoneEvent`, `advance`/`next_deadline` |
| `core/trace.py` | Aufnahmen `fp400-trace/1` lesen und abspielen |
| `core/pose.py` | Lage des Sensors im Raum: Sensor ↔ Raumkoordinaten |
| `core/auswertung.py` | Auswertung der eigenen Aufnahme: je Figur Zeit in 5-cm-Zellen, je Zone Dauer und Zeitabschnitte (Ruhe ohne Rahmen zählt bis 30 min, Gehaltenes/Ausfall bis 60 s); WebSocket `auswertung/get` (nur Admins) |
| `core/wege.py` | Wege durchs Haus: `Wege` (in `hass.data["raumzonen_wege"]`, überlebt das Neuladen) paart „belegt“ von Tür-Zonen (und „Anwesenheit“ von Melder-Räumen) innerhalb 10 s zu `Weg(von, nach, tuer, genau)`; Graph aus `wege_knoten()` in `model.py`; Ereignis `raumzonen_weg`, WebSocket `wege/get` (nur Admins) |
| `core/heat.py` | Bewegungskarte (20-cm-Zellen, 5-min-Fächer, 24 h, nur Speicher; liegt in `hass.data`, überlebt das Neuladen) |
| `core/fp400.py` | Meldungen des Konverters lesen (`tracking_targets`, `targets_xy`, Verfügbarkeit, Software-Zonen) |
| `devtools/trace_export.py` | Verlaufsdateien (REST-Format) → anonymisierte Aufnahmen; spricht nie mit Home Assistant |
| `devtools/trace_label.py` | Aufnahmen beschriften (aufgestanden, liegt) |
| `tests/daten/` | nur die Konverter-Zonen des Schlafzimmers (Aufnahmen: privat, `RAUMZONEN_AUFNAHMEN`) |
| `tests/` | pytest; `test_traces.py` = Ziele des Besitzers an echten Aufnahmen; `test_vertrag.py` prüft auch die Beispiele in `docs/homebrain/beispiele/` |
| `docs/` | `KONZEPT.md`, `DATENFORMAT.md`, `HANDBUCH.md`; `homebrain/` (Vertrag `raumzonen/1`, Beispiele) |
| `frontend-src/` | Quelltext des Panels: TypeScript + Lit, Vite, vitest. `heat.ts` (weiche Bewegungskarte: Gauß-Filter, Bild, `dauer`, Zonen-Vorschläge `flecken`), `haus.ts` (Türen aller Räume `tuerenVon`, Profil `vereinigen`/`wechsel`), `einmessen.ts` (Lage des Sensors aus drei Stellen: `einmessen`, `stellenProblem`, `stelle`), `grundriss.ts` (Plan erkennen: `jpegAusPdf`, `erkenneGrundriss`, `uebernehmen`; Bild bleibt im Browser, echte Pläne nur in `haus-privat/raumzonen/plaene`), `geometry.ts` (wie `core/geometry.py`/`pose.py`, dazu `moveWithSensor`, Hausplan `toHouse`/`roomOutline`/`defaultLagen`), `editor.ts` (Bearbeitungsschritte, Rückgängig, Rollen `ROLLEN`/`rolleOf`/`applyRolle`, `regelSatz`, `rotateForm`, `edgeMidpoints`, Öffnungen `openingFromDrag`/`shiftOpenings`/`clampOpenings`), `panel.ts` (Oberfläche), `styles.ts` (Gestaltung wie das Panel „Bewässerung“ aus FlowerPower), `types.ts` |
| `custom_components/raumzonen/frontend/` | **gebautes** Panel, nie von Hand ändern; CI prüft, dass es zum Quelltext passt |
| `devtools/testinstanz/` | simulierte Test-Instanz: `start.py` (Ersteinrichtung, Schlafzimmer und Flur über den Options-Flow, Hausplan), Simulator `raumzonen_sim` (Schlafzimmer: erfundene Szene oder private Aufnahmen über `RAUMZONEN_AUFNAHMEN`, im Flur geht eine erfundene Figur, zwei Bewegungsmelder in den Bereichen Küche und Bad) |
| `docs/bilder/` | Bilder fürs Handbuch aus der Test-Instanz (256 Farben) |
| `tests/helpers.py` | `SimFp400`: simulierter Sensor über MQTT (Rahmen, Wiederholung, offline, Zeit) |

`core/` importiert nichts aus Home Assistant; so bleibt der Kern schnell
testbar und später auch im Panel als Vorschau nutzbar.

## Tests und Prüfungen

Python 3.14. Die venv liegt außerhalb des Repos:

```bash
uv venv --python 3.14 ../venv && source ../venv/bin/activate
uv pip install -r requirements_test.txt
pytest
ruff check . && ruff format --check .
```

Panel (Node 22):

```bash
cd frontend-src && npm ci && npm test && npm run build   # schreibt custom_components/raumzonen/frontend/
```

Nach jeder Änderung in `frontend-src/` neu bauen und das Ergebnis mit
committen. Test-Instanz: `devtools/testinstanz/README.md`.

`requirements_test.txt` pinnt `pytest-homeassistant-custom-component`
(0.13.375 → HA 2026.10.4). Auf GitHub laufen zusätzlich hassfest und die
HACS-Prüfung (`.github/workflows/`).

## Arbeitsweise

- Neue Funktionen immer mit Tests; Regeln für den Schlaf immer auch gegen die
  Aufnahmen prüfen.
- Version in `manifest.json` und `pyproject.toml` gemeinsam anheben,
  `CHANGELOG.md` pflegen.
- Release: Tests grün (auch `test_traces.py` mit privaten Aufnahmen), auf
  `main`, dann `release.yml` per workflow_dispatch. Einspielen beim
  Besitzer über den Marketplace (`ha_manage_hacs`: `update_information`,
  dann `download` mit `version`), Neustart nur nach Absprache.
- In `manifest.json` stehen `domain` und `name` zuerst, dann alphabetisch.
- Kein fremder Code ohne Eintrag in `THIRD-PARTY-NOTICES.md` (und
  Lizenztext). Vom Konverter `bobtekkk/aqara-fp400-zone-card` (MIT) nur
  Datenformat und Feldnamen nutzen, keinen Code; Dank im README behalten.
- Anleitungen für den Besitzer (GitHub, Home Assistant) immer mit
  klickbaren Links zu jeder Seite, die er öffnen soll.

## Bedienung des Panels (Grundsätze, mit dem Besitzer abgestimmt)

- **GUI-Konzept des Hauses ist verbindlich** (Version 1, vom Besitzer
  freigegeben; Text in `haus-privat` bzw. bei der Sitzung „Tablets“): nur
  Theme-Variablen, Farbgruppen (Bett purple, Bereich/Person teal, Durchgang
  cyan, Tür green, Stelle orange, Hund amber), Rahmen 2 px, Radius 8, eine
  gefüllte Hauptaktion, „nicht erreichbar“ gestrichelt, Löschen mit
  Rückfrage. Prüfliste (Abschnitt 10) vor dem Fertigmelden abhaken.
- Grundform wie das Panel „Bewässerung“ (FlowerPower), nicht wie die alte
  Zonenkarte des Konverters.
- Im Hausplan wird der **Raum** verschoben und gedreht (Knöpfe 90°/5°,
  keine Zahlenfelder); im Raum selbst bleibt er gerade.
- Ausgerichtet wird der **Sensor** (ziehen, am gelben Griff drehen), nie der
  Raum. Keine Felder für Koordinaten/Winkel. Die Raumansicht ist standardmäßig
  „wie im Hausplan“ gedreht (`ansichtWinkel`, nur Anzeige, Knopf links;
  Besitzer 26.11.2026: gedrehter Raum und Hintergrund störten); „Raum gerade“
  bleibt wählbar. `toScreen`/`toWorld`/Pan/`fit`/Raster beachten die Drehung.
- Zonen werden am Plan gezeichnet. Drehen am gelben Griff (5°-Raster) oder
  mit Knöpfen 15° (vom Besitzer gewünscht, 0.6.0); Punkte über „+“ auf der
  Kante einfügen, per Rechtsklick oder Knopf löschen.
- Wände bekommen Türen/offene Stellen (`oeffnungen`, nur Zeichnung; Tür mit
  `anschlag` anfang/ende und `aufgehen` innen/aussen, feste `id`, `name`,
  `gegenstueck` = Schlüssel der Tür im Nachbarraum `raum/#id` bzw.
  `raum/zone`; `tueren_abgleichen()` in `model.py` hält beide Seiten gleich);
  „betreten/verlassen“ kommt weiter von Zonen der Rolle „Tür“.
- Alle Nutzer sehen das Panel und die Live-Punkte; nur Admins ändern.
  Die Rechte prüft Python (`require_admin`), das Panel blendet nur aus.
- Statt Fachregeln eine **Rolle** je Zone; Zahlen nur unter
  „Feineinstellung“, aber immer als Satz sichtbar (keine versteckten
  Wartezeiten).

## Stolperfallen

- Zeitvergleiche mit Toleranz (`EPS_S`): `0.3 + 1.0 - 0.3` ist nicht genau
  `1.0`; ohne Toleranz hängt `advance()` an einer fälligen Zeit.
- Zwei Positionen je Figur: `x`/`y` geglättet (One-Euro-Filter, für Bleiben
  in Zonen, Anzeige, Bewegungskarte, Vertrag), `raw_x`/`raw_y` roh (für
  Fangbereich, Bewegung, Türen, Hineingehen in Bewegung und Hinaus aus der
  Schläferzone). Neue Zeit-Regeln nur mit `raw_*`, sonst kommt
  „aufgestanden“ später. Wirkung immer mit den Aufnahmen messen.
- Bei Sensor-Ausfall enden keine Spuren; `next_deadline()` darf dann keine
  Haltezeiten melden.
- Der FP400 schickt in Ruhe minutenlang nichts. Zeitregeln allein reichen im
  Bett nicht: ein Ausreißer bleibt bis zum nächsten Rahmen stehen. Darum
  „Schläfer halten“ mit Beweis (bewegte Rahmen, Abstand, Tür).
- Ember-Koordinatoren schneiden Rahmen mit 3+ Zielen ab; dann fehlen Ziele
  oder Rahmen für einige Sekunden.
- Ruff: kein typografischer Gedankenstrich oder „×“ in Python-Strings.
- Zigbee2MQTT schickt bei jeder Änderung (z. B. Helligkeit) den ganzen Zustand
  mit alten Zielen erneut. Neuer Rahmen nur bei neuem `tracking_last_update`.
- Tests mit `mqtt_mock`: der MQTT-Client hinterlässt einen Zeitgeber; diese
  Tests setzen `expected_lingering_timers` auf True.
- `device_registry.async_get_device` ist in dieser HA-Version verboten;
  `async_get_devices(identifiers=...)` nehmen.
- Keine Positionen in Entitäts-Attributen (3 Rahmen/s würden den Recorder
  fluten); Positionen gibt es nur über `live/subscribe`.
- WebSocket-Tests mit eingefrorener Zeit: kein `receive_json(timeout=…)`
  zum Leerlesen (hängt); stattdessen `ping` schicken und bis `pong` lesen.
- Panel: `:host` und Layout mit `100vh`, sonst wächst die Seite mit der
  Seitenleiste und der Plan verrutscht. Überlagerte Hinweise brauchen
  `pointer-events: none`, sonst fangen sie Klicks beim Zeichnen ab. Erst
  einpassen, wenn der ResizeObserver die echte Größe kennt.
- Speichern im Panel lädt die Integration neu: Spuren beginnen neu (ein
  belegtes Bett bleibt über RestoreEntity belegt), die Bewegungskarte bleibt.
- Zeitgeber (`async_call_later`) brauchen eine `@callback`-Funktion, sonst
  ruft Home Assistant sie in einem fremden Thread auf. Eine `lambda` mit
  `callback(...)` umhüllen.
- Die Aufnahme ist standardmäßig an. Tests leiten sie über die Fixture
  `aufnahme_ordner` (`tests/conftest.py`) in einen leeren Ordner um, sonst
  landen Dateien im gemeinsamen Testordner des Pakets.
- Ändert sich der Vertrag `raumzonen/1`, die Beispiele in
  `docs/homebrain/beispiele/` mitziehen (`test_beispiele_passen`). Zeiten in
  Beispielen sind erfunden (2000-01-01).
- `DeviceSelector` im Options-Flow filtert auf MQTT-Geräte; der Simulator
  der Test-Instanz wird darum von `start.py` über die REST-API angelegt.
