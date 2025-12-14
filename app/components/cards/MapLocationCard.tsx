'use client';

import { useState } from 'react';

interface MapLocationCardProps {
  location: string;
  temperature: number;
  condition: string;
  currentDay?: string;
  onRefresh?: () => void;
}

export default function MapLocationCard({ location, temperature, condition, currentDay, onRefresh }: MapLocationCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    
    console.log('Refreshing location from MapLocationCard...');
    setIsRefreshing(true);
    
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-[#0d1b1e] rounded-2xl p-6 border border-[#1a2f35] hover:border-[#00d4ff]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00d4ff]/10 animate-fade-in-up group">
      <div className="flex gap-6">
        {/* Map Placeholder */}
        <div className="w-[280px] h-[160px] bg-[#1a2f35] rounded-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a4a4f] to-[#1a2f35] opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-[#00d4ff] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          {/* Map Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow">
            <div className="w-8 h-8 bg-[#00d4ff] rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform group-hover:shadow-[#00d4ff]/50 group-hover:shadow-2xl">
              <svg className="w-5 h-5 text-white group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#00d4ff] text-sm">
                {isRefreshing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">{isRefreshing ? 'REFRESHING...' : 'CURRENT LOCATION'}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Click to refresh location"
              >
                <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3">{location}</h2>
            {currentDay && (
              <p className="text-gray-400 text-sm mb-2">{currentDay}</p>
            )}
            <div className="flex items-center gap-2 text-white">
              <svg className="w-6 h-6 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span className="text-xl font-medium">{temperature}°C — {condition}</span>
            </div>
          </div>
          
          <button className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors w-fit">
            Hourly Forecast
          </button>
        </div>
      </div>
    </div>
  );
}
