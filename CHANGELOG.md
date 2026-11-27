# Changelog

Alle wichtigen Änderungen an Raumzonen. Format nach
[Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach
[Semantic Versioning](https://semver.org/lang/de/).

## [0.25.0] - 2026-11-27

### Hinzugefügt

- Hinweis „Sensor schickt nur selten Positionen“: Hat der Zigbee-Treiber
  eines FP400 keine Zone eingetragen, holt er die Positionen nicht laufend
  ab (nur etwa eine pro Minute). Das Panel zeigt das unter „Sensor“ an; der
  Knopf „Datenstrom einschalten“ (nur Admins) trägt beim Treiber die Zone
  „Raumzonen Datenstrom“ ein, „Zurücknehmen“ entfernt nur diese wieder.
  Raumzonen schreibt nur in einen leeren Platz. Neuer WebSocket-Befehl
  `raumzonen/datenstrom/set`, `rooms/get` liefert `datenstrom` je Raum.

## [0.24.1] - 2026-11-27

### Geändert

- Assistent „Sensor einmessen“: Meldet der Sensor an zwei Stellen fast
  dieselbe Position, sagt der Assistent jetzt, dass der Sensor gerade keine
  neuen Positionen schickt (statt „Konnte nicht rechnen“). Beim Messen
  erscheint ein Hinweis, wenn seit über 30 s keine Position kam.

## [0.24.0] - 2026-11-27

### Hinzugefügt

- Kommen und Gehen meldet zusätzlich „unterwegs“: Eine Figur, die schon im
  Raum war, tritt in eine Tür- oder Treppen-Zone. Das kommt vor
  „verlassen“ und ist früh genug, um im Zielraum schon Licht zu machen und
  den verlassenen Raum zügig abzudunkeln (fließende Lichtübergänge).

## [0.23.0] - 2026-11-27

### Hinzugefügt

- Kommen und Gehen: Taucht jemand neu in einer Tür-Zone auf, meldet
  Raumzonen sofort „betreten“; endet eine Figur in einer Tür-Zone,
  „verlassen“. Räume ohne Tür-Zonen melden beides über „Anwesenheit“.
  Neu je Raum die Ereignis-Entität „Kommen und Gehen“ (`betreten`,
  `verlassen`, mit `tuer`, `zone_id`, `fuehrt_zu`, `treppe`), fürs Haus
  „Raumwechsel“ (`von`, `nach`, `tuer`, `genau`) und das Ereignis
  `raumzonen_tuer`. Für Automationen, die schon beim Hereinkommen reagieren.
- Rolle „Treppe“ für Zonen: wie eine Tür, aber zu einem anderen Stockwerk
  („Führt zu“), z. B. eine Wendeltreppe im Wohnzimmer.
- Tür- und Treppen-Zonen sind im Raumplan, im Hausplan und in der
  Dashboard-Karte gestrichelt; beim Kommen oder Gehen leuchten sie kurz auf
  und zeigen „herein“/„hinaus“.

## [0.22.2] - 2026-11-27

### Behoben

- Liegt der Hund vor dem Bett, hängt der Sensor das Ziel des Schläfers
  manchmal an den Hund: das Ziel springt aus dem Bett, und fast gleichzeitig
  verschwindet das Ziel des Hundes. Raumzonen erkennt diesen Tausch
  (höchstens 1,5 s Abstand, höchstens 2,5 m entfernt) und hält den Schläfer
  im Bett. Geht das andere Ziel danach zur Tür, war es doch der Schläfer und
  das Bett wird sofort frei; findet der Sensor im Bett niemanden mehr, nach
  einer Minute. Wer aufsteht, während der Hund weiter zu sehen ist, ist wie
  bisher in höchstens 5 s „aufgestanden“.

## [0.22.1] - 2026-11-27

### Behoben

- Eine Figur, die der Sensor mindestens 20 s als Person gemeldet hat, bleibt
  eine Person, auch wenn er ihre Art später wechselt (`person_bleibt_s`).
  Der FP400 meldet einen Liegenden, der sich im Bett bewegt, sekundenlang als
  „curtain“; Raumzonen zählte sie dann als Störquelle, und Bett und Raum
  wurden frei, obwohl niemand aufgestanden war. Gleiches gilt für einen
  Wechsel zu „pet“. Ein Vorhang, der nur kurz als Person auftaucht, bleibt
  eine Störquelle.

## [0.22.0] - 2026-11-27

### Hinzugefügt

- Assistent „Sensor umsetzen/einmessen“: Liste der Figuren mit Nummern wie
  im Plan und drei Knöpfen: **„Das bin ich“** (nur diese Figur zählt beim
  Messen, andere dürfen im Raum sein), **„Hund“** (die Figur zählt in keiner
  Zone außer dem Hundeplatz und nicht bei den Figuren) und **„Aufräumen“**
  (entfernt nach Rückfrage alle Figuren außer der eigenen; meldet der Sensor
  ein entferntes Ziel weiter an derselben Stelle, bleibt es weg, bis es sich
  bewegt). Neu: WebSocket `figur/markieren` und `figuren/aufraeumen` (nur
  Admins), `markierung` je Figur in `live/subscribe`.

## [0.21.0] - 2026-11-26

### Geändert

- Melder-Räume werden schneller frei: Raumzonen hält „jemand da“ nach dem
  letzten Melder nur noch 2 s statt 10 s (`MELDER_HALTE_S`); der Melder hält
  ja selbst schon nach. Radar-Räume bleiben unverändert.

### Hinzugefügt

- Bei jedem platzierten Melder: „Reichweite laut Plan“ (weitester Punkt des
  Raums vom Melder aus) als Hilfe, die Reichweite am Gerät passend
  einzustellen. Raumzonen stellt Geräte nicht selbst ein.

## [0.20.0] - 2026-11-26

### Geändert

- Jedes Raum-Gerät von Raumzonen bekommt den Bereich des Raums in Home
  Assistant (ohne eingetragenen Bereich: den Bereich mit gleichem Namen).
  Damit erscheinen die Anzeigen (Anwesenheit, Zonen) im richtigen Bereich.
  Ein Bereich, den jemand selbst gesetzt hat, bleibt.

## [0.19.0] - 2026-11-26

### Hinzugefügt

- Dashboard-Karte „Raumzonen“ (`custom:raumzonen-karte`): ein Raum oder der
  Hausplan live, nur zum Ansehen: Wände, Zonen in ihren Farben (belegt
  kräftig, frei blass), „Anwesenheit“ als Füllung des Raums, Personen als
  Punkte, Grundriss im Hintergrund; „nicht erreichbar“ gestrichelt.
  Einstellungen: `raum` (`haus` oder Kennung), `stockwerk`, `titel`,
  `hintergrund`, `figuren`, `hoehe`. Raumzonen lädt die Karte selbst, eine
  Ressource muss man nicht anlegen.
- Assistent „Sensor einmessen“: „Aufs Handy schicken“ schickt eine Nachricht
  in die Home-Assistant-App; Antippen öffnet den Assistenten des Raums
  (ersetzt „Link fürs Handy kopieren“). Nur Handys mit der App, nur auf
  Knopfdruck.

## [0.18.0] - 2026-11-26

### Hinzugefügt

- Jeder Radar-Raum mit Wänden hat jetzt von selbst „Anwesenheit“ für den
  ganzen Raum (wie die Melder-Räume), ohne eigene Zone. Regel wie eine
  normale Zone (frei 5 s nach dem Letzten). Gibt es schon eine eigene Zone
  mit der Kennung „anwesenheit“ (z. B. aus „In Radar-Raum umwandeln“), zählt
  die eigene; wird sie gelöscht, übernimmt die automatische mit derselben
  Anzeige in Home Assistant.

## [0.17.0] - 2026-11-26

### Hinzugefügt

- Wege durchs Haus: Werden kurz nacheinander (bis 10 s) die Tür-Zone in
  einem Raum und die verbundene Tür-Zone im Nachbarraum belegt, ist das ein
  Weg von dort nach hier. Mit einem Melder-Raum auf der anderen Seite zählt
  dessen „jemand da“ (grob). Jeder Weg kommt als Ereignis `raumzonen_weg`
  (von, nach, Tür, genau) für eigene Automationen; im Hausplan unter
  „Wege“ stehen die letzten 20 (nur im Speicher, seit dem letzten Start).
- „Tür-Zonen anlegen“ (Raum → Zonen, Radar-Räume): vor jede Tür in der Wand
  eine Zone mit der Rolle „Tür“, so breit wie die Tür, mit Name und Ziel der
  Tür.
- Assistent „Sensor einmessen“ fürs Handy: eigene Ansicht mit großem Plan
  oben und einem Schritt unten (große Knöpfe, ohne Werkzeuge, nichts lässt
  sich versehentlich verschieben). Kommt von selbst auf schmalen Bildschirmen,
  per „Große Ansicht“ oder über „Link fürs Handy kopieren“
  (`/raumzonen?assistent=<raum>`).

### Geändert

- Einmessen: erst die Stelle wählen, dann hinstellen und messen. Raumzonen
  schlägt feste Stellen vor (jede Ecke etwa 50 cm von den Wänden, vor jeder
  Tür), drei weit auseinander sind hervorgehoben; Antippen in der Nähe rastet
  auf die Stelle ein. Kein Zielen mehr auf einen Punkt nach dem Messen.

## [0.16.0] - 2026-11-26

### Hinzugefügt

- Melder-Raum in Radar-Raum umwandeln: Nutzt ein Melder-Raum Belegt-Anzeigen
  eines FP400 (oder hängt im Bereich ein freier FP400), steht unter „Melder
  und Raum“ der Knopf „In Radar-Raum umwandeln“. Name, Bereich, Stockwerke,
  Wände, Türen, Lage im Haus und gezeichnete Zonen bleiben; „Anwesenheit“
  bleibt als Zone über den ganzen Raum (gleiche Anzeige in Home Assistant).
  Danach lassen sich die Zonen der Zonen-Karte mit „Aus dem Konverter
  übernehmen“ holen.

### Geändert

- Die Belegt-Anzeigen eines FP400 heißen in der Melder-Liste jetzt „…
  (Bereich 3 des Sensors)“ statt alle gleich.

## [0.15.0] - 2026-11-26

### Hinzugefügt

- Grundriss einem Stockwerk zuordnen (Hausplan → Grundrisse → „Ausrichten“
  → Stockwerk), auch nachträglich. Ein Grundriss mit Stockwerk erscheint nur,
  wenn oben dieses Stockwerk gewählt ist; unter „Alle“ nur Grundrisse ohne
  Stockwerk, damit nichts übereinanderliegt.
- Raum „wie im Hausplan“: Ist ein Raum im Hausplan gedreht, zeigt ihn die
  Raumansicht jetzt genauso gedreht, mit geradem Grundriss im Hintergrund.
  Der Knopf links (Pfeile im Kreis) schaltet zurück auf „Raum gerade“. Nur
  Anzeige: Zonen, Sensor und Daten ändern sich nicht.
- Türen mit Namen („Tür zum Flur“) und mit einer bestimmten Tür im
  Nachbarraum verbinden („Führt zu“ im Raum und im Hausplan). Eine neu
  gezeichnete Tür wird mit der nächsten Tür eines Nachbarraums (bis 1,5 m)
  verbunden; im Hausplan schlägt jede Tür ohne Ziel die nächste vor, und
  „Türen automatisch verbinden“ macht das für alle. Verbindungen gelten
  immer in beide Richtungen.
- Zellen-Zonen bearbeiten: bei der Zone „Zellen bearbeiten“, dann Zellen
  dazu malen oder wegnehmen.

### Behoben

- „Neue Zone → Zellen“ malte in eine gerade gewählte Zellen-Zone, statt eine
  neue anzulegen.

## [0.14.0] - 2026-11-26

### Hinzugefügt

- PDF mit mehreren Grundrissen (einer je Seite): beim Übernehmen erscheinen
  alle als Vorschau, man wählt einen. Leere Seiten werden ausgelassen.
- Melder im Plan: Erfassung „Rundum (Decke)“ oder „Gerichtet (Wand)“ mit
  Öffnung 60°, 90°, 120° oder 150°, dazu die Reichweite in Metern.

### Geändert

- Melder-Auswahl: unter jedem Melder steht jetzt die Art (Radar,
  Bewegungsmelder, Kamera, Tablet, Kontakt …), Hersteller und Modell und der
  Bereich. Kameras und Tablets werden nicht mehr als Melder vorgeschlagen.
- „Nur Melder aus <Bereich>“: zeigt beim Raum und beim Anlegen nur die
  Melder aus dem Bereich des Raums (abschaltbar). Beim Anlegen steht der
  Bereich jetzt über der Liste.

### Behoben

- Zonen eines FP400, die vor 0.13.0 als Melder gewählt wurden, erschienen
  nur noch als lange Kennung. Jetzt stehen sie mit Namen und dem Hinweis,
  sie abzuwählen und den Raum als Radar-Raum anzulegen.

## [0.13.0] - 2026-11-26

### Hinzugefügt

- Melder-Räume: Melder im Plan platzieren (Punkt mit Sichtbereich, ziehen
  und am Griff drehen) und Zonen zeichnen, die je ein Melder meldet (z. B.
  die Zonen eines Aqara FP2). Jede Zone bekommt „belegt“ in Home Assistant;
  „Anwesenheit“ für den ganzen Raum bleibt. Beim Melder „Zone für diesen
  Melder“ legt die Zone gleich mit der Zuordnung an.
- Grundriss ausrichten (Hausplan → Grundrisse → „Ausrichten“): Bild unter
  die Räume ziehen, um 90°, 5° oder 1° drehen, an den Ecken zuschneiden.
- Maßstab des Grundrisses nachträglich ändern: unter „Ausrichten“ größer
  oder kleiner (1 %, 10 %) oder „Maß neu setzen“ (zwei Punkte im Bild
  antippen, echte Länge eingeben).
- „Aus Home Assistant übernehmen“ schlägt für Bereiche mit einem
  Radarsensor einen Radar-Raum vor; Melder sind nach Gerät gruppiert.

### Geändert

- Belegt-Anzeigen eines FP400 werden nicht mehr als Bewegungsmelder
  angeboten (der FP400 wird als Radar-Raum angelegt).

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
