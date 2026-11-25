import { defineConfig } from "vite";

// Baut das Panel „Raumzonen“ für Home Assistant (eine einzige Datei).
export default defineConfig({
  build: {
    outDir: "../custom_components/raumzonen/frontend",
    emptyOutDir: true,
    target: "es2022",
    minify: true,
    lib: {
      entry: { "raumzonen-panel": "src/panel.ts" },
      formats: ["es"],
      fileName: (_format, name) => `${name}.js`,
    },
  },
});
