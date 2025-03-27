import React, { useState, useEffect } from 'react';
import { fetchHourlyForecast } from '../services/weatherService';
import { HourlyForecastData } from '../types/weatherTypes';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { sample12HourData, formatLocalTime } from '../utils/timeUtils';
import { useSettings, convertTemperature, convertWindSpeed, convertPrecipitation } from '../contexts/SettingsContext';

interface HourlyForecastCardsProps {
    latitude: number;
    longitude: number;
    hours?: number;
}

const HourlyForecastCards: React.FC<HourlyForecastCardsProps> = ({
    latitude,
    longitude,
    hours = 24
}) => {
    const [forecastData, setForecastData] = useState<HourlyForecastData | null>(null);
    const [sampledData, setSampledData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit, windSpeedUnit, precipitationUnit } = useSettings();

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                const data = await fetchHourlyForecast(latitude, longitude, hours);
                setForecastData(data);

                // Sample exactly 12 data points at 2-hour intervals
                if (data && data.timestamps) {
                    const dataToSample = {
                        temperature_2m: data.temperature_2m,
                        weather_code: data.weather_code,
                        is_day: data.is_day,
                        precipitation_probability: data.precipitation_probability,
                        precipitation: data.precipitation,
                        wind_speed_10m: data.wind_speed_10m,
                        wind_direction_10m: data.wind_direction_10m
                    };

                    const sampled = sample12HourData(data.timestamps, dataToSample);

                    setSampledData({
                        ...data,
                        timestamps: sampled.timestamps,
                        temperature_2m: sampled.dataArrays.temperature_2m,
                        weather_code: sampled.dataArrays.weather_code,
                        is_day: sampled.dataArrays.is_day,
                        precipitation_probability: sampled.dataArrays.precipitation_probability,
                        precipitation: sampled.dataArrays.precipitation,
                        wind_speed_10m: sampled.dataArrays.wind_speed_10m,
                        wind_direction_10m: sampled.dataArrays.wind_direction_10m
                    });
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching hourly forecast:', err);
                setError('Failed to fetch hourly forecast data');
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [latitude, longitude, hours]);

    const formatTime = (timestamp: string): string => {
        return formatLocalTime(timestamp);
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getCurrentHourIndex = (): number => {
        if (!sampledData || !sampledData.timestamps || sampledData.timestamps.length === 0) {
            return -1;
        }

        return 0;
    };

    const getWeatherCondition = (weatherCode: number): string => {
        // Clear
        if (weatherCode === 0) return 'Clear';

        // Mainly clear, partly cloudy
        if (weatherCode === 1) return 'Mainly clear';
        if (weatherCode === 2) return 'Partly cloudy';

        // Overcast
        if (weatherCode === 3) return 'Overcast';

        // Fog
        if (weatherCode === 45 || weatherCode === 48) return 'Fog';

        // Drizzle
        if (weatherCode >= 51 && weatherCode <= 57) return 'Drizzle';

        // Rain
        if (weatherCode >= 61 && weatherCode <= 67) return 'Rain';

        // Snow
        if (weatherCode >= 71 && weatherCode <= 77) return 'Snow';

        // Rain showers
        if (weatherCode >= 80 && weatherCode <= 82) return 'Rain showers';

        // Snow showers
        if (weatherCode === 85 || weatherCode === 86) return 'Snow showers';

        // Thunderstorm
        if (weatherCode >= 95 && weatherCode <= 99) return 'Thunderstorm';

        return 'Unknown';
    };

    // Format temperature with unit
    const formatTemperature = (celsius: number): string => {
        const temp = convertTemperature(celsius, 'celsius', temperatureUnit);
        return `${Math.round(temp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number): string => {
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return `${Math.round(speed)} ${windSpeedUnit}`;
    };

    // Format precipitation with unit
    const formatPrecipitation = (mm: number): string => {
        const amount = convertPrecipitation(mm, 'mm', precipitationUnit);
        return `${amount.toFixed(1)} ${precipitationUnit}`;
    };

    if (loading) {
        return <LoadingState message="Loading hourly forecast..." />;
    }

    if (error) {
        return (
            <ErrorState
                message="Unable to load forecast data"
                retryAction={() => window.location.reload()}
            />
        );
    }

    if (!sampledData) {
        return (
            <ErrorState
                message="No forecast data available"
                retryAction={() => window.location.reload()}
            />
        );
    }

    const currentHourIndex = getCurrentHourIndex();

    // Group hours by day for better display
    const days = new Map<string, number[]>();
    sampledData.timestamps.forEach((timestamp, index) => {
        const date = formatDate(timestamp);
        if (!days.has(date)) {
            days.set(date, []);
        }
        days.get(date)?.push(index);
    });

    return (
        <div>
            <div className="overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-max gap-2 md:gap-4 pb-2">
                    {Array.from(days).map(([date, hourIndices]) => (
                        <div key={date} className="flex-none">
                            <div className="text-white font-medium text-center mb-2">{date}</div>
                            <div className="grid grid-flow-col auto-cols-max gap-1 sm:gap-2 md:gap-3">
                                {hourIndices.map(index => (
                                    <div
                                        key={sampledData.timestamps[index]}
                                        className={`flex-none w-20 sm:w-24 md:w-28 p-2 sm:p-3 rounded-lg ${index === currentHourIndex
                                            ? 'bg-blue-500/50 ring-2 ring-blue-300'
                                            : 'bg-slate-800/40'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-white text-xs sm:text-sm mb-1">
                                                {formatTime(sampledData.timestamps[index])}
                                            </div>
                                            <div className="flex justify-center mb-1 sm:mb-2">
                                                <WeatherIcon
                                                    weatherCode={sampledData.weather_code[index]}
                                                    isDay={sampledData.is_day[index] === 1}
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="text-white font-medium mb-1">
                                                {formatTemperature(sampledData.temperature_2m[index])}
                                            </div>
                                            <div className="flex items-center justify-center gap-1 text-white/70 text-xs">
                                                <span>{formatWindSpeed(sampledData.wind_speed_10m[index])}</span>
                                                <WindDirectionIndicator
                                                    direction={sampledData.wind_direction_10m[index]}
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="mt-1 text-xs text-white/70">
                                                {sampledData.precipitation_probability[index]}%
                                                <span className="mx-1">·</span>
                                                {formatPrecipitation(sampledData.precipitation[index])}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HourlyForecastCards;