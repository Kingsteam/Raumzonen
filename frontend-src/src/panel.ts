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
  sensorDirection,
  snap,
  toHouse,
  type HausLage,
} from "./geometry";
import { styles } from "./styles";
import type { Form, Hass, Heat, Live, Oeffnung, Point, Raum, Regel, RoomsResult, Zone } from "./types";

const DOMAIN = "raumzonen";
const SNAP_CM = 5;
const HIT_PX = 12;

type Tool = "auswahl" | "rechteck" | "vieleck" | "zellen" | "umriss" | "oeffnung";
type Tab = "zonen" | "raum";
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
  @state() private aufnahmeTage = 30;

  private _hass?: Hass;
  private history = new History<Snapshot>();
  private drag: Drag | null = null;
  private unsubLive?: () => Promise<void>;
  private liveRoom = "";
  private heatTimer?: number;
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
      this.error = "";
      const keep = data.raeume.some((r) => r.id === this.raumId);
      if (this.page === "haus" && data.raeume.length) {
        this.raumId = keep ? this.raumId : data.raeume[0].id;
        this.openHaus(true);
      } else {
        this.selectRoom(keep ? this.raumId : data.raeume[0]?.id ?? "", true);
      }
    } catch (err) {
      this.error = `Laden fehlgeschlagen: ${(err as Error).message ?? err}`;
    }
  }

  /** Nur Admins dürfen ändern; alle anderen sehen nur zu. */
  private get kannAendern(): boolean {
    return this.data?.darf_aendern !== false;
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
    const problem = zonesProblem(this.zones);
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
        zonen: this.zones,
        sensor: this.sensor,
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
      this.showToast(`Nicht gespeichert: ${(err as Error).message ?? err}`);
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
      this.showToast(`Konverter-Zonen nicht lesbar: ${(err as Error).message ?? err}`);
    }
  }

  // -- Hausplan -------------------------------------------------------------

  private outlineOf(raum: Raum): Point[] {
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
    for (const r of raeume) for (const z of r.zonen) if (z.art === "ausgang" && z.id) tueren[`${r.id}/${z.id}`] = z.fuehrt_zu ?? "";
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

  private async saveHaus(): Promise<void> {
    if (!this._hass || !this.data || !this.kannAendern) return;
    this.saving = true;
    try {
      const tueren = Object.entries(this.tueren)
        .filter(([key, ziel]) => {
          const [rid, zid] = key.split("/");
          const zone = this.data!.raeume.find((r) => r.id === rid)?.zonen.find((z) => z.id === zid);
          return (zone?.fuehrt_zu ?? "") !== ziel;
        })
        .map(([key, ziel]) => {
          const [raum_id, zone_id] = key.split("/");
          return { raum_id, zone_id, fuehrt_zu: ziel || null };
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
      this.showToast(`Nicht gespeichert: ${(err as Error).message ?? err}`);
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
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.onKey);
    window.clearInterval(this.heatTimer);
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
      this.tab = "zonen";
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

    // Auswählen: Griffe der gewählten Zone, dann Sensor, Zonen, Wände, Ansicht.
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
    if (this.near(raw, this.sensorHandle(), HIT_PX + 2)) {
      this.remember();
      this.sensorAnchor = { sensor: { ...this.sensor }, zones: this.zones };
      this.drag = { kind: "sensor-rotate" };
      this.openSensor();
      return;
    }
    if (this.near(raw, [this.sensor.x, this.sensor.y], HIT_PX + 4)) {
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
        this.tab = "raum";
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
    this.tab = "raum";
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
        this.tab = "raum";
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
    return svg`<polygon class="floor" points=${pts} />
      <polygon class="wall" points=${pts} />
      ${openings.map((o, i) => this.renderOpening(o, i === this.selOpening || o === this.openingDraft, inside))}
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
    // Türblatt an Ecke a, senkrecht zur Wand in den Raum, Bogen bis b.
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let nx = -(by - ay) / len;
    let ny = (bx - ax) / len;
    const [ix, iy] = this.toScreen(inside);
    if ((ix - ax) * nx + (iy - ay) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    const lx = ax + nx * len;
    const ly = ay + ny * len;
    const sweep = (bx - ax) * ny - (by - ay) * nx > 0 ? 0 : 1;
    return svg`<g class="opening ${selected ? "selected" : ""}">${gap}
      <line class="door-leaf" x1=${ax} y1=${ay} x2=${lx} y2=${ly} />
      <path class="door-arc" d="M ${lx} ${ly} A ${len} ${len} 0 0 ${sweep} ${bx} ${by}" /></g>`;
  }

  /** Kleines „+“: hier einen Punkt einfügen. */
  private renderPlus(p: Point): TemplateResult {
    const [x, y] = this.toScreen(p);
    return svg`<g class="plus"><circle cx=${x} cy=${y} r="6" /><path d="M ${x - 3} ${y} H ${x + 3} M ${x} ${y - 3} V ${y + 3}" /></g>`;
  }

  private renderHeat(): TemplateResult | typeof nothing {
    if (!this.heat?.zellen.length) return nothing;
    const max = Math.max(...this.heat.zellen.map((c) => c[2]));
    const s = this.heat.zelle_cm;
    return svg`<g>${this.heat.zellen.map(([i, j, sec]) => {
      const [sx, sy] = this.toScreen([i * s, (j + 1) * s]);
      const a = Math.min(0.8, 0.12 + Math.log1p(sec) / Math.log1p(max));
      return svg`<rect x=${sx} y=${sy} width=${this.px(s) + 0.5} height=${this.px(s) + 0.5} fill="rgba(var(--rz-heat), ${a.toFixed(2)})" />`;
    })}</g>`;
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
  private doorCenter(raum: Raum, zone: Zone): Point | null {
    const lage = this.lagen[raum.id];
    return lage ? toHouse(formCenter(zone.form), lage) : null;
  }

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
      rooms.push(svg`<polygon class="floor" points=${this.screenPoints(outline)} />
        <polygon class="wall ${raum.umriss.length >= 3 ? "" : "guess"} ${sel ? "selected" : ""}" points=${this.screenPoints(outline)} />`);
      for (const zone of raum.zonen) {
        const rolle = rolleOf(zone);
        if (rolle === "ignorieren") continue;
        const occupied = (zone.id ? live?.zonen[zone.id]?.belegt : false) ?? false;
        const pts = formPoints(zone.form).map((p) => toHouse(p, lage));
        rooms.push(svg`<polygon class="zone-shape" points=${this.screenPoints(pts)} fill=${roleColor(rolle)} fill-opacity=${occupied ? 0.5 : 0.18} stroke=${roleColor(rolle)} />`);
        if (zone.art !== "ausgang" || !zone.id) continue;
        // Wohin führt die Tür? Linie zur passenden Tür im anderen Raum.
        const ziel = this.tueren[`${raum.id}/${zone.id}`] ?? "";
        const from = this.doorCenter(raum, zone);
        if (!from) continue;
        const [fx, fy] = this.toScreen(from);
        if (ziel === "aussen") {
          labels.push(svg`<text class="label sub" x=${fx} y=${fy - 10}>nach draußen</text>`);
        } else if (ziel) {
          const other = raeume.find((x) => x.id === ziel);
          if (!other || raum.id > other.id) continue; // jede Verbindung nur einmal
          const back = other.zonen.find((z) => z.art === "ausgang" && z.id && this.tueren[`${other.id}/${z.id}`] === raum.id);
          const ol = this.lagen[other.id];
          const to = back ? this.doorCenter(other, back) : ol ? toHouse(formCenter({ art: "vieleck", punkte: this.outlineOf(other) }), ol) : null;
          if (!to) continue;
          const [tx, ty] = this.toScreen(to);
          lines.push(svg`<line class="link" x1=${fx} y1=${fy} x2=${tx} y2=${ty} />
            <circle class="link-dot" cx=${fx} cy=${fy} r="5" /><circle class="link-dot" cx=${tx} cy=${ty} r="5" />`);
        }
      }
      const [cx, cy] = this.toScreen(formCenter({ art: "vieleck", punkte: outline }));
      const n = live ? live.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
      labels.push(svg`<text class="label room" x=${cx} y=${cy}>${raum.name}</text>
        <text class="label sub" x=${cx} y=${cy + 16}>${live ? (n ? `${n} ${n === 1 ? "Person" : "Personen"}` : "niemand") : "nicht erreichbar"}</text>`);
      for (const f of live?.figuren ?? []) {
        if (f.tags.includes("wiederhergestellt") || f.tags.includes("stoerung")) continue;
        const tier = f.tags.includes("hund") || f.art === "pet";
        const color = tier ? "var(--rz-tier)" : "var(--rz-person)";
        const [x, y] = this.toScreen(toHouse([f.x, f.y], lage));
        const rr = Math.max(6, this.px(14));
        figures.push(svg`<circle class="figure ${f.gehalten ? "held" : ""}" cx=${x} cy=${y} r=${rr} fill=${color} stroke=${f.gehalten ? color : "var(--card)"} />`);
      }
    }
    return svg`${rooms}${lines}${figures}${labels}`;
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
      <p class="hint small">Zählt seit dem letzten Neustart von Home Assistant.</p>
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
          : svg`${this.renderRoom()} ${this.renderHeat()} ${this.renderCoverage()}
              ${this.zones.map((z, i) => this.renderZone(z, i))} ${this.renderLive()}
              ${this.zones.map((z) => this.renderZoneLabel(z))} ${this.renderSensor()}
              ${this.renderHandles()} ${this.renderDraft()}`}
      </svg>
      <div class="tools" role="toolbar" aria-label="Werkzeuge" @pointerdown=${(e: Event) => e.stopPropagation()}>
        ${this.kannAendern && this.page === "raum"
          ? html`${TOOLS.map(
                (t) => html`<button class="icon ${this.tool === t.tool ? "on" : ""}" title=${t.label} aria-label=${t.label} @click=${() => this.setTool(t.tool)}>
                  <ha-icon icon=${t.icon}></ha-icon>
                </button>`,
              )}
              <span class="sep"></span>`
          : nothing}
        ${this.page === "raum"
          ? html`<button class="icon ${this.layersOpen ? "on" : ""}" title="Ebenen und Bewegungskarte" aria-label="Ebenen" @click=${() => (this.layersOpen = !this.layersOpen)}>
                <ha-icon icon="mdi:layers-outline"></ha-icon>
              </button>
              <span class="sep"></span>`
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

  private renderRoomTab(): TemplateResult {
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
      ${this.kannAendern ? this.renderRoomEdit() : nothing}`;
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
    return html`<p class="hint small">
        So richtest du den Sensor ein: Den dunklen Punkt im Plan an die Stelle ziehen, an der er hängt, und am gelben Griff
        drehen, bis die Abdeckung in den Raum zeigt. Am besten mit eingeschalteter Bewegungskarte einmal durch den Raum gehen.
      </p>
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
                      <p class="hint small">
                        Nur zur Anzeige. Damit Raumzonen „betreten“ und „verlassen“ erkennt, zusätzlich eine Zone mit der Rolle „Tür“ davor
                        zeichnen.
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
            >Speichert die Punkte des Sensors lokal in Home Assistant (nicht im Recorder), damit Raumzonen Gewohnheiten lernen und Regeln
            geprüft werden können. Nur Admins können sie abrufen.</small
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
        : nothing}`;
  }

  private renderHausSide(): TemplateResult {
    const raeume = this.data?.raeume ?? [];
    const sel = raeume.find((r) => r.id === this.hausSel);
    const turn = (deg: number, icon: string, label: string) =>
      html`<button class="text small" @click=${() => this.turnRoom(sel!.id, deg)}><ha-icon icon=${icon}></ha-icon>${label}</button>`;
    const doorRow = (raum: Raum, zone: Zone) => {
      const key = `${raum.id}/${zone.id}`;
      const ziel = this.tueren[key] ?? "";
      const andere = raeume.filter((x) => x.id !== raum.id);
      if (!this.kannAendern) return html`<li class="door"><ha-icon icon="mdi:door-open"></ha-icon><span>${zone.name}: ${fuehrtZuText({ ...zone, fuehrt_zu: ziel }, andere)}</span></li>`;
      return html`<li class="door">
        <ha-icon icon="mdi:door-open"></ha-icon>
        <label class="field"
          >${zone.name} führt zu<select
            @change=${(e: Event) => {
              this.tueren = { ...this.tueren, [key]: (e.target as HTMLSelectElement).value };
              this.dirty = true;
            }}
          >
            <option value="" ?selected=${!ziel}>weiß nicht</option>
            <option value="aussen" ?selected=${ziel === "aussen"}>draußen / Raum ohne Sensor</option>
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
        <ul class="list">
          ${raeume.map((raum) => {
            const live = this.hausLive[raum.id];
            const n = live ? live.figuren.filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung")).length : 0;
            const open = raum.id === this.hausSel;
            const doors = raum.zonen.filter((z) => z.art === "ausgang" && z.id);
            return html`<li class="item ${open ? "open" : ""}">
              <div class="row" @click=${() => (this.hausSel = open ? "" : raum.id)}>
                <span class="marker-icon"><ha-icon icon="mdi:floor-plan"></ha-icon></span>
                <span class="name">${raum.name}<small>${raum.haus_gesetzt || this.dirty ? "" : "noch nicht eingeordnet"}</small></span>
                <span class="badge ${n ? "on" : "off"}">${live ? (n ? `${n}` : "leer") : "nicht erreichbar"}</span>
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
                            ${doors.map((z) => doorRow(raum, z))}
                          </ul>`
                      : html`<p class="hint small">Keine Tür eingezeichnet. Eine Tür zeichnet man im Raum (Rolle „Tür“).</p>`}
                    <div class="actions">
                      <span class="spacer"></span>
                      <button class="text small" @click=${() => this.selectRoom(raum.id)}><ha-icon icon="mdi:pencil-outline"></ha-icon>Raum öffnen</button>
                    </div>
                  </div>`
                : nothing}
            </li>`;
          })}
        </ul>
      </div>
    </aside>`;
  }

  private renderSide(): TemplateResult {
    if (this.page === "haus") return this.renderHausSide();
    return html`<aside class="side">
      <div class="tabs" role="tablist">
        <button class=${this.tab === "zonen" ? "active" : ""} role="tab" @click=${() => (this.tab = "zonen")}><ha-icon icon="mdi:shape-outline"></ha-icon>Zonen</button>
        <button class=${this.tab === "raum" ? "active" : ""} role="tab" @click=${() => (this.tab = "raum")}><ha-icon icon="mdi:floor-plan"></ha-icon>Sensor und Raum</button>
      </div>
      <div class="side-body">${this.tab === "zonen" ? this.renderZonesTab() : this.renderRoomTab()}</div>
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
