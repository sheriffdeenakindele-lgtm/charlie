'use client';

import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useWeather } from '../hooks/useWeather';
import { getWeatherTheme } from '../lib/weatherTheme';

export default function MapPage() {
  const [location, setLocation] = useState({ lat: 51.5072, lon: -0.1276, city: 'London, UK' });
  const { data: weather, loading, refetch } = useWeather(location.lat, location.lon);
  const theme = getWeatherTheme(weather?.weatherCode || 0);

  // Auto-detect user location on first mount
  useEffect(() => {
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      try {
        const { lat, lon } = JSON.parse(currentLocation);
        setLocation({ lat, lon, city: 'Current Location' });
        refetch(lat, lon);
      } catch (e) {
        console.error('Failed to parse current location', e);
      }
    }
  }, []);

  // Listen for city selection from search
  useEffect(() => {
    const handleCitySelected = (event: CustomEvent) => {
      const { name, lat, lon } = event.detail;
      setLocation({ lat, lon, city: name });
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
        refetch(lat, lon);
      } catch (e) {
        console.error('Failed to parse saved city', e);
      }
    }
  }, []);

  // Get current time and day
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const currentDay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  // Generate hourly timeline (next 5 hours)
  const hourlyTimeline = [];
  for (let i = 0; i < 5; i++) {
    const hour = new Date();
    hour.setHours(hour.getHours() + i);
    hourlyTimeline.push(
      hour.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
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
      
      <main className="flex-1 relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-[#1a2f35]">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
              {/* Simplified world map silhouette */}
              <path 
                d="M100,200 L150,180 L200,190 L250,170 L300,185 L350,175 L400,190 L450,180 L500,195 L550,185 L600,200 L650,190 L700,205 L750,195 L800,210 L850,200 L900,215 M150,250 L200,240 L250,255 L300,245 L350,260 L400,250 L450,265 L500,255 L550,270 L600,260 L650,275 L700,265 L750,280 M200,300 L250,290 L300,305 L350,295 L400,310 L450,300 L500,315 L550,305 L600,320 L650,310 L700,325"
                stroke="#2a4a4f"
                strokeWidth="2"
                fill="none"
              />
              {/* Location markers */}
              <circle cx="350" cy="220" r="8" fill="#00d4ff" opacity="0.8" />
              <circle cx="650" cy="280" r="6" fill="#00d4ff" opacity="0.5" />
              <circle cx="450" cy="320" r="6" fill="#00d4ff" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Weather Card Overlay */}
        <div className="absolute top-8 left-8 w-[280px]">
          <div className="bg-[#0d1b1e] rounded-2xl p-6 border border-[#1a2f35] shadow-2xl">
            <div className="flex items-center gap-2 text-[#00d4ff] text-xs mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold uppercase tracking-wider">Current View</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{location.city}</h2>
            <p className="text-gray-400 text-sm mb-4">{currentDay}, {currentTime}</p>

            {loading ? (
              <div className="text-white text-sm">Loading...</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-white">{weather?.temperature}°</span>
                    <div className="pb-2">
                      <svg className="w-8 h-8 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white text-sm mb-1">{weather?.condition}</p>
                  <p className="text-gray-400 text-xs">
                    H:{weather?.daily.maxTemp[0] ? Math.round(weather.daily.maxTemp[0]) : '--'}° 
                    L:{weather?.daily.minTemp[0] ? Math.round(weather.daily.minTemp[0]) : '--'}°
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <svg className="w-6 h-6 text-[#00d4ff] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <p className="text-xs text-gray-400">Wind</p>
                    <p className="text-white font-semibold text-sm">{Math.round(weather?.windSpeed || 0)} <span className="text-xs">km/h</span></p>
                  </div>
                  <div className="text-center">
                    <svg className="w-6 h-6 text-[#00d4ff] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-gray-400">Humidity</p>
                    <p className="text-white font-semibold text-sm">{weather?.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <svg className="w-6 h-6 text-[#00d4ff] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <p className="text-xs text-gray-400">Visibility</p>
                    <p className="text-white font-semibold text-sm">{Math.round(weather?.visibility || 0)} <span className="text-xs">km</span></p>
                  </div>
                </div>
              </>
            )}

            <button className="w-full bg-[#2a4a4f] hover:bg-[#344f55] text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              View Full Forecast
            </button>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-8 right-8 flex flex-col gap-3">
          <button className="w-12 h-12 bg-[#0d1b1e] hover:bg-[#1a2f35] border border-[#1a2f35] rounded-lg flex items-center justify-center text-[#00d4ff] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-[#0d1b1e] hover:bg-[#1a2f35] border border-[#1a2f35] rounded-lg flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-[#0d1b1e] hover:bg-[#1a2f35] border border-[#1a2f35] rounded-lg flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-[#0d1b1e] hover:bg-[#1a2f35] border border-[#1a2f35] rounded-lg flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </button>
          <div className="h-px bg-[#1a2f35] my-2"></div>
          <button className="w-12 h-12 bg-[#0d1b1e] hover:bg-[#1a2f35] border border-[#1a2f35] rounded-lg flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-[#0d1b1e] hover:bg-[#1a2f35] border border-[#1a2f35] rounded-lg flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>

        {/* Forecast Timeline */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md">
          <div className="bg-[#0d1b1e] rounded-2xl p-6 border border-[#1a2f35] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Forecast Timeline</h3>
              <div className="flex items-center gap-1 text-white text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Now</span>
              </div>
            </div>

            <div className="relative">
              {/* Timeline track */}
              <div className="h-2 bg-[#1a2f35] rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-[#00d4ff] rounded-full"></div>
              </div>
              
              {/* Timeline marker */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-4 h-4 bg-white rounded-full border-4 border-[#00d4ff] shadow-lg"></div>

              {/* Time labels */}
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                {hourlyTimeline.map((time, idx) => (
                  <span key={idx}>{time}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
