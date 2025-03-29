import React, { useState, useEffect } from 'react';
import CurrentWeatherDisplay from './components/CurrentWeatherDisplay';
import HourlyForecastCards from './components/HourlyForecastCards';
import SunriseSunsetChart from './components/SunriseSunsetChart';
import PrecipitationChart from './components/PrecipitationChart';
import DailyForecastCards from './components/DailyForecastCards';
import WindChart from './components/WindChart';
import WeatherMap from './components/WeatherMap';
import WeatherTabs from './components/WeatherTabs';
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

                        {/* Weather tabs section */}
                        <div className="mt-3 md:mt-4">
                            <ErrorBoundary>
                                <WeatherTabs
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                />
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
    const defaultLocation: Location = {
        name: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278
    };

    const [currentLocation, setCurrentLocation] = useState<Location>(defaultLocation);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const { logger } = useLogger();

    const handleLocationChange = async (location: Location) => {
        setCurrentLocation(location);
        await logger.info('Location changed', { location }).catch(console.error);
    };

    if (isLoadingLocation) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <LoadingState message="Updating location..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <ErrorBoundary>
                <Header
                    title="Weather Dashboard"
                    currentLocation={currentLocation}
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
                <DashboardContent
                    location={currentLocation}
                    isSettingsOpen={isSettingsOpen}
                    onSettingsClose={() => setIsSettingsOpen(false)}
                />
            </ErrorBoundary>
        </div>
    );
};

export default App;