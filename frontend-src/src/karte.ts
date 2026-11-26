/**
 * Dashboard-Karte „Raumzonen“: ein Raum oder der Hausplan, live und nur
 * zum Ansehen (Wände, Zonen belegt/frei, Personen, Grundriss).
 *
 *   type: custom:raumzonen-karte
 *   raum: haus            # oder die Kennung eines Raums, z. B. wohnzimmer
 *   stockwerk: erdgeschoss  # optional, nur im Hausplan
 *   titel: Erdgeschoss    # optional
 *   hintergrund: true     # Grundriss zeigen
 *   figuren: true         # Personen als Punkte
 *   hoehe: 320            # Höhe in Pixel
 *
 * Daten kommen über die WebSocket-Befehle, die alle Nutzer lesen dürfen
 * (`rooms/get`, `live/subscribe`, `plan/bild/get`). Die Karte ändert nichts.
 */

import { LitElement, css, html, nothing, svg, type TemplateResult } from "lit";
import { formPoints, toHouse } from "./geometry";
import { lageVon, planZuHaus, rahmen, stockwerkeVon, umrissVon } from "./karte-geo";
import { rolleOf } from "./editor";
import type { Hass, Live, Plan, Point, Raum, RoomsResult } from "./types";

const DOMAIN = "raumzonen";
const ANWESENHEIT = "anwesenheit";

export interface KartenConfig {
  type: string;
  raum?: string;
  stockwerk?: string;
  titel?: string;
  hintergrund?: boolean;
  figuren?: boolean;
  hoehe?: number;
}

/** Haus → SVG (y zeigt im Bild nach unten). */
const s = ([x, y]: Point): Point => [x, -y];
const pts = (punkte: Point[]): string => punkte.map((q) => s(q).map((v) => v.toFixed(1)).join(",")).join(" ");

export class RaumzonenKarte extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _data: { state: true },
    _live: { state: true },
    _bilder: { state: true },
    _fehler: { state: true },
  };

  hass?: Hass;
  private _config?: KartenConfig;
  private _data?: RoomsResult;
  private _live: Record<string, Live> = {};
  private _bilder: Record<string, string> = {};
  private _fehler = "";
  private _abos: (() => Promise<void>)[] = [];
  private _geladen = false;

  static getStubConfig(): KartenConfig {
    return { type: "custom:raumzonen-karte", raum: "haus", hintergrund: true, figuren: true };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "raum", selector: { text: {} } },
        { name: "stockwerk", selector: { floor: {} } },
        { name: "titel", selector: { text: {} } },
        { name: "hintergrund", selector: { boolean: {} } },
        { name: "figuren", selector: { boolean: {} } },
        { name: "hoehe", selector: { number: { min: 150, max: 1200, step: 10, unit_of_measurement: "px" } } },
      ],
      computeLabel: (s: { name: string }) =>
        ({ raum: "Raum („haus“ oder Kennung des Raums)", stockwerk: "Stockwerk (nur Hausplan)", titel: "Titel", hintergrund: "Grundriss zeigen", figuren: "Personen zeigen", hoehe: "Höhe" })[s.name] ?? s.name,
    };
  }

  setConfig(config: KartenConfig): void {
    if (!config) throw new Error("Keine Einstellungen");
    this._config = { raum: "haus", hintergrund: true, figuren: true, hoehe: 320, ...config };
    if (this._geladen) void this._laden();
  }

  getCardSize(): number {
    return Math.ceil((this._config?.hoehe ?? 320) / 50) + 1;
  }

  private _groesse?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    // Schrift und Punkte hängen von der Breite ab: bei Größenänderung neu zeichnen.
    this._groesse = new ResizeObserver(() => this.requestUpdate());
    this._groesse.observe(this);
    if (this.hass && !this._geladen) void this._laden();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._groesse?.disconnect();
    void this._abmelden();
    this._geladen = false;
  }

  protected updated(): void {
    if (this.hass && this._config && !this._geladen && this.isConnected) void this._laden();
  }

  private async _abmelden(): Promise<void> {
    const alt = this._abos;
    this._abos = [];
    for (const u of alt) {
      try {
        await u();
      } catch {
        // schon weg
      }
    }
  }

  /** Räume, die die Karte zeigt. */
  private _raeume(): Raum[] {
    const d = this._data;
    const c = this._config;
    if (!d || !c) return [];
    if (c.raum && c.raum !== "haus") return d.raeume.filter((r) => r.id === c.raum);
    const bereiche = d.bereiche_ha ?? [];
    return d.raeume.filter((r) => r.haus_gesetzt && (!c.stockwerk || stockwerkeVon(r, bereiche).includes(c.stockwerk)));
  }

  private async _laden(): Promise<void> {
    if (!this.hass || !this._config) return;
    this._geladen = true;
    await this._abmelden();
    try {
      this._data = await this.hass.callWS<RoomsResult>({ type: `${DOMAIN}/rooms/get` });
      this._fehler = "";
    } catch {
      this._fehler = "Raumzonen ist nicht erreichbar.";
      return;
    }
    const raeume = this._raeume();
    if (!raeume.length) {
      this._fehler = this._config.raum && this._config.raum !== "haus" ? `Raum „${this._config.raum}“ gibt es nicht.` : "Kein Raum im Hausplan (oder auf diesem Stockwerk).";
      return;
    }
    for (const r of raeume) {
      try {
        const u = await this.hass.connection.subscribeMessage<Live>((m) => (this._live = { ...this._live, [r.id]: m }), { type: `${DOMAIN}/live/subscribe`, raum_id: r.id });
        this._abos.push(u);
      } catch {
        // Raum gerade nicht da: bleibt ohne Live-Daten.
      }
    }
    if (this._config.hintergrund !== false) void this._ladeBilder();
  }

  private async _ladeBilder(): Promise<void> {
    for (const p of this._plaene()) {
      if (this._bilder[p.id] || !this.hass) continue;
      try {
        const r = await this.hass.callWS<{ mime: string; bild: string }>({ type: `${DOMAIN}/plan/bild/get`, plan_id: p.id });
        const bytes = Uint8Array.from(atob(r.bild), (c) => c.charCodeAt(0));
        this._bilder = { ...this._bilder, [p.id]: URL.createObjectURL(new Blob([bytes], { type: r.mime })) };
      } catch {
        // ohne Hintergrund
      }
    }
  }

  private _plaene(): Plan[] {
    const c = this._config;
    const plaene = this._data?.plaene ?? [];
    const raeume = this._raeume();
    const bereiche = this._data?.bereiche_ha ?? [];
    const stockwerke = c?.stockwerk ? [c.stockwerk] : [...new Set(raeume.flatMap((r) => stockwerkeVon(r, bereiche)))];
    if (raeume.length === 1 && !raeume[0].haus_gesetzt) return [];
    return plaene.filter((p) => !p.stockwerk || !stockwerke.length || stockwerke.includes(p.stockwerk));
  }

  private _renderPlan(p: Plan): TemplateResult | typeof nothing {
    const href = this._bilder[p.id];
    if (!href) return nothing;
    const [o, ex, ey] = [planZuHaus(p, 0, 0), planZuHaus(p, 1, 0), planZuHaus(p, 0, 1)].map(s);
    const m = [ex[0] - o[0], ex[1] - o[1], ey[0] - o[0], ey[1] - o[1], o[0], o[1]].map((v) => v.toFixed(5)).join(" ");
    const z = p.zuschnitt?.length === 4 ? p.zuschnitt : [0, 0, p.breite_px, p.hoehe_px];
    return svg`<g transform="matrix(${m})">
      <clipPath id=${`rzk-${p.id}`}><rect x=${z[0]} y=${z[1]} width=${z[2] - z[0]} height=${z[3] - z[1]} /></clipPath>
      <image class="plan" href=${href} width=${p.breite_px} height=${p.hoehe_px} clip-path=${`url(#rzk-${p.id})`} preserveAspectRatio="none" />
    </g>`;
  }

  private _renderRaum(raum: Raum, skala: number): TemplateResult {
    const lage = lageVon(raum);
    const live = this._live[raum.id];
    const ok = !!live && live.verfuegbar && !live.problem;
    const da = !!live?.zonen[ANWESENHEIT]?.belegt;
    const umriss = umrissVon(raum).map((q) => toHouse(q, lage));
    const zonen = raum.zonen
      .filter((z) => rolleOf(z) !== "ignorieren")
      .map((z) => {
        const belegt = !!(z.id && live?.zonen[z.id]?.belegt);
        const farbe = `var(--rz-${rolleOf(z)})`;
        return svg`<polygon class="zone" points=${pts(formPoints(z.form).map((q) => toHouse(q, lage)))} style=${`fill:${farbe};stroke:${farbe};fill-opacity:${belegt ? 0.55 : 0.15}`} />`;
      });
    const figuren =
      this._config?.figuren !== false && raum.art !== "melder"
        ? (live?.figuren ?? [])
            .filter((f) => !f.tags.includes("wiederhergestellt") && !f.tags.includes("stoerung"))
            .map((f) => {
              const [x, y] = s(toHouse([f.x, f.y], lage));
              const tier = f.tags.includes("hund") || f.art === "pet";
              return svg`<circle class="figur ${f.gehalten ? "gehalten" : ""}" cx=${x} cy=${y} r=${Math.max(14, 6 / skala)} style=${`fill:var(--rz-${tier ? "tier" : "person"})`} />`;
            })
        : [];
    const [mx, my] = s(umriss.reduce((a, q) => [a[0] + q[0] / umriss.length, a[1] + q[1] / umriss.length], [0, 0] as Point));
    const schrift = 13 / skala;
    return svg`<g class="raum">
      <polygon class="umriss ${ok ? "" : "aus"} ${da ? "da" : ""}" points=${pts(umriss)} style=${`stroke-width:${Math.max(3, 2.5 / skala)}px`} />
      ${zonen}${figuren}
      <text class="name" x=${mx} y=${my} style=${`font-size:${schrift}px`}>${raum.name}</text>
      <text class="stand" x=${mx} y=${my + schrift * 1.2} style=${`font-size:${schrift * 0.8}px`}>${!ok ? "nicht erreichbar" : da ? "jemand da" : "niemand"}</text>
    </g>`;
  }

  protected render(): TemplateResult {
    const c = this._config;
    const raeume = this._raeume();
    const hoehe = c?.hoehe ?? 320;
    const alle = raeume.flatMap((r) => umrissVon(r).map((q) => toHouse(q, lageVon(r))));
    const [x0, y0, x1, y1] = rahmen(alle);
    const w = x1 - x0;
    const h = y1 - y0;
    // Ungefähre Pixel je cm (für gleich große Schrift und Linien).
    const skala = Math.min(hoehe / Math.max(h, 1), (this.clientWidth || 400) / Math.max(w, 1));
    const titel = c?.titel ?? (c?.raum && c.raum !== "haus" ? raeume[0]?.name : "Hausplan");
    return html`<ha-card .header=${titel || undefined}>
      ${this._fehler
        ? html`<div class="hinweis">${this._fehler}</div>`
        : html`<svg viewBox="${x0} ${-y1} ${w} ${h}" style=${`height:${hoehe}px`} preserveAspectRatio="xMidYMid meet" role="img" aria-label=${titel ?? "Raumzonen"}>
            ${c?.hintergrund !== false ? this._plaene().map((p) => this._renderPlan(p)) : nothing}
            ${raeume.map((r) => this._renderRaum(r, skala))}
          </svg>`}
    </ha-card>`;
  }

  static styles = css`
    :host {
      --rz-bett: var(--purple-color, #926bc7);
      --rz-bereich: var(--teal-color, #009688);
      --rz-durchgang: var(--cyan-color, #00bcd4);
      --rz-tuer: var(--green-color, #4caf50);
      --rz-stelle: var(--orange-color, #ff9800);
      --rz-hund: var(--amber-color, #ffc107);
      --rz-person: var(--teal-color, #009688);
      --rz-tier: var(--amber-color, #ffc107);
    }
    svg {
      display: block;
      width: 100%;
    }
    .plan {
      opacity: 0.55;
    }
    .umriss {
      fill: var(--card-background-color, #fff);
      fill-opacity: 0.6;
      stroke: var(--primary-text-color, #212121);
      stroke-opacity: 0.75;
      stroke-linejoin: round;
    }
    .umriss.da {
      fill: var(--rz-bereich);
      fill-opacity: 0.18;
    }
    .umriss.aus {
      stroke-dasharray: 12 8;
      stroke-opacity: 0.45;
    }
    .zone {
      stroke-width: 2px;
      vector-effect: non-scaling-stroke;
    }
    .figur {
      stroke: var(--card-background-color, #fff);
      stroke-width: 2px;
      vector-effect: non-scaling-stroke;
    }
    .figur.gehalten {
      opacity: 0.5;
    }
    text {
      text-anchor: middle;
      fill: var(--primary-text-color, #212121);
      paint-order: stroke;
      stroke: var(--card-background-color, #fff);
      stroke-width: 3px;
      stroke-linejoin: round;
    }
    .name {
      font-weight: 600;
    }
    .stand {
      fill: var(--secondary-text-color, #727272);
    }
    .hinweis {
      padding: 16px;
      color: var(--secondary-text-color, #727272);
    }
  `;
}

if (!customElements.get("raumzonen-karte")) customElements.define("raumzonen-karte", RaumzonenKarte);

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === "raumzonen-karte"))
  window.customCards.push({ type: "raumzonen-karte", name: "Raumzonen", description: "Raum oder Hausplan live: Zonen belegt/frei, Personen, Grundriss.", preview: false });
