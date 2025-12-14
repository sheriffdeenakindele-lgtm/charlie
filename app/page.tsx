'use client';

import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MapLocationCard from './components/cards/MapLocationCard';
import WeatherMetricCard from './components/cards/WeatherMetricCard';
import WeeklyForecast from './components/forecast/WeeklyForecast';
import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { getWeatherIcon, getWeatherCondition } from './lib/fetchWeather';
import { reverseGeocode } from './lib/geocoding';
import { getWeatherTheme } from './lib/weatherTheme';

export default function Home() {
  const [location, setLocation] = useState({ lat: 51.5072, lon: -0.1276, city: 'London, UK' });
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const { data: weather, loading, error, refetch } = useWeather(location.lat, location.lon);
  const { location: geoLocation, loading: geoLoading } = useGeolocation(false);

  // Auto-detect user location on first mount
  useEffect(() => {
    const hasAutoDetected = localStorage.getItem('hasAutoDetected');
    const savedCity = localStorage.getItem('selectedCity');
    
    if (!hasAutoDetected && !savedCity) {
      // First time user, auto-detect location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            setLocation({ lat, lon, city: 'Current Location' });
            setIsCurrentLocation(true);
            refetch(lat, lon);
            
            // Save to localStorage
            localStorage.setItem('currentLocation', JSON.stringify({ lat, lon }));
            localStorage.setItem('hasAutoDetected', 'true');
          },
          (error) => {
            console.log('Geolocation error:', error.message);
            // Keep default London location
            localStorage.setItem('hasAutoDetected', 'true');
          }
        );
      }
    }
  }, []);

  // Listen for city selection from search
  useEffect(() => {
    const handleCitySelected = (event: CustomEvent) => {
      const { name, lat, lon } = event.detail;
      setLocation({ lat, lon, city: name });
      setIsCurrentLocation(false);
      refetch(lat, lon);
    };

    window.addEventListener('citySelected', handleCitySelected as EventListener);
    return () => window.removeEventListener('citySelected', handleCitySelected as EventListener);
  }, [refetch]);

  // Load saved city from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      try {
        const { name, lat, lon } = JSON.parse(savedCity);
        setLocation({ lat, lon, city: name });
        setIsCurrentLocation(false);
        refetch(lat, lon);
      } catch (e) {
        console.error('Failed to parse saved city', e);
      }
    }
  }, []);

  // Get current day of the week
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Handle location refresh
  const handleRefreshLocation = async () => {
    console.log('Refresh location clicked on dashboard');
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            // Get actual location name
            const locationName = await reverseGeocode(lat, lon);
            console.log('New location:', locationName, 'at', lat, lon);
            
            setLocation({ lat, lon, city: locationName });
            setIsCurrentLocation(true);
            
            // Update localStorage
            localStorage.setItem('currentLocation', JSON.stringify({ lat, lon }));
            
            // Refetch weather data
            await refetch(lat, lon);
            
            console.log('Location refreshed successfully!');
            resolve();
          } catch (error) {
            console.error('Failed to refresh location:', error);
            alert('Failed to fetch location data');
            reject(error);
          }
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          alert(errorMessage);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Transform daily forecast data for WeeklyForecast component
  const weeklyData = weather?.daily ? weather.daily.time.slice(0, 7).map((date, index) => {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      high: Math.round(weather.daily.maxTemp[index]),
      low: Math.round(weather.daily.minTemp[index]),
      icon: getWeatherIcon(weather.daily.weatherCode[index]),
      condition: getWeatherCondition(weather.daily.weatherCode[index]),
    };
  }) : [];

  const theme = getWeatherTheme(weather?.weatherCode || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-700 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading weather data...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-700 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error: {error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${theme}`} data-theme={theme}>
      {/* Weather Overlays */}
      {theme === "clear" && (
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl pointer-events-none" />
      )}
      {theme === "rain" && <div className="rain-layer" />}
      {theme === "storm" && <div className="lightning" />}
      {theme === "snow" && <div className="snow-layer" />}
      {theme === "fog" && <div className="fog-layer" />}
      
      <Header />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
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
            <WeatherMetricCard
              title="WIND"
              value={Math.round(weather?.windSpeed || 0)}
              icon="wind"
              unit="km/h"
            />
          </div>
          <div style={{ animationDelay: '0.2s' }}>
            <WeatherMetricCard
              title="HUMIDITY"
              value={weather?.humidity || 0}
              icon="humidity"
              unit="%"
            />
          </div>
          <div style={{ animationDelay: '0.3s' }}>
            <WeatherMetricCard
              title="VISIBILITY"
              value={Math.round(weather?.visibility || 0)}
              icon="visibility"
              unit="km"
            />
          </div>
        </div>

        {/* 7-Day Forecast */}
        {weeklyData.length > 0 && <WeeklyForecast days={weeklyData} />}
      </main>

      <Footer />
    </div>
  );
}
