/** Fehler im Klartext. Kennt Home Assistant den Befehl nicht, läuft noch die alte Version. */
export function fehlerText(err: unknown): string {
  const e = err as { code?: string; message?: string } | undefined;
  if (e?.code === "unknown_command") return NEUSTART_TEXT;
  return e?.message ?? String(err);
}

export const NEUSTART_TEXT = "Raumzonen wurde aktualisiert und wartet auf einen Neustart von Home Assistant (Einstellungen → System → Neu starten).";
