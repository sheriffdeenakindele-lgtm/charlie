// API Configuration
export const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default locations
export const DEFAULT_CITY = 'London';
export const DEFAULT_COORDS = {
  lat: 51.5074,
  lon: -0.1278,
};

// Units
export const TEMPERATURE_UNIT = 'C' as const;
export const WIND_SPEED_UNIT = 'kmh' as const;

// Refresh intervals (in milliseconds)
export const WEATHER_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
export const CLOCK_REFRESH_INTERVAL = 1000; // 1 second

// Animation durations
export const BACKGROUND_TRANSITION_DURATION = 1000; // 1 second

// Weather condition mappings
export const WEATHER_CONDITIONS = {
  CLEAR: 'Clear',
  CLOUDS: 'Clouds',
  RAIN: 'Rain',
  DRIZZLE: 'Drizzle',
  THUNDERSTORM: 'Thunderstorm',
  SNOW: 'Snow',
  MIST: 'Mist',
  FOG: 'Fog',
  HAZE: 'Haze',
} as const;
