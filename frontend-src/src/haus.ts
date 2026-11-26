/**
 * Hausplan: Türen aller Räume (Tür-Zonen und Türen in den Wänden) und das
 * Bewegungsprofil des Hauses (wann war in welchem Raum jemand).
 */

import { formCenter, toHouse } from "./geometry";
import type { Oeffnung, Point, Raum } from "./types";

export interface Tuer {
  /** Schlüssel für die Liste „führt zu“: `raum/zone` oder `raum/#index`. */
  key: string;
  raumId: string;
  name: string;
  /** Mitte der Tür im Raum (cm). */
  punkt: Point;
  ziel: string;
  /** Bestimmte Tür im anderen Raum (ihr `key`), leer = keine. */
  gegenstueck: string;
  zoneId?: string;
  oeffnung?: number;
}

/** Schlüssel einer Öffnung (feste Kennung, sonst die Nummer). */
export function oeffnungKey(raumId: string, o: Oeffnung, i: number): string {
  return `${raumId}/#${o.id || i}`;
}

/** Name einer Öffnung: eigener Name, sonst „Tür 2“ bzw. „Durchgang 2“. */
export function oeffnungName(o: Oeffnung, i: number): string {
  return o.name?.trim() || (o.art === "offen" ? `Durchgang ${i + 1}` : `Tür ${i + 1}`);
}

/**
 * Die nächste Tür eines anderen Raums (im Haus gemessen), höchstens `max` cm
 * entfernt; Räume ohne Lage im Haus zählen nicht.
 */
export function naechsteTuer(raeume: Raum[], raumId: string, punkt: Point, max = 150): { tuer: Tuer; abstand: number } | null {
  const raum = raeume.find((r) => r.id === raumId);
  if (!raum?.haus_gesetzt) return null;
  const hier = toHouse(punkt, { x: raum.haus_x, y: raum.haus_y, winkel: raum.haus_winkel });
  let best: { tuer: Tuer; abstand: number } | null = null;
  for (const r of raeume) {
    if (r.id === raumId || !r.haus_gesetzt) continue;
    for (const t of tuerenVon(r)) {
      const [x, y] = toHouse(t.punkt, { x: r.haus_x, y: r.haus_y, winkel: r.haus_winkel });
      const d = Math.hypot(x - hier[0], y - hier[1]);
      if (d <= max && (!best || d < best.abstand)) best = { tuer: t, abstand: d };
    }
  }
  return best;
}

/** Mitte einer Öffnung in der Wand. */
export function oeffnungMitte(umriss: Point[], o: Oeffnung): Point | null {
  const n = umriss.length;
  if (n < 3 || o.kante < 0 || o.kante >= n) return null;
  const [x1, y1] = umriss[o.kante];
  const [x2, y2] = umriss[(o.kante + 1) % n];
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (!len) return null;
  const t = (o.von + o.bis) / 2 / len;
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

/** Alle Türen eines Raums: Zonen der Rolle „Tür“ und Türen/Öffnungen in den Wänden. */
export function tuerenVon(raum: Raum): Tuer[] {
  const out: Tuer[] = [];
  for (const z of raum.zonen) {
    if (z.art !== "ausgang" || !z.id) continue;
    out.push({ key: `${raum.id}/${z.id}`, raumId: raum.id, name: z.name, punkt: formCenter(z.form), ziel: z.fuehrt_zu ?? "", gegenstueck: z.gegenstueck ?? "", zoneId: z.id });
  }
  (raum.oeffnungen ?? []).forEach((o, i) => {
    const p = oeffnungMitte(raum.umriss, o);
    if (!p) return;
    out.push({ key: oeffnungKey(raum.id, o, i), raumId: raum.id, name: oeffnungName(o, i), punkt: p, ziel: o.fuehrt_zu ?? "", gegenstueck: o.gegenstueck ?? "", oeffnung: i });
  });
  return out;
}

/** Zeitabschnitte zusammenlegen (überlappende oder fast berührende, Lücke in s). */
export function vereinigen(listen: [number, number][][], luecke = 60): [number, number][] {
  const alle = listen.flat().filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  const out: [number, number][] = [];
  for (const [a, b] of alle) {
    const last = out[out.length - 1];
    if (last && a - last[1] <= luecke) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

export function summeDauer(abschnitte: [number, number][]): number {
  return abschnitte.reduce((s, [a, b]) => s + (b - a), 0);
}

export interface Wechsel {
  zeit: number;
  von: string;
  nach: string;
}

/**
 * Wechsel zwischen Räumen: endet in einem Raum ein Abschnitt und beginnt
 * kurz danach (höchstens `fenster` s) in einem anderen einer, ist das ein
 * möglicher Weg. Grundlage, um später Wege einer Person zu verfolgen.
 */
export function wechsel(raeume: Record<string, [number, number][]>, fenster = 30): Wechsel[] {
  const enden: { t: number; raum: string }[] = [];
  const anfaenge: { t: number; raum: string }[] = [];
  for (const [raum, ab] of Object.entries(raeume)) {
    for (const [a, b] of ab) {
      anfaenge.push({ t: a, raum });
      enden.push({ t: b, raum });
    }
  }
  anfaenge.sort((x, y) => x.t - y.t);
  const out: Wechsel[] = [];
  for (const s of anfaenge) {
    // Ein Ende kurz davor oder kurz danach (überlappt, weil Melder nachlaufen).
    let best: { t: number; raum: string } | undefined;
    for (const e of enden) {
      if (e.raum === s.raum || Math.abs(e.t - s.t) > fenster) continue;
      if (!best || Math.abs(e.t - s.t) < Math.abs(best.t - s.t)) best = e;
    }
    if (best) out.push({ zeit: s.t, von: best.raum, nach: s.raum });
  }
  return out;
}
