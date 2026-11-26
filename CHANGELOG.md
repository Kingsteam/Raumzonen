# Changelog

Alle wichtigen Änderungen an Raumzonen. Format nach
[Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach
[Semantic Versioning](https://semver.org/lang/de/).

## [0.12.0] - 2026-11-26

### Hinzugefügt

- Stockwerke: Raumzonen übernimmt die Stockwerke aus Home Assistant. Im
  Hausplan oben ein Stockwerk wählen (oder „Alle“); es zeigt nur dessen
  Räume und Grundrisse. Jeder Raum liegt auf dem Stockwerk seines Bereichs
  (ohne Bereich: der Bereich mit gleichem Namen) oder auf den Stockwerken,
  die man im Hausplan beim Raum ankreuzt; eine Treppe liegt so auf zwei
  Stockwerken an derselben Stelle.
- Bereich eines Raums im Hausplan änderbar.
- Ein Grundriss gehört zum Stockwerk, das beim Übernehmen gewählt ist.
- Vertrag `raumzonen/1`: Feld `stockwerke` je Raum.

## [0.11.0] - 2026-11-26

### Hinzugefügt

- Grundriss als Hintergrund: Das Bild eines übernommenen Plans wird in
  Home Assistant gespeichert (`<config>/raumzonen/plaene/`, nicht im
  Recorder) und im Hausplan und beim Zeichnen im Raum hinterlegt (Knopf
  „Grundriss im Hintergrund“). Grundrisse lassen sich im Hausplan löschen.
- Auch Bilder (PNG, JPG) ohne erkannte Räume lassen sich übernehmen; den
  Maßstab setzt man mit einer Strecke im Bild (zweimal tippen, Länge
  eingeben).
- Öffnungen in Wänden: Griffe an beiden Enden zum Ändern der Breite, die
  gewählte Öffnung lässt sich an der Wand entlang verschieben.
- Maße der Wände und Öffnungen einblendbar (Knopf „Maße der Wände“).
- WebSocket `plan/bild/get` (alle), `plan/delete` (Admins); `plan/import`
  nimmt das Bild mit.

### Behoben

- In Räumen nur mit Meldern ließ sich der (unsichtbare) Sensor greifen.

## [0.10.1] - 2026-11-26

### Behoben

- Nach einem Update vor dem Neustart zeigte das Panel „unknown command“.
  Jetzt steht dort, dass Raumzonen auf einen Neustart von Home Assistant
  wartet und wo man ihn auslöst.

## [0.10.0] - 2026-11-26

### Hinzugefügt

- Grundriss übernehmen (Hausplan, nur Admins): PDF oder Bild eines Plans
  hochladen, z. B. den Export aus dem UniFi Design Center. Raumzonen
  erkennt im Browser die Räume (blaue Umrisslinien des Scans), Wände und
  Lücken; Lücken zwischen zwei Räumen werden Türen, Lücken in Außenwänden
  vorerst Fenster (umstellbar). Mit einem Maß (der Plan hat keinen
  Maßstab) werden Wände, Türen samt „führt zu“ und die Lage im Haus für
  die zugeordneten Räume übernommen. Das Bild verlässt den Browser nicht.
- Vorschläge für Zonen (Auswertung): Orte, an denen sich jemand lange
  aufgehalten hat und die noch in keiner Zone liegen, mit „Als Zone
  anlegen“.
- WebSocket `plan/import` (mehrere Räume in einem Schritt).

## [0.9.0] - 2026-11-26

### Hinzugefügt

- Assistent „Sensor umsetzen“ (Sensor und Raum, nur Admins): vor dem
  Umhängen drei Stellen im Raum merken, Sensor umhängen, dieselben Stellen
  wieder aufsuchen; Raumzonen rechnet die neue Lage und Blickrichtung aus
  (starre Abbildung aus drei Punkten, die dritte als Probe) und sagt, wie
  genau sie ist. Die Zonen bleiben, wo sie im Raum sind.
- „Sensor hängt schon: einmessen“: an drei Stellen stehen und sie im Plan
  antippen; so lässt sich ein Sensor ohne Ausrichten von Hand einmessen.
- Je Stelle 8 s ruhig stehen (Median, warnt bei Unruhe, mehr als einer
  Person, Stellen zu nah oder auf einer Linie). Die Stellen „vorher“
  bleiben im Browser gespeichert, falls die Seite beim Umhängen neu lädt.

## [0.8.0] - 2026-11-26

### Hinzugefügt

- Reiter „Auswertung“ im Panel (nur Admins): Wer war wann wo, für die
  letzten 1, 3, 8, 12 oder 24 Stunden. Gerechnet aus der eigenen Aufnahme
  des Raums, darum auch nach einem Neustart vollständig.
  - Feine Bewegungskarte (5-cm-Zellen, weiche Flecken statt Kästchen):
    man sieht, wo genau im Bett jemand lag.
  - Je Zone: wie lange dort jemand war, welche Figuren, Zeitleiste.
  - Je Figur (Spur vom Auftauchen bis zum Verschwinden, Hund erkannt):
    Dauer, von bis, Zonen, Zeitleiste; antippen zeigt nur diese Figur.
  - WebSocket `raumzonen/auswertung/get`; ein ganzer Tag ist in wenigen
    Sekunden gerechnet, das Ergebnis wird eine Minute lang wiederverwendet.

- Räume nur mit Bewegungs- oder Präsenzmeldern (Raumart „Melder“): ein
  oder mehrere Melder aus Home Assistant, Anzeige „Anwesenheit“ je Raum,
  Nachlauf einstellbar. Die Figur verschwindet nicht plötzlich: Haltezeit
  wie bei jeder Figur; sind alle Melder nicht erreichbar, bleibt der letzte
  Stand. Gespeichert wird die feste Kennung der Melder, Umbenennen schadet
  nicht.
- Räume im Panel anlegen (Hausplan → „Raum hinzufügen“): Bereiche aus Home
  Assistant mit Meldern übernehmen, oder selbst mit Meldern oder einem FP400.
  Räume im Panel löschen (mit Rückfrage); Türen, die dorthin führten, zeigen
  danach auf „weiß nicht“.
- Türen in den Wänden bekommen „führt zu“ (im Hausplan einstellbar), damit
  auch Melder-Räume verbunden werden können; im Vertrag `raumzonen/1` die
  Felder `melder` je Raum und `fuehrt_zu` je Öffnung, `art` jetzt auch
  `melder`.
- Bewegungsprofil im Hausplan (nur Admins): je Raum eine Zeitleiste der
  letzten 1 bis 24 Stunden und die letzten Wechsel zwischen Räumen.
- WebSocket `kandidaten/get`, `room/create`, `room/delete`.

### Geändert

- Die Bewegungskarte unter „Ebenen“ zeigt ebenfalls weiche Flecken.

### Behoben

- Raum löschen im Options-Flow scheiterte, wenn eine Tür eines anderen
  Raums dorthin führte; Geräte gelöschter Räume bleiben nicht mehr liegen.

## [0.7.0] - 2026-11-26

### Hinzugefügt

- Filter gegen Zittern (One-Euro-Filter je Figur): In Ruhe wird stark
  geglättet, bei Bewegung folgt die Figur fast sofort. Gemessen an vier
  aufgenommenen Nächten: die großen Sprünge im Liegen (90 %-Wert) von 27 auf
  17 cm. „Aufgestanden“, Tür und Bettrand melden sich genau so schnell wie
  vorher, weil die Raumlogik dafür die rohe Position nimmt; Rechenzeit
  unverändert. Ruhigere Live-Punkte, Bewegungskarte und Spuren für das
  Homebrain.

## [0.6.2] - 2026-11-26

### Hinzugefügt

- Türen umdrehen: „Anschlag wechseln“ (Scharnier links oder rechts) und
  „Nach außen/innen aufgehen“; im Vertrag `raumzonen/1` die Felder
  `anschlag` und `aufgehen` je Öffnung.

### Geändert

- Größere Knöpfe bei Bedienung mit dem Finger (44 px am Handy, 56 px am
  Wand-Tablet), wie im GUI-Konzept verlangt.

## [0.6.1] - 2026-11-25

### Geändert

- Herkunft klar ausgewiesen: Dank an bobtekkk/aqara-fp400-zone-card (MIT),
  dessen Konverter die Positionen liefert; Raumzonen enthält keinen Code
  daraus (README, `THIRD-PARTY-NOTICES.md`).
- Lizenztext der mitgelieferten Bibliothek Lit (BSD-3-Clause) liegt jetzt
  dem Panel bei (`frontend/LIZENZEN-DRITTE.txt`).

## [0.6.0] - 2026-11-25

### Hinzugefügt

- Türen und offene Stellen in Wänden: neues Werkzeug „Tür / Öffnung“, an
  der Wand entlang ziehen; Türen mit Türblatt und Bogen, offene Stellen
  gestrichelt. Im Tab „Sensor und Raum“ zwischen Tür und offen umschalten
  oder löschen.
- Leichter bearbeiten: „+“ in der Mitte jeder Kante fügt einen Punkt ein
  (bei Zonen und Wänden), Rechtsklick auf einen Punkt löscht ihn, dazu der
  Knopf „Punkt löschen“. Zonen drehen am gelben Griff (5°-Raster) oder mit
  den Knöpfen 15°.
- Neue Rolle „Durchgang“ (Zonenart `durchgang`): belegt sofort, frei nach
  2 s; für Gänge und Bereiche, in denen man nur durchgeht.
- Vertrag `raumzonen/1`: neues Feld `oeffnungen` je Raum, neue Zonenart
  `durchgang`.

### Geändert

- Gestaltung nach dem GUI-Konzept des Hauses: nur Farben aus dem Theme
  (Rollen nach Farbgruppen, Figuren in der Haus-Farbe), Kopfzeile wie die
  Seite, Speichern als einzige gefüllte Hauptaktion, „nicht erreichbar“
  gestrichelt, Löschen fragt nach.
- Das Repo ist jetzt öffentlich; Aufnahmen und Haushaltsdetails liegen privat.

## [0.5.0] - 2026-11-25

### Hinzugefügt

- Hausplan im Panel (Knopf „Haus“ oben): alle Räume nebeneinander mit
  Zonen und Live-Punkten. Admins ziehen Räume an ihren Platz, drehen sie in
  90°- oder 5°-Schritten und tragen bei jeder Tür ein, wohin sie führt.
  Verbundene Türen sind mit einer Linie verbunden. Räume ohne Wände bekommen
  einen gestrichelten Umriss um Zonen und Sensor.
- WebSocket `raumzonen/haus/save` (nur Admins): Lage der Räume und Ziele
  der Türen mit einem Speichern.
- Im Vertrag `raumzonen/1` ist `haus` jetzt gefüllt, sobald ein Raum im
  Hausplan liegt.
- Test-Instanz: zweiter Raum „Flur“ mit eigenem simulierten Sensor, in dem
  eine erfundene Figur auf und ab geht.

## [0.4.0] - 2026-11-25

### Hinzugefügt

- Schnittstelle `raumzonen/1` für andere Integrationen (zuerst das
  Homebrain): Python (`hass.data["raumzonen_api"]`: `raeume()`,
  `momentaufnahme()`, `abonnieren()`) und WebSocket `raumzonen/v1/schema`,
  `v1/snapshot`, `v1/subscribe`. Meldungen zu Zonen und Sensor sofort,
  Spuren höchstens zweimal je Sekunde und nur bei Änderung. Abos überleben
  das Neuladen. Jede Meldung trägt eine fortlaufende Nummer `seq` je Abo;
  Zugang für Abnehmer über `get_api(hass)`. Spuren melden `neu_seit_laden`.
  Vertrag: `docs/homebrain/VERTRAG-raumzonen-1.md`.
- Eigene Aufnahme je Raum (`fp400-trace/2`): Rohpunkte vor jeder Filterung,
  Spuren und gemeldete Zielzahl, lokal gepackt je Tag, Standard 30 Tage,
  je Raum abschaltbar. Abruf `raumzonen/aufnahme/get` (nur Admins, bis 24 h).
- Neue Rolle „Stelle“ (Platz zum Beobachten, z. B. Ofen oder Sessel).
- Türen: „Wohin führt die Tür?“ (nach draußen oder in einen anderen Raum).
- Felder für die Lage des Raums im Hausplan (noch ohne Bedienung).
- Erkennen abgeschnittener Rahmen (`target_count` größer als die Liste).

### Geändert

- Das Panel und die Live-Punkte sehen jetzt alle Nutzer; ändern, Konverter-
  Zonen übernehmen und Aufnahmen abrufen nur Admins. Nicht-Admins sehen
  „nur ansehen“ und keine Werkzeuge.

## [0.3.0] - 2026-11-25

### Hinzugefügt

- Panel „Raumzonen“ in der Seitenleiste (nur Admins), gestaltet wie das
  Panel „Bewässerung“: Räume als Umschalter in der Kopfzeile, schwebende
  Werkzeuge am Plan, Liste mit aufklappender Zone.
- Der Raum ist immer gerade; den Sensor zieht man an seinen Platz und dreht
  ihn am Griff (Kreissegment der Abdeckung wie der Sprinkler im Gartenplan).
  Zonen wandern beim Ausrichten wahlweise mit. Keine Felder für Koordinaten
  oder Winkel.
- Zonen zeichnen: Rechteck, Vieleck, Zellen, Wände; Ecken ziehen und
  einfügen, verschieben, Rückgängig, Raster 5 cm.
- Statt Fachregeln eine Rolle je Zone: Bett, Bereich, Tür, Hundeplatz,
  Ignorieren. Die Wartezeiten stehen als Satz da und lassen sich unter
  „Feineinstellung“ ändern. Zonen aus dem Konverter übernehmen.
- Speichern prüft alles und lädt neu, ohne das Panel zu schließen. Die
  Punkte des Sensors werden in Raumkoordinaten umgerechnet.
- Live-Ansicht: Figuren mit Spur, gehaltene Figuren, vermutlich Hund,
  Rohpunkte des Sensors, Belegung je Zone.
- Bewegungskarte der letzten 15 min / 1 h / 24 h als Hilfe beim Einzeichnen
  (nur im Speicher).
- WebSocket-Befehle `raumzonen/rooms/get`, `room/save`, `live/subscribe`,
  `heat/get`, `converter_zones/get` (alle nur Admin).
- Simulierte Test-Instanz (`devtools/testinstanz/`) mit FP400-Simulator, der
  die anonymisierten Aufnahmen abspielt; Bilder im Handbuch.

## [0.2.0] - 2026-11-25

### Hinzugefügt

- Anbindung des FP400 (nur lesen): über MQTT (Zustand von Zigbee2MQTT, mit
  Bewegung und Art der Ziele, Verfügbarkeit) oder über die Entitäten
  `targets_xy`/`tracking_last_update`. Wiederholte alte Rahmen werden erkannt.
- Entitäten je Zone („belegt“ mit Grund, „Personen“) und je Raum („Sensor
  verbunden“, „Figuren“); ein Gerät je Raum.
- Ereignis `raumzonen_zone` für eigene Automationen.
- Einrichtung über „Konfigurieren“: Raum hinzufügen, Zonen aus dem Konverter
  übernehmen (mit Rolle, z. B. Bett oder Tür), Zone einstellen, löschen.
  Regel-Vorlagen aus den Aufnahmen.
- Neustart: ein belegtes Bett bleibt belegt (Platzhalter), bis echte Daten
  kommen.
- Handbuch (`docs/HANDBUCH.md`).

## [0.1.0] - 2026-11-25

### Hinzugefügt

- Grundgerüst der Integration `raumzonen`: Ersteinrichtung (nur eine
  Instanz), Laufzeitdaten, versionierter Speicher mit Prüfung.
- Rechenkern ohne Home Assistant: Flächen (Vieleck, gedrehtes Rechteck,
  Zellen), Spuren mit Haltezeit, Zonen mit Regeln (belegt nach, frei nach,
  Randstreifen, Schläfer halten, höchstens Personen, Hund nicht zählen),
  Zonenarten Ausgang, Hundeplatz, Störquelle.
- Aufnahmeformat `fp400-trace/1`, Werkzeuge zum anonymisierten Export und
  Beschriften, vier anonymisierte Nächte als Testdaten.
- Tests: „aufgestanden“ höchstens 5 s und keine Fehlalarme im Liegen,
  geprüft an den Aufnahmen; Datenschutz-Wächter für Testdaten.

### Noch nicht enthalten

- Anbindung echter Sensoren, Entitäten, Oberfläche. Nicht mit echter
  Hardware getestet.
