import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../services/weatherService';
import { CurrentWeatherData } from '../types/weatherTypes';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';

interface CurrentWeatherDisplayProps {
    latitude: number;
    longitude: number;
}

const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({ latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState<CurrentWeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchCurrentWeather(latitude, longitude);
                setWeatherData(data);
            } catch (err) {
                setError('Failed to fetch current weather data. Please try again later.');
                console.error('Error fetching current weather:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [latitude, longitude]);

    // Determine if it's currently daytime based on weather data
    const isDaytime = (): boolean => {
        if (!weatherData) return true; // Default to daytime if no data
        return weatherData.is_day === 1;
    };

    // Format the date for display
    const formatDate = (): string => {
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Get a weather condition description based on weather code
    const getWeatherCondition = (weatherCode: number): string => {
        // Clear sky
        if (weatherCode === 0) return isDaytime() ? 'Clear sky' : 'Clear night';

        // Mainly clear, partly cloudy
        if (weatherCode === 1) return 'Mainly clear';
        if (weatherCode === 2) return 'Partly cloudy';

        // Overcast
        if (weatherCode === 3) return 'Overcast';

        // Fog
        if (weatherCode === 45 || weatherCode === 48) return 'Foggy';

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

    if (loading) {
        return <LoadingState message="Loading current weather data..." />;
    }

    if (error) {
        return <ErrorState message={error} retryAction={() => { }} />;
    }

    if (!weatherData) {
        return <ErrorState message="No weather data available" retryAction={() => { }} />;
    }

    return (
        <GlassCard className="p-5">
            <div className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl text-white font-bold">Current Weather</h2>
                        <div className="text-white/60 text-sm">{formatDate()}</div>
                    </div>
                    <WeatherIcon
                        weatherCode={weatherData.weather_code}
                        isDay={weatherData.is_day === 1}
                        size="lg"
                    />
                </div>

                <div className="flex items-center mb-5">
                    <div className="text-5xl text-white font-bold mr-4">
                        {Math.round(weatherData.temperature_2m)}°C
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xl text-white">
                            {getWeatherCondition(weatherData.weather_code)}
                        </div>
                        <div className="text-white/60">
                            Feels like {Math.round(weatherData.apparent_temperature)}°C
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-white">
                    <div>
                        <div className="flex items-center mt-2">
                            <div className="flex items-center mr-6">
                                <span className="text-white/80 text-sm mr-2">Humidity:</span>
                                <span className="text-white font-medium">
                                    {weatherData.relative_humidity_2m}%
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center mt-2">
                            <div className="flex items-center">
                                <span className="text-white/80 text-sm mr-2">Precipitation:</span>
                                <span className="text-white font-medium">
                                    {weatherData.precipitation.toFixed(1)} mm
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Wind information */}
                        <div className="flex items-center mt-2">
                            <div className="flex items-center mr-6">
                                <span className="text-white/80 text-sm mr-2">Wind:</span>
                                <span className="text-white font-medium">
                                    {Math.round(weatherData.wind_speed_10m)} km/h
                                </span>
                                <WindDirectionIndicator
                                    direction={weatherData.wind_direction_10m}
                                    className="ml-2"
                                    size="sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center mt-2">
                            <div className="flex items-center">
                                <span className="text-white/80 text-sm mr-2">Pressure:</span>
                                <span className="text-white font-medium">
                                    {Math.round(weatherData.surface_pressure)} hPa
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CurrentWeatherDisplay;