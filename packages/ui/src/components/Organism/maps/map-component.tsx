/// <reference path="./leaflet-css.d.ts" />

import type * as L from "leaflet";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Loading } from "../../Atom/loading";
// Type-only imports to avoid SSR issues
import type { CustomIconOptions, MapClassOptions, MapClassType, TileLayer } from "./map-class";
import type { MapContainerProps, MapContainerPropsInternal, MapEvent } from "./map-component.types";

const MapContainer: React.FC<MapContainerPropsInternal> = ({
  center = [12.567287, 121.1483878],
  zoom = 13,
  // Default to OpenStreetMap (cookie-free). Only switch to Google Maps tiles
  // after checking cookie consent, since Google Maps sets third-party cookies.
  tileLayer = "osm",
  showLayerControl = true,
  googleMapsApiKey = "",
  className,
  style,
  routes = [],
  markers = [],
  onMapReady,
  onUserInteractionStart,
  onUserInteractionEnd,
  onMoveEnd,
  onDragEnd,
  onZoomEnd,
  onError,
  MapClass, // Injected MapClass
  ...mapOptions
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLayer, setCurrentLayer] = useState<TileLayer>(tileLayer as TileLayer);
  const [isReady, setIsReady] = useState(false);

  const mapInstance = useRef<MapClassType | null>(null);

  /*
   * Keyed on `MapClass` — it arrives once, when the dynamic import resolves.
   * Cancellation runs through a local flag rather than component state: a
   * `mount` state variable in the dependency array tears the map down on
   * StrictMode's second pass and never rebuilds it.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: props are read once at init; later updates are handled by the effects below
  useEffect(() => {
    if (!MapClass || !mapRef.current || mapInstance.current) {
      return;
    }
    if (typeof window === "undefined" || (typeof window.L === "undefined" && !globalThis.L)) {
      return;
    }

    let cancelled = false;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    let interactionTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const map = new MapClass(mapRef.current, {
        center,
        zoom,
        tileLayer: currentLayer,
        showLayerControl: showLayerControl as boolean,
        googleMapsApiKey: googleMapsApiKey as string,
        attributionControl: true,
        ...mapOptions,
      }) as MapClassType;

      mapInstance.current = map;

      // Leaflet needs a frame to measure the container before its size-dependent
      // calls (fitBounds, marker placement) return anything sensible.
      readyTimer = setTimeout(() => {
        if (cancelled) {
          return;
        }
        setIsReady(true);

        map.on("baselayerchange", () => {
          if (!cancelled) {
            setCurrentLayer(map.getCurrentTileLayer());
          }
        });

        if (onUserInteractionStart && onUserInteractionEnd) {
          const pauseFollowing = () => {
            map.setUserInteracting(true);
            onUserInteractionStart();
          };
          const resumeFollowing = () => {
            clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(() => {
              map.setUserInteracting(false);
              onUserInteractionEnd();
            }, 3000);
          };

          map.on("dragstart", pauseFollowing);
          map.on("zoomstart", pauseFollowing);
          map.on("dragend", resumeFollowing);
          map.on("zoomend", resumeFollowing);
          map.on("moveend", resumeFollowing);
        }

        const buildMapEvent = (_event: unknown): MapEvent => {
          const event = _event as L.LeafletEvent;
          const mapTarget = event.target as L.Map;
          const mapBounds = mapTarget.getBounds();
          const liveCenter = mapTarget.getCenter();
          return {
            zoom: mapTarget.getZoom(),
            center: [liveCenter.lat, liveCenter.lng],
            bounds: {
              north: mapBounds.getNorth(),
              south: mapBounds.getSouth(),
              east: mapBounds.getEast(),
              west: mapBounds.getWest(),
            },
            option: mapTarget.options as L.MapOptions,
            layer: mapTarget,
          };
        };

        map.on("moveend", (event) => onMoveEnd?.(buildMapEvent(event)));
        map.on("dragend", (event) => onDragEnd?.(buildMapEvent(event)));
        map.on("zoomend", (event) => onZoomEnd?.(buildMapEvent(event)));

        onMapReady?.(map);
      }, 300);
    } catch (error) {
      onError?.(error);
    }

    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      clearTimeout(interactionTimeout);
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [MapClass]);

  useEffect(() => {
    if (mapInstance.current && isReady && !mapInstance.current.isUserInteracting?.()) {
      mapInstance.current.setView(center, zoom);
    }
  }, [center, zoom, isReady]);

  useEffect(() => {
    if (mapInstance.current && isReady && currentLayer !== mapInstance.current.getCurrentTileLayer()) {
      mapInstance.current.switchTileLayer(currentLayer);
    }
  }, [currentLayer, isReady]);

  useEffect(() => {
    if (mapInstance.current && isReady && routes) {
      mapInstance.current.clearPolylines();

      if (routes.length > 0) {
        mapInstance.current.addPolylines(routes);
      }
    }
  }, [routes, isReady]);

  useEffect(() => {
    if (!mapInstance.current || !isReady || !markers) {
      return;
    }
    try {
      mapInstance.current.clearMarkers();
      for (const marker of markers) {
        try {
          mapInstance.current.addMarker(
            marker.id,
            marker.coordinates,
            marker.options,
            marker.icon,
            marker.iconOptions as CustomIconOptions,
            marker.legend,
            marker.popupOnClick || marker.popup,
            marker.onClick,
          );
        } catch (error) {
          // One bad marker must not take the rest of the layer down with it.
          onError?.(error);
        }
      }
    } catch (error) {
      onError?.(error);
    }
  }, [markers, isReady, onError]);

  return <div ref={mapRef} className={className} style={style} />;
};

const DynamicMapContainer: React.FC<
  MapContainerPropsInternal & {
    MapClass: new (container: string | HTMLElement, options: MapClassOptions) => MapClassType;
  }
> = ({ MapClass, ...props }) => {
  return <MapContainer {...props} MapClass={MapClass} />;
};

interface MapPlaceholderProps {
  className?: string;
  style?: React.CSSProperties;
  failed: boolean;
}

/** Shown while Leaflet loads, and in place of the map when it never arrives. */
const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ className, style, failed }) => (
  <div
    style={style}
    className={cn("flex min-h-100 min-w-100 items-center justify-center rounded-md bg-surface-alt", className)}
  >
    {failed ? (
      <p className="px-6 text-center text-error text-sm">Map failed to load. Check the network and reload.</p>
    ) : (
      <div className="flex flex-col items-center gap-2">
        <Loading size="lg" />
        <p className="text-secondary text-sm">Loading map…</p>
      </div>
    )}
  </div>
);

const MapWrapper: React.FC<MapContainerProps> = (props) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [MapClass, setMapClass] = useState<
    (new (container: string | HTMLElement, options: MapClassOptions) => MapClassType) | null
  >(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Leaflet is loaded once per mount
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css"), import("./map-class")])
      .then(([leaflet, , mapClassModule]) => {
        if (cancelled) {
          return;
        }
        if (!window.L) {
          window.L = leaflet.default || leaflet;
        }
        setMapClass(() => mapClassModule.default);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setStatus("error");
        props.onError?.(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "ready" || !MapClass) {
    return <MapPlaceholder className={props.className} failed={status === "error"} style={props.style} />;
  }

  return <DynamicMapContainer {...props} MapClass={MapClass} />;
};

export default MapWrapper;
export { MapContainer };
