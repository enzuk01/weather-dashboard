import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HourlyForecastData } from '../types/weatherTypes';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import { useSettings, convertTemperature } from '../contexts/SettingsContext';
import { fetchHourlyForecast, debouncedFetchWeatherData } from '../services/weatherService';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import ModernDaylightVisualization from './weather/ModernDaylightVisualization';

interface HourlyForecastWithSunriseProps {
    latitude: number;
    longitude: number;
}

const HourlyForecastWithSunrise: React.FC<HourlyForecastWithSunriseProps> = ({ latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit } = useSettings();
    const { isDark } = useTheme();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const forecastContainerRef = useRef<HTMLDivElement>(null);
    const [previewTime, setPreviewTime] = useState<Date | null>(null);

    // Reference to cancel debounced fetch
    const cancelFetchRef = useRef<(() => void) | null>(null);
    // Track if component is mounted to avoid state updates after unmount
    const isMountedRef = useRef(true);

    // Function to format time from timestamp - memoize for performance
    const formatTime = useCallback((timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    // Function to format date from timestamp - memoize for performance
    const formatDate = useCallback((timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }, []);

    useEffect(() => {
        // Set mounted flag
        isMountedRef.current = true;

        // Use the debounced function instead of direct call
        setLoading(true);

        const cancelFetch = debouncedFetchWeatherData(
            latitude,
            longitude,
            (data) => {
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    if (data.hourly) {
                        setWeatherData(data.hourly);
                        setError(null);
                    } else {
                        setError('Failed to load hourly forecast data');
                    }
                    setLoading(false);
                }
            },
            {
                delay: 300,
                fetchCurrent: false,
                fetchHourly: true,
                fetchDaily: false,
                hours: 48,  // Get 48 hours of data to ensure we have enough
                days: 7     // Added days property
            }
        );

        // Store the cancel function for cleanup
        cancelFetchRef.current = cancelFetch;

        // Clean up function
        return () => {
            isMountedRef.current = false;
            if (cancelFetchRef.current) {
                cancelFetchRef.current();
            }
        };
    }, [latitude, longitude]);

    // Function to handle scroll synchronization - memoize to prevent unnecessary recreations
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const targetContainer = e.currentTarget;

        // Sync scroll position between visualization and forecast
        if (scrollContainerRef.current && forecastContainerRef.current) {
            const vizContainer = scrollContainerRef.current;
            const forecastContainer = forecastContainerRef.current;

            // Determine which container was scrolled and sync the other
            if (targetContainer === vizContainer && targetContainer.scrollLeft !== forecastContainer.scrollLeft) {
                forecastContainer.scrollLeft = targetContainer.scrollLeft;
            } else if (targetContainer === forecastContainer && targetContainer.scrollLeft !== vizContainer.scrollLeft) {
                vizContainer.scrollLeft = targetContainer.scrollLeft;
            }
        }

        // Calculate which hour is in the center of the visible area
        const containerWidth = targetContainer.offsetWidth;
        const scrollLeft = targetContainer.scrollLeft;
        const centerPosition = scrollLeft + (containerWidth / 2);

        // Find the time card that's closest to the center
        const cardWidth = 80; // Width of each hour card (must match CSS)
        const cardGap = 8; // Gap between cards (must match CSS)
        const cardIndex = Math.floor(centerPosition / (cardWidth + cardGap));

        // Update preview time if valid index
        if (weatherData && weatherData.time) {
            const timeArray = weatherData.time.slice(0, 24);
            if (cardIndex >= 0 && cardIndex < timeArray.length) {
                const timestamp = timeArray[cardIndex];
                setPreviewTime(new Date(timestamp));
            }
        }
    }, [weatherData]);

    // Debounce the scroll event to prevent too many updates
    const debouncedHandleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        handleScroll(e);

        // Clear preview after scrolling stops
        clearTimeout((window as any).scrollTimer);
        (window as any).scrollTimer = setTimeout(() => {
            setPreviewTime(null);
        }, 1000);
    }, [handleScroll]);

    // Use memo for expensive calculations
    const timeData = React.useMemo(() => {
        if (!weatherData || !(weatherData.timestamps || weatherData.time)) {
            return null;
        }

        // Support both possible field names (timestamps or time)
        const allTimeArray = weatherData.timestamps || weatherData.time || [];

        if (allTimeArray.length === 0) {
            return null;
        }

        // Get current hour and filter to show only current + future hours (24 hours total)
        const now = new Date();
        const currentHourIndex = allTimeArray.findIndex(timestamp => {
            const timestampDate = new Date(timestamp);
            return timestampDate >= now;
        });

        // If no current hour found (all timestamps are in the past), use the last available
        const startIndex = currentHourIndex === -1 ? 0 : currentHourIndex;

        // Extract exactly 24 hours, starting from current hour
        const timeArray = allTimeArray.slice(startIndex, startIndex + 24);

        // Find sunrise and sunset within our 24-hour window
        let sunriseIndex = 6; // Default to 6am
        let sunsetIndex = 18; // Default to 6pm

        // Try to find actual sunrise/sunset by checking is_day transitions
        if (weatherData.is_day && weatherData.is_day.length > 0) {
            for (let i = 1; i < timeArray.length; i++) {
                const prevIsDay = weatherData.is_day[startIndex + i - 1];
                const currIsDay = weatherData.is_day[startIndex + i];

                // Transition from night to day = sunrise
                if (prevIsDay === 0 && currIsDay === 1) {
                    sunriseIndex = i;
                }
                // Transition from day to night = sunset
                if (prevIsDay === 1 && currIsDay === 0) {
                    sunsetIndex = i;
                }
            }
        }

        return {
            timeArray,
            startIndex,
            sunriseIndex,
            sunsetIndex,
            sunriseSunsetData: {
                sunrise: timeArray[sunriseIndex] || timeArray[6], // Fallback to 6am if undefined
                sunset: timeArray[sunsetIndex] || timeArray[18],  // Fallback to 6pm if undefined
                currentTime: new Date().toISOString(),
                timeArray: timeArray // Pass the whole array for full 24-hour visualization
            }
        };
    }, [weatherData]);

    if (loading) {
        return (
            <GlassCard className="p-3 md:p-4 w-full">
                <LoadingState message="Loading weather data..." />
            </GlassCard>
        );
    }

    if (error || !weatherData || !timeData) {
        return (
            <GlassCard className="p-3 md:p-4 w-full">
                <ErrorState message={error || 'No hourly forecast data available'} retryAction={() => window.location.reload()} />
            </GlassCard>
        );
    }

    const { timeArray, startIndex, sunriseIndex, sunsetIndex, sunriseSunsetData } = timeData;

    // Create a container with day labels above the forecast cards that exactly match the width
    const createForecastRow = () => {
        // Ensure we show date labels properly including for hours past midnight
        let currentDay = '';

        return (
            <div className="flex gap-2 pb-4 min-w-[800px]">
                {timeArray.map((timestamp, relativeIndex) => {
                    const absoluteIndex = startIndex + relativeIndex;
                    const date = new Date(timestamp);

                    // Format the date for comparison
                    const dateStr = date.toLocaleDateString();
                    const isNewDay = dateStr !== currentDay;

                    // Update current day if changed
                    if (isNewDay) {
                        currentDay = dateStr;
                    }

                    // Safely access array values with fallbacks
                    const temp = weatherData.temperature_2m && absoluteIndex < weatherData.temperature_2m.length
                        ? weatherData.temperature_2m[absoluteIndex]
                        : null;
                    const precipProb = weatherData.precipitation_probability && absoluteIndex < weatherData.precipitation_probability.length
                        ? weatherData.precipitation_probability[absoluteIndex]
                        : null;
                    const wCode = weatherData.weather_code && absoluteIndex < weatherData.weather_code.length
                        ? weatherData.weather_code[absoluteIndex]
                        : 0;
                    const isDay = weatherData.is_day && absoluteIndex < weatherData.is_day.length
                        ? weatherData.is_day[absoluteIndex] === 1
                        : true;

                    // Calculate if this time is sunrise or sunset for special styling
                    const isSunrise = relativeIndex === sunriseIndex;
                    const isSunset = relativeIndex === sunsetIndex;
                    const isCurrentHour = relativeIndex === 0;

                    let specialTimeClass = 'bg-white/10';
                    if (isSunrise) specialTimeClass = 'bg-amber-500/30 border-l-2 border-amber-400';
                    if (isSunset) specialTimeClass = 'bg-orange-600/30 border-l-2 border-orange-500';
                    if (isCurrentHour) specialTimeClass = 'bg-blue-500/30 border-l-2 border-blue-400';

                    // Show date at the first hour or when day changes
                    const showDate = relativeIndex === 0 || isNewDay;

                    return (
                        <div key={timestamp} className="flex flex-col">
                            {/* Show date on day change or for first hour */}
                            {showDate && (
                                <div className={`text-xs mb-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                                    {formatDate(timestamp)}
                                </div>
                            )}
                            <div
                                className={`${specialTimeClass} rounded-lg p-3 w-20 text-center transition-all hover:transform hover:scale-105`}
                            >
                                <div className={`text-xs sm:text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {formatTime(timestamp)}
                                </div>

                                {/* Add indicators */}
                                {isCurrentHour && (
                                    <div className="text-blue-400 text-xs font-semibold mb-1">
                                        Now
                                    </div>
                                )}
                                {isSunrise && (
                                    <div className="text-amber-400 text-xs font-semibold mb-1">
                                        Sunrise ☀️
                                    </div>
                                )}
                                {isSunset && (
                                    <div className="text-orange-500 text-xs font-semibold mb-1">
                                        Sunset 🌇
                                    </div>
                                )}

                                <div className="flex justify-center mb-1 sm:mb-2">
                                    <WeatherIcon
                                        weatherCode={wCode}
                                        isDay={isDay}
                                        size="md"
                                    />
                                </div>
                                <div className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {temp !== null
                                        ? `${convertTemperature(temp, 'celsius', temperatureUnit).toFixed(1)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`
                                        : 'N/A'
                                    }
                                </div>
                                <div className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                                    {precipProb !== null ? `${precipProb}% rain` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <GlassCard className="p-3 md:p-4 w-full">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>
                24-Hour Forecast & Daylight
            </h2>

            {/* Modern Daylight Visualization - Shows full 24 hours */}
            <div
                className="mb-6 bg-gradient-to-br from-blue-800/30 to-purple-800/20 p-4 rounded-lg overflow-hidden"
            >
                <div
                    className="overflow-x-auto custom-scrollbar"
                    ref={scrollContainerRef}
                    onScroll={debouncedHandleScroll}
                >
                    <ModernDaylightVisualization
                        timeArray={timeArray}
                        sunrise={sunriseSunsetData.sunrise}
                        sunset={sunriseSunsetData.sunset}
                        currentTime={sunriseSunsetData.currentTime}
                        previewTime={previewTime ? previewTime.toISOString() : null}
                        interactive={true}
                        className="mb-3 min-w-[800px]"
                    />
                </div>
            </div>

            {/* Hourly Forecast - aligned with the daylight visualization */}
            <div
                className="overflow-x-auto custom-scrollbar"
                ref={forecastContainerRef}
                onScroll={debouncedHandleScroll}
            >
                {createForecastRow()}
            </div>

            {/* Add custom scrollbar styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Hide scrollbar track completely */
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 20px;
                    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.7);
                }

                /* Make scrollbar hover over content */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
                    position: relative;
                }

                /* Hide scrollbar until hover */
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-clip: padding-box;
                    min-height: 20px;
                    min-width: 20px;
                }

                /* Button-like appearance */
                .custom-scrollbar::-webkit-scrollbar-button {
                    display: none;
                }
            `}} />
        </GlassCard>
    );
};

export default HourlyForecastWithSunrise;