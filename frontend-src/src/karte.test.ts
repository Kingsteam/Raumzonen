import { describe, expect, it } from "vitest";
import { planZuHaus, rahmen, raumStand, stockwerkeVon } from "./karte-geo";
import type { Plan, Raum } from "./types";

describe("Dashboard-Karte", () => {
  it("Stockwerk: eigenes, sonst vom Bereich, sonst Bereich mit gleichem Namen", () => {
    const bereiche = [
      { id: "kueche", name: "Küche", stockwerk: "eg" },
      { id: "bad", name: "Bad", stockwerk: "og" },
    ];
    const r = (extra: Partial<Raum>) => ({ id: "x", name: "Bad", stockwerke: [], bereich_id: "", ...extra }) as unknown as Raum;
    expect(stockwerkeVon(r({ stockwerke: ["eg", "og"] }), bereiche)).toEqual(["eg", "og"]);
    expect(stockwerkeVon(r({ bereich_id: "kueche" }), bereiche)).toEqual(["eg"]);
    expect(stockwerkeVon(r({}), bereiche)).toEqual(["og"]);
  });

  it("Grundriss ins Haus wie im Panel, Rahmen mit Rand", () => {
    const p = { id: "p", name: "P", cm_pro_px: 2, breite_px: 100, hoehe_px: 50, x: 10, y: 20, winkel: 0 } as Plan;
    expect(planZuHaus(p, 0, 50)).toEqual([10, 20]);
    expect(planZuHaus(p, 100, 0)).toEqual([210, 120]);
    expect(rahmen([[0, 0], [100, 50]], 10)).toEqual([-10, -10, 110, 60]);
  });

  it("Personen je Raum: Zahl bei Radar, „da“ bei Meldern, nichts bei Ausfall", () => {
    const live = (belegt: boolean, personen: number, verfuegbar = true) => ({ verfuegbar, problem: null, zonen: { anwesenheit: { belegt, personen } } });
    expect(raumStand({ art: "radar" }, live(true, 2))).toEqual({ ok: true, da: true, personen: 2, text: "2 Personen" });
    expect(raumStand({ art: "radar" }, live(true, 1)).text).toBe("1 Person");
    expect(raumStand({ art: "radar" }, live(false, 0))).toEqual({ ok: true, da: false, personen: 0, text: "niemand" });
    // Belegt, aber keine gezählte Person (gehaltene Figur): mindestens 1.
    expect(raumStand({ art: "radar" }, live(true, 0)).personen).toBe(1);
    expect(raumStand({ art: "melder" }, live(true, 0))).toEqual({ ok: true, da: true, personen: null, text: "jemand da" });
    expect(raumStand({ art: "radar" }, live(true, 2, false))).toMatchObject({ ok: false, personen: null, text: "nicht erreichbar" });
    expect(raumStand({ art: "radar" }, undefined).ok).toBe(false);
  });
});
