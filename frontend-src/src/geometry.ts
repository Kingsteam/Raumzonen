// Geometrie im Raumplan (cm). Gleiche Regeln wie core/geometry.py und
// core/pose.py: Winkel in Grad, gegen den Uhrzeigersinn; der Sensor schaut
// bei 0° in Richtung +y.

import type { Form, Point } from "./types";

export const CELL_DEFAULT = 25;

export function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function rotate([x, y]: Point, deg: number, [cx, cy]: Point = [0, 0]): Point {
  const a = rad(deg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function snap(p: Point, step: number): Point {
  if (step <= 0) return p;
  return [Math.round(p[0] / step) * step, Math.round(p[1] / step) * step];
}

export function round1(p: Point): Point {
  return [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];
}

/** Ecken eines gedrehten Rechtecks (wie rotated_rect in Python). */
export function rectCorners(mitte: Point, breite: number, tiefe: number, winkel: number): Point[] {
  const hw = breite / 2;
  const hd = tiefe / 2;
  return (
    [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [-hw, hd],
    ] as Point[]
  ).map((p) => rotate([mitte[0] + p[0], mitte[1] + p[1]], winkel, mitte));
}

/** Zellen als Quadrate (Ecke unten links, Größe). */
export function cellRects(form: Extract<Form, { art: "zellen" }>): { x: number; y: number; s: number }[] {
  const x0 = form.x0 ?? 0;
  const y0 = form.y0 ?? 0;
  return form.zellen.map(([i, j]) => ({ x: x0 + i * form.groesse, y: y0 + j * form.groesse, s: form.groesse }));
}

export function cellOf(p: Point, size: number, x0 = 0, y0 = 0): Point {
  return [Math.floor((p[0] - x0) / size), Math.floor((p[1] - y0) / size)];
}

/** Umriss einer Form als Vieleck (bei Zellen: die Hülle der Zellen-Rechtecke). */
export function formPoints(form: Form): Point[] {
  if (form.art === "vieleck") return form.punkte;
  if (form.art === "rechteck") return rectCorners(form.mitte, form.breite, form.tiefe, form.winkel);
  const rects = cellRects(form);
  const xs = rects.flatMap((r) => [r.x, r.x + r.s]);
  const ys = rects.flatMap((r) => [r.y, r.y + r.s]);
  if (!xs.length) return [];
  const [x1, x2, y1, y2] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

export function inPolygon([x, y]: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < xi + ((y - yi) * (xj - xi)) / (yj - yi)) inside = !inside;
  }
  return inside;
}

export function inForm(p: Point, form: Form): boolean {
  if (form.art === "zellen") {
    const [i, j] = cellOf(p, form.groesse, form.x0 ?? 0, form.y0 ?? 0);
    return form.zellen.some(([a, b]) => a === i && b === j);
  }
  return inPolygon(p, formPoints(form));
}

export function centroid(points: Point[]): Point {
  if (!points.length) return [0, 0];
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [x1, y1] = points[j];
    const [x2, y2] = points[i];
    const f = x1 * y2 - x2 * y1;
    a += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  if (Math.abs(a) < 1e-9) {
    return [points.reduce((s, p) => s + p[0], 0) / points.length, points.reduce((s, p) => s + p[1], 0) / points.length];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

export function formCenter(form: Form): Point {
  if (form.art === "rechteck") return form.mitte;
  if (form.art === "zellen") {
    const rects = cellRects(form);
    const n = rects.length || 1;
    return [rects.reduce((s, r) => s + r.x + r.s / 2, 0) / n, rects.reduce((s, r) => s + r.y + r.s / 2, 0) / n];
  }
  return centroid(form.punkte);
}

export function polygonArea(points: Point[]): number {
  let a = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    a += points[j][0] * points[i][1] - points[i][0] * points[j][1];
  }
  return Math.abs(a) / 2;
}

function cross(a: Point, b: Point, c: Point): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/** Echte Überschneidung zweier Kanten (wie in Python). */
export function selfIntersects(points: Point[]): boolean {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) === 1 || Math.abs(i - j) === n - 1) continue;
      const [a, b] = [points[i], points[(i + 1) % n]];
      const [c, d] = [points[j], points[(j + 1) % n]];
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true;
    }
  }
  return false;
}

/** Fehler der Form im Klartext, oder "" wenn sie gültig ist. */
export function formProblem(form: Form): string {
  if (form.art === "zellen") return form.zellen.length ? "" : "Keine Zelle gewählt";
  if (form.art === "rechteck") return form.breite > 0 && form.tiefe > 0 ? "" : "Rechteck ohne Fläche";
  if (form.punkte.length < 3) return "Mindestens drei Ecken";
  if (selfIntersects(form.punkte)) return "Kanten überschneiden sich";
  if (polygonArea(form.punkte) < 1) return "Vieleck ohne Fläche";
  return "";
}

/** Form verschieben. */
export function moveForm(form: Form, dx: number, dy: number): Form {
  if (form.art === "vieleck") return { ...form, punkte: form.punkte.map((p) => round1([p[0] + dx, p[1] + dy])) };
  if (form.art === "rechteck") return { ...form, mitte: round1([form.mitte[0] + dx, form.mitte[1] + dy]) };
  // Zellen nur um ganze Zellen.
  const di = Math.round(dx / form.groesse);
  const dj = Math.round(dy / form.groesse);
  return { ...form, zellen: form.zellen.map(([i, j]) => [i + di, j + dj] as Point) };
}

/** Richtungsvektor des Sensors (0° = +y). */
export function sensorDirection(winkel: number): Point {
  const a = rad(winkel);
  return [-Math.sin(a), Math.cos(a)];
}

/** Kreissegment der Abdeckung als Punktliste (für einen SVG-Pfad). */
export function sectorPoints(origin: Point, winkel: number, reichweite: number, oeffnung: number, steps = 36): Point[] {
  const out: Point[] = [];
  const full = oeffnung >= 360;
  if (!full) out.push(origin);
  const start = winkel - oeffnung / 2;
  for (let k = 0; k <= steps; k++) {
    const a = start + (oeffnung * k) / steps;
    const [dx, dy] = sensorDirection(a);
    out.push([origin[0] + dx * reichweite, origin[1] + dy * reichweite]);
  }
  return out;
}

/** Sensor → Raum (wie Pose.to_room). */
export function sensorToRoom(p: Point, sensor: { x: number; y: number; winkel: number }): Point {
  const r = rotate(p, sensor.winkel);
  return [sensor.x + r[0], sensor.y + r[1]];
}

/** Winkel (Grad) von a nach b, im Sinne des Sensors (0° = +y). */
export function headingTo(a: Point, b: Point): number {
  const deg = (Math.atan2(-(b[0] - a[0]), b[1] - a[1]) * 180) / Math.PI;
  return Math.round(deg * 10) / 10;
}

/** Abstand Punkt–Strecke. */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return distance(p, a);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return distance(p, [a[0] + t * dx, a[1] + t * dy]);
}

/** Sensor → Raum und zurück für eine ganze Lage. */
export interface Lage {
  x: number;
  y: number;
  winkel: number;
}

export function roomToSensor(p: Point, s: Lage): Point {
  return rotate([p[0] - s.x, p[1] - s.y], -s.winkel);
}

/**
 * Eine Form so verschieben/drehen, wie sich der Sensor bewegt hat (die Zone
 * bleibt an derselben Stelle *aus Sicht des Sensors*). Zellen lassen sich
 * nicht drehen; sie wandern nur mit, wenn der Sensor nicht gedreht wurde.
 */
export function moveWithSensor(form: Form, from: Lage, to: Lage): Form {
  const map = (p: Point) => round1(sensorToRoom(roomToSensor(p, from), to));
  if (form.art === "vieleck") return { ...form, punkte: form.punkte.map(map) };
  if (form.art === "rechteck") {
    let winkel = form.winkel + to.winkel - from.winkel;
    if (winkel > 180) winkel -= 360;
    if (winkel <= -180) winkel += 360;
    return { ...form, mitte: map(form.mitte), winkel: Math.round(winkel * 10) / 10 };
  }
  if (from.winkel !== to.winkel) return form;
  return moveForm(form, to.x - from.x, to.y - from.y);
}

// -- Hausplan: Räume liegen gedreht und verschoben im Haus ------------------

export interface HausLage {
  x: number;
  y: number;
  winkel: number;
}

/** Punkt im Raum → Punkt im Haus. */
export function toHouse(p: Point, lage: HausLage): Point {
  const [x, y] = rotate(p, lage.winkel);
  return [x + lage.x, y + lage.y];
}

/** Punkt im Haus → Punkt im Raum. */
export function fromHouse(p: Point, lage: HausLage): Point {
  return rotate([p[0] - lage.x, p[1] - lage.y], -lage.winkel);
}

/** Umriss eines Raums: die Wände, sonst ein Rechteck um Zonen und Sensor. */
export function roomOutline(umriss: Point[], forms: Form[], sensor: Point): Point[] {
  if (umriss.length >= 3) return umriss;
  const pts: Point[] = [sensor];
  for (const f of forms) pts.push(...formPoints(f));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const m = 40;
  const [x1, x2] = [Math.min(...xs) - m, Math.max(...xs) + m];
  const [y1, y2] = [Math.min(...ys) - m, Math.max(...ys) + m];
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

/** Räume ohne Lage nebeneinander legen (rechts an die schon gesetzten). */
export function defaultLagen(
  raeume: { id: string; outline: Point[]; lage: HausLage | null }[],
  gap = 100,
): Record<string, HausLage> {
  const out: Record<string, HausLage> = {};
  let right = -Infinity;
  for (const r of raeume) {
    if (!r.lage) continue;
    out[r.id] = r.lage;
    for (const p of r.outline) right = Math.max(right, toHouse(p, r.lage)[0]);
  }
  if (right === -Infinity) right = -gap;
  for (const r of raeume) {
    if (r.lage) continue;
    const minX = Math.min(...r.outline.map((p) => p[0]));
    const maxX = Math.max(...r.outline.map((p) => p[0]));
    const lage = { x: right + gap - minX, y: 0, winkel: 0 };
    out[r.id] = lage;
    right = lage.x + maxX;
  }
  return out;
}
