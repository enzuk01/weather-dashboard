import React, { useState, useEffect } from 'react';
import CurrentWeatherDisplay from './components/CurrentWeatherDisplay';
import HourlyForecastCards from './components/HourlyForecastCards';
import SunriseSunsetChart from './components/SunriseSunsetChart';
import PrecipitationChart from './components/PrecipitationChart';
import DailyForecastCards from './components/DailyForecastCards';
import WindChart from './components/WindChart';
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
    onLocationChange: (location: Location) => void;
    isSettingsOpen: boolean;
    onSettingsClose: () => void;
}> = ({
    location,
    onLocationChange,
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

        // Handle location selection from favorites or search
        const handleLocationChange = (location: Location) => {
            onLocationChange(location);
        };

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
                        <div className="mb-4">
                            <ErrorBoundary>
                                <GlassCard className="p-3 md:p-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="w-full md:w-1/2">
                                            <LocationSearch onLocationSelect={handleLocationChange} />
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <FavoriteLocations
                                                onLocationSelect={handleLocationChange}
                                                currentLocation={location}
                                            />
                                        </div>
                                    </div>
                                </GlassCard>
                            </ErrorBoundary>
                        </div>

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
    const { logger } = useLogger();

    useEffect(() => {
        const initializeLocation = async () => {
            try {
                await logger.info('Initializing geolocation');
                if ('geolocation' in navigator) {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });

                    const newLocation: Location = {
                        name: 'Current Location',
                        country: 'Unknown',
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    setCurrentLocation(newLocation);
                    await logger.info('Geolocation initialized successfully', newLocation);
                } else {
                    await logger.warn('Geolocation is not supported by this browser');
                }
            } catch (error) {
                await logger.error('Failed to get geolocation', { error });
            }
        };

        initializeLocation();

        return () => {
            // Note: We can't use async in cleanup function, so we'll just call it
            logger.info('Cleaning up location resources').catch(console.error);
        };
    }, [logger]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <ErrorBoundary>
                <Header
                    title="Weather Dashboard"
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />
            </ErrorBoundary>

            <ErrorBoundary>
                <OfflineIndicator />
            </ErrorBoundary>

            <ErrorBoundary>
                <main className="container mx-auto px-4 py-8">
                    <DashboardContent
                        location={currentLocation || { name: 'Default', country: 'Unknown', latitude: 51.5074, longitude: -0.1278 }}
                        onLocationChange={async (location) => {
                            setCurrentLocation(location);
                            await logger.info('Location changed', { location }).catch(console.error);
                        }}
                        isSettingsOpen={isSettingsOpen}
                        onSettingsClose={() => setIsSettingsOpen(false)}
                    />
                </main>
            </ErrorBoundary>
        </div>
    );
}

export default App;