import React from 'react';
import { WeatherData } from '../types/weatherTypes';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings, convertWindSpeed } from '../contexts/SettingsContext';
import { sample12HourData, formatLocalTime } from '../utils/timeUtils';

interface WindChartProps {
    weatherData: WeatherData;
}

const WindChart: React.FC<WindChartProps> = ({ weatherData }) => {
    const { windSpeedUnit } = useSettings();

    // Sample the data to show 12 points
    const sampledData = sample12HourData(weatherData.hourly.timestamps, {
        wind_speed_10m: weatherData.hourly.wind_speed_10m,
        wind_direction_10m: weatherData.hourly.wind_direction_10m,
        wind_gusts_10m: weatherData.hourly.wind_gusts_10m || Array(weatherData.hourly.wind_speed_10m.length).fill(0)
    });

    const formatTime = (timestamp: string): string => {
        return formatLocalTime(timestamp);
    };

    // Format wind speed with unit
    const formatWindSpeed = (kph: number | undefined): string => {
        if (typeof kph === 'undefined') return 'N/A';
        const speed = convertWindSpeed(kph, 'kph', windSpeedUnit);
        return `${Math.round(speed)} ${windSpeedUnit}`;
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] grid grid-cols-12 gap-2">
                {sampledData.timestamps.map((timestamp, index) => (
                    <div key={timestamp} className="flex flex-col items-center">
                        <WindDirectionIndicator
                            direction={sampledData.dataArrays.wind_direction_10m[index]}
                            size="md"
                            className="mb-2"
                        />
                        <div className="text-sm font-semibold">
                            {formatWindSpeed(sampledData.dataArrays.wind_speed_10m[index])}
                        </div>
                        {sampledData.dataArrays.wind_gusts_10m && (
                            <div className="text-xs text-gray-500">
                                Gusts: {formatWindSpeed(sampledData.dataArrays.wind_gusts_10m[index])}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            {formatTime(timestamp)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WindChart;