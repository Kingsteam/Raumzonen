"""Startet die Testinstanz von Raumzonen.

Aufruf (aus dem Repo, mit aktivierter venv):

    python devtools/testinstanz/start.py [--daten PFAD] [--port 8123]

- Die Daten der Instanz liegen außerhalb des Repos (Standard:
  ``../testinstanz-daten`` neben dem Repo).
- ``custom_components/raumzonen`` und der Simulator werden
  verlinkt, Änderungen am Code gelten also nach einem Neustart sofort.
- Beim ersten Start wird die Ersteinrichtung automatisch erledigt: Benutzer
  ``test`` mit zufälligem Passwort (steht in ``zugang.txt`` im Datenordner).

Die Instanz ist komplett simuliert und verbindet sich mit keinem echten Gerät.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser

HIER = Path(__file__).resolve().parent
REPO = HIER.parents[1]
CLIENT_ID = "http://localhost/"


def _anfrage(url: str, daten: dict | None = None, token: str | None = None) -> dict:
    """Schickt eine JSON-Anfrage an die lokale Instanz."""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(daten).encode() if daten is not None else None
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as antwort:
        text = antwort.read().decode()
    return json.loads(text) if text else {}


def _warten(basis: str, prozess: subprocess.Popen, sekunden: int = 180) -> None:
    """Wartet, bis die Instanz antwortet."""
    for _ in range(sekunden):
        if prozess.poll() is not None:
            sys.exit("Home Assistant hat sich beendet, siehe home-assistant.log")
        try:
            urllib.request.urlopen(f"{basis}/api/onboarding", timeout=2)
        except urllib.error.HTTPError:
            return
        except OSError:
            time.sleep(1)
            continue
        return
    sys.exit("Home Assistant antwortet nicht")


def _einrichten(basis: str, daten: Path) -> None:
    """Erledigt die Ersteinrichtung, falls sie noch fehlt."""
    try:
        schritte = _anfrage(f"{basis}/api/onboarding")
    except urllib.error.HTTPError as err:
        if err.code == 404:  # Ersteinrichtung ist schon erledigt
            return
        raise
    offen = {s["step"] for s in schritte if not s["done"]}
    if "user" not in offen:
        return
    passwort = secrets.token_urlsafe(12)
    code = _anfrage(
        f"{basis}/api/onboarding/users",
        {
            "client_id": CLIENT_ID,
            "name": "Test",
            "username": "test",
            "password": passwort,
            "language": "de",
        },
    )["auth_code"]
    form = urllib.parse.urlencode(
        {"grant_type": "authorization_code", "code": code, "client_id": CLIENT_ID}
    ).encode()
    with urllib.request.urlopen(f"{basis}/auth/token", data=form, timeout=10) as r:
        token = json.loads(r.read())["access_token"]
    _anfrage(f"{basis}/api/onboarding/core_config", {}, token)
    _anfrage(f"{basis}/api/onboarding/analytics", {}, token)
    _anfrage(
        f"{basis}/api/onboarding/integration",
        {"client_id": CLIENT_ID, "redirect_uri": f"{CLIENT_ID}?auth_callback=1"},
        token,
    )
    zugang = daten / "zugang.txt"
    zugang.write_text(f"Benutzer: test\nPasswort: {passwort}\n")
    zugang.chmod(0o600)
    _raumzonen_anlegen(basis, token)


def _options(basis: str, token: str, entry_id: str, *schritte: dict) -> dict:
    """Geht die Schritte eines Options-Flows durch."""
    flow = _anfrage(
        f"{basis}/api/config/config_entries/options/flow", {"handler": entry_id}, token
    )
    for schritt in schritte:
        flow = _anfrage(
            f"{basis}/api/config/config_entries/options/flow/{flow['flow_id']}",
            schritt,
            token,
        )
    return flow


def _raumzonen_anlegen(basis: str, token: str) -> None:
    """Raumzonen mit einem Raum „Schlafzimmer“ am simulierten FP400 anlegen."""
    flow = _anfrage(
        f"{basis}/api/config/config_entries/flow", {"handler": "raumzonen"}, token
    )
    entry = _anfrage(
        f"{basis}/api/config/config_entries/flow/{flow['flow_id']}", {}, token
    )["result"]["entry_id"]
    device_id = _geraet(basis, token, "sensor.simulierter_fp400_targets_xy")
    _options(
        basis,
        token,
        entry,
        {"next_step_id": "raum_neu"},
        {"name": "Schlafzimmer", "device_id": device_id, "quelle": "entitaet"},
    )
    time.sleep(3)  # Raumzonen lädt neu
    _options(
        basis,
        token,
        entry,
        {"next_step_id": "zonen_import"},
        {"raum_id": "schlafzimmer"},
        {"zone_1": "bett", "zone_2": "ausgang", "zone_3": "normal"},
    )
    time.sleep(3)
    asyncio.run(_ausrichten(basis, token))
    time.sleep(3)
    _options(
        basis,
        token,
        entry,
        {"next_step_id": "raum_neu"},
        {
            "name": "Flur",
            "device_id": _geraet(
                basis, token, "sensor.simulierter_fp400_flur_targets_xy"
            ),
            "quelle": "entitaet",
        },
    )
    time.sleep(3)
    asyncio.run(_flur_und_haus(basis, token))


def _geraet(basis: str, token: str, entity_id: str) -> str:
    """Geräte-ID zu einer Entität (über die Vorlagen-API)."""
    req = urllib.request.Request(
        f"{basis}/api/template",
        data=json.dumps({"template": f"{{{{ device_id('{entity_id}') }}}}"}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as antwort:
        return antwort.read().decode().strip()


# Ausrichtung wie im echten Raum: Sensor um 32° gedreht, dann liegt das Bett
# gerade. Die übernommenen Zonen wandern mit (wie „Zonen bewegen sich mit“).
SENSOR_WINKEL = 32.0
WAENDE = [[-330, -40], [120, -40], [120, 320], [-330, 320]]


def _drehen(p: list[float], winkel: float) -> list[float]:
    a = math.radians(winkel)
    c, s = math.cos(a), math.sin(a)
    return [round(p[0] * c - p[1] * s, 1), round(p[0] * s + p[1] * c, 1)]


async def _ausrichten(basis: str, token: str) -> None:
    """Sensor drehen, Zonen mitnehmen, Wände setzen (über die Panel-Befehle)."""
    import aiohttp

    async with aiohttp.ClientSession() as session:
        ws = await session.ws_connect(basis.replace("http", "ws") + "/api/websocket")
        await ws.receive_json()
        await ws.send_json({"type": "auth", "access_token": token})
        await ws.receive_json()
        await ws.send_json({"id": 1, "type": "raumzonen/rooms/get"})
        raum = (await ws.receive_json())["result"]["raeume"][0]
        for zone in raum["zonen"]:
            if zone["form"]["art"] == "vieleck":
                zone["form"]["punkte"] = [
                    _drehen(p, SENSOR_WINKEL) for p in zone["form"]["punkte"]
                ]
        await ws.send_json(
            {
                "id": 2,
                "type": "raumzonen/room/save",
                "raum_id": raum["id"],
                "zonen": raum["zonen"],
                "sensor": {"x": 0, "y": 0, "winkel": SENSOR_WINKEL},
                "umriss": WAENDE,
            }
        )
        antwort = await ws.receive_json()
        if not antwort.get("success"):
            print("Ausrichten fehlgeschlagen:", antwort)
        await ws.close()


# Erfundener Flur neben dem Schlafzimmer: Sensor an der Stirnseite, eine Tür
# zum Schlafzimmer, am anderen Ende die Haustür.
FLUR_WAENDE = [[-80, -20], [80, -20], [80, 460], [-80, 460]]
FLUR_ZONEN = [
    ("Tür Schlafzimmer", [[-80, 20], [-40, 20], [-40, 100], [-80, 100]]),
    ("Haustür", [[-40, 410], [40, 410], [40, 460], [-40, 460]]),
]
# Lage im Haus: Schlafzimmer am Ursprung, Flur rechts daneben.
FLUR_LAGE = {"x": 200, "y": -40, "winkel": 0}


async def _ws(session, basis: str, token: str):
    ws = await session.ws_connect(basis.replace("http", "ws") + "/api/websocket")
    await ws.receive_json()
    await ws.send_json({"type": "auth", "access_token": token})
    await ws.receive_json()
    return ws


async def _flur_und_haus(basis: str, token: str) -> None:
    """Zonen und Wände des Flurs, dann beide Räume im Hausplan verbinden."""
    import aiohttp

    async with aiohttp.ClientSession() as session:
        ws = await _ws(session, basis, token)
        await ws.send_json({"id": 1, "type": "raumzonen/rooms/get"})
        daten = (await ws.receive_json())["result"]
        tuer_regel = daten["vorlagen"]["ausgang"]
        zonen = [
            {
                "name": name,
                "art": "ausgang",
                "form": {"art": "vieleck", "punkte": punkte},
                "regel": tuer_regel,
            }
            for name, punkte in FLUR_ZONEN
        ]
        await ws.send_json(
            {
                "id": 2,
                "type": "raumzonen/room/save",
                "raum_id": "flur",
                "zonen": zonen,
                "umriss": FLUR_WAENDE,
            }
        )
        if not (await ws.receive_json()).get("success"):
            print("Flur nicht gespeichert")
        await asyncio.sleep(3)  # Raumzonen lädt neu
        await ws.close()
        ws = await _ws(session, basis, token)
        await ws.send_json({"id": 3, "type": "raumzonen/rooms/get"})
        raeume = {r["id"]: r for r in (await ws.receive_json())["result"]["raeume"]}

        def tuer(raum_id: str, name: str) -> str:
            return next(
                z["id"]
                for z in raeume[raum_id]["zonen"]
                if z["art"] == "ausgang" and z["name"] == name
            )

        await ws.send_json(
            {
                "id": 4,
                "type": "raumzonen/haus/save",
                "raeume": [
                    {"raum_id": "schlafzimmer", "x": 0, "y": 0, "winkel": 0},
                    {"raum_id": "flur", **FLUR_LAGE},
                ],
                "tueren": [
                    {
                        "raum_id": "schlafzimmer",
                        "zone_id": tuer("schlafzimmer", "Tür"),
                        "fuehrt_zu": "flur",
                    },
                    {
                        "raum_id": "flur",
                        "zone_id": tuer("flur", "Tür Schlafzimmer"),
                        "fuehrt_zu": "schlafzimmer",
                    },
                    {
                        "raum_id": "flur",
                        "zone_id": tuer("flur", "Haustür"),
                        "fuehrt_zu": "aussen",
                    },
                ],
            }
        )
        if not (await ws.receive_json()).get("success"):
            print("Hausplan nicht gespeichert")
        await ws.close()


def main() -> None:
    """Richtet den Datenordner ein und startet Home Assistant."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--daten", type=Path, default=REPO.parent / "testinstanz-daten")
    parser.add_argument("--port", type=int, default=8123)
    parser.add_argument(
        "--oeffnen", action="store_true", help="danach den Browser öffnen"
    )
    args = parser.parse_args()

    daten: Path = args.daten.resolve()
    if daten.is_relative_to(REPO):
        sys.exit("Der Datenordner darf nicht im Repo liegen")
    (daten / "custom_components").mkdir(parents=True, exist_ok=True)
    shutil.copy(HIER / "config" / "configuration.yaml", daten / "configuration.yaml")
    with (daten / "configuration.yaml").open("a") as datei:
        datei.write(f"\nhttp:\n  server_port: {args.port}\n")
    # Beispiele für den Reiter „Verwendung“ (nur beim ersten Start; danach
    # gehören sie der Instanz und lassen sich im Editor ändern).
    for name in ("automations.yaml", "scripts.yaml"):
        if not (daten / name).exists():
            shutil.copy(HIER / "config" / name, daten / name)
    links = {
        "raumzonen": REPO / "custom_components" / "raumzonen",
        "raumzonen_sim": HIER / "custom_components" / "raumzonen_sim",
    }
    for name, ziel in links.items():
        link = daten / "custom_components" / name
        if link.is_symlink() or link.exists():
            link.unlink()
        link.symlink_to(ziel)

    with (daten / "start.log").open("w") as log:
        prozess = subprocess.Popen(
            [sys.executable, "-m", "homeassistant", "-c", str(daten), "--skip-pip"],
            stdout=log,
            stderr=subprocess.STDOUT,
            # Nicht im Repo starten: Sonst findet Python dort ein anderes
            # custom_components-Paket (ohne den Simulator).
            cwd=daten,
        )
    basis = f"http://127.0.0.1:{args.port}"
    try:
        _warten(basis, prozess)
        _einrichten(basis, daten)
    except BaseException:
        prozess.terminate()
        raise
    print(f"Testinstanz läuft: {basis}")
    print(f"Zugang: {daten / 'zugang.txt'}")
    print((daten / "zugang.txt").read_text().strip())
    print("Beenden mit Ctrl+C.")
    if args.oeffnen:
        webbrowser.open(basis)
    try:
        prozess.wait()
    except KeyboardInterrupt:
        prozess.terminate()


if __name__ == "__main__":
    main()
