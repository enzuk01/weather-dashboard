import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fetchHourlyForecast } from '../services/weatherService';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import ModernDaylightVisualization from './ModernDaylightVisualization';

interface HourlyForecastWithSunriseProps {
    latitude: number;
    longitude: number;
    hours?: number;
}

const HourlyForecastWithSunrise: React.FC<HourlyForecastWithSunriseProps> = ({
    latitude,
    longitude,
    hours = 24
}) => {
    const [hourlyData, setHourlyData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scrollOffset, setScrollOffset] = useState<number>(0);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const loadHourlyData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await fetchHourlyForecast(latitude, longitude, hours);
            setHourlyData(data);
        } catch (err) {
            console.error('Error loading hourly forecast:', err);
            setError(err instanceof Error ? err.message : 'Failed to load hourly forecast');
        } finally {
            setLoading(false);
        }
    }, [latitude, longitude, hours]);

    useEffect(() => {
        loadHourlyData();

        // Cleanup function
        return () => {
            // Cleanup any resources if needed
        };
    }, [loadHourlyData]);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setScrollOffset(scrollContainerRef.current.scrollLeft);
        }
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]);

    // Format time from ISO string
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatTemperature = (temp: number) => {
        return `${Math.round(temp)}°`;
    };

    if (loading) {
        return <LoadingState message="Loading hourly forecast..." />;
    }

    if (error) {
        return <ErrorState message={error} retryAction={loadHourlyData} />;
    }

    if (!hourlyData || !hourlyData.time || !hourlyData.temperature_2m) {
        return <ErrorState message="No hourly data available" retryAction={loadHourlyData} />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">24-Hour Forecast</h2>

            <GlassCard className="p-0 overflow-hidden">
                {/* Daylight visualization that synchronizes with the forecast */}
                <ModernDaylightVisualization
                    timestamps={hourlyData.time}
                    isDay={hourlyData.is_day}
                    scrollOffset={scrollOffset}
                    className="px-4 py-3"
                />

                {/* Scrollable hourly forecast */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                >
                    {hourlyData.time.map((time: string, index: number) => (
                        <div key={time} className="flex-shrink-0 w-20 px-2 text-center">
                            <div className="text-white mb-1">{formatTime(time)}</div>

                            <div className="flex justify-center mb-1">
                                <WeatherIcon
                                    weatherCode={hourlyData.weather_code[index]}
                                    isDay={hourlyData.is_day[index] === 1}
                                    className="w-10 h-10"
                                />
                            </div>

                            <div className="text-white font-medium">
                                {formatTemperature(hourlyData.temperature_2m[index])}
                            </div>

                            {hourlyData.precipitation_probability && (
                                <div className="text-blue-300 text-sm mt-1">
                                    {hourlyData.precipitation_probability[index]}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

export default HourlyForecastWithSunrise;