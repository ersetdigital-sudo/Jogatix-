/**
 * Small, SSR-safe localStorage helpers. Every accessor is a no-op on the
 * server, so importing this from a client component is always safe.
 */

export const STORAGE_KEYS = {
  orders: "jogatix_orders",
  products: "jogatix_admin_products",
  settings: "jogatix_admin_settings",
} as const;

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to persist "${key}":`, error);
    return false;
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
