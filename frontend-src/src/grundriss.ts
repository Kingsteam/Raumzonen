/**
 * Grundriss übernehmen: aus einem exportierten Plan (z. B. UniFi Design
 * Center, PDF mit eingebettetem Bild) Räume, Wände und Lücken erkennen.
 *
 * Erkannt wird im Browser, nichts verlässt ihn:
 * - Räume: Flächen, die von den blauen Umrisslinien des Scans umschlossen
 *   sind (gefüllt, nur ganz innen, nicht am Bildrand, nicht zu klein).
 * - Wände: dunkle Linien entlang dieser Umrisse; wo keine Wand ist, ist eine
 *   Lücke (Tür, Durchgang oder Fenster). Lücken zwischen zwei Räumen sind
 *   vermutlich Türen, Lücken in Außenwänden vermutlich Fenster.
 *
 * Ein PDF enthält keinen Maßstab: die Umrechnung von Bildpunkten in cm kommt
 * aus einem Maß, das man selbst eingibt.
 */

import type { Point } from "./types";

export interface Bild {
  width: number;
  height: number;
  /** RGBA, wie `ImageData.data`. */
  data: Uint8ClampedArray;
}

export interface RaumFund {
  /** Ecken in Bildpunkten (y nach unten), Reihenfolge entlang der Wände. */
  punkte: Point[];
  flaeche_px: number;
}

export interface Luecke {
  raum: number;
  /** Wand von Ecke `kante` zu `kante + 1`. */
  kante: number;
  /** Abschnitt in Bildpunkten ab Ecke `kante`. */
  von_px: number;
  bis_px: number;
  /** Anderer Raum hinter der Lücke (dann vermutlich eine Tür). */
  partner: number | null;
}

export interface Grundriss {
  breite: number;
  hoehe: number;
  raeume: RaumFund[];
  luecken: Luecke[];
}

// -- PDF: eingebettetes JPEG herausholen -------------------------------------

/** Größtes eingebettetes JPEG eines PDF (so exportiert UniFi den Plan). */
export function jpegAusPdf(pdf: Uint8Array): Uint8Array | null {
  const ende = new TextEncoder().encode("endstream");
  let best: Uint8Array | null = null;
  for (let i = 0; i < pdf.length - 3; i++) {
    if (pdf[i] !== 0xff || pdf[i + 1] !== 0xd8 || pdf[i + 2] !== 0xff) continue;
    let j = i + 3;
    outer: for (; j < pdf.length - ende.length; j++) {
      for (let k = 0; k < ende.length; k++) if (pdf[j + k] !== ende[k]) continue outer;
      break;
    }
    // Letztes FF D9 (Bildende) vor „endstream“.
    let e = j;
    while (e > i && !(pdf[e - 2] === 0xff && pdf[e - 1] === 0xd9)) e--;
    if (e > i && (!best || e - i > best.length)) best = pdf.subarray(i, e);
    i = j;
  }
  return best;
}

// -- Erkennen ----------------------------------------------------------------

interface Masken {
  w: number;
  h: number;
  blau: Uint8Array;
  dunkel: Uint8Array;
}

function masken(bild: Bild, s: number): Masken {
  const w = Math.floor(bild.width / s);
  const h = Math.floor(bild.height / s);
  const blau = new Uint8Array(w * h);
  const dunkel = new Uint8Array(w * h);
  const d = bild.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let b = 0;
      let k = 0;
      for (let dy = 0; dy < s; dy++) {
        for (let dx = 0; dx < s; dx++) {
          const o = ((y * s + dy) * bild.width + (x * s + dx)) * 4;
          const [r, g, bl] = [d[o], d[o + 1], d[o + 2]];
          if (bl > r + 40 && bl > g + 10 && bl > 120) b = 1;
          if (r + g + bl < 270) k = 1;
        }
      }
      blau[y * w + x] = b;
      dunkel[y * w + x] = k;
    }
  }
  // Blaue Linien um einen Punkt verbreitern, damit keine Fläche durchsickert.
  const dick = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++)
      if (blau[y * w + x]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dick[(y + dy) * w + x + dx] = 1;
  return { w, h, blau: dick, dunkel };
}

/** Flächen ohne blaue Linie durchnummerieren (4er-Nachbarschaft). */
function flaechen(m: Masken): { label: Int32Array; anzahl: number } {
  const { w, h, blau } = m;
  const label = new Int32Array(w * h).fill(-1);
  const stack = new Int32Array(w * h);
  let anzahl = 0;
  for (let start = 0; start < w * h; start++) {
    if (blau[start] || label[start] >= 0) continue;
    let sp = 0;
    stack[sp++] = start;
    label[start] = anzahl;
    while (sp) {
      const p = stack[--sp];
      const x = p % w;
      const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w];
      for (const q of nb) {
        if (q < 0 || q >= w * h || blau[q] || label[q] >= 0) continue;
        label[q] = anzahl;
        stack[sp++] = q;
      }
    }
    anzahl++;
  }
  return { label, anzahl };
}

/** Rand einer Fläche entlanggehen (Moore-Nachbarschaft), im Uhrzeigersinn im Bild. */
function rand(label: Int32Array, w: number, h: number, id: number): Point[] {
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && label[y * w + x] === id;
  let sx = -1;
  let sy = -1;
  for (let p = 0; p < w * h; p++)
    if (label[p] === id) {
      sx = p % w;
      sy = Math.floor(p / w);
      break;
    }
  if (sx < 0) return [];
  const dirs: Point[] = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];
  const out: Point[] = [[sx, sy]];
  let [cx, cy] = [sx, sy];
  let dir = 7; // zuletzt „von oben“ gekommen
  for (let n = 0; n < w * h * 2; n++) {
    let found = false;
    for (let k = 0; k < 8; k++) {
      const d = (dir + 6 + k) % 8;
      const [nx, ny] = [cx + dirs[d][0], cy + dirs[d][1]];
      if (at(nx, ny)) {
        cx = nx;
        cy = ny;
        dir = d;
        found = true;
        break;
      }
    }
    if (!found || (cx === sx && cy === sy)) break;
    out.push([cx, cy]);
  }
  return out;
}

function abstandStrecke(p: Point, a: Point, b: Point): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/** Ramer-Douglas-Peucker: Linienzug vereinfachen. */
export function vereinfachen(pts: Point[], eps: number): Point[] {
  if (pts.length < 3) return pts;
  let best = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = abstandStrecke(pts[i], pts[0], pts[pts.length - 1]);
    if (d > best) {
      best = d;
      idx = i;
    }
  }
  if (best <= eps) return [pts[0], pts[pts.length - 1]];
  const a = vereinfachen(pts.slice(0, idx + 1), eps);
  const b = vereinfachen(pts.slice(idx), eps);
  return [...a.slice(0, -1), ...b];
}

/** Geschlossenen Umriss vereinfachen: an der entferntesten Ecke teilen. */
function vereinfacheRing(ring: Point[], eps: number): Point[] {
  if (ring.length < 4) return ring;
  let far = 0;
  let fd = 0;
  for (let i = 1; i < ring.length; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > fd) {
      fd = d;
      far = i;
    }
  }
  const a = vereinfachen(ring.slice(0, far + 1), eps);
  const b = vereinfachen([...ring.slice(far), ring[0]], eps);
  let out = [...a.slice(0, -1), ...b.slice(0, -1)];
  // Ecken, die fast auf einer Linie liegen, und Zacken (eine dünne Wand,
  // die in den Raum ragt: hin und zurück) entfernen.
  for (let changed = true; changed && out.length > 3; ) {
    changed = false;
    for (let i = 0; i < out.length; i++) {
      const p = out[(i - 1 + out.length) % out.length];
      const n = out[(i + 1) % out.length];
      const zacke = Math.hypot(p[0] - n[0], p[1] - n[1]) < eps * 3 && Math.hypot(out[i][0] - p[0], out[i][1] - p[1]) > eps * 3;
      if (zacke || abstandStrecke(out[i], p, n) < eps) {
        out = out.filter((_, k) => k !== i);
        changed = true;
        break;
      }
    }
  }
  return out;
}

function flaecheVon(pts: Point[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/**
 * Räume und Lücken erkennen. `schritt`: so viele Bildpunkte werden zu einem
 * zusammengefasst (schneller, gröber).
 */
export function erkenneGrundriss(bild: Bild, schritt = 2): Grundriss {
  const m = masken(bild, schritt);
  const { w, h } = m;
  const { label, anzahl } = flaechen(m);
  const groesse = new Int32Array(anzahl);
  const amRand = new Uint8Array(anzahl);
  const dunkel = new Int32Array(anzahl);
  for (let p = 0; p < w * h; p++) {
    const id = label[p];
    if (id < 0) continue;
    groesse[id]++;
    if (m.dunkel[p]) dunkel[id]++;
    const x = p % w;
    const y = (p / w) | 0;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) amRand[id] = 1;
  }
  const minFlaeche = w * h * 0.015;
  const ids: number[] = [];
  for (let id = 0; id < anzahl; id++) {
    if (amRand[id] || groesse[id] < minFlaeche || dunkel[id] > groesse[id] * 0.3) continue;
    ids.push(id);
  }
  const eps = Math.max(2, Math.hypot(w, h) * 0.006);
  const raeume: RaumFund[] = [];
  const nummer = new Map<number, number>();
  for (const id of ids) {
    const ring = vereinfacheRing(rand(label, w, h, id), eps);
    if (ring.length < 3) continue;
    nummer.set(id, raeume.length);
    raeume.push({ punkte: ring.map(([x, y]) => [(x + 0.5) * schritt, (y + 0.5) * schritt] as Point), flaeche_px: flaecheVon(ring) * schritt * schritt });
  }
  // Lücken: entlang jeder Wand nach dunklen Punkten quer zur Wand suchen.
  const T = Math.max(4, Math.round(16 / schritt));
  const minLuecke = Math.max(6, Math.round(40 / schritt));
  const minWand = Math.max(2, Math.round(6 / schritt));
  const luecken: Luecke[] = [];
  raeume.forEach((r, ri) => {
    const pts = r.punkte.map(([x, y]) => [x / schritt, y / schritt] as Point);
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < minLuecke) return;
      const [ux, uy] = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
      const [nx, ny] = [-uy, ux];
      let start = -1;
      const fertig = (bis: number) => {
        if (start >= 0 && bis - start >= minLuecke && start > 2 && bis < len - 2) {
          // Was liegt hinter der Lücke? Ein Stück nach außen schauen.
          const t = (start + bis) / 2;
          let partner: number | null = null;
          for (const sgn of [1, -1]) {
            const px = Math.round(a[0] + ux * t + nx * sgn * T * 2.5);
            const py = Math.round(a[1] + uy * t + ny * sgn * T * 2.5);
            if (px < 0 || py < 0 || px >= w || py >= h) continue;
            const other = nummer.get(label[py * w + px]);
            if (other !== undefined && other !== ri) partner = other;
          }
          luecken.push({ raum: ri, kante: k, von_px: start * schritt, bis_px: bis * schritt, partner });
        }
        start = -1;
      };
      for (let t = 0; t <= len; t++) {
        // Wand = ein dickes dunkles Stück quer zur Linie; dünne Striche
        // (Fensterrahmen, Schiebetür) zählen nicht.
        let wand = false;
        let lauf = 0;
        for (let o = -T; o <= T && !wand; o++) {
          const px = Math.round(a[0] + ux * t + nx * o);
          const py = Math.round(a[1] + uy * t + ny * o);
          const d = px >= 0 && py >= 0 && px < w && py < h && m.dunkel[py * w + px];
          lauf = d ? lauf + 1 : 0;
          if (lauf >= minWand) wand = true;
        }
        if (!wand && start < 0) start = t;
        if (wand && start >= 0) fertig(t);
      }
      fertig(len);
    });
  });
  return { breite: bild.width, hoehe: bild.height, raeume, luecken };
}

// -- In Raumzonen übernehmen -----------------------------------------------

export function bbox(pts: Point[]): { x0: number; y0: number; x1: number; y1: number } {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

export interface Uebernahme {
  /** Ecken im Raum (cm, y nach oben), erste Ecke unten links. */
  umriss: Point[];
  /** Lage im Haus, so dass die Räume wie im Plan liegen. */
  haus: { x: number; y: number; winkel: number };
  /** Lücken auf den Wänden des Umrisses (cm ab Ecke `kante`). */
  luecken: { kante: number; von: number; bis: number; luecke: number }[];
}

/**
 * Einen gefundenen Raum in Raumkoordinaten umrechnen. `cmProPx` aus dem
 * eingegebenen Maß; `verschiebung`: so viel wird der Umriss im Raum
 * verschoben (damit er zu vorhandenen Zonen passt), die Lage im Haus gleicht
 * das aus.
 */
export function uebernehmen(g: Grundriss, index: number, cmProPx: number, verschiebung: Point = [0, 0]): Uebernahme {
  const r = g.raeume[index];
  const b = bbox(r.punkte);
  // Bild: y nach unten. Raum: y nach oben, Ursprung unten links am Raum.
  const zuRaum = ([x, y]: Point): Point => [Math.round((x - b.x0) * cmProPx + verschiebung[0]), Math.round((b.y1 - y) * cmProPx + verschiebung[1])];
  let umriss = r.punkte.map(zuRaum);
  // Spiegeln (y nach oben) dreht die Reihenfolge um; Wände bleiben dieselben.
  const map = r.punkte.map((_, i) => i);
  // Ecken so drehen, dass die erste unten links liegt (schöner zu lesen).
  let start = 0;
  umriss.forEach((p, i) => {
    if (p[0] + p[1] < umriss[start][0] + umriss[start][1]) start = i;
  });
  umriss = [...umriss.slice(start), ...umriss.slice(0, start)];
  const neu = [...map.slice(start), ...map.slice(0, start)];
  const n = umriss.length;
  const luecken: Uebernahme["luecken"] = [];
  g.luecken.forEach((l, li) => {
    if (l.raum !== index) return;
    const k = neu.indexOf(l.kante);
    if (k < 0) return;
    const a = umriss[k];
    const e = umriss[(k + 1) % n];
    const len = Math.hypot(e[0] - a[0], e[1] - a[1]);
    const von = Math.max(0, Math.round(l.von_px * cmProPx));
    const bis = Math.min(Math.floor(len), Math.round(l.bis_px * cmProPx));
    if (bis - von >= 30) luecken.push({ kante: k, von, bis, luecke: li });
  });
  const haus = { x: Math.round(b.x0 * cmProPx - verschiebung[0]), y: Math.round((g.hoehe - b.y1) * cmProPx - verschiebung[1]), winkel: 0 };
  return { umriss, haus, luecken };
}
