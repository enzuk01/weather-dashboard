import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './ui/GlassCard';
import { MapPinIcon } from '@heroicons/react/24/solid';

export interface Location {
    name: string;
    country: string;
    state?: string;
    latitude: number;
    longitude: number;
}

interface LocationSearchProps {
    onLocationSelect: (location: Location) => void;
    className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
    onLocationSelect,
    className = ''
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Location[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Mock function for geocoding API call (to be replaced with real API)
    const searchLocations = async (query: string): Promise<Location[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Return empty array for very short queries
        if (query.length < 3) return [];

        // Mock data for demonstration
        const mockResults: Location[] = [
            { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
            { name: 'Los Angeles', country: 'United States', state: 'California', latitude: 34.0522, longitude: -118.2437 },
            { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
            { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
            { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
            { name: 'New York', country: 'United States', state: 'New York', latitude: 40.7128, longitude: -74.0060 },
            { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
        ];

        // Filter based on search term
        return mockResults.filter(location =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.country.toLowerCase().includes(query.toLowerCase()) ||
            (location.state && location.state.toLowerCase().includes(query.toLowerCase()))
        );
    };

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setError(null);

        // Clear any existing timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (value.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        // Debounce the search by 500ms
        searchTimeout.current = setTimeout(async () => {
            try {
                setIsSearching(true);
                const results = await searchLocations(value);
                setSearchResults(results);
                setShowResults(true);
                setActiveIndex(-1);
            } catch (err) {
                console.error('Error searching locations:', err);
                setError('Unable to search locations. Please try again.');
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    // Handle location selection
    const handleSelectLocation = (location: Location) => {
        onLocationSelect(location);
        setSearchTerm(`${location.name}, ${location.country}`);
        setShowResults(false);
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showResults || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < searchResults.length) {
                    handleSelectLocation(searchResults[activeIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowResults(false);
                searchInputRef.current?.blur();
                break;
            default:
                break;
        }
    };

    // Scroll to active result
    useEffect(() => {
        if (activeIndex >= 0 && resultsRef.current) {
            const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(e.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleUseMyLocation = async () => {
        try {
            setIsGettingLocation(true);
            setError(null);

            if (!('geolocation' in navigator)) {
                throw new Error('Geolocation is not supported by your browser');
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 300000
                });
            });

            // Use OpenStreetMap Nominatim for reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );

            if (!response.ok) {
                throw new Error('Failed to get location details');
            }

            const data = await response.json();
            const locationName = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Unknown Location';
            const country = data.address.country || 'Unknown Country';

            const location: Location = {
                name: locationName,
                country: country,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            handleSelectLocation(location);
        } catch (error: any) {
            console.error('Error getting location:', error);
            setError(error.message || 'Failed to get your location');
        } finally {
            setIsGettingLocation(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <GlassCard className="p-3">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label
                            htmlFor="location-search"
                            className="sr-only"
                        >
                            Search for a location
                        </label>
                        <div className="relative">
                            <input
                                id="location-search"
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search for a location..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => searchTerm.length > 2 && setShowResults(true)}
                                className="w-full bg-transparent text-white border border-white/30 rounded-md py-2 px-4
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                placeholder-white/50"
                                aria-autocomplete="list"
                                aria-controls="location-search-results"
                                aria-expanded={showResults ? 'true' : 'false'}
                                aria-activedescendant={activeIndex >= 0 ? `location-result-${activeIndex}` : undefined}
                                aria-describedby={error ? 'location-search-error' : undefined}
                                autoComplete="off"
                            />

                            {isSearching && (
                                <div className="absolute right-3 top-2">
                                    <div className="animate-spin h-5 w-5 border-2 border-white/40 border-t-white rounded-full"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleUseMyLocation}
                        disabled={isGettingLocation}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border border-white/30
                            ${isGettingLocation
                                ? 'bg-blue-500/50 cursor-wait'
                                : 'hover:bg-white/10 active:bg-white/20'
                            } transition-colors`}
                        aria-label="Use my location"
                    >
                        <MapPinIcon className="h-5 w-5" />
                        {isGettingLocation ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full"></div>
                        ) : (
                            <span>Use My Location</span>
                        )}
                    </button>
                </div>

                {error && (
                    <div id="location-search-error" className="text-red-400 text-sm mt-2" role="alert">
                        {error}
                    </div>
                )}
            </GlassCard>

            {showResults && searchResults.length > 0 && (
                <div
                    id="location-search-results"
                    ref={resultsRef}
                    className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-slate-900/90 backdrop-blur-md rounded-md
                        border border-white/20 shadow-lg"
                    role="listbox"
                >
                    {searchResults.map((location, index) => (
                        <div
                            key={`${location.name}-${location.country}-${index}`}
                            id={`location-result-${index}`}
                            className={`px-4 py-2 cursor-pointer ${index === activeIndex ? 'bg-blue-500/30' : 'hover:bg-white/10'}`}
                            onClick={() => handleSelectLocation(location)}
                            onMouseEnter={() => setActiveIndex(index)}
                            role="option"
                            aria-selected={index === activeIndex ? 'true' : 'false'}
                        >
                            <div className="font-medium text-white">{location.name}</div>
                            <div className="text-sm text-white/70">
                                {location.state && `${location.state}, `}{location.country}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showResults && searchResults.length === 0 && !isSearching && searchTerm.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-slate-900/90 backdrop-blur-md rounded-md
                    border border-white/20 shadow-lg p-4 text-center text-white/70">
                    No locations found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default LocationSearch;