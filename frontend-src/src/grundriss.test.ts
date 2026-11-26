import { describe, expect, it } from "vitest";
import { bbox, erkenneGrundriss, jpegAusPdf, jpegsAusPdf, uebernehmen, vereinfachen } from "./grundriss";
import type { Point } from "./types";

/** Erfundener Plan: zwei Räume nebeneinander, Tür in der Trennwand, Fenster rechts. */
function plan(): { width: number; height: number; data: Uint8ClampedArray } {
  const width = 600;
  const height = 400;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  const fill = (x0: number, y0: number, x1: number, y1: number, rgb: [number, number, number]) => {
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const o = (y * width + x) * 4;
        data[o] = rgb[0];
        data[o + 1] = rgb[1];
        data[o + 2] = rgb[2];
      }
  };
  const dunkel: [number, number, number] = [59, 59, 59];
  const blau: [number, number, number] = [60, 110, 200];
  const boden: [number, number, number] = [244, 244, 246];
  fill(40, 40, 560, 360, boden);
  // Außenwände 20 px, Trennwand bei x = 290..310
  fill(40, 40, 560, 60, dunkel);
  fill(40, 340, 560, 360, dunkel);
  fill(40, 40, 60, 360, dunkel);
  fill(540, 40, 560, 360, dunkel);
  fill(290, 40, 310, 360, dunkel);
  // Tür in der Trennwand (y 150..230), Fenster rechts (weiß mit dünnem Rahmen)
  fill(290, 150, 310, 230, boden);
  fill(540, 120, 560, 260, [255, 255, 255]);
  fill(540, 120, 541, 260, dunkel);
  fill(559, 120, 560, 260, dunkel);
  // Blaue Scan-Linien an der Innenseite der Wände
  const rahmen = (x0: number, y0: number, x1: number, y1: number) => {
    fill(x0, y0, x1, y0 + 2, blau);
    fill(x0, y1 - 2, x1, y1, blau);
    fill(x0, y0, x0 + 2, y1, blau);
    fill(x1 - 2, y0, x1, y1, blau);
  };
  rahmen(58, 58, 292, 342);
  rahmen(308, 58, 542, 342);
  return { width, height, data };
}

describe("erkennen", () => {
  it("findet zwei Räume, die Tür dazwischen und das Fenster", () => {
    const g = erkenneGrundriss(plan());
    expect(g.raeume.length).toBe(2);
    const [links, rechts] = [...g.raeume].sort((a, b) => bbox(a.punkte).x0 - bbox(b.punkte).x0);
    const bl = bbox(links.punkte);
    expect(bl.x0).toBeGreaterThan(50);
    expect(bl.x1).toBeLessThan(300);
    expect(links.punkte.length).toBe(4);
    const tueren = g.luecken.filter((l) => l.partner !== null);
    expect(tueren.length).toBe(2); // von beiden Seiten
    for (const t of tueren) expect(t.bis_px - t.von_px).toBeGreaterThan(60);
    const fenster = g.luecken.filter((l) => l.partner === null);
    expect(fenster.length).toBe(1);
    expect(g.raeume.indexOf(rechts)).toBe(fenster[0].raum);
  });

  it("rechnet in cm um und legt die Räume wie im Plan ins Haus", () => {
    const g = erkenneGrundriss(plan());
    const i = g.raeume.findIndex((r) => bbox(r.punkte).x0 < 100);
    const j = 1 - i;
    // 1 px = 2 cm
    const a = uebernehmen(g, i, 2);
    const b = uebernehmen(g, j, 2);
    const ba = bbox(a.umriss);
    expect(ba.x0).toBe(0);
    expect(ba.y0).toBe(0);
    expect(ba.x1).toBeGreaterThan(440);
    expect(ba.x1).toBeLessThan(500);
    // Rechter Raum liegt im Haus rechts vom linken, gleiche Höhe.
    expect(b.haus.x - a.haus.x).toBeGreaterThan(450);
    expect(Math.abs(b.haus.y - a.haus.y)).toBeLessThan(10);
    // Tür liegt auf einer Wand des Umrisses.
    expect(a.luecken.length).toBe(1);
    const t = a.luecken[0];
    const n = a.umriss.length;
    const [p, q] = [a.umriss[t.kante], a.umriss[(t.kante + 1) % n]];
    expect(t.bis).toBeLessThanOrEqual(Math.hypot(q[0] - p[0], q[1] - p[1]));
    expect(t.bis - t.von).toBeGreaterThan(120);
    // Verschoben: Umriss wandert, die Lage im Haus gleicht es aus.
    const v = uebernehmen(g, i, 2, [100, 50]);
    expect(v.umriss[0][0] - a.umriss[0][0]).toBe(100);
    expect(v.haus.x).toBe(a.haus.x - 100);
  });
});

it("vereinfacht Linien", () => {
  const pts: Point[] = [
    [0, 0],
    [5, 0.5],
    [10, 0],
    [10, 10],
  ];
  expect(vereinfachen(pts, 1)).toEqual([
    [0, 0],
    [10, 0],
    [10, 10],
  ]);
});

it("holt das JPEG aus einem PDF", () => {
  const head = new TextEncoder().encode("%PDF-1.4\n1 0 obj <</Filter /DCTDecode>> stream\n");
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const tail = new TextEncoder().encode("\nendstream endobj\n");
  const pdf = new Uint8Array([...head, ...jpg, ...tail]);
  expect(Array.from(jpegAusPdf(pdf)!)).toEqual(Array.from(jpg));
  expect(jpegAusPdf(new TextEncoder().encode("%PDF ohne Bild"))).toBeNull();
});

it("PDF mit zwei Grundrissen: beide Bilder in Reihenfolge", () => {
  const a = new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3, 0xff, 0xd9]);
  const b = new Uint8Array([0xff, 0xd8, 0xff, 9, 9, 0xff, 0xd9]);
  const t = (x: string) => new TextEncoder().encode(x);
  const teile = [t("%PDF stream\n"), a, t("\nendstream x stream\n"), b, t("\nendstream")];
  const pdf = new Uint8Array(teile.reduce((n, x) => n + x.length, 0));
  let o = 0;
  for (const x of teile) {
    pdf.set(x, o);
    o += x.length;
  }
  const bilder = jpegsAusPdf(pdf);
  expect(bilder.map((x) => Array.from(x))).toEqual([Array.from(a), Array.from(b)]);
  expect(Array.from(jpegAusPdf(pdf)!)).toEqual(Array.from(a));
});
