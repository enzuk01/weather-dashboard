import React, { useState, useEffect, lazy, Suspense } from 'react';
// Import core components synchronously
import OriginalCurrentWeatherDisplay from './components/CurrentWeatherDisplay';
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
import { FeatureFlagsProvider, useFeatureFlags } from './contexts/FeatureFlagsContext';
import { fetchHourlyForecast, preloadWeatherData } from './services/weatherService';
import { HourlyForecastData } from './types/weatherTypes';
import LoadingState from './components/ui/LoadingState';
import ErrorState from './components/ui/ErrorState';
import SettingsPanel from './components/SettingsPanel';
import { useLogger } from './contexts/LoggerContext';
import { LoggerErrorBoundary } from './components/LoggerErrorBoundary';

// Lazy-load components that aren't needed immediately
const CurrentWeatherDisplay = lazy(() => import('./components/weather/CurrentWeatherDisplay'));
const SunriseSunsetDisplay = lazy(() => import('./components/weather/SunriseSunsetDisplay'));

// Loading fallback for lazy-loaded components
const LazyLoadingFallback = () => (
    <div className="animate-pulse bg-white/10 rounded-lg p-4 h-full">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-white/10 rounded mb-4"></div>
        <div className="h-10 bg-white/10 rounded w-1/2"></div>
    </div>
);

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
        const { logger } = useLogger();
        const { flags } = useFeatureFlags();

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

            // Preload all data in background
            preloadWeatherData(location.latitude, location.longitude);
        }, [location.latitude, location.longitude]);

        return (
            <>
                {/* Settings Panel (positioned as overlay) */}
                {isSettingsOpen && (
                    <Suspense fallback={<LazyLoadingFallback />}>
                        <SettingsPanel
                            isOpen={isSettingsOpen}
                            onClose={onSettingsClose}
                            {...settings}
                        />
                    </Suspense>
                )}

                <div className={`p-2 sm:p-3 md:p-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    <div className="w-full">
                        {/* Current Weather - now full width */}
                        <div className="mt-3 md:mt-4">
                            <ErrorBoundary>
                                {flags.useEnhancedCurrentWeather ? (
                                    <Suspense fallback={<LazyLoadingFallback />}>
                                        <CurrentWeatherDisplay
                                            latitude={location.latitude}
                                            longitude={location.longitude}
                                        />
                                    </Suspense>
                                ) : (
                                    <GlassCard className="p-3 md:p-4">
                                        <OriginalCurrentWeatherDisplay
                                            latitude={location.latitude}
                                            longitude={location.longitude}
                                        />
                                    </GlassCard>
                                )}
                            </ErrorBoundary>
                        </div>

                        {/* Weather tabs section */}
                        <div className="mt-4 md:mt-6">
                            <ErrorBoundary>
                                <Suspense fallback={<LazyLoadingFallback />}>
                                    <WeatherTabs
                                        latitude={location.latitude}
                                        longitude={location.longitude}
                                    />
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </>
        );
    };

// Main App component with all providers
const App: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState<Location>({
        name: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.0060
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { logger } = useLogger();

    // Load last selected location from localStorage
    useEffect(() => {
        const savedLocation = localStorage.getItem('lastLocation');
        if (savedLocation) {
            try {
                const parsedLocation = JSON.parse(savedLocation);
                setCurrentLocation(parsedLocation);
            } catch (e) {
                console.error('Failed to parse saved location:', e);
            }
        }
    }, []);

    // Update location when selected via LocationSearch
    const handleLocationChange = async (newLocation: Location) => {
        setCurrentLocation(newLocation);
        try {
            await logger.info('Location changed', { location: newLocation });
            localStorage.setItem('lastLocation', JSON.stringify(newLocation));
        } catch (error) {
            console.error('Failed to log location change:', error);
        }
    };

    return (
        <LoggerErrorBoundary>
            <ThemeProvider>
                <SettingsProvider>
                    <FeatureFlagsProvider>
                        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
                            <Header
                                title="Weather Dashboard"
                                currentLocation={currentLocation}
                                onLocationChange={handleLocationChange}
                                onSettingsClick={() => setIsSettingsOpen(true)}
                            />
                            <main className="container mx-auto px-4 pb-8">
                                <LoggerErrorBoundary>
                                    <DashboardContent
                                        location={currentLocation}
                                        isSettingsOpen={isSettingsOpen}
                                        onSettingsClose={() => setIsSettingsOpen(false)}
                                    />
                                </LoggerErrorBoundary>
                            </main>
                        </div>
                    </FeatureFlagsProvider>
                </SettingsProvider>
            </ThemeProvider>
        </LoggerErrorBoundary>
    );
};

export default App;