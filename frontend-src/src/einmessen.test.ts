import { describe, expect, it } from "vitest";
import { ankerStellen, besteDrei, einmessen, stelle, stellenProblem } from "./einmessen";
import { roomToSensor, sensorToRoom } from "./geometry";
import type { Point } from "./types";

const raum: Point[] = [
  [50, 80],
  [320, 40],
  [200, 380],
];

describe("einmessen", () => {
  it("findet eine bekannte Lage wieder", () => {
    const lage = { x: 410, y: -20, winkel: 127 };
    const sensor = raum.map((p) => roomToSensor(p, lage));
    const e = einmessen(sensor, raum)!;
    expect(e.x).toBeCloseTo(410, 0);
    expect(e.y).toBeCloseTo(-20, 0);
    expect(e.winkel).toBeCloseTo(127, 1);
    expect(e.rest_cm).toBeLessThan(0.5);
    // Rückrechnung wie im Panel
    const p = sensorToRoom(sensor[2], e);
    expect(p[0]).toBeCloseTo(200, 0);
  });

  it("verkraftet Ungenauigkeit des Sensors", () => {
    const lage = { x: 0, y: 0, winkel: -90 };
    const sensor = raum.map((p, i) => {
      const q = roomToSensor(p, lage);
      return [q[0] + [8, -6, 5][i], q[1] + [-5, 7, -9][i]] as Point;
    });
    const e = einmessen(sensor, raum)!;
    expect(Math.hypot(e.x, e.y)).toBeLessThan(20);
    expect(Math.abs(e.winkel + 90)).toBeLessThan(4);
    expect(e.rest_cm).toBeGreaterThan(1);
    expect(e.rest_cm).toBeLessThan(15);
  });

  it("winkel bleibt zwischen -180 und 180", () => {
    const lage = { x: 10, y: 10, winkel: 180 };
    const e = einmessen(raum.map((p) => roomToSensor(p, lage)), raum)!;
    expect(e.winkel).toBe(180);
  });
});

describe("stellen", () => {
  it("warnt bei schlechten Stellen", () => {
    expect(stellenProblem(raum)).toBe("");
    expect(stellenProblem([[0, 0], [50, 0], [300, 200]])).toMatch(/zu nah/);
    expect(stellenProblem([[0, 0], [200, 5], [400, 0]])).toMatch(/Linie/);
  });

  it("Median gegen Ausreißer", () => {
    const s = stelle([[100, 100], [102, 99], [98, 101], [101, 100], [300, 300]])!;
    expect(s.punkt).toEqual([101, 100]);
    expect(s.streuung_cm).toBeLessThan(3);
  });
});

describe("ankerStellen", () => {
  it("Ecken und Türen eines Rechtecks, drei weit auseinander", () => {
    const wand: Point[] = [
      [0, 0],
      [400, 0],
      [400, 300],
      [0, 300],
    ];
    const a = ankerStellen(wand, [{ punkt: [200, 0], name: "Tür" }]);
    expect(a.map((x) => x.punkt)).toEqual([
      [50, 50],
      [350, 50],
      [350, 250],
      [50, 250],
      [200, 50],
    ]);
    expect(a[4].name).toBe("vor Tür");
    const drei = besteDrei(a);
    expect(drei).toHaveLength(3);
    expect(stellenProblem(drei.map((i) => a[i].punkt))).toBe("");
  });
});
