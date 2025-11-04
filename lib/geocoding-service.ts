/**
 * Service de géocodage avec cache localStorage pour optimiser les performances
 */

const GEOCODE_CACHE_KEY = "planevent_geocode_cache";
const CACHE_VERSION = "v1";
const CACHE_EXPIRY_DAYS = 30;

interface CachedCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

interface GeocodeCache {
  version: string;
  data: Record<string, CachedCoordinate>;
}

/**
 * Récupère le cache depuis localStorage
 */
function getCache(): GeocodeCache {
  if (typeof window === "undefined") {
    return { version: CACHE_VERSION, data: {} };
  }

  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    if (!cached) {
      return { version: CACHE_VERSION, data: {} };
    }

    const parsed = JSON.parse(cached) as GeocodeCache;

    // Vérifier la version du cache
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(GEOCODE_CACHE_KEY);
      return { version: CACHE_VERSION, data: {} };
    }

    return parsed;
  } catch (error) {
    console.error("Erreur lors de la lecture du cache de géocodage:", error);
    return { version: CACHE_VERSION, data: {} };
  }
}

/**
 * Sauvegarde le cache dans localStorage
 */
function saveCache(cache: GeocodeCache): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du cache de géocodage:", error);
  }
}

/**
 * Vérifie si une entrée du cache est encore valide
 */
function isCacheValid(cached: CachedCoordinate): boolean {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now - cached.timestamp < expiryTime;
}

/**
 * Normalise une adresse pour la clé de cache
 */
function normalizeAddress(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Géocode une adresse via l'API Nominatim avec respect du rate limit
 */
async function geocodeWithNominatim(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );

    if (!response.ok) {
      console.error("Erreur Nominatim:", response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Erreur lors du géocodage:", error);
    return null;
  }
}

/**
 * Récupère les coordonnées d'une adresse avec cache
 */
export async function getCachedCoordinates(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim() === "") {
    return null;
  }

  const normalizedAddress = normalizeAddress(address);
  const cache = getCache();

  // Vérifier le cache
  const cached = cache.data[normalizedAddress];
  if (cached && isCacheValid(cached)) {
    return { lat: cached.lat, lng: cached.lng };
  }

  // Géocoder l'adresse
  const coords = await geocodeWithNominatim(address);

  if (coords) {
    // Sauvegarder dans le cache
    cache.data[normalizedAddress] = {
      lat: coords.lat,
      lng: coords.lng,
      timestamp: Date.now(),
    };
    saveCache(cache);
  }

  return coords;
}

/**
 * Géocode plusieurs adresses en parallèle avec rate limiting
 * Respecte la limite de 1 requête par seconde de Nominatim
 */
export async function batchGeocode(
  addresses: string[],
  delayMs: number = 1100
): Promise<Map<string, { lat: number; lng: number } | null>> {
  const results = new Map<string, { lat: number; lng: number } | null>();

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];

    // Ajouter un délai entre les requêtes (sauf pour la première)
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const coords = await getCachedCoordinates(address);
    results.set(address, coords);
  }

  return results;
}

/**
 * Nettoie les entrées expirées du cache
 */
export function cleanExpiredCache(): void {
  if (typeof window === "undefined") return;

  const cache = getCache();
  const cleaned: Record<string, CachedCoordinate> = {};

  for (const [address, cached] of Object.entries(cache.data)) {
    if (isCacheValid(cached)) {
      cleaned[address] = cached;
    }
  }

  cache.data = cleaned;
  saveCache(cache);
}

/**
 * Vide complètement le cache
 */
export function clearCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GEOCODE_CACHE_KEY);
}

/**
 * Récupère les statistiques du cache
 */
export function getCacheStats(): { size: number; oldestEntry: number | null } {
  const cache = getCache();
  const entries = Object.values(cache.data);

  let oldestTimestamp: number | null = null;
  if (entries.length > 0) {
    oldestTimestamp = Math.min(...entries.map((e) => e.timestamp));
  }

  return {
    size: entries.length,
    oldestEntry: oldestTimestamp,
  };
}
