import React, { useState, useEffect } from 'react';
import { fetchHourlyForecast } from '../services/weatherService';
import { HourlyForecastData } from '../types/weatherTypes';
import WindDirectionIndicator from './WindDirectionIndicator';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import { sample12HourData, formatLocalTime } from '../utils/timeUtils';

interface WindChartProps {
    latitude: number;
    longitude: number;
    hours?: number;
}

const WindChart: React.FC<WindChartProps> = ({
    latitude,
    longitude,
    hours = 24
}) => {
    const [windData, setWindData] = useState<HourlyForecastData | null>(null);
    const [sampledData, setSampledData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchHourlyForecast(latitude, longitude, hours);
                setWindData(data);

                if (data && data.timestamps && data.wind_speed_10m && data.wind_direction_10m) {
                    const dataToSample = {
                        wind_speed_10m: data.wind_speed_10m,
                        wind_direction_10m: data.wind_direction_10m,
                        wind_gusts_10m: data.wind_gusts_10m || Array(data.wind_speed_10m.length).fill(0)
                    };

                    const sampled = sample12HourData(data.timestamps, dataToSample);

                    setSampledData({
                        ...data,
                        timestamps: sampled.timestamps,
                        wind_speed_10m: sampled.dataArrays.wind_speed_10m,
                        wind_direction_10m: sampled.dataArrays.wind_direction_10m,
                        wind_gusts_10m: sampled.dataArrays.wind_gusts_10m
                    });
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching wind data:', err);
                setError('Failed to fetch wind data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [latitude, longitude, hours]);

    const formatTime = (timestamp: string): string => {
        return formatLocalTime(timestamp);
    };

    if (loading) {
        return <LoadingState message="Loading wind data..." />;
    }

    if (error) {
        return (
            <ErrorState
                message="Unable to load wind data"
                retryAction={() => window.location.reload()}
            />
        );
    }

    if (!sampledData) {
        return (
            <ErrorState
                message="No wind data available"
                retryAction={() => window.location.reload()}
            />
        );
    }

    const maxWindSpeed = Math.max(...sampledData.wind_speed_10m);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                    <div className="text-lg font-medium">Current Wind</div>
                    <div className="text-3xl font-bold">
                        {sampledData.wind_speed_10m[0] !== undefined ? Math.round(sampledData.wind_speed_10m[0]) : 'N/A'} km/h
                    </div>
                    <div className="text-sm text-white/70">
                        {sampledData.wind_direction_10m[0] !== undefined && (
                            <>
                                <WindDirectionIndicator
                                    direction={sampledData.wind_direction_10m[0]}
                                    size="md"
                                    className="inline-block mr-2"
                                />
                                {getWindDirection(sampledData.wind_direction_10m[0])}
                            </>
                        )}
                    </div>
                </div>
                <div className="text-white text-right">
                    <div className="text-lg font-medium">Gusts</div>
                    <div className="text-3xl font-bold">
                        {sampledData.wind_gusts_10m[0] !== undefined ? Math.round(sampledData.wind_gusts_10m[0]) : 'N/A'} km/h
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-2 text-white/70 text-sm">Wind forecast (km/h)</div>
                <div className="grid grid-cols-12 gap-0.5 sm:gap-1 md:gap-2 w-full pb-4">
                    {sampledData.timestamps.map((time, index) => (
                        <div key={time} className="flex flex-col items-center">
                            <div className="mb-1 text-white/70 text-xs truncate w-full text-center">{formatTime(time)}</div>
                            <div className="h-32 sm:h-40 md:h-48 lg:h-56 flex flex-col justify-end items-center w-full">
                                <WindDirectionIndicator
                                    direction={sampledData.wind_direction_10m[index] ?? 0}
                                    size="sm"
                                    className="mb-1"
                                />
                                <div
                                    className="w-10 sm:w-12 md:w-16 bg-blue-500/80 rounded-t-sm"
                                    style={{
                                        height: `${((sampledData.wind_speed_10m[index] ?? 0) / maxWindSpeed) * 100}%`,
                                        minHeight: '4px'
                                    }}
                                ></div>
                            </div>
                            <div className="mt-1 text-white text-xs">
                                {sampledData.wind_speed_10m[index] !== undefined ? Math.round(sampledData.wind_speed_10m[index]) : 'N/A'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper function to convert wind direction in degrees to cardinal direction
function getWindDirection(degrees: number): string {
    const directions = [
        'N', 'NNE', 'NE', 'ENE',
        'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW',
        'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

export default WindChart;