import React, { useState, useEffect } from 'react';
import { HourlyForecastData } from '../types/weatherTypes';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { formatLocalTime } from '../utils/timeUtils';
import { useSettings, convertTemperature, convertWindSpeed } from '../contexts/SettingsContext';
import { fetchHourlyForecast } from '../services/weatherService';

interface HourlyForecastCardsProps {
    latitude: number;
    longitude: number;
}

const HourlyForecastCards: React.FC<HourlyForecastCardsProps> = ({ latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit, windSpeedUnit } = useSettings();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchHourlyForecast(latitude, longitude);
                setWeatherData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching hourly forecast:', err);
                setError('Failed to load hourly forecast data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [latitude, longitude]);

    if (loading) {
        return <LoadingState message="Loading hourly forecast..." />;
    }

    if (error || !weatherData) {
        return <ErrorState message={error || 'No hourly forecast data available'} retryAction={() => window.location.reload()} />;
    }

    // Support both possible field names (timestamps or time)
    const timeArray = weatherData.timestamps || weatherData.time || [];

    if (timeArray.length === 0) {
        return <ErrorState message="No hourly forecast times available" retryAction={() => window.location.reload()} />;
    }

    const formatTime = (timestamp: string): string => {
        return formatLocalTime(timestamp);
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Group hours by day for better display
    const days = new Map<string, number[]>();
    timeArray.forEach((timestamp, index) => {
        const date = formatDate(timestamp);
        if (!days.has(date)) {
            days.set(date, []);
        }
        days.get(date)?.push(index);
    });

    // Safety check if we have empty data
    if (days.size === 0) {
        return <ErrorState message="Unable to organize forecast data" retryAction={() => window.location.reload()} />;
    }

    return (
        <div className="flex overflow-x-auto gap-4 pb-4">
            {Array.from(days).map(([date, hourIndices]) => (
                <div key={date} className="flex-none">
                    <div className="text-white/70 text-sm mb-2">{date}</div>
                    <div className="flex gap-2">
                        {hourIndices.map(index => {
                            // Safely access array values with fallbacks
                            const temp = weatherData.temperature_2m && index < weatherData.temperature_2m.length
                                ? weatherData.temperature_2m[index]
                                : null;
                            const precipProb = weatherData.precipitation_probability && index < weatherData.precipitation_probability.length
                                ? weatherData.precipitation_probability[index]
                                : null;
                            const wCode = weatherData.weather_code && index < weatherData.weather_code.length
                                ? weatherData.weather_code[index]
                                : 0;
                            const isDay = weatherData.is_day && index < weatherData.is_day.length
                                ? weatherData.is_day[index] === 1
                                : true;

                            return (
                                <div
                                    key={timeArray[index]}
                                    className="bg-white/10 rounded-lg p-3 min-w-[80px] text-center"
                                >
                                    <div className="text-white text-xs sm:text-sm mb-1">
                                        {formatTime(timeArray[index])}
                                    </div>
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <WeatherIcon
                                            weatherCode={wCode}
                                            isDay={isDay}
                                            size="md"
                                        />
                                    </div>
                                    <div className="text-white font-medium mb-1">
                                        {temp !== null
                                            ? `${convertTemperature(temp, 'celsius', temperatureUnit).toFixed(1)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`
                                            : 'N/A'
                                        }
                                    </div>
                                    <div className="text-white/70 text-xs">
                                        {precipProb !== null ? `${precipProb}% rain` : 'N/A'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HourlyForecastCards;