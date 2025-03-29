import React, { useState, useEffect } from 'react';
import { useSettings, convertTemperature } from '../../contexts/SettingsContext';
import WeatherIcon from '../WeatherIcon';

interface TemperatureDisplayProps {
    temperature: number;
    feelsLike: number;
    weatherCode: number;
    isDay: boolean;
    className?: string;
}

/**
 * Enhanced temperature display component with animations
 * and visual enhancements for the current temperature
 */
const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
    temperature,
    feelsLike,
    weatherCode,
    isDay,
    className = '',
}) => {
    const settings = useSettings();
    const { temperatureUnit } = settings;
    const [prevTemp, setPrevTemp] = useState(temperature);
    const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);
    const [animateIcon, setAnimateIcon] = useState(false);

    // Format temperature with unit
    const formatTemperature = (temp: number): string => {
        const convertedTemp = convertTemperature(temp, 'celsius', temperatureUnit);
        return `${Math.round(convertedTemp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
    };

    // Calculate temperature difference for display
    useEffect(() => {
        if (temperature !== prevTemp) {
            setIsIncreasing(temperature > prevTemp);
            setPrevTemp(temperature);
            setAnimateIcon(true);

            // Reset animation after it completes
            const timer = setTimeout(() => {
                setAnimateIcon(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [temperature, prevTemp]);

    // Get weather condition description based on weather code
    const getWeatherCondition = (code: number): string => {
        // Clear sky
        if (code === 0) return isDay ? 'Clear sky' : 'Clear night';

        // Mainly clear, partly cloudy
        if (code === 1) return 'Mainly clear';
        if (code === 2) return 'Partly cloudy';

        // Overcast
        if (code === 3) return 'Overcast';

        // Fog
        if (code === 45 || code === 48) return 'Foggy';

        // Drizzle
        if (code >= 51 && code <= 57) return 'Drizzle';

        // Rain
        if (code >= 61 && code <= 67) return 'Rain';

        // Snow
        if (code >= 71 && code <= 77) return 'Snow';

        // Rain showers
        if (code >= 80 && code <= 82) return 'Rain showers';

        // Snow showers
        if (code === 85 || code === 86) return 'Snow showers';

        // Thunderstorm
        if (code >= 95 && code <= 99) return 'Thunderstorm';

        return 'Unknown';
    };

    // Get feels like description
    const getFeelsLikeDescription = (): string => {
        const difference = feelsLike - temperature;

        if (Math.abs(difference) < 2) return 'similar to actual temperature';

        if (difference >= 2) {
            if (difference >= 5) return 'much warmer than actual';
            return 'warmer than actual';
        } else {
            if (difference <= -5) return 'much colder than actual';
            return 'colder than actual';
        }
    };

    // Get icon for feels like indicator
    const getFeelsLikeIcon = (): string => {
        const difference = feelsLike - temperature;

        if (Math.abs(difference) < 2) return '≈';
        if (difference >= 5) return '🔥';
        if (difference > 0) return '↑';
        if (difference <= -5) return '❄️';
        return '↓';
    };

    // Determine color based on temperature
    const getTemperatureColor = (): string => {
        const temp = convertTemperature(temperature, 'celsius', 'celsius'); // Convert to celsius for range check

        if (temp <= 0) return 'from-blue-400 to-blue-600';
        if (temp <= 10) return 'from-cyan-400 to-blue-500';
        if (temp <= 20) return 'from-green-400 to-emerald-500';
        if (temp <= 30) return 'from-yellow-400 to-amber-500';
        return 'from-orange-400 to-red-500';
    };

    return (
        <div className={`flex items-center ${className}`}>
            <div className="relative mr-4">
                <WeatherIcon
                    weatherCode={weatherCode}
                    isDay={isDay}
                    size="2xl"
                    className={`${animateIcon ? 'animate-bounce' : 'animate-weather-float'}`}
                />
            </div>
            <div>
                <div className="relative">
                    <h2 className="text-5xl font-bold mb-1 text-white">
                        {formatTemperature(temperature)}
                        {isIncreasing !== null && (
                            <span
                                className={`ml-2 text-sm animate-fade-in ${isIncreasing ? 'text-red-400' : 'text-blue-400'}`}
                            >
                                {isIncreasing ? '↑' : '↓'}
                            </span>
                        )}
                    </h2>
                    <div
                        className={`absolute -z-10 inset-0 bg-gradient-to-r ${getTemperatureColor()}
            opacity-20 blur-md rounded-lg -m-1`}
                    ></div>
                </div>
                <div className="flex items-center mb-2">
                    <span className="text-lg text-white/90 mr-2">
                        Feels like {formatTemperature(feelsLike)}
                    </span>
                    <span className="text-sm px-2 py-1 rounded-full bg-white/10 text-white/70">
                        {getFeelsLikeIcon()} {getFeelsLikeDescription()}
                    </span>
                </div>
                <p className="text-md text-white/80 font-medium">
                    {getWeatherCondition(weatherCode)}
                </p>
            </div>
        </div>
    );
};

export default TemperatureDisplay;