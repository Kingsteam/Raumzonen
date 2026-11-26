// Datentypen des Panels (wie in serialize.py / websocket_api.py).

export type Point = [number, number];

export type Form =
  | { art: "vieleck"; punkte: Point[] }
  | { art: "rechteck"; mitte: Point; breite: number; tiefe: number; winkel: number }
  | { art: "zellen"; groesse: number; zellen: Point[]; x0?: number; y0?: number };

export interface Regel {
  belegt_nach_s: number;
  frei_nach_s: number;
  rand_cm: number;
  schlaefer_halten: boolean;
  weg_rahmen: number;
  weg_cm: number;
  max_personen: number;
  hund_ignorieren: boolean;
}

export type ZonenArt = "normal" | "ausgang" | "hundeplatz" | "stoerquelle" | "stelle" | "durchgang";

export interface Zone {
  id?: string;
  name: string;
  art: ZonenArt;
  form: Form;
  regel: Regel;
  /** Nur bei Türen: "aussen", eine andere Raum-ID oder leer (weiß nicht). */
  fuehrt_zu?: string;
  /** Nur in Melder-Räumen: diese Melder melden die Zone. */
  melder?: string[];
}

/** Wo ein Melder im Raum hängt (nur Anzeige). */
export interface MelderLage {
  x: number;
  y: number;
  winkel: number;
  reichweite_cm: number;
  oeffnung_grad: number;
}

export interface Sensor {
  art: string;
  device_id: string;
  quelle: string;
  mqtt_topic: string;
  x: number;
  y: number;
  winkel: number;
  reichweite_cm: number;
  oeffnung_grad: number;
}

/** Tür oder offene Stelle in einer Wand: Wand `kante` (Ecke kante → kante+1), Abschnitt in cm. */
export interface Oeffnung {
  kante: number;
  von: number;
  bis: number;
  art: "tuer" | "offen";
  /** Tür: Scharnier am Anfang (Ecke `kante`) oder am Ende der Öffnung. */
  anschlag?: "anfang" | "ende";
  /** Tür: geht in den Raum oder nach außen auf. */
  aufgehen?: "innen" | "aussen";
  /** Wohin sie führt: Raum-ID, "aussen" oder leer (weiß nicht). */
  fuehrt_zu?: string;
}

export interface Raum {
  id: string;
  name: string;
  /** "radar" (FP400 mit Zonen) oder "melder" (nur Bewegungs-/Präsenzmelder). */
  art: string;
  /** Nur Melder-Räume: Melder (feste Kennung im Entitätsregister). */
  melder?: string[];
  melder_nachlauf_s?: number;
  bereich_id?: string;
  /** Stockwerke (IDs aus Home Assistant); leer = das Stockwerk des Bereichs. */
  stockwerke?: string[];
  /** Nur Melder-Räume: Lage der Melder (Kennung → Lage). */
  melder_lagen?: Record<string, MelderLage>;
  sensor: Sensor;
  zonen: Zone[];
  ansicht_winkel: number;
  umriss: Point[];
  oeffnungen: Oeffnung[];
  aufnahme: boolean;
  aufnahme_tage: number;
  haus_x: number;
  haus_y: number;
  haus_winkel: number;
  /** Erst wahr, wenn der Raum im Hausplan liegt. */
  haus_gesetzt: boolean;
}

/** Grundriss als Hintergrund: Bildpunkt (px, py), py nach unten, liegt im Haus bei (x + px·k, y + (hoehe_px − py)·k). */
export interface Plan {
  id: string;
  name: string;
  datei: string;
  cm_pro_px: number;
  breite_px: number;
  hoehe_px: number;
  x: number;
  y: number;
  /** Stockwerk (ID aus Home Assistant), leer = keins. */
  stockwerk?: string;
  /** Drehung um den Bildursprung (oben links), Grad. */
  winkel?: number;
  /** Zuschnitt in Bildpunkten [x0, y0, x1, y1]; leer = ganzes Bild. */
  zuschnitt?: number[];
}

export interface Stockwerk {
  id: string;
  name: string;
  level: number | null;
  icon: string | null;
}

export interface RoomsResult {
  raeume: Raum[];
  plaene?: Plan[];
  stockwerke_ha?: Stockwerk[];
  bereiche_ha?: { id: string; name: string; stockwerk: string | null }[];
  vorlagen: Record<string, Regel>;
  arten: ZonenArt[];
  grenzen: Record<string, number>;
  /** Nur Admins dürfen ändern; alle anderen sehen nur zu. */
  darf_aendern: boolean;
}

export interface LiveFigur {
  id: number;
  sensor_id: number;
  x: number;
  y: number;
  gehalten: boolean;
  bewegt: boolean;
  art: string | null;
  tags: string[];
  spur: Point[];
}

export interface Live {
  raum_id: string;
  verfuegbar: boolean;
  problem: string | null;
  rahmen: number;
  letzter_rahmen_vor_s: number | null;
  figuren: LiveFigur[];
  ziele: [number, number, number][];
  zonen: Record<string, { belegt: boolean; personen: number; grund: string | null }>;
}

export interface Heat {
  zelle_cm: number;
  minuten: number;
  zellen: [number, number, number][];
}

/** Auswertung der Aufnahme (WebSocket ``raumzonen/auswertung/get``, nur Admins). */
export interface AuswertungFigur {
  figur: string;
  nummer: number;
  hund: boolean;
  sekunden: number;
  erst: number;
  zuletzt: number;
  zonen: Record<string, number>;
  abschnitte: [number, number][];
  zellen: [number, number, number][];
}

export interface AuswertungZone {
  zone_id: string;
  sekunden: number;
  belegt_s: number;
  abschnitte: [number, number][];
  figuren: string[];
}

export interface Auswertung {
  von: number;
  bis: number;
  stunden: number;
  zelle_cm: number;
  zeilen: number;
  zonen: AuswertungZone[];
  figuren: AuswertungFigur[];
}

/** Was sich als Raum anlegen lässt (WebSocket ``raumzonen/kandidaten/get``). */
export interface KandidatMelder {
  id: string;
  entity_id: string;
  name: string;
  klasse: string;
  bereich_id: string | null;
  benutzt_von: string | null;
  /** Gerät, zu dem der Melder gehört (zum Gruppieren). */
  geraet: string | null;
  /** Art in Worten: „Radar (Anwesenheit)“, „Bewegungsmelder“, „Kamera“ … */
  typ?: string;
  /** Hersteller und Modell des Geräts. */
  modell?: string | null;
  /** false: gehört zu einem Radarsensor, nur noch zum Abwählen da. */
  angeboten?: boolean;
}

export interface Kandidaten {
  melder: KandidatMelder[];
  fp400: { device_id: string; name: string; bereich_id: string | null; mqtt_topic: string; benutzt: boolean }[];
  bereiche: { bereich_id: string; name: string }[];
  vorschlaege: { bereich_id: string; name: string; art: "melder" | "radar"; melder: string[]; device_id?: string }[];
}

export interface Hass {
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  connection: {
    subscribeMessage<T>(
      callback: (msg: T) => void,
      msg: Record<string, unknown>,
    ): Promise<() => Promise<void>>;
  };
  language?: string;
}
