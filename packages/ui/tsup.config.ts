import { defineConfig } from "tsup";

export default defineConfig({
  // `maps` is its own entry so Leaflet never lands in the root bundle — see
  // the note at the top of src/maps.ts.
  entry: ["src/index.ts", "src/maps.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
});
