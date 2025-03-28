import React from 'react';
import { WeatherData } from '../types/weatherTypes';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { sample12HourData, formatLocalTime } from '../utils/timeUtils';
import { useSettings, convertTemperature, convertWindSpeed } from '../contexts/SettingsContext';

interface HourlyForecastCardsProps {
    weatherData: WeatherData;
}

const HourlyForecastCards: React.FC<HourlyForecastCardsProps> = ({ weatherData }) => {
    const { temperatureUnit, windSpeedUnit } = useSettings();

    const formatTime = (timestamp: string): string => {
        return formatLocalTime(timestamp);
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getCurrentHourIndex = (): number => {
        if (!weatherData.hourly || !weatherData.hourly.timestamps || weatherData.hourly.timestamps.length === 0) {
            return -1;
        }
        return 0;
    };

    if (!weatherData.hourly) {
        return <ErrorState message="No hourly forecast data available" retryAction={() => window.location.reload()} />;
    }

    const currentHourIndex = getCurrentHourIndex();

    // Group hours by day for better display
    const days = new Map<string, number[]>();
    weatherData.hourly.timestamps.forEach((timestamp, index) => {
        const date = formatDate(timestamp);
        if (!days.has(date)) {
            days.set(date, []);
        }
        days.get(date)?.push(index);
    });

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-flow-col auto-cols-max gap-2 md:gap-4 pb-2">
                {Array.from(days).map(([date, hourIndices]) => (
                    <div key={date} className="flex-none">
                        <div className="text-white font-medium text-center mb-2">{date}</div>
                        <div className="grid grid-flow-col auto-cols-max gap-1 sm:gap-2 md:gap-3">
                            {hourIndices.map(index => (
                                <div
                                    key={weatherData.hourly.timestamps[index]}
                                    className={`flex-none w-20 sm:w-24 md:w-28 p-2 sm:p-3 rounded-lg ${index === currentHourIndex
                                        ? 'bg-blue-500/50 ring-2 ring-blue-300'
                                        : 'bg-slate-800/40'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-white text-xs sm:text-sm mb-1">
                                            {formatTime(weatherData.hourly.timestamps[index])}
                                        </div>
                                        <div className="flex justify-center mb-1 sm:mb-2">
                                            <WeatherIcon
                                                weatherCode={weatherData.hourly.weather_code[index] ?? 0}
                                                isDay={weatherData.hourly.is_day[index] === 1}
                                                size="md"
                                            />
                                        </div>
                                        <div className="text-white font-medium mb-1">
                                            {convertTemperature(weatherData.hourly.temperature_2m[index] ?? 0, 'celsius', temperatureUnit).toFixed(1)}°
                                            {temperatureUnit === 'celsius' ? 'C' : 'F'}
                                        </div>
                                        <div className="text-white/70 text-xs">
                                            {weatherData.hourly.precipitation_probability[index] ?? 0}% rain
                                        </div>
                                        <div className="text-white/70 text-xs flex items-center justify-center mt-1">
                                            <WindDirectionIndicator
                                                direction={weatherData.hourly.wind_direction_10m[index] ?? 0}
                                                size="sm"
                                            />
                                            {convertWindSpeed(weatherData.hourly.wind_speed_10m[index] ?? 0, 'kph', windSpeedUnit).toFixed(0)}
                                            {' '}
                                            {windSpeedUnit}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HourlyForecastCards;