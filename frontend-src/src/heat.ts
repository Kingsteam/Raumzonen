/**
 * Bewegungskarte als weiche Flecken statt Kästchen.
 *
 * Aus Aufenthaltsdauern je Zelle (Sekunden) wird mit einem Gauß-Filter eine
 * glatte Dichte; daraus ein kleines Bild, das der Browser beim Vergrößern
 * weich zeichnet. Rechnet in Millisekunden (getrennter Filter, kleine Gitter).
 */

export type HeatCell = [number, number, number];

export interface Dichte {
  /** Untere linke Ecke in cm (Raumkoordinaten, y nach oben). */
  x0: number;
  y0: number;
  zelle: number;
  nx: number;
  ny: number;
  werte: Float32Array;
  max: number;
}

/** Höchstens so viele Zellen je Richtung (schützt den Browser). */
const MAX_N = 600;

function kernel(sigma: number): Float32Array {
  const r = Math.max(1, Math.ceil(sigma * 3));
  const k = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    k[i + r] = v;
    sum += v;
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  return k;
}

/** Glatte Dichte aus Zellen; ``sigmaCm`` = wie weich (Ungenauigkeit des Sensors). */
export function dichte(zellen: HeatCell[], zelleCm: number, sigmaCm = 8): Dichte | null {
  if (!zellen.length || !(zelleCm > 0)) return null;
  let i0 = Infinity, i1 = -Infinity, j0 = Infinity, j1 = -Infinity;
  for (const [i, j] of zellen) {
    i0 = Math.min(i0, i);
    i1 = Math.max(i1, i);
    j0 = Math.min(j0, j);
    j1 = Math.max(j1, j);
  }
  const sigma = Math.max(0.6, sigmaCm / zelleCm);
  const k = kernel(sigma);
  const r = (k.length - 1) / 2;
  i0 -= r;
  j0 -= r;
  const nx = Math.min(MAX_N, i1 - i0 + 1 + r);
  const ny = Math.min(MAX_N, j1 - j0 + 1 + r);
  const roh = new Float32Array(nx * ny);
  for (const [i, j, s] of zellen) {
    const x = i - i0, y = j - j0;
    if (x >= 0 && x < nx && y >= 0 && y < ny && s > 0) roh[y * nx + x] += s;
  }
  // Getrennter Filter: erst waagrecht, dann senkrecht.
  const tmp = new Float32Array(nx * ny);
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const v = roh[y * nx + x];
      if (!v) continue;
      for (let d = -r; d <= r; d++) {
        const xx = x + d;
        if (xx >= 0 && xx < nx) tmp[y * nx + xx] += v * k[d + r];
      }
    }
  }
  const werte = new Float32Array(nx * ny);
  let max = 0;
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const v = tmp[y * nx + x];
      if (!v) continue;
      for (let d = -r; d <= r; d++) {
        const yy = y + d;
        if (yy >= 0 && yy < ny) werte[yy * nx + x] += v * k[d + r];
      }
    }
  }
  for (let n = 0; n < werte.length; n++) max = Math.max(max, werte[n]);
  return { x0: i0 * zelleCm, y0: j0 * zelleCm, zelle: zelleCm, nx, ny, werte, max };
}

/**
 * Deckkraft 0..1 je Wert: logarithmisch, damit kurzes Durchgehen neben
 * stundenlangem Liegen sichtbar bleibt. Unter ``schwelle`` Sekunden: leer.
 */
export function deckkraft(v: number, max: number, schwelle = 0.2): number {
  if (!(v > schwelle) || !(max > 0)) return 0;
  return Math.min(1, Math.log1p(v) / Math.log1p(max));
}

/** RGBA-Pixel (oberste Zeile = größtes y), eine Farbe, Stärke über die Deckkraft. */
export function pixel(d: Dichte, rgb: [number, number, number], maxAlpha = 0.85): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(d.nx * d.ny * 4);
  for (let y = 0; y < d.ny; y++) {
    const row = d.ny - 1 - y;
    for (let x = 0; x < d.nx; x++) {
      const a = deckkraft(d.werte[y * d.nx + x], d.max);
      if (!a) continue;
      const o = (row * d.nx + x) * 4;
      out[o] = rgb[0];
      out[o + 1] = rgb[1];
      out[o + 2] = rgb[2];
      out[o + 3] = Math.round(255 * maxAlpha * (0.15 + 0.85 * a));
    }
  }
  return out;
}

/** Zellen mehrerer Figuren zusammenzählen. */
export function summe(listen: HeatCell[][]): HeatCell[] {
  const m = new Map<string, HeatCell>();
  for (const l of listen) {
    for (const [i, j, s] of l) {
      const key = `${i},${j}`;
      const c = m.get(key);
      if (c) c[2] += s;
      else m.set(key, [i, j, s]);
    }
  }
  return [...m.values()];
}

/** Dauer in Worten: „45 s“, „12 min“, „6 h 40 min“. */
export function dauer(s: number): string {
  if (s < 60) return `${Math.round(s)} s`;
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export interface Fleck {
  /** Rechteck um den Fleck (cm, Raumkoordinaten). */
  mitte: [number, number];
  breite: number;
  tiefe: number;
  /** Aufenthalt in diesem Fleck (s). */
  sekunden: number;
}

/**
 * Orte, an denen sich jemand lange aufgehalten hat: zusammenhängende Flächen
 * der Dichte über `anteil` des Höchstwerts mit mindestens `minSekunden`
 * Aufenthalt. Grundlage für Vorschläge neuer Zonen (Bett, Sofa, Schreibtisch).
 */
export function flecken(d: Dichte, minSekunden = 300, anteil = 0.2, rand_cm = 15): Fleck[] {
  const { nx, ny, werte } = d;
  const grenze = d.max * anteil;
  const seen = new Uint8Array(nx * ny);
  const out: Fleck[] = [];
  for (let s = 0; s < nx * ny; s++) {
    if (seen[s] || werte[s] < grenze) continue;
    const stack = [s];
    seen[s] = 1;
    let [x0, x1, y0, y1, sum] = [Infinity, -Infinity, Infinity, -Infinity, 0];
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % nx;
      const y = (p / nx) | 0;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      sum += werte[p];
      for (const q of [x > 0 ? p - 1 : -1, x < nx - 1 ? p + 1 : -1, p - nx, p + nx]) {
        if (q < 0 || q >= nx * ny || seen[q] || werte[q] < grenze) continue;
        seen[q] = 1;
        stack.push(q);
      }
    }
    if (sum < minSekunden) continue;
    const breite = (x1 - x0 + 1) * d.zelle + 2 * rand_cm;
    const tiefe = (y1 - y0 + 1) * d.zelle + 2 * rand_cm;
    out.push({
      mitte: [Math.round(d.x0 + ((x0 + x1 + 1) / 2) * d.zelle), Math.round(d.y0 + ((y0 + y1 + 1) / 2) * d.zelle)],
      breite: Math.round(breite),
      tiefe: Math.round(tiefe),
      sekunden: Math.round(sum),
    });
  }
  return out.sort((a, b) => b.sekunden - a.sekunden);
}
