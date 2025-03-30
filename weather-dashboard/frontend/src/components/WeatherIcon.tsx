import React from 'react';
import { getWeatherConditionColor, getWeatherCodeColor } from '../utils/weatherColors';

export interface WeatherIconProps {
    weatherCode: number;
    isDay: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
    const sizeClasses = {
        'sm': 'w-6 h-6',
        'md': 'w-8 h-8',
        'lg': 'w-10 h-10',
        'xl': 'w-12 h-12',
        '2xl': 'w-16 h-16'
    };

    // Map WMO weather codes to icon names
    // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    const getIconName = (code: number, day: boolean): string => {
        // Clear sky
        if (code === 0) {
            return day ? 'sun' : 'moon-stars';
        }

        // Partly cloudy
        if (code === 1 || code === 2) {
            return day ? 'cloud-sun' : 'cloud-moon';
        }

        // Overcast
        if (code === 3) {
            return 'clouds';
        }

        // Fog
        if (code === 45 || code === 48) {
            return 'fog';
        }

        // Drizzle
        if (code >= 51 && code <= 57) {
            return 'drizzle';
        }

        // Rain
        if (code >= 61 && code <= 65) {
            return 'rain';
        }

        // Freezing rain
        if (code === 66 || code === 67) {
            return 'rain-snow';
        }

        // Snow
        if (code >= 71 && code <= 77) {
            return 'snow';
        }

        // Rain showers
        if (code >= 80 && code <= 82) {
            return day ? 'cloud-sun-rain' : 'cloud-moon-rain';
        }

        // Snow showers
        if (code === 85 || code === 86) {
            return 'cloud-snow';
        }

        // Thunderstorm
        if (code >= 95 && code <= 99) {
            return 'thunderstorm';
        }

        // Default
        return 'cloud';
    };

    const iconName = getIconName(weatherCode, isDay);

    // SVG icon map - simplified for this example
    const renderIcon = (name: string) => {
        switch (name) {
            case 'sun':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-yellow-400 ${className}`}>
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                );
            case 'moon-stars':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-gray-200 ${className}`}>
                        <path d="M17.75 4.09l-2.53 1.94.91 3.06-2.63-1.81-2.63 1.81.91-3.06-2.53-1.94L12.44 4l1.06-3 1.06 3 3.19.09m3.5 6.91l-1.64 1.25.59 1.98-1.7-1.17-1.7 1.17.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95 2.06.05m-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14.4-.4.82-.76 1.27-1.08.75-.53 1.93.36 1.85 1.19-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82-2.81 3.14-2.7 7.96.31 10.98 3.02 3.01 7.84 3.12 10.98.31Z" />
                    </svg>
                );
            case 'cloud-sun':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-gray-300 ${className}`}>
                        <path d="M6.76 4.84a1.2 1.2 0 0 1-1.41.05 1.2 1.2 0 0 1-.4-1.36 1.2 1.2 0 0 1 1.1-.76c.4 0 .77.19 1 .51.2.31.23.7.07 1.03a5.9 5.9 0 0 0-1.3 9.62l.53.36-.67.37C3.6 15.7 2 17.87 2 20.3 2 21.78 3.22 23 4.7 23h14.6c1.48 0 2.7-1.22 2.7-2.7 0-2.3-1.46-4.37-3.63-5.16l-.57-.22.01-.6a5.09 5.09 0 0 0-5.09-5.09c-1.14 0-2.21.38-3.09 1.08l-.52.37.36-.53a5.92 5.92 0 0 0 1.3-3.7 6 6 0 0 0-3.99-5.6M12.7 5a4 4 0 0 1 .24 8c-.3-1.34-1.05-2.5-2.12-3.35A7.88 7.88 0 0 1 12.7 5m-1.81 11.74c1.77.93 3.75 1.1 5.61.5 1.35.82 2.24 2.29 2.24 3.96 0 .59-.26 1.1-.7 1.4H7.1c-.44-.3-.71-.81-.71-1.4 0-1.85 1.11-3.5 2.8-4.2l.46-.16.24.4" />
                    </svg>
                );
            // Add more cases for other icons...
            case 'clouds':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-gray-400 ${className}`}>
                        <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                    </svg>
                );
            case 'rain':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-blue-400 ${className}`}>
                        <path d="M18.5 5.5a3.5 3.5 0 0 0-6.5-1.83 3 3 0 0 0-1.5-.67 3 3 0 0 0-3 3c0 .24.03.47.08.69A3.5 3.5 0 0 0 4 10c0 1.9 1.55 3.45 3.45 3.5h9.1c1.6.05 2.95-1.22 3-2.82a3 3 0 0 0-1.05-5.18M9.5 14c.34 0 .62.28.62.62v4.76c0 .34-.28.62-.62.62s-.62-.28-.62-.62v-4.76c0-.34.28-.62.62-.62m4 0c.34 0 .62.28.62.62v4.76c0 .34-.28.62-.62.62s-.62-.28-.62-.62v-4.76c0-.34.28-.62.62-.62m-2 4c.34 0 .62.28.62.62v.76c0 .34-.28.62-.62.62s-.62-.28-.62-.62v-.76c0-.34.28-.62.62-.62" />
                    </svg>
                );
            case 'thunderstorm':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-yellow-500 ${className}`}>
                        <path d="M4 10c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-5l3 5.8c.1.3-.5.7-.7.5L8 16H6c-1.1 0-2-.9-2-2v-4m12-2h-8c-.9 0-1.7.43-2.23 1.09C5.29 9.03 5 9.5 5 10v4c0 .5.21.94.54 1.26.33.33.77.54 1.26.54h1.76l5.22 4.95-2.27-4.95H18c.5 0 .94-.21 1.26-.54.33-.33.54-.77.54-1.26v-3c0-.79-.62-1.43-1.4-1.47-.3-.02-.61.02-.9.12-.28.1-.53.26-.75.48" />
                    </svg>
                );
            case 'snow':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-gray-200 ${className}`}>
                        <path d="M6 14h1v1h-1v-1m5-1h1v2h-1v-2m5 0h1v2h-1v-2m-3-2h1v4h-1v-4m-5 2h1v2h-1v-2m-3-1h1v3h-1v-3m8-6.6c-2.01 0-3.66 1.35-4.2 3.2h-.7c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9h11.8c2.43 0 4.4-1.97 4.4-4.4s-1.97-4.4-4.4-4.4c-.04 0-.08 0-.12 0-.5-2.37-2.61-4.2-5.18-4.2Z" />
                    </svg>
                );
            // Default case
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-gray-400 ${className}`}>
                        <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                    </svg>
                );
        }
    };

    return renderIcon(iconName);
};

export default WeatherIcon;