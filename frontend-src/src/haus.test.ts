import { describe, expect, it } from "vitest";
import { oeffnungMitte, summeDauer, tuerenVon, vereinigen, wechsel } from "./haus";
import type { Raum } from "./types";

const raum = (extra: Partial<Raum>): Raum =>
  ({
    id: "flur",
    name: "Flur",
    art: "melder",
    sensor: { x: 0, y: 0, winkel: 0, reichweite_cm: 600, oeffnung_grad: 120 },
    zonen: [],
    ansicht_winkel: 0,
    umriss: [[0, 0], [200, 0], [200, 300], [0, 300]],
    oeffnungen: [],
    aufnahme: true,
    aufnahme_tage: 30,
    haus_x: 0,
    haus_y: 0,
    haus_winkel: 0,
    haus_gesetzt: false,
    melder: [],
    melder_nachlauf_s: 0,
    ...extra,
  }) as Raum;

describe("tueren", () => {
  it("Mitte einer Tür in der Wand", () => {
    expect(oeffnungMitte([[0, 0], [200, 0], [200, 300]], { kante: 0, von: 20, bis: 100, art: "tuer" })).toEqual([60, 0]);
    expect(oeffnungMitte([[0, 0], [200, 0]], { kante: 0, von: 20, bis: 100, art: "tuer" })).toBeNull();
  });

  it("Zonen und Wandtüren", () => {
    const r = raum({
      oeffnungen: [{ kante: 1, von: 100, bis: 180, art: "tuer", fuehrt_zu: "kueche" }],
      zonen: [{ id: "tuer", name: "Tür", art: "ausgang", form: { art: "vieleck", punkte: [[0, 0], [10, 0], [10, 10], [0, 10]] }, fuehrt_zu: "aussen" } as never],
    });
    const t = tuerenVon(r);
    expect(t.map((x) => [x.key, x.ziel])).toEqual([
      ["flur/tuer", "aussen"],
      ["flur/#0", "kueche"],
    ]);
    expect(t[1].punkt).toEqual([200, 140]);
  });
});

describe("profil", () => {
  it("vereinigt Abschnitte", () => {
    expect(vereinigen([[[0, 10], [100, 200]], [[5, 50]]], 30)).toEqual([
      [0, 50],
      [100, 200],
    ]);
    expect(summeDauer([[0, 50], [100, 200]])).toBe(150);
  });

  it("findet Wechsel zwischen Räumen", () => {
    const w = wechsel({ bad: [[0, 100]], flur: [[95, 120]], kueche: [[130, 400]] }, 30);
    expect(w).toEqual([
      { zeit: 95, von: "bad", nach: "flur" },
      { zeit: 130, von: "flur", nach: "kueche" },
    ]);
  });
});
