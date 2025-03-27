import React from 'react';
import { getWeatherConditionColor, getWeatherCodeColor } from '../utils/weatherColors';

export interface WeatherIconProps {
    weatherCode: number;
    isDay: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

/**
 * Component to display a weather condition icon using emoji
 * @param weatherCode - WMO weather condition code
 * @param isDay - Whether it's daytime or nighttime
 * @param size - Size of the icon (small, medium, large, extra large)
 * @param className - Additional CSS classes
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({
    weatherCode,
    isDay,
    size = 'md',
    className = ''
}) => {
    // Get the weather emoji based on the code and time of day
    const getWeatherEmoji = (code: number): string => {
        // Clear
        if (code === 0) {
            return isDay ? '☀️' : '🌙';
        }

        // Mainly clear, partly cloudy
        if (code === 1 || code === 2) {
            return isDay ? '🌤️' : '☁️';
        }

        // Overcast
        if (code === 3) {
            return '☁️';
        }

        // Fog
        if (code === 45 || code === 48) {
            return '🌫️';
        }

        // Drizzle
        if (code >= 51 && code <= 57) {
            return '🌦️';
        }

        // Rain
        if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
            return '🌧️';
        }

        // Freezing rain
        if (code === 66 || code === 67) {
            return '❄️🌧️';
        }

        // Snow
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
            return '❄️';
        }

        // Thunderstorm
        if (code >= 95 && code <= 99) {
            return '⛈️';
        }

        // Default
        return '❓';
    };

    // Get size class
    const getSizeClass = (): string => {
        switch (size) {
            case 'sm': return 'text-xl';
            case 'md': return 'text-3xl';
            case 'lg': return 'text-5xl';
            case 'xl': return 'text-7xl';
            default: return 'text-3xl';
        }
    };

    // Map weather code to condition type for using with the original getWeatherConditionColor function
    const getConditionType = (code: number): 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy' => {
        // Clear
        if (code === 0) {
            return 'clear';
        }

        // Cloudy
        if (code >= 1 && code <= 3) {
            return 'cloudy';
        }

        // Fog
        if (code === 45 || code === 48) {
            return 'foggy';
        }

        // Rain or drizzle
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            return 'rainy';
        }

        // Snow
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
            return 'snowy';
        }

        // Thunderstorm
        if (code >= 95 && code <= 99) {
            return 'stormy';
        }

        return 'cloudy'; // Default
    };

    const emoji = getWeatherEmoji(weatherCode);
    // Option 1: Use the condition-based color (more distinctive)
    const conditionType = getConditionType(weatherCode);
    const conditionColor = getWeatherConditionColor(conditionType, isDay);
    // Option 2: Use the code-based color (more precise)
    // const conditionColor = getWeatherCodeColor(weatherCode);

    return (
        <span
            className={`${getSizeClass()} ${className}`}
            style={{ color: conditionColor }}
            aria-label={`Weather condition: ${emoji}`}
        >
            {emoji}
        </span>
    );
};

export default WeatherIcon;