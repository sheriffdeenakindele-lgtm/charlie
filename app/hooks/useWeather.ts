'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchWeather,
  fetchCurrentWeatherOWM,
  owmIdToWmoCode,
  getWeatherCondition,
  getWeatherIcon,
} from '../lib/fetchWeather';

export interface HourlySlice {
  time: string[];       // formatted local time strings e.g. "3 PM"
  temperature: number[];
  weatherCode: number[];
}

export interface WeatherData {
  temperature: number;
  condition: string;
  weatherCode: number;
  icon: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'windy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  hourly: HourlySlice; // next ~9 hours, local time
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
  source: 'hybrid' | 'open-meteo';
}

/** Format an Open-Meteo local-time string like "2024-01-15T14:00" as "2 PM" */
function fmtOmHour(iso: string): string {
  // Append 'Z' would wrongly shift to UTC — treat as local by replacing T with space
  const d = new Date(iso.replace('T', ' '));
  return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
}

export function useWeather(lat: number, lon: number) {
  // ── Open-Meteo: forecast backbone (hourly + daily + fallback current) ──
  const forecastQuery = useQuery({
    queryKey: ['weather-forecast', lat, lon],
    queryFn: () => fetchWeather({ lat, lon }),
  });

  // ── OWM: station-level current conditions ──
  const currentQuery = useQuery({
    queryKey: ['weather-current-owm', lat, lon],
    queryFn: () => fetchCurrentWeatherOWM(lat, lon),
    retry: false,
  });

  const forecast = forecastQuery.data;
  const owm = currentQuery.data;

  let data: WeatherData | null = null;

  if (forecast) {
    // Open-Meteo returns LOCAL time strings (timezone: 'auto'), so build the
    // comparison string from the local clock — not toISOString() which is UTC.
    const d = new Date();
    const localHour =
      `${d.getFullYear()}-` +
      `${String(d.getMonth() + 1).padStart(2, '0')}-` +
      `${String(d.getDate()).padStart(2, '0')}T` +
      `${String(d.getHours()).padStart(2, '0')}`;
    let startIdx = forecast.hourly.time.findIndex(t => t.slice(0, 13) >= localHour);
    if (startIdx === -1) startIdx = 0;
    const slice = forecast.hourly.time.slice(startIdx, startIdx + 9);
    const hourly: HourlySlice = {
      time: slice.map(fmtOmHour),
      temperature: forecast.hourly.temperature_2m.slice(startIdx, startIdx + 9).map(Math.round),
      weatherCode: forecast.hourly.weathercode.slice(startIdx, startIdx + 9),
    };

    if (owm) {
      const wmoCode = owmIdToWmoCode(owm.weather[0]?.id ?? 800);
      data = {
        temperature: Math.round(owm.main.temp),
        condition: getWeatherCondition(wmoCode),
        weatherCode: wmoCode,
        icon: getWeatherIcon(wmoCode),
        humidity: owm.main.humidity,
        windSpeed: Math.round(owm.wind.speed * 3.6), // m/s → km/h
        visibility: owm.visibility / 1000,            // metres → km
        hourly,
        daily: {
          time: forecast.daily.time,
          maxTemp: forecast.daily.temperature_2m_max,
          minTemp: forecast.daily.temperature_2m_min,
          weatherCode: forecast.daily.weathercode,
        },
        location: {
          lat: forecast.latitude,
          lon: forecast.longitude,
          timezone: forecast.timezone,
        },
        source: 'hybrid',
      };
    } else {
      // Fallback: Open-Meteo only
      data = {
        temperature: Math.round(forecast.current.temperature_2m),
        condition: getWeatherCondition(forecast.current.weathercode),
        weatherCode: forecast.current.weathercode,
        icon: getWeatherIcon(forecast.current.weathercode),
        humidity: forecast.current.relative_humidity_2m,
        windSpeed: forecast.current.wind_speed_10m,
        visibility: forecast.current.visibility / 1000,
        hourly,
        daily: {
          time: forecast.daily.time,
          maxTemp: forecast.daily.temperature_2m_max,
          minTemp: forecast.daily.temperature_2m_min,
          weatherCode: forecast.daily.weathercode,
        },
        location: {
          lat: forecast.latitude,
          lon: forecast.longitude,
          timezone: forecast.timezone,
        },
        source: 'open-meteo',
      };
    }
  }

  return {
    data,
    loading: forecastQuery.isLoading,
    fetching: forecastQuery.isFetching || currentQuery.isFetching,
    error: forecastQuery.error
      ? forecastQuery.error instanceof Error
        ? forecastQuery.error.message
        : 'Unknown error'
      : null,
  };
}
