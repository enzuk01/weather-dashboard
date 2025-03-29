import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../../services/weatherService';
import { CurrentWeatherData } from '../../types/weatherTypes';
import { useSettings, convertWindSpeed, convertPrecipitation, convertTemperature } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import WeatherCard from './WeatherCard';
import TemperatureDisplay from './TemperatureDisplay';
import WeatherMetric from './WeatherMetric';
import WindDirectionIndicator from '../WindDirectionIndicator';

interface CurrentWeatherDisplayProps {
    latitude: number;
    longitude: number;
}

/**
 * Enhanced CurrentWeatherDisplay with modern UI elements and animations
 * Designed to take advantage of full-width layout
 */
const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({
    latitude,
    longitude,
}) => {
    const [weatherData, setWeatherData] = useState<CurrentWeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const settings = useSettings();
    const { temperatureUnit, windSpeedUnit, precipitationUnit, refreshInterval } = settings;
    const { isDark } = useTheme();

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
        return () => clearInterval(intervalId);
    }, [refreshInterval, latitude, longitude]);

    // Determine if it's currently daytime based on weather data
    const isDaytime = (): boolean => {
        if (!weatherData) return true; // Default to daytime if no data
        return weatherData.is_day === 1;
    };

    // Calculate the color for the background gradient based on weather conditions
    const getBackgroundGradient = (): string => {
        if (!weatherData) return '';

        const isDay = isDaytime();
        const weatherCode = weatherData.weather_code;

        // Clear sky
        if (weatherCode === 0) {
            return isDay
                ? 'bg-gradient-to-br from-blue-400 to-blue-100'
                : 'bg-gradient-to-br from-blue-900 to-indigo-800';
        }

        // Partly cloudy
        if (weatherCode === 1 || weatherCode === 2) {
            return isDay
                ? 'bg-gradient-to-br from-blue-400 to-gray-300'
                : 'bg-gradient-to-br from-blue-900 to-gray-800';
        }

        // Overcast
        if (weatherCode === 3) {
            return 'bg-gradient-to-br from-gray-400 to-gray-300';
        }

        // Fog
        if (weatherCode === 45 || weatherCode === 48) {
            return 'bg-gradient-to-br from-gray-300 to-gray-400';
        }

        // Drizzle or Rain
        if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
            return 'bg-gradient-to-br from-blue-700 to-gray-500';
        }

        // Snow
        if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode === 85 || weatherCode === 86)) {
            return 'bg-gradient-to-br from-gray-100 to-blue-100';
        }

        // Thunderstorm
        if (weatherCode >= 95 && weatherCode <= 99) {
            return 'bg-gradient-to-br from-gray-800 to-purple-900';
        }

        return isDay
            ? 'bg-gradient-to-br from-blue-500 to-blue-300'
            : 'bg-gradient-to-br from-blue-900 to-blue-700';
    };

    // Get humidity level color
    const getHumidityColor = (humidity: number): string => {
        if (humidity < 30) return 'stroke-blue-300';
        if (humidity < 60) return 'stroke-blue-500';
        if (humidity < 80) return 'stroke-blue-600';
        return 'stroke-blue-700';
    };

    // Get humidity text description
    const getHumidityDescription = (humidity: number): string => {
        if (humidity < 30) return 'Dry';
        if (humidity < 60) return 'Comfortable';
        if (humidity < 80) return 'Humid';
        return 'Very humid';
    };

    // Get precipitation color
    const getPrecipitationColor = (amount: number): string => {
        const mmAmount = convertPrecipitation(amount, precipitationUnit, 'mm');
        if (mmAmount === 0) return 'stroke-gray-400';
        if (mmAmount < 1) return 'stroke-blue-300';
        if (mmAmount < 5) return 'stroke-blue-500';
        if (mmAmount < 10) return 'stroke-blue-600';
        return 'stroke-blue-700';
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number | undefined): string => {
        if (typeof kph === 'undefined') return 'N/A';
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return Math.round(speed).toString();
    };

    // Format precipitation with unit
    const formatPrecipitation = (mm: number | undefined): string => {
        if (typeof mm === 'undefined') return 'N/A';
        const amount = convertPrecipitation(mm, 'mm', precipitationUnit);
        return amount.toFixed(1);
    };

    // Get pressure description
    const getPressureDescription = (pressure: number): string => {
        if (pressure < 990) return 'Low';
        if (pressure < 1010) return 'Normal';
        if (pressure < 1030) return 'High';
        return 'Very high';
    };

    // Get UV index description
    const getUVIndexDescription = (uvIndex: number): string => {
        if (uvIndex < 3) return 'Low';
        if (uvIndex < 6) return 'Moderate';
        if (uvIndex < 8) return 'High';
        if (uvIndex < 11) return 'Very High';
        return 'Extreme';
    };

    // Get UV index color
    const getUVIndexColor = (uvIndex: number): string => {
        if (uvIndex < 3) return 'stroke-green-500';
        if (uvIndex < 6) return 'stroke-yellow-500';
        if (uvIndex < 8) return 'stroke-orange-500';
        if (uvIndex < 11) return 'stroke-red-500';
        return 'stroke-purple-500';
    };

    // Function to get weather description based on code
    const getWeatherDescription = (code: number, isDay: boolean): string => {
        // Clear
        if (code === 0) return isDay ? "Clear sky" : "Clear night";

        // Partly cloudy
        if (code === 1) return isDay ? "Mainly sunny" : "Mainly clear";
        if (code === 2) return "Partly cloudy";

        // Cloudy / Overcast
        if (code === 3) return "Overcast";

        // Fog
        if (code === 45 || code === 48) return "Foggy conditions";

        // Drizzle
        if (code >= 51 && code <= 57) return "Light drizzle";

        // Rain
        if (code >= 61 && code <= 65) return "Rain";
        if (code === 66 || code === 67) return "Freezing rain";

        // Snow
        if (code >= 71 && code <= 75) return "Snow";
        if (code === 77) return "Snow grains";

        // Rain showers
        if (code >= 80 && code <= 82) return "Rain showers";

        // Snow showers
        if (code === 85 || code === 86) return "Snow showers";

        // Thunderstorm
        if (code >= 95 && code <= 99) return "Thunderstorm";

        return "Unknown weather conditions";
    };

    return (
        <WeatherCard
            title="Current Weather"
            isLoading={loading}
            isError={!!error}
            errorMessage={error || 'Failed to load weather data'}
            onRetry={fetchData}
            backgroundGradient={getBackgroundGradient()}
        >
            {weatherData && (
                <div className="flex flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Main temperature display */}
                        <div className="lg:col-span-1">
                            <TemperatureDisplay
                                temperature={weatherData.temperature_2m}
                                feelsLike={weatherData.feels_like_temperature ?? weatherData.apparent_temperature}
                                weatherCode={weatherData.weather_code}
                                isDay={weatherData.is_day === 1}
                            />
                        </div>

                        {/* Additional condition details (middle section) */}
                        <div className="lg:col-span-1 flex flex-col justify-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <h3 className="text-xl font-semibold text-white mb-3">Today's Conditions</h3>
                                <div className="grid grid-cols-2 gap-y-3">
                                    <div className="text-white/80">
                                        <span className="text-white/60 text-sm">Cloud Cover:</span>
                                        <div className="text-lg font-medium">{weatherData.cloud_cover ?? 'N/A'}%</div>
                                    </div>
                                    <div className="text-white/80">
                                        <span className="text-white/60 text-sm">Visibility:</span>
                                        <div className="text-lg font-medium">N/A km</div>
                                    </div>
                                    <div className="text-white/80">
                                        <span className="text-white/60 text-sm">Dew Point:</span>
                                        <div className="text-lg font-medium">
                                            {`${convertTemperature(weatherData.temperature_2m - (((100 - weatherData.relative_humidity_2m) / 5)), 'celsius', temperatureUnit).toFixed(1)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`}
                                        </div>
                                    </div>
                                    <div className="text-white/80">
                                        <span className="text-white/60 text-sm">UV Index:</span>
                                        <div className="text-lg font-medium flex items-center">
                                            {weatherData.uv_index !== undefined ? (
                                                <>
                                                    {weatherData.uv_index}
                                                    <span className="ml-1 text-sm">({getUVIndexDescription(weatherData.uv_index)})</span>
                                                </>
                                            ) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right section - forecast summary */}
                        <div className="lg:col-span-1 flex flex-col justify-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 h-full">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-semibold text-white">Forecast</h3>
                                    <div className="text-white/70 text-sm">
                                        {new Date().toLocaleDateString([], {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-white/90 text-lg">
                                        {getWeatherDescription(weatherData.weather_code, weatherData.is_day === 1)}
                                    </div>

                                    <div className="flex items-center space-x-4 text-white/80 mt-2">
                                        <div>
                                            <span className="text-white/60 text-xs block">Feels Like</span>
                                            <span className="text-lg font-medium">
                                                {convertTemperature(weatherData.feels_like_temperature ?? weatherData.apparent_temperature, 'celsius', temperatureUnit).toFixed(1)}°
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-white/60 text-xs block">Current</span>
                                            <span className="text-lg font-medium">
                                                {convertTemperature(weatherData.temperature_2m, 'celsius', temperatureUnit).toFixed(1)}°
                                            </span>
                                        </div>
                                        {weatherData.precipitation_probability !== undefined && (
                                            <div className="ml-auto">
                                                <span className="text-white/60 text-xs block">Precip.</span>
                                                <span className="text-lg font-medium">{weatherData.precipitation_probability}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weather metrics row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mt-2">
                        {/* Humidity */}
                        <WeatherMetric
                            label="Humidity"
                            value={weatherData.relative_humidity_2m}
                            unit="%"
                            icon="💧"
                            progressValue={weatherData.relative_humidity_2m}
                            progressColor={getHumidityColor(weatherData.relative_humidity_2m)}
                            tooltip={getHumidityDescription(weatherData.relative_humidity_2m)}
                        />

                        {/* Wind */}
                        <WeatherMetric
                            label="Wind"
                            value={formatWindSpeed(weatherData.wind_speed_10m)}
                            unit={windSpeedUnit}
                            icon={
                                <WindDirectionIndicator
                                    direction={weatherData.wind_direction_10m}
                                    className="text-white h-5 w-5"
                                />
                            }
                            tooltip={`Wind from ${weatherData.wind_direction_10m}°`}
                        />

                        {/* Precipitation */}
                        <WeatherMetric
                            label="Precipitation"
                            value={formatPrecipitation(weatherData.precipitation)}
                            unit={precipitationUnit}
                            icon="🌧️"
                            progressValue={
                                Math.min(100,
                                    weatherData.precipitation > 0
                                        ? (weatherData.precipitation / 10) * 100
                                        : 0
                                )
                            }
                            progressColor={getPrecipitationColor(weatherData.precipitation)}
                        />

                        {/* Pressure */}
                        <WeatherMetric
                            label="Pressure"
                            value={weatherData.surface_pressure}
                            unit="hPa"
                            icon="📊"
                            tooltip={getPressureDescription(weatherData.surface_pressure)}
                        />

                        {/* UV Index */}
                        {weatherData.uv_index !== undefined && (
                            <WeatherMetric
                                label="UV Index"
                                value={weatherData.uv_index}
                                icon="☀️"
                                progressValue={Math.min(100, (weatherData.uv_index / 12) * 100)}
                                progressColor={getUVIndexColor(weatherData.uv_index)}
                                tooltip={getUVIndexDescription(weatherData.uv_index)}
                            />
                        )}

                        {/* Cloudiness */}
                        {weatherData.cloud_cover !== undefined && (
                            <WeatherMetric
                                label="Cloud Cover"
                                value={weatherData.cloud_cover}
                                unit="%"
                                icon="☁️"
                                progressValue={weatherData.cloud_cover}
                                progressColor="stroke-gray-400"
                            />
                        )}
                    </div>
                </div>
            )}
        </WeatherCard>
    );
};

export default CurrentWeatherDisplay;