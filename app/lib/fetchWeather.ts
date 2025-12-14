import { OpenMeteoResponse } from '../types/weather';

interface FetchWeatherParams {
  lat: number;
  lon: number;
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
