import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../services/weatherService';
import { CurrentWeatherData } from '../types/weatherTypes';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings, convertTemperature, convertWindSpeed, convertPrecipitation } from '../contexts/SettingsContext';

interface CurrentWeatherDisplayProps {
    latitude: number;
    longitude: number;
}

const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({ latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState<CurrentWeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { temperatureUnit, windSpeedUnit, precipitationUnit, refreshInterval } = useSettings();

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await fetchCurrentWeather(latitude, longitude);
            setWeatherData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching current weather:', err);
            setError('Failed to load current weather data');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [latitude, longitude]);

    // Set up auto-refresh interval
    useEffect(() => {
        const intervalId = setInterval(fetchData, refreshInterval * 60 * 1000); // Convert minutes to milliseconds

        // Cleanup interval on unmount or when refresh interval changes
        return () => clearInterval(intervalId);
    }, [refreshInterval, latitude, longitude]);

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
    const formatTemperature = (celsius: number | undefined): string => {
        if (typeof celsius === 'undefined') return 'N/A';
        const temp = convertTemperature(celsius, 'celsius', temperatureUnit);
        return `${Math.round(temp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number | undefined): string => {
        if (typeof kph === 'undefined') return 'N/A';
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return `${Math.round(speed)} ${windSpeedUnit}`;
    };

    // Format precipitation with unit
    const formatPrecipitation = (mm: number | undefined): string => {
        if (typeof mm === 'undefined') return 'N/A';
        const amount = convertPrecipitation(mm, 'mm', precipitationUnit);
        return `${amount.toFixed(1)} ${precipitationUnit}`;
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} retryAction={fetchData} />;
    }

    if (!weatherData) {
        return null;
    }

    // Convert units based on user preferences
    const temperature = convertTemperature(weatherData.temperature_2m, 'celsius', temperatureUnit);
    const windSpeed = convertWindSpeed(weatherData.wind_speed_10m, 'kph', windSpeedUnit);
    const precipitation = convertPrecipitation(weatherData.precipitation, 'mm', precipitationUnit);

    return (
        <GlassCard className="p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Weather condition background gradient */}
            <div
                className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${isDaytime() ? 'bg-gradient-to-br from-blue-400 to-blue-100' : 'bg-gradient-to-br from-blue-900 to-blue-700'
                    }`}
            />

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-6">Current Weather</h1>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                {/* Left section: Temperature and condition */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <WeatherIcon
                            weatherCode={weatherData.weather_code ?? 0}
                            isDay={weatherData.is_day === 1}
                            size="2xl"
                            className="animate-weather-float"
                        />
                        {weatherData.precipitation > 0 && (
                            <span className="absolute -bottom-1 -right-1 text-lg">💧</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold mb-1 text-white">
                            {formatTemperature(weatherData.temperature_2m)}
                        </h2>
                        <p className="text-lg text-white/90 mb-2">
                            Feels like {formatTemperature(weatherData.feels_like_temperature ?? weatherData.apparent_temperature)}
                        </p>
                        <p className="text-md text-white/80">
                            {getWeatherCondition(weatherData.weather_code ?? 0)}
                        </p>
                    </div>
                </div>

                {/* Right section: Weather details */}
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                        <div className="text-white/70 text-sm">Humidity</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl text-white">💧</span>
                            <span className="text-2xl font-semibold text-white">
                                {weatherData.relative_humidity_2m ?? 'N/A'}%
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                        <div className="text-white/70 text-sm">Wind</div>
                        <div className="flex items-center gap-2">
                            <WindDirectionIndicator
                                direction={weatherData.wind_direction_10m ?? 0}
                                className="text-white"
                            />
                            <span className="text-2xl font-semibold text-white">
                                {formatWindSpeed(weatherData.wind_speed_10m)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                        <div className="text-white/70 text-sm">Precipitation</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl text-white">🌧️</span>
                            <span className="text-2xl font-semibold text-white">
                                {formatPrecipitation(weatherData.precipitation)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                        <div className="text-white/70 text-sm">Pressure</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl text-white">📊</span>
                            <span className="text-2xl font-semibold text-white">
                                {Math.round(weatherData.surface_pressure ?? 0)} hPa
                            </span>
                        </div>
                        <div className="text-sm text-white/70">
                            {weatherData.surface_pressure > 1013.25 ? 'High' : weatherData.surface_pressure < 1013.25 ? 'Low' : 'Normal'}
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CurrentWeatherDisplay;