import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../services/weatherService';
import { CurrentWeatherData } from '../types/weatherTypes';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings, convertTemperature } from '../contexts/SettingsContext';

interface CurrentWeatherDisplayProps {
    latitude: number;
    longitude: number;
}

const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({ latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState<CurrentWeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit } = useSettings();

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

    // Get description of how the temperature feels compared to actual
    const getFeelsLikeDescription = (actualTemp: number, feelsLikeTemp: number): string => {
        const difference = feelsLikeTemp - actualTemp;

        if (Math.abs(difference) < 2) return 'similar to actual temperature';

        if (difference >= 2) {
            if (difference >= 5) return 'much warmer than actual';
            return 'warmer than actual';
        } else {
            if (difference <= -5) return 'much colder than actual';
            return 'colder than actual';
        }
    };

    // Get appropriate icon for feels like temperature difference
    const getFeelsLikeIcon = (actualTemp: number, feelsLikeTemp: number): string => {
        const difference = feelsLikeTemp - actualTemp;

        if (Math.abs(difference) < 2) return '≈';
        if (difference >= 5) return '🔥';
        if (difference > 0) return '↑';
        if (difference <= -5) return '❄️';
        return '↓';
    };

    // Format temperature with unit
    const formatTemperature = (celsius: number): string => {
        const temp = convertTemperature(celsius, 'celsius', temperatureUnit);
        return `${Math.round(temp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
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
                        {formatTemperature(weatherData.temperature_2m)}
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xl text-white">
                            {getWeatherCondition(weatherData.weather_code)}
                        </div>
                    </div>
                </div>

                {/* Enhanced Feels Like section */}
                <div className="bg-white/10 rounded-lg p-3 mb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="text-lg font-medium text-white">Feels Like</div>
                            <div className="ml-2 text-xl font-bold text-white">
                                {formatTemperature(weatherData.apparent_temperature)}
                            </div>
                            <div className="ml-2 text-xl">
                                {getFeelsLikeIcon(weatherData.temperature_2m, weatherData.apparent_temperature)}
                            </div>
                        </div>
                        <div className="text-sm text-white/80 italic">
                            {getFeelsLikeDescription(weatherData.temperature_2m, weatherData.apparent_temperature)}
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