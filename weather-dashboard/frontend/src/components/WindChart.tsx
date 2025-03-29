import React, { useEffect, useState } from 'react';
import { fetchHourlyForecast } from '../services/weatherService';
import { HourlyForecastData } from '../types/weatherTypes';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WindDirectionIndicator from './WindDirectionIndicator';
import { useSettings } from '../contexts/SettingsContext';

interface WindChartProps {
    latitude: number;
    longitude: number;
}

const WindChart: React.FC<WindChartProps> = ({ latitude, longitude }) => {
    const [forecastData, setForecastData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { windSpeedUnit } = useSettings();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchHourlyForecast(latitude, longitude);
                setForecastData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching wind data:', err);
                setError('Failed to load wind data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [latitude, longitude]);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!forecastData) {
        return <ErrorState message="No wind data available" />;
    }

    // Support both possible field names (timestamps or time)
    const timeArray = forecastData.timestamps || forecastData.time || [];

    if (timeArray.length === 0) {
        return <ErrorState message="No hourly wind data available" />;
    }

    // Format time for display
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric' });
    };

    // Safely get array values with defaults
    const safeGet = <T extends unknown>(arr: T[] | undefined, index: number, defaultValue: T): T => {
        if (!arr || index >= arr.length) return defaultValue;
        return arr[index];
    };

    // Get current wind conditions
    const currentWindSpeed = safeGet(forecastData.wind_speed_10m, 0, 0);
    const currentWindDirection = safeGet(forecastData.wind_direction_10m, 0, 0);
    const currentWindGusts = forecastData.wind_gusts_10m ? safeGet(forecastData.wind_gusts_10m, 0, 0) : undefined;

    // Determine how many hours to display (maximum 12, but only use what's available)
    const displayHours = Math.min(12, timeArray.length);

    return (
        <div className="space-y-6">
            {/* Current wind conditions */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-lg font-medium">Speed</div>
                    <div className="text-3xl font-bold">
                        {Math.round(currentWindSpeed)} {windSpeedUnit}
                    </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-lg font-medium">Direction</div>
                    <div className="flex justify-center items-center h-12">
                        <WindDirectionIndicator direction={currentWindDirection} size="lg" />
                    </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-lg font-medium">Gusts</div>
                    <div className="text-3xl font-bold">
                        {currentWindGusts !== undefined ? Math.round(currentWindGusts) : 'N/A'} {windSpeedUnit}
                    </div>
                </div>
            </div>

            {/* Wind speed chart */}
            <div className="h-48">
                <div className="flex h-full">
                    {Array.from({ length: displayHours }).map((_, i) => {
                        const time = timeArray[i];
                        const speed = safeGet(forecastData.wind_speed_10m, i, 0);
                        const direction = safeGet(forecastData.wind_direction_10m, i, 0);

                        return (
                            <div
                                key={time}
                                className="flex-1 flex flex-col justify-end items-center h-full"
                            >
                                <div className="text-xs text-white/70 mb-1">{formatTime(time)}</div>
                                <div className="flex flex-col items-center">
                                    <WindDirectionIndicator direction={direction} size="sm" />
                                    <div
                                        className="w-full bg-blue-500/30"
                                        style={{ height: `${(speed / 50) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-white/70 mt-1">
                                    {Math.round(speed)} {windSpeedUnit}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WindChart;