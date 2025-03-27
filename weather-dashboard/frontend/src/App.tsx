import React, { useState, useEffect } from 'react';
import CurrentWeatherDisplay from './components/CurrentWeatherDisplay';
import HourlyForecastCards from './components/HourlyForecastCards';
import SunriseSunsetChart from './components/SunriseSunsetChart';
import PrecipitationChart from './components/PrecipitationChart';
import DailyForecastCards from './components/DailyForecastCards';
import WindChart from './components/WindChart';
import WeatherMap from './components/WeatherMap';
import LocationSearch, { Location } from './components/LocationSearch';
import FavoriteLocations from './components/FavoriteLocations';
import Header from './components/Header';
import GlassCard from './components/ui/GlassCard';
import OfflineIndicator from './components/ui/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { fetchHourlyForecast } from './services/weatherService';
import { HourlyForecastData } from './types/weatherTypes';
import LoadingState from './components/ui/LoadingState';
import ErrorState from './components/ui/ErrorState';
import SettingsPanel from './components/SettingsPanel';
import { LoggerProvider, useLogger } from './contexts/LoggerContext';
import { LoggerErrorBoundary } from './components/LoggerErrorBoundary';

// Main app content separated to use the settings context
const DashboardContent: React.FC<{
    location: Location;
    isSettingsOpen: boolean;
    onSettingsClose: () => void;
}> = ({
    location,
    isSettingsOpen,
    onSettingsClose
}) => {
        // State for hourly precipitation data
        const [hourlyData, setHourlyData] = useState<HourlyForecastData | null>(null);
        const [precipLoading, setPrecipLoading] = useState<boolean>(true);
        const [precipError, setPrecipError] = useState<string | null>(null);
        const { isDark } = useTheme();
        const settings = useSettings();

        // Sample data for sunrise/sunset (would come from API in production)
        const sunriseSunsetData = hourlyData ? {
            sunrise: hourlyData.timestamps[6], // Approximate sunrise time (6 AM)
            sunset: hourlyData.timestamps[20], // Approximate sunset time (8 PM)
            currentTime: new Date().toISOString()
        } : null;

        // Load hourly data for precipitation chart
        useEffect(() => {
            const loadHourlyData = async () => {
                try {
                    setPrecipLoading(true);
                    // Use 24 hours instead of 12 for better visualization
                    const data = await fetchHourlyForecast(location.latitude, location.longitude, 24);
                    setHourlyData(data);
                    setPrecipError(null);
                } catch (err) {
                    console.error('Error fetching hourly forecast:', err);
                    setPrecipError('Failed to load precipitation data');
                } finally {
                    setPrecipLoading(false);
                }
            };

            loadHourlyData();
        }, [location.latitude, location.longitude]);

        // Render the precipitation chart component with appropriate states
        const renderPrecipitationChart = () => {
            if (precipLoading) {
                return <LoadingState message="Loading precipitation data..." />;
            }

            if (precipError) {
                return <ErrorState message={precipError} retryAction={() => window.location.reload()} />;
            }

            if (!hourlyData) {
                return <ErrorState message="No precipitation data available" retryAction={() => window.location.reload()} />;
            }

            return (
                <PrecipitationChart
                    timestamps={hourlyData.timestamps}
                    precipitationProbabilities={hourlyData.precipitation_probability}
                />
            );
        };

        return (
            <>
                {/* Settings Modal */}
                <SettingsPanel
                    isOpen={isSettingsOpen}
                    onClose={onSettingsClose}
                    temperatureUnit={settings.temperatureUnit}
                    setTemperatureUnit={settings.setTemperatureUnit}
                    windSpeedUnit={settings.windSpeedUnit}
                    setWindSpeedUnit={settings.setWindSpeedUnit}
                    precipitationUnit={settings.precipitationUnit}
                    setPrecipitationUnit={settings.setPrecipitationUnit}
                    language={settings.language}
                    setLanguage={settings.setLanguage}
                    refreshInterval={settings.refreshInterval}
                    setRefreshInterval={settings.setRefreshInterval}
                />

                <div className={`p-2 sm:p-3 md:p-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    <div className="w-full">
                        <div className="mt-3 md:mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                            <div className="lg:col-span-1">
                                <ErrorBoundary>
                                    <GlassCard className="p-3 md:p-4 h-full">
                                        <CurrentWeatherDisplay
                                            latitude={location.latitude}
                                            longitude={location.longitude}
                                        />
                                    </GlassCard>
                                </ErrorBoundary>
                            </div>
                            <div className="lg:col-span-2">
                                <ErrorBoundary>
                                    <GlassCard className="p-3 md:p-4 h-full">
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Sunrise & Sunset</h2>
                                        {sunriseSunsetData ? (
                                            <SunriseSunsetChart
                                                sunrise={sunriseSunsetData.sunrise}
                                                sunset={sunriseSunsetData.sunset}
                                                currentTime={sunriseSunsetData.currentTime}
                                            />
                                        ) : (
                                            <LoadingState message="Loading sunrise/sunset data..." />
                                        )}
                                    </GlassCard>
                                </ErrorBoundary>
                            </div>
                        </div>

                        {/* Full-width components stacked vertically */}
                        <div className="mt-3 md:mt-4 space-y-3 md:space-y-4">
                            <ErrorBoundary>
                                <GlassCard className="p-3 md:p-4 w-full">
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>24-Hour Forecast</h2>
                                    <HourlyForecastCards
                                        latitude={location.latitude}
                                        longitude={location.longitude}
                                    />
                                </GlassCard>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <GlassCard className="p-3 md:p-4 w-full">
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Precipitation</h2>
                                    {renderPrecipitationChart()}
                                </GlassCard>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <GlassCard className="p-3 md:p-4 w-full">
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Wind</h2>
                                    <WindChart
                                        latitude={location.latitude}
                                        longitude={location.longitude}
                                    />
                                </GlassCard>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <GlassCard className="p-3 md:p-4 w-full">
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Weather Map</h2>
                                    <WeatherMap
                                        latitude={location.latitude}
                                        longitude={location.longitude}
                                    />
                                </GlassCard>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <GlassCard className="p-3 md:p-4 w-full">
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>7-Day Forecast</h2>
                                    <DailyForecastCards
                                        latitude={location.latitude}
                                        longitude={location.longitude}
                                    />
                                </GlassCard>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </>
        );
    };

function App() {
    return (
        <LoggerErrorBoundary>
            <LoggerProvider>
                <ThemeProvider>
                    <SettingsProvider>
                        <AppContent />
                    </SettingsProvider>
                </ThemeProvider>
            </LoggerProvider>
        </LoggerErrorBoundary>
    );
}

const AppContent: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const { logger } = useLogger();

    useEffect(() => {
        const initializeLocation = async () => {
            try {
                setIsLoadingLocation(true);
                setLocationError(null);
                await logger.info('Initializing geolocation');

                if ('geolocation' in navigator) {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            resolve,
                            (error) => {
                                switch (error.code) {
                                    case error.PERMISSION_DENIED:
                                        reject(new Error('Location access was denied. Please enable location access in your browser settings.'));
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        reject(new Error('Location information is unavailable. Please try again.'));
                                        break;
                                    case error.TIMEOUT:
                                        reject(new Error('Location request timed out. Please check your connection and try again.'));
                                        break;
                                    default:
                                        reject(error);
                                }
                            },
                            {
                                enableHighAccuracy: false, // Set to false for faster response
                                timeout: 10000,
                                maximumAge: 300000 // Cache for 5 minutes
                            }
                        );
                    });

                    try {
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

                        const newLocation: Location = {
                            name: locationName,
                            country: country,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };

                        await logger.info('Location details retrieved successfully', newLocation);
                        setCurrentLocation(newLocation);
                    } catch (geocodeError) {
                        // If reverse geocoding fails, still use the coordinates but with placeholder names
                        const newLocation: Location = {
                            name: 'Current Location',
                            country: 'Unknown',
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };

                        await logger.warn('Failed to get location details, using coordinates only', { error: geocodeError });
                        setCurrentLocation(newLocation);
                    }
                } else {
                    throw new Error('Geolocation is not supported by your browser. Please try a different browser.');
                }
            } catch (error: any) {
                console.error('Failed to get geolocation:', error);
                setLocationError(error.message || 'Unable to detect your location. Using default location.');
                await logger.error('Failed to get geolocation', { error });

                // Set default location (London) if geolocation fails
                setCurrentLocation({
                    name: 'London',
                    country: 'United Kingdom',
                    latitude: 51.5074,
                    longitude: -0.1278
                });
            } finally {
                setIsLoadingLocation(false);
            }
        };

        initializeLocation();

        return () => {
            logger.info('Cleaning up location resources').catch(console.error);
        };
    }, [logger]);

    const handleLocationChange = async (location: Location) => {
        setCurrentLocation(location);
        await logger.info('Location changed', { location }).catch(console.error);
    };

    const defaultLocation: Location = {
        name: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278
    };

    const location = currentLocation || defaultLocation;

    if (isLoadingLocation) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <LoadingState message="Detecting your location..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <ErrorBoundary>
                <Header
                    title="Weather Dashboard"
                    currentLocation={location}
                    onLocationChange={handleLocationChange}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />
            </ErrorBoundary>

            {locationError && (
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-2 text-center">
                    {locationError}
                </div>
            )}

            <ErrorBoundary>
                <OfflineIndicator />
            </ErrorBoundary>

            <ErrorBoundary>
                <main className="container mx-auto px-4 py-8">
                    <DashboardContent
                        location={location}
                        isSettingsOpen={isSettingsOpen}
                        onSettingsClose={() => setIsSettingsOpen(false)}
                    />
                </main>
            </ErrorBoundary>
        </div>
    );
};

export default App;