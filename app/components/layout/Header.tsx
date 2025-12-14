'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchCity, formatCityName, GeocodingResult } from '@/app/lib/geocoding';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

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
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCitySelect = (result: GeocodingResult) => {
        const cityName = formatCityName(result);
        
        // Store in localStorage for pages to use
        localStorage.setItem('selectedCity', JSON.stringify({
            name: cityName,
            lat: result.latitude,
            lon: result.longitude,
        }));

        // Clear search
        setSearchQuery('');
        setShowResults(false);
        setSearchResults([]);

        // Trigger a custom event that pages can listen to
        window.dispatchEvent(new CustomEvent('citySelected', {
            detail: {
                name: cityName,
                lat: result.latitude,
                lon: result.longitude,
            }
        }));

        // Navigate to dashboard if not already there
        if (pathname !== '/') {
            router.push('/');
        }
    };
    
    return (
        <header className="bg-[#0d1b1e] border-b border-[#1a2f35] px-6 py-4">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                {/* Logo and Brand */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 text-[#00d4ff]">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                {/* Stylized Sun */}
                                <circle className="opacity-30" cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                <path
                                    d="M24 8V4M24 44V40M8 24H4M44 24H40M12.6863 12.6863L9.85789 9.85789M38.1421 38.1421L35.3137 35.3137M12.6863 35.3137L9.85789 38.1421M38.1421 9.85789L35.3137 12.6863"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="3"
                                />
                                {/* Stylized Cloud/Wave Overlay */}
                                <path
                                    d="M14 34C14 34 16 24 24 24C32 24 34 34 34 34"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="4"
                                />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-xl">MyWeatherToday</span>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link 
                            href="/" 
                            className={`transition-colors text-sm font-medium ${
                                pathname === '/' 
                                    ? 'text-[#00d4ff]' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link 
                            href="/map" 
                            className={`transition-colors text-sm font-medium ${
                                pathname === '/map' 
                                    ? 'text-[#00d4ff]' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Map
                        </Link>
                        <Link 
                            href="/saved-locations" 
                            className={`transition-colors text-sm font-medium ${
                                pathname === '/saved-locations' 
                                    ? 'text-[#00d4ff]' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Saved Locations
                        </Link>
                    </nav>
                </div>

                {/* Right Side - Search and Auth */}
                <div className="flex items-center gap-4">
                    <div className="relative" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                            className="bg-[#1a2f35] text-white placeholder-gray-500 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff] w-64"
                        />
                        <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1b1e] border border-[#1a2f35] rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50 search-results">
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        Searching...
                                    </div>
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
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        No cities found
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                    
                    <button className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-semibold px-6 py-2 rounded-lg text-sm transition-colors">
                        LOGIN OR SIGN-UP
                    </button>
                    
                    <button className="w-10 h-10 rounded-full bg-[#d4a574] flex items-center justify-center text-black font-semibold">
                        A
                    </button>
                </div>
            </div>
        </header>
    );
}
