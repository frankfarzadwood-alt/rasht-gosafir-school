// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    environments: { client: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{
              // Keep each immutable data file in its own asset, instead of a
              // single oversized question-bank JavaScript file.
              name: (id: string) => {
                const match = id.replace(/\\/g, '/').match(/\/src\/data\/(.+\.json)(?:\?|$)/);
                return match ? 'content-' + match[1]!.replace(/[^a-zA-Z0-9]+/g, '-') : null;
              },
            }],
          },
        },
      },
    },
    } },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
