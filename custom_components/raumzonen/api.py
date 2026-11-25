"""Schnittstelle ``raumzonen/1`` für andere Integrationen (z. B. das Homebrain).

Nur lesen; nichts hier schaltet etwas. Benutzung::

    from custom_components.raumzonen.api import get_api
    api = get_api(hass)                       # None, wenn nicht installiert
    if api is not None and api.schema == "raumzonen/1":
        api.raeume()                          # Aufbau: Räume, Zonen, Türen
        api.momentaufnahme()                  # Zustand jetzt
        abmelden = api.abonnieren(meldung, arten={"zone", "sensor"})

Arten im Abo:

* ``zone``: eine Zone hat sich geändert (sofort).
* ``sensor``: Erreichbarkeit/Frische des Sensors hat sich geändert (sofort).
* ``spur``: alle Spuren eines Raums, höchstens zweimal je Sekunde.
* ``geladen``: Raumzonen wurde neu geladen (Aufbau kann sich geändert haben,
  Spur-Kennungen beginnen neu); ``daten`` ist der neue Aufbau.

Der Verteiler lebt in ``hass.data`` und überlebt das Neuladen: Abos bleiben.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util

from . import vertrag
from .const import DOMAIN, LOGGER

if TYPE_CHECKING:
    from .controller import RoomController
    from .model import RaumConfig

API_KEY = f"{DOMAIN}_api"
ARTEN = frozenset({"zone", "sensor", "spur", "geladen"})
SPUR_MIN_INTERVAL_S = 0.5

type Meldung = Callable[[dict[str, Any]], None]


@dataclass(slots=True)
class _Abo:
    meldung: Meldung
    arten: frozenset[str]
    raum_id: str | None
    seq: int = 0

    def will(self, art: str, raum_id: str | None) -> bool:
        return art in self.arten and (
            self.raum_id is None or raum_id is None or raum_id == self.raum_id
        )


@dataclass(slots=True)
class _RaumStand:
    zonen: dict[str, tuple[Any, ...]] = field(default_factory=dict)
    sensor: tuple[Any, ...] | None = None
    spur_timer: CALLBACK_TYPE | None = None
    spur_last: float = -1e9
    spur_key: tuple[Any, ...] | None = None
    remove: CALLBACK_TYPE | None = None


def _zone_key(z: dict[str, Any]) -> tuple[Any, ...]:
    return (z["belegt"], z["zustand"], z["personen"], z["mensch"], z["hund"])


def _spur_key(s: dict[str, Any]) -> tuple[Any, ...]:
    return (
        s["spur_id"],
        s["x"],
        s["y"],
        s["gehalten"],
        s["bewegt"],
        tuple(s["tags"]),
        tuple(s["in_zonen"]),
        tuple(s["an_stellen"]),
    )


def _sensor_key(s: dict[str, Any]) -> tuple[Any, ...]:
    return (s["erreichbar"], s["daten_frisch"], s["unvollstaendig"], s["problem"])


class RaumzonenApi:
    """Verteiler: liest aus den laufenden Räumen, meldet an Abonnenten."""

    schema = vertrag.SCHEMA

    def __init__(self, hass: HomeAssistant) -> None:
        """Leer anlegen; Räume kommen mit ``attach``."""
        self.hass = hass
        self._controllers: dict[str, RoomController] = {}
        self._raeume: list[RaumConfig] = []
        self._abos: list[_Abo] = []
        self._stand: dict[str, _RaumStand] = {}

    # -- Lesen -----------------------------------------------------------------

    @property
    def geladen(self) -> bool:
        """Ob Raumzonen gerade läuft (zwischen Entladen und Laden nicht)."""
        return bool(self._controllers) or bool(self._raeume)

    @callback
    def raeume(self) -> list[dict[str, Any]]:
        """Aufbau aller Räume."""
        return [vertrag.raum_info(r) for r in self._raeume]

    @callback
    def momentaufnahme(self, raum_id: str | None = None) -> dict[str, Any]:
        """Zustand aller (oder eines) Raums jetzt."""
        return vertrag.momentaufnahme(self._controllers, raum_id)

    # -- Abo -------------------------------------------------------------------

    @callback
    def abonnieren(
        self,
        meldung: Meldung,
        arten: Iterable[str] = ("zone", "sensor", "geladen"),
        raum_id: str | None = None,
    ) -> CALLBACK_TYPE:
        """Meldungen bekommen; gibt die Funktion zum Abmelden zurück."""
        wanted = frozenset(arten)
        if not wanted or not wanted <= ARTEN:
            raise ValueError(f"Unbekannte Arten: {sorted(wanted - ARTEN)}")
        abo = _Abo(meldung, wanted, raum_id)
        self._abos.append(abo)

        @callback
        def _abmelden() -> None:
            if abo in self._abos:
                self._abos.remove(abo)

        return _abmelden

    def _send(self, art: str, raum_id: str | None, daten: Any) -> None:
        for abo in list(self._abos):
            if not abo.will(art, raum_id):
                continue
            abo.seq += 1
            try:
                abo.meldung(vertrag.nachricht(art, raum_id or "", daten, abo.seq))
            except Exception:
                # Ein fehlerhafter Abnehmer darf Raumzonen nicht stören.
                LOGGER.exception("Abnehmer von %s ist fehlgeschlagen", art)

    def _wants(self, art: str, raum_id: str) -> bool:
        return any(abo.will(art, raum_id) for abo in self._abos)

    # -- Anbindung an die laufenden Räume ---------------------------------------

    @callback
    def attach(
        self, raeume: list[RaumConfig], controllers: dict[str, RoomController]
    ) -> None:
        """Nach dem Laden: Räume übernehmen und auf Änderungen hören."""
        self.detach()
        self._raeume = list(raeume)
        self._controllers = dict(controllers)
        for raum_id, controller in self._controllers.items():
            stand = _RaumStand()
            self._stand[raum_id] = stand
            stand.remove = controller.add_listener(
                lambda rid=raum_id: self._changed(rid)
            )
            # Stand merken, ohne zu melden (die Momentaufnahme reicht).
            zustand = vertrag.raum_zustand(controller)
            stand.sensor = _sensor_key(zustand["sensor"])
            stand.zonen = {z["zone_id"]: _zone_key(z) for z in zustand["zonen"]}
        self._send("geladen", None, self.raeume())

    @callback
    def detach(self) -> None:
        """Vor dem Entladen: nicht mehr zuhören (Abos bleiben)."""
        for stand in self._stand.values():
            if stand.remove is not None:
                stand.remove()
            if stand.spur_timer is not None:
                stand.spur_timer()
        self._stand.clear()
        self._controllers.clear()
        self._raeume = []

    @callback
    def _changed(self, raum_id: str) -> None:
        controller = self._controllers.get(raum_id)
        stand = self._stand.get(raum_id)
        if controller is None or stand is None or not self._abos:
            return
        if self._wants("sensor", raum_id) or self._wants("zone", raum_id):
            sensor = vertrag.sensor_status(controller)
            key = _sensor_key(sensor)
            if key != stand.sensor:
                stand.sensor = key
                self._send("sensor", raum_id, sensor)
            for zone_id in controller.room.zones:
                zone = vertrag.zone_status(controller, zone_id)
                key = _zone_key(zone)
                if stand.zonen.get(zone_id) != key:
                    stand.zonen[zone_id] = key
                    self._send("zone", raum_id, zone)
        if self._wants("spur", raum_id) and stand.spur_timer is None:
            self._send_spuren(raum_id)

    @callback
    def _send_spuren(self, raum_id: str) -> None:
        stand = self._stand.get(raum_id)
        controller = self._controllers.get(raum_id)
        if stand is None or controller is None:
            return
        stand.spur_timer = None
        wait = SPUR_MIN_INTERVAL_S - (dt_util.utcnow().timestamp() - stand.spur_last)
        if wait > 0:
            # Zu früh (auch wenn ein Zeitgeber vorzeitig kommt): später nochmal.
            stand.spur_timer = async_call_later(
                self.hass, wait, callback(lambda _now: self._send_spuren(raum_id))
            )
            return
        spuren = vertrag.spuren(controller)
        key = tuple(_spur_key(s) for s in spuren)
        if key == stand.spur_key:
            # Nichts Neues (nur die Uhr lief weiter): nicht melden.
            return
        stand.spur_key = key
        stand.spur_last = dt_util.utcnow().timestamp()
        self._send(
            "spur",
            raum_id,
            {"spuren_seit": controller.started_at.isoformat(), "spuren": spuren},
        )


def get_api(hass: HomeAssistant) -> RaumzonenApi | None:
    """Für Abnehmer: der Verteiler, oder None, wenn Raumzonen nicht da ist."""
    api = hass.data.get(API_KEY)
    return api if isinstance(api, RaumzonenApi) else None


@callback
def async_get_api(hass: HomeAssistant) -> RaumzonenApi:
    """Den Verteiler holen (wird beim ersten Aufruf angelegt)."""
    api: RaumzonenApi | None = hass.data.get(API_KEY)
    if api is None:
        api = hass.data[API_KEY] = RaumzonenApi(hass)
    return api
