import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const app = fileURLToPath(new URL("./", import.meta.url));
const outDir = resolve(app, "dist/pages");
// Project 1 and IELTS Vocabulary 6.0 also use shared Oxford pictures.
const media = [
  "evolve-1-native", "project-1-native", "ielts-vocabulary60-native",
  "oxford-elementary-native", "oxford-intermediate-native",
];

export default defineConfig({
  root: resolve(app, "pages"),
  base: "/rasht-gosafir-school/",
  publicDir: false,
  define: { "import.meta.env.VITE_PRESENTATION_MODE": JSON.stringify("true") },
  resolve: { alias: { "@": resolve(app, "src") } },
  plugins: [react(), tailwindcss(), {
    name: "presentation-media",
    apply: "build",
    async closeBundle() {
      await mkdir(resolve(outDir, "assets"), { recursive: true });
      const files = ["brand", "book-covers", ...media.map(folder => `assets/${folder}`)];
      await Promise.all(files.map(file => cp(resolve(app, "public", file), resolve(outDir, file), { recursive: true })));
    },
  }],
  build: { outDir, emptyOutDir: true },
});
