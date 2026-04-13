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
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-[#0d1b1e] rounded-2xl p-5 md:p-6 border border-[#1a2f35] hover:border-[#00d4ff]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00d4ff]/10 animate-fade-in-up group">
      <div className="flex flex-col md:flex-row md:gap-6">

        {/* Visual panel — desktop only */}
        <div className="hidden md:block md:w-[260px] md:flex-shrink-0 h-[180px] rounded-xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d2d35] via-[#1a3f45] to-[#0d1b1e]" />
          {/* Dot-grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle, #00d4ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,212,255,0.08)_0%,_transparent_70%)]" />

          {/* Outer ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#00d4ff]/15 animate-pulse-slow" />
          {/* Middle ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#00d4ff]/25 animate-pulse-slow" style={{ animationDelay: '0.6s' }} />
          {/* Inner ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#00d4ff]/40 animate-pulse-slow" style={{ animationDelay: '1.2s' }} />

          {/* Center pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow">
            <div className="w-10 h-10 bg-[#00d4ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_32px_rgba(0,212,255,0.6)] transition-shadow duration-500">
              <svg className="w-5 h-5 text-[#0d1b1e]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0d1b1e] to-transparent" />
        </div>

        {/* Info panel */}
        <div className="flex-1 flex flex-col justify-between min-w-0 pt-0 md:pt-0">
          <div>
            {/* Label row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[#00d4ff] text-xs font-bold uppercase tracking-widest">
                {isRefreshing ? (
                  <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{isRefreshing ? 'Refreshing...' : 'Current Location'}</span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#1a2f35] hover:bg-[#00d4ff]/15 border border-[#1a2f35] hover:border-[#00d4ff]/40 text-[#00d4ff] rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Refresh location"
              >
                <svg className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* City name */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 leading-tight truncate">
              {location}
            </h2>

            {/* Day */}
            {currentDay && (
              <p className="text-gray-500 text-sm mb-4">{currentDay}</p>
            )}

            {/* Temp + condition */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-white">{temperature}°C</span>
              <div className="h-8 w-px bg-[#1a2f35]" />
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="text-base font-medium">{condition}</span>
              </div>
            </div>
          </div>

          {/* Hourly Forecast button */}
          <div className="mt-5">
            <button className="relative overflow-hidden bg-[#00d4ff] hover:bg-[#00bde8] text-[#0d1b1e] font-bold px-6 py-2.5 rounded-lg text-sm transition-all duration-200 w-full sm:w-auto shadow-[0_4px_16px_rgba(0,212,255,0.2)] hover:shadow-[0_4px_24px_rgba(0,212,255,0.35)] group/btn">
              <span className="relative z-10">Hourly Forecast</span>
              <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors duration-200" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
