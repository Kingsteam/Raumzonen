import { describe, expect, it } from "vitest";
import {
  History,
  applyRolle,
  kommenGehen,
  kommenGehenText,
  rolleOf,
  newZone,
  paintCell,
  rectFromDrag,
  rectRotateHandle,
  removeVertex,
  resizeRect,
  rotateRect,
  setVertex,
  zoneFromConverter,
  zonesProblem,
} from "./editor";
import type { Form, Live, Regel, Zone } from "./types";

const REGEL: Regel = {
  belegt_nach_s: 1,
  frei_nach_s: 5,
  rand_cm: 20,
  schlaefer_halten: false,
  weg_rahmen: 3,
  weg_cm: 60,
  max_personen: 0,
  hund_ignorieren: false,
};
const VORLAGEN = {
  normal: REGEL,
  bett: { ...REGEL, schlaefer_halten: true, max_personen: 1 },
  ausgang: { ...REGEL, belegt_nach_s: 0 },
  hundeplatz: REGEL,
  stoerquelle: REGEL,
  stelle: { ...REGEL, belegt_nach_s: 0 },
  durchgang: { ...REGEL, belegt_nach_s: 0 },
};

describe("Bearbeiten", () => {
  it("Rückgängig", () => {
    const h = new History<number[]>();
    h.push([1]);
    h.push([1]);
    h.push([1, 2]);
    expect(h.size).toBe(2);
    expect(h.undo()).toEqual([1, 2]);
    expect(h.undo()).toEqual([1]);
    expect(h.undo()).toBeUndefined();
  });

  it("neue Zonen bekommen eindeutige Namen und die Vorlage", () => {
    const form: Form = { art: "vieleck", punkte: [[0, 0], [1, 0], [0, 1]] };
    const a = newZone(form, [], VORLAGEN);
    const b = newZone(form, [a], VORLAGEN, "ausgang");
    expect(a.name).toBe("Zone");
    expect(b.name).toBe("Zone 2");
    expect(b.regel.belegt_nach_s).toBe(0);
  });

  it("Ecken ziehen und löschen", () => {
    let form: Form = { art: "vieleck", punkte: [[0, 0], [100, 0], [100, 100], [0, 100]] };
    form = setVertex(form, 2, [120.04, 130]);
    expect(form.art === "vieleck" && form.punkte[2]).toEqual([120, 130]);
    form = removeVertex(form, 0);
    expect(form.art === "vieleck" && form.punkte.length).toBe(3);
    expect(removeVertex(form, 0)).toBe(form); // mindestens drei bleiben
  });

  it("Zellen malen und radieren", () => {
    let form: Form = { art: "zellen", groesse: 25, zellen: [] };
    form = paintCell(form as Extract<Form, { art: "zellen" }>, [10, 10], true);
    form = paintCell(form as Extract<Form, { art: "zellen" }>, [30, 10], true);
    form = paintCell(form as Extract<Form, { art: "zellen" }>, [10, 10], false);
    expect(form.art === "zellen" && form.zellen).toEqual([[1, 0]]);
  });

  it("Rechteck aufziehen, vergrößern, drehen", () => {
    const rect = rectFromDrag([0, 0], [200, 100]) as Extract<Form, { art: "rechteck" }>;
    expect(rect).toMatchObject({ mitte: [100, 50], breite: 200, tiefe: 100, winkel: 0 });
    const bigger = resizeRect(rect, [250, 120]) as Extract<Form, { art: "rechteck" }>;
    expect(bigger.breite).toBe(300);
    expect(bigger.tiefe).toBe(140);
    const handle = rectRotateHandle(rect);
    expect(handle).toEqual([100, 130]);
    const turned = rotateRect(rect, [0, 50 + 100], 5) as Extract<Form, { art: "rechteck" }>;
    expect(turned.winkel).toBe(45);
  });

  it("Prüfung der Zonenliste", () => {
    const ok = newZone({ art: "vieleck", punkte: [[0, 0], [100, 0], [0, 100]] }, [], VORLAGEN);
    expect(zonesProblem([ok])).toBe("");
    expect(zonesProblem([{ ...ok, name: " " }])).toMatch(/Namen/);
  });

  it("Konverter-Zonen bekommen eine passende Rolle", () => {
    const form: Form = { art: "vieleck", punkte: [[0, 0], [100, 0], [0, 100]] };
    expect(zoneFromConverter({ name: "Bett", form }, [], VORLAGEN).regel.schlaefer_halten).toBe(true);
    expect(zoneFromConverter({ name: "Tür", form }, [], VORLAGEN).art).toBe("ausgang");
    expect(zoneFromConverter({ name: "Kasten", form }, [], VORLAGEN).art).toBe("normal");
  });
});

describe("Rollen", () => {
  it("Rolle aus Zone und zurück", async () => {
    const { applyRolle, rolleOf, regelSatz } = await import("./editor");
    const zone = newZone({ art: "vieleck", punkte: [[0, 0], [100, 0], [0, 100]] }, [], VORLAGEN);
    expect(rolleOf(zone)).toBe("bereich");
    const bett = applyRolle(zone, "bett", VORLAGEN);
    expect(rolleOf(bett)).toBe("bett");
    expect(regelSatz(bett)).toBe("Belegt nach 1 s, frei nach 5 s, hält Schläfer, eine Person.");
    const tuer = applyRolle(zone, "tuer", VORLAGEN);
    expect(tuer.art).toBe("ausgang");
    expect(regelSatz(tuer)).toMatch(/^Belegt sofort/);
    expect(rolleOf(applyRolle(zone, "ignorieren", VORLAGEN))).toBe("ignorieren");
  });

  it("Stelle und Tür mit Ziel", async () => {
    const { applyRolle, rolleOf, fuehrtZuText } = await import("./editor");
    const zone = newZone({ art: "vieleck", punkte: [[0, 0], [100, 0], [0, 100]] }, [], VORLAGEN);
    const stelle = applyRolle(zone, "stelle", VORLAGEN);
    expect(stelle.art).toBe("stelle");
    expect(rolleOf(stelle)).toBe("stelle");
    const raeume = [{ id: "flur", name: "Flur" }];
    const tuer = { ...applyRolle(zone, "tuer", VORLAGEN), fuehrt_zu: "flur" };
    expect(fuehrtZuText(tuer, raeume)).toBe("Flur");
    expect(fuehrtZuText({ ...tuer, fuehrt_zu: "aussen" }, raeume)).toMatch(/draußen/);
    expect(fuehrtZuText({ ...tuer, fuehrt_zu: "" }, raeume)).toBe("noch nicht eingetragen");
    // Wird die Tür zum Bereich, fällt „führt zu“ weg.
    expect(applyRolle(tuer, "bereich", VORLAGEN).fuehrt_zu).toBeUndefined();
  });

  it("Rechteck-Ecke ziehen hält die gegenüberliegende Ecke", async () => {
    const { dragRectCorner } = await import("./editor");
    const rect = rectFromDrag([0, 0], [200, 100]) as Extract<Form, { art: "rechteck" }>;
    // Ecke oben rechts (2) nach (300, 150): unten links (0, 0) bleibt.
    expect(dragRectCorner(rect, 2, [300, 150])).toMatchObject({ mitte: [150, 75], breite: 300, tiefe: 150, winkel: 0 });
    // über die feste Ecke hinaus ziehen kippt sauber
    expect(dragRectCorner(rect, 2, [-100, 50])).toMatchObject({ mitte: [-50, 25], breite: 100, tiefe: 50 });
  });
});

describe("Bearbeiten 2", () => {
  it("Formen drehen", async () => {
    const { rotateForm } = await import("./editor");
    const v = rotateForm({ art: "vieleck", punkte: [[10, 0], [20, 0], [10, 10]] }, [0, 0], 90);
    expect(v).toEqual({ art: "vieleck", punkte: [[0, 10], [0, 20], [-10, 10]] });
    const r = rotateForm({ art: "rechteck", mitte: [100, 0], breite: 50, tiefe: 20, winkel: 175 }, [0, 0], 10);
    expect(r).toMatchObject({ mitte: [98.5, 17.4], winkel: -175 });
    const z = { art: "zellen", groesse: 25, zellen: [[0, 0]] } as const;
    expect(rotateForm({ ...z, zellen: [[0, 0]] }, [0, 0], 90)).toEqual({ ...z, zellen: [[0, 0]] });
  });

  it("Öffnung auf einer Wand", async () => {
    const { openingFromDrag, openingPoints, edgeMidpoints } = await import("./editor");
    const umriss: [number, number][] = [[0, 0], [400, 0], [400, 300], [0, 300]];
    expect(edgeMidpoints(umriss)[1]).toEqual([400, 150]);
    // quer zur Wand gezogen zählt nur der Anteil entlang der Wand
    const o = openingFromDrag(umriss, 0, [102, 30], [188, -20]);
    expect(o).toEqual({ kante: 0, von: 100, bis: 190, art: "tuer" });
    expect(openingPoints(umriss, o!)).toEqual([[100, 0], [190, 0]]);
    expect(openingFromDrag(umriss, 0, [100, 0], [110, 0])).toBeNull();
    expect(openingFromDrag(umriss, 1, [400, 250], [400, 900])).toMatchObject({ von: 250, bis: 300 });
  });

  it("Öffnungen wandern mit, wenn Ecken dazukommen oder gehen", async () => {
    const { shiftOpenings } = await import("./editor");
    const o = (kante: number) => ({ kante, von: 0, bis: 50, art: "tuer" as const });
    expect(shiftOpenings([o(0), o(1), o(3)], { inserted: 1 }, 4).map((x) => x.kante)).toEqual([0, 4]);
    expect(shiftOpenings([o(0), o(1), o(2), o(3)], { removed: 2 }, 4).map((x) => x.kante)).toEqual([0, 2]);
    expect(shiftOpenings([o(0), o(1), o(3)], { removed: 0 }, 4).map((x) => x.kante)).toEqual([0]);
  });

  it("Rolle Durchgang", async () => {
    const { applyRolle, rolleOf } = await import("./editor");
    const zone = newZone({ art: "vieleck", punkte: [[0, 0], [100, 0], [0, 100]] }, [], VORLAGEN);
    const d = applyRolle(zone, "durchgang", VORLAGEN);
    expect(d.art).toBe("durchgang");
    expect(rolleOf(d)).toBe("durchgang");
  });
});

describe("Treppe und Kommen/Gehen", () => {
  const vorlagen = { ausgang: { belegt_nach_s: 0, frei_nach_s: 2, rand_cm: 10 }, normal: { belegt_nach_s: 1, frei_nach_s: 5, rand_cm: 20 } } as unknown as Record<string, Regel>;
  const basis: Zone = { id: "t", name: "Treppe", art: "normal", form: { art: "vieleck", punkte: [[0, 0], [100, 0], [100, 100]] }, regel: vorlagen.normal };

  it("Rolle Treppe ist eine Tür-Zone mit Merkmal", () => {
    const z = applyRolle(basis, "treppe", vorlagen);
    expect(z.art).toBe("ausgang");
    expect(z.treppe).toBe(true);
    expect(rolleOf(z)).toBe("treppe");
    const t = applyRolle(z, "tuer", vorlagen);
    expect(t.treppe).toBeUndefined();
    expect(rolleOf(t)).toBe("tuer");
  });

  it("zeigt Kommen und Gehen nur kurz", () => {
    const live = { kommen_gehen: [{ zone_id: "t", richtung: "betreten", vor_s: 1 }] } as unknown as Live;
    expect(kommenGehen(live, "t")).toBe("betreten");
    expect(kommenGehen(live, "x")).toBeNull();
    const alt = { kommen_gehen: [{ zone_id: "t", richtung: "verlassen", vor_s: 6 }] } as unknown as Live;
    expect(kommenGehen(alt, "t")).toBeNull();
    expect(kommenGehenText("betreten", false)).toContain("herein");
  });
});
