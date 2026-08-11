import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { type IconName, iconRegistry } from "../../Atom/icon";

export interface MarkerIconOptions {
  size?: number;
  color?: string;
}

export interface ResolvedMarkerIcon {
  /** SVG markup to drop inside the marker's `divIcon` wrapper. */
  markup: string;
  /**
   * Safe to interpolate into an HTML attribute and a CSS class. Raw SVG cannot
   * be — it contains quotes and angle brackets — so it collapses to a constant.
   */
  id: string;
}

/** Raw SVG markup, as opposed to a name from the `<Icon>` registry. */
export function isRawSvg(icon: string): boolean {
  return icon.trimStart().startsWith("<svg");
}

/*
 * Leaflet's `divIcon` takes an HTML string, not a React element, so a marker
 * cannot render <Icon /> directly. This bridges the two: same registry, same
 * names, serialised once per marker.
 *
 * `react-dom/server` is imported here rather than from the icon folder on
 * purpose — this module is only reachable through `map-class`, which is loaded
 * by dynamic import, so the server renderer stays out of the main bundle.
 */
export function iconMarkup(name: string, options: MarkerIconOptions = {}): string {
  const TablerIcon = iconRegistry[name as IconName];

  if (!TablerIcon) {
    return "";
  }

  return renderToStaticMarkup(
    createElement(TablerIcon, {
      size: options.size ?? 24,
      color: options.color ?? "currentColor",
      stroke: 1.75,
    }),
  );
}

/**
 * Accepts either form a marker's `icon` can take:
 *
 * - a registry name — `"map-pin"`, `"truck-delivery"`, … (see `<Icon>`)
 * - raw SVG markup — `'<svg viewBox="0 0 24 24">…</svg>'`, from a `?raw`
 *   import, an API response, or a hand-written string
 *
 * Raw markup is passed through untouched, so its own `width`/`height`/`fill`
 * win; sizing and colour options only apply to registry icons.
 */
export function resolveMarkerIcon(icon: string, options: MarkerIconOptions = {}): ResolvedMarkerIcon {
  if (isRawSvg(icon)) {
    return { markup: icon, id: "raw-svg" };
  }

  return { markup: iconMarkup(icon, options), id: icon };
}
