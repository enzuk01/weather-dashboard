import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from './services/weatherService';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecastWithSunrise from './components/HourlyForecastWithSunrise';
import DailyForecastCards from './components/DailyForecastCards';
import Footer from './components/Footer';
import SettingsButton from './components/ui/SettingsButton';
import LoadingState from './components/ui/LoadingState';
import ErrorState from './components/ui/ErrorState';
import GlassCard from './components/ui/GlassCard';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

// Simple location interface
interface LocationData {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

function App() {
    const [weatherData, setWeatherData] = useState<any>(null);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    // Initialize with user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        await loadWeatherData(latitude, longitude, "Current Location", "");
                    } catch (err) {
                        console.error('Error getting weather data:', err);
                        setError('Could not fetch weather data for your location');
                        setLoading(false);
                    }
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setError('Could not get your current location. Please search for a location.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
        }
    }, []);

    const loadWeatherData = async (latitude: number, longitude: number, locationName: string, country: string) => {
        try {
            setLoading(true);
            setError(null);

            const data = await fetchCurrentWeather(latitude, longitude);

            setWeatherData(data);
            setLocation({
                name: locationName,
                country: country,
                latitude,
                longitude
            });

        } catch (err) {
            console.error('Error loading weather data:', err);
            setError('Failed to load weather data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        try {
            setLoading(true);

            // This is a placeholder - in a real app, you would call a geocoding API
            // For demo purposes, we'll use fixed coordinates for some cities
            const cities: { [key: string]: [number, number, string, string] } = {
                'london': [51.5074, -0.1278, "London", "UK"],
                'new york': [40.7128, -74.0060, "New York", "USA"],
                'tokyo': [35.6762, 139.6503, "Tokyo", "Japan"],
                'paris': [48.8566, 2.3522, "Paris", "France"],
                'sydney': [-33.8688, 151.2093, "Sydney", "Australia"],
                'cairo': [30.0444, 31.2357, "Cairo", "Egypt"],
            };

            const lowercaseQuery = query.toLowerCase();
            const cityData = cities[lowercaseQuery];

            if (cityData) {
                await loadWeatherData(cityData[0], cityData[1], cityData[2], cityData[3]);
            } else {
                setError(`Could not find location: ${query}`);
                setLoading(false);
            }

        } catch (err) {
            console.error('Search error:', err);
            setError('Error searching for location');
            setLoading(false);
        }
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <LoadingState message="Loading weather data..." />
                </div>
            </div>
        );
    }

    if (error && !weatherData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <ErrorState
                        message={error}
                        retryAction={() => window.location.reload()}
                    />
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header with search and settings */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Weather Dashboard</h1>
                        <div className="flex space-x-4 items-center">
                            <div className="w-64">
                                <SearchBar onSearch={handleSearch} />
                            </div>
                            <SettingsButton onClick={toggleSettings} />
                        </div>
                    </div>

                    {/* Settings panel (conditionally rendered) */}
                    {showSettings && (
                        <GlassCard className="mb-6 p-4">
                            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
                            {/* Add settings controls here */}
                            <p className="text-white/70">Settings panel (to be implemented)</p>
                        </GlassCard>
                    )}

                    {/* Main weather content */}
                    {weatherData && location && (
                        <div className="space-y-6">
                            {/* Current weather */}
                            <CurrentWeather
                                data={weatherData}
                                location={location}
                            />

                            {/* Hourly forecast with sunrise/sunset visualization */}
                            <HourlyForecastWithSunrise
                                latitude={location.latitude}
                                longitude={location.longitude}
                            />

                            {/* Daily forecast */}
                            <DailyForecastCards
                                latitude={location.latitude}
                                longitude={location.longitude}
                            />
                        </div>
                    )}

                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </ThemeProvider>
    );
}

export default App;