'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchCity, formatCityName, GeocodingResult } from '@/app/lib/geocoding';

interface HistoryEntry {
  name: string;
  lat: number;
  lon: number;
}

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [searchHistory, setSearchHistory] = useState<HistoryEntry[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Load search history from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('searchHistory');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setSearchHistory(parsed);
            }
        } catch {}
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                const results = await searchCity(searchQuery);
                setSearchResults(results);
                setIsSearching(false);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setInputFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveToHistory = (entry: HistoryEntry) => {
        const deduplicated = searchHistory.filter(h => h.name !== entry.name);
        const newHistory = [entry, ...deduplicated].slice(0, 6);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    const deleteFromHistory = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter(h => h.name !== name);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    const handleCitySelect = (result: GeocodingResult) => {
        const cityName = formatCityName(result);
        const entry: HistoryEntry = { name: cityName, lat: result.latitude, lon: result.longitude };

        saveToHistory(entry);

        localStorage.setItem('selectedCity', JSON.stringify(entry));

        setSearchQuery('');
        setShowResults(false);
        setSearchResults([]);
        setInputFocused(false);

        window.dispatchEvent(new CustomEvent('citySelected', {
            detail: { name: cityName, lat: result.latitude, lon: result.longitude }
        }));

        if (pathname !== '/') {
            router.push('/');
        }
    };

    const handleHistorySelect = (entry: HistoryEntry) => {
        localStorage.setItem('selectedCity', JSON.stringify(entry));
        setInputFocused(false);
        setShowResults(false);

        window.dispatchEvent(new CustomEvent('citySelected', {
            detail: { name: entry.name, lat: entry.lat, lon: entry.lon }
        }));

        if (pathname !== '/') {
            router.push('/');
        }
    };

    // Show history when: focused, empty query, history exists
    const showHistory = inputFocused && searchQuery.trim().length === 0 && searchHistory.length > 0;
    // Show dropdown at all when either live results or history is available
    const showDropdown = showResults || showHistory;

    return (
        <header className="bg-[#0d1b1e] border-b border-[#1a2f35] px-4 md:px-6 py-4 relative z-50">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">

                {/* Logo + Desktop Nav + Hamburger */}
                <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 text-[#00d4ff]">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-30" cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="3" />
                                <path
                                    d="M24 8V4M24 44V40M8 24H4M44 24H40M12.6863 12.6863L9.85789 9.85789M38.1421 38.1421L35.3137 35.3137M12.6863 35.3137L9.85789 38.1421M38.1421 9.85789L35.3137 12.6863"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M14 34C14 34 16 24 24 24C32 24 34 34 34 34"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="4"
                                />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-lg md:text-xl">MyWeatherToday</span>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`transition-colors text-sm font-medium ${
                                pathname === '/' ? 'text-[#00d4ff]' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/map"
                            className={`transition-colors text-sm font-medium ${
                                pathname === '/map' ? 'text-[#00d4ff]' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Map
                        </Link>
                    </nav>

                    {/* Hamburger — mobile only */}
                    <button
                        className="md:hidden flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(prev => !prev)}
                        aria-label="Toggle navigation"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center flex-1 md:flex-none min-w-0 justify-end">
                    <div className="relative w-full md:w-auto" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setInputFocused(true)}
                            className="bg-[#1a2f35] text-white placeholder-gray-500 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff] w-full md:w-64"
                        />
                        <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {/* Unified dropdown: history OR live results */}
                        {showDropdown && (
                            <div className="absolute top-full right-0 mt-2 bg-[#0d1b1e] border border-[#1a2f35] rounded-xl shadow-2xl overflow-hidden z-50 search-results w-screen max-w-[min(320px,calc(100vw-2rem))] md:left-0 md:right-0 md:w-auto md:max-w-none">

                                {/* Recent searches — shown when query is empty */}
                                {showHistory && (
                                    <div>
                                        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Searches</span>
                                        </div>
                                        {searchHistory.map((item) => (
                                            <div
                                                key={item.name}
                                                onClick={() => handleHistorySelect(item)}
                                                className="flex items-center px-4 py-2.5 hover:bg-[#1a2f35] transition-colors cursor-pointer group"
                                            >
                                                <svg className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="flex-1 text-gray-300 text-sm group-hover:text-white transition-colors truncate">
                                                    {item.name}
                                                </span>
                                                <button
                                                    onClick={(e) => deleteFromHistory(item.name, e)}
                                                    className="ml-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-600 hover:text-white hover:bg-[#2a4a4f] transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                    title="Remove from history"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Live search results — shown when typing */}
                                {showResults && (
                                    <>
                                        {isSearching ? (
                                            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="py-2">
                                                {searchResults.map((result) => (
                                                    <button
                                                        key={result.id}
                                                        onClick={() => handleCitySelect(result)}
                                                        className="w-full px-4 py-3 text-left hover:bg-[#1a2f35] transition-colors flex items-start gap-3 group"
                                                    >
                                                        <svg className="w-5 h-5 text-[#00d4ff] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-white font-medium text-sm group-hover:text-[#00d4ff] transition-colors">
                                                                {result.name}
                                                            </div>
                                                            <div className="text-gray-400 text-xs mt-0.5">
                                                                {[result.admin1, result.country].filter(Boolean).join(', ')}
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-500 text-xs mt-1 flex-shrink-0">
                                                            {result.latitude.toFixed(2)}°, {result.longitude.toFixed(2)}°
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : searchQuery.trim().length >= 2 ? (
                                            <div className="p-4 text-center text-gray-400 text-sm">No cities found</div>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile nav drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#0d1b1e] border-b border-[#1a2f35] px-4 py-3 shadow-xl z-40">
                    <nav className="flex flex-col gap-1">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                                pathname === '/' ? 'text-[#00d4ff] bg-[#00d4ff]/10' : 'text-gray-400 hover:text-white hover:bg-[#1a2f35]'
                            }`}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>
                        <Link
                            href="/map"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                                pathname === '/map' ? 'text-[#00d4ff] bg-[#00d4ff]/10' : 'text-gray-400 hover:text-white hover:bg-[#1a2f35]'
                            }`}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Map
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
