import { defineConfig } from "vite";

// Baut das Panel „Raumzonen“ und (mit --mode karte) die Dashboard-Karte,
// jeweils als eine einzige Datei ohne gemeinsame Teile.
export default defineConfig(({ mode }) => {
  const karte = mode === "karte";
  return {
    build: {
      outDir: "../custom_components/raumzonen/frontend",
      emptyOutDir: !karte,
      target: "es2022",
      minify: true,
      lib: {
        entry: karte ? { "raumzonen-karte": "src/karte.ts" } : { "raumzonen-panel": "src/panel.ts" },
        formats: ["es"],
        fileName: (_format, name) => `${name}.js`,
      },
    },
  };
});
