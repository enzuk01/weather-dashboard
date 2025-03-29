import React, { useEffect, useState } from 'react';
import { fetchHourlyForecast } from '../services/weatherService';
import { HourlyForecastData } from '../types/weatherTypes';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import { useSettings, convertPrecipitation } from '../contexts/SettingsContext';

interface PrecipitationChartProps {
    latitude: number;
    longitude: number;
}

const PrecipitationChart: React.FC<PrecipitationChartProps> = ({ latitude, longitude }) => {
    const [forecastData, setForecastData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { precipitationUnit } = useSettings();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchHourlyForecast(latitude, longitude);
                setForecastData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching precipitation data:', err);
                setError('Failed to load precipitation data');
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
        return <ErrorState message="No precipitation data available" />;
    }

    // Support both possible field names (timestamps or time)
    const timeArray = forecastData.timestamps || forecastData.time || [];

    if (timeArray.length === 0) {
        return <ErrorState message="No precipitation time data available" />;
    }

    if (!forecastData.precipitation || !forecastData.precipitation_probability) {
        return <ErrorState message="Precipitation data is missing" />;
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

    // Determine how many hours to display (maximum 12, but only use what's available)
    const displayHours = Math.min(12, timeArray.length);

    return (
        <div className="w-full h-64">
            <div className="flex h-full">
                {Array.from({ length: displayHours }).map((_, i) => {
                    const time = timeArray[i];
                    const probability = safeGet(forecastData.precipitation_probability, i, 0);
                    const rawAmount = safeGet(forecastData.precipitation, i, 0);

                    // Convert precipitation amount from mm (API default) to user's selected unit
                    const amount = convertPrecipitation(rawAmount, 'mm', precipitationUnit);

                    return (
                        <div
                            key={time}
                            className="flex-1 flex flex-col justify-end items-center h-full"
                        >
                            <div className="text-xs text-white/70 mb-1">{formatTime(time)}</div>
                            <div
                                className="w-full bg-blue-500/30 relative"
                                style={{ height: `${probability}%` }}
                            >
                                <div className="absolute -top-5 w-full text-center text-xs text-white/90">
                                    {probability}%
                                </div>
                            </div>
                            <div className="text-xs text-white/70 mt-1">
                                {amount.toFixed(amount < 1 ? 2 : 1)} {precipitationUnit || 'mm'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PrecipitationChart;