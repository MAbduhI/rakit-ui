/**
 * `@rakit-ui/ui/maps` — a separate entry point on purpose.
 *
 * Maps pulls in Leaflet (~150 KB) plus `react-dom/server` for marker markup.
 * In ESM that code-splits away, but a CJS build cannot split, so shipping this
 * from the root entry put Leaflet in every consumer's bundle — map or no map.
 *
 * Consumers add `leaflet` themselves; it is an optional peer dependency here.
 */
export {
  MapContainer,
  type MapEvent,
  Maps,
  type MapsProps,
  type MarkerInput,
  type PolylineInput,
} from "./components/Organism/maps";
