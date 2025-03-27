import React, { useState, useEffect } from 'react';
import { fetchDailyForecast } from '../services/weatherService';
import { DailyForecastData } from '../types/weatherTypes';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings, convertTemperature, convertWindSpeed } from '../contexts/SettingsContext';

interface DailyForecastCardsProps {
    latitude: number;
    longitude: number;
    days?: number;
}

const DailyForecastCards: React.FC<DailyForecastCardsProps> = ({
    latitude,
    longitude,
    days = 7
}) => {
    const [forecastData, setForecastData] = useState<DailyForecastData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit, windSpeedUnit } = useSettings();

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                const data = await fetchDailyForecast(latitude, longitude, days);
                setForecastData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching daily forecast:', err);
                setError('Failed to fetch daily forecast data');
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [latitude, longitude, days]);

    const formatDay = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { weekday: 'short' });
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Format temperature with unit
    const formatTemperature = (celsius: number): string => {
        const temp = convertTemperature(celsius, 'celsius', temperatureUnit);
        return `${Math.round(temp)}°`;
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number): string => {
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return `${Math.round(speed)}`;
    };

    if (loading) {
        return <LoadingState message="Loading 7-day forecast..." />;
    }

    if (error) {
        return (
            <ErrorState
                message="Unable to load forecast data"
                retryAction={() => window.location.reload()}
            />
        );
    }

    if (!forecastData) {
        return (
            <ErrorState
                message="No forecast data available"
                retryAction={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 w-full">
            {forecastData.time.map((time, index) => (
                <div key={time} className="bg-slate-800/40 rounded-lg p-2 sm:p-3 text-center flex flex-col justify-between h-full">
                    <div>
                        <div className="text-white font-medium">
                            {formatDay(time)}
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">
                            {formatDate(time)}
                        </div>
                        <div className="flex justify-center mb-2 sm:mb-3">
                            <WeatherIcon
                                weatherCode={forecastData.weather_code[index]}
                                isDay={true}
                                size="md"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold text-base sm:text-lg">
                                {formatTemperature(forecastData.temperature_2m_max[index])}
                            </span>
                            <span className="text-white/70 text-sm">
                                {formatTemperature(forecastData.temperature_2m_min[index])}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-1 sm:mt-2 text-xs sm:text-sm text-white/70">
                            <div className="flex items-center">
                                <WindDirectionIndicator
                                    direction={forecastData.wind_direction_10m_dominant[index]}
                                    size="sm"
                                />
                                <span className="ml-1">{formatWindSpeed(forecastData.wind_speed_10m_max[index])}</span>
                            </div>
                            <div>
                                <span>{Math.round(forecastData.precipitation_probability_max[index])}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DailyForecastCards;