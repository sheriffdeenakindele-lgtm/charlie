'use client';

import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Toast from '../components/ui/Toast';
import { fetchWeather, getWeatherCondition, getWeatherIcon } from '../lib/fetchWeather';
import { reverseGeocode } from '../lib/geocoding';
import { getWeatherTheme } from '../lib/weatherTheme';
import { OpenMeteoResponse } from '../types/weather';

interface SavedLocation {
  id: number;
  city: string;
  lat: number;
  lon: number;
  isCurrent?: boolean;
}

interface LocationWeather extends SavedLocation {
  time: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  icon: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'snowy' | 'windy';
  weatherCode: number;
}

export default function SavedLocationsPage() {
  const [locationsWeather, setLocationsWeather] = useState<LocationWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [refreshingCurrent, setRefreshingCurrent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showError = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 6000);
  };

  const handleRefreshCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser.');
      return;
    }

    if (refreshingCurrent) return;

    setRefreshingCurrent(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const [data, locationName]: [OpenMeteoResponse, string] = await Promise.all([
            fetchWeather({ lat, lon }),
            reverseGeocode(lat, lon),
          ]);

          const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: data.timezone,
            hour12: true,
          });

          const newCurrentLocation: LocationWeather = {
            id: 0,
            city: locationName,
            lat,
            lon,
            isCurrent: true,
            time: currentTime,
            temperature: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weathercode),
            high: Math.round(data.daily.temperature_2m_max[0]),
            low: Math.round(data.daily.temperature_2m_min[0]),
            icon: getWeatherIcon(data.current.weathercode),
            weatherCode: data.current.weathercode,
          };

          localStorage.setItem('currentLocation', JSON.stringify({ lat, lon }));
          setCurrentLocationCoords({ lat, lon });

          setLocationsWeather((prev) => {
            const withoutCurrent = prev.filter((loc) => !loc.isCurrent);
            return [newCurrentLocation, ...withoutCurrent];
          });
        } catch {
          showError('Failed to fetch weather data. Please try again.');
        } finally {
          setRefreshingCurrent(false);
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Please enable location access in your browser settings.',
          2: 'Location information unavailable.',
          3: 'Location request timed out.',
        };
        showError(messages[err.code] ?? 'Failed to get location.');
        setRefreshingCurrent(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const fetchAllLocations = async () => {
      setLoading(true);
      try {
        let userLocation: SavedLocation | null = null;
        const storedCurrentLocation = localStorage.getItem('currentLocation');

        if (storedCurrentLocation) {
          try {
            const { lat, lon } = JSON.parse(storedCurrentLocation);
            const locationName = await reverseGeocode(lat, lon);
            userLocation = { id: 0, city: locationName, lat, lon, isCurrent: true };
            setCurrentLocationCoords({ lat, lon });
          } catch {}
        } else if (navigator.geolocation) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const locationName = await reverseGeocode(lat, lon);
                userLocation = { id: 0, city: locationName, lat, lon, isCurrent: true };
                setCurrentLocationCoords({ lat, lon });
                localStorage.setItem('currentLocation', JSON.stringify({ lat, lon }));
                resolve();
              },
              () => resolve()
            );
          });
        }

        const savedLocations: SavedLocation[] = [
          { id: 2, city: 'New York, US',   lat: 40.7128,  lon: -74.006  },
          { id: 3, city: 'Tokyo, JP',      lat: 35.6762,  lon: 139.6503 },
          { id: 4, city: 'Sydney, AU',     lat: -33.8688, lon: 151.2093 },
          { id: 5, city: 'Berlin, DE',     lat: 52.5200,  lon: 13.4050  },
        ];

        const allLocations = userLocation ? [userLocation, ...savedLocations] : savedLocations;

        const weatherPromises = allLocations.map(async (location) => {
          const data: OpenMeteoResponse = await fetchWeather({ lat: location.lat, lon: location.lon });
          const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: data.timezone,
            hour12: true,
          });

          return {
            ...location,
            time: currentTime,
            temperature: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weathercode),
            high: Math.round(data.daily.temperature_2m_max[0]),
            low: Math.round(data.daily.temperature_2m_min[0]),
            icon: getWeatherIcon(data.current.weathercode),
            weatherCode: data.current.weathercode,
          };
        });

        const results = await Promise.all(weatherPromises);
        setLocationsWeather(results);
      } catch {
        // Non-critical — partial data may still be shown
      } finally {
        setLoading(false);
      }
    };

    fetchAllLocations();
  }, []);

  const getWeatherIconSvg = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return (
          <svg className="w-14 h-14 text-[#fbbf24]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'rainy':
        return (
          <svg className="w-14 h-14 text-[#00d4ff]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className="w-14 h-14 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'windy':
        return (
          <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const currentLocation = locationsWeather.find((loc) => loc.isCurrent);
  const theme = getWeatherTheme(currentLocation?.weatherCode || 0);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${theme}`} data-theme={theme}>
      {/* Weather Overlays */}
      {theme === 'clear' && (
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl pointer-events-none" />
      )}
      {theme === 'rain' && <div className="rain-layer" />}
      {theme === 'storm' && <div className="lightning" />}
      {theme === 'snow' && <div className="snow-layer" />}
      {theme === 'fog' && <div className="fog-layer" />}

      <Header />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Saved Locations</h1>
            <p className="text-gray-400 text-sm">Manage your favorite cities and quick-access forecasts.</p>
          </div>
          <button className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors w-fit flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Location
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-lg">Loading locations...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {locationsWeather.map((location) => (
              <div
                key={location.id}
                className="bg-[#0d1b1e] rounded-2xl p-5 border border-[#1a2f35] hover:border-[#00d4ff]/30 transition-all relative"
              >
                {/* Options Menu */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Current Location Badge */}
                {location.isCurrent && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {refreshingCurrent ? (
                        <svg className="w-4 h-4 text-[#00d4ff] animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#00d4ff]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
                        {refreshingCurrent ? 'Refreshing...' : 'Current Location'}
                      </span>
                    </div>
                    <button
                      onClick={handleRefreshCurrentLocation}
                      disabled={refreshingCurrent}
                      className="flex items-center gap-1 px-2 py-1 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className={`w-3 h-3 ${refreshingCurrent ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                )}

                {/* City and Time */}
                <h3 className="text-xl font-bold text-white mb-1 pr-8 truncate">{location.city}</h3>
                <p className="text-gray-400 text-sm mb-4">{location.time}</p>

                {/* Temperature and Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold text-white mb-1">{location.temperature}°C</div>
                    <p className="text-white text-sm">{location.condition}</p>
                  </div>
                  <div className="flex-shrink-0">{getWeatherIconSvg(location.icon)}</div>
                </div>

                {/* High/Low */}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>H: {location.high}°</span>
                  <span>L: {location.low}°</span>
                </div>
              </div>
            ))}

            {/* Add City Card */}
            <div className="bg-transparent rounded-2xl p-6 border-2 border-dashed border-[#1a2f35] hover:border-[#00d4ff]/50 transition-all flex flex-col items-center justify-center min-h-[220px] cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-[#1a2f35] group-hover:bg-[#00d4ff]/20 flex items-center justify-center mb-3 transition-colors">
                <svg className="w-7 h-7 text-gray-500 group-hover:text-[#00d4ff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-400 group-hover:text-white font-medium transition-colors text-sm">Add City</p>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
