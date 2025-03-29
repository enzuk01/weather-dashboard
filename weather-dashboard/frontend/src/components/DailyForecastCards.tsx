import React, { useEffect, useState } from 'react';
import { fetchDailyForecast } from '../services/weatherService';
import { DailyForecastData } from '../types/weatherTypes';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import { useSettings } from '../contexts/SettingsContext';
import WindDirectionIndicator from './WindDirectionIndicator';
import { convertTemperature, convertWindSpeed } from '../contexts/SettingsContext';

interface DailyForecastCardsProps {
    latitude: number;
    longitude: number;
}

const DailyForecastCards: React.FC<DailyForecastCardsProps> = ({ latitude, longitude }) => {
    const [forecastData, setForecastData] = useState<DailyForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit, windSpeedUnit } = useSettings();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchDailyForecast(latitude, longitude);
                setForecastData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching daily forecast:', err);
                setError('Failed to load daily forecast data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [latitude, longitude]);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!forecastData) {
        return <ErrorState message="No forecast data available" />;
    }

    // Verify we have the required data
    if (!forecastData.time || forecastData.time.length === 0) {
        return <ErrorState message="Daily forecast data is incomplete" />;
    }

    // Safely get array values with defaults
    const safeGet = <T extends unknown>(arr: T[] | undefined, index: number, defaultValue: T): T => {
        if (!arr || index >= arr.length) return defaultValue;
        return arr[index];
    };

    // Format date to display day name
    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Format temperature with unit
    const formatTemperature = (celsius: number | undefined): string => {
        if (celsius === undefined) return 'N/A';
        const temp = convertTemperature(celsius, 'celsius', temperatureUnit);
        return `${Math.round(temp)}°`;
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number | undefined): string => {
        if (kph === undefined) return 'N/A';
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return `${Math.round(speed)}`;
    };

    return (
        <div className="grid grid-cols-7 gap-2">
            {forecastData.time.map((time, index) => {
                const maxTemp = safeGet(forecastData.temperature_2m_max, index, undefined);
                const minTemp = safeGet(forecastData.temperature_2m_min, index, undefined);
                const precipProb = safeGet(forecastData.precipitation_probability_max, index, 0);
                const weatherCode = safeGet(forecastData.weather_code, index, 0);

                return (
                    <div key={time} className="flex flex-col items-center p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/90 mb-1">
                            {formatDate(time)}
                        </div>
                        <WeatherIcon
                            weatherCode={weatherCode}
                            isDay={true}
                            size="md"
                        />
                        <div className="mt-1 text-sm">
                            <span className="text-white/90">
                                {formatTemperature(maxTemp)}
                            </span>
                            <span className="text-white/60 ml-1">
                                {formatTemperature(minTemp)}
                            </span>
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                            {Math.round(precipProb)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DailyForecastCards;