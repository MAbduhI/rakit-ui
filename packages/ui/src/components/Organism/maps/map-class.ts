/// <reference path="./google-maps-types.d.ts" />

import * as L from "leaflet";
import { googleMapsLoader } from "./google-maps-loader";
import { resolveMarkerIcon } from "./marker-icon";

type TileLayer = "osm" | "google-roadmap" | "google-satellite" | "google-hybrid" | "google-terrain";

/**
 * Creates a Leaflet DivIcon from an IconType using CSS-based icons
 * This uses the same icon system as the rest of the application
 */
function createIconFromReactIcon(
  iconType: string,
  options: {
    size?: number;
    color?: string;
    className?: string;
    iconAnchor?: L.PointExpression;
    popupAnchor?: L.PointExpression;
    bgColor?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    fontWeight?: string;
  } = {},
): L.DivIcon {
  const {
    size = 24,
    color = "#3388ff",
    bgColor = "white",
    border = `2px solid ${color}`,
    borderRadius = `50%`,
    boxShadow = "0 2px 5px rgba(0,0,0,0.2)",
    fontWeight = "bold",
    className = "custom-marker-icon",
    iconAnchor = [size / 2, size],
    popupAnchor = [0, -size],
  } = options;
  /*
   * `icon` is either a registry name or raw SVG markup. `id` is the part that
   * is safe to interpolate into the attribute and class below — dropping raw
   * SVG in there terminates the attribute on its first quote and produces a
   * class name containing the whole document.
   */
  const { markup, id } = resolveMarkerIcon(iconType, { size: Math.floor(size * 0.6), color });

  const iconHtml = `
        <div class="hyperscal-marker-icon" style="
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            background: ${bgColor};
            border: ${border};
            border-radius: ${borderRadius};
            box-shadow: ${boxShadow};
            font-size: ${Math.floor(size * 0.6)}px;
            font-weight: ${fontWeight};
            cursor: pointer;
            transition: transform 0.2s ease;
        "
        data-icon="${id}"
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'">
            ${markup}
        </div>
    `;
  return L.divIcon({
    html: iconHtml,
    className: `${className} hyperscal-icon-${id}`,
    iconSize: [size, size],
    iconAnchor,
    popupAnchor,
  });
}
interface PolylineOptions extends L.PolylineOptions {
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "round" | "bevel" | "miter";
  fillColor?: string;
  fillOpacity?: number;
  fillRule?: "evenodd" | "nonzero";
  interactive?: boolean;
  bubblingMouseEvents?: boolean;
  className?: string;
  [key: string]: unknown;
}

interface PolylineBase {
  id: string;
  coordinates: Array<L.LatLngExpression>;
  options?: PolylineOptions;
}
interface PolylineData extends PolylineBase {
  polyline: L.Polyline;
}

interface MarkerOptions extends L.MarkerOptions {
  icon?: L.Icon | L.DivIcon;
  opacity?: number;
  clickable?: boolean;
  draggable?: boolean;
  keyboard?: boolean;
  title?: string;
  alt?: string;
  zIndexOffset?: number;
  riseOnHover?: boolean;
  riseOffset?: number;
  className?: string;
  [key: string]: unknown;
}

interface CustomIconOptions {
  size?: number;
  color?: string;
  className?: string;
  iconAnchor?: [number, number];
  popupAnchor?: [number, number];
}

interface CustomLegendOptions extends L.TooltipOptions {
  label: string;
  show: boolean;
}

interface CustomPopupOptions extends Omit<L.PopupOptions, "content"> {
  content?: string | HTMLElement | ((layer: L.Layer) => string) | ((layer: L.Layer) => HTMLElement);
}

interface MarkerBase {
  id: string;
  coordinates: L.LatLngExpression;
  options?: MarkerOptions;
  /**
   * Either a name from the `<Icon>` registry (`"map-pin"`) or raw SVG markup
   * (`'<svg …>…</svg>'`, e.g. a `?raw` import). Registry icons honour
   * `iconOptions.size` / `.color`; raw markup keeps its own.
   */
  icon?: string;
  iconOptions?: CustomIconOptions;
  legend?: CustomLegendOptions;
  popupOnClick?: CustomPopupOptions;
  onClick?: (id: string, coordinates: L.LatLngExpression) => void;
}
interface MarkerData extends MarkerBase {
  marker: L.Marker;
}

interface MapClassOptions {
  center: [number, number];
  zoom: number;
  tileLayer?: TileLayer;
  showLayerControl?: boolean;
  googleMapsApiKey?: string;
  attributionControl?: boolean;
  [key: string]: unknown; // For additional Leaflet map options
}

interface MapClassType {
  // Core map controls
  remove: () => void;
  setView: (center: [number, number] | L.LatLngExpression, zoom: number) => void;
  getCurrentTileLayer: () => TileLayer;
  switchTileLayer: (layer: TileLayer) => void;
  on: (event: string, callback: (...args: Array<unknown>) => void) => void;

  // Map state
  isMapReady: () => boolean;
  isUserInteracting: () => boolean;
  setUserInteracting: (interacting: boolean) => void;
  isGoogleMapsReady: () => boolean;
  isGoogleMutantReady: () => boolean;
  getAvailableLayers: () => Array<TileLayer>;

  // View / positioning
  setCenter: (coordinates: L.LatLngExpression, zoom?: number) => void;
  setCenterAggressive: (coordinates: L.LatLngExpression, zoom?: number) => void;
  centerOnMarkerIfOutside: (coordinates: L.LatLngExpression, zoom?: number, padding?: number) => boolean;
  isPointVisible: (
    coordinates: L.LatLngExpression,
    options?: { padding?: number; usePixelBounds?: boolean; marginPercent?: number },
  ) => boolean;
  setZoomBasedOnCoordinates: (params: {
    coordinates: Array<[number, number] | { lat: number; lng: number }>;
    padding?: number;
    maxZoom?: number;
  }) => void;
  setCenterBasedOnCoordinates: (params: {
    coordinates: Array<[number, number] | { lat: number; lng: number }>;
    zoom?: number;
  }) => void;
  setZoomAndCenterBasedOnCoordinates: (params: {
    coordinates: Array<[number, number] | { lat: number; lng: number }>;
    padding?: number;
    maxZoom?: number;
    zoom?: number;
  }) => void;
  fitToAll: (padding?: number) => void;

  // Polylines
  addPolyline: (id: string, coordinates: Array<L.LatLngExpression>, options?: PolylineOptions) => string;
  addPolylines: (routes: Array<RoutesInput>) => Array<string>;
  removePolyline: (id: string) => boolean;
  removePolylines: (ids: Array<string>) => Array<boolean>;
  clearPolylines: () => void;
  getPolyline: (id: string) => PolylineData | undefined;
  getAllPolylines: () => Map<string, PolylineData>;
  updatePolyline: (id: string, coordinates: Array<[number, number]>, options?: PolylineOptions) => boolean;
  togglePolyline: (id: string, visible: boolean) => boolean;
  fitToPolylines: (padding?: number) => void;
  fitToSpecificPolylines: (ids: Array<string>, padding?: number) => void;
  getZoomBasedOnPolylines: (ids: Array<string>, padding?: number) => { minimum: number; optimum: number } | null;
  setZoomBasedOnPolylines: (ids: Array<string>, padding?: number, useOptimal?: boolean) => void;

  // Markers
  addMarker: (
    id: string,
    coordinates: L.LatLngExpression,
    options?: MarkerOptions,
    icon?: string,
    iconOptions?: CustomIconOptions,
    legend?: CustomLegendOptions,
    popup?: CustomPopupOptions,
    onClick?: (id: string, coordinates: L.LatLngExpression) => void,
  ) => string;
  addMarkers: (markersData: Array<MarkerBase>) => Array<string>;
  removeMarker: (id: string) => boolean;
  removeMarkers: (ids: Array<string>) => Array<boolean>;
  clearMarkers: () => void;
  getMarker: (id: string) => MarkerData | undefined;
  hasMarker: (id: string) => boolean;
  getAllMarkers: () => Map<string, MarkerData>;
  updateMarker: (id: string, coordinates: L.LatLngExpression, options?: MarkerOptions) => boolean;
  toggleMarker: (id: string, visible: boolean) => boolean;
  fitToMarkers: (padding?: number) => void;
  fitToSpecificMarkers: (ids: Array<string>, padding?: number) => void;
  getZoomBasedOnMarkers: (ids: Array<string>, padding?: number) => { minimum: number; optimum: number } | null;
  setZoomBasedOnMarkers: (ids: Array<string>, padding?: number, useOptimal?: boolean) => void;

  // Combined features
  getZoomBasedOnFeatures: (
    markerIds?: Array<string>,
    polylineIds?: Array<string>,
    padding?: number,
  ) => { minimum: number; optimum: number } | null;
  setZoomBasedOnFeatures: (
    markerIds?: Array<string>,
    polylineIds?: Array<string>,
    padding?: number,
    useOptimal?: boolean,
  ) => void;
  clearAll: () => void;

  // Marker legend & popup
  updateMarkerLegend: (id: string, legend: CustomLegendOptions) => boolean;
  toggleMarkerLegend: (id: string, show: boolean) => boolean;
  updateMarkerPopup: (id: string, popup: CustomPopupOptions) => boolean;
  openMarkerPopup: (id: string) => boolean;
  closeMarkerPopup: (id: string) => boolean;
  getMarkersWithLegends: () => Map<string, MarkerData>;
  getMarkersWithPopups: () => Map<string, MarkerData>;
}

// Additional type needed for legend
interface CustomLegendOptions {
  label: string;
  show: boolean;
}

interface RoutesInput {
  id: string;
  coordinates: Array<L.LatLngExpression>;
  options?: PolylineOptions;
}

interface MarkerInput {
  id: string;
  coordinates: L.LatLngExpression;
  options?: MarkerOptions;
  /**
   * Either a name from the `<Icon>` registry (`"map-pin"`) or raw SVG markup
   * (`'<svg …>…</svg>'`, e.g. a `?raw` import). Registry icons honour
   * `iconOptions.size` / `.color`; raw markup keeps its own.
   */
  icon?: string;
  iconOptions?: {
    size?: number;
    color?: string;
    className?: string;
    iconAnchor?: L.PointExpression;
    popupAnchor?: L.PointExpression;
    bgColor?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    fontWeight?: string;
  };
  legend?: { label: string; show: boolean } & L.TooltipOptions;
  popup?: CustomPopupOptions;
  popupOnClick?: CustomPopupOptions;
  onClick?: (id: string, coordinates: L.LatLngExpression) => void;
}

type LatLngExpression = L.LatLng | L.LatLngLiteral | L.LatLngTuple;

class MapClass extends L.Map {
  private baseLayers: Record<TileLayer, L.Layer | null> = {
    osm: null,
    "google-roadmap": null,
    "google-satellite": null,
    "google-hybrid": null,
    "google-terrain": null,
  };
  private currentTileLayer: TileLayer;
  private googleMapsApiKey?: string;
  private isGoogleMutantLoaded = false;
  private isGoogleMapsLoaded = false;
  private L: typeof L;
  private polylines: Map<string, PolylineData> = new Map();
  private markers: Map<string, MarkerData> = new Map();
  private userInteracting = false;

  constructor(id: string | HTMLElement, options: MapClassOptions) {
    const { tileLayer = "osm", showLayerControl = true, googleMapsApiKey, center, zoom, ...mapOptions } = options;

    // Call parent constructor
    super(id, { center, zoom, ...mapOptions });

    this.L = L;
    this.currentTileLayer = tileLayer;
    this.googleMapsApiKey = googleMapsApiKey;

    // Initialize layers after construction with a small delay to ensure DOM is ready
    setTimeout(() => this.initializeLayers(showLayerControl), 0);
  }

  private async initializeLayers(showLayerControl: boolean) {
    try {
      // Check if map is ready
      if (!this.getContainer()) {
        // Retry after container is ready
        setTimeout(() => this.initializeLayers(showLayerControl), 100);
        return;
      }

      // Create OSM layer first
      this.createOSMLayer();

      // Load Google Maps if API key is provided
      if (this.googleMapsApiKey) {
        await this.loadGoogleMapsIntegration();
      }

      // Add initial layer
      this.addInitialLayer();

      // Add layer control if enabled
      if (showLayerControl) {
        this.addLayerControl();
      }
    } catch {
      // Failed to initialize layers - fallback to OSM if Google Maps fails
      this.addInitialLayer();
    }
  }

  private createOSMLayer() {
    this.baseLayers.osm = this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    });
  }

  private async loadGoogleMapsIntegration() {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error("Google Maps API key is required");
      }
      // First load Google Maps API
      await googleMapsLoader.load({ apiKey: this.googleMapsApiKey });
      this.isGoogleMapsLoaded = true;

      // Then load GoogleMutant plugin
      await import("leaflet.gridlayer.googlemutant" as unknown as string);
      this.isGoogleMutantLoaded = true;

      // Create Google layers
      this.createGoogleLayers();
    } catch {
      // Failed to load Google Maps integration - fallback to OSM
      this.createOSMLayer();
      this.addInitialLayer();
    }
  }

  private createGoogleLayer(type: "roadmap" | "satellite" | "hybrid" | "terrain", key: TileLayer) {
    if (!this.googleMapsApiKey || !this.isGoogleMutantLoaded || !this.L.gridLayer?.googleMutant) {
      return;
    }
    try {
      this.baseLayers[key] = this.L.gridLayer.googleMutant({
        type,
        apikey: this.googleMapsApiKey,
      });
    } catch {
      // Failed to create Google layer
    }
  }

  private createGoogleLayers() {
    this.createGoogleLayer("roadmap", "google-roadmap");
    this.createGoogleLayer("satellite", "google-satellite");
    this.createGoogleLayer("hybrid", "google-hybrid");
    this.createGoogleLayer("terrain", "google-terrain");
  }

  private addInitialLayer() {
    // Check if container is ready before adding layers
    if (!this.getContainer()) {
      // Retry after a short delay if container isn't ready
      setTimeout(() => this.addInitialLayer(), 50);
      return;
    }

    const layerToAdd = this.baseLayers[this.currentTileLayer] || this.baseLayers.osm;
    if (layerToAdd) {
      layerToAdd.addTo(this);
      // Update current layer if fallback was used
      if (!this.baseLayers[this.currentTileLayer]) {
        this.currentTileLayer = "osm";
      }
    }
  }

  private addLayerControl() {
    const layerLabels: Record<TileLayer, string> = {
      osm: "OpenStreetMap",
      "google-roadmap": "Google Roadmap",
      "google-satellite": "Google Satellite",
      "google-hybrid": "Google Hybrid",
      "google-terrain": "Google Terrain",
    };

    const layersForControl: Record<string, L.Layer> = {};
    Object.entries(this.baseLayers).forEach(([key, layer]) => {
      if (layer) {
        layersForControl[layerLabels[key as TileLayer]] = layer;
      }
    });

    // Only add layer control if we have more than one layer
    if (Object.keys(layersForControl).length > 1) {
      this.L.control.layers(layersForControl).addTo(this);

      // Handle layer changes
      super.on("baselayerchange", (e: L.LayersControlEvent) => {
        const layerName = Object.entries(layerLabels).find(([, label]) => label === e.name)?.[0] as TileLayer;
        if (layerName) {
          this.currentTileLayer = layerName;
        }
      });
    }
  }

  /**
   * Switch to a specific tile layer
   */
  public switchTileLayer(tileLayer: TileLayer) {
    const newLayer = this.baseLayers[tileLayer];
    if (!newLayer) {
      // Layer not available, return early
      return;
    }

    // Remove current layer
    const currentLayer = this.baseLayers[this.currentTileLayer];
    if (currentLayer && this.hasLayer(currentLayer)) {
      this.removeLayer(currentLayer);
    }

    // Add new layer
    newLayer.addTo(this);
    this.currentTileLayer = tileLayer;
  }

  /**
   * Get current tile layer
   */
  public getCurrentTileLayer(): TileLayer {
    return this.currentTileLayer;
  }

  /**
   * Check if Google Maps is loaded
   */
  public isGoogleMapsReady(): boolean {
    return this.isGoogleMapsLoaded;
  }

  /**
   * Check if GoogleMutant plugin is loaded
   */
  public isGoogleMutantReady(): boolean {
    return this.isGoogleMutantLoaded;
  }

  /**
   * Check if the map is ready for marker/polyline operations
   */
  public isMapReady(): boolean {
    return !!(this.getContainer() && this.getSize().x > 0 && this.getSize().y > 0);
  }

  /**
   * Check if user is currently interacting with the map
   */
  public isUserInteracting(): boolean {
    return this.userInteracting;
  }

  /**
   * Set user interaction state
   */
  public setUserInteracting(interacting: boolean): void {
    this.userInteracting = interacting;
  }

  /**
   * Check if a point is visible within the map container with various options
   */
  public isPointVisible(
    coordinates: L.LatLngExpression,
    options: {
      padding?: number;
      usePixelBounds?: boolean;
      marginPercent?: number;
    } = {},
  ): boolean {
    // Validate that the map is initialized and has a container
    if (!this.getContainer() || !this.getSize().x || !this.getSize().y) {
      return false;
    }

    try {
      const point = this.L.latLng(coordinates);
      const { padding = 0, usePixelBounds = false, marginPercent = 0 } = options;

      if (usePixelBounds) {
        // Check using pixel coordinates
        const pixelPoint = this.latLngToContainerPoint(point);
        const mapSize = this.getSize();

        const effectivePadding = padding || 0;

        return (
          pixelPoint.x >= effectivePadding &&
          pixelPoint.y >= effectivePadding &&
          pixelPoint.x <= mapSize.x - effectivePadding &&
          pixelPoint.y <= mapSize.y - effectivePadding
        );
      }

      // Get current bounds
      const currentBounds = this.getBounds();

      if (marginPercent > 0) {
        // Calculate margin based on percentage of map size
        const mapSize = this.getSize();
        const marginPadding = Math.min(mapSize.x, mapSize.y) * (marginPercent / 100);

        // Calculate margin in lat/lng units
        const marginPoint = this.containerPointToLatLng([marginPadding, marginPadding]);
        const centerPoint = this.containerPointToLatLng([mapSize.x / 2, mapSize.y / 2]);
        const latMargin = Math.abs(marginPoint.lat - centerPoint.lat);
        const lngMargin = Math.abs(marginPoint.lng - centerPoint.lng);

        // Create margin bounds (smaller area within current view)
        const marginBounds = this.L.latLngBounds(
          [currentBounds.getSouth() + latMargin, currentBounds.getWest() + lngMargin],
          [currentBounds.getNorth() - latMargin, currentBounds.getEast() - lngMargin],
        );

        return marginBounds.contains(point);
      }

      if (padding > 0) {
        // Calculate padding in lat/lng units
        const mapSize = this.getSize();
        const paddingPoint = this.containerPointToLatLng([padding, padding]);
        const centerPoint = this.containerPointToLatLng([mapSize.x / 2, mapSize.y / 2]);
        const latPadding = Math.abs(paddingPoint.lat - centerPoint.lat);
        const lngPadding = Math.abs(paddingPoint.lng - centerPoint.lng);

        // Create padded bounds (smaller area within current view)
        const paddedBounds = this.L.latLngBounds(
          [currentBounds.getSouth() + latPadding, currentBounds.getWest() + lngPadding],
          [currentBounds.getNorth() - latPadding, currentBounds.getEast() - lngPadding],
        );

        return paddedBounds.contains(point);
      }

      // Basic bounds check without padding
      return currentBounds.contains(point);
    } catch {
      // Error checking visibility, assume not visible
      return false;
    }
  }

  /**
   * Set map center with validation - only centers if coordinates are outside current view
   */
  public setCenter(coordinates: L.LatLngExpression, zoom?: number) {
    // Validate that the map is initialized and has a container
    if (!this.getContainer() || !this.getSize().x || !this.getSize().y) {
      // Map not properly initialized or container has no dimensions
      return;
    }

    try {
      // Check if the coordinates are within the current view bounds
      const point = this.L.latLng(coordinates);

      // Only center the map if the point is outside the current bounds
      if (!this.isPointVisible(point, { padding: 50 })) {
        this.flyTo(point, zoom || this.getZoom());
        return this.setView(point, zoom || this.getZoom());
      }

      // If point is within bounds, do nothing (marker is still visible)
      return;
    } catch {
      // Error setting map center, fallback to setView
      return this.setView(this.L.latLng(coordinates), zoom || this.getZoom());
    }
  }

  /**
   * Set map center aggressively (always re-centers regardless of current view)
   */
  public setCenterAggressive(coordinates: L.LatLngExpression, zoom?: number) {
    try {
      return this.flyTo(coordinates, zoom || this.getZoom());
    } catch {
      // Error setting map center, fallback to setView
      return this.setView(coordinates, zoom || this.getZoom());
    }
  }

  /**
   * Center map on marker only if marker is outside current view with optional padding
   */
  public centerOnMarkerIfOutside(coordinates: L.LatLngExpression, zoom?: number, padding: number = 50): boolean {
    // Validate that the map is initialized and has a container
    if (!this.getContainer() || !this.getSize().x || !this.getSize().y) {
      return false;
    }

    try {
      // Get current bounds
      const currentBounds = this.getBounds();
      const point = this.L.latLng(coordinates);

      // Create a smaller bounds area with padding to determine if we should recenter
      const mapSize = this.getSize();

      // Calculate padding in lat/lng units
      const paddingPoint = this.containerPointToLatLng([padding, padding]);
      const centerPoint = this.containerPointToLatLng([mapSize.x / 2, mapSize.y / 2]);
      const latPadding = Math.abs(paddingPoint.lat - centerPoint.lat);
      const lngPadding = Math.abs(paddingPoint.lng - centerPoint.lng);

      // Create padded bounds (smaller area within current view)
      const paddedBounds = this.L.latLngBounds(
        [currentBounds.getSouth() + latPadding, currentBounds.getWest() + lngPadding],
        [currentBounds.getNorth() - latPadding, currentBounds.getEast() - lngPadding],
      );

      // Only center the map if the point is outside the padded bounds
      if (!paddedBounds.contains(point)) {
        this.setView(coordinates, zoom || this.getZoom());
        return true; // Map was recentered
      }

      return false; // Map was not recentered (marker still visible with padding)
    } catch {
      // Error checking bounds, fallback to centering
      this.setView(coordinates, zoom || this.getZoom());
      return true;
    }
  }

  /**
   * Calculate min/optimum zoom levels for a given bounds and padding
   */
  private calculateZoomLevels(bounds: L.LatLngBounds, padding: number): { minimum: number; optimum: number } {
    const mapSize = this.getSize();
    const paddingPoint = this.L.point(padding, padding);
    const mapSizeWithPadding = mapSize.subtract(paddingPoint.multiplyBy(2));
    const crs = this.options.crs || this.L.CRS.EPSG3857;
    const nw = bounds.getNorthWest();
    const se = bounds.getSouthEast();

    let minZoom = 1;
    let optimalZoom = 1;

    for (let zoom = 1; zoom <= 18; zoom++) {
      const nwPoint = crs.latLngToPoint(nw, zoom);
      const sePoint = crs.latLngToPoint(se, zoom);
      const boundsSize = this.L.point(Math.abs(sePoint.x - nwPoint.x), Math.abs(nwPoint.y - sePoint.y));
      const minPadding = padding * 2;
      const minSizeRequired = mapSizeWithPadding.subtract(this.L.point(minPadding * 2, minPadding * 2));

      if (boundsSize.x <= minSizeRequired.x && boundsSize.y <= minSizeRequired.y) {
        minZoom = zoom;
        break;
      }
    }

    for (let zoom = 1; zoom <= 18; zoom++) {
      const nwPoint = crs.latLngToPoint(nw, zoom);
      const sePoint = crs.latLngToPoint(se, zoom);
      const boundsSize = this.L.point(Math.abs(sePoint.x - nwPoint.x), Math.abs(nwPoint.y - sePoint.y));

      if (boundsSize.x <= mapSizeWithPadding.x && boundsSize.y <= mapSizeWithPadding.y) {
        optimalZoom = zoom;
      } else {
        break;
      }
    }

    minZoom = Math.min(minZoom, optimalZoom);
    const maxZoom = this.getMaxZoom() || 18;
    const minZoomLimit = this.getMinZoom() || 1;

    return {
      minimum: Math.max(minZoomLimit, Math.min(minZoom, maxZoom)),
      optimum: Math.max(minZoomLimit, Math.min(optimalZoom, maxZoom)),
    };
  }

  /**
   * Get available layers
   */
  public getAvailableLayers(): Array<TileLayer> {
    return Object.entries(this.baseLayers)
      .filter(([, layer]) => layer !== null)
      .map(([key]) => key as TileLayer);
  }

  /**
   * Add a polyline to the map
   */
  public addPolyline(id: string, coordinates: Array<L.LatLngExpression>, options: PolylineOptions = {}): string {
    // Ensure map is ready before adding polylines
    if (!this.isMapReady()) {
      throw new Error("Map container is not ready. Wait for map initialization to complete.");
    }

    // Remove existing polyline with same ID if it exists
    if (this.polylines.has(id)) {
      this.removePolyline(id);
    }

    // Create polyline with default options
    const defaultOptions: PolylineOptions = {
      color: "#3388ff",
      weight: 3,
      opacity: 1,
      ...options,
    };

    const polyline = this.L.polyline(coordinates, defaultOptions as L.PolylineOptions);
    polyline.addTo(this);

    // Store polyline data
    const polylineData: PolylineData = {
      id,
      coordinates,
      options: defaultOptions,
      polyline,
    };

    this.polylines.set(id, polylineData);
    return id;
  }

  /**
   * Add multiple polylines to the map
   */
  public addPolylines(polylinesData: Array<PolylineBase>): Array<string> {
    const addedIds: Array<string> = [];
    polylinesData.forEach(({ id, coordinates, options }) => {
      this.addPolyline(id, coordinates, options);
      addedIds.push(id);
    });
    return addedIds;
  }

  /**
   * get zoom to fit polylines
   */
  public getZoomBasedOnPolylines(
    ids: Array<string>,
    padding: number = 20,
  ): { minimum: number; optimum: number } | null {
    const polylines = ids.map((id) => this.polylines.get(id)?.polyline).filter(Boolean) as Array<L.Polyline>;

    if (polylines.length === 0) {
      return null;
    }

    const group = this.L.featureGroup(polylines);
    return this.calculateZoomLevels(group.getBounds(), padding);
  }

  /**
   * get zoom to fit markers
   */
  public getZoomBasedOnMarkers(ids: Array<string>, padding: number = 20): { minimum: number; optimum: number } | null {
    const markers = ids.map((id) => this.markers.get(id)?.marker).filter(Boolean) as Array<L.Marker>;

    if (markers.length === 0) {
      return null;
    }

    const group = this.L.featureGroup(markers);
    return this.calculateZoomLevels(group.getBounds(), padding);
  }

  /**
   * set zoom to fit markers
   */
  public setZoomBasedOnMarkers(ids: Array<string>, padding: number = 20, useOptimal: boolean = true): void {
    const zoomLevels = this.getZoomBasedOnMarkers(ids, padding);

    if (!zoomLevels) {
      // No markers found, fallback to fitBounds method
      const markers = ids.map((id) => this.markers.get(id)?.marker).filter(Boolean) as Array<L.Marker>;
      if (markers.length === 0) return;
      const group = this.L.featureGroup(markers);
      this.fitBounds(group.getBounds(), { padding: [padding, padding] });
      return;
    }

    // Use optimal zoom by default, or minimum zoom if specified
    const targetZoom = useOptimal ? zoomLevels.optimum : zoomLevels.minimum;

    // Get the center of the markers bounds
    const markers = ids.map((id) => this.markers.get(id)?.marker).filter(Boolean) as Array<L.Marker>;
    const group = this.L.featureGroup(markers);
    const bounds = group.getBounds();
    const center = bounds.getCenter();

    // Set the view to the calculated zoom and center
    this.setView(center, targetZoom);
  }

  /**
   * Set zoom and center based on multiple lat/lng coordinates
   * Minimum 2 points required. Automatically fits the map to show all points
   * @param coordinates - Array of [lat, lng] or {lat, lng} coordinates
   * @param padding - Padding around the bounds in pixels (default: 50)
   * @param maxZoom - Maximum zoom level to prevent zooming in too close (default: 16)
   */
  public setZoomBasedOnCoordinates({
    coordinates,
    padding = 50,
    maxZoom = 16,
  }: {
    coordinates: Array<[number, number] | { lat: number; lng: number }>;
    padding?: number;
    maxZoom?: number;
  }): void {
    if (coordinates.length < 2) {
      return;
    }

    // Convert coordinates to LatLng array
    const latLngs = coordinates.map((coord) => {
      if (Array.isArray(coord)) {
        return this.L.latLng(coord[0], coord[1]);
      }
      return this.L.latLng(coord.lat, coord.lng);
    });

    // Create bounds from the coordinates
    const bounds = this.L.latLngBounds(latLngs);

    // Fit the map to the bounds with padding and max zoom
    this.fitBounds(bounds, {
      padding: [padding, padding],
      maxZoom: maxZoom,
    });
  }

  /**
   * Set center based on multiple lat/lng coordinates (calculates center point)
   * Works with any number of coordinates (1 or more)
   * @param coordinates - Array of [lat, lng] or {lat, lng} coordinates
   * @param zoom - Optional zoom level (if not provided, keeps current zoom)
   */
  public setCenterBasedOnCoordinates({
    coordinates,
    zoom,
  }: {
    coordinates: Array<[number, number] | { lat: number; lng: number }>;
    zoom?: number;
  }): void {
    if (coordinates.length === 0) {
      return;
    }

    // Convert coordinates to LatLng array
    const latLngs = coordinates.map((coord) => {
      if (Array.isArray(coord)) {
        return this.L.latLng(coord[0], coord[1]);
      }
      return this.L.latLng(coord.lat, coord.lng);
    });

    // For single coordinate, just set center to that point
    if (latLngs.length === 1 && latLngs[0]) {
      this.setView(latLngs[0], zoom || this.getZoom());
      return;
    }

    // For multiple coordinates, calculate the center point
    const bounds = this.L.latLngBounds(latLngs);
    const center = bounds.getCenter();

    // Set the view to the calculated center
    this.setView(center, zoom || this.getZoom());
  }

  /**
   * Set both zoom and center based on multiple lat/lng coordinates
   * Combines the functionality of setZoomBasedOnCoordinates and setCenterBasedOnCoordinates
   * For 1 coordinate: centers on that point with optional zoom
   * For 2+ coordinates: fits bounds to show all points with padding
   * @param coordinates - Array of [lat, lng] or {lat, lng} coordinates
   * @param padding - Padding around the bounds in pixels (default: 50, only used for 2+ coordinates)
   * @param maxZoom - Maximum zoom level to prevent zooming in too close (default: 16, only used for 2+ coordinates)
   * @param zoom - Optional zoom level for single coordinate (if not provided, uses maxZoom)
   */
  public setZoomAndCenterBasedOnCoordinates({
    coordinates,
    padding = 50,
    maxZoom = 16,
    zoom,
  }: {
    coordinates: Array<[number, number] | { lat: number; lng: number }>;
    padding?: number;
    maxZoom?: number;
    zoom?: number;
  }): void {
    if (coordinates.length === 0) {
      return;
    }

    // Convert coordinates to LatLng array
    const latLngs = coordinates.map((coord) => {
      if (Array.isArray(coord)) {
        return this.L.latLng(coord[0], coord[1]);
      }
      return this.L.latLng(coord.lat, coord.lng);
    });

    // For single coordinate, just set center and zoom to that point
    if (latLngs.length === 1 && latLngs[0]) {
      this.setView(latLngs[0], zoom || maxZoom);
      return;
    }

    // For multiple coordinates, fit bounds to show all points
    const bounds = this.L.latLngBounds(latLngs);

    // Fit the map to the bounds with padding and max zoom
    this.fitBounds(bounds, {
      padding: [padding, padding],
      maxZoom: maxZoom,
    });
  }

  /**
   * get zoom to fit both markers and polylines
   */
  public getZoomBasedOnFeatures(
    markerIds: Array<string> = [],
    polylineIds: Array<string> = [],
    padding: number = 20,
  ): { minimum: number; optimum: number } | null {
    const markers = markerIds.map((id) => this.markers.get(id)?.marker).filter(Boolean) as Array<L.Marker>;
    const polylines = polylineIds.map((id) => this.polylines.get(id)?.polyline).filter(Boolean) as Array<L.Polyline>;

    const allFeatures = [...markers, ...polylines];

    if (allFeatures.length === 0) {
      return null;
    }

    const group = this.L.featureGroup(allFeatures);
    return this.calculateZoomLevels(group.getBounds(), padding);
  }

  /**
   * set zoom to fit both markers and polylines
   */
  public setZoomBasedOnFeatures(
    markerIds: Array<string> = [],
    polylineIds: Array<string> = [],
    padding: number = 20,
    useOptimal: boolean = true,
  ): void {
    const zoomLevels = this.getZoomBasedOnFeatures(markerIds, polylineIds, padding);
    if (!zoomLevels) {
      // No features found, fallback to fitToAll method
      this.fitToAll(padding);
      return;
    }

    // Use optimal zoom by default, or minimum zoom if specified
    const targetZoom = useOptimal ? zoomLevels.optimum : zoomLevels.minimum;

    // Get the center of the combined features bounds
    const markers = markerIds.map((id) => this.markers.get(id)?.marker).filter(Boolean) as Array<L.Marker>;
    const polylines = polylineIds.map((id) => this.polylines.get(id)?.polyline).filter(Boolean) as Array<L.Polyline>;
    const allFeatures = [...markers, ...polylines];

    if (allFeatures.length > 0) {
      const group = this.L.featureGroup(allFeatures);
      const bounds = group.getBounds();
      const center = bounds.getCenter();

      // Set the view to the calculated zoom and center
      this.setView(center, targetZoom);
    }
  } /**
   * set zoom to fit polylines
   */
  public setZoomBasedOnPolylines(ids: Array<string>, padding: number = 20, useOptimal: boolean = true): void {
    const zoomLevels = this.getZoomBasedOnPolylines(ids, padding);

    if (!zoomLevels) {
      // No polylines found, fallback to fitBounds method
      const polylines = ids.map((id) => this.polylines.get(id)?.polyline).filter(Boolean) as Array<L.Polyline>;
      if (polylines.length === 0) return;
      const group = this.L.featureGroup(polylines);
      this.fitBounds(group.getBounds(), { padding: [padding, padding] });
      return;
    }

    // Use optimal zoom by default, or minimum zoom if specified
    const targetZoom = useOptimal ? zoomLevels.optimum : zoomLevels.minimum;

    // Get the center of the polylines bounds
    const polylines = ids.map((id) => this.polylines.get(id)?.polyline).filter(Boolean) as Array<L.Polyline>;
    const group = this.L.featureGroup(polylines);
    const bounds = group.getBounds();
    const center = bounds.getCenter();

    // Set the view to the calculated zoom and center
    this.setView(center, targetZoom);
  }

  /**
   * Remove a polyline from the map
   */
  public removePolyline(id: string): boolean {
    const polylineData = this.polylines.get(id);
    if (polylineData) {
      this.removeLayer(polylineData.polyline);
      this.polylines.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Remove multiple polylines from the map
   */
  public removePolylines(ids: Array<string>): Array<boolean> {
    return ids.map((id) => this.removePolyline(id));
  }

  /**
   * Remove all polylines from the map
   */
  public clearPolylines(): void {
    this.polylines.forEach((polylineData) => {
      this.removeLayer(polylineData.polyline);
    });
    this.polylines.clear();
  }

  /**
   * Get a polyline by ID
   */
  public getPolyline(id: string): PolylineData | undefined {
    return this.polylines.get(id);
  }

  /**
   * Get all polylines
   */
  public getAllPolylines(): Map<string, PolylineData> {
    return new Map(this.polylines);
  }

  /**
   * Update polyline coordinates
   */
  public updatePolyline(id: string, coordinates: Array<[number, number]>, options?: PolylineOptions): boolean {
    const polylineData = this.polylines.get(id);
    if (polylineData) {
      // Update coordinates
      polylineData.polyline.setLatLngs(coordinates);
      polylineData.coordinates = coordinates;

      if (options) {
        polylineData.polyline.setStyle(options as L.PathOptions);
        polylineData.options = { ...polylineData.options, ...options };
      }

      return true;
    }
    return false;
  }

  /**
   * Show/hide a polyline
   */
  public togglePolyline(id: string, visible: boolean): boolean {
    const polylineData = this.polylines.get(id);
    if (polylineData) {
      if (visible) {
        if (!this.hasLayer(polylineData.polyline)) {
          polylineData.polyline.addTo(this);
        }
      } else {
        if (this.hasLayer(polylineData.polyline)) {
          this.removeLayer(polylineData.polyline);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Fit map bounds to include all polylines
   */
  public fitToPolylines(padding: number = 20): void {
    if (this.polylines.size === 0) return;

    const group = this.L.featureGroup(Array.from(this.polylines.values()).map((data) => data.polyline));
    this.fitBounds(group.getBounds(), { padding: [padding, padding] });
  }

  /**
   * Fit map bounds to specific polylines
   */
  public fitToSpecificPolylines(ids: Array<string>, padding: number = 20): void {
    const polylines = ids.map((id) => this.polylines.get(id)?.polyline).filter(Boolean) as Array<L.Polyline>;

    if (polylines.length === 0) return;

    const group = this.L.featureGroup(polylines);
    this.fitBounds(group.getBounds(), { padding: [padding, padding] });
  }

  /**
   * Add a marker to the map
   */
  public addMarker(
    id: string,
    coordinates: L.LatLngExpression,
    options: MarkerOptions = {},
    icon?: string,
    iconOptions?: CustomIconOptions,
    legend?: CustomLegendOptions,
    popupOnClick?: L.PopupOptions,
    onClick?: (id: string, coordinates: L.LatLngExpression) => void,
  ): string {
    // Ensure map is properly initialized before adding markers
    if (!this.isMapReady()) {
      throw new Error("Map container is not ready. Wait for map initialization to complete.");
    }

    // Remove existing marker with same ID if it exists
    if (this.markers.has(id)) {
      this.removeMarker(id);
    }

    // Create custom icon if React icon is provided
    const markerOptions = { ...options } as L.MarkerOptions;
    if (icon) {
      const customIcon = createIconFromReactIcon(icon, iconOptions);
      markerOptions.icon = customIcon;
    }

    // Create marker with options
    const marker = this.L.marker(coordinates, markerOptions);
    marker.addTo(this);

    // Add legend (tooltip) if provided
    if (legend?.show) {
      marker.bindTooltip(legend.label, {
        permanent: legend.permanent || false,
        direction: legend.direction || "top",
        opacity: legend.opacity || 1,
        className: legend.className || "marker-legend",
        ...legend,
      });
    }

    // Add popup on click if provided
    if (popupOnClick) {
      marker.bindPopup(popupOnClick.content || "", {
        maxWidth: popupOnClick.maxWidth || 300,
        className: popupOnClick.className || "marker-popup",
        ...popupOnClick,
      });
    }

    // Add click handler if provided
    if (onClick) {
      marker.on("click", () => onClick(id, coordinates));
    }

    // Store marker data
    const markerData: MarkerData = {
      id,
      coordinates,
      options: markerOptions as MarkerOptions,
      icon,
      iconOptions,
      legend,
      popupOnClick,
      marker,
    };

    this.markers.set(id, markerData);
    return id;
  }

  /**
   * Add multiple markers to the map
   */
  public addMarkers(markersData: Array<MarkerBase>): Array<string> {
    // Ensure map is ready before adding markers
    if (!this.isMapReady()) {
      throw new Error("Map container is not ready. Wait for map initialization to complete.");
    }

    const addedIds: Array<string> = [];
    markersData.forEach(({ id, coordinates, options, icon, iconOptions, legend, popupOnClick }) => {
      this.addMarker(id, coordinates, options, icon, iconOptions, legend, popupOnClick);
      addedIds.push(id);
    });
    return addedIds;
  }

  /**
   * Remove a marker from the map
   */
  public removeMarker(id: string): boolean {
    const markerData = this.markers.get(id);
    if (markerData) {
      this.removeLayer(markerData.marker);
      this.markers.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Remove multiple markers from the map
   */
  public removeMarkers(ids: Array<string>): Array<boolean> {
    return ids.map((id) => this.removeMarker(id));
  }

  /**
   * Remove all markers from the map
   */
  public clearMarkers(): void {
    this.markers.forEach((markerData) => {
      this.removeLayer(markerData.marker);
    });
    this.markers.clear();
  }

  /**
   * Get a marker by ID
   */
  public getMarker(id: string): MarkerData | undefined {
    return this.markers.get(id);
  }

  /**
   * Check a marker by ID
   */
  public hasMarker(id: string): boolean {
    return this.markers.has(id);
  }

  /**
   * Get all markers
   */
  public getAllMarkers(): Map<string, MarkerData> {
    return new Map(this.markers);
  }

  /**
   * Update marker position
   */
  public updateMarker(id: string, coordinates: L.LatLngExpression, options?: MarkerOptions): boolean {
    const markerData = this.markers.get(id);
    if (markerData) {
      // Update coordinates
      markerData.marker.setLatLng(coordinates);
      markerData.coordinates = coordinates;

      // Update options if provided
      if (options) {
        // Apply new options by recreating marker if needed
        const currentOptions = { ...markerData.options, ...options };
        markerData.options = currentOptions;

        // Update opacity if provided
        if (options.opacity !== undefined) {
          markerData.marker.setOpacity(options.opacity);
        }
      }

      return true;
    }
    return false;
  }

  /**
   * Show/hide a marker
   */
  public toggleMarker(id: string, visible: boolean): boolean {
    const markerData = this.markers.get(id);
    if (markerData) {
      if (visible) {
        if (!this.hasLayer(markerData.marker)) {
          markerData.marker.addTo(this);
        }
      } else {
        if (this.hasLayer(markerData.marker)) {
          this.removeLayer(markerData.marker);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Fit map bounds to include all markers
   */
  public fitToMarkers(padding: number = 20): void {
    if (this.markers.size === 0) return;

    const group = this.L.featureGroup(Array.from(this.markers.values()).map((data) => data.marker));
    this.fitBounds(group.getBounds(), { padding: [padding, padding] });
  }

  /**
   * Fit map bounds to specific markers
   */
  public fitToSpecificMarkers(ids: Array<string>, padding: number = 20): void {
    const markers = ids.map((id) => this.markers.get(id)?.marker).filter(Boolean) as Array<L.Marker>;

    if (markers.length === 0) return;

    const group = this.L.featureGroup(markers);
    this.fitBounds(group.getBounds(), { padding: [padding, padding] });
  }

  /**
   * Fit map bounds to include all polylines and markers
   */
  public fitToAll(padding: number = 20): void {
    const allFeatures = [
      ...Array.from(this.polylines.values()).map((data) => data.polyline),
      ...Array.from(this.markers.values()).map((data) => data.marker),
    ];

    if (allFeatures.length === 0) return;

    const group = this.L.featureGroup(allFeatures);
    this.fitBounds(group.getBounds(), { padding: [padding, padding] });
  }

  /**
   * Clear all polylines and markers
   */
  public clearAll(): void {
    this.clearPolylines();
    this.clearMarkers();
  }

  /**
   * Update marker legend (tooltip)
   */
  public updateMarkerLegend(id: string, legend: CustomLegendOptions): boolean {
    const markerData = this.markers.get(id);
    if (markerData) {
      // Remove existing tooltip
      markerData.marker.unbindTooltip();

      // Add new legend if show is true
      if (legend.show) {
        markerData.marker.bindTooltip(legend.label, {
          permanent: legend.permanent || false,
          direction: legend.direction || "top",
          opacity: legend.opacity || 1,
          className: legend.className || "marker-legend",
          ...legend,
        });
      }

      // Update stored data
      markerData.legend = legend;
      return true;
    }
    return false;
  }

  /**
   * Show/hide marker legend
   */
  public toggleMarkerLegend(id: string, show: boolean): boolean {
    const markerData = this.markers.get(id);
    if (markerData?.legend) {
      const updatedLegend = { ...markerData.legend, show };
      return this.updateMarkerLegend(id, updatedLegend);
    }
    return false;
  }

  /**
   * Update marker popup
   */
  public updateMarkerPopup(id: string, popup: CustomPopupOptions): boolean {
    const markerData = this.markers.get(id);
    if (markerData) {
      // Remove existing popup
      markerData.marker.unbindPopup();

      // Add new popup
      markerData.marker.bindPopup(popup.content || "", {
        maxWidth: popup.maxWidth || 300,
        className: popup.className || "marker-popup",
        ...popup,
      });

      // Update stored data
      markerData.popupOnClick = popup;
      return true;
    }
    return false;
  }

  /**
   * Open marker popup
   */
  public openMarkerPopup(id: string): boolean {
    const markerData = this.markers.get(id);
    if (markerData?.marker.getPopup?.()) {
      markerData.marker.openPopup();
      return true;
    }
    return false;
  }

  /**
   * Close marker popup
   */
  public closeMarkerPopup(id: string): boolean {
    const markerData = this.markers.get(id);
    if (markerData?.marker.getPopup()) {
      markerData.marker.closePopup();
      return true;
    }
    return false;
  }

  /**
   * Get all markers with legends
   */
  public getMarkersWithLegends(): Map<string, MarkerData> {
    const markersWithLegends = new Map<string, MarkerData>();
    this.markers.forEach((data, id) => {
      if (data.legend?.show) {
        markersWithLegends.set(id, data);
      }
    });
    return markersWithLegends;
  }

  /**
   * Get all markers with popups
   */
  public getMarkersWithPopups(): Map<string, MarkerData> {
    const markersWithPopups = new Map<string, MarkerData>();
    this.markers.forEach((data, id) => {
      if (data.popupOnClick) {
        markersWithPopups.set(id, data);
      }
    });
    return markersWithPopups;
  }
}

export default MapClass;
export type {
  CustomIconOptions,
  CustomLegendOptions,
  CustomPopupOptions,
  LatLngExpression,
  MapClassOptions,
  MapClassType,
  MarkerBase,
  MarkerData,
  MarkerInput,
  MarkerOptions,
  PolylineData,
  PolylineOptions,
  RoutesInput,
  TileLayer,
};
