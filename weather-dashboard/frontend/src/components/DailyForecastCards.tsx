import React from 'react';
import { WeatherData } from '../types/weatherTypes';
import WeatherIcon from './WeatherIcon';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings, convertTemperature, convertWindSpeed } from '../contexts/SettingsContext';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';

interface DailyForecastCardsProps {
    weatherData: WeatherData;
}

const DailyForecastCards: React.FC<DailyForecastCardsProps> = ({ weatherData }) => {
    const { temperatureUnit, windSpeedUnit } = useSettings();

    const formatDay = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { weekday: 'short' });
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Format temperature with unit
    const formatTemperature = (celsius: number | undefined): string => {
        if (celsius === undefined) return 'N/A';
        const temp = convertTemperature(celsius, 'celsius', temperatureUnit);
        return `${Math.round(temp)}°`;
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number | undefined): string => {
        if (kph === undefined) return 'N/A';
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return `${Math.round(speed)}`;
    };

    // Validate that we have all required data
    if (!weatherData?.daily?.time || !weatherData?.daily?.temperature_2m_max || !weatherData?.daily?.temperature_2m_min) {
        return <ErrorState message="Daily forecast data is incomplete" retryAction={() => window.location.reload()} />;
    }

    // Use the correct field name for timestamps
    const timestamps = weatherData.daily.time;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 w-full">
            {timestamps.map((time: string, index: number) => {
                // Get all the values we need with fallbacks
                const weatherCode = weatherData.daily.weather_code?.[index] ?? 0;
                const maxTemp = weatherData.daily.temperature_2m_max[index];
                const minTemp = weatherData.daily.temperature_2m_min[index];
                const windDirection = weatherData.daily.wind_direction_10m_dominant?.[index];
                const windSpeed = weatherData.daily.wind_speed_10m_max?.[index];
                const precipProb = weatherData.daily.precipitation_probability_max[index];

                return (
                    <div key={time} className="bg-slate-800/40 rounded-lg p-2 sm:p-3 text-center flex flex-col justify-between h-full">
                        <div>
                            <div className="text-white font-medium">
                                {formatDay(time)}
                            </div>
                            <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">
                                {formatDate(time)}
                            </div>
                            <div className="flex justify-center mb-2 sm:mb-3">
                                <WeatherIcon
                                    weatherCode={weatherCode}
                                    isDay={true}
                                    size="md"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold text-base sm:text-lg">
                                    {formatTemperature(maxTemp)}
                                </span>
                                <span className="text-white/70 text-sm">
                                    {formatTemperature(minTemp)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1 sm:mt-2 text-xs sm:text-sm text-white/70">
                                <div className="flex items-center">
                                    {windDirection !== undefined && (
                                        <WindDirectionIndicator
                                            direction={windDirection}
                                            size="sm"
                                        />
                                    )}
                                    <span className="ml-1">{formatWindSpeed(windSpeed)}</span>
                                </div>
                                <div>
                                    <span>{Math.round(precipProb)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DailyForecastCards;