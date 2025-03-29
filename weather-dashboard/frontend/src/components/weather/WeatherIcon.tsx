import React from 'react';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

interface WeatherIconProps {
    weatherCode: number;
    isDay?: boolean;
    size?: IconSize;
    className?: string;
}

/**
 * Maps weather codes to weather conditions
 * Based on WMO weather codes
 */
export const mapWeatherCodeToCondition = (
    weatherCode: number
): 'clear' | 'partlyCloudy' | 'cloudy' | 'rainy' | 'heavyRain' | 'snowy' | 'foggy' | 'stormy' => {
    if (weatherCode === 0) return 'clear'; // Clear sky
    if (weatherCode <= 2) return 'partlyCloudy'; // Partly cloudy
    if (weatherCode <= 3) return 'cloudy'; // Cloudy
    if (weatherCode >= 45 && weatherCode <= 49) return 'foggy'; // Fog
    if ((weatherCode >= 51 && weatherCode <= 55) || (weatherCode >= 80 && weatherCode <= 81)) return 'rainy'; // Light/moderate rain
    if ((weatherCode >= 56 && weatherCode <= 67) || (weatherCode >= 82 && weatherCode <= 82)) return 'heavyRain'; // Heavy rain
    if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) return 'snowy'; // Snow
    if (weatherCode >= 95) return 'stormy'; // Thunderstorm

    // Default fallback
    return 'cloudy';
};

/**
 * Component to display a weather icon based on weather code and day/night
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({
    weatherCode,
    isDay = true,
    size = 'md',
    className = '',
}) => {
    // Map the weather code to a condition
    const condition = mapWeatherCodeToCondition(weatherCode);

    // Size mapping
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
    };

    // Get icon and colors based on condition and day/night
    const getIconContent = () => {
        switch (condition) {
            case 'clear':
                return isDay ? (
                    // Sun
                    <svg viewBox="0 0 24 24" fill="none" className="text-yellow-400">
                        <circle cx="12" cy="12" r="5" fill="currentColor" />
                        <path
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                        />
                    </svg>
                ) : (
                    // Moon
                    <svg viewBox="0 0 24 24" fill="none" className="text-gray-300">
                        <path
                            fill="currentColor"
                            d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
                        />
                    </svg>
                );

            case 'partlyCloudy':
                return isDay ? (
                    // Sun with cloud
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            fill="#F59E0B" // Yellow for sun
                            d="M8 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM8 15a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"
                        />
                        <path
                            fill="#9CA3AF" // Gray for cloud
                            d="M18 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0 1.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                        />
                        <path
                            fill="#9CA3AF" // Gray for cloud
                            d="M8 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"
                        />
                    </svg>
                ) : (
                    // Moon with cloud
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            fill="#D1D5DB" // Light gray for moon
                            d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-10 8a10 10 0 1 1 20 0 10 10 0 0 1-20 0z"
                        />
                        <path
                            fill="#6B7280" // Gray for cloud
                            d="M18 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                        />
                    </svg>
                );

            case 'cloudy':
                return (
                    // Multiple clouds
                    <svg viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path
                            fill="currentColor"
                            d="M5 14a4 4 0 0 1 4-4h10a4 4 0 0 1 0 8H9a4 4 0 0 1-4-4z"
                        />
                        <path
                            fill="currentColor"
                            d="M15 8a3 3 0 0 1 3-3h2a3 3 0 0 1 0 6h-2a3 3 0 0 1-3-3z"
                            className="text-gray-300"
                        />
                    </svg>
                );

            case 'rainy':
                return (
                    // Cloud with rain drops
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            fill="#9CA3AF" // Gray for cloud
                            d="M5 14a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H9a4 4 0 0 1-4-4z"
                        />
                        <path
                            stroke="#3B82F6" // Blue for rain
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            d="M8 18v2M12 18v2M16 18v2"
                        />
                    </svg>
                );

            case 'heavyRain':
                return (
                    // Cloud with heavy rain
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            fill="#6B7280" // Darker gray for heavy rain cloud
                            d="M5 14a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H9a4 4 0 0 1-4-4z"
                        />
                        <path
                            stroke="#2563EB" // Darker blue for heavy rain
                            strokeWidth="2"
                            strokeLinecap="round"
                            d="M7 18v2M10 18v3M13 18v2M16 18v3"
                        />
                    </svg>
                );

            case 'snowy':
                return (
                    // Cloud with snowflakes
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            fill="#9CA3AF" // Gray for cloud
                            d="M5 14a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H9a4 4 0 0 1-4-4z"
                        />
                        <path
                            fill="#F9FAFB" // White for snow
                            d="M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                        />
                    </svg>
                );

            case 'foggy':
                return (
                    // Fog lines
                    <svg viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            d="M3 8h18M5 12h14M7 16h10M9 20h6"
                        />
                    </svg>
                );

            case 'stormy':
                return (
                    // Cloud with lightning bolt
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            fill="#6B7280" // Dark gray for storm cloud
                            d="M5 14a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H9a4 4 0 0 1-4-4z"
                        />
                        <path
                            fill="#FBBF24" // Yellow for lightning
                            d="M13 11l-3 5h4l-1 3 3-5h-4l1-3z"
                        />
                    </svg>
                );

            default:
                return (
                    // Generic cloud as fallback
                    <svg viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path
                            fill="currentColor"
                            d="M5 14a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H9a4 4 0 0 1-4-4z"
                        />
                    </svg>
                );
        }
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            {getIconContent()}
        </div>
    );
};

export default React.memo(WeatherIcon);