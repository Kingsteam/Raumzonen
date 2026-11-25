# Testinstanz

Eine eigene, **komplett simulierte** Home-Assistant-Instanz zum Ausprobieren
von Raumzonen. Sie ist **keine Kopie** der echten Installation: keine
Zugangsdaten, keine echten Geräte, keine Cloud.

## Starten (Entwicklung)

```bash
source ../venv/bin/activate          # venv aus CLAUDE.md
uv pip install -r devtools/testinstanz/requirements.txt   # einmalig
python devtools/testinstanz/start.py
```

Dann <http://127.0.0.1:8123> öffnen. Benutzer und Passwort stehen in
`../testinstanz-daten/zugang.txt`. Der Datenordner liegt außerhalb des Repos
und kann jederzeit gelöscht werden; beim nächsten Start entsteht eine frische
Instanz.

Beim ersten Start erledigt das Skript die Ersteinrichtung, legt Raumzonen an,
dazu den Raum „Schlafzimmer“ am simulierten FP400 (Quelle „Entitäten“) und
übernimmt die Software-Zonen des simulierten Konverters (Bett, Tür, Kasten).
Dazu kommt der Raum „Flur“ am zweiten simulierten Sensor mit zwei Türen;
beide Räume liegen im Hausplan nebeneinander und sind über die Tür verbunden.
Das Panel ist unter **Raumzonen** in der Seitenleiste.

Der Code von Raumzonen ist verlinkt: nach einer Änderung an Python Home
Assistant neu starten; nach `npm run build` reicht ein Neuladen der Seite.

Beenden mit Ctrl+C; läuft Home Assistant danach noch, mit
`pkill -f "homeassistant -c"` beenden.

## Was simuliert wird

Die Hilfs-Integration `raumzonen_sim` (nur hier, wird nicht ausgeliefert)
legt das Gerät **Simulierter FP400** an, mit denselben Entitäten wie der
erweiterte Zigbee2MQTT-Konverter:

| Entität | Inhalt |
|---|---|
| `sensor.simulierter_fp400_targets_xy` | Ziele als `id:x:y;…` |
| `sensor.simulierter_fp400_tracking_last_update` | Zeit jedes Rahmens |
| `text.simulierter_fp400_software_zone_1…3_config` | Software-Zonen (Bett gedreht, Tür, Kasten) |

Im Schlafzimmer spielt eine **erfundene Szene** (zum Bett gehen, liegen,
aufstehen, hinausgehen). Wer die privaten, anonymisierten Aufnahmen hat
(Repo `haus-privat`, Ordner `raumzonen/aufnahmen`), setzt vor dem Start
`RAUMZONEN_AUFNAHMEN=<Ordner>`; dann laufen die Abschnitte rund um jedes
Aufstehen in einer Schleife (lange Pausen auf höchstens 4 s gekürzt).

Fehlermeldungen zu `ffmpeg`, `turbojpeg`, `radios`, `metno` usw. im Log sind
harmlos; diese Teile von Home Assistant werden hier nicht gebraucht.
