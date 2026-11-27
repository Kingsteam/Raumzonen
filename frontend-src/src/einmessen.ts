/**
 * Sensor einmessen: aus drei Stellen, die der Sensor sieht (Sensorkoordinaten)
 * und deren Lage im Raum bekannt ist, die Lage des Sensors ausrechnen.
 *
 * Starre Abbildung ohne Spiegeln und ohne Maßstab (Procrustes in 2D):
 * Raum = Lage + Drehung(winkel) · Sensor, wie `sensorToRoom` und
 * `core/pose.py`. Die dritte Stelle ist die Probe: der mittlere Rest sagt,
 * wie genau das Ergebnis ist.
 */

import type { Point } from "./types";

export interface Einmessung {
  x: number;
  y: number;
  /** Grad, gegen den Uhrzeigersinn, -180 < winkel ≤ 180. */
  winkel: number;
  /** Mittlerer Abstand der Stellen nach der Rechnung (cm). */
  rest_cm: number;
}

/** Fläche des Dreiecks (cm²) und kürzester Abstand: liegen die Stellen gut? */
export function stellenProblem(punkte: Point[]): string {
  if (punkte.length < 3) return "Es braucht drei Stellen.";
  let kuerzest = Infinity;
  for (let i = 0; i < punkte.length; i++)
    for (let j = i + 1; j < punkte.length; j++) kuerzest = Math.min(kuerzest, Math.hypot(punkte[i][0] - punkte[j][0], punkte[i][1] - punkte[j][1]));
  const [a, b, c] = punkte;
  const flaeche = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
  if (kuerzest < 100) return "Zwei Stellen liegen zu nah beieinander (weniger als 1 m). Weiter auseinander gehen.";
  if (flaeche < 5000) return "Die drei Stellen liegen fast auf einer Linie. Eine Stelle seitlich wählen.";
  return "";
}

/**
 * Hat der Sensor an zwei Stellen fast dieselbe Position gemeldet? Dann schickt
 * er meist gerade keine neuen Positionen (Funk, frisch gekoppelt), und
 * Rechnen ist sinnlos.
 */
export function sensorStellenProblem(sensor: Point[]): string {
  for (let i = 0; i < sensor.length; i++)
    for (let j = i + 1; j < sensor.length; j++)
      if (Math.hypot(sensor[i][0] - sensor[j][0], sensor[i][1] - sensor[j][1]) < 30)
        return "Der Sensor hat an zwei Stellen fast dieselbe Position gemeldet. Wahrscheinlich schickt er gerade keine neuen Positionen: Im Plan muss dein Punkt mitgehen, wenn du gehst. Erst wenn das klappt, noch einmal einmessen.";
  return "";
}

export function einmessen(sensor: Point[], raum: Point[]): Einmessung | null {
  const n = Math.min(sensor.length, raum.length);
  if (n < 2) return null;
  const mittel = (pts: Point[]): Point => [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
  const ms = mittel(sensor.slice(0, n));
  const mr = mittel(raum.slice(0, n));
  let sin = 0;
  let cos = 0;
  for (let i = 0; i < n; i++) {
    const [sx, sy] = [sensor[i][0] - ms[0], sensor[i][1] - ms[1]];
    const [rx, ry] = [raum[i][0] - mr[0], raum[i][1] - mr[1]];
    sin += sx * ry - sy * rx;
    cos += sx * rx + sy * ry;
  }
  if (!sin && !cos) return null;
  const a = Math.atan2(sin, cos);
  const [c, s] = [Math.cos(a), Math.sin(a)];
  const x = mr[0] - (ms[0] * c - ms[1] * s);
  const y = mr[1] - (ms[0] * s + ms[1] * c);
  let rest = 0;
  for (let i = 0; i < n; i++) {
    const px = x + sensor[i][0] * c - sensor[i][1] * s;
    const py = y + sensor[i][0] * s + sensor[i][1] * c;
    rest += Math.hypot(px - raum[i][0], py - raum[i][1]);
  }
  let winkel = (a * 180) / Math.PI;
  winkel = Math.round(winkel * 10) / 10;
  if (winkel <= -180) winkel += 360;
  return { x: Math.round(x), y: Math.round(y), winkel, rest_cm: Math.round((rest / n) * 10) / 10 };
}

/** Eine Stelle aus vielen Punkten: Median, dazu wie weit sie streuen (cm). */
export function stelle(punkte: Point[]): { punkt: Point; streuung_cm: number } | null {
  if (!punkte.length) return null;
  const med = (v: number[]) => {
    const s = [...v].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const p: Point = [med(punkte.map((q) => q[0])), med(punkte.map((q) => q[1]))];
  const abst = punkte.map((q) => Math.hypot(q[0] - p[0], q[1] - p[1]));
  return { punkt: [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10], streuung_cm: Math.round(med(abst) * 10) / 10 };
}

export interface Anker {
  punkt: Point;
  name: string;
}

function drinnen([x, y]: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Stellen, an die man sich leicht genau hinstellt: jede Ecke (etwa 50 cm von
 * beiden Wänden) und vor jeder Tür (50 cm im Raum). `tueren` sind Mitte der
 * Tür in der Wand und ihr Name.
 */
export function ankerStellen(umriss: Point[], tueren: { punkt: Point; name: string }[] = [], abstand = 50): Anker[] {
  const n = umriss.length;
  if (n < 3) return [];
  const out: Anker[] = [];
  const einheit = ([x, y]: Point): Point => {
    const l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  };
  umriss.forEach((v, i) => {
    const a = einheit([umriss[(i + n - 1) % n][0] - v[0], umriss[(i + n - 1) % n][1] - v[1]]);
    const b = einheit([umriss[(i + 1) % n][0] - v[0], umriss[(i + 1) % n][1] - v[1]]);
    let bis = einheit([a[0] + b[0], a[1] + b[1]]);
    // Halber Winkel der Ecke: so weit entlang der Winkelhalbierenden, dass beide Wände `abstand` weg sind.
    const sinHalb = Math.sqrt(Math.max(0.05, (1 - (a[0] * b[0] + a[1] * b[1])) / 2));
    const d = Math.min(abstand / sinHalb, 3 * abstand);
    let p: Point = [v[0] + bis[0] * d, v[1] + bis[1] * d];
    if (!drinnen(p, umriss)) {
      bis = [-bis[0], -bis[1]];
      p = [v[0] + bis[0] * d, v[1] + bis[1] * d];
    }
    if (drinnen(p, umriss)) out.push({ punkt: [Math.round(p[0]), Math.round(p[1])], name: `Ecke ${i + 1}` });
  });
  for (const t of tueren) {
    // Die Wand an dieser Stelle finden und senkrecht in den Raum gehen.
    for (const [dx, dy] of [
      [abstand, 0],
      [-abstand, 0],
      [0, abstand],
      [0, -abstand],
    ] as Point[]) {
      const p: Point = [t.punkt[0] + dx, t.punkt[1] + dy];
      if (drinnen(p, umriss) && !drinnen([t.punkt[0] - dx, t.punkt[1] - dy], umriss)) {
        out.push({ punkt: [Math.round(p[0]), Math.round(p[1])], name: `vor ${t.name}` });
        break;
      }
    }
  }
  return out;
}

/** Drei Stellen, die ein möglichst großes Dreieck bilden (für genaues Einmessen). */
export function besteDrei(anker: Anker[]): number[] {
  let best: number[] = [];
  let bestF = 0;
  for (let i = 0; i < anker.length; i++)
    for (let j = i + 1; j < anker.length; j++)
      for (let k = j + 1; k < anker.length; k++) {
        const pts = [anker[i].punkt, anker[j].punkt, anker[k].punkt];
        if (stellenProblem(pts)) continue;
        const [a, b, c] = pts;
        const f = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
        if (f > bestF) [best, bestF] = [[i, j, k], f];
      }
  return best;
}
