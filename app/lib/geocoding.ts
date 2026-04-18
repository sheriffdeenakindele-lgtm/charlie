export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms: number;
}

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json',
  });

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${params}`
    );

    if (!response.ok) {
      throw new Error('Failed to search city');
    }

    const data: GeocodingResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

export function formatCityName(result: GeocodingResult): string {
  const parts = [result.name];
  
  if (result.admin1) {
    parts.push(result.admin1);
  }
  
  parts.push(result.country);
  
  return parts.join(', ');
}

/**
 * Reverse geocode coordinates to a human-readable location name.
 *
 * Strategy:
 *  1. BigDataCloud (free, no key) — returns locality (suburb/area) + city separately,
 *     giving "Lekki, Lagos" style names instead of just "Lagos State".
 *  2. Nominatim fallback — used if BigDataCloud fails or returns nothing useful.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  // ── 1. BigDataCloud ──────────────────────────────────────────────────────
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );

    if (bdcRes.ok) {
      const bdc = await bdcRes.json();

      // locality = neighbourhood / suburb / local area (most specific)
      // city      = the city proper
      // principalSubdivision = state / province
      const locality = bdc.locality?.trim();
      const city     = bdc.city?.trim();
      const country  = bdc.countryName?.trim();

      // Prefer "Locality, City" if they're different, otherwise just city
      const localPart = locality && locality !== city ? `${locality}, ${city}` : city;

      if (localPart && country) return `${localPart}, ${country}`;
      if (localPart)            return localPart;
      if (city && country)      return `${city}, ${country}`;
    }
  } catch {
    // fall through to Nominatim
  }

  // ── 2. Nominatim fallback ────────────────────────────────────────────────
  try {
    // zoom=14 = suburb/district level — more specific than zoom=10 (city)
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14`
    );

    if (!nomRes.ok) return 'Current Location';

    const data    = nomRes.ok ? await nomRes.json() : {};
    const address = data.address || {};

    const local =
      address.neighbourhood ||
      address.suburb        ||
      address.quarter       ||
      address.hamlet;

    const city =
      address.city         ||
      address.town         ||
      address.village      ||
      address.municipality;

    const country = address.country;

    const localPart = local && local !== city ? `${local}, ${city}` : city;

    if (localPart && country) return `${localPart}, ${country}`;
    if (localPart)            return localPart;
    if (address.state && country) return `${address.state}, ${country}`;
    if (country)              return country;
  } catch {
    // both failed
  }

  return 'Current Location';
}
