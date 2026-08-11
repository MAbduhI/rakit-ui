// Type declarations for Leaflet CSS side-effect imports
declare module "leaflet/dist/leaflet.css";

// General CSS module declarations for map components
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// A marker's `icon` accepts raw SVG markup as well as a registry name, and the
// usual way to get markup is a bundler's `?raw` suffix (Vite, webpack 5 with
// `asset/source`). This makes that import typecheck.
declare module "*.svg?raw" {
  const content: string;
  export default content;
}
