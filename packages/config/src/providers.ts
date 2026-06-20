// ── Provider adapter types ──────────────────────────────────────────────────
// All third-party services are accessed through these interfaces.
// No screen or component should import from a provider SDK directly.

export interface MapsProvider {
  name: "maplibre" | "google";
  /** Tile URL template for the map raster/vector tiles */
  tileUrl: string;
  /** MapLibre style JSON URL or Google Maps API key */
  styleOrKey: string;
}

export interface RoutingProvider {
  name: "graphhopper" | "osrm";
  /** Backend-only: routing API key (never exposed to client) */
  apiKey?: string;
}

export interface GeocodingProvider {
  name: "graphhopper" | "nominatim";
}

export interface StorageProvider {
  name: "r2" | "s3" | "local";
  /** Public CDN URL for serving media */
  publicUrl: string;
}

export interface EmailProvider {
  name: "resend" | "zoho" | "smtp";
}

export interface NotificationProvider {
  name: "expo" | "firebase" | "none";
}

export interface OTPProvider {
  name: "whatsapp" | "sms" | "email";
}

export interface AthooConfig {
  maps: MapsProvider;
  routing: RoutingProvider;
  geocoding: GeocodingProvider;
  storage: StorageProvider;
  email: EmailProvider;
  notifications: NotificationProvider;
  otp: OTPProvider;
}
