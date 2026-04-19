import { OpenMeteoResponse } from '../types/weather';

interface FetchWeatherParams {
  lat: number;
  lon: number;
}

// OpenWeatherMap current weather response shape (only fields we use)
export interface OWMCurrentResponse {
  weather: Array<{ id: number; main: string; description: string }>;
  main: { temp: number; humidity: number };
  wind: { speed: number };
  visibility: number; // metres
  coord: { lat: number; lon: number };
}

/**
 * Convert an OpenWeatherMap weather ID to the nearest WMO weather code so
 * the rest of the app (themes, icons, condition strings) stays consistent.
 */
export function owmIdToWmoCode(id: number): number {
  if (id >= 200 && id < 300) return 95; // thunderstorm
  if (id >= 300 && id < 400) return 51; // drizzle → light rain
  if (id >= 500 && id < 600) return 61; // rain
  if (id >= 600 && id < 700) return 71; // snow
  if (id >= 700 && id < 800) return 45; // atmosphere (fog, mist, haze…)
  if (id === 800) return 0;             // clear sky
  if (id === 801) return 1;             // few clouds
  if (id === 802) return 2;             // scattered clouds
  return 3;                             // broken / overcast (803, 804)
}

/**
 * Fetch current conditions from our own Next.js API route, which calls
 * OpenWeatherMap with the API key kept server-side.
 * Throws if the route returns an error (e.g. key not configured).
 */
export async function fetchCurrentWeatherOWM(lat: number, lon: number): Promise<OWMCurrentResponse> {
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch current weather');
  }
  return response.json();
}


// Map WMO Weather Codes to condition names
export function getWeatherCondition(weatherCode: number): string {
  if (weatherCode === 0) return 'Clear';
  if (weatherCode === 1 || weatherCode === 2) return 'Partly Cloudy';
  if (weatherCode === 3) return 'Cloudy';
  if (weatherCode >= 45 && weatherCode <= 48) return 'Foggy';
  if (weatherCode >= 51 && weatherCode <= 67) return 'Rainy';
  if (weatherCode >= 71 && weatherCode <= 77) return 'Snowy';
  if (weatherCode >= 80 && weatherCode <= 82) return 'Rain Showers';
  if (weatherCode >= 85 && weatherCode <= 86) return 'Snow Showers';
  if (weatherCode >= 95 && weatherCode <= 99) return 'Thunderstorm';
  return 'Clear';
}

// Map weather conditions to icon types
export function getWeatherIcon(weatherCode: number): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'windy' {
  if (weatherCode === 0) return 'sunny';
  if (weatherCode === 1 || weatherCode === 2) return 'partly-cloudy';
  if (weatherCode === 3) return 'cloudy';
  if (weatherCode >= 51 && weatherCode <= 67) return 'rainy';
  if (weatherCode >= 71 && weatherCode <= 77) return 'snowy';
  if (weatherCode >= 80 && weatherCode <= 82) return 'rainy';
  if (weatherCode >= 85 && weatherCode <= 86) return 'snowy';
  if (weatherCode >= 95 && weatherCode <= 99) return 'rainy';
  return 'sunny';
}

export async function fetchWeather({ lat, lon }: FetchWeatherParams): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,visibility',
    hourly: 'temperature_2m,weathercode',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode',
    timezone: 'auto',
    cell_selection: 'nearest', // snap to nearest grid point for most local result
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}

export async function fetchWeatherByCity(city: string): Promise<OpenMeteoResponse> {
  // First, geocode the city name using a geocoding API
  // For simplicity, we'll use OpenStreetMap Nominatim
  const geocodeResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
  );
  
  if (!geocodeResponse.ok) {
    throw new Error('Failed to geocode city');
  }

  const geocodeData = await geocodeResponse.json();
  
  if (!geocodeData || geocodeData.length === 0) {
    throw new Error('City not found');
  }

  const { lat, lon } = geocodeData[0];
  return fetchWeather({ lat: parseFloat(lat), lon: parseFloat(lon) });
}
