'use client';

import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MapLocationCard from './components/cards/MapLocationCard';
import WeatherMetricCard from './components/cards/WeatherMetricCard';
import WeeklyForecast from './components/forecast/WeeklyForecast';
import Toast from './components/ui/Toast';
import { useWeather } from './hooks/useWeather';
import { getWeatherIcon, getWeatherCondition } from './lib/fetchWeather';
import { reverseGeocode } from './lib/geocoding';
import { getWeatherTheme } from './lib/weatherTheme';

export default function Home() {
  const [location, setLocation] = useState({ lat: 51.5072, lon: -0.1276, city: 'London, UK' });
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const { data: weather, loading, fetching, error } = useWeather(location.lat, location.lon);
  const [toast, setToast] = useState<string | null>(null);

  const showError = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 6000);
  };

  // Always attempt geolocation on load — show real location when permission granted
  useEffect(() => {
    if (!navigator.geolocation) {
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        try {
          const { name, lat, lon } = JSON.parse(savedCity);
          setLocation({ lat, lon, city: name });
          setIsCurrentLocation(false);
        } catch {}
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const cityName = await reverseGeocode(lat, lon);
          setLocation({ lat, lon, city: cityName });
        } catch {
          setLocation({ lat, lon, city: 'Current Location' });
        }
        setIsCurrentLocation(true);
        localStorage.setItem('currentLocation', JSON.stringify({ lat, lon }));
      },
      () => {
        // Permission denied — fall back to last searched city
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
          try {
            const { name, lat, lon } = JSON.parse(savedCity);
            setLocation({ lat, lon, city: name });
            setIsCurrentLocation(false);
          } catch {}
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Listen for city selection from search
  useEffect(() => {
    const handleCitySelected = (event: CustomEvent) => {
      const { name, lat, lon } = event.detail;
      setLocation({ lat, lon, city: name });
      setIsCurrentLocation(false);
    };

    window.addEventListener('citySelected', handleCitySelected as EventListener);
    return () => window.removeEventListener('citySelected', handleCitySelected as EventListener);
  }, []);

  // Get current day of the week
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Handle location refresh
  const handleRefreshLocation = async () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser.');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const locationName = await reverseGeocode(lat, lon);
            setLocation({ lat, lon, city: locationName });
            setIsCurrentLocation(true);
            localStorage.setItem('currentLocation', JSON.stringify({ lat, lon }));
            resolve();
          } catch (err) {
            showError('Failed to fetch location data. Please try again.');
            reject(err);
          }
        },
        (err) => {
          const messages: Record<number, string> = {
            1: 'Location permission denied. Please enable location access in your browser settings.',
            2: 'Location information unavailable.',
            3: 'Location request timed out.',
          };
          showError(messages[err.code] ?? 'Failed to get location.');
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Transform daily forecast data for WeeklyForecast component
  const weeklyData = weather?.daily
    ? weather.daily.time.slice(0, 7).map((date, index) => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return {
          day: dayName,
          high: Math.round(weather.daily.maxTemp[index]),
          low: Math.round(weather.daily.minTemp[index]),
          icon: getWeatherIcon(weather.daily.weatherCode[index]),
          condition: getWeatherCondition(weather.daily.weatherCode[index]),
        };
      })
    : [];

  const theme = getWeatherTheme(weather?.weatherCode || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1214] flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-6 py-8">
          {/* Skeleton for map/location card */}
          <div className="mb-8 h-48 rounded-2xl bg-[#1a2f35]/60 animate-pulse" />

          {/* Skeleton metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#1a2f35]/60 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>

          {/* Skeleton forecast */}
          <div className="h-40 rounded-2xl bg-[#1a2f35]/60 animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a1214] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-red-400 text-center">
            <p className="text-lg font-semibold mb-2">Unable to load weather data</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        {/* Subtle top bar shown while a background refetch is in progress */}
        {fetching && (
          <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#00d4ff]/40 z-[100]">
            <div className="h-full bg-[#00d4ff] animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        )}

        {/* Map and Location */}
        <div className="mb-8">
          <MapLocationCard
            location={location.city}
            temperature={weather?.temperature || 0}
            condition={weather?.condition || 'Clear'}
            currentDay={currentDay}
            onRefresh={handleRefreshLocation}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div style={{ animationDelay: '0.1s' }}>
            <WeatherMetricCard title="WIND" value={Math.round(weather?.windSpeed || 0)} icon="wind" unit="km/h" />
          </div>
          <div style={{ animationDelay: '0.2s' }}>
            <WeatherMetricCard title="HUMIDITY" value={weather?.humidity || 0} icon="humidity" unit="%" />
          </div>
          <div style={{ animationDelay: '0.3s' }}>
            <WeatherMetricCard title="VISIBILITY" value={Math.round(weather?.visibility || 0)} icon="visibility" unit="km" />
          </div>
        </div>

        {/* 7-Day Forecast */}
        {weeklyData.length > 0 && <WeeklyForecast days={weeklyData} />}
      </main>

      <Footer />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
