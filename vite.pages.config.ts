import { cp, mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, normalizePath, type Plugin } from "vite";
import { PRESENTATION_BOOKS } from "./src/lib/presentation-books";
import type { QuestionPack } from "./src/lib/content/contracts";

const app = fileURLToPath(new URL("./", import.meta.url));
const outDir = resolve(app, "dist/pages");
const dataDir = normalizePath(resolve(app, "src/data")) + "/";
// Project 1 and IELTS Vocabulary 6.0 also use shared Oxford pictures.
const media = [
  "evolve-1-native", "project-1-native", "ielts-vocabulary60-native",
  "oxford-elementary-native", "oxford-intermediate-native",
];

function presentationQuestionPacks(): Plugin {
  const isOpenBookNode = (id: string) => PRESENTATION_BOOKS.has(id.split(".")[0]!);
  return {
    name: "presentation-question-packs",
    enforce: "pre",
    async transform(code, id) {
      const [file, query] = id.split("?", 2);
      if (!file?.startsWith(dataDir) || (query && query !== "raw")) return;
      const relative = file.slice(dataDir.length);
      if (relative === "oxford/native.overrides.json" && !PRESENTATION_BOOKS.has("ows-elementary")) {
        return "{}";
      }
      if (!relative.endsWith(".pack.json") && relative !== "pilot/question_pack.pilot.json") return;

      const pack = JSON.parse(query === "raw" ? await readFile(file, "utf8") : code) as QuestionPack;
      const questions = pack.questions.filter(q => q.placements.some(p => isOpenBookNode(p.node_id)));
      const data = JSON.stringify({
        ...pack,
        questions,
        vocabulary_entries: questions.length ? pack.vocabulary_entries : [],
        assessments: pack.assessments.filter(a => isOpenBookNode(a.anchor_node_id)),
      });
      // Asset metadata stays available for pictures shared across books.
      return query === "raw" ? `export default ${JSON.stringify(data)};` : data;
    },
  };
}

export default defineConfig({
  root: resolve(app, "pages"),
  base: "/rasht-gosafir-school/",
  publicDir: false,
  json: { namedExports: false, stringify: "auto" },
  define: { "import.meta.env.VITE_PRESENTATION_MODE": JSON.stringify("true") },
  resolve: { alias: { "@": resolve(app, "src") } },
  plugins: [presentationQuestionPacks(), react(), tailwindcss(), {
    name: "presentation-media",
    apply: "build",
    async closeBundle() {
      await mkdir(resolve(outDir, "assets"), { recursive: true });
      const files = ["brand", "book-covers", ...media.map(folder => `assets/${folder}`)];
      await Promise.all(files.map(file => cp(resolve(app, "public", file), resolve(outDir, file), { recursive: true })));
    },
  }],
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "course-data", test: /\/src\/data\//, maxSize: 3 * 1024 * 1024 }],
        },
      },
    },
  },
});
