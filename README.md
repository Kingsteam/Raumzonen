# Raumzonen

Präsenzzonen für Radarsensoren in Home Assistant, zuerst für den
**Aqara FP400** über Zigbee2MQTT.

> **Stand 0.6.0.** Sensor angebunden, Entitäten je Zone, Panel „Raumzonen“
> mit Raumplan zum Zeichnen (Zonen, Wände mit Türen), Figuren live,
> Bewegungskarte und Hausplan; Schnittstelle für andere Integrationen.
> Raumzonen **schaltet nichts**; es meldet nur, wo jemand ist.
> Bedienung: `docs/HANDBUCH.md`.

![Panel Raumzonen](docs/bilder/01-uebersicht.png)

## Was es werden soll

* Zonen in beliebiger Form: Vieleck, schräges Rechteck oder gemalte Zellen,
  gezeichnet auf einem Raumplan.
* Je Zone sichtbare Regeln statt versteckter Wartezeiten: belegt nach,
  frei nach, Randstreifen, „Schläfer halten“, Hund nicht mitzählen.
* Spuren, die nicht verschwinden: Ein Mensch löst sich nicht in Luft auf,
  nur weil der Sensor kurz nichts meldet.
* Ziel fürs Bett: „aufgestanden“ in höchstens 5 Sekunden, ohne Fehlalarme im
  Schlaf.

## Voraussetzungen

* Home Assistant 2026.10 oder neuer
* Zigbee2MQTT mit dem erweiterten FP400-Konverter, der Positionen liefert
  (`tracking_targets`, `targets_xy`), und mindestens einer Software-Zone im
  Konverter (sonst kommen keine Positionen)

## Installation über den Marketplace

Einstellungen → Marketplace → eigenes Repository hinzufügen
(`Kingsteam/Raumzonen`, Kategorie Integration) → Raumzonen installieren →
Home Assistant neu starten → Einstellungen → Geräte & Dienste → Integration
hinzufügen → „Raumzonen“. Updates erscheinen danach unter
Einstellungen → Updates.

## Entwicklung

Siehe `CLAUDE.md` (Aufbau, Tests, Regeln) und `docs/`.

## Dank

Das Wissen über das Datenformat des FP400 stammt aus dem MIT-lizenzierten
Projekt *aqara-fp400-zone-card* (Konverter für Zigbee2MQTT). Es wurde kein
Code daraus übernommen.

## Installation von Hand

1. Auf GitHub unter **Releases** die neueste Datei `raumzonen-X.Y.Z.zip`
   herunterladen und entpacken; heraus kommt der Ordner `raumzonen`.
2. Diesen Ordner nach `/config/custom_components/` kopieren. Danach gibt es
   `/config/custom_components/raumzonen/manifest.json`.
3. Home Assistant neu starten.
