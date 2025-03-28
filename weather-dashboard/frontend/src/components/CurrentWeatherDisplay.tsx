import React from 'react';
import { WeatherData } from '../types/weatherTypes';
import GlassCard from './ui/GlassCard';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings, convertTemperature, convertWindSpeed, convertPrecipitation } from '../contexts/SettingsContext';

interface CurrentWeatherDisplayProps {
    weatherData: WeatherData;
}

const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({ weatherData }) => {
    const { temperatureUnit, windSpeedUnit, precipitationUnit } = useSettings();

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

    const current = weatherData.current;

    return (
        <GlassCard className="p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Weather condition background gradient */}
            <div
                className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${current.is_day ? 'bg-gradient-to-br from-blue-400 to-blue-100' : 'bg-gradient-to-br from-blue-900 to-blue-700'
                    }`}
            />

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-6">Current Weather</h1>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                {/* Left section: Temperature and condition */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <WeatherIcon
                            weatherCode={current.weather_code}
                            isDay={current.is_day === 1}
                            size="2xl"
                            className="animate-weather-float"
                        />
                        {current.precipitation > 0 && (
                            <span className="absolute -bottom-1 -right-1 text-lg">💧</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold mb-1 text-white">
                            {formatTemperature(current.temperature_2m)}
                        </h2>
                        <p className="text-lg text-white/90 mb-2">
                            Feels like {formatTemperature(current.feels_like_temperature ?? current.apparent_temperature)}
                        </p>
                        <p className="text-md text-white/80">
                            {getWeatherCondition(current.weather_code)}
                        </p>
                    </div>
                </div>

                {/* Right section: Additional weather info */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-white/80">Humidity</p>
                        <p className="text-lg font-semibold text-white">{current.relative_humidity_2m}%</p>
                    </div>
                    <div>
                        <p className="text-white/80">Wind</p>
                        <p className="text-lg font-semibold text-white">
                            {formatWindSpeed(current.wind_speed_10m)}
                        </p>
                        <WindDirectionIndicator
                            direction={current.wind_direction_10m}
                            size="sm"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <p className="text-white/80">Precipitation</p>
                        <p className="text-lg font-semibold text-white">
                            {formatPrecipitation(current.precipitation)}
                        </p>
                    </div>
                    <div>
                        <p className="text-white/80">Pressure</p>
                        <p className="text-lg font-semibold text-white">
                            {current.surface_pressure} hPa
                        </p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CurrentWeatherDisplay;

// Helper function to get weather condition description
const getWeatherCondition = (weatherCode: number): string => {
    const conditions: { [key: number]: string } = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    return conditions[weatherCode] || 'Unknown';
};