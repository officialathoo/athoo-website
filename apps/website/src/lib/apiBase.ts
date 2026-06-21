export const PRIMARY_API_BASE = "https://thoo-api.onrender.com";

export function normalizeApiBase(value: string): string {
  return String(value || "").trim().replace(/\/$/, "");
}

export function resolveApiBase(): string {
  const configured = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || "");
  if (configured && configured !== "https://api.athoo.pk") return configured;
  return PRIMARY_API_BASE;
}

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiBase()}${cleanPath}`;
}
