import { describe, expect, it } from "vitest";
import { dauer, deckkraft, dichte, pixel, summe } from "./heat";

describe("dichte", () => {
  it("leer gibt nichts", () => {
    expect(dichte([], 5)).toBeNull();
  });

  it("verteilt weich, behält die Summe", () => {
    const d = dichte([[10, 16, 100]], 5, 8)!;
    const total = d.werte.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100, 1);
    // Höchster Wert liegt in der Ausgangszelle.
    let best = 0;
    for (let n = 0; n < d.werte.length; n++) if (d.werte[n] > d.werte[best]) best = n;
    const x = best % d.nx, y = Math.floor(best / d.nx);
    expect(d.x0 + x * d.zelle).toBe(50);
    expect(d.y0 + y * d.zelle).toBe(80);
  });

  it("zwei Liegeplätze 30 cm auseinander bleiben zwei Flecken", () => {
    const d = dichte([[10, 16, 100], [16, 16, 100]], 5, 8)!;
    const row = Math.round((80 - d.y0) / 5);
    const at = (cm: number) => d.werte[row * d.nx + Math.round((cm - d.x0) / 5)];
    expect(at(65)).toBeLessThan(at(50) * 0.5);
  });
});

describe("pixel und deckkraft", () => {
  it("oberste Zeile ist das größte y", () => {
    const d = dichte([[0, 0, 10], [0, 20, 1000]], 5, 3)!;
    const px = pixel(d, [255, 0, 0]);
    // Der starke Fleck (y = 100 cm) liegt in der oberen Bildhälfte.
    let upper = 0, lower = 0;
    for (let y = 0; y < d.ny; y++)
      for (let x = 0; x < d.nx; x++) (y < d.ny / 2 ? (upper += px[(y * d.nx + x) * 4 + 3]) : (lower += px[(y * d.nx + x) * 4 + 3]));
    expect(upper).toBeGreaterThan(lower);
  });

  it("kurzes bleibt neben langem sichtbar", () => {
    expect(deckkraft(1, 28800)).toBeGreaterThan(0.05);
    expect(deckkraft(0.1, 28800)).toBe(0);
    expect(deckkraft(28800, 28800)).toBe(1);
  });
});

it("summe zählt gleiche Zellen zusammen", () => {
  expect(summe([[[1, 2, 3]], [[1, 2, 4], [5, 5, 1]]])).toEqual([[1, 2, 7], [5, 5, 1]]);
});

it("dauer in Worten", () => {
  expect(dauer(45)).toBe("45 s");
  expect(dauer(720)).toBe("12 min");
  expect(dauer(24000)).toBe("6 h 40 min");
  expect(dauer(7200)).toBe("2 h");
});

import { flecken } from "./heat";

describe("flecken", () => {
  it("findet zwei Liegeplätze und übersieht kurzes Durchgehen", () => {
    const cells: [number, number, number][] = [];
    // zwei Liegeplätze (5-cm-Zellen) mit je 2 h, dazu ein Weg mit 5 s
    for (let i = 0; i < 8; i++) for (let j = 0; j < 12; j++) {
      cells.push([10 + i, 20 + j, 7200 / 96]);
      cells.push([30 + i, 20 + j, 7200 / 96]);
    }
    for (let i = 0; i < 60; i++) cells.push([i, 5, 5 / 60]);
    const d = dichte(cells, 5, 8)!;
    const f = flecken(d, 300);
    expect(f.length).toBe(2);
    for (const x of f) {
      expect(x.sekunden).toBeGreaterThan(3000);
      expect(x.breite).toBeGreaterThan(40);
      expect(x.breite).toBeLessThan(110);
    }
    const xs = f.map((x) => x.mitte[0]).sort((a, b) => a - b);
    expect(xs[1] - xs[0]).toBeGreaterThan(80);
  });
});
