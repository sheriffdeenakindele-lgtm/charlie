// Open-Meteo API Response Types
export interface OpenMeteoCurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  weathercode: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  visibility: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: OpenMeteoCurrentWeather;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

// Normalized Weather Data
export interface NormalizedWeatherData {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudiness: number;
  condition: string;
  conditionDescription: string;
  icon: string;
  location: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  sunrise: number;
  sunset: number;
  timestamp: number;
}

// Forecast Types
export interface HourlyForecastData {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface DailyForecastData {
  day: string;
  date: Date;
  high: number;
  low: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitationChance?: number;
}

// Location Types
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  name: string;
  country: string;
  coords: LocationCoords;
}

// UI State Types
export type WeatherBackgroundType = 'clear' | 'clouds' | 'rain' | 'storm' | 'snow' | 'fog';

export type TemperatureUnit = 'C' | 'F';
export type WindSpeedUnit = 'kmh' | 'mph';

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  use24HourTime: boolean;
}

// Error Types
export interface WeatherError {
  message: string;
  code?: string;
  statusCode?: number;
}
