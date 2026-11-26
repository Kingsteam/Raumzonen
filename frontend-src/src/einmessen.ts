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
