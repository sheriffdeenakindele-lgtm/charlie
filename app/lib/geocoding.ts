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

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    // Use nominatim reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );

    if (!response.ok) {
      return 'Current Location';
    }

    const data = await response.json();
    const address = data.address || {};
    
    // Try to build a nice location string
    const city = address.city || address.town || address.village || address.municipality;
    const state = address.state;
    const country = address.country;

    if (city && state && country) {
      return `${city}, ${state}, ${country}`;
    } else if (city && country) {
      return `${city}, ${country}`;
    } else if (state && country) {
      return `${state}, ${country}`;
    } else if (country) {
      return country;
    }

    return 'Current Location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Current Location';
  }
}
