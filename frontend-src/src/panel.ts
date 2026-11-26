// Panel „Raumzonen“: Raumplan mit Sensor, Zonen zeichnen, Live-Ansicht.
//
// Grundidee der Bedienung:
// - Der Raum ist gerade (Wände waagrecht/senkrecht). Den Sensor zieht man an
//   seinen Platz und dreht ihn am gelben Griff, bis seine Abdeckung zum Raum
//   passt. Keine Felder für Koordinaten oder Winkel.
// - Zonen zeichnet man am Plan (Rechteck, Vieleck, Zellen). Statt Fachregeln
//   wählt man eine Rolle (Bett, Bereich, Tür, Hundeplatz, Ignorieren); die
//   Wartezeiten stehen als Satz da und lassen sich unter „Feineinstellung“
//   ändern.
// - Gestaltung wie das Panel „Bewässerung“.
// - Alle Nutzer sehen das Panel und die Live-Punkte; ändern dürfen nur
//   Admins (`darf_aendern`, geprüft wird es in Python).
//
// Gespeichert wird über `raumzonen/room/save`; Python prüft alles noch
// einmal. Das Panel schaltet nichts im Haus.

import { LitElement, html, nothing, svg, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  History,
  ROLLEN,
  applyRolle,
  clampOpenings,
  dragRectCorner,
  edgeMidpoints,
  fuehrtZuText,
  openingFromDrag,
  openingPoints,
  alongEdge,
  rotateForm,
  shiftOpenings,
  insertVertex,
  newZone,
  paintCell,
  rectFromDrag,
  regelSatz,
  removeVertex,
  rolleInfo,
  rolleOf,
  setVertex,
  zoneFromConverter,
  zonesProblem,
  type Rolle,
} from "./editor";
import {
  CELL_DEFAULT,
  cellOf,
  cellRects,
  distance,
  distanceToSegment,
  formCenter,
  formPoints,
  formProblem,
  headingTo,
  inForm,
  moveForm,
  moveWithSensor,
  rectCorners,
  defaultLagen,
  roomOutline,
  sectorPoints,
  roomToSensor,
  sensorDirection,
  snap,
  fromHouse,
  toHouse,
  type HausLage,
} from "./geometry";
import { styles } from "./styles";
import { dauer, dichte, flecken, pixel, summe, type HeatCell } from "./heat";
import { fehlerText } from "./fehler";
import { summeDauer, tuerenVon, vereinigen, wechsel, type Tuer } from "./haus";
import { einmessen, stelle, stellenProblem, type Einmessung } from "./einmessen";
import { bbox, erkenneGrundriss, jpegAusPdf, uebernehmen, type Grundriss } from "./grundriss";
import type { Auswertung, AuswertungFigur, Form, Hass, Heat, Kandidaten, Plan, Live, Oeffnung, Point, Raum, Regel, RoomsResult, Zone } from "./types";

const DOMAIN = "raumzonen";
const SNAP_CM = 5;
const HIT_PX = 12;

type Tool = "auswahl" | "rechteck" | "vieleck" | "zellen" | "umriss" | "oeffnung";
type Tab = "zonen" | "raum" | "auswertung";

/** Assistent „Sensor umsetzen / einmessen“. */
interface Wizard {
  /** umsetzen: vorher 3 Stellen merken, Sensor umhängen, wieder hingehen. einmessen: hinstellen und im Plan antippen. */
  modus: "umsetzen" | "einmessen";
  schritt: "vorher" | "umhaengen" | "nachher" | "ergebnis";
  /** Stellen im Raum (cm). */
  raum: (Point | null)[];
  /** Dieselben Stellen, wie der Sensor sie jetzt sieht (Sensorkoordinaten). */
  sensor: (Point | null)[];
  /** Welche Stelle gerade gemessen wird oder angetippt werden soll. */
  aktiv: number;
  messung?: { bis: number; punkte: Point[]; hinweis: string };
  tippen?: boolean;
  ergebnis?: Einmessung;
  fehler?: string;
}

/** So lange ruhig stehen, bis eine Stelle gemerkt ist. */
const MESS_S = 8;
const MAX_STREUUNG_CM = 30;

const AUSWERTUNG_STUNDEN = [1, 3, 8, 12, 24];
/** Werkzeuge in Melder-Räumen (keine Zonen, kein Sensor im Plan). */
const MELDER_TOOLS: Tool[] = ["auswahl", "umriss", "oeffnung"];
/** Die eine Zone eines Melder-Raums (der ganze Raum). */
const MELDER_ZONE = "anwesenheit";
/** Ein Raum oder das ganze Haus. */
type Page = "raum" | "haus";

interface SensorLage {
  x: number;
  y: number;
  winkel: number;
  reichweite_cm: number;
  oeffnung_grad: number;
}

interface Snapshot {
  zones: Zone[];
  sensor: SensorLage;
  umriss: Point[];
  oeffnungen: Oeffnung[];
}

type Drag =
  | { kind: "pan"; start: Point; view: { cx: number; cy: number } }
  | { kind: "vertex"; index: number }
  | { kind: "corner"; index: number }
  | { kind: "umriss-vertex"; index: number }
  | { kind: "zone"; last: Point }
  | { kind: "sensor" }
  | { kind: "sensor-rotate" }
  | { kind: "paint"; add: boolean }
  | { kind: "rect"; start: Point }
  | { kind: "haus-raum"; id: string; last: Point }
  | { kind: "opening"; kante: number; start: Point }
  | { kind: "opening-end"; index: number; ende: "von" | "bis" }
  | { kind: "opening-move"; index: number; start: number; von: number; bis: number }
  | { kind: "rotate-zone"; center: Point; start: number; anchor: Form };

const TOOLS: { tool: Tool; icon: string; label: string }[] = [
  { tool: "auswahl", icon: "mdi:cursor-default-outline", label: "Auswählen und verschieben" },
  { tool: "rechteck", icon: "mdi:rectangle-outline", label: "Rechteck zeichnen" },
  { tool: "vieleck", icon: "mdi:vector-polygon", label: "Vieleck zeichnen" },
  { tool: "zellen", icon: "mdi:grid", label: "Zellen malen" },
  { tool: "umriss", icon: "mdi:wall", label: "Wände zeichnen" },
  { tool: "oeffnung", icon: "mdi:door", label: "Tür oder Öffnung in eine Wand" },
];

const BUBBLE: Partial<Record<Tool, string>> = {
  rechteck: "Von Ecke zu Ecke ziehen.",
  vieleck: "Ecken nacheinander anklicken. Ein Klick auf die erste Ecke schließt die Zone.",
  zellen: "Zellen malen. Wer auf einer bemalten Zelle beginnt, radiert.",
  umriss: "Ecken des Raums anklicken. Ein Klick auf die erste Ecke schließt die Wände.",
  oeffnung: "An einer Wand entlang ziehen, so breit wie die Tür oder Öffnung.",
};

/** Einstellung im Browser (nur Bequemlichkeit; ohne Speicher: Standard). */
function lesen(key: string, standard: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? standard : v === "1";
  } catch {
    return standard;
  }
}

function merken(key: string, v: boolean): void {
  try {
    localStorage.setItem(key, v ? "1" : "0");
  } catch {
    // Speicher im Browser nicht verfügbar.
  }
}

function wallLength(umriss: Point[], kante: number): number {
  const a = umriss[kante];
  const b = umriss[(kante + 1) % umriss.length];
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function meter(cm: number): string {
  return (cm / 100).toFixed(2).replace(".", ",");
}

function roleColor(rolle: Rolle): string {
  return `var(--rz-${rolle})`;
}

function pointsAttr(points: Point[]): string {
  return points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

function niceLength(cm: number): number {
  for (const step of [10, 20, 50, 100, 200, 500, 1000, 2000]) if (step >= cm) return step;
  return 5000;
}

@customElement("raumzonen-panel")
export class RaumzonenPanel extends LitElement {
  static styles = styles;

  @property({ type: Boolean, reflect: true }) narrow = false;

  @state() private data?: RoomsResult;
  @state() private raumId = "";
  @state() private zones: Zone[] = [];
  @state() private sensor: SensorLage = { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 };
  @state() private umriss: Point[] = [];
  @state() private oeffnungen: Oeffnung[] = [];
  /** Gewählter Punkt der gewählten Zone (Vieleck), sonst -1. */
  @state() private selVertex = -1;
  /** Gewählte Öffnung in der Wand, sonst -1. */
  @state() private selOpening = -1;
  @state() private openingDraft: Oeffnung | null = null;
  @state() private selected = -1;
  @state() private sensorOpen = false;
  @state() private tab: Tab = "zonen";
  @state() private tool: Tool = "auswahl";
  @state() private draft: Point[] = [];
  @state() private rectDraft: [Point, Point] | null = null;
  @state() private hover: Point | null = null;
  @state() private view = { cx: 0, cy: 250, scale: 0.8 };
  @state() private size = { w: 800, h: 600 };
  @state() private live?: Live;
  @state() private heat?: Heat;
  @state() private heatMin = 0;
  @state() private ausw?: Auswertung;
  @state() private auswStunden = 8;
  @state() private auswLaedt = false;
  @state() private auswFehler = "";
  @state() private kandidaten?: Kandidaten;
  @state() private wiz: Wizard | null = null;
  /** Grundriss übernehmen (null = zu). */
  @state() private plan: {
    bild: string;
    g: Grundriss;
    zuordnung: string[];
    art: Record<number, "tuer" | "offen" | "fenster">;
    massRaum: number;
    massSeite: "breite" | "tiefe";
    massM: number;
    /** Bild zum Speichern (JPEG, Base64) und seine Größe. */
    jpeg: string;
    name: string;
    /** Maß als Strecke im Bild: zwei angetippte Punkte (Bildpunkte). */
    strecke: Point[];
    streckeM: number;
  } | null = null;
  @state() private planLaedt = false;
  /** Bilder der Grundrisse (Plan-ID → Objekt-URL). */
  @state() private planBilder: Record<string, string> = {};
  @state() private zeigePlan = lesen("raumzonen-zeige-plan", true);
  @state() private masse = lesen("raumzonen-masse", false);
  /** Formular „Raum hinzufügen“ (null = zu). */
  @state() private neuRaum: { name: string; art: "melder" | "radar"; melder: string[]; device_id: string; bereich_id: string } | null = null;
  /** Bewegungsprofil im Hausplan: Raum-ID → Zeitabschnitte mit jemandem darin. */
  @state() private profil?: { von: number; bis: number; raeume: Record<string, [number, number][]> };
  @state() private profilStunden = 0;
  @state() private profilLaedt = false;
  /** Gewählte Figur der Auswertung ("" = alle). */
  @state() private auswFigur = "";
  @state() private layersOpen = false;
  @state() private layers = { figuren: true, spuren: true, ziele: false, abdeckung: true };
  @state() private dirty = false;
  // Zonen wandern beim Verschieben/Drehen des Sensors mit (praktisch, solange
  // man den Sensor noch ausrichtet und die Zonen aus dem Konverter kommen).
  @state() private zonesFollow = true;
  @state() private saving = false;
  @state() private error = "";
  @state() private toast = "";
  @state() private page: Page = "raum";
  @state() private lagen: Record<string, HausLage> = {};
  /** "<raum_id>/<zone_id>" → wohin die Tür führt ("" = weiß nicht). */
  @state() private tueren: Record<string, string> = {};
  @state() private hausLive: Record<string, Live> = {};
  @state() private hausSel = "";
  @state() private aufnahme = true;
  /** Nur Melder-Räume: Melder und Nachlauf (bearbeitbar). */
  @state() private melder: string[] = [];
  @state() private nachlauf = 0;
  @state() private aufnahmeTage = 30;

  private _hass?: Hass;
  private history = new History<Snapshot>();
  private drag: Drag | null = null;
  private unsubLive?: () => Promise<void>;
  private liveRoom = "";
  private heatTimer?: number;
  private wizTimer?: number;
  private auswTimer?: number;
  private heatBildCache?: { key: string; href: string; x0: number; y0: number; w: number; h: number };
  private toastTimer?: number;
  private resize?: ResizeObserver;
  private viewTouched = false;
  private sensorAnchor: { sensor: SensorLage; zones: Zone[] } | null = null;
  private hausUnsubs: (() => Promise<void>)[] = [];

  set hass(hass: Hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) void this.load();
  }

  get hass(): Hass | undefined {
    return this._hass;
  }

  // -- Laden, Live, Speichern ------------------------------------------

  private async load(): Promise<void> {
    if (!this._hass) return;
    try {
      const data = await this._hass.callWS<RoomsResult>({ type: `${DOMAIN}/rooms/get` });
      this.data = data;
      void this.ladePlanBilder();
      this.error = "";
      const keep = data.raeume.some((r) => r.id === this.raumId);
      if (this.page === "haus" && data.raeume.length) {
        this.raumId = keep ? this.raumId : data.raeume[0].id;
        this.openHaus(true);
      } else {
        this.selectRoom(keep ? this.raumId : data.raeume[0]?.id ?? "", true);
      }
    } catch (err) {
      this.error = `Laden fehlgeschlagen: ${fehlerText(err)}`;
    }
  }

  /** Nur Admins dürfen ändern; alle anderen sehen nur zu. */
  private get kannAendern(): boolean {
    return this.data?.darf_aendern !== false;
  }

  private get istMelder(): boolean {
    return this.raum?.art === "melder";
  }

  private get raum(): Raum | undefined {
    return this.data?.raeume.find((r) => r.id === this.raumId);
  }

  private selectRoom(id: string, force = false): void {
    if (!force && id === this.raumId && this.page === "raum") return;
    if (!force && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const changed = id !== this.raumId || this.page !== "raum";
    if (this.page === "haus") void this.unsubscribeHaus();
    this.page = "raum";
    this.raumId = id;
    const raum = this.raum;
    this.zones = raum ? structuredClone(raum.zonen) : [];
    this.umriss = raum ? structuredClone(raum.umriss) : [];
    this.oeffnungen = raum ? structuredClone(raum.oeffnungen ?? []) : [];
    this.selOpening = -1;
    this.selVertex = -1;
    if (raum) {
      const s = raum.sensor;
      this.sensor = { x: s.x, y: s.y, winkel: s.winkel, reichweite_cm: s.reichweite_cm, oeffnung_grad: s.oeffnung_grad };
      this.aufnahme = raum.aufnahme ?? true;
      this.aufnahmeTage = raum.aufnahme_tage ?? 30;
      this.melder = [...(raum.melder ?? [])];
      this.nachlauf = raum.melder_nachlauf_s ?? 0;
      if (changed) {
        window.clearInterval(this.wizTimer);
        this.wizLaden();
      }
      if (raum.art === "melder") {
        if (this.tab === "zonen") this.tab = "raum";
        if (!this.kandidaten) void this.loadKandidaten();
      }
    }
    this.selected = -1;
    this.sensorOpen = false;
    this.draft = [];
    this.tool = "auswahl";
    this.dirty = false;
    this.history.clear();
    if (changed) {
      this.viewTouched = false;
      this.fit();
    }
    void this.subscribeLive();
    void this.loadHeat();
    if (changed) {
      this.ausw = undefined;
      this.auswFigur = "";
      if (this.tab === "auswertung") void this.loadAuswertung();
    }
  }

  private async subscribeLive(): Promise<void> {
    if (!this._hass || this.liveRoom === this.raumId) return;
    await this.unsubscribeLive();
    if (!this.raumId) return;
    this.liveRoom = this.raumId;
    try {
      this.unsubLive = await this._hass.connection.subscribeMessage<Live>((msg) => {
        if (msg.raum_id === this.raumId) this.live = msg;
      }, { type: `${DOMAIN}/live/subscribe`, raum_id: this.raumId });
    } catch {
      this.liveRoom = "";
      this.live = undefined;
    }
  }

  private async unsubscribeLive(): Promise<void> {
    const unsub = this.unsubLive;
    this.unsubLive = undefined;
    this.liveRoom = "";
    if (unsub) {
      try {
        await unsub();
      } catch {
        // Verbindung schon zu (z. B. nach dem Neuladen der Integration).
      }
    }
  }

  private openTab(tab: Tab): void {
    this.tab = tab;
    window.clearInterval(this.auswTimer);
    if (tab !== "auswertung") return;
    void this.loadAuswertung();
    // Solange die Auswertung offen ist, jede Minute nachziehen.
    this.auswTimer = window.setInterval(() => void this.loadAuswertung(), 60_000);
  }

  private async loadAuswertung(): Promise<void> {
    if (!this._hass || !this.raumId || !this.kannAendern) return;
    const raumId = this.raumId;
    const stunden = this.auswStunden;
    this.auswLaedt = true;
    try {
      const result = await this._hass.callWS<Auswertung>({ type: `${DOMAIN}/auswertung/get`, raum_id: raumId, stunden });
      if (raumId !== this.raumId || stunden !== this.auswStunden) return;
      this.ausw = result;
      this.auswFehler = "";
      if (this.auswFigur && !result.figuren.some((f) => f.figur === this.auswFigur)) this.auswFigur = "";
    } catch (err) {
      if (raumId !== this.raumId) return;
      const e = err as { code?: string; message?: string };
      this.ausw = undefined;
      this.auswFehler = e.code === "off" ? "off" : `Auswertung fehlgeschlagen: ${fehlerText(err)}`;
    } finally {
      this.auswLaedt = false;
    }
  }

  private async loadHeat(): Promise<void> {
    window.clearInterval(this.heatTimer);
    this.heat = undefined;
    if (!this._hass || !this.heatMin || !this.raumId) return;
    const fetchHeat = async () => {
      try {
        this.heat = await this._hass!.callWS<Heat>({ type: `${DOMAIN}/heat/get`, raum_id: this.raumId, minuten: this.heatMin });
      } catch {
        this.heat = undefined;
      }
    };
    await fetchHeat();
    this.heatTimer = window.setInterval(fetchHeat, 30_000);
  }

  private async save(): Promise<void> {
    if (!this._hass || !this.raum || !this.kannAendern) return;
    const melder = this.istMelder;
    const problem = melder ? (this.melder.length ? "" : "Mindestens einen Melder wählen.") : zonesProblem(this.zones);
    if (problem) {
      this.showToast(problem);
      return;
    }
    this.saving = true;
    this.error = "";
    try {
      await this._hass.callWS({
        type: `${DOMAIN}/room/save`,
        raum_id: this.raumId,
        zonen: melder ? [] : this.zones,
        ...(melder ? { melder: this.melder, melder_nachlauf_s: this.nachlauf } : { sensor: this.sensor }),
        umriss: this.umriss,
        oeffnungen: clampOpenings(this.umriss, this.oeffnungen),
        aufnahme: this.aufnahme,
        aufnahme_tage: this.aufnahmeTage,
      });
      this.dirty = false;
      this.showToast("Gespeichert.");
      // Die Integration lädt neu; danach Daten und Live-Ansicht neu holen.
      await this.unsubscribeLive();
      await new Promise((r) => window.setTimeout(r, 1500));
      await this.load();
    } catch (err) {
      this.showToast(`Nicht gespeichert: ${fehlerText(err)}`);
    } finally {
      this.saving = false;
    }
  }

  private discard(): void {
    if (this.page === "haus") {
      this.openHaus(true);
      return;
    }
    this.selectRoom(this.raumId, true);
  }

  private async importConverter(): Promise<void> {
    if (!this._hass || !this.data) return;
    try {
      const result = await this._hass.callWS<{ zonen: { name: string; form: Form }[] }>({
        type: `${DOMAIN}/converter_zones/get`,
        raum_id: this.raumId,
      });
      if (!result.zonen.length) {
        this.showToast("Im Konverter sind keine Software-Zonen eingerichtet.");
        return;
      }
      this.remember();
      const zones = this.zones.slice();
      for (const cz of result.zonen) zones.push(zoneFromConverter(cz, zones, this.data.vorlagen));
      this.zones = zones;
      this.dirty = true;
      this.showToast(`${result.zonen.length} Zonen übernommen. Rollen prüfen und speichern.`);
    } catch (err) {
      this.showToast(`Konverter-Zonen nicht lesbar: ${fehlerText(err)}`);
    }
  }

  // -- Hausplan -------------------------------------------------------------

  private outlineOf(raum: Raum): Point[] {
    if (raum.art === "melder" && raum.umriss.length < 3) {
      // Noch ohne Wände: ein Platzhalter von 3 × 3 m, damit man ihn sieht.
      return [
        [0, 0],
        [300, 0],
        [300, 300],
        [0, 300],
      ];
    }
    return roomOutline(
      raum.umriss,
      raum.zonen.map((z) => z.form),
      [raum.sensor.x, raum.sensor.y],
    );
  }

  private openHaus(force = false): void {
    if (!this.data) return;
    if (!force && this.page === "haus") return;
    if (!force && this.dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const raeume = this.data.raeume;
    this.lagen = defaultLagen(
      raeume.map((r) => ({
        id: r.id,
        outline: this.outlineOf(r),
        lage: r.haus_gesetzt ? { x: r.haus_x, y: r.haus_y, winkel: r.haus_winkel } : null,
      })),
    );
    const tueren: Record<string, string> = {};
    for (const r of raeume) for (const t of tuerenVon(r)) tueren[t.key] = t.ziel;
    this.tueren = tueren;
    const wasHaus = this.page === "haus";
    this.page = "haus";
    this.hausSel = "";
    this.tool = "auswahl";
    this.dirty = false;
    void this.unsubscribeLive();
    void this.subscribeHaus();
    if (!wasHaus) {
      this.viewTouched = false;
      this.fit();
    }
  }

  private async subscribeHaus(): Promise<void> {
    await this.unsubscribeHaus();
    if (!this._hass || !this.data) return;
    for (const r of this.data.raeume) {
      try {
        const unsub = await this._hass.connection.subscribeMessage<Live>((msg) => {
          this.hausLive = { ...this.hausLive, [msg.raum_id]: msg };
        }, { type: `${DOMAIN}/live/subscribe`, raum_id: r.id });
        this.hausUnsubs.push(unsub);
      } catch {
        // Raum gerade nicht da (z. B. beim Neuladen); kommt beim nächsten Laden.
      }
    }
  }

  private async unsubscribeHaus(): Promise<void> {
    const unsubs = this.hausUnsubs;
    this.hausUnsubs = [];
    this.hausLive = {};
    for (const unsub of unsubs) {
      try {
        await unsub();
      } catch {
        // Verbindung schon zu.
      }
    }
  }

  private turnRoom(id: string, deg: number): void {
    const lage = this.lagen[id];
    if (!lage) return;
    let winkel = (((lage.winkel + deg) % 360) + 540) % 360 - 180;
    if (winkel === -180) winkel = 180;
    this.lagen = { ...this.lagen, [id]: { ...lage, winkel } };
    this.dirty = true;
  }

  // -- Assistent: Sensor umsetzen oder einmessen ----------------------------

  private wizKey(): string {
    return `raumzonen-assistent-${this.raumId}`;
  }

  /** Stellen „vorher“ überleben das Neuladen der Seite (das Umhängen dauert). */
  private wizSpeichern(): void {
    try {
      if (this.wiz && this.wiz.modus === "umsetzen" && this.wiz.schritt !== "ergebnis") localStorage.setItem(this.wizKey(), JSON.stringify({ ...this.wiz, messung: undefined }));
      else localStorage.removeItem(this.wizKey());
    } catch {
      // Speicher im Browser nicht verfügbar: dann eben nur bis zum Neuladen.
    }
  }

  private wizLaden(): void {
    try {
      const t = localStorage.getItem(this.wizKey());
      this.wiz = t ? (JSON.parse(t) as Wizard) : null;
    } catch {
      this.wiz = null;
    }
  }

  private wizStart(modus: Wizard["modus"]): void {
    window.clearInterval(this.wizTimer);
    this.wiz = { modus, schritt: modus === "umsetzen" ? "vorher" : "nachher", raum: [null, null, null], sensor: [null, null, null], aktiv: 0 };
    this.wizSpeichern();
  }

  private wizEnde(): void {
    window.clearInterval(this.wizTimer);
    this.wiz = null;
    this.wizSpeichern();
  }

  /** Genau eine Person sichtbar? Dann ihre Lage im Raum (wie gemeldet). */
  private wizPerson(): { punkt: Point | null; hinweis: string } {
    const live = this.live;
    if (!live || !live.verfuegbar || live.problem) return { punkt: null, hinweis: "Sensor nicht erreichbar." };
    const f = live.figuren.filter((x) => !x.gehalten && !x.tags.some((t) => ["wiederhergestellt", "stoerung", "hund", "echo"].includes(t)));
    if (f.length === 0) return { punkt: null, hinweis: "Der Sensor sieht gerade niemanden." };
    if (f.length > 1) return { punkt: null, hinweis: "Der Sensor sieht mehr als eine Person. Bitte allein im Raum sein." };
    return { punkt: [f[0].x, f[0].y], hinweis: "" };
  }

  private wizMessen(): void {
    const w = this.wiz;
    if (!w) return;
    window.clearInterval(this.wizTimer);
    this.wiz = { ...w, fehler: undefined, messung: { bis: Date.now() + MESS_S * 1000, punkte: [], hinweis: "" } };
    // Alle 250 ms den Stand nehmen: in Ruhe meldet der Sensor kaum Rahmen.
    this.wizTimer = window.setInterval(() => {
      const cur = this.wiz;
      if (!cur?.messung) return;
      const { punkt, hinweis } = this.wizPerson();
      const punkte = punkt ? [...cur.messung.punkte, punkt] : cur.messung.punkte;
      if (Date.now() < cur.messung.bis) {
        this.wiz = { ...cur, messung: { ...cur.messung, punkte, hinweis } };
        return;
      }
      window.clearInterval(this.wizTimer);
      const st = stelle(punkte);
      if (!st || punkte.length < 8) {
        this.wiz = { ...cur, messung: undefined, fehler: hinweis || "Zu wenig gesehen. Noch einmal versuchen." };
        return;
      }
      if (st.streuung_cm > MAX_STREUUNG_CM) {
        this.wiz = { ...cur, messung: undefined, fehler: `Zu unruhig (Punkte streuen ${Math.round(st.streuung_cm)} cm). Bitte ruhig stehen und noch einmal.` };
        return;
      }
      this.wizGemessen(st.punkt);
    }, 250);
  }

  /** Eine Stelle ist gemessen (Raumkoordinaten mit der gespeicherten Lage). */
  private wizGemessen(punkt: Point): void {
    const w = this.wiz;
    const gespeichert = this.raum?.sensor;
    if (!w || !gespeichert) return;
    const i = w.aktiv;
    if (w.schritt === "vorher") {
      const raum = w.raum.map((p, k) => (k === i ? punkt : p));
      const fertig = raum.every(Boolean);
      const problem = fertig ? stellenProblem(raum as Point[]) : "";
      this.wiz = { ...w, raum, messung: undefined, aktiv: fertig ? 0 : i + 1, schritt: fertig && !problem ? "umhaengen" : "vorher", fehler: problem || undefined };
      if (problem) this.wiz = { ...this.wiz, raum: [null, null, null], aktiv: 0 };
    } else {
      // Was der Sensor jetzt sieht, in seinen eigenen Koordinaten.
      const sensor = w.sensor.map((p, k) => (k === i ? roomToSensor(punkt, gespeichert) : p));
      this.wiz = { ...w, sensor, messung: undefined, tippen: w.modus === "einmessen" };
      if (w.modus === "umsetzen") this.wizWeiter();
    }
    this.wizSpeichern();
  }

  /** Einmessen: die Stelle im Plan angetippt. */
  private wizAngetippt(p: Point): void {
    const w = this.wiz;
    if (!w) return;
    const raum = w.raum.map((q, k) => (k === w.aktiv ? p : q));
    this.wiz = { ...w, raum, tippen: false };
    this.wizWeiter();
  }

  private wizWeiter(): void {
    const w = this.wiz;
    if (!w) return;
    const i = w.aktiv;
    if (i < 2) {
      this.wiz = { ...w, aktiv: i + 1 };
      return;
    }
    const raum = w.raum as Point[];
    const problem = stellenProblem(raum);
    const e = einmessen(w.sensor as Point[], raum);
    if (!e || problem) {
      this.wiz = { ...w, schritt: "nachher", aktiv: 0, sensor: [null, null, null], raum: w.modus === "einmessen" ? [null, null, null] : w.raum, fehler: problem || "Konnte nicht rechnen. Noch einmal." };
      return;
    }
    this.wiz = { ...w, schritt: "ergebnis", ergebnis: e };
    this.wizSpeichern();
  }

  /** Neue Lage übernehmen. Zonen bleiben, wo sie im Raum sind. */
  private wizUebernehmen(): void {
    const e = this.wiz?.ergebnis;
    if (!e) return;
    this.remember();
    this.sensor = { ...this.sensor, x: e.x, y: e.y, winkel: e.winkel };
    this.dirty = true;
    this.wizEnde();
    this.showToast("Neue Lage eingetragen. Zum Behalten oben „Speichern“ tippen.");
  }

  // -- Grundriss übernehmen -------------------------------------------------

  private async planLaden(file: File): Promise<void> {
    this.planLaedt = true;
    try {
      let blob: Blob = file;
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const jpg = jpegAusPdf(new Uint8Array(await file.arrayBuffer()));
        if (!jpg) throw new Error("Im PDF ist kein Bild des Grundrisses.");
        blob = new Blob([jpg.slice()], { type: "image/jpeg" });
      }
      const bmp = await createImageBitmap(blob);
      // Sehr große Bilder verkleinern (schont schwache Geräte).
      const f = Math.min(1, 4000 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bmp.width * f);
      canvas.height = Math.round(bmp.height * f);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const px = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const g = erkenneGrundriss({ width: px.width, height: px.height, data: px.data });
      const art: Record<number, "tuer" | "offen" | "fenster"> = {};
      g.luecken.forEach((l, i) => (art[i] = l.partner !== null ? "tuer" : "fenster"));
      const jpeg = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
      const name = file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "Grundriss";
      this.plan = { bild: URL.createObjectURL(blob), g, zuordnung: g.raeume.map(() => ""), art, massRaum: 0, massSeite: "breite", massM: 0, jpeg, name, strecke: [], streckeM: 0 };
    } catch (err) {
      this.showToast(`Grundriss nicht gelesen: ${fehlerText(err)}`);
    } finally {
      this.planLaedt = false;
    }
  }

  private planZu(): void {
    if (this.plan) URL.revokeObjectURL(this.plan.bild);
    this.plan = null;
  }

  /** Zentimeter je Bildpunkt aus dem eingegebenen Maß (0 = noch keins). */
  private planCmProPx(): number {
    const p = this.plan;
    if (p && p.strecke.length === 2 && p.streckeM > 0) {
      const d = Math.hypot(p.strecke[1][0] - p.strecke[0][0], p.strecke[1][1] - p.strecke[0][1]);
      return d > 0 ? (p.streckeM * 100) / d : 0;
    }
    if (!p || !(p.massM > 0) || !p.g.raeume[p.massRaum]) return 0;
    const b = bbox(p.g.raeume[p.massRaum].punkte);
    const px = p.massSeite === "breite" ? b.x1 - b.x0 : b.y1 - b.y0;
    return px > 0 ? (p.massM * 100) / px : 0;
  }

  private async planUebernehmen(): Promise<void> {
    const p = this.plan;
    const k = this.planCmProPx();
    if (!p || !k || !this._hass || !this.data) return;
    const raeume = this.data.raeume;
    const eintraege = p.g.raeume
      .map((_, i) => i)
      .filter((i) => p.zuordnung[i])
      .map((i) => {
        const raum = raeume.find((r) => r.id === p.zuordnung[i])!;
        // Vorhandene Wände/Zonen: neuen Umriss an dieselbe Stelle im Raum legen.
        const alt: Point[] = raum.umriss.length >= 3 ? raum.umriss : raum.zonen.length ? [...raum.zonen.flatMap((z) => formPoints(z.form)), [raum.sensor.x, raum.sensor.y]] : [];
        const roh = uebernehmen(p.g, i, k);
        let v: Point = [0, 0];
        if (alt.length) {
          const a = bbox(alt);
          const n = bbox(roh.umriss);
          v = [Math.round((a.x0 + a.x1 - n.x0 - n.x1) / 2), Math.round((a.y0 + a.y1 - n.y0 - n.y1) / 2)];
        }
        return { i, raum, u: uebernehmen(p.g, i, k, v) };
      });
    // Nicht über Räume legen, die schon im Haus liegen und nicht dabei sind.
    const andere = raeume.filter((r) => r.haus_gesetzt && !eintraege.some((e) => e.raum.id === r.id));
    const huelle = (pts: Point[]) => bbox(pts);
    let dx = 0;
    if (andere.length) {
      const a = huelle(andere.flatMap((r) => this.outlineOf(r).map((q) => toHouse(q, { x: r.haus_x, y: r.haus_y, winkel: r.haus_winkel }))));
      const n = eintraege.length
        ? huelle(eintraege.flatMap((e) => e.u.umriss.map((q) => toHouse(q, e.u.haus))))
        : { x0: 0, y0: 0, x1: p.g.breite * k, y1: p.g.hoehe * k };
      const ueber = n.x0 < a.x1 && n.x1 > a.x0 && n.y0 < a.y1 && n.y1 > a.y0;
      if (ueber) dx = a.x1 + 200 - n.x0;
    }
    const msg = eintraege.map(({ i, raum, u }) => ({
      raum_id: raum.id,
      umriss: u.umriss,
      haus: { x: u.haus.x + dx, y: u.haus.y, winkel: 0 },
      oeffnungen: u.luecken
        .filter((l) => p.art[l.luecke] !== "fenster")
        .map((l) => {
          const partner = p.g.luecken[l.luecke].partner;
          const ziel = partner !== null ? p.zuordnung[partner] || "" : "aussen";
          return { kante: l.kante, von: l.von, bis: l.bis, art: p.art[l.luecke] === "offen" ? "offen" : "tuer", fuehrt_zu: ziel === raum.id ? "" : ziel };
        }),
    }));
    this.saving = true;
    try {
      await this._hass.callWS({
        type: `${DOMAIN}/plan/import`,
        raeume: msg,
        plan: { name: p.name, mime: "image/jpeg", bild: p.jpeg, cm_pro_px: k, breite_px: p.g.breite, hoehe_px: p.g.hoehe, x: dx, y: 0 },
      });
      this.planZu();
      this.showToast(msg.length ? `${msg.length} ${msg.length === 1 ? "Raum" : "Räume"} und der Grundriss übernommen.` : "Grundriss als Hintergrund übernommen.");
      await this.unsubscribeHaus();
      await new Promise((res) => window.setTimeout(res, 1500));
      await this.load();
      this.viewTouched = false;
      this.fit();
    } catch (err) {
      this.showToast(`Nicht übernommen: ${fehlerText(err)}`);
    } finally {
      this.saving = false;
    }
  }

  private async loadKandidaten(): Promise<void> {
    if (!this._hass || !this.kannAendern) return;
    try {
      this.kandidaten = await this._hass.callWS<Kandidaten>({ type: `${DOMAIN}/kandidaten/get` });
    } catch (err) {
      this.showToast(`Geräte nicht geladen: ${fehlerText(err)}`);
    }
  }

  private bereichName(id: string | null | undefined): string {
    return (id && this.kandidaten?.bereiche.find((b) => b.bereich_id === id)?.name) || "ohne Bereich";
  }

  private async createRoom(daten: { name: string; art: "melder" | "radar"; melder?: string[]; device_id?: string; bereich_id?: string }): Promise<void> {
    if (!this._hass || !this.kannAendern) return;
    if (this.dirty) {
      this.showToast("Erst den Hausplan speichern oder verwerfen.");
      return;
    }
    this.saving = true;
    try {
      const msg: Record<string, unknown> = { type: `${DOMAIN}/room/create`, name: daten.name.trim(), art: daten.art };
      if (daten.bereich_id) msg.bereich_id = daten.bereich_id;
      if (daten.art === "melder") msg.melder = daten.melder ?? [];
      else msg.device_id = daten.device_id;
      await this._hass.callWS(msg);
      this.neuRaum = null;
      this.showToast(`Raum „${daten.name.trim()}“ angelegt. Jetzt im Plan an seinen Platz ziehen.`);
      await this.unsubscribeHaus();
      await new Promise((res) => window.setTimeout(res, 1500));
      await this.load();
      this.viewTouched = false;
      this.fit();
      await this.loadKandidaten();
    } catch (err) {
      this.showToast(`Nicht angelegt: ${fehlerText(err)}`);
    } finally {
      this.saving = false;
    }
  }

  private async deleteRoom(): Promise<void> {
    const raum = this.raum;
    if (!this._hass || !raum || !this.kannAendern) return;
    if (!confirm(`Raum „${raum.name}“ mit allen Zonen und seinen Anzeigen in Home Assistant löschen? Automationen, die sie benutzen, gehen dann nicht mehr.`)) return;
    this.saving = true;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/room/delete`, raum_id: raum.id });
      this.dirty = false;
      this.showToast(`Raum „${raum.name}“ gelöscht.`);
      await this.unsubscribeLive();
      await new Promise((res) => window.setTimeout(res, 1500));
      this.page = "haus";
      await this.load();
    } catch (err) {
      this.showToast(`Nicht gelöscht: ${fehlerText(err)}`);
    } finally {
      this.saving = false;
    }
  }

  /** Bewegungsprofil: für jeden Raum, wann dort jemand war (aus den Aufnahmen). */
  private async loadProfil(stunden: number): Promise<void> {
    this.profilStunden = stunden;
    if (!stunden || !this._hass || !this.data || !this.kannAendern) {
      this.profil = undefined;
      return;
    }
    this.profilLaedt = true;
    const raeume: Record<string, [number, number][]> = {};
    let von = 0;
    let bis = 0;
    await Promise.all(
      this.data.raeume.map(async (r) => {
        try {
          const a = await this._hass!.callWS<Auswertung>({ type: `${DOMAIN}/auswertung/get`, raum_id: r.id, stunden });
          raeume[r.id] = vereinigen(a.figuren.filter((f) => !f.hund).map((f) => f.abschnitte));
          von = a.von;
          bis = a.bis;
        } catch {
          // Aufnahme aus oder Raum gerade nicht da: Zeile bleibt leer.
        }
      }),
    );
    if (stunden !== this.profilStunden) return;
    this.profil = von ? { von, bis, raeume } : undefined;
    this.profilLaedt = false;
  }

  private async saveHaus(): Promise<void> {
    if (!this._hass || !this.data || !this.kannAendern) return;
    this.saving = true;
    try {
      const alle = new Map(this.data.raeume.flatMap((r) => tuerenVon(r)).map((t) => [t.key, t]));
      const tueren = Object.entries(this.tueren)
        .filter(([key, ziel]) => alle.has(key) && alle.get(key)!.ziel !== ziel)
        .map(([key, ziel]) => {
          const t = alle.get(key)!;
          return t.oeffnung !== undefined
            ? { raum_id: t.raumId, oeffnung: t.oeffnung, fuehrt_zu: ziel || null }
            : { raum_id: t.raumId, zone_id: t.zoneId, fuehrt_zu: ziel || null };
        });
      await this._hass.callWS({
        type: `${DOMAIN}/haus/save`,
        raeume: Object.entries(this.lagen).map(([raum_id, l]) => ({ raum_id, x: Math.round(l.x), y: Math.round(l.y), winkel: l.winkel })),
        tueren,
      });
      this.dirty = false;
      this.showToast("Hausplan gespeichert.");
      await this.unsubscribeHaus();
      await new Promise((res) => window.setTimeout(res, 1500));
      await this.load();
    } catch (err) {
      this.showToast(`Nicht gespeichert: ${fehlerText(err)}`);
    } finally {
      this.saving = false;
    }
  }

  private showToast(text: string): void {
    this.toast = text;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toast = ""), 4000);
  }

  // -- Lebenszyklus --------------------------------------------------------

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.onKey);
    if (this._hass && this.page === "haus") void this.subscribeHaus();
    else if (this._hass && this.raumId) void this.subscribeLive();
    if (this._hass && this.tab === "auswertung") this.openTab("auswertung");
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.onKey);
    window.clearInterval(this.heatTimer);
    window.clearInterval(this.auswTimer);
    window.clearInterval(this.wizTimer);
    this.resize?.disconnect();
    this.resize = undefined;
    void this.unsubscribeLive();
    void this.unsubscribeHaus();
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const stage = this.renderRoot.querySelector(".stage");
    if (stage && !this.resize) {
      this.resize = new ResizeObserver((entries) => {
        const box = entries[0].contentRect;
        if (!box.width || !box.height) return;
        if (box.width === this.size.w && box.height === this.size.h) return;
        this.size = { w: box.width, h: box.height };
        if (!this.viewTouched) this.fit();
      });
      this.resize.observe(stage);
    }
  }

  // -- Umrechnung Bildschirm ↔ Raum ----------------------------------------

  private toScreen([x, y]: Point): Point {
    const { cx, cy, scale } = this.view;
    return [this.size.w / 2 + (x - cx) * scale, this.size.h / 2 - (y - cy) * scale];
  }

  private screenPoints(points: Point[]): string {
    return pointsAttr(points.map((p) => this.toScreen(p)));
  }

  private toWorld(event: { clientX: number; clientY: number }): Point {
    const svgEl = this.renderRoot.querySelector("svg.plan") as SVGSVGElement | null;
    const box = svgEl?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const { cx, cy, scale } = this.view;
    return [cx + (event.clientX - box.left - this.size.w / 2) / scale, cy - (event.clientY - box.top - this.size.h / 2) / scale];
  }

  private snapped(p: Point): Point {
    return snap(p, SNAP_CM);
  }

  private px(cm: number): number {
    return cm * this.view.scale;
  }

  private fit = (): void => {
    const s = this.sensor;
    const pts: Point[] = [[s.x, s.y]];
    if (this.page === "haus" && this.data) {
      pts.length = 0;
      for (const r of this.data.raeume) {
        const lage = this.lagen[r.id];
        if (lage) pts.push(...this.outlineOf(r).map((p) => toHouse(p, lage)));
      }
    }
    for (const z of this.zones) pts.push(...formPoints(z.form));
    pts.push(...this.umriss);
    if (pts.length < 4 && this.page === "raum") pts.push(...sectorPoints([s.x, s.y], s.winkel, Math.min(s.reichweite_cm, 500), s.oeffnung_grad, 8));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const [x1, x2, y1, y2] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const w = Math.max(200, x2 - x1);
    const h = Math.max(200, y2 - y1);
    const scale = Math.min(this.size.w / (w * 1.2), this.size.h / (h * 1.2));
    this.view = { cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, scale: Math.max(0.05, Math.min(5, scale)) };
  };

  private zoom(factor: number, around?: Point): void {
    this.viewTouched = true;
    const { cx, cy, scale } = this.view;
    const next = Math.max(0.05, Math.min(8, scale * factor));
    if (!around) {
      this.view = { cx, cy, scale: next };
      return;
    }
    const k = scale / next;
    this.view = { cx: around[0] - (around[0] - cx) * k, cy: around[1] - (around[1] - cy) * k, scale: next };
  }

  // -- Bearbeiten ------------------------------------------------------------

  private remember(): void {
    this.history.push({ zones: this.zones, sensor: this.sensor, umriss: this.umriss, oeffnungen: this.oeffnungen });
  }

  private undo = (): void => {
    const state = this.history.undo();
    if (!state) return;
    this.zones = state.zones;
    this.sensor = state.sensor;
    this.umriss = state.umriss;
    this.oeffnungen = state.oeffnungen ?? [];
    this.selVertex = -1;
    this.selOpening = -1;
    if (this.selected >= this.zones.length) this.selected = -1;
    this.dirty = true;
  };

  private updateZone(index: number, change: Partial<Zone>): void {
    const zones = this.zones.slice();
    zones[index] = { ...zones[index], ...change };
    this.zones = zones;
    this.dirty = true;
  }

  private updateRegel(index: number, change: Partial<Regel>): void {
    this.remember();
    this.updateZone(index, { regel: { ...this.zones[index].regel, ...change } });
  }

  private setRolle(index: number, rolle: Rolle): void {
    if (!this.data) return;
    this.remember();
    const zones = this.zones.slice();
    zones[index] = applyRolle(zones[index], rolle, this.data.vorlagen);
    this.zones = zones;
    this.dirty = true;
  }

  private addZone(form: Form): void {
    if (!this.data) return;
    this.remember();
    this.zones = [...this.zones, newZone(form, this.zones, this.data.vorlagen)];
    this.select(this.zones.length - 1);
    this.dirty = true;
  }

  private deleteZone(index: number): void {
    if (index < 0) return;
    // Gefährliche Aktion: nachfragen (GUI-Konzept, Abschnitt 6).
    const name = this.zones[index]?.name ?? "Zone";
    if (!confirm(`Zone „${name}“ löschen? Bis zum Speichern lässt sich das mit „Rückgängig“ zurückholen.`)) return;
    this.remember();
    this.zones = this.zones.filter((_, i) => i !== index);
    this.selected = -1;
    this.dirty = true;
  }

  private select(index: number): void {
    if (index !== this.selected) this.selVertex = -1;
    this.selected = index;
    if (index >= 0) this.selOpening = -1;
    if (index >= 0) {
      this.sensorOpen = false;
      this.openTab("zonen");
    }
  }

  private finishDraft = (): void => {
    if (this.draft.length >= 3) {
      if (this.tool === "umriss") {
        this.remember();
        this.umriss = this.draft;
        this.oeffnungen = [];
        this.selOpening = -1;
        this.dirty = true;
      } else {
        const form: Form = { art: "vieleck", punkte: this.draft };
        const problem = formProblem(form);
        if (problem) this.showToast(problem);
        else this.addZone(form);
      }
    }
    this.draft = [];
    this.tool = "auswahl";
  };

  private setTool(tool: Tool): void {
    this.tool = tool;
    this.draft = [];
    this.rectDraft = null;
    this.layersOpen = false;
    if (tool !== "auswahl" && tool !== "zellen") this.selected = -1;
  }

  private onKey = (event: KeyboardEvent): void => {
    const target = event.composedPath()[0] as HTMLElement | undefined;
    if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
    if (!this.kannAendern || this.page === "haus") return;
    if (event.key === "Escape") {
      this.setTool("auswahl");
    } else if (event.key === "Enter" && this.draft.length) {
      this.finishDraft();
    } else if (event.key === "Backspace" && this.draft.length) {
      this.draft = this.draft.slice(0, -1);
    } else if ((event.key === "Delete" || event.key === "Backspace") && this.selOpening >= 0) {
      this.deleteOpening(this.selOpening);
      event.preventDefault();
    } else if ((event.key === "Delete" || event.key === "Backspace") && this.selected >= 0 && this.selVertex >= 0) {
      this.deleteVertex(this.selected, this.selVertex);
      event.preventDefault();
    } else if ((event.key === "Delete" || event.key === "Backspace") && this.selected >= 0) {
      this.deleteZone(this.selected);
      event.preventDefault();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      this.undo();
      event.preventDefault();
    }
  };

  // -- Zeiger ------------------------------------------------------------------

  private sensorHandle(): Point {
    const [dx, dy] = sensorDirection(this.sensor.winkel);
    const len = 46 / this.view.scale;
    return [this.sensor.x + dx * len, this.sensor.y + dy * len];
  }

  private near(a: Point, b: Point, px = HIT_PX): boolean {
    return distance(this.toScreen(a), this.toScreen(b)) <= px;
  }

  private zoneAt(p: Point): number {
    for (let i = this.zones.length - 1; i >= 0; i--) if (inForm(p, this.zones[i].form)) return i;
    return -1;
  }

  private onPointerDown(event: PointerEvent): void {
    if (event.button === 2) return;
    this.layersOpen = false;
    const svgEl = event.currentTarget as SVGSVGElement;
    const raw = this.toWorld(event);
    const p = this.snapped(raw);
    svgEl.setPointerCapture(event.pointerId);

    if (this.wiz?.tippen && this.page === "raum") {
      this.wizAngetippt(p);
      return;
    }
    if (this.page === "haus") {
      const hit = this.hausRoomAt(raw);
      this.hausSel = hit;
      if (hit && this.kannAendern) this.drag = { kind: "haus-raum", id: hit, last: raw };
      else this.drag = { kind: "pan", start: [event.clientX, event.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      return;
    }

    if (!this.kannAendern) {
      // Nur ansehen: Zone antippen zeigt ihre Rolle, sonst Ansicht verschieben.
      const hit = this.zoneAt(raw);
      this.select(hit);
      if (hit < 0) {
        this.sensorOpen = false;
        this.drag = { kind: "pan", start: [event.clientX, event.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
      }
      return;
    }

    if (this.tool === "vieleck" || this.tool === "umriss") {
      if (this.draft.length >= 3 && this.near(raw, this.draft[0])) this.finishDraft();
      else this.draft = [...this.draft, p];
      return;
    }
    if (this.tool === "oeffnung") {
      const kante = this.wallAt(raw, HIT_PX * 2);
      if (kante < 0) {
        this.showToast(this.umriss.length >= 3 ? "Bitte direkt auf einer Wand beginnen." : "Zuerst die Wände zeichnen.");
        return;
      }
      this.drag = { kind: "opening", kante, start: raw };
      this.openingDraft = null;
      return;
    }
    if (this.tool === "rechteck") {
      this.drag = { kind: "rect", start: p };
      this.rectDraft = [p, p];
      return;
    }
    if (this.tool === "zellen") {
      let index = this.selected;
      if (index < 0 || this.zones[index].form.art !== "zellen") {
        this.addZone({ art: "zellen", groesse: CELL_DEFAULT, zellen: [] });
        index = this.zones.length - 1;
      } else {
        this.remember();
      }
      const form = this.zones[index].form as Extract<Form, { art: "zellen" }>;
      const [i, j] = cellOf(raw, form.groesse, form.x0 ?? 0, form.y0 ?? 0);
      const add = !form.zellen.some(([a, b]) => a === i && b === j);
      this.drag = { kind: "paint", add };
      this.updateZone(index, { form: paintCell(form, raw, add) });
      return;
    }

    // Auswählen: Griffe der gewählten Öffnung, dann der Zone, Sensor, Zonen, Wände, Ansicht.
    const so = this.oeffnungen[this.selOpening];
    if (so && this.umriss.length >= 3) {
      const [a, b] = openingPoints(this.umriss, so);
      for (const [ende, q] of [["von", a], ["bis", b]] as const) {
        if (this.near(raw, q, HIT_PX + 4)) {
          this.remember();
          this.drag = { kind: "opening-end", index: this.selOpening, ende };
          return;
        }
      }
    }
    // Die gewählte Öffnung an der Wand entlang verschieben.
    const oi = this.openingAt(raw);
    if (oi >= 0 && oi === this.selOpening) {
      const o = this.oeffnungen[oi];
      this.remember();
      this.drag = { kind: "opening-move", index: oi, start: alongEdge(this.umriss, o.kante, raw), von: o.von, bis: o.bis };
      return;
    }
    const zone = this.zones[this.selected];
    if (zone && zone.form.art !== "zellen" && this.near(raw, this.zoneRotateHandle(zone.form))) {
      this.remember();
      const center = formCenter(zone.form);
      this.drag = { kind: "rotate-zone", center, start: headingTo(center, raw), anchor: zone.form };
      return;
    }
    if (zone?.form.art === "vieleck") {
      const i = zone.form.punkte.findIndex((q) => this.near(raw, q));
      if (i >= 0) {
        this.remember();
        if (event.altKey) {
          this.deleteVertex(this.selected, i);
          return;
        }
        this.selVertex = i;
        this.drag = { kind: "vertex", index: i };
        return;
      }
      const m = edgeMidpoints(zone.form.punkte).findIndex((q) => this.near(raw, q));
      if (m >= 0) {
        // „+“ in der Mitte einer Kante: dort einen Punkt einfügen und gleich ziehen.
        this.remember();
        this.updateZone(this.selected, { form: insertVertex(zone.form, m, this.snapped(edgeMidpoints(zone.form.punkte)[m])) });
        this.selVertex = m + 1;
        this.drag = { kind: "vertex", index: m + 1 };
        return;
      }
    } else if (zone?.form.art === "rechteck") {
      const f = zone.form;
      const i = rectCorners(f.mitte, f.breite, f.tiefe, f.winkel).findIndex((q) => this.near(raw, q));
      if (i >= 0) {
        this.remember();
        this.drag = { kind: "corner", index: i };
        return;
      }
    }
    if (!this.istMelder && this.near(raw, this.sensorHandle(), HIT_PX + 2)) {
      this.remember();
      this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones };
      this.drag = { kind: "sensor-rotate" };
      this.openSensor();
      return;
    }
    if (!this.istMelder && this.near(raw, [this.sensor.x, this.sensor.y], HIT_PX + 4)) {
      this.remember();
      this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones };
      this.drag = { kind: "sensor" };
      this.openSensor();
      return;
    }
    const hit = this.zoneAt(raw);
    if (hit >= 0) {
      this.select(hit);
      this.remember();
      this.drag = { kind: "zone", last: p };
      return;
    }
    const ui = this.umriss.findIndex((q) => this.near(raw, q));
    if (ui >= 0) {
      this.remember();
      this.drag = { kind: "umriss-vertex", index: ui };
      return;
    }
    if (this.umriss.length >= 3) {
      const um = edgeMidpoints(this.umriss).findIndex((q) => this.near(raw, q));
      if (um >= 0) {
        this.remember();
        const umriss = this.umriss.slice();
        umriss.splice(um + 1, 0, this.snapped(edgeMidpoints(this.umriss)[um]));
        this.oeffnungen = shiftOpenings(this.oeffnungen, { inserted: um }, this.umriss.length);
        this.umriss = umriss;
        this.dirty = true;
        this.drag = { kind: "umriss-vertex", index: um + 1 };
        return;
      }
      const oi = this.openingAt(raw);
      if (oi >= 0) {
        this.selected = -1;
        this.selOpening = oi;
        this.sensorOpen = false;
        this.openTab("raum");
        return;
      }
    }
    this.selected = -1;
    this.selOpening = -1;
    this.sensorOpen = false;
    this.drag = { kind: "pan", start: [event.clientX, event.clientY], view: { cx: this.view.cx, cy: this.view.cy } };
  }

  /** Rechtsklick auf einen Punkt löscht ihn (Zone oder Wand). */
  private onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    if (!this.kannAendern || this.page !== "raum") return;
    const raw = this.toWorld(event);
    const zone = this.zones[this.selected];
    if (zone?.form.art === "vieleck") {
      const i = zone.form.punkte.findIndex((q) => this.near(raw, q));
      if (i >= 0) {
        this.remember();
        this.deleteVertex(this.selected, i);
        return;
      }
    }
    const ui = this.umriss.findIndex((q) => this.near(raw, q));
    if (ui >= 0) this.deleteWallCorner(ui);
  };

  private deleteVertex(zoneIndex: number, i: number): void {
    const zone = this.zones[zoneIndex];
    if (zone?.form.art !== "vieleck") return;
    if (zone.form.punkte.length <= 3) {
      this.showToast("Eine Fläche braucht mindestens drei Punkte.");
      return;
    }
    this.remember();
    this.updateZone(zoneIndex, { form: removeVertex(zone.form, i) });
    this.selVertex = -1;
  }

  private deleteWallCorner(i: number): void {
    if (this.umriss.length <= 3) {
      this.showToast("Wände brauchen mindestens drei Ecken.");
      return;
    }
    this.remember();
    this.oeffnungen = shiftOpenings(this.oeffnungen, { removed: i }, this.umriss.length);
    this.umriss = this.umriss.filter((_, k) => k !== i);
    this.selOpening = -1;
    this.dirty = true;
  }

  private changeOpening(i: number, change: Partial<Oeffnung>): void {
    this.remember();
    this.oeffnungen = this.oeffnungen.map((x, k) => (k === i ? { ...x, ...change } : x));
    this.dirty = true;
  }

  private deleteOpening(i: number): void {
    if (!confirm("Diese Öffnung in der Wand löschen?")) return;
    this.remember();
    this.oeffnungen = this.oeffnungen.filter((_, k) => k !== i);
    this.selOpening = -1;
    this.dirty = true;
  }

  private turnZone(index: number, deg: number): void {
    const zone = this.zones[index];
    if (!zone || zone.form.art === "zellen") return;
    this.remember();
    this.updateZone(index, { form: rotateForm(zone.form, formCenter(zone.form), deg) });
  }

  /** Wand unter dem Punkt (Abstand in Pixeln), sonst -1. */
  private wallAt(p: Point, px = HIT_PX): number {
    const n = this.umriss.length;
    if (n < 3) return -1;
    let best = -1;
    let bestD = px;
    for (let i = 0; i < n; i++) {
      const d = distanceToSegment(this.toScreen(p), this.toScreen(this.umriss[i]), this.toScreen(this.umriss[(i + 1) % n]));
      if (d <= bestD) {
        best = i;
        bestD = d;
      }
    }
    return best;
  }

  private openingAt(p: Point): number {
    return this.oeffnungen.findIndex((o) => {
      const [a, b] = openingPoints(this.umriss, o);
      return distanceToSegment(this.toScreen(p), this.toScreen(a), this.toScreen(b)) <= HIT_PX;
    });
  }

  /** Dreh-Griff einer Zone: über ihrer Mitte, oberhalb der Form. */
  private zoneRotateHandle(form: Form): Point {
    const c = formCenter(form);
    const top = Math.max(...formPoints(form).map((q) => q[1]));
    return [c[0], top + 36 / this.view.scale];
  }

  private openSensor(): void {
    this.selected = -1;
    this.sensorOpen = true;
    this.openTab("raum");
  }

  private onPointerMove(event: PointerEvent): void {
    const raw = this.toWorld(event);
    const p = this.snapped(raw);
    this.hover = p;
    const drag = this.drag;
    if (!drag) return;
    const zone = this.zones[this.selected];
    switch (drag.kind) {
      case "pan": {
        this.viewTouched = true;
        const dx = (event.clientX - drag.start[0]) / this.view.scale;
        const dy = (event.clientY - drag.start[1]) / this.view.scale;
        this.view = { ...this.view, cx: drag.view.cx - dx, cy: drag.view.cy + dy };
        break;
      }
      case "vertex":
        if (zone) this.updateZone(this.selected, { form: setVertex(zone.form, drag.index, p) });
        break;
      case "corner":
        if (zone?.form.art === "rechteck") this.updateZone(this.selected, { form: dragRectCorner(zone.form, drag.index, p) });
        break;
      case "umriss-vertex": {
        const umriss = this.umriss.slice();
        umriss[drag.index] = p;
        this.umriss = umriss;
        this.dirty = true;
        break;
      }
      case "zone": {
        if (!zone) break;
        const dx = p[0] - drag.last[0];
        const dy = p[1] - drag.last[1];
        if (zone.form.art === "zellen") {
          const g = zone.form.groesse;
          const ci = Math.round(dx / g);
          const cj = Math.round(dy / g);
          if (!ci && !cj) break;
          this.updateZone(this.selected, { form: moveForm(zone.form, ci * g, cj * g) });
          this.drag = { kind: "zone", last: [drag.last[0] + ci * g, drag.last[1] + cj * g] };
        } else if (dx || dy) {
          this.updateZone(this.selected, { form: moveForm(zone.form, dx, dy) });
          this.drag = { kind: "zone", last: p };
        }
        break;
      }
      case "sensor":
        this.moveSensor({ ...this.sensor, x: p[0], y: p[1] });
        break;
      case "sensor-rotate": {
        // In 5°-Schritten (mit Umschalt frei), damit „gerade“ leicht geht.
        let winkel = headingTo([this.sensor.x, this.sensor.y], raw);
        if (!event.shiftKey) winkel = Math.round(winkel / 5) * 5;
        if (winkel <= -180) winkel += 360;
        this.moveSensor({ ...this.sensor, winkel });
        break;
      }
      case "paint":
        if (zone?.form.art === "zellen") this.updateZone(this.selected, { form: paintCell(zone.form, raw, drag.add) });
        break;
      case "rect":
        this.rectDraft = [drag.start, p];
        break;
      case "opening": {
        this.openingDraft = openingFromDrag(this.umriss, drag.kante, drag.start, raw);
        break;
      }
      case "opening-end": {
        const o = this.oeffnungen[drag.index];
        if (!o) break;
        const len = wallLength(this.umriss, o.kante);
        // In 5-cm-Schritten, mindestens 20 cm breit, nicht über die Wand hinaus.
        const t = Math.max(0, Math.min(Math.floor(len), Math.round(alongEdge(this.umriss, o.kante, raw) / 5) * 5));
        const next = drag.ende === "von" ? { ...o, von: Math.min(t, o.bis - 20) } : { ...o, bis: Math.max(t, o.von + 20) };
        this.oeffnungen = this.oeffnungen.map((x, k) => (k === drag.index ? next : x));
        this.dirty = true;
        break;
      }
      case "opening-move": {
        const o = this.oeffnungen[drag.index];
        if (!o) break;
        const len = Math.floor(wallLength(this.umriss, o.kante));
        const breite = drag.bis - drag.von;
        let von = Math.round((drag.von + alongEdge(this.umriss, o.kante, raw) - drag.start) / 5) * 5;
        von = Math.max(0, Math.min(len - breite, von));
        if (von !== o.von) {
          this.oeffnungen = this.oeffnungen.map((x, k) => (k === drag.index ? { ...o, von, bis: von + breite } : x));
          this.dirty = true;
        }
        break;
      }
      case "rotate-zone": {
        // In 5°-Schritten (mit Umschalt frei), wie beim Sensor.
        let deg = headingTo(drag.center, raw) - drag.start;
        if (!event.shiftKey) deg = Math.round(deg / 5) * 5;
        this.updateZone(this.selected, { form: rotateForm(drag.anchor, drag.center, deg) });
        break;
      }
      case "haus-raum": {
        // In 10-cm-Schritten, damit Wände leicht bündig liegen.
        const dx = Math.round((raw[0] - drag.last[0]) / 10) * 10;
        const dy = Math.round((raw[1] - drag.last[1]) / 10) * 10;
        if (!dx && !dy) break;
        const lage = this.lagen[drag.id];
        this.lagen = { ...this.lagen, [drag.id]: { ...lage, x: lage.x + dx, y: lage.y + dy } };
        this.drag = { ...drag, last: [drag.last[0] + dx, drag.last[1] + dy] };
        this.dirty = true;
        break;
      }
    }
  }

  private moveSensor(next: SensorLage): void {
    this.sensor = next;
    const anchor = this.sensorAnchor;
    if (this.zonesFollow && anchor) {
      this.zones = anchor.zones.map((z) => ({ ...z, form: moveWithSensor(z.form, anchor.sensor, next) }));
    }
    this.dirty = true;
  }

  private onPointerUp(): void {
    const drag = this.drag;
    this.drag = null;
    this.sensorAnchor = null;
    if (drag?.kind === "opening") {
      const o = this.openingDraft;
      this.openingDraft = null;
      if (o) {
        this.remember();
        this.oeffnungen = [...this.oeffnungen, o];
        this.selOpening = this.oeffnungen.length - 1;
        this.selected = -1;
        this.openTab("raum");
        this.dirty = true;
        this.tool = "auswahl";
      } else {
        this.showToast("Etwas weiter an der Wand entlang ziehen (mindestens 20 cm).");
      }
      return;
    }
    if (drag?.kind === "rect" && this.rectDraft) {
      const [a, b] = this.rectDraft;
      this.rectDraft = null;
      if (Math.abs(a[0] - b[0]) >= 10 && Math.abs(a[1] - b[1]) >= 10) {
        this.addZone(rectFromDrag(a, b));
        this.tool = "auswahl";
      }
    }
  }

  private onDoubleClick(event: MouseEvent): void {
    if (this.tool === "vieleck" || this.tool === "umriss") {
      this.draft = this.draft.slice(0, -1);
      this.finishDraft();
      return;
    }
    const zone = this.zones[this.selected];
    if (this.tool !== "auswahl" || zone?.form.art !== "vieleck") return;
    const raw = this.toWorld(event);
    const pts = zone.form.punkte;
    for (let i = 0; i < pts.length; i++) {
      if (distanceToSegment(this.toScreen(raw), this.toScreen(pts[i]), this.toScreen(pts[(i + 1) % pts.length])) <= HIT_PX) {
        this.remember();
        this.updateZone(this.selected, { form: insertVertex(zone.form, i, this.snapped(raw)) });
        return;
      }
    }
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, this.toWorld(event));
  }

  // -- Plan zeichnen -------------------------------------------------------------

  private renderGrid(): TemplateResult {
    const { w, h } = this.size;
    const s = this.view.scale;
    const x0 = this.view.cx - w / 2 / s;
    const x1 = this.view.cx + w / 2 / s;
    const y0 = this.view.cy - h / 2 / s;
    const y1 = this.view.cy + h / 2 / s;
    const step = s > 0.6 ? 50 : s > 0.2 ? 100 : 500;
    const lines: TemplateResult[] = [];
    for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) {
      const [sx] = this.toScreen([x, 0]);
      lines.push(svg`<line class="grid ${x % 100 === 0 ? "major" : ""}" x1=${sx} y1="0" x2=${sx} y2=${h} />`);
    }
    for (let y = Math.floor(y0 / step) * step; y <= y1; y += step) {
      const [, sy] = this.toScreen([0, y]);
      lines.push(svg`<line class="grid ${y % 100 === 0 ? "major" : ""}" x1="0" y1=${sy} x2=${w} y2=${sy} />`);
    }
    return svg`<g>${lines}</g>`;
  }

  private renderRoom(): TemplateResult | typeof nothing {
    if (this.umriss.length < 3) return nothing;
    const pts = this.screenPoints(this.umriss);
    const editHandles = this.kannAendern && this.tool === "auswahl" && this.selected < 0 && !this.sensorOpen;
    const openings = this.openingDraft ? [...this.oeffnungen, this.openingDraft] : this.oeffnungen;
    // Mitte des Raums: Türblätter schlagen nach innen auf.
    const inside = formCenter({ art: "vieleck", punkte: this.umriss });
    const belegt = this.istMelder && !!this.live?.zonen[MELDER_ZONE]?.belegt;
    return svg`<polygon class="floor ${belegt ? "belegt" : ""}" points=${pts} />
      <polygon class="wall" points=${pts} />
      ${openings.map((o, i) => this.renderOpening(o, i === this.selOpening || o === this.openingDraft, inside))}
      ${this.kannAendern && this.tool === "auswahl" && this.oeffnungen[this.selOpening]
        ? openingPoints(this.umriss, this.oeffnungen[this.selOpening]).map((q) => {
            const [x, y] = this.toScreen(q);
            return svg`<circle class="handle opening-griff" cx=${x} cy=${y} r="8" />`;
          })
        : nothing}
      ${editHandles
        ? svg`${this.umriss.map((p) => {
            const [x, y] = this.toScreen(p);
            return svg`<circle class="handle" cx=${x} cy=${y} r="5" />`;
          })}
          ${edgeMidpoints(this.umriss).map((p) => this.renderPlus(p))}`
        : nothing}`;
  }

  /** Lücke in der Wand; bei einer Tür dazu Türblatt und Bogen. */
  private renderOpening(o: Oeffnung, selected: boolean, inside: Point): TemplateResult {
    const [a, b] = openingPoints(this.umriss, o);
    const [ax, ay] = this.toScreen(a);
    const [bx, by] = this.toScreen(b);
    const gap = svg`<line class="wall-gap" x1=${ax} y1=${ay} x2=${bx} y2=${by} />`;
    if (o.art === "offen") {
      return svg`<g class="opening ${selected ? "selected" : ""}">${gap}<line class="opening-line" x1=${ax} y1=${ay} x2=${bx} y2=${by} /></g>`;
    }
    // Türblatt am Scharnier h, senkrecht zur Wand (in den Raum oder nach
    // außen), Bogen bis zum anderen Ende f.
    const [hx, hy, fx, fy] = o.anschlag === "ende" ? [bx, by, ax, ay] : [ax, ay, bx, by];
    const len = Math.hypot(fx - hx, fy - hy) || 1;
    let nx = -(fy - hy) / len;
    let ny = (fx - hx) / len;
    const [ix, iy] = this.toScreen(inside);
    const towardsInside = (ix - hx) * nx + (iy - hy) * ny >= 0;
    if (towardsInside !== (o.aufgehen !== "aussen")) {
      nx = -nx;
      ny = -ny;
    }
    const lx = hx + nx * len;
    const ly = hy + ny * len;
    const sweep = (fx - hx) * ny - (fy - hy) * nx > 0 ? 0 : 1;
    return svg`<g class="opening ${selected ? "selected" : ""}">${gap}
      <line class="door-leaf" x1=${hx} y1=${hy} x2=${lx} y2=${ly} />
      <path class="door-arc" d="M ${lx} ${ly} A ${len} ${len} 0 0 ${sweep} ${fx} ${fy}" /></g>`;
  }

  /** Kleines „+“: hier einen Punkt einfügen. */
  private renderPlus(p: Point): TemplateResult {
    const [x, y] = this.toScreen(p);
    return svg`<g class="plus"><circle cx=${x} cy=${y} r="6" /><path d="M ${x - 3} ${y} H ${x + 3} M ${x} ${y - 3} V ${y + 3}" /></g>`;
  }

  /** Zellen, die gerade als Bewegungskarte gezeigt werden. */
  private heatQuelle(): { key: string; zellen: HeatCell[]; zelle: number; sigma: number } | null {
    if (this.istMelder) return null;
    if (this.tab === "auswertung" && this.ausw) {
      const a = this.ausw;
      const figs = this.auswFigur ? a.figuren.filter((f) => f.figur === this.auswFigur) : a.figuren;
      // Feine Zellen (5 cm), weich wie die Ungenauigkeit des Sensors.
      return { key: `a|${a.bis}|${a.stunden}|${this.auswFigur}`, zellen: summe(figs.map((f) => f.zellen)), zelle: a.zelle_cm, sigma: 8 };
    }
    if (this.heat?.zellen.length) {
      const h = this.heat;
      return { key: `h|${h.minuten}|${h.zellen.length}|${h.zellen.reduce((s, c) => s + c[2], 0)}`, zellen: h.zellen, zelle: h.zelle_cm, sigma: h.zelle_cm * 0.75 };
    }
    return null;
  }

  private heatRgb(): [number, number, number] {
    const v = getComputedStyle(this).getPropertyValue("--rz-heat").split(",").map((x) => Number(x.trim()));
    return v.length === 3 && v.every((n) => Number.isFinite(n)) ? [v[0], v[1], v[2]] : [255, 87, 34];
  }

  private renderHeat(): TemplateResult | typeof nothing {
    const q = this.heatQuelle();
    if (!q || !q.zellen.length) return nothing;
    let bild = this.heatBildCache;
    if (bild?.key !== q.key) {
      const d = dichte(q.zellen, q.zelle, q.sigma);
      if (!d) return nothing;
      const canvas = document.createElement("canvas");
      canvas.width = d.nx;
      canvas.height = d.ny;
      const ctx = canvas.getContext("2d");
      if (!ctx) return nothing;
      ctx.putImageData(new ImageData(pixel(d, this.heatRgb()), d.nx, d.ny), 0, 0);
      bild = { key: q.key, href: canvas.toDataURL(), x0: d.x0, y0: d.y0, w: d.nx * d.zelle, h: d.ny * d.zelle };
      this.heatBildCache = bild;
    }
    const [sx, sy] = this.toScreen([bild.x0, bild.y0 + bild.h]);
    return svg`<image class="heat" href=${bild.href} x=${sx} y=${sy} width=${this.px(bild.w)} height=${this.px(bild.h)} preserveAspectRatio="none" />`;
  }

  /** Stellen des Assistenten als 1, 2, 3 im Plan; dazu die neue Lage des Sensors. */
  private renderWizMarken(): TemplateResult | typeof nothing {
    const w = this.wiz;
    if (!w) return nothing;
    const marken = w.raum.map((p, i) => {
      if (!p) return nothing;
      const [x, y] = this.toScreen(p);
      const on = i === w.aktiv && w.schritt === "nachher";
      return svg`<g class="wiz-marke ${on ? "aktiv" : ""}"><circle cx=${x} cy=${y} r="14" /><text x=${x} y=${y + 5}>${i + 1}</text></g>`;
    });
    const e = w.ergebnis;
    let neu: TemplateResult | typeof nothing = nothing;
    if (e) {
      const [x, y] = this.toScreen([e.x, e.y]);
      const r = Math.max(30, this.px(80));
      const [dx, dy] = sensorDirection(e.winkel);
      neu = svg`<g class="wiz-neu"><circle cx=${x} cy=${y} r="9" /><line x1=${x} y1=${y} x2=${x + dx * r} y2=${y - dy * r} /></g>`;
    }
    return svg`${marken}${neu}`;
  }

  private async ladePlanBilder(): Promise<void> {
    const plaene = this.data?.plaene ?? [];
    for (const plan of plaene) {
      if (this.planBilder[plan.id] || !this._hass) continue;
      try {
        const r = await this._hass.callWS<{ mime: string; bild: string }>({ type: `${DOMAIN}/plan/bild/get`, plan_id: plan.id });
        const bytes = Uint8Array.from(atob(r.bild), (c) => c.charCodeAt(0));
        this.planBilder = { ...this.planBilder, [plan.id]: URL.createObjectURL(new Blob([bytes], { type: r.mime })) };
      } catch {
        // Bild fehlt oder alte Version: dann eben ohne Hintergrund.
      }
    }
  }

  /** Grundrisse als Hintergrund (Hausplan: im Haus; Raum: in den Raum umgerechnet). */
  private renderPlanBilder(): TemplateResult | typeof nothing {
    if (!this.zeigePlan) return nothing;
    const plaene = (this.data?.plaene ?? []).filter((p) => this.planBilder[p.id]);
    if (!plaene.length) return nothing;
    let zuRaum: ((h: Point) => Point) | null = null;
    if (this.page === "raum") {
      const r = this.raum;
      if (!r?.haus_gesetzt) return nothing;
      const lage = { x: r.haus_x, y: r.haus_y, winkel: r.haus_winkel };
      zuRaum = (h) => fromHouse(h, lage);
    }
    return svg`${plaene.map((p) => {
      // Bildpunkt → Haus → (Raum) → Bildschirm; affin, darum reichen drei Punkte.
      const k = p.cm_pro_px;
      const haus = (px: number, py: number): Point => [p.x + px * k, p.y + (p.hoehe_px - py) * k];
      const bild = (px: number, py: number): Point => this.toScreen(zuRaum ? zuRaum(haus(px, py)) : haus(px, py));
      const [o, ex, ey] = [bild(0, 0), bild(1, 0), bild(0, 1)];
      const m = [ex[0] - o[0], ex[1] - o[1], ey[0] - o[0], ey[1] - o[1], o[0], o[1]].map((v) => v.toFixed(5)).join(" ");
      return svg`<image class="plan-hintergrund" href=${this.planBilder[p.id]} x="0" y="0" width=${p.breite_px} height=${p.hoehe_px} transform="matrix(${m})" preserveAspectRatio="none" />`;
    })}`;
  }

  /** Maße der Wände (und Öffnungen), wenn eingeschaltet. */
  private renderMasse(): TemplateResult | typeof nothing {
    if (!this.masse || this.umriss.length < 3) return nothing;
    const n = this.umriss.length;
    const mitte = formCenter({ art: "vieleck", punkte: this.umriss });
    const texte = this.umriss.map((a, i) => {
      const b = this.umriss[(i + 1) % n];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 20) return nothing;
      const m: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      // Nach außen versetzt (weg von der Raummitte).
      let nx = -(b[1] - a[1]) / len;
      let ny = (b[0] - a[0]) / len;
      if ((mitte[0] - m[0]) * nx + (mitte[1] - m[1]) * ny > 0) [nx, ny] = [-nx, -ny];
      const [sx, sy] = this.toScreen(m);
      const off = 26;
      const [tx, ty] = [sx + nx * off, sy - ny * off];
      return svg`<text class="mass-text" x=${tx} y=${ty} dy="0.35em">${meter(len)} m</text>`;
    });
    const oeff = this.oeffnungen.map((o) => {
      const [a, b] = openingPoints(this.umriss, o);
      const [sx, sy] = this.toScreen([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      return svg`<text class="mass-text klein" x=${sx} y=${sy} dy="-0.8em">${meter(o.bis - o.von)}</text>`;
    });
    return svg`<g>${texte}${oeff}</g>`;
  }

  /** Melder-Raum: in der Mitte steht, ob jemand da ist. */
  private renderMelderLabel(): TemplateResult {
    const live = this.live;
    const erreichbar = !!live && live.verfuegbar && !live.problem;
    const da = !!live?.zonen[MELDER_ZONE]?.belegt;
    const mitte: Point = this.umriss.length >= 3 ? formCenter({ art: "vieleck", punkte: this.umriss }) : [0, 0];
    const [x, y] = this.toScreen(mitte);
    return svg`<text class="label room" x=${x} y=${y}>${!erreichbar ? "Melder nicht erreichbar" : da ? "jemand da" : "niemand"}</text>
      ${this.umriss.length < 3 ? svg`<text class="label sub" x=${x} y=${y + 18}>Wände zeichnen: Werkzeug links</text>` : nothing}`;
  }

  private renderCoverage(): TemplateResult | typeof nothing {
    if (!this.layers.abdeckung) return nothing;
    const s = this.sensor;
    return svg`<polygon class="coverage" points=${this.screenPoints(sectorPoints([s.x, s.y], s.winkel, s.reichweite_cm, s.oeffnung_grad))} />`;
  }

  private renderZone(zone: Zone, index: number): TemplateResult {
    const occupied = (zone.id ? this.live?.zonen[zone.id]?.belegt : false) ?? false;
    const rolle = rolleOf(zone);
    const color = roleColor(rolle);
    const selected = index === this.selected;
    const fill = occupied ? 0.5 : 0.2;
    let shape: TemplateResult;
    if (zone.form.art === "zellen") {
      shape = svg`${cellRects(zone.form).map((r) => {
        const [sx, sy] = this.toScreen([r.x, r.y + r.s]);
        return svg`<rect class="zone-shape ${selected ? "selected" : ""}" x=${sx} y=${sy} width=${this.px(r.s)} height=${this.px(r.s)} fill=${color} fill-opacity=${fill} stroke=${color} style="stroke-width:1" />`;
      })}`;
    } else {
      const pts = this.screenPoints(formPoints(zone.form));
      const band = selected && zone.regel.rand_cm > 0 ? this.px(zone.regel.rand_cm * 2) : 0;
      shape = svg`
        ${band
          ? svg`<mask id="rz-band-${index}">
                <rect x="0" y="0" width=${this.size.w} height=${this.size.h} fill="white" />
                <polygon points=${pts} fill="black" />
              </mask>
              <polygon points=${pts} fill="none" stroke=${color} stroke-opacity="0.25" stroke-width=${band} stroke-linejoin="round" mask="url(#rz-band-${index})" />`
          : nothing}
        <polygon class="zone-shape ${selected ? "selected" : ""}" points=${pts} fill=${color} fill-opacity=${fill} stroke=${color} />`;
    }
    return svg`<g>${shape}</g>`;
  }

  /** Beschriftung der Zone; wird nach den Figuren gezeichnet, damit sie lesbar bleibt. */
  private renderZoneLabel(zone: Zone): TemplateResult {
    const st = zone.id ? this.live?.zonen[zone.id] : undefined;
    const [lx, ly] = this.toScreen(formCenter(zone.form));
    const sub = st ? (st.belegt ? `belegt${st.personen > 1 ? ` · ${st.personen}` : ""}` : "frei") : "neu";
    return svg`<text class="label" x=${lx} y=${ly - 2}>${zone.name}</text>
      <text class="label sub" x=${lx} y=${ly + 14}>${sub}</text>`;
  }

  private renderHandles(): TemplateResult | typeof nothing {
    const zone = this.zones[this.selected];
    if (!zone || this.tool !== "auswahl" || !this.kannAendern) return nothing;
    let pts: Point[] = [];
    if (zone.form.art === "vieleck") pts = zone.form.punkte;
    else if (zone.form.art === "rechteck") pts = rectCorners(zone.form.mitte, zone.form.breite, zone.form.tiefe, zone.form.winkel);
    let turn: TemplateResult | typeof nothing = nothing;
    if (zone.form.art !== "zellen") {
      const [cx, cy] = this.toScreen(formCenter(zone.form));
      const [hx, hy] = this.toScreen(this.zoneRotateHandle(zone.form));
      turn = svg`<line class="sensor-line" x1=${cx} y1=${cy} x2=${hx} y2=${hy} /><circle class="handle angle" cx=${hx} cy=${hy} r="8"><title>Drehen</title></circle>`;
    }
    return svg`${turn}
      ${zone.form.art === "vieleck" ? edgeMidpoints(zone.form.punkte).map((p) => this.renderPlus(p)) : nothing}
      ${pts.map((p, i) => {
        const [x, y] = this.toScreen(p);
        const on = zone.form.art === "vieleck" && i === this.selVertex;
        return svg`<rect class="handle ${on ? "on" : ""}" x=${x - 5} y=${y - 5} width="10" height="10" rx="2" />`;
      })}`;
  }

  private renderSensor(): TemplateResult {
    const s = this.sensor;
    const [x, y] = this.toScreen([s.x, s.y]);
    const [hx, hy] = this.toScreen(this.sensorHandle());
    // Wellen in Blickrichtung (Bildschirm: y nach unten).
    const a = (-s.winkel * Math.PI) / 180;
    const waves = [4.5, 7.5].map((r) => {
      const a1 = a - Math.PI / 2 - 0.7;
      const a2 = a - Math.PI / 2 + 0.7;
      return svg`<path class="sensor-wave" d="M ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${x + r * Math.cos(a2)} ${y + r * Math.sin(a2)}" />`;
    });
    return svg`<g>
      ${this.kannAendern
        ? svg`<line class="sensor-line" x1=${x} y1=${y} x2=${hx} y2=${hy} />
            <circle class="handle angle" cx=${hx} cy=${hy} r="8" />`
        : nothing}
      <circle class="sensor-body" cx=${x} cy=${y} r="12" />
      ${waves}
    </g>`;
  }

  private renderLive(): TemplateResult | typeof nothing {
    const live = this.live;
    if (!live) return nothing;
    const parts: TemplateResult[] = [];
    if (this.layers.ziele) {
      for (const [, tx, ty] of live.ziele) {
        const [x, y] = this.toScreen([tx, ty]);
        parts.push(svg`<path class="target" d="M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x - 4} ${y + 4} L${x + 4} ${y - 4}" />`);
      }
    }
    for (const f of live.figuren) {
      if (f.tags.includes("wiederhergestellt") || f.tags.includes("stoerung")) continue;
      const tier = f.tags.includes("hund") || f.art === "pet";
      const color = tier ? "var(--rz-tier)" : "var(--rz-person)";
      if (this.layers.spuren && f.spur.length > 1) {
        parts.push(svg`<polyline class="trail" points=${this.screenPoints(f.spur)} stroke=${color} />`);
      }
      if (!this.layers.figuren) continue;
      const [x, y] = this.toScreen([f.x, f.y]);
      const r = Math.max(7, this.px(14));
      parts.push(svg`<circle class="figure ${f.gehalten ? "held" : ""}" cx=${x} cy=${y} r=${r} fill=${color} stroke=${f.gehalten ? color : "var(--card)"} />`);
      if (tier || f.gehalten) {
        parts.push(svg`<text class="label sub" x=${x} y=${y - r - 5}>${tier ? "Hund?" : "gehalten"}</text>`);
      }
    }
    return svg`<g>${parts}</g>`;
  }

  private renderDraft(): TemplateResult | typeof nothing {
    if (this.rectDraft) {
      const form = rectFromDrag(...this.rectDraft);
      if (form.art !== "rechteck") return nothing;
      const [mx, my] = this.toScreen(form.mitte);
      return svg`<polygon class="draft" points=${this.screenPoints(rectCorners(form.mitte, form.breite, form.tiefe, 0))} />
        <text class="label" x=${mx} y=${my + 5}>${(form.breite / 100).toFixed(2)} × ${(form.tiefe / 100).toFixed(2)} m</text>`;
    }
    if (!this.draft.length) return nothing;
    const pts = this.hover ? [...this.draft, this.hover] : this.draft;
    const [fx, fy] = this.toScreen(this.draft[0]);
    return svg`<polyline class="draft" points=${this.screenPoints(pts)} style="fill:none" />
      ${this.draft.map((p) => {
        const [x, y] = this.toScreen(p);
        return svg`<circle class="draft-dot" cx=${x} cy=${y} r="4" />`;
      })}
      ${this.draft.length >= 3 ? svg`<circle class="close-ring" cx=${fx} cy=${fy} r=${HIT_PX} />` : nothing}`;
  }

  private hausRoomAt(p: Point): string {
    const raeume = this.data?.raeume ?? [];
    for (let i = raeume.length - 1; i >= 0; i--) {
      const r = raeume[i];
      const lage = this.lagen[r.id];
      if (lage && inForm(p, { art: "vieleck", punkte: this.outlineOf(r).map((q) => toHouse(q, lage)) })) return r.id;
    }
    return "";
  }

  /** Mitte einer Tür im Haus. */
  private renderHausPlan(): TemplateResult {
    const raeume = this.data?.raeume ?? [];
    const rooms: TemplateResult[] = [];
    const lines: TemplateResult[] = [];
    const labels: TemplateResult[] = [];
    const figures: TemplateResult[] = [];
    for (const raum of raeume) {
      const lage = this.lagen[raum.id];
      if (!lage) continue;
      const outline = this.outlineOf(raum).map((p) => toHouse(p, lage));
      const sel = raum.id === this.hausSel;
      const live = this.hausLive[raum.id];
      const melderBelegt = raum.art === "melder" && !!live?.zonen[MELDER_ZONE]?.belegt;
      rooms.push(svg`<polygon class="floor ${melderBelegt ? "belegt" : ""}" points=${this.screenPoints(outline)} />
        <polygon class="wall ${raum.umriss.length >= 3 ? "" : "guess"} ${sel ? "selected" : ""}" points=${this.screenPoints(outline)} />`);
      for (const zone of raum.zonen) {
        const rolle = rolleOf(zone);
        if (rolle === "ignorieren") continue;
        const occupied = (zone.id ? live?.zonen[zone.id]?.belegt : false) ?? false;
        const pts = formPoints(zone.form).map((p) => toHouse(p, lage));
        rooms.push(svg`<polygon class="zone-shape" points=${this.screenPoints(pts)} fill=${roleColor(rolle)} fill-opacity=${occupied ? 0.5 : 0.18} stroke=${roleColor(rolle)} />`);
      }
      for (const tuer of tuerenVon(raum)) {
        // Wohin führt die Tür? Linie zur passenden Tür im anderen Raum.
        const ziel = this.tueren[tuer.key] ?? "";
        const [fx, fy] = this.toScreen(toHouse(tuer.punkt, lage));
        if (ziel === "aussen") {
          labels.push(svg`<text class="label sub" x=${fx} y=${fy - 10}>nach draußen</text>`);
        } else if (ziel) {
          const other = raeume.find((x) => x.id === ziel);
          if (!other) continue;
          const back = tuerenVon(other).find((t) => this.tueren[t.key] === raum.id);
          // Jede Verbindung nur einmal zeichnen.
          if (back && raum.id > other.id) continue;
          const ol = this.lagen[other.id];
          if (!ol) continue;
          const to = back ? toHouse(back.punkt, ol) : toHouse(formCenter({ art: "vieleck", punkte: this.outlineOf(other) }), ol);
          const [tx, ty] = this.toScreen(to);
          lines.push(svg`<line class="link" x1=${fx} y1=${fy} x2=${tx} y2=${ty} />
            <circle class="link-dot" cx=${fx} cy=${fy} r="5" /><circle class="link-dot" cx=${tx} cy=${ty} r="5" />`);
        }
      }
      const [cx, cy] = this.toScreen(formCenter({ art: "vieleck", punkte: outline }));
      const n = live ? live.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
      const stand = !live || live.problem || !live.verfuegbar ? "nicht erreichbar" : raum.art === "melder" ? (melderBelegt ? "jemand da" : "niemand") : n ? `${n} ${n === 1 ? "Person" : "Personen"}` : "niemand";
      labels.push(svg`<text class="label room" x=${cx} y=${cy}>${raum.name}</text>
        <text class="label sub" x=${cx} y=${cy + 16}>${stand}</text>`);
      if (raum.art === "melder") continue; // Melder kennen keine Position
      for (const f of live?.figuren ?? []) {
        if (f.tags.includes("wiederhergestellt") || f.tags.includes("stoerung")) continue;
        const tier = f.tags.includes("hund") || f.art === "pet";
        const color = tier ? "var(--rz-tier)" : "var(--rz-person)";
        const [x, y] = this.toScreen(toHouse([f.x, f.y], lage));
        const rr = Math.max(6, this.px(14));
        figures.push(svg`<circle class="figure ${f.gehalten ? "held" : ""}" cx=${x} cy=${y} r=${rr} fill=${color} stroke=${f.gehalten ? color : "var(--card)"} />`);
      }
    }
    return svg`${this.renderPlanBilder()}${rooms}${lines}${figures}${labels}`;
  }

  private renderScalebar(): TemplateResult {
    const cm = niceLength(90 / this.view.scale);
    const label = cm >= 100 ? `${cm / 100} m` : `${cm} cm`;
    return html`<div class="scalebar"><div style="width:${this.px(cm)}px"></div>${label}</div>`;
  }

  private renderBubble(): TemplateResult | typeof nothing {
    const text = BUBBLE[this.tool];
    if (text) {
      const canFinish = (this.tool === "vieleck" || this.tool === "umriss") && this.draft.length >= 3;
      return html`<div class="bubble">
        <ha-icon icon=${TOOLS.find((t) => t.tool === this.tool)!.icon}></ha-icon>
        <span class="grow">${text}</span>
        ${canFinish ? html`<button class="text" @click=${this.finishDraft}>Fertig</button>` : nothing}
        <button class="text" @click=${() => this.setTool("auswahl")}>${this.tool === "zellen" ? "Fertig" : "Abbrechen"}</button>
      </div>`;
    }
    if (!this.kannAendern) return nothing;
    if (this.istMelder) {
      if (this.umriss.length >= 3 || this.tool !== "auswahl") return nothing;
      return html`<div class="bubble">
        <ha-icon icon="mdi:wall"></ha-icon>
        <span class="grow">Links mit <b>Wände zeichnen</b> den Umriss des Raums einzeichnen, dann Türen in die Wände. So passt er in den Hausplan.</span>
      </div>`;
    }
    if (!this.zones.length && this.tool === "auswahl") {
      return html`<div class="bubble">
        <ha-icon icon="mdi:gesture-tap"></ha-icon>
        <span class="grow">Zuerst den <b>Sensor</b> an seinen Platz ziehen und am gelben Griff drehen. Dann links ein Werkzeug wählen und die erste Zone zeichnen.</span>
      </div>`;
    }
    return nothing;
  }

  private renderLayers(): TemplateResult | typeof nothing {
    if (!this.layersOpen) return nothing;
    const toggle = (key: keyof typeof this.layers, label: string) =>
      html`<label class="check"
        ><input
          type="checkbox"
          .checked=${this.layers[key]}
          @change=${(e: Event) => (this.layers = { ...this.layers, [key]: (e.target as HTMLInputElement).checked })}
        /><span>${label}</span></label
      >`;
    const heat = (min: number, label: string) =>
      html`<button
        class=${this.heatMin === min ? "active" : ""}
        @click=${() => {
          this.heatMin = min;
          void this.loadHeat();
        }}
      >
        ${label}
      </button>`;
    return html`<div class="layers" @pointerdown=${(e: Event) => e.stopPropagation()}>
      ${toggle("figuren", "Figuren live")} ${toggle("spuren", "Spuren der letzten Sekunden")}
      ${toggle("abdeckung", "Abdeckung des Sensors")} ${toggle("ziele", "Rohpunkte des Sensors")}
      <div class="label-text">Bewegungskarte: wo war jemand?</div>
      <div class="levels">${heat(0, "aus")}${heat(15, "15 min")}${heat(60, "1 h")}${heat(1440, "24 h")}</div>
      <p class="hint small">Zählt seit dem letzten Neustart von Home Assistant.${this.kannAendern ? " Länger zurück und feiner: Reiter „Auswertung“." : ""}</p>
    </div>`;
  }

  private renderStage(): TemplateResult {
    const cls = this.tool === "zellen" ? "painting" : this.tool === "auswahl" ? "" : "drawing";
    return html`<div class="stage">
      <svg
        class="plan ${cls}"
        viewBox="0 0 ${this.size.w} ${this.size.h}"
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerUp}
        @dblclick=${this.onDoubleClick}
        @wheel=${this.onWheel}
        @contextmenu=${this.onContextMenu}
      >
        ${this.renderGrid()}
        ${this.page === "haus"
          ? this.renderHausPlan()
          : this.istMelder
            ? svg`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderMelderLabel()} ${this.renderDraft()}`
            : svg`${this.renderPlanBilder()} ${this.renderRoom()} ${this.renderMasse()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((z, i) => this.renderZone(z, i))} ${this.renderLive()}
              ${this.zones.map((z) => this.renderZoneLabel(z))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()} ${this.renderWizMarken()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(e: Event) => e.stopPropagation()}>
        ${this.kannAendern && this.page === "raum"
          ? html`${TOOLS.filter((t) => !this.istMelder || MELDER_TOOLS.includes(t.tool)).map(
                (t) => html`<button class="icon ${this.tool === t.tool ? "on" : ""}" title=${t.label} aria-label=${t.label} @click=${() => this.setTool(t.tool)}>
                  <ha-icon icon=${t.icon}></ha-icon>
                </button>`,
              )}
              <span class="sep"></span>`
          : nothing}
        ${this.page === "raum" && !this.istMelder
          ? html`<button class="icon ${this.layersOpen ? "on" : ""}" title="Ebenen und Bewegungskarte" aria-label="Ebenen" @click=${() => (this.layersOpen = !this.layersOpen)}>
                <ha-icon icon="mdi:layers-outline"></ha-icon>
              </button>
              <span class="sep"></span>`
          : nothing}
        ${this.data?.plaene?.length
          ? html`<button
              class="icon ${this.zeigePlan ? "on" : ""}"
              title="Grundriss im Hintergrund"
              aria-label="Grundriss im Hintergrund"
              @click=${() => {
                this.zeigePlan = !this.zeigePlan;
                merken("raumzonen-zeige-plan", this.zeigePlan);
              }}
            >
              <ha-icon icon="mdi:image-outline"></ha-icon>
            </button>`
          : nothing}
        ${this.page === "raum"
          ? html`<button
              class="icon ${this.masse ? "on" : ""}"
              title="Maße der Wände"
              aria-label="Maße der Wände"
              @click=${() => {
                this.masse = !this.masse;
                merken("raumzonen-masse", this.masse);
              }}
            >
              <ha-icon icon="mdi:ruler"></ha-icon>
            </button>`
          : nothing}
        <button class="icon" title="Vergrößern" aria-label="Vergrößern" @click=${() => this.zoom(1.25)}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="icon" title="Verkleinern" aria-label="Verkleinern" @click=${() => this.zoom(0.8)}><ha-icon icon="mdi:minus"></ha-icon></button>
        <button
          class="icon"
          title="Einpassen"
          aria-label="Einpassen"
          @click=${() => {
            this.viewTouched = false;
            this.fit();
          }}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
      </div>
      ${this.page === "raum" ? html`${this.renderLayers()} ${this.renderBubble()}` : nothing} ${this.renderScalebar()}
    </div>`;
  }

  // -- Seitenleiste ------------------------------------------------------------

  private renderZoneItem(zone: Zone, index: number): TemplateResult {
    const open = index === this.selected;
    const rolle = rolleOf(zone);
    const info = rolleInfo(rolle);
    const st = zone.id ? this.live?.zonen[zone.id] : undefined;
    const badge = st
      ? html`<span class="badge ${st.belegt ? "on" : "off"}">${st.belegt ? (st.personen > 1 ? `belegt · ${st.personen}` : "belegt") : "frei"}</span>`
      : html`<span class="badge new">neu</span>`;
    return html`<li class="item ${open ? "open" : ""}" style="--zone:${roleColor(rolle)}">
      <div class="row" @click=${() => this.select(open ? -1 : index)}>
        <span class="dot"></span>
        <ha-icon icon=${info.icon}></ha-icon>
        <span class="name">${zone.name}</span>
        ${badge}
      </div>
      ${open ? this.renderInspector(zone, index) : nothing}
    </li>`;
  }

  private renderInspector(zone: Zone, index: number): TemplateResult {
    const r = zone.regel;
    const rolle = rolleOf(zone);
    const g = this.data!.grenzen;
    const num = (key: keyof Regel, label: string, unit: string, max: number, step: number) =>
      html`<label class="field"
        >${label}<input
          type="number"
          min="0"
          max=${max}
          step=${step}
          .value=${String(r[key])}
          @change=${(e: Event) => {
            const v = Number((e.target as HTMLInputElement).value);
            if (Number.isFinite(v)) this.updateRegel(index, { [key]: Math.max(0, Math.min(max, v)) } as Partial<Regel>);
          }}
        /><span class="unit">${unit}</span></label
      >`;
    const check = (label: string, help: string, value: boolean, onChange: (v: boolean) => void) =>
      html`<label class="check"
        ><input type="checkbox" .checked=${value} @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)} /><span
          >${label}<small>${help}</small></span
        ></label
      >`;
    const problem = formProblem(zone.form);
    const andere = (this.data?.raeume ?? []).filter((x) => x.id !== this.raumId);
    if (!this.kannAendern) {
      return html`<div class="inspector">
        <p class="hint small">${rolleInfo(rolle).text}</p>
        ${rolle === "tuer" ? html`<div class="summary">Führt ${fuehrtZuText(zone, andere)}.</div>` : nothing}
        ${rolle !== "ignorieren" ? html`<div class="summary">${regelSatz(zone)}</div>` : nothing}
      </div>`;
    }
    return html`<div class="inspector">
      <label class="field"
        >Name<input
          type="text"
          .value=${zone.name}
          @change=${(e: Event) => {
            this.remember();
            this.updateZone(index, { name: (e.target as HTMLInputElement).value });
          }}
      /></label>
      <div class="label-text">Wofür ist die Zone?</div>
      <div class="levels">
        ${ROLLEN.map(
          (info) => html`<button class=${info.rolle === rolle ? "active" : ""} @click=${() => this.setRolle(index, info.rolle)}>
            <ha-icon icon=${info.icon}></ha-icon>${info.name}
          </button>`,
        )}
      </div>
      <p class="hint small">${rolleInfo(rolle).text}</p>
      ${rolle === "tuer"
        ? html`<label class="field"
              >Wohin führt die Tür?<select
                @change=${(e: Event) => {
                  this.remember();
                  this.updateZone(index, { fuehrt_zu: (e.target as HTMLSelectElement).value });
                }}
              >
                <option value="" ?selected=${!zone.fuehrt_zu}>weiß nicht</option>
                <option value="aussen" ?selected=${zone.fuehrt_zu === "aussen"}>nach draußen / Raum ohne Sensor</option>
                ${andere.map((x) => html`<option value=${x.id} ?selected=${zone.fuehrt_zu === x.id}>${x.name}</option>`)}
              </select></label
            >
            <p class="hint small">Damit weiß Raumzonen später, wer von wo nach wo geht.</p>`
        : nothing}
      ${rolle === "bett"
        ? html`${check("Nur eine Person im Bett", "Dann wird ein starrer Punkt, den der Sensor beim Aufstehen zurücklässt, verworfen.", r.max_personen === 1, (v) =>
            this.updateRegel(index, { max_personen: v ? 1 : 0 }),
          )}
          ${check("Hund nicht mitzählen", "Nur ein Hinweis; ob es der Hund ist, ergibt sich aus Hundeplätzen oder der Art, die der Sensor meldet.", r.hund_ignorieren, (v) =>
            this.updateRegel(index, { hund_ignorieren: v }),
          )}`
        : nothing}
      ${rolle !== "ignorieren"
        ? html`<div class="summary">${regelSatz(zone)}</div>
            <details class="fine">
              <summary>Feineinstellung</summary>
              <div class="fields">
                ${num("belegt_nach_s", "Belegt nach", "s", g.belegt_nach_s, 0.5)} ${num("frei_nach_s", "Frei nach", "s", g.frei_nach_s, 0.5)}
              </div>
              ${num("rand_cm", "Randstreifen (gegen Zittern am Rand)", "cm", g.rand_cm, 5)}
              ${r.schlaefer_halten
                ? html`<p class="hint small">Als „aufgestanden“ gilt erst, wer sich draußen bewegt, weit genug weg ist oder zur Tür geht:</p>
                    <div class="fields">
                      ${num("weg_rahmen", "Bewegte Meldungen", "", g.weg_rahmen, 1)} ${num("weg_cm", "oder Abstand", "cm", g.weg_cm, 5)}
                    </div>`
                : nothing}
            </details>`
        : nothing}
      ${zone.form.art !== "zellen"
        ? html`<div class="label-text">Form</div>
            <div class="actions">
              <button class="text small" title="Gegen den Uhrzeigersinn" @click=${() => this.turnZone(index, 15)}><ha-icon icon="mdi:rotate-left"></ha-icon>15°</button>
              <button class="text small" title="Im Uhrzeigersinn" @click=${() => this.turnZone(index, -15)}><ha-icon icon="mdi:rotate-right"></ha-icon>15°</button>
              ${zone.form.art === "vieleck"
                ? html`<button class="text small" ?disabled=${this.selVertex < 0 || zone.form.punkte.length <= 3} @click=${() => this.deleteVertex(index, this.selVertex)}>
                    <ha-icon icon="mdi:vector-point-minus"></ha-icon>Punkt löschen
                  </button>`
                : nothing}
            </div>
            <p class="hint small">
              Am gelben Griff drehen. ${zone.form.art === "vieleck" ? "Das „+“ auf einer Kante fügt einen Punkt ein; Rechtsklick auf einen Punkt löscht ihn." : ""}
            </p>`
        : nothing}
      ${problem ? html`<div class="note warn">${problem}</div>` : nothing}
      <div class="actions">
        <span class="spacer"></span>
        <button class="text danger" @click=${() => this.deleteZone(index)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
      </div>
    </div>`;
  }

  private renderZonesTab(): TemplateResult {
    return html`
      ${this.zones.length
        ? html`<ul class="list">
            ${this.zones.map((z, i) => this.renderZoneItem(z, i))}
          </ul>`
        : html`<p class="hint">${this.kannAendern ? "Noch keine Zonen. Mit den Werkzeugen links am Plan zeichnen, z. B. ein Rechteck über das Bett." : "Noch keine Zonen eingezeichnet."}</p>`}
      ${this.kannAendern ? this.renderNewZone() : nothing}`;
  }

  private renderNewZone(): TemplateResult {
    return html`<h3>Neue Zone</h3>
      <div class="actions">
        <button class="text small" @click=${() => this.setTool("rechteck")}><ha-icon icon="mdi:rectangle-outline"></ha-icon>Rechteck</button>
        <button class="text small" @click=${() => this.setTool("vieleck")}><ha-icon icon="mdi:vector-polygon"></ha-icon>Vieleck</button>
        <button class="text small" @click=${() => this.setTool("zellen")}><ha-icon icon="mdi:grid"></ha-icon>Zellen</button>
      </div>
      <div class="actions">
        <button class="text small" @click=${this.importConverter}><ha-icon icon="mdi:import"></ha-icon>Aus dem Konverter übernehmen</button>
      </div>`;
  }

  private renderMelderTab(): TemplateResult {
    const live = this.live;
    const ok = !!live && live.verfuegbar && !live.problem;
    const da = !!live?.zonen[MELDER_ZONE]?.belegt;
    const k = this.kandidaten;
    const name = (id: string) => k?.melder.find((m) => m.id === id || m.entity_id === id)?.name ?? id;
    const auswahl = (k?.melder ?? []).filter((m) => !m.benutzt_von || m.benutzt_von === this.raumId || this.melder.includes(m.id));
    return html`<h3>Melder</h3>
      <ul class="list">
        <li class="item">
          <div class="row static">
            <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
            <span class="name">${this.raum?.name}<small>${ok ? (da ? "jemand da" : "niemand da") : live?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${!ok ? "off unreachable" : da ? "on" : "off"}" style="--zone:var(--rz-bereich)">${!ok ? "nicht erreichbar" : da ? "da" : "leer"}</span>
          </div>
        </li>
      </ul>
      ${this.kannAendern
        ? html`${k
              ? html`<ul class="melder-liste">
                  ${auswahl.map((m) => {
                    const an = this.melder.includes(m.id) || this.melder.includes(m.entity_id);
                    return html`<li>
                      <label class="check"
                        ><input
                          type="checkbox"
                          .checked=${an}
                          @change=${(e: Event) => {
                            const on = (e.target as HTMLInputElement).checked;
                            this.melder = on ? [...this.melder, m.id] : this.melder.filter((x) => x !== m.id && x !== m.entity_id);
                            this.dirty = true;
                          }}
                        /><span>${m.name}<small>${this.bereichName(m.bereich_id)}</small></span></label
                      >
                    </li>`;
                  })}
                </ul>`
              : html`<p class="hint">Lädt …</p>`}
            <label class="field"
              >Nachlauf<input
                type="number"
                min="0"
                max=${this.data?.grenzen.melder_nachlauf_s ?? 3600}
                .value=${String(this.nachlauf)}
                @change=${(e: Event) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  if (!Number.isFinite(v)) return;
                  this.nachlauf = Math.max(0, Math.min(this.data?.grenzen.melder_nachlauf_s ?? 3600, Math.round(v)));
                  this.dirty = true;
                }}
              /><span class="unit">s</span></label
            >
            <div class="summary">
              Der Raum gilt als belegt, solange ein Melder „Bewegung“ meldet, und noch ${10 + this.nachlauf} s danach${this.nachlauf
                ? ` (10 s Haltezeit und ${this.nachlauf} s Nachlauf)`
                : " (Haltezeit)"}. Sind alle Melder nicht erreichbar, bleibt der letzte Stand.
            </div>`
        : html`<ul class="doors">
            ${this.melder.map((m) => html`<li class="door"><ha-icon icon="mdi:motion-sensor"></ha-icon><span>${name(m)}</span></li>`)}
          </ul>`}
      ${this.kannAendern ? this.renderRoomEdit() : nothing}`;
  }

  private renderRoomTab(): TemplateResult {
    if (this.istMelder) return this.renderMelderTab();
    const live = this.live;
    const ok = !!live && live.verfuegbar && !live.problem;
    const age = live?.letzter_rahmen_vor_s;
    const figuren = live ? live.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
    const field = (key: "reichweite_cm" | "oeffnung_grad", label: string, unit: string, min: number, max: number) =>
      html`<label class="field"
        >${label}<input
          type="number"
          min=${min}
          max=${max}
          .value=${String(this.sensor[key])}
          @change=${(e: Event) => {
            const v = Number((e.target as HTMLInputElement).value);
            if (!Number.isFinite(v)) return;
            this.remember();
            this.sensor = { ...this.sensor, [key]: Math.max(min, Math.min(max, v)) };
            this.dirty = true;
          }}
        /><span class="unit">${unit}</span></label
      >`;
    return html`<h3>Sensor</h3>
      <ul class="list">
        <li class="item ${this.sensorOpen ? "open" : ""}">
          <div class="row" @click=${() => (this.sensorOpen = !this.sensorOpen)}>
            <span class="marker-icon"><ha-icon icon="mdi:radar"></ha-icon></span>
            <span class="name">Radarsensor<small>${ok ? "liefert Daten" : live?.problem ?? "nicht erreichbar"}</small></span>
            <span class="badge ${ok ? "on" : "off"}" style="--zone:var(--ok)">${ok ? "live" : "nicht erreichbar"}</span>
          </div>
          ${this.sensorOpen
            ? html`<div class="inspector">
                <dl>
                  <dt>Figuren</dt>
                  <dd>${figuren}</dd>
                  <dt>Letzte Meldung</dt>
                  <dd>${age == null ? "–" : age < 120 ? `vor ${Math.round(age)} s` : `vor ${Math.round(age / 60)} min`}</dd>
                </dl>
                <p class="hint small">Liegt jemand ruhig, meldet der Sensor oft minutenlang nichts. Das ist normal; Raumzonen hält die Figur.</p>
                ${this.kannAendern ? this.renderSensorEdit(field) : nothing}
              </div>`
            : nothing}
        </li>
      </ul>
      ${this.kannAendern ? html`${this.renderWizard()} ${this.renderRoomEdit()}` : nothing}`;
  }

  private renderWizard(): TemplateResult {
    const w = this.wiz;
    if (!w) {
      return html`<h3>Sensor umsetzen</h3>
        <p class="hint small">
          Hängt der Sensor an einer neuen Stelle? Der Assistent rechnet aus drei Stellen im Raum aus, wo er jetzt hängt und wohin er schaut.
          Die Zonen bleiben, wo sie sind.
        </p>
        <div class="actions">
          <button class="text small" @click=${() => this.wizStart("umsetzen")}><ha-icon icon="mdi:map-marker-path"></ha-icon>Vor dem Umhängen starten</button>
          <button class="text small" @click=${() => this.wizStart("einmessen")}><ha-icon icon="mdi:crosshairs-gps"></ha-icon>Sensor hängt schon: einmessen</button>
        </div>`;
    }
    const nr = w.aktiv + 1;
    const m = w.messung;
    const rest = m ? Math.max(0, Math.ceil((m.bis - Date.now()) / 1000)) : 0;
    const messKnopf = (label: string) =>
      m
        ? html`<div class="note">Bitte ruhig stehen … noch ${rest} s${m.hinweis ? html`<br />${m.hinweis}` : nothing}</div>`
        : html`<div class="actions"><span class="spacer"></span><button class="primary" ?disabled=${this.dirty} @click=${this.wizMessen}><ha-icon icon="mdi:human-handsdown"></ha-icon>${label}</button></div>`;
    const punkte = html`<ol class="wiz-stellen">
      ${[0, 1, 2].map((i) => {
        const fertig = w.schritt === "vorher" ? !!w.raum[i] : w.modus === "umsetzen" ? !!w.sensor[i] : !!w.sensor[i] && !!w.raum[i];
        return html`<li class=${fertig ? "fertig" : i === w.aktiv ? "aktiv" : ""}>Stelle ${i + 1}${fertig ? " ✓" : ""}</li>`;
      })}
    </ol>`;
    let inhalt: TemplateResult;
    if (w.schritt === "vorher") {
      inhalt = html`<p class="hint small">
          Allein im Raum: Stell dich auf Stelle ${nr} und tippe auf „Merken“. Die drei Stellen sollen mindestens 1 m auseinander liegen und
          ein Dreieck bilden, z. B. Bettkante, Tür, Fenster. Merk sie dir gut (im Plan als ${nr} markiert).
        </p>
        ${punkte} ${messKnopf(`Stelle ${nr} merken`)}`;
    } else if (w.schritt === "umhaengen") {
      inhalt = html`<p class="hint small">Alle drei Stellen sind gemerkt. Jetzt den Sensor umhängen und neu ausrichten. Danach hier weiter.</p>
        <div class="actions"><span class="spacer"></span><button class="primary" @click=${() => (this.wiz = { ...w, schritt: "nachher", aktiv: 0 })}>Sensor hängt neu</button></div>`;
    } else if (w.schritt === "nachher") {
      const tippen = w.modus === "einmessen" && w.tippen;
      inhalt = tippen
        ? html`<p class="note">Jetzt im Plan antippen, wo du bei Stelle ${nr} gestanden bist.</p>
            ${punkte}`
        : html`<p class="hint small">
              ${w.modus === "umsetzen"
                ? html`Stell dich wieder auf Stelle ${nr} (im Plan markiert) und tippe auf „Messen“.`
                : html`Allein im Raum: Stell dich an eine Stelle, die du im Plan gut findest (z. B. Bettecke, Türmitte), und tippe auf „Messen“.
                    Danach tippst du sie im Plan an. Drei Stellen, mindestens 1 m auseinander, nicht auf einer Linie.`}
            </p>
            ${punkte} ${messKnopf(`Stelle ${nr} messen`)}`;
    } else {
      const e = w.ergebnis!;
      const gut = e.rest_cm <= 15;
      const alt = this.raum!.sensor;
      const weg = Math.round(Math.hypot(e.x - alt.x, e.y - alt.y));
      let dreh = Math.round(((((e.winkel - alt.winkel) % 360) + 540) % 360) - 180);
      if (dreh === -180) dreh = 180;
      const drehText = dreh === 0 ? "gleich ausgerichtet" : `um ${Math.abs(dreh)}° ${dreh > 0 ? "nach links" : "nach rechts"} gedreht`;
      inhalt = html`<p class="summary">
          ${w.modus === "umsetzen" || weg > 0
            ? html`Der Sensor hängt jetzt ${weg < 10 ? "fast an derselben Stelle" : `${weg} cm von der alten Stelle entfernt`} und ist ${drehText}.`
            : nothing}
          Genauigkeit: etwa ± ${Math.max(1, Math.round(e.rest_cm))} cm.
        </p>
        ${gut ? nothing : html`<p class="note warn">Ungenau. Besser noch einmal messen, ruhig stehen und genau dieselben Stellen treffen.</p>`}
        <p class="hint small">Im Plan zeigt der grüne Punkt die neue Lage. Die Zonen bleiben, wo sie im Raum sind.</p>
        <div class="actions">
          <button class="text small" @click=${() => this.wizStart(w.modus)}>Noch einmal</button>
          <span class="spacer"></span>
          <button class="primary" @click=${this.wizUebernehmen}><ha-icon icon="mdi:check"></ha-icon>Übernehmen</button>
        </div>`;
    }
    return html`<div class="neu-raum">
      <h3>${w.modus === "umsetzen" ? "Sensor umsetzen" : "Sensor einmessen"}</h3>
      ${this.dirty && w.schritt !== "ergebnis" ? html`<p class="note warn">Erst speichern oder verwerfen, dann messen.</p>` : nothing}
      ${w.fehler ? html`<p class="note warn">${w.fehler}</p>` : nothing} ${inhalt}
      <div class="actions">
        <button class="text small" @click=${this.wizEnde}>Abbrechen</button>
      </div>
    </div>`;
  }

  private renderSensorEdit(field: (key: "reichweite_cm" | "oeffnung_grad", label: string, unit: string, min: number, max: number) => TemplateResult): TemplateResult {
    return html`<label class="check"
                  ><input type="checkbox" .checked=${this.zonesFollow} @change=${(e: Event) => (this.zonesFollow = (e.target as HTMLInputElement).checked)} /><span
                    >Zonen bewegen sich mit dem Sensor<small
                      >Praktisch beim Ausrichten: Zonen aus dem Konverter hängen am Sensor. Ausschalten, wenn die Zonen schon zum Raum passen und
                      nur der Sensor versetzt wird.</small
                    ></span
                  ></label
                >
                <details class="fine">
                  <summary>Abdeckung</summary>
                  <div class="fields">${field("reichweite_cm", "Reichweite", "cm", 50, 1500)} ${field("oeffnung_grad", "Öffnung", "°", 10, 360)}</div>
                  <p class="hint small">Laut Datenblatt des eigenen Geräts. Die Bewegungskarte zeigt, wo er wirklich sieht.</p>
                </details>`;
  }

  private renderRoomEdit(): TemplateResult {
    return html`${this.istMelder
        ? nothing
        : html`<p class="hint small">
            So richtest du den Sensor ein: Den dunklen Punkt im Plan an die Stelle ziehen, an der er hängt, und am gelben Griff
            drehen, bis die Abdeckung in den Raum zeigt. Am besten mit eingeschalteter Bewegungskarte einmal durch den Raum gehen.
          </p>`}
      <h3>Wände</h3>
      <p class="hint small">
        Der Umriss des Raums dient zur Orientierung. Ecken ziehen; das „+“ in der Mitte einer Wand fügt eine Ecke ein, Rechtsklick
        auf eine Ecke löscht sie.
      </p>
      <div class="actions">
        <button class="text small" @click=${() => this.setTool("umriss")}><ha-icon icon="mdi:wall"></ha-icon>${this.umriss.length ? "Neu zeichnen" : "Wände zeichnen"}</button>
        ${this.umriss.length >= 3
          ? html`<button class="text small" @click=${() => this.setTool("oeffnung")}><ha-icon icon="mdi:door"></ha-icon>Tür / Öffnung</button>`
          : nothing}
        ${this.umriss.length
          ? html`<button
              class="text small danger"
              @click=${() => {
                this.remember();
                this.umriss = [];
                this.oeffnungen = [];
                this.selOpening = -1;
                this.dirty = true;
              }}
            >
              Entfernen
            </button>`
          : nothing}
      </div>
      ${this.oeffnungen.length
        ? html`<ul class="list">
            ${this.oeffnungen.map(
              (o, i) => html`<li class="item ${i === this.selOpening ? "open" : ""}">
                <div class="row" @click=${() => (this.selOpening = i === this.selOpening ? -1 : i)}>
                  <ha-icon icon=${o.art === "tuer" ? "mdi:door" : "mdi:door-open"}></ha-icon>
                  <span class="name">${o.art === "tuer" ? "Tür" : "Offen"}<small>${Math.round(o.bis - o.von)} cm breit</small></span>
                </div>
                ${i === this.selOpening
                  ? html`<div class="inspector">
                      <div class="levels">
                        ${(["tuer", "offen"] as const).map(
                          (art) => html`<button
                            class=${o.art === art ? "active" : ""}
                            @click=${() => {
                              this.remember();
                              this.oeffnungen = this.oeffnungen.map((x, k) => (k === i ? { ...x, art } : x));
                              this.dirty = true;
                            }}
                          >
                            ${art === "tuer" ? "Tür" : "Offen (ohne Tür)"}
                          </button>`,
                        )}
                      </div>
                      ${o.art === "tuer"
                        ? html`<div class="actions">
                            <button
                              class="text small"
                              @click=${() => this.changeOpening(i, { anschlag: o.anschlag === "ende" ? "anfang" : "ende" })}
                            >
                              <ha-icon icon="mdi:swap-horizontal"></ha-icon>Anschlag wechseln
                            </button>
                            <button
                              class="text small"
                              @click=${() => this.changeOpening(i, { aufgehen: o.aufgehen === "aussen" ? "innen" : "aussen" })}
                            >
                              <ha-icon icon="mdi:swap-vertical"></ha-icon>${o.aufgehen === "aussen" ? "Nach innen aufgehen" : "Nach außen aufgehen"}
                            </button>
                          </div>`
                        : nothing}
                      <p class="hint small">
                        Breite: die Punkte an den Enden ziehen; verschieben: die Öffnung selbst ziehen. Wohin sie führt, stellst du im Hausplan ein.${this.istMelder
                          ? ""
                          : " Damit Raumzonen „betreten“ und „verlassen“ genau erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor zeichnen."}
                      </p>
                      <div class="actions">
                        <span class="spacer"></span>
                        <button class="text danger" @click=${() => this.deleteOpening(i)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
                      </div>
                    </div>`
                  : nothing}
              </li>`,
            )}
          </ul>`
        : nothing}
      <h3>Aufnahme</h3>
      <label class="check"
        ><input
          type="checkbox"
          .checked=${this.aufnahme}
          @change=${(e: Event) => {
            this.aufnahme = (e.target as HTMLInputElement).checked;
            this.dirty = true;
          }}
        /><span
          >Bewegungen aufzeichnen<small
            >${this.istMelder ? "Speichert, wann die Melder Bewegung melden," : "Speichert die Punkte des Sensors"} lokal in Home Assistant (nicht im Recorder), damit
            Raumzonen Gewohnheiten lernen und Regeln geprüft werden können. Nur Admins können sie abrufen.</small
          ></span
        ></label
      >
      ${this.aufnahme
        ? html`<label class="field"
            >Aufbewahren<input
              type="number"
              min="1"
              max=${this.data?.grenzen.aufnahme_tage ?? 365}
              .value=${String(this.aufnahmeTage)}
              @change=${(e: Event) => {
                const v = Math.round(Number((e.target as HTMLInputElement).value));
                if (!Number.isFinite(v)) return;
                this.aufnahmeTage = Math.max(1, Math.min(this.data?.grenzen.aufnahme_tage ?? 365, v));
                this.dirty = true;
              }}
            /><span class="unit">Tage</span></label
          >`
        : nothing}
      <h3>Raum löschen</h3>
      <div class="actions">
        <button class="text danger" ?disabled=${this.saving} @click=${this.deleteRoom}><ha-icon icon="mdi:delete-outline"></ha-icon>Raum löschen</button>
      </div>`;
  }

  private renderHausSide(): TemplateResult {
    const raeume = this.data?.raeume ?? [];
    const sel = raeume.find((r) => r.id === this.hausSel);
    const turn = (deg: number, icon: string, label: string) =>
      html`<button class="text small" @click=${() => this.turnRoom(sel!.id, deg)}><ha-icon icon=${icon}></ha-icon>${label}</button>`;
    const doorRow = (raum: Raum, tuer: Tuer) => {
      const key = tuer.key;
      const ziel = this.tueren[key] ?? "";
      const andere = raeume.filter((x) => x.id !== raum.id);
      if (!this.kannAendern) {
        const text = ziel === "aussen" ? "nach draußen" : ziel ? (andere.find((x) => x.id === ziel)?.name ?? "weiß nicht") : "weiß nicht";
        return html`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${tuer.name}: ${text}</span></li>`;
      }
      return html`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <label class="field"
          >${tuer.name} führt zu<select
            @change=${(e: Event) => {
              this.tueren = { ...this.tueren, [key]: (e.target as HTMLSelectElement).value };
              this.dirty = true;
            }}
          >
            <option value="" ?selected=${!ziel}>weiß nicht</option>
            <option value="aussen" ?selected=${ziel === "aussen"}>draußen / Raum ohne Raumzonen</option>
            ${andere.map((x) => html`<option value=${x.id} ?selected=${ziel === x.id}>${x.name}</option>`)}
          </select></label
        >
      </li>`;
    };
    return html`<aside class="side">
      <div class="side-body">
        <h3>Hausplan</h3>
        <p class="hint small">
          ${this.kannAendern
            ? "Räume am Plan an ihren Platz ziehen und hier drehen. Bei jeder Tür eintragen, wohin sie führt; dann sieht Raumzonen, wer von wo nach wo geht."
            : "So liegen die Räume im Haus. Die Punkte zeigen, wo gerade jemand ist."}
        </p>
        ${this.kannAendern ? html`${this.renderNeuRaum()} ${this.renderPlanImport()}` : nothing}
        <ul class="list">
          ${raeume.map((raum) => {
            const live = this.hausLive[raum.id];
            const n = live ? live.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
            const open = raum.id === this.hausSel;
            const doors = tuerenVon(raum);
            const melder = raum.art === "melder";
            const da = melder ? !!live?.zonen[MELDER_ZONE]?.belegt : n > 0;
            const erreichbar = !!live && live.verfuegbar && !live.problem;
            return html`<li class="item ${open ? "open" : ""}">
              <div class="row" @click=${() => (this.hausSel = open ? "" : raum.id)}>
                <span class="marker-icon"><ha-icon icon=${melder ? "mdi:motion-sensor" : "mdi:radar"}></ha-icon></span>
                <span class="name">${raum.name}<small>${melder ? "Bewegungsmelder" : "Radarsensor"}${raum.haus_gesetzt || this.dirty ? "" : " · noch nicht eingeordnet"}</small></span>
                <span class="badge ${!erreichbar ? "off unreachable" : da ? "on" : "off"}">${!erreichbar ? "nicht erreichbar" : melder ? (da ? "da" : "leer") : n ? `${n}` : "leer"}</span>
              </div>
              ${open
                ? html`<div class="inspector">
                    ${this.kannAendern && sel
                      ? html`<div class="label-text">Drehen</div>
                          <div class="actions">
                            ${turn(90, "mdi:rotate-left", "90°")} ${turn(-90, "mdi:rotate-right", "90°")} ${turn(5, "mdi:rotate-left", "5°")}
                            ${turn(-5, "mdi:rotate-right", "5°")}
                          </div>`
                      : nothing}
                    ${doors.length
                      ? html`<div class="label-text">Türen</div>
                          <ul class="doors">
                            ${doors.map((t) => doorRow(raum, t))}
                          </ul>`
                      : html`<p class="hint small">Keine Tür eingezeichnet. Im Raum mit dem Werkzeug „Tür oder Öffnung“ in eine Wand zeichnen${melder ? "" : " oder eine Zone mit der Rolle „Tür“ anlegen"}.</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(raum.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>`
                : nothing}
            </li>`;
          })}
        </ul>
        ${this.kannAendern ? html`${this.renderPlanListe()} ${this.renderProfil()}` : nothing}
      </div>
    </aside>`;
  }

  private renderPlanListe(): TemplateResult | typeof nothing {
    const plaene = this.data?.plaene ?? [];
    if (!plaene.length) return nothing;
    return html`<h3>Grundrisse</h3>
      <ul class="list">
        ${plaene.map(
          (p) => html`<li class="item">
            <div class="row static">
              <span class="marker-icon"><ha-icon icon="mdi:image-outline"></ha-icon></span>
              <span class="name">${p.name}<small>${this.planBilder[p.id] ? "im Hintergrund" : "Bild fehlt"}</small></span>
              <button class="text small danger" ?disabled=${this.saving} @click=${() => this.planLoeschen(p)}><ha-icon icon="mdi:delete-outline"></ha-icon>Löschen</button>
            </div>
          </li>`,
        )}
      </ul>`;
  }

  private async planLoeschen(p: Plan): Promise<void> {
    if (!this._hass || !confirm(`Grundriss „${p.name}“ löschen? Wände und Türen der Räume bleiben, nur das Bild im Hintergrund verschwindet.`)) return;
    this.saving = true;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/plan/delete`, plan_id: p.id });
      const url = this.planBilder[p.id];
      if (url) URL.revokeObjectURL(url);
      const { [p.id]: _weg, ...rest } = this.planBilder;
      this.planBilder = rest;
      this.showToast("Grundriss gelöscht.");
      await new Promise((res) => window.setTimeout(res, 1500));
      await this.load();
    } catch (err) {
      this.showToast(`Nicht gelöscht: ${fehlerText(err)}`);
    } finally {
      this.saving = false;
    }
  }

  private renderPlanImport(): TemplateResult {
    const p = this.plan;
    if (!p) {
      return html`<div class="actions">
        <label class="text small file-knopf">
          <ha-icon icon="mdi:file-image-outline"></ha-icon>${this.planLaedt ? "Liest …" : "Grundriss übernehmen"}
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            ?disabled=${this.planLaedt || this.dirty}
            @change=${(e: Event) => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) void this.planLaden(f);
              (e.target as HTMLInputElement).value = "";
            }}
          />
        </label>
      </div>`;
    }
    const k = this.planCmProPx();
    const raeume = this.data?.raeume ?? [];
    const masz = (i: number) => {
      if (!k) return "Größe: erst ein Maß eingeben";
      const b = bbox(p.g.raeume[i].punkte);
      const f = (v: number) => (v / 100).toFixed(1).replace(".", ",");
      return `ca. ${f((b.x1 - b.x0) * k)} × ${f((b.y1 - b.y0) * k)} m`;
    };
    const set = (patch: Partial<NonNullable<typeof this.plan>>) => (this.plan = { ...p, ...patch });
    const mitte = (pts: Point[]): Point => formCenter({ art: "vieleck", punkte: pts });
    const tippen = (e: MouseEvent) => {
      const box = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
      const pt: Point = [((e.clientX - box.left) / box.width) * p.g.breite, ((e.clientY - box.top) / box.height) * p.g.hoehe];
      set({ strecke: p.strecke.length >= 2 ? [pt] : [...p.strecke, pt] });
    };
    const r0 = p.g.breite / 120;
    const strecke = svg`${p.strecke.length === 2
      ? svg`<line class="plan-strecke" x1=${p.strecke[0][0]} y1=${p.strecke[0][1]} x2=${p.strecke[1][0]} y2=${p.strecke[1][1]} stroke-width=${r0 / 1.5} />`
      : nothing}${p.strecke.map(([x, y]) => svg`<circle class="plan-strecke" cx=${x} cy=${y} r=${r0} />`)}`;
    const vorschau = svg`<svg class="plan-vorschau" viewBox="0 0 ${p.g.breite} ${p.g.hoehe}" @click=${tippen}>
      <image href=${p.bild} x="0" y="0" width=${p.g.breite} height=${p.g.hoehe} opacity="0.55" />
      ${p.g.raeume.map((r, i) => {
        const [cx, cy] = mitte(r.punkte);
        const on = !!p.zuordnung[i];
        return svg`<polygon class="plan-raum ${on ? "on" : ""}" points=${r.punkte.map((q) => q.join(",")).join(" ")} />
          <circle class="plan-nr" cx=${cx} cy=${cy} r=${p.g.breite / 40} /><text class="plan-nr" x=${cx} y=${cy} dy="0.35em" font-size=${p.g.breite / 30}>${i + 1}</text>`;
      })}
      ${p.g.luecken.map((l, li) => {
        const pts = p.g.raeume[l.raum].punkte;
        const a = pts[l.kante];
        const b = pts[(l.kante + 1) % pts.length];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const at = (t: number) => [a[0] + ((b[0] - a[0]) * t) / len, a[1] + ((b[1] - a[1]) * t) / len];
        const [x1, y1] = at(l.von_px);
        const [x2, y2] = at(l.bis_px);
        return svg`<line class="plan-luecke ${p.art[li]}" x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke-width=${p.g.breite / 150} />`;
      })}
      ${strecke}
    </svg>`;
    const zugeordnet = p.zuordnung.filter(Boolean);
    const doppelt = zugeordnet.length !== new Set(zugeordnet).size;
    return html`<div class="neu-raum">
      <h3>Grundriss übernehmen</h3>
      <p class="hint small">
        ${p.g.raeume.length
          ? `${p.g.raeume.length} ${p.g.raeume.length === 1 ? "Raum" : "Räume"} erkannt. Grün sind Türen, grau Fenster. Übernommen werden Wände, Türen, die Lage im Haus und das Bild als Hintergrund (es bleibt in deinem Home Assistant).`
          : "Keine Räume erkannt (dafür braucht es die blauen Umrisslinien eines Scans). Das Bild lässt sich trotzdem als Hintergrund übernehmen; die Wände zeichnest du dann darüber."}
      </p>
      ${vorschau}
      <div class="label-text">Maßstab: zweimal ins Bild tippen (Anfang und Ende einer bekannten Strecke), dann ihre Länge</div>
      <div class="mass">
        <span>${p.strecke.length === 2 ? "Strecke ist" : `${p.strecke.length} von 2 Punkten`}</span>
        <label class="field"
          ><input
            type="number"
            min="0.2"
            max="100"
            step="0.01"
            ?disabled=${p.strecke.length !== 2}
            .value=${p.streckeM ? String(p.streckeM) : ""}
            placeholder="z. B. 4,20"
            @change=${(e: Event) => set({ streckeM: Number((e.target as HTMLInputElement).value.replace(",", ".")) || 0 })}
          /><span class="unit">m</span></label
        >
      </div>
      ${p.g.raeume.length ? html`<div class="label-text">oder über einen erkannten Raum</div>` : nothing}
      <div class="mass" style=${p.g.raeume.length ? "" : "display:none"}>
        <select @change=${(e: Event) => set({ massRaum: Number((e.target as HTMLSelectElement).value) })}>
          ${p.g.raeume.map((_, i) => html`<option value=${i} ?selected=${p.massRaum === i}>Raum ${i + 1}</option>`)}
        </select>
        <span>ist innen</span>
        <select @change=${(e: Event) => set({ massSeite: (e.target as HTMLSelectElement).value as "breite" | "tiefe" })}>
          <option value="breite" ?selected=${p.massSeite === "breite"}>von links nach rechts</option>
          <option value="tiefe" ?selected=${p.massSeite === "tiefe"}>von oben nach unten</option>
        </select>
        <label class="field"
          ><input
            type="number"
            min="0.5"
            max="50"
            step="0.01"
            .value=${p.massM ? String(p.massM) : ""}
            placeholder="z. B. 4,20"
            @change=${(e: Event) => set({ massM: Number((e.target as HTMLInputElement).value.replace(",", ".")) || 0 })}
          /><span class="unit">m</span></label
        >
      </div>
      <ul class="list">
        ${p.g.raeume.map(
          (_, i) => html`<li class="item">
            <div class="row static">
              <span class="marker-icon"><b>${i + 1}</b></span>
              <span class="name">Raum ${i + 1}<small>${masz(i)}</small></span>
              <select
                @change=${(e: Event) => {
                  const z = [...p.zuordnung];
                  z[i] = (e.target as HTMLSelectElement).value;
                  set({ zuordnung: z });
                }}
              >
                <option value="" ?selected=${!p.zuordnung[i]}>nicht übernehmen</option>
                ${raeume.map((r) => html`<option value=${r.id} ?selected=${p.zuordnung[i] === r.id}>${r.name}</option>`)}
              </select>
            </div>
            ${p.g.luecken
              .map((l, li) => ({ l, li }))
              .filter(({ l }) => l.raum === i)
              .map(
                ({ l, li }) => html`<div class="row static luecke">
                  <ha-icon icon="mdi:door"></ha-icon>
                  <span class="name"
                    >${k ? `${((l.bis_px - l.von_px) * k / 100).toFixed(2).replace(".", ",")} m breit` : "Lücke"}<small
                      >${l.partner !== null ? `zu Raum ${l.partner + 1}` : "Außenwand"}</small
                    ></span
                  >
                  <select @change=${(e: Event) => set({ art: { ...p.art, [li]: (e.target as HTMLSelectElement).value as "tuer" | "offen" | "fenster" } })}>
                    <option value="tuer" ?selected=${p.art[li] === "tuer"}>Tür</option>
                    <option value="offen" ?selected=${p.art[li] === "offen"}>offen</option>
                    <option value="fenster" ?selected=${p.art[li] === "fenster"}>Fenster (weglassen)</option>
                  </select>
                </div>`,
              )}
          </li>`,
        )}
      </ul>
      ${raeume.some((r) => p.zuordnung.includes(r.id) && r.art !== "melder")
        ? html`<p class="note">Bei Räumen mit Radarsensor danach den Sensor einmessen (Sensor und Raum → Sensor umsetzen), damit er zu den neuen Wänden passt.</p>`
        : nothing}
      ${doppelt ? html`<p class="note warn">Jeder Raum nur einmal zuordnen.</p>` : nothing}
      ${!raeume.length ? html`<p class="hint small">Zuerst Räume anlegen (Raum hinzufügen), dann hier zuordnen.</p>` : nothing}
      <div class="actions">
        <button class="text small" @click=${this.planZu}>Abbrechen</button>
        <span class="spacer"></span>
        <button class="primary" ?disabled=${!k || doppelt || this.saving} @click=${this.planUebernehmen}>
          <ha-icon icon="mdi:check"></ha-icon>${zugeordnet.length ? "Übernehmen" : "Als Hintergrund übernehmen"}
        </button>
      </div>
    </div>`;
  }

  private renderNeuRaum(): TemplateResult {
    const k = this.kandidaten;
    const f = this.neuRaum;
    if (!f) {
      return html`<div class="actions">
        <button
          class="text small"
          @click=${() => {
            this.neuRaum = { name: "", art: "melder", melder: [], device_id: "", bereich_id: "" };
            void this.loadKandidaten();
          }}
        >
          <ha-icon icon="mdi:plus"></ha-icon>Raum hinzufügen
        </button>
      </div>`;
    }
    const set = (patch: Partial<NonNullable<typeof this.neuRaum>>) => (this.neuRaum = { ...f, ...patch });
    const vorschlaege = k?.vorschlaege ?? [];
    const freieGeraete = (k?.fp400 ?? []).filter((g) => !g.benutzt);
    const ok = f.name.trim() && (f.art === "melder" ? f.melder.length > 0 : !!f.device_id);
    const melderZeile = (m: Kandidaten["melder"][number]) => {
      const an = f.melder.includes(m.id);
      return html`<li>
        <label class="check"
          ><input
            type="checkbox"
            .checked=${an}
            ?disabled=${!!m.benutzt_von && !an}
            @change=${(e: Event) => {
              const on = (e.target as HTMLInputElement).checked;
              const melder = on ? [...f.melder, m.id] : f.melder.filter((x) => x !== m.id);
              set({ melder, bereich_id: f.bereich_id || (on ? m.bereich_id ?? "" : f.bereich_id) });
            }}
          /><span
            >${m.name}<small
              >${this.bereichName(m.bereich_id)} · ${m.klasse === "motion" ? "Bewegung" : "Anwesenheit"}${m.benutzt_von
                ? ` · schon in „${this.data?.raeume.find((r) => r.id === m.benutzt_von)?.name ?? m.benutzt_von}“`
                : ""}</small
            ></span
          ></label
        >
      </li>`;
    };
    return html`<div class="neu-raum">
      <h3>Raum hinzufügen</h3>
      ${!k
        ? html`<p class="hint">Lädt …</p>`
        : html`${vorschlaege.length
              ? html`<div class="label-text">Aus Home Assistant übernehmen</div>
                  <ul class="list">
                    ${vorschlaege.map(
                      (v) => html`<li class="item">
                        <div class="row static">
                          <span class="marker-icon"><ha-icon icon="mdi:motion-sensor"></ha-icon></span>
                          <span class="name">${v.name}<small>${v.melder.length} ${v.melder.length === 1 ? "Melder" : "Melder"} in diesem Bereich</small></span>
                          <button class="text small" ?disabled=${this.saving} @click=${() => this.createRoom({ name: v.name, art: "melder", melder: v.melder, bereich_id: v.bereich_id })}>
                            Übernehmen
                          </button>
                        </div>
                      </li>`,
                    )}
                  </ul>`
              : nothing}
            <div class="label-text">Selbst anlegen</div>
            <label class="field">Name<input type="text" .value=${f.name} maxlength="60" @input=${(e: Event) => set({ name: (e.target as HTMLInputElement).value })} /></label>
            <div class="levels" role="group" aria-label="Art des Raums">
              <button class=${f.art === "melder" ? "active" : ""} @click=${() => set({ art: "melder" })}><ha-icon icon="mdi:motion-sensor"></ha-icon>Bewegungsmelder</button>
              <button class=${f.art === "radar" ? "active" : ""} @click=${() => set({ art: "radar" })}><ha-icon icon="mdi:radar"></ha-icon>Radarsensor FP400</button>
            </div>
            ${f.art === "melder"
              ? k.melder.length
                ? html`<ul class="melder-liste">
                    ${k.melder.map(melderZeile)}
                  </ul>`
                : html`<p class="hint small">Keine Bewegungs- oder Präsenzmelder in Home Assistant gefunden.</p>`
              : freieGeraete.length
                ? html`<label class="field"
                    >Gerät<select @change=${(e: Event) => set({ device_id: (e.target as HTMLSelectElement).value })}>
                      <option value="" ?selected=${!f.device_id}>bitte wählen</option>
                      ${freieGeraete.map((g) => html`<option value=${g.device_id} ?selected=${f.device_id === g.device_id}>${g.name}</option>`)}
                    </select></label
                  >`
                : html`<p class="hint small">Kein freier FP400 gefunden (alle sind schon einem Raum zugeordnet).</p>`}
            <label class="field"
              >Bereich in Home Assistant<select @change=${(e: Event) => set({ bereich_id: (e.target as HTMLSelectElement).value })}>
                <option value="" ?selected=${!f.bereich_id}>keiner</option>
                ${k.bereiche.map((b) => html`<option value=${b.bereich_id} ?selected=${f.bereich_id === b.bereich_id}>${b.name}</option>`)}
              </select></label
            >
            ${this.dirty ? html`<p class="note warn">Erst den Hausplan speichern oder verwerfen.</p>` : nothing}`}
      <div class="actions">
        <button class="text small" @click=${() => (this.neuRaum = null)}>Abbrechen</button>
        <span class="spacer"></span>
        <button class="primary" ?disabled=${!ok || this.saving || this.dirty} @click=${() => this.createRoom(f)}><ha-icon icon="mdi:plus"></ha-icon>Anlegen</button>
      </div>
    </div>`;
  }

  /** Bewegungsprofil des Hauses: je Raum eine Zeitleiste, dazu die Wechsel. */
  private renderProfil(): TemplateResult {
    const p = this.profil;
    const raeume = this.data?.raeume ?? [];
    const name = (id: string) => raeume.find((r) => r.id === id)?.name ?? id;
    const leiste = (abschnitte: [number, number][]) => {
      const span = Math.max(1, p!.bis - p!.von);
      return html`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
        <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
        ${abschnitte.map(([a, b]) => svg`<rect x=${(((a - p!.von) / span) * 1000).toFixed(1)} y="0" width=${Math.max(3, ((b - a) / span) * 1000).toFixed(1)} height="10" fill="var(--rz-bereich)" />`)}
      </svg>`;
    };
    const w = p ? wechsel(p.raeume).slice(-12).reverse() : [];
    return html`<h3>Bewegungsprofil</h3>
      <div class="label-text">Wann war wo jemand? Die letzten</div>
      <div class="levels" role="group" aria-label="Zeitraum">
        <button class=${this.profilStunden === 0 ? "active" : ""} @click=${() => this.loadProfil(0)}>aus</button>
        ${AUSWERTUNG_STUNDEN.map((h) => html`<button class=${this.profilStunden === h ? "active" : ""} @click=${() => this.loadProfil(h)}>${h} h</button>`)}
      </div>
      ${this.profilLaedt
        ? html`<p class="hint">Rechnet …</p>`
        : p
          ? html`<ul class="list ausw">
                ${raeume.map((r) => {
                  const ab = p.raeume[r.id];
                  return html`<li class="item" style="--zone:var(--rz-bereich)">
                    <div class="row static">
                      <span class="name">${r.name}<small>${ab ? (ab.length ? `${ab.length}-mal` : "niemand") : "keine Aufnahme"}</small></span>
                      <span class="dauer">${ab?.length ? dauer(summeDauer(ab)) : ""}</span>
                    </div>
                    ${ab ? leiste(ab) : nothing}
                  </li>`;
                })}
              </ul>
              <div class="achse"><span>${this.uhr(p.von)}</span><span>${this.uhr(p.bis)}</span></div>
              ${w.length
                ? html`<div class="label-text">Letzte Wechsel zwischen Räumen</div>
                    <ul class="doors">
                      ${w.map((x) => html`<li class="door"><ha-icon icon="mdi:arrow-right"></ha-icon><span>${this.uhr(x.zeit)} ${name(x.von)} → ${name(x.nach)}</span></li>`)}
                    </ul>`
                : nothing}
              <p class="hint small">
                Ein Wechsel heißt: In einem Raum endet die Bewegung, im anderen beginnt sie kurz danach. Welche Person es war, weiß Raumzonen noch nicht;
                das ist der nächste Schritt.
              </p>`
          : nothing}`;
  }

  private uhr(ts: number): string {
    return new Date(ts * 1000).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  }

  /** Zeitleiste: wann im gewählten Zeitraum jemand da war. */
  private renderLeiste(abschnitte: [number, number][], farbe: string): TemplateResult {
    const a = this.ausw!;
    const span = Math.max(1, a.bis - a.von);
    return html`<svg class="leiste" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
      <rect class="leiste-grund" x="0" y="0" width="1000" height="10" rx="2" />
      ${abschnitte.map(([t0, t1]) => {
        const x = ((t0 - a.von) / span) * 1000;
        const w = Math.max(3, ((t1 - t0) / span) * 1000);
        return svg`<rect x=${x.toFixed(1)} y="0" width=${w.toFixed(1)} height="10" fill=${farbe} />`;
      })}
    </svg>`;
  }

  private figurName(f: AuswertungFigur): string {
    if (f.figur === "kurz") return "Kurze Spuren";
    return `${f.hund ? "Hund?" : "Figur"} ${f.nummer}`;
  }

  private renderAuswertungTab(): TemplateResult {
    const a = this.ausw;
    const zoneName = (id: string) => (id === MELDER_ZONE && this.istMelder ? "Jemand da" : this.zones.find((z) => z.id === id)?.name ?? id);
    const zoneFarbe = (id: string) => {
      const z = this.zones.find((zz) => zz.id === id);
      return z ? roleColor(rolleOf(z)) : id === MELDER_ZONE ? "var(--rz-bereich)" : "var(--muted)";
    };
    const stunden = html`<div class="levels" role="group" aria-label="Zeitraum">
      ${AUSWERTUNG_STUNDEN.map(
        (h) => html`<button
          class=${this.auswStunden === h ? "active" : ""}
          @click=${() => {
            this.auswStunden = h;
            void this.loadAuswertung();
          }}
        >
          ${h} h
        </button>`,
      )}
    </div>`;
    const kopf = html`<h3>Wer war wann wo?</h3>
      <div class="label-text">Die letzten</div>
      ${stunden}`;
    if (this.auswFehler === "off") {
      return html`${kopf}<p class="note">Die Aufnahme ist für diesen Raum aus. Einschalten unter <b>Sensor und Raum → Aufnahme</b>; ausgewertet wird ab dann.</p>`;
    }
    if (this.auswFehler) return html`${kopf}<p class="note warn">${this.auswFehler}</p>`;
    if (!a) return html`${kopf}<p class="hint">${this.auswLaedt ? "Rechnet …" : "Noch keine Daten."}</p>`;
    const zonen = a.zonen.filter((z) => z.sekunden > 0).sort((x, y) => y.belegt_s - x.belegt_s);
    const achse = html`<div class="achse"><span>${this.uhr(a.von)}</span><span>${this.uhr(a.bis)}</span></div>`;
    return html`${kopf}
      <p class="hint small">${this.auswLaedt ? "Rechnet …" : `${this.uhr(a.von)} bis ${this.uhr(a.bis)}. Die Karte zeigt, wo jemand war: je dunkler, desto länger. Bei den Zonen steht, wie lange dort jemand war.`}</p>
      <h3>Zonen</h3>
      ${zonen.length
        ? html`<ul class="list ausw">
            ${zonen.map(
              (z) => html`<li class="item" style="--zone:${zoneFarbe(z.zone_id)}">
                <div class="row static">
                  <span class="dot"></span>
                  <span class="name">${zoneName(z.zone_id)}<small
                    >${z.figuren.length
                      ? z.figuren.slice(0, 4).map((k) => this.figurName(a.figuren.find((f) => f.figur === k)!)).join(", ") +
                        (z.figuren.length > 4 ? ` und ${z.figuren.length - 4} weitere` : "")
                      : "nur kurz"}</small
                  ></span>
                  <span class="dauer" title=${z.sekunden > z.belegt_s + 60 ? `Alle Figuren zusammen: ${dauer(z.sekunden)}` : ""}>${dauer(z.belegt_s)}</span>
                </div>
                ${this.renderLeiste(z.abschnitte, "var(--zone)")}
              </li>`,
            )}
          </ul>
          ${achse}`
        : html`<p class="hint">In diesem Zeitraum war niemand in einer Zone.</p>`}
      ${this.istMelder
        ? html`<p class="hint small">Melder kennen keine Position; darum gibt es hier keine Karte und keine Figuren.</p>`
        : html`${this.renderVorschlaege(a)} ${this.renderFiguren(a, zoneName, achse)}`}`;
  }

  /** Wo sich jemand lange aufhielt und noch keine Zone ist: als Zone vorschlagen. */
  private renderVorschlaege(a: Auswertung): TemplateResult | typeof nothing {
    if (!this.kannAendern) return nothing;
    const d = dichte(summe(a.figuren.filter((f) => !f.hund).map((f) => f.zellen)), a.zelle_cm, 8);
    if (!d) return nothing;
    const liste = flecken(d, 600).filter((f) => !this.zones.some((z) => inForm(f.mitte, z.form))).slice(0, 4);
    if (!liste.length) return nothing;
    const m = (cm: number) => (cm / 100).toFixed(1).replace(".", ",");
    return html`<h3>Vorschläge für Zonen</h3>
      <p class="hint small">Hier hielt sich jemand lange auf, aber es ist noch keine Zone. Zum Beispiel ein Liegeplatz, das Sofa oder ein Schreibtisch.</p>
      <ul class="list">
        ${liste.map(
          (f, i) => html`<li class="item">
            <div class="row static">
              <span class="marker-icon"><ha-icon icon="mdi:selection-marker"></ha-icon></span>
              <span class="name">Platz ${i + 1}<small>ca. ${m(f.breite)} × ${m(f.tiefe)} m · ${dauer(f.sekunden)}</small></span>
              <button
                class="text small"
                @click=${() => {
                  this.addZone({ art: "rechteck", mitte: f.mitte, breite: f.breite, tiefe: f.tiefe, winkel: 0 });
                  this.openTab("zonen");
                  this.showToast("Zone angelegt. Rolle wählen, Form anpassen und speichern.");
                }}
              >
                Als Zone anlegen
              </button>
            </div>
          </li>`,
        )}
      </ul>`;
  }

  private renderFiguren(a: Auswertung, zoneName: (id: string) => string, achse: TemplateResult): TemplateResult {
    return html`<h3>Figuren</h3>
      ${a.figuren.length
        ? html`<ul class="list ausw">
            ${a.figuren.map((f) => {
              const on = this.auswFigur === f.figur;
              const farbe = f.hund ? "var(--rz-tier)" : "var(--rz-person)";
              const haupt = Object.keys(f.zonen).slice(0, 2).map(zoneName).join(", ");
              return html`<li class="item ${on ? "open" : ""}" style="--zone:${farbe}">
                <div class="row" role="button" aria-pressed=${on ? "true" : "false"} title="Nur diese Figur auf der Karte zeigen" @click=${() => (this.auswFigur = on ? "" : f.figur)}>
                  <span class="dot"></span>
                  <span class="name">${this.figurName(f)}<small>${this.uhr(f.erst)} bis ${this.uhr(f.zuletzt)}${haupt ? ` · ${haupt}` : ""}</small></span>
                  <span class="dauer">${dauer(f.sekunden)}</span>
                </div>
                ${this.renderLeiste(f.abschnitte, "var(--zone)")}
              </li>`;
            })}
          </ul>
          ${achse}
          <p class="hint small">
            Antippen zeigt nur diese Figur auf der Karte. Eine Figur ist eine Spur vom Auftauchen bis zum Verschwinden. Wer aufsteht und
            später wiederkommt, kann eine neue Nummer bekommen. Welche Person es ist, weiß Raumzonen noch nicht.
          </p>`
        : html`<p class="hint">Keine Figuren in diesem Zeitraum.</p>`}`;
  }

  private renderSide(): TemplateResult {
    if (this.page === "haus") return this.renderHausSide();
    return html`<aside class="side">
      <div class="tabs" role="tablist">
        ${this.istMelder
          ? nothing
          : html`<button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => this.openTab("zonen")}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>`}
        <button class=${this.tab === "raum" ? "active" : ""} role="tab" @click=${() => this.openTab("raum")}><ha-icon icon="mdi:floor-plan"></ha-icon>${this.istMelder ? "Melder und Raum" : "Sensor und Raum"}</button>
        ${this.kannAendern
          ? html`<button class=${this.tab === "auswertung" ? "active" : ""} role="tab" @click=${() => this.openTab("auswertung")}><ha-icon icon="mdi:chart-bubble"></ha-icon>Auswertung</button>`
          : nothing}
      </div>
      <div class="side-body">${this.tab === "zonen" ? this.renderZonesTab() : this.tab === "raum" ? this.renderRoomTab() : this.renderAuswertungTab()}</div>
    </aside>`;
  }

  // -- Ganze Seite ------------------------------------------------------------------

  private renderHeader(): TemplateResult {
    const live = this.live;
    const ok = !!live && live.verfuegbar && !live.problem;
    return html`<header>
      <button class="icon menu" title="Menü" @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }))}>
        <ha-icon icon="mdi:menu"></ha-icon>
      </button>
      <span class="title">Raumzonen</span>
      ${this.data?.raeume.length
        ? html`<nav class="pages">
            <button class=${this.page === "haus" ? "active" : ""} @click=${() => this.openHaus()}><ha-icon icon="mdi:home-outline"></ha-icon>Haus</button>
            ${this.data.raeume.map(
              (r) => html`<button class=${this.page === "raum" && r.id === this.raumId ? "active" : ""} @click=${() => this.selectRoom(r.id)}>${r.name}</button>`,
            )}
          </nav>`
        : nothing}
      ${this.raum && this.page === "raum" ? html`<span class="live-chip ${ok ? "ok" : "down"}" title=${live?.problem ?? ""}><span class="led"></span><span class="text">${ok ? "live" : "nicht erreichbar"}</span></span>` : nothing}
      <span class="spacer"></span>
      ${this.raum && !this.kannAendern ? html`<span class="badge off" title="Ändern dürfen nur Admins">nur ansehen</span>` : nothing}
      ${this.raum && this.kannAendern
        ? html`${this.page === "raum" ? html`<button class="icon" title="Rückgängig (Strg+Z)" ?disabled=${!this.history.size} @click=${this.undo}><ha-icon icon="mdi:undo"></ha-icon></button>` : nothing}
            <button class="text" ?disabled=${!this.dirty || this.saving} @click=${this.discard}><span class="label">Verwerfen</span><ha-icon icon="mdi:close" style=${this.narrow ? "" : "display:none"}></ha-icon></button>
            <button class="primary" ?disabled=${!this.dirty || this.saving} @click=${() => (this.page === "haus" ? this.saveHaus() : this.save())}>
              <ha-icon icon="mdi:content-save-outline"></ha-icon><span class="label">${this.saving ? "Speichert …" : "Speichern"}</span>
            </button>`
        : nothing}
    </header>`;
  }

  protected render(): TemplateResult {
    if (!this.data) {
      return html`${this.renderHeader()}<div class="empty">${this.error ? html`<ha-icon icon="mdi:alert-circle-outline"></ha-icon><p>${this.error}</p>` : html`<p>Lädt …</p>`}</div>`;
    }
    if (!this.data.raeume.length) {
      return html`${this.renderHeader()}
        <div class="empty">
          <ha-icon icon="mdi:floor-plan"></ha-icon>
          <p>
            Noch kein Raum. Einen Raum legst du unter <b>Einstellungen → Geräte &amp; Dienste → Raumzonen → Konfigurieren → Raum
            hinzufügen</b> an. Danach erscheint er hier zum Einzeichnen.
          </p>
        </div>`;
    }
    return html`${this.renderHeader()}
      <div class="layout">${this.renderStage()} ${this.renderSide()}</div>
      ${this.toast ? html`<div class="toast" role="status">${this.toast}</div>` : nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "raumzonen-panel": RaumzonenPanel;
  }
}
