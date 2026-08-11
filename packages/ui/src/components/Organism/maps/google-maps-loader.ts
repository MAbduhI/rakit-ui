/// <reference path="./google-maps-types.d.ts" />

/**
 * Google Maps API Loader utility
 * Handles loading the Google Maps JavaScript API dynamically
 */

interface GoogleMapsLoaderOptions {
  apiKey: string;
  version?: string;
  libraries?: Array<string>;
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  /**
   * Load Google Maps API if not already loaded
   */
  public async load(options: GoogleMapsLoaderOptions): Promise<void> {
    if (this.isLoaded && window.google && window.google.maps) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadGoogleMapsAPI(options);
    return this.loadPromise;
  }

  private async loadGoogleMapsAPI(options: GoogleMapsLoaderOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          this.isLoaded = true;
          resolve();
        });
        existingScript.addEventListener("error", () => {
          reject(new Error("Failed to load Google Maps API"));
        });
        return;
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;

      const params = new URLSearchParams({
        key: options.apiKey,
        v: options.version || "weekly",
        ...(options.libraries &&
          options.libraries.length > 0 && {
            libraries: options.libraries.join(","),
          }),
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

      script.onload = () => {
        setTimeout(() => {
          if (window.google?.maps) {
            this.isLoaded = true;
            resolve();
          } else {
            reject(new Error("Google Maps API loaded but window.google not available"));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error("Failed to load Google Maps API script"));
      };

      document.head.appendChild(script);

      setTimeout(() => {
        if (!this.isLoaded) {
          reject(new Error("Google Maps API loading timeout"));
        }
      }, 15000); // 15 seconds timeout
    });
  }

  /**
   * Check if Google Maps API is loaded
   */
  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }
}

// Export the singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();
