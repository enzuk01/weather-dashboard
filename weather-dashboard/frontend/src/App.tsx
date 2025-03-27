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

// Main app content separated to use the settings context
const DashboardContent = ({ location, onLocationChange }: { location: Location; onLocationChange: (location: Location) => void }) => {
    // State for hourly precipitation data
    const [hourlyData, setHourlyData] = useState<HourlyForecastData | null>(null);
    const [precipLoading, setPrecipLoading] = useState<boolean>(true);
    const [precipError, setPrecipError] = useState<string | null>(null);
    const { isDark } = useTheme();

    // Sample data for sunrise/sunset (would come from API in production)
    const sunriseSunsetData = {
        sunrise: new Date(new Date().setHours(6, 30, 0, 0)).toISOString(),
        sunset: new Date(new Date().setHours(19, 45, 0, 0)).toISOString(),
        currentTime: new Date().toISOString()
    };

    // Access settings context
    const {
        temperatureUnit,
        setTemperatureUnit,
        windSpeedUnit,
        setWindSpeedUnit,
        precipitationUnit,
        setPrecipitationUnit,
        language,
        setLanguage,
        refreshInterval,
        setRefreshInterval,
        isSettingsOpen,
        openSettings,
        closeSettings
    } = useSettings();

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
                onClose={closeSettings}
                temperatureUnit={temperatureUnit}
                setTemperatureUnit={setTemperatureUnit}
                windSpeedUnit={windSpeedUnit}
                setWindSpeedUnit={setWindSpeedUnit}
                precipitationUnit={precipitationUnit}
                setPrecipitationUnit={setPrecipitationUnit}
                language={language}
                setLanguage={setLanguage}
                refreshInterval={refreshInterval}
                setRefreshInterval={setRefreshInterval}
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
                                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-white'} mb-3 md:mb-4`}>Sunrise & Sunset</h2>
                                    <SunriseSunsetChart
                                        sunrise={sunriseSunsetData.sunrise}
                                        sunset={sunriseSunsetData.sunset}
                                        currentTime={sunriseSunsetData.currentTime}
                                    />
                                </GlassCard>
                            </ErrorBoundary>
                        </div>
                    </div>

                    {/* Full-width components stacked vertically */}
                    <div className="mt-3 md:mt-4 space-y-3 md:space-y-4">
                        <ErrorBoundary>
                            <GlassCard className="p-3 md:p-4 w-full">
                                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-white'} mb-3 md:mb-4`}>24-Hour Forecast</h2>
                                <HourlyForecastCards
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                />
                            </GlassCard>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <GlassCard className="p-3 md:p-4 w-full">
                                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-white'} mb-3 md:mb-4`}>Precipitation</h2>
                                {renderPrecipitationChart()}
                            </GlassCard>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <GlassCard className="p-3 md:p-4 w-full">
                                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-white'} mb-3 md:mb-4`}>Wind</h2>
                                <WindChart
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                />
                            </GlassCard>
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <GlassCard className="p-3 md:p-4 w-full">
                                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-white'} mb-3 md:mb-4`}>7-Day Forecast</h2>
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

// Root App component with providers
function App() {
    // Create location state at App level so it can be shared with Header
    const [location, setLocation] = useState<Location>({
        name: 'London',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278
    });

    // Create a modified version of DashboardContent that receives the location state
    const ModifiedDashboardContent = () => {
        return <DashboardContent location={location} onLocationChange={setLocation} />;
    };

    const HeaderWithSettings = () => {
        const { openSettings } = useSettings();

        return (
            <Header
                title="Weather Dashboard"
                locationName={`${location.name}, ${location.country}`}
                onSettingsClick={openSettings}
            />
        );
    };

    return (
        <ThemeProvider>
            <AppBackground>
                <SettingsProvider>
                    <div className="min-h-screen flex flex-col">
                        <HeaderWithSettings />
                        <main className="flex-grow">
                            <ModifiedDashboardContent />
                        </main>
                    </div>
                </SettingsProvider>
            </AppBackground>
        </ThemeProvider>
    );
}

// Background component that changes based on the theme
const AppBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isDark } = useTheme();

    return (
        <div className={`
            min-h-screen transition-all duration-500 ease-in-out
            ${isDark
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                : 'bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600'}
        `}>
            {children}
        </div>
    );
};

export default App;