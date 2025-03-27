/**
 * Weather condition color utilities
 * This file provides functions to get appropriate colors for different weather conditions
 */

type WeatherCondition = 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';

/**
 * Returns a color appropriate for the given weather condition and time of day
 * @param condition - The weather condition
 * @param isDay - Whether it's daytime or nighttime
 * @returns A color string (hex code)
 */
export const getWeatherConditionColor = (condition: WeatherCondition, isDay: boolean): string => {
    const colors = {
        clear: {
            day: '#4299E1', // blue-500
            night: '#2A4365', // blue-900
        },
        cloudy: {
            day: '#A0AEC0', // gray-400
            night: '#4A5568', // gray-600
        },
        rainy: {
            day: '#4A5568', // gray-600
            night: '#2D3748', // gray-700
        },
        snowy: {
            day: '#E2E8F0', // gray-200
            night: '#A0AEC0', // gray-400
        },
        foggy: {
            day: '#CBD5E0', // gray-300
            night: '#718096', // gray-500
        },
        stormy: {
            day: '#2D3748', // gray-700
            night: '#1A202C', // gray-800
        },
    };

    return colors[condition][isDay ? 'day' : 'night'];
};

/**
 * Returns a temperature-appropriate color
 * @param temperature - The temperature in celsius
 * @returns A color string (hex code)
 */
export const getTemperatureColor = (temperature: number): string => {
    if (temperature <= -10) return '#3182CE'; // Very cold (deep blue)
    if (temperature <= 0) return '#63B3ED';   // Cold (light blue)
    if (temperature <= 10) return '#90CDF4';  // Cool (lighter blue)
    if (temperature <= 15) return '#48BB78';  // Mild (green)
    if (temperature <= 20) return '#F6E05E';  // Warm (yellow)
    if (temperature <= 25) return '#F6AD55';  // Hot (orange)
    if (temperature <= 30) return '#F56565';  // Very hot (red)
    return '#C53030';                         // Extremely hot (deep red)
};

/**
 * Returns a precipitation-appropriate color
 * @param precipitationProbability - The precipitation probability as a percentage (0-100)
 * @returns A color string (hex code)
 */
export const getPrecipitationColor = (precipitationProbability: number): string => {
    if (precipitationProbability <= 10) return '#F7FAFC'; // Minimal (nearly white)
    if (precipitationProbability <= 30) return '#BEE3F8'; // Low (very light blue)
    if (precipitationProbability <= 50) return '#90CDF4'; // Moderate (light blue)
    if (precipitationProbability <= 70) return '#63B3ED'; // High (medium blue)
    if (precipitationProbability <= 90) return '#4299E1'; // Very high (blue)
    return '#3182CE';                                     // Extreme (dark blue)
};

/**
 * Utility functions for getting colors related to weather conditions
 */

// Color palette for different weather codes
const weatherCodeColors: Record<number, string> = {
    // Clear sky
    0: '#f6e05e', // yellow

    // Mainly clear, partly cloudy
    1: '#4299e1', // blue
    2: '#4299e1', // blue

    // Overcast
    3: '#718096', // gray

    // Fog
    45: '#a0aec0',
    48: '#a0aec0',

    // Drizzle
    51: '#63b3ed',
    53: '#63b3ed',
    55: '#63b3ed',
    56: '#63b3ed',
    57: '#63b3ed',

    // Rain
    61: '#3182ce',
    63: '#3182ce',
    65: '#3182ce',
    66: '#3182ce',
    67: '#3182ce',

    // Snow
    71: '#e2e8f0',
    73: '#e2e8f0',
    75: '#e2e8f0',
    77: '#e2e8f0',

    // Rain showers
    80: '#3182ce',
    81: '#3182ce',
    82: '#3182ce',

    // Snow showers
    85: '#e2e8f0',
    86: '#e2e8f0',

    // Thunderstorm
    95: '#6b46c1',
    96: '#6b46c1',
    99: '#6b46c1'
};

// Default color for unknown codes
const DEFAULT_COLOR = '#718096';

/**
 * Get the color associated with a specific weather code
 * @param weatherCode - The WMO weather code
 * @return Color string in hex format
 */
export const getWeatherCodeColor = (weatherCode: number): string => {
    return weatherCodeColors[weatherCode] || DEFAULT_COLOR;
};

/**
 * Get the background gradient for a weather condition
 * @param weatherCode - The WMO weather code
 * @param isDay - Whether it's daytime or nighttime
 * @return CSS gradient string
 */
export const getWeatherBackgroundGradient = (weatherCode: number, isDay: boolean): string => {
    if (!isDay) {
        // Night gradient for all conditions
        return 'linear-gradient(to bottom, #172041, #0f1629)';
    }

    // Clear sky
    if (weatherCode === 0) {
        return 'linear-gradient(to bottom, #4299e1, #63b3ed)';
    }

    // Mainly clear, partly cloudy
    if (weatherCode === 1 || weatherCode === 2) {
        return 'linear-gradient(to bottom, #4299e1, #90cdf4)';
    }

    // Overcast
    if (weatherCode === 3) {
        return 'linear-gradient(to bottom, #718096, #a0aec0)';
    }

    // Fog
    if (weatherCode === 45 || weatherCode === 48) {
        return 'linear-gradient(to bottom, #a0aec0, #cbd5e0)';
    }

    // Drizzle or light rain
    if ((weatherCode >= 51 && weatherCode <= 57) ||
        weatherCode === 61 || weatherCode === 80) {
        return 'linear-gradient(to bottom, #3182ce, #63b3ed)';
    }

    // Moderate to heavy rain
    if (weatherCode === 63 || weatherCode === 65 ||
        weatherCode === 66 || weatherCode === 67 ||
        weatherCode === 81 || weatherCode === 82) {
        return 'linear-gradient(to bottom, #2c5282, #3182ce)';
    }

    // Snow
    if ((weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode === 85 || weatherCode === 86) {
        return 'linear-gradient(to bottom, #a0aec0, #e2e8f0)';
    }

    // Thunderstorm
    if (weatherCode >= 95 && weatherCode <= 99) {
        return 'linear-gradient(to bottom, #2a4365, #434190)';
    }

    // Default for unknown codes
    return 'linear-gradient(to bottom, #4a5568, #718096)';
};