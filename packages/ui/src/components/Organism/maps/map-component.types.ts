import type React from "react";
import type { MapClassOptions, MapClassType, MarkerInput, RoutesInput } from "./map-class";

export interface MapContainerPropsInternal extends Omit<MapClassOptions, "center" | "zoom"> {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  routes?: Array<RoutesInput>;
  markers?: Array<MarkerInput>;
  googleMapsApiKey?: string;
  onMapReady?: (mapInstance: MapClassType) => void;
  onUserInteractionStart?: () => void;
  onUserInteractionEnd?: () => void;
  onMoveEnd?: (event: MapEvent) => void;
  onDragEnd?: (event: MapEvent) => void;
  onZoomEnd?: (event: MapEvent) => void;
  /**
   * Called when Leaflet fails to load, the map fails to initialise, or a marker
   * fails to render. Without it those failures are invisible — the component
   * cannot log them itself (`noConsole` is an error in this repo).
   */
  onError?: (error: unknown) => void;
  MapClass?: new (container: string | HTMLElement, options: MapClassOptions) => MapClassType;
}

export interface MapContainerProps extends MapContainerPropsInternal {}

export type { MarkerInput, RoutesInput as PolylineInput };

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapEvent {
  zoom: number;
  center: [number, number];
  bounds: MapBounds;
  option: L.MapOptions;
  layer: L.Map;
}
