import { describe, expect, it } from "vitest";
import {
  cellOf,
  formPoints,
  formProblem,
  headingTo,
  inForm,
  moveForm,
  rectCorners,
  sectorPoints,
  sensorDirection,
  sensorToRoom,
} from "./geometry";
import type { Form } from "./types";

describe("Formen", () => {
  it("gedrehtes Rechteck wie in Python", () => {
    const pts = rectCorners([0, 0], 200, 50, 90);
    // 200 breit, um 90° gedreht → 200 hoch
    const ys = pts.map((p) => p[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(200);
    expect(inForm([0, 90], { art: "rechteck", mitte: [0, 0], breite: 200, tiefe: 50, winkel: 90 })).toBe(true);
    expect(inForm([90, 0], { art: "rechteck", mitte: [0, 0], breite: 200, tiefe: 50, winkel: 90 })).toBe(false);
  });

  it("Zellen", () => {
    const form: Form = { art: "zellen", groesse: 25, zellen: [[0, 0], [1, 0]] };
    expect(inForm([30, 10], form)).toBe(true);
    expect(inForm([10, 30], form)).toBe(false);
    expect(cellOf([-1, 26], 25)).toEqual([-1, 1]);
    expect(formPoints(form)).toEqual([
      [0, 0],
      [50, 0],
      [50, 25],
      [0, 25],
    ]);
    expect(moveForm(form, 30, -20)).toEqual({ art: "zellen", groesse: 25, zellen: [[1, -1], [2, -1]] });
  });

  it("Fehler der Form", () => {
    expect(formProblem({ art: "vieleck", punkte: [[0, 0], [1, 1]] })).toMatch(/drei/);
    expect(formProblem({ art: "vieleck", punkte: [[0, 0], [100, 100], [100, 0], [0, 100]] })).toMatch(/überschneiden/);
    expect(formProblem({ art: "vieleck", punkte: [[0, 0], [100, 0], [0, 100]] })).toBe("");
    expect(formProblem({ art: "zellen", groesse: 25, zellen: [] })).toMatch(/Zelle/);
  });
});

describe("Sensor", () => {
  it("Richtung und Umrechnung wie core/pose.py", () => {
    const [dx, dy] = sensorDirection(90);
    expect(dx).toBeCloseTo(-1);
    expect(dy).toBeCloseTo(0);
    const p = sensorToRoom([0, 200], { x: 100, y: 0, winkel: 90 });
    expect(p[0]).toBeCloseTo(-100);
    expect(p[1]).toBeCloseTo(0);
    expect(headingTo([0, 0], [-10, 0])).toBeCloseTo(90);
  });

  it("Kreissegment beginnt am Sensor", () => {
    const pts = sectorPoints([0, 0], 0, 600, 120, 4);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts).toHaveLength(6);
    const mid = pts[3];
    expect(mid[0]).toBeCloseTo(0);
    expect(mid[1]).toBeCloseTo(600);
    expect(sectorPoints([0, 0], 0, 100, 360, 4)).toHaveLength(5);
  });
});

describe("Zonen wandern mit dem Sensor", () => {
  it("Vieleck und Rechteck bleiben aus Sicht des Sensors gleich", async () => {
    const { moveWithSensor, roomToSensor } = await import("./geometry");
    const from = { x: 0, y: 0, winkel: 0 };
    const to = { x: 100, y: 0, winkel: 90 };
    const poly = moveWithSensor({ art: "vieleck", punkte: [[0, 200], [50, 200], [0, 250]] }, from, to);
    expect(poly.art === "vieleck" && poly.punkte[0]).toEqual([-100, 0]);
    const p = poly.art === "vieleck" ? poly.punkte[1] : ([0, 0] as [number, number]);
    const back = roomToSensor(p, to);
    expect(back[0]).toBeCloseTo(50);
    expect(back[1]).toBeCloseTo(200);
    const rect = moveWithSensor({ art: "rechteck", mitte: [0, 200], breite: 100, tiefe: 50, winkel: 0 }, from, to);
    expect(rect).toMatchObject({ mitte: [-100, 0], winkel: 90 });
  });

  it("Zellen nur beim Verschieben", async () => {
    const { moveWithSensor } = await import("./geometry");
    const cells = { art: "zellen" as const, groesse: 25, zellen: [[0, 0]] as [number, number][] };
    expect(moveWithSensor(cells, { x: 0, y: 0, winkel: 0 }, { x: 50, y: 0, winkel: 0 })).toEqual({ ...cells, zellen: [[2, 0]] });
    expect(moveWithSensor(cells, { x: 0, y: 0, winkel: 0 }, { x: 0, y: 0, winkel: 45 })).toBe(cells);
  });
});

describe("Hausplan", () => {
  it("Raum → Haus und zurück", async () => {
    const { toHouse, fromHouse } = await import("./geometry");
    const lage = { x: 500, y: 100, winkel: 90 };
    const h = toHouse([100, 0], lage);
    expect(h[0]).toBeCloseTo(500);
    expect(h[1]).toBeCloseTo(200);
    const r = fromHouse(h, lage);
    expect(r[0]).toBeCloseTo(100);
    expect(r[1]).toBeCloseTo(0);
  });

  it("Umriss ohne Wände und Räume nebeneinander", async () => {
    const { roomOutline, defaultLagen } = await import("./geometry");
    const outline = roomOutline([], [{ art: "vieleck", punkte: [[0, 0], [200, 0], [0, 100]] }], [100, -50]);
    expect(outline).toEqual([[-40, -90], [240, -90], [240, 140], [-40, 140]]);
    const lagen = defaultLagen([
      { id: "a", outline: [[0, 0], [300, 0], [300, 300], [0, 300]], lage: { x: 0, y: 0, winkel: 0 } },
      { id: "b", outline: [[-50, 0], [50, 0], [50, 100], [-50, 100]], lage: null },
    ]);
    expect(lagen.a).toEqual({ x: 0, y: 0, winkel: 0 });
    expect(lagen.b).toEqual({ x: 450, y: 0, winkel: 0 });
  });
});
