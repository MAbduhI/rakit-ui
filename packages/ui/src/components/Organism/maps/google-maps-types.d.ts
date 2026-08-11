import type * as L from "leaflet";

// Google Maps Enums
enum GoogleMapTypeId {
  ROADMAP = "roadmap",
  SATELLITE = "satellite",
  HYBRID = "hybrid",
  TERRAIN = "terrain",
}

enum GoogleControlPosition {
  TOP_LEFT = 1,
  TOP_CENTER = 2,
  TOP_RIGHT = 3,
  LEFT_CENTER = 4,
  LEFT_TOP = 5,
  LEFT_BOTTOM = 6,
  RIGHT_TOP = 7,
  RIGHT_CENTER = 8,
  RIGHT_BOTTOM = 9,
  BOTTOM_LEFT = 10,
  BOTTOM_CENTER = 11,
  BOTTOM_RIGHT = 12,
}

// Google Maps Interfaces
interface GoogleLatLng {
  lat(): number;
  lng(): number;
  equals(other: GoogleLatLng): boolean;
  toJSON(): GoogleLatLngLiteral;
  toString(): string;
}

interface GoogleLatLngLiteral {
  lat: number;
  lng: number;
}

interface GoogleLatLngBounds {
  contains(latLng: GoogleLatLng | GoogleLatLngLiteral): boolean;
  equals(other: GoogleLatLngBounds): boolean;
  extend(point: GoogleLatLng | GoogleLatLngLiteral): GoogleLatLngBounds;
  getCenter(): GoogleLatLng;
  getNorthEast(): GoogleLatLng;
  getSouthWest(): GoogleLatLng;
  isEmpty(): boolean;
  toJSON(): { north: number; south: number; east: number; west: number };
  toString(): string;
  union(other: GoogleLatLngBounds): GoogleLatLngBounds;
}

interface GoogleMapOptions {
  center?: GoogleLatLng | GoogleLatLngLiteral;
  zoom?: number;
  mapTypeId?: GoogleMapTypeId | string;
  heading?: number;
  tilt?: number;
  mapTypeControl?: boolean;
  mapTypeControlOptions?: GoogleMapTypeControlOptions;
  zoomControl?: boolean;
  zoomControlOptions?: GoogleZoomControlOptions;
  scaleControl?: boolean;
  streetViewControl?: boolean;
  streetViewControlOptions?: GoogleStreetViewControlOptions;
  rotateControl?: boolean;
  fullscreenControl?: boolean;
  fullscreenControlOptions?: GoogleFullscreenControlOptions;
  gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
  clickableIcons?: boolean;
  disableDefaultUI?: boolean;
  disableDoubleClickZoom?: boolean;
  draggable?: boolean;
  draggableCursor?: string;
  draggingCursor?: string;
  keyboardShortcuts?: boolean;
  maxZoom?: number;
  minZoom?: number;
  restriction?: GoogleMapRestriction;
  scrollwheel?: boolean;
  styles?: Array<GoogleMapTypeStyle>;
  backgroundColor?: string;
}

interface GoogleMapTypeControlOptions {
  mapTypeIds?: Array<GoogleMapTypeId | string>;
  position?: GoogleControlPosition;
  style?: number;
}

interface GoogleZoomControlOptions {
  position?: GoogleControlPosition;
}

interface GoogleStreetViewControlOptions {
  position?: GoogleControlPosition;
}

interface GoogleFullscreenControlOptions {
  position?: GoogleControlPosition;
}

interface GoogleMapRestriction {
  latLngBounds: GoogleLatLngBounds | GoogleLatLngBoundsLiteral;
  strictBounds?: boolean;
}

interface GoogleLatLngBoundsLiteral {
  east: number;
  north: number;
  south: number;
  west: number;
}

interface GoogleMapTypeStyle {
  elementType?: string;
  featureType?: string;
  stylers: Array<GoogleMapTypeStyler>;
}

interface GoogleMapTypeStyler {
  color?: string;
  gamma?: number;
  hue?: string;
  invert_lightness?: boolean;
  lightness?: number;
  saturation?: number;
  visibility?: "on" | "off" | "simplified";
  weight?: number;
}

interface GoogleMapInstance {
  getCenter(): GoogleLatLng;
  setCenter(latLng: GoogleLatLng | GoogleLatLngLiteral): void;
  getZoom(): number;
  setZoom(zoom: number): void;
  getBounds(): GoogleLatLngBounds | undefined;
  fitBounds(bounds: GoogleLatLngBounds | GoogleLatLngBoundsLiteral, padding?: number | GooglePadding): void;
  panTo(latLng: GoogleLatLng | GoogleLatLngLiteral): void;
  panBy(x: number, y: number): void;
  getMapTypeId(): string;
  setMapTypeId(mapTypeId: GoogleMapTypeId | string): void;
  getProjection(): GoogleProjection | undefined;
  getDiv(): HTMLElement;
  getHeading(): number;
  setHeading(heading: number): void;
  getTilt(): number;
  setTilt(tilt: number): void;
  setOptions(options: GoogleMapOptions): void;
  addListener(eventName: string, handler: (...args: Array<unknown>) => void): GoogleMapsEventListener;
}

interface GooglePadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface GoogleProjection {
  fromLatLngToPoint(latLng: GoogleLatLng): GooglePoint | null;
  fromPointToLatLng(pixel: GooglePoint, noWrap?: boolean): GoogleLatLng | null;
}

interface GooglePoint {
  x: number;
  y: number;
  equals(other: GooglePoint): boolean;
  toString(): string;
}

interface GoogleMapsEventListener {
  remove(): void;
}

interface GoogleMarkerOptions {
  position?: GoogleLatLng | GoogleLatLngLiteral;
  map?: GoogleMapInstance;
  title?: string;
  icon?: string | GoogleIcon | GoogleSymbol;
  label?: string | GoogleMarkerLabel;
  draggable?: boolean;
  clickable?: boolean;
  visible?: boolean;
  zIndex?: number;
  opacity?: number;
  animation?: number;
  anchorPoint?: GooglePoint;
}

interface GoogleIcon {
  url: string;
  size?: GoogleSize;
  origin?: GooglePoint;
  anchor?: GooglePoint;
  scaledSize?: GoogleSize;
  labelOrigin?: GooglePoint;
}

interface GoogleSymbol {
  path: string | number;
  anchor?: GooglePoint;
  fillColor?: string;
  fillOpacity?: number;
  labelOrigin?: GooglePoint;
  rotation?: number;
  scale?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

interface GoogleMarkerLabel {
  text: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  className?: string;
}

interface GoogleSize {
  width: number;
  height: number;
  equals(other: GoogleSize): boolean;
  toString(): string;
}

interface GoogleMarker {
  getPosition(): GoogleLatLng | null;
  setPosition(latLng: GoogleLatLng | GoogleLatLngLiteral): void;
  getMap(): GoogleMapInstance | null;
  setMap(map: GoogleMapInstance | null): void;
  getTitle(): string | undefined;
  setTitle(title: string): void;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  getDraggable(): boolean;
  setDraggable(draggable: boolean): void;
  getIcon(): string | GoogleIcon | GoogleSymbol | undefined;
  setIcon(icon: string | GoogleIcon | GoogleSymbol): void;
  getLabel(): GoogleMarkerLabel | string | undefined;
  setLabel(label: string | GoogleMarkerLabel): void;
  getZIndex(): number | undefined;
  setZIndex(zIndex: number): void;
  addListener(eventName: string, handler: (...args: Array<unknown>) => void): GoogleMapsEventListener;
}

interface GooglePolylineOptions {
  path?: Array<GoogleLatLng> | Array<GoogleLatLngLiteral>;
  geodesic?: boolean;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  visible?: boolean;
  zIndex?: number;
  map?: GoogleMapInstance;
  clickable?: boolean;
  draggable?: boolean;
  editable?: boolean;
}

interface GooglePolyline {
  getPath(): GoogleMVCArray<GoogleLatLng>;
  setPath(path: Array<GoogleLatLng> | Array<GoogleLatLngLiteral>): void;
  getMap(): GoogleMapInstance | null;
  setMap(map: GoogleMapInstance | null): void;
  setOptions(options: GooglePolylineOptions): void;
  addListener(eventName: string, handler: (...args: Array<unknown>) => void): GoogleMapsEventListener;
}

interface GoogleMVCArray<T> {
  clear(): void;
  forEach(callback: (elem: T, i: number) => void): void;
  getArray(): Array<T>;
  getAt(i: number): T;
  getLength(): number;
  insertAt(i: number, elem: T): void;
  pop(): T;
  push(elem: T): number;
  removeAt(i: number): T;
  setAt(i: number, elem: T): void;
}

interface GoogleInfoWindowOptions {
  content?: string | HTMLElement;
  disableAutoPan?: boolean;
  maxWidth?: number;
  minWidth?: number;
  pixelOffset?: GoogleSize;
  position?: GoogleLatLng | GoogleLatLngLiteral;
  zIndex?: number;
  ariaLabel?: string;
}

interface GoogleInfoWindow {
  close(): void;
  getContent(): string | HTMLElement | undefined;
  getPosition(): GoogleLatLng | undefined;
  getZIndex(): number;
  open(options?: { anchor?: GoogleMarker; map?: GoogleMapInstance }): void;
  setContent(content: string | HTMLElement): void;
  setOptions(options: GoogleInfoWindowOptions): void;
  setPosition(position: GoogleLatLng | GoogleLatLngLiteral): void;
  setZIndex(zIndex: number): void;
  addListener(eventName: string, handler: (...args: Array<unknown>) => void): GoogleMapsEventListener;
}

// Google Maps API namespace
interface GoogleMapsNamespace {
  Map: new (mapDiv: HTMLElement, opts?: GoogleMapOptions) => GoogleMapInstance;
  Marker: new (opts?: GoogleMarkerOptions) => GoogleMarker;
  Polyline: new (opts?: GooglePolylineOptions) => GooglePolyline;
  InfoWindow: new (opts?: GoogleInfoWindowOptions) => GoogleInfoWindow;
  LatLng: new (lat: number, lng: number, noWrap?: boolean) => GoogleLatLng;
  LatLngBounds: new (
    sw?: GoogleLatLng | GoogleLatLngLiteral,
    ne?: GoogleLatLng | GoogleLatLngLiteral,
  ) => GoogleLatLngBounds;
  Point: new (x: number, y: number) => GooglePoint;
  Size: new (width: number, height: number, widthUnit?: string, heightUnit?: string) => GoogleSize;
  MapTypeId: typeof GoogleMapTypeId;
  ControlPosition: typeof GoogleControlPosition;
  event: {
    addListener(
      instance: object,
      eventName: string,
      handler: (...args: Array<unknown>) => void,
    ): GoogleMapsEventListener;
    addListenerOnce(
      instance: object,
      eventName: string,
      handler: (...args: Array<unknown>) => void,
    ): GoogleMapsEventListener;
    removeListener(listener: GoogleMapsEventListener): void;
    trigger(instance: object, eventName: string, ...args: Array<unknown>): void;
    clearInstanceListeners(instance: object): void;
    clearListeners(instance: object, eventName: string): void;
  };
}

interface GoogleNamespace {
  maps: GoogleMapsNamespace;
}

// Type declarations for Google Maps JavaScript API
declare global {
  interface Window {
    google?: GoogleNamespace;
  }
}

// Type declarations for leaflet.gridlayer.googlemutant
declare module "leaflet" {
  namespace gridLayer {
    function googleMutant(options?: GoogleMutantOptions): L.GridLayer;
  }
}

interface GoogleMutantOptions extends L.GridLayerOptions {
  type?: "roadmap" | "satellite" | "terrain" | "hybrid";
  apikey?: string;
}

declare module "leaflet.gridlayer.googlemutant" {}
