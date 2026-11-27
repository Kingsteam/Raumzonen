/** Rechnen für die Dashboard-Karte „Raumzonen“ (ohne Browser testbar). */

import { roomOutline, rotate, type HausLage } from "./geometry";
import type { Plan, Point, Raum } from "./types";

/** Stockwerke eines Raums: eigene, sonst das Stockwerk seines Bereichs. */
export function stockwerkeVon(raum: Raum, bereiche: { id: string; name: string; stockwerk: string | null }[]): string[] {
  if (raum.stockwerke?.length) return raum.stockwerke;
  const b = raum.bereich_id ? bereiche.find((x) => x.id === raum.bereich_id) : bereiche.find((x) => x.name.toLowerCase() === raum.name.trim().toLowerCase());
  return b?.stockwerk ? [b.stockwerk] : [];
}

/** Umriss eines Raums (Wände, sonst um Zonen und Sensor; Melder ohne Wände: 3 × 3 m). */
export function umrissVon(raum: Raum): Point[] {
  if (raum.art === "melder" && raum.umriss.length < 3)
    return [
      [0, 0],
      [300, 0],
      [300, 300],
      [0, 300],
    ];
  return roomOutline(
    raum.umriss,
    raum.zonen.map((z) => z.form),
    [raum.sensor.x, raum.sensor.y],
  );
}

/** Lage im Haus; ein Raum ohne Lage liegt bei (0, 0), ungedreht. */
export function lageVon(raum: Raum): HausLage {
  return raum.haus_gesetzt ? { x: raum.haus_x, y: raum.haus_y, winkel: raum.haus_winkel } : { x: 0, y: 0, winkel: 0 };
}

/** Bildpunkt eines Grundrisses → Haus (wie im Panel). */
export function planZuHaus(p: Plan, px: number, py: number): Point {
  const [dx, dy] = rotate([px * p.cm_pro_px, (p.hoehe_px - py) * p.cm_pro_px], p.winkel ?? 0);
  return [p.x + dx, p.y + dy];
}

/** Rechteck um alle Punkte, mit Rand (cm). */
export function rahmen(punkte: Point[], rand = 40): [number, number, number, number] {
  if (!punkte.length) return [0, 0, 100, 100];
  const xs = punkte.map((q) => q[0]);
  const ys = punkte.map((q) => q[1]);
  return [Math.min(...xs) - rand, Math.min(...ys) - rand, Math.max(...xs) + rand, Math.max(...ys) + rand];
}


/** Was die Karte für einen Raum zeigt: Zahl der Personen (Radar) oder „da“ (Melder). */
export interface RaumStand {
  ok: boolean;
  da: boolean;
  /** Personen im Raum; bei Melder-Räumen unbekannt (null). */
  personen: number | null;
  text: string;
}

export function raumStand(
  raum: Pick<Raum, "art">,
  live: { verfuegbar: boolean; problem?: string | null; zonen: Record<string, { belegt: boolean; personen: number }> } | undefined,
): RaumStand {
  const ok = !!live && live.verfuegbar && !live.problem;
  const zone = live?.zonen["anwesenheit"];
  const da = !!zone?.belegt;
  if (!ok) return { ok, da, personen: null, text: "nicht erreichbar" };
  if (raum.art === "melder") return { ok, da, personen: null, text: da ? "jemand da" : "niemand" };
  // Radar: gezählte Personen (ein als Hund markiertes Ziel zählt nicht); belegt ohne Zahl = gehaltene Figur.
  const n = Math.max(zone?.personen ?? 0, da ? 1 : 0);
  return { ok, da: n > 0, personen: n, text: n === 0 ? "niemand" : n === 1 ? "1 Person" : `${n} Personen` };
}
