// Bearbeitungsschritte für Zonen, ohne Oberfläche (testbar mit vitest).

import { cellOf, formProblem, headingTo, rotate, round1 } from "./geometry";
import type { Form, Live, Oeffnung, Point, Regel, Zone, ZonenArt } from "./types";

/** Welche Regel-Vorlage zu welcher Zonenart passt. */
export const VORLAGE_FUER_ART: Record<ZonenArt, string> = {
  normal: "normal",
  ausgang: "ausgang",
  hundeplatz: "hundeplatz",
  stoerquelle: "stoerquelle",
  stelle: "stelle",
  durchgang: "durchgang",
};

/** Rückgängig: merkt sich frühere Stände (als Kopie). */
export class History<T> {
  private stack: string[] = [];
  constructor(private limit = 100) {}
  push(state: T): void {
    const json = JSON.stringify(state);
    if (this.stack[this.stack.length - 1] === json) return;
    this.stack.push(json);
    if (this.stack.length > this.limit) this.stack.shift();
  }
  undo(): T | undefined {
    const json = this.stack.pop();
    return json === undefined ? undefined : (JSON.parse(json) as T);
  }
  get size(): number {
    return this.stack.length;
  }
  clear(): void {
    this.stack = [];
  }
}

export function uniqueName(base: string, zones: Zone[]): string {
  const names = new Set(zones.map((z) => z.name));
  if (!names.has(base)) return base;
  let n = 2;
  while (names.has(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}

export function newZone(form: Form, zones: Zone[], vorlagen: Record<string, Regel>, art: ZonenArt = "normal"): Zone {
  return {
    name: uniqueName("Zone", zones),
    art,
    form,
    regel: { ...vorlagen[VORLAGE_FUER_ART[art]] },
  };
}

export function setVertex(form: Form, index: number, p: Point): Form {
  if (form.art !== "vieleck") return form;
  const punkte = form.punkte.slice();
  punkte[index] = round1(p);
  return { ...form, punkte };
}

export function insertVertex(form: Form, after: number, p: Point): Form {
  if (form.art !== "vieleck") return form;
  const punkte = form.punkte.slice();
  punkte.splice(after + 1, 0, round1(p));
  return { ...form, punkte };
}

export function removeVertex(form: Form, index: number): Form {
  if (form.art !== "vieleck" || form.punkte.length <= 3) return form;
  return { ...form, punkte: form.punkte.filter((_, i) => i !== index) };
}

/** Zelle an einem Punkt hinzufügen oder entfernen. */
export function paintCell(form: Extract<Form, { art: "zellen" }>, p: Point, add: boolean): Form {
  const [i, j] = cellOf(p, form.groesse, form.x0 ?? 0, form.y0 ?? 0);
  const has = form.zellen.some(([a, b]) => a === i && b === j);
  if (add && !has) return { ...form, zellen: [...form.zellen, [i, j]] };
  if (!add && has) return { ...form, zellen: form.zellen.filter(([a, b]) => a !== i || b !== j) };
  return form;
}

/** Rechteck aus zwei Ecken (achsenparallel). */
export function rectFromDrag(a: Point, b: Point): Form {
  return {
    art: "rechteck",
    mitte: round1([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]),
    breite: Math.round(Math.abs(b[0] - a[0]) * 10) / 10,
    tiefe: Math.round(Math.abs(b[1] - a[1]) * 10) / 10,
    winkel: 0,
  };
}

/** Rechteck an einer Ecke ziehen: Mitte bleibt, Größe folgt der Ecke. */
export function resizeRect(form: Extract<Form, { art: "rechteck" }>, corner: Point, min = 10): Form {
  const [u, v] = rotate(corner, -form.winkel, form.mitte);
  return {
    ...form,
    breite: Math.max(min, Math.round(Math.abs(u - form.mitte[0]) * 20) / 10),
    tiefe: Math.max(min, Math.round(Math.abs(v - form.mitte[1]) * 20) / 10),
  };
}

/** Lage des Dreh-Griffs: über der oberen Kante. */
export function rectRotateHandle(form: Extract<Form, { art: "rechteck" }>, gap = 30): Point {
  return rotate([form.mitte[0], form.mitte[1] + form.tiefe / 2 + gap], form.winkel, form.mitte);
}

/** Rechteck drehen, sodass der Griff zum Punkt zeigt (5°-Raster mit snapDeg). */
export function rotateRect(form: Extract<Form, { art: "rechteck" }>, p: Point, snapDeg = 0): Form {
  let winkel = headingTo(form.mitte, p);
  if (snapDeg > 0) winkel = Math.round(winkel / snapDeg) * snapDeg;
  if (winkel > 180) winkel -= 360;
  if (winkel <= -180) winkel += 360;
  return { ...form, winkel };
}

/** Erster Fehler in der Zonenliste, oder "". */
export function zonesProblem(zones: Zone[]): string {
  for (const zone of zones) {
    if (!zone.name.trim()) return "Eine Zone hat keinen Namen";
    const p = formProblem(zone.form);
    if (p) return `${zone.name}: ${p}`;
  }
  return "";
}

/** Zone aus einer Software-Zone des Konverters. */
export function zoneFromConverter(
  cz: { name: string; form: Form },
  zones: Zone[],
  vorlagen: Record<string, Regel>,
): Zone {
  const lower = cz.name.toLowerCase();
  const bett = lower.includes("bett");
  const tuer = lower.includes("tür") || lower.includes("tuer") || lower.includes("door");
  const art: ZonenArt = tuer ? "ausgang" : "normal";
  return {
    name: uniqueName(cz.name, zones),
    art,
    form: cz.form,
    regel: { ...vorlagen[bett ? "bett" : VORLAGE_FUER_ART[art]] },
  };
}

// -- Rollen: verständliche Namen statt Zonenart + Regel ---------------------

export type Rolle = "bett" | "bereich" | "durchgang" | "tuer" | "treppe" | "stelle" | "hund" | "ignorieren";

export interface RolleInfo {
  rolle: Rolle;
  name: string;
  icon: string;
  art: ZonenArt;
  vorlage: string;
  text: string;
}

export const ROLLEN: RolleInfo[] = [
  {
    rolle: "bett",
    name: "Bett",
    icon: "mdi:bed",
    art: "normal",
    vorlage: "bett",
    text: "Hält einen Schläfer, auch wenn der Sensor springt oder ihn kurz verliert. Frei erst, wenn jemand wirklich aufsteht.",
  },
  {
    rolle: "bereich",
    name: "Bereich",
    icon: "mdi:sofa-outline",
    art: "normal",
    vorlage: "normal",
    text: "Belegt, solange jemand darin ist, z. B. Sofa, Schreibtisch oder Schrank.",
  },
  {
    rolle: "durchgang",
    name: "Durchgang",
    icon: "mdi:walk",
    art: "durchgang",
    vorlage: "durchgang",
    text: "Hier geht man nur durch, z. B. ein Gang oder der Platz vor dem Schrank. Belegt sofort, frei kurz danach.",
  },
  {
    rolle: "tuer",
    name: "Tür",
    icon: "mdi:door-open",
    art: "ausgang",
    vorlage: "ausgang",
    text: "Wer hierhin geht, verlässt den Raum. Meldet „betreten“, sobald jemand hier auftaucht, und „verlassen“, wenn er hinausgeht. Hilft dem Bett, „aufgestanden“ schnell zu erkennen.",
  },
  {
    rolle: "treppe",
    name: "Treppe",
    icon: "mdi:stairs",
    art: "ausgang",
    vorlage: "ausgang",
    text: "Wie eine Tür, aber zu einem anderen Stockwerk: Wer hier auftaucht, kommt die Treppe herunter oder herauf („betreten“); wer hier verschwindet, ist hinauf- oder hinuntergegangen („verlassen“).",
  },
  {
    rolle: "stelle",
    name: "Stelle",
    icon: "mdi:map-marker-radius-outline",
    art: "stelle",
    vorlage: "stelle",
    text: "Ein Platz zum Beobachten, z. B. Sessel, Ofen oder Futternapf. Zeigt, ob dort jemand ist; daraus lernt Raumzonen später.",
  },
  {
    rolle: "hund",
    name: "Hundeplatz",
    icon: "mdi:dog-side",
    art: "hundeplatz",
    vorlage: "hundeplatz",
    text: "Nur ein Hinweis: Wer hier lange ruhig liegt, ist vermutlich der Hund.",
  },
  {
    rolle: "ignorieren",
    name: "Ignorieren",
    icon: "mdi:fan",
    art: "stoerquelle",
    vorlage: "stoerquelle",
    text: "Vorhang, Ventilator oder Pflanze: Punkte hier zählen nirgends.",
  },
];

/** Ist gerade jemand durch diese Tür/Treppe gekommen oder gegangen (letzte 4 s)? */
export function kommenGehen(live: Live | undefined | null, zoneId: string | undefined): "betreten" | "verlassen" | null {
  if (!live || !zoneId) return null;
  const k = (live.kommen_gehen ?? []).filter((x) => x.zone_id === zoneId && x.vor_s <= 4);
  return k.length ? k[k.length - 1].richtung : null;
}

/** Text zum Kommen und Gehen, z. B. „herein“ / „hinauf“. */
export function kommenGehenText(richtung: "betreten" | "verlassen", treppe: boolean): string {
  if (treppe) return richtung === "betreten" ? "↓↑ kommt über die Treppe" : "↑↓ über die Treppe weg";
  return richtung === "betreten" ? "→ herein" : "← hinaus";
}

export function rolleInfo(rolle: Rolle): RolleInfo {
  return ROLLEN.find((r) => r.rolle === rolle) ?? ROLLEN[1];
}

export function rolleOf(zone: Zone): Rolle {
  if (zone.art === "ausgang") return zone.treppe ? "treppe" : "tuer";
  if (zone.art === "hundeplatz") return "hund";
  if (zone.art === "stelle") return "stelle";
  if (zone.art === "durchgang") return "durchgang";
  if (zone.art === "stoerquelle") return "ignorieren";
  return zone.regel.schlaefer_halten ? "bett" : "bereich";
}

/** Rolle setzen: Art und die passenden Regeln der Vorlage. */
export function applyRolle(zone: Zone, rolle: Rolle, vorlagen: Record<string, Regel>): Zone {
  const info = rolleInfo(rolle);
  const next: Zone = { ...zone, art: info.art, regel: { ...vorlagen[info.vorlage] } };
  // „Führt zu“ gibt es nur bei Türen und Treppen.
  if (info.art !== "ausgang") delete next.fuehrt_zu;
  if (rolle === "treppe") next.treppe = true;
  else delete next.treppe;
  return next;
}

function sekunden(s: number): string {
  if (s === 0) return "sofort";
  return `nach ${String(s).replace(".", ",")} s`;
}

/** Die Regeln als ein lesbarer Satz. */
export function regelSatz(zone: Zone): string {
  const r = zone.regel;
  if (zone.art === "stoerquelle") return "Punkte in dieser Fläche werden überall ignoriert.";
  const teile = [`belegt ${sekunden(r.belegt_nach_s)}`, `frei ${sekunden(r.frei_nach_s)}`];
  if (r.schlaefer_halten) teile.push("hält Schläfer");
  if (r.max_personen === 1) teile.push("eine Person");
  if (r.hund_ignorieren) teile.push("ohne Hund");
  const satz = teile.join(", ");
  return satz.charAt(0).toUpperCase() + satz.slice(1) + ".";
}

/** Rechteck an einer Ecke ziehen, ohne Drehung: die andere Ecke bleibt. */
export function dragRectCorner(form: Extract<Form, { art: "rechteck" }>, corner: number, p: Point, min = 10): Form {
  const hw = form.breite / 2;
  const hd = form.tiefe / 2;
  // Ecken: 0 unten links, 1 unten rechts, 2 oben rechts, 3 oben links
  const fixed: Point = [
    corner === 0 || corner === 3 ? form.mitte[0] + hw : form.mitte[0] - hw,
    corner === 0 || corner === 1 ? form.mitte[1] + hd : form.mitte[1] - hd,
  ];
  const breite = Math.max(min, Math.abs(p[0] - fixed[0]));
  const tiefe = Math.max(min, Math.abs(p[1] - fixed[1]));
  const sx = p[0] >= fixed[0] ? 1 : -1;
  const sy = p[1] >= fixed[1] ? 1 : -1;
  return {
    ...form,
    winkel: 0,
    breite: Math.round(breite * 10) / 10,
    tiefe: Math.round(tiefe * 10) / 10,
    mitte: round1([fixed[0] + (sx * breite) / 2, fixed[1] + (sy * tiefe) / 2]),
  };
}

/** Wohin eine Tür führt, als kurzer Text. */
export function fuehrtZuText(zone: Zone, raeume: { id: string; name: string }[]): string {
  const ziel = zone.fuehrt_zu ?? "";
  if (!ziel) return "noch nicht eingetragen";
  if (ziel === "aussen") return "nach draußen oder in einen Raum ohne Sensor";
  return raeume.find((r) => r.id === ziel)?.name ?? "unbekannter Raum";
}

// -- Bearbeiten: drehen, Punkte, Öffnungen in Wänden -------------------------

function norm180(deg: number): number {
  let w = ((deg % 360) + 540) % 360 - 180;
  if (w === -180) w = 180;
  return w;
}

// Auf 0,1 runden, ohne „-0“.
const r1 = (v: number): number => Math.round(v * 10) / 10 + 0;

/** Form um einen Punkt drehen (Zellen bleiben, wie sie sind). */
export function rotateForm(form: Form, center: Point, deg: number): Form {
  if (form.art === "vieleck") {
    return { ...form, punkte: form.punkte.map((p) => rotate(p, deg, center).map((v) => r1(v)) as Point) };
  }
  if (form.art === "rechteck") {
    return { ...form, mitte: rotate(form.mitte, deg, center).map((v) => r1(v)) as Point, winkel: r1(norm180(form.winkel + deg)) };
  }
  return form;
}

/** Mitte jeder Kante eines geschlossenen Vielecks (Kante i: Ecke i → i+1). */
export function edgeMidpoints(points: Point[]): Point[] {
  return points.map((p, i) => {
    const q = points[(i + 1) % points.length];
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as Point;
  });
}

/** Ecken einer Wand. */
export function wallEdge(umriss: Point[], kante: number): [Point, Point] {
  return [umriss[kante], umriss[(kante + 1) % umriss.length]];
}

/** Wie weit (cm) ein Punkt, senkrecht auf die Wand gefällt, von deren Anfang liegt. */
export function alongEdge(umriss: Point[], kante: number, p: Point): number {
  const [a, b] = wallEdge(umriss, kante);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (!len) return 0;
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len;
  return Math.max(0, Math.min(len, t));
}

/** Öffnung aus zwei Punkten entlang einer Wand (mindestens `min` cm breit, auf 5 cm gerundet). */
export function openingFromDrag(umriss: Point[], kante: number, p1: Point, p2: Point, min = 20): Oeffnung | null {
  const [a, b] = wallEdge(umriss, kante);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let von = Math.round(alongEdge(umriss, kante, p1) / 5) * 5;
  let bis = Math.round(alongEdge(umriss, kante, p2) / 5) * 5;
  if (bis < von) [von, bis] = [bis, von];
  if (bis - von < min) return null;
  return { kante, von, bis: Math.min(bis, Math.floor(len)), art: "tuer" };
}

/** Anfang und Ende einer Öffnung als Punkte. */
export function openingPoints(umriss: Point[], o: Oeffnung): [Point, Point] {
  const [a, b] = wallEdge(umriss, o.kante);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const at = (t: number): Point => [a[0] + ((b[0] - a[0]) * t) / len, a[1] + ((b[1] - a[1]) * t) / len];
  return [at(o.von), at(o.bis)];
}

/**
 * Öffnungen nach einer Änderung der Wände anpassen: Ecke eingefügt (`at` ≥ 0)
 * oder gelöscht (`removed` ≥ 0). Öffnungen auf betroffenen Wänden entfallen,
 * die übrigen bekommen die neue Nummer ihrer Wand.
 */
export function shiftOpenings(oeffnungen: Oeffnung[], change: { inserted?: number; removed?: number }, n: number): Oeffnung[] {
  const out: Oeffnung[] = [];
  for (const o of oeffnungen) {
    if (change.inserted !== undefined) {
      // Ecke nach Ecke `inserted` eingefügt: Wand `inserted` wird geteilt.
      if (o.kante === change.inserted) continue;
      out.push(o.kante > change.inserted ? { ...o, kante: o.kante + 1 } : o);
    } else if (change.removed !== undefined) {
      // Ecke `removed` gelöscht: Wände removed-1 und removed werden eine.
      const before = (change.removed - 1 + n) % n;
      if (o.kante === change.removed || o.kante === before) continue;
      out.push(o.kante > change.removed ? { ...o, kante: o.kante - 1 } : o);
    }
  }
  return out;
}

/** Öffnungen an die aktuelle Länge ihrer Wand anpassen; zu kurze fallen weg. */
export function clampOpenings(umriss: Point[], oeffnungen: Oeffnung[], min = 20): Oeffnung[] {
  const out: Oeffnung[] = [];
  for (const o of oeffnungen) {
    if (o.kante >= umriss.length) continue;
    const [a, b] = wallEdge(umriss, o.kante);
    const len = Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]));
    const bis = Math.min(o.bis, len);
    if (bis - o.von >= min) out.push({ ...o, bis });
  }
  return out;
}
