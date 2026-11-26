import { expect, it } from "vitest";
import { fehlerText, NEUSTART_TEXT } from "./fehler";

it("unbekannter Befehl heißt: Neustart fehlt", () => {
  expect(fehlerText({ code: "unknown_command", message: "Unknown command." })).toBe(NEUSTART_TEXT);
  expect(fehlerText({ code: "invalid", message: "Raum fehlt" })).toBe("Raum fehlt");
  expect(fehlerText("kaputt")).toBe("kaputt");
});
