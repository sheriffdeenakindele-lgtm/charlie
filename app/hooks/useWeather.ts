'use client';

import { useState, useEffect } from 'react';
import { OpenMeteoResponse } from '../types/weather';
import { fetchWeather, fetchWeatherByCity, getWeatherCondition, getWeatherIcon } from '../lib/fetchWeather';

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

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: (lat?: number, lon?: number, city?: string) => Promise<void>;
}

export function useWeather(
  initialLat?: number,
  initialLon?: number,
  initialCity?: string
): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (lat?: number, lon?: number, city?: string) => {
    setLoading(true);
    setError(null);

    try {
      let result: OpenMeteoResponse;

      if (city) {
        result = await fetchWeatherByCity(city);
      } else if (lat !== undefined && lon !== undefined) {
        result = await fetchWeather({ lat, lon });
      } else {
        throw new Error('Either coordinates or city name is required');
      }

      // Transform the API response to our app's format
      setData({
        temperature: Math.round(result.current.temperature_2m),
        condition: getWeatherCondition(result.current.weathercode),
        weatherCode: result.current.weathercode,
        icon: getWeatherIcon(result.current.weathercode),
        humidity: result.current.relative_humidity_2m,
        windSpeed: result.current.wind_speed_10m,
        visibility: result.current.visibility / 1000, // Convert to km
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
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLat !== undefined && initialLon !== undefined) {
      fetchData(initialLat, initialLon);
    } else if (initialCity) {
      fetchData(undefined, undefined, initialCity);
    } else {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
