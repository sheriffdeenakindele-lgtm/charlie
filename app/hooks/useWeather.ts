'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWeather, getWeatherCondition, getWeatherIcon } from '../lib/fetchWeather';

export interface WeatherData {
  temperature: number;
  condition: string;
  weatherCode: number;
  icon: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'windy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    maxTemp: number[];
    minTemp: number[];
    weatherCode: number[];
  };
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
}

async function fetchAndTransform(lat: number, lon: number): Promise<WeatherData> {
  const result = await fetchWeather({ lat, lon });
  return {
    temperature: Math.round(result.current.temperature_2m),
    condition: getWeatherCondition(result.current.weathercode),
    weatherCode: result.current.weathercode,
    icon: getWeatherIcon(result.current.weathercode),
    humidity: result.current.relative_humidity_2m,
    windSpeed: result.current.wind_speed_10m,
    visibility: result.current.visibility / 1000,
    hourly: {
      time: result.hourly.time,
      temperature: result.hourly.temperature_2m,
      weatherCode: result.hourly.weathercode,
    },
    daily: {
      time: result.daily.time,
      maxTemp: result.daily.temperature_2m_max,
      minTemp: result.daily.temperature_2m_min,
      weatherCode: result.daily.weathercode,
    },
    location: {
      lat: result.latitude,
      lon: result.longitude,
      timezone: result.timezone,
    },
  };
}

export function useWeather(lat: number, lon: number) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchAndTransform(lat, lon),
    // Re-use staleTime from QueryClient defaults (5 min)
  });

  return {
    data: data ?? null,
    loading: isLoading,   // true only on first load (no cached data)
    fetching: isFetching, // true whenever a background/foreground fetch is in progress
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
  };
}
