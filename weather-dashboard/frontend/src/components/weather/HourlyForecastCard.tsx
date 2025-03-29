import React from 'react';
import { formatTime } from '../../utils/dateUtils';
import WeatherIcon from './WeatherIcon';

interface HourlyForecastCardProps {
    time: Date;
    temperature: number;
    apparentTemperature?: number;
    precipitationProbability: number;
    weatherCode: number;
    isDay: number | boolean;
    isCurrentHour?: boolean;
    isHighlighted?: boolean;
    onClick?: () => void;
}

const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({
    time,
    temperature,
    apparentTemperature,
    precipitationProbability,
    weatherCode,
    isDay,
    isCurrentHour = false,
    isHighlighted = false,
    onClick
}) => {
    // Format hour for display
    const hour = formatTime(time, '24h', false);

    // Normalize isDay to boolean - accept both number (1/0) and boolean values
    const isDayBool = typeof isDay === 'boolean' ? isDay : isDay === 1;

    // Determine background class based on card state
    const bgClass = isHighlighted
        ? 'bg-blue-100 dark:bg-blue-900'
        : isCurrentHour
            ? 'bg-blue-50 dark:bg-slate-800'
            : 'bg-white/90 dark:bg-slate-900/80';

    // Format temperature with a degree symbol
    const formattedTemp = `${Math.round(temperature)}°`;

    // Format feels like temperature if available
    const formattedFeelsLike = apparentTemperature !== undefined
        ? `${Math.round(apparentTemperature)}°`
        : undefined;

    // Format precipitation probability as percentage
    const formattedPrecip = `${Math.round(precipitationProbability)}%`;

    // Show precipitation only if probability is greater than 0
    const showPrecip = precipitationProbability > 0;

    return (
        <div
            className={`
        flex flex-col items-center p-2 rounded-lg shadow-sm w-20
        transition-all duration-200 ease-in-out
        ${bgClass}
        ${isHighlighted ? 'scale-105 shadow-md' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
            onClick={onClick}
        >
            {/* Hour */}
            <div className="text-sm font-medium mb-1">{hour}</div>

            {/* Weather icon */}
            <div className="my-1">
                <WeatherIcon
                    weatherCode={weatherCode}
                    isDay={isDayBool}
                    size="md"
                />
            </div>

            {/* Temperature */}
            <div className="text-base font-bold mt-1">{formattedTemp}</div>

            {/* Feels like temperature (if available and different) */}
            {formattedFeelsLike && Math.abs(temperature - (apparentTemperature || 0)) >= 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Feels {formattedFeelsLike}
                </div>
            )}

            {/* Precipitation probability (only if > 0%) */}
            {showPrecip && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                    <div className="w-3 h-3 mr-0.5">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,3c-0.8,0-1.6,0.3-2.1,0.9l-9,9c-1.2,1.2-1.2,3.1,0,4.2l0,0c1.2,1.2,3.1,1.2,4.2,0l7-7l7,7c1.2,1.2,3.1,1.2,4.2,0 c1.2-1.2,1.2-3.1,0-4.2l-9-9C13.6,3.3,12.8,3,12,3z" />
                        </svg>
                    </div>
                    {formattedPrecip}
                </div>
            )}
        </div>
    );
};

export default React.memo(HourlyForecastCard);