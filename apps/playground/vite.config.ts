import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// `@rakitmimpi-ui/ui` resolves to the library *source*, not `dist`, so editing a
// component hot-reloads here instantly without waiting for a tsup rebuild.
// Keep this in sync with the `paths` entry in tsconfig.json.
const uiSource = fileURLToPath(new URL("../../packages/ui/src/index.ts", import.meta.url));
const uiMapsSource = fileURLToPath(new URL("../../packages/ui/src/maps.ts", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Longest specifier first — Vite matches aliases in order.
      "@rakitmimpi-ui/ui/maps": uiMapsSource,
      "@rakitmimpi-ui/ui": uiSource,
    },
  },
  server: {
    port: 5173,
  },
});
