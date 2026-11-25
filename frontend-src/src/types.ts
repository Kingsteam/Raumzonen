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
}

export interface Raum {
  id: string;
  name: string;
  art: string;
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

export interface RoomsResult {
  raeume: Raum[];
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
