'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchWeather,
  fetchCurrentWeatherOWM,
  fetchHourlyForecastOWM,
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

/** Format a Unix timestamp as a short local time string like "3 PM" */
function fmtHour(dt: number): string {
  return new Date(dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true });
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

  // ── OWM: station-quality 3-hourly forecast (next ~27 h) ──
  const hourlyOWMQuery = useQuery({
    queryKey: ['weather-hourly-owm', lat, lon],
    queryFn: () => fetchHourlyForecastOWM(lat, lon),
    retry: false,
  });

  const forecast = forecastQuery.data;
  const owm = currentQuery.data;
  const owmHourly = hourlyOWMQuery.data;

  let data: WeatherData | null = null;

  if (forecast) {
    // Build hourly slice — prefer OWM 3-h forecast, fall back to Open-Meteo hourly
    let hourly: HourlySlice;

    if (owmHourly?.list?.length) {
      hourly = {
        time: owmHourly.list.map(e => fmtHour(e.dt)),
        temperature: owmHourly.list.map(e => Math.round(e.main.temp)),
        weatherCode: owmHourly.list.map(e => owmIdToWmoCode(e.weather[0]?.id ?? 800)),
      };
    } else {
      // Slice Open-Meteo hourly to the next 9 hours from now
      const nowISO = new Date().toISOString().slice(0, 13); // "2024-01-15T14"
      let startIdx = forecast.hourly.time.findIndex(t => t.slice(0, 13) >= nowISO);
      if (startIdx === -1) startIdx = 0;
      const slice = forecast.hourly.time.slice(startIdx, startIdx + 9);
      hourly = {
        time: slice.map(fmtOmHour),
        temperature: forecast.hourly.temperature_2m.slice(startIdx, startIdx + 9).map(Math.round),
        weatherCode: forecast.hourly.weathercode.slice(startIdx, startIdx + 9),
      };
    }

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
    fetching: forecastQuery.isFetching || currentQuery.isFetching || hourlyOWMQuery.isFetching,
    error: forecastQuery.error
      ? forecastQuery.error instanceof Error
        ? forecastQuery.error.message
        : 'Unknown error'
      : null,
  };
}
