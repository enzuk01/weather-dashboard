import React, { useState, useEffect } from 'react';
import GlassCard from './ui/GlassCard';
import { getTemperatureColor } from '../utils/weatherColors';

interface HistoricalWeatherData {
    dates: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    temperatureMean: number[];
    precipitationSum: number[];
    weatherCode: number[];
}

interface HistoricalWeatherChartProps {
    latitude: number;
    longitude: number;
    days?: number;
    onError?: (error: Error) => void;
}

const HistoricalWeatherChart: React.FC<HistoricalWeatherChartProps> = ({
    latitude,
    longitude,
    days = 7,
    onError
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalWeatherData | null>(null);

    // Calculate start and end dates based on the days parameter
    const getDateRange = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                setLoading(true);
                const { startDate, endDate } = getDateRange();

                // In a real implementation, this would call the backend API
                // For now, we'll simulate with mock data
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

                // Mock data generation
                const mockDates: string[] = [];
                const mockTempMax: number[] = [];
                const mockTempMin: number[] = [];
                const mockTempMean: number[] = [];
                const mockPrecipSum: number[] = [];
                const mockWeatherCodes: number[] = [];

                const currentDate = new Date(startDate);
                const end = new Date(endDate);

                while (currentDate <= end) {
                    mockDates.push(currentDate.toISOString().split('T')[0]);

                    // Generate some realistic looking temperature data
                    const baseTemp = 15 + Math.sin(currentDate.getDate() / 3) * 5;
                    mockTempMax.push(baseTemp + 5 + Math.random() * 3);
                    mockTempMin.push(baseTemp - 5 - Math.random() * 3);
                    mockTempMean.push(baseTemp + Math.random() * 2 - 1);

                    // Generate precipitation data
                    mockPrecipSum.push(Math.random() > 0.6 ? Math.random() * 10 : 0);

                    // Generate weather codes (0: clear, 1-3: partly cloudy, 45-57: fog, 61-67: rain, etc)
                    const weatherCodeOptions = [0, 1, 2, 3, 45, 61, 63, 65];
                    mockWeatherCodes.push(weatherCodeOptions[Math.floor(Math.random() * weatherCodeOptions.length)]);

                    // Move to the next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                setHistoricalData({
                    dates: mockDates,
                    temperatureMax: mockTempMax,
                    temperatureMin: mockTempMin,
                    temperatureMean: mockTempMean,
                    precipitationSum: mockPrecipSum,
                    weatherCode: mockWeatherCodes
                });

                setError(null);
            } catch (err) {
                console.error('Error fetching historical data:', err);
                setError('Failed to load historical weather data');
                if (onError && err instanceof Error) {
                    onError(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistoricalData();
    }, [latitude, longitude, days, onError]);

    // Format date for display
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <GlassCard className="p-4 w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Historical Weather ({days} Day History)</h3>

            {loading ? (
                <div className="flex justify-center items-center h-64 text-white">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span className="ml-2">Loading historical data...</span>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-64 text-white/80">
                    <span className="text-red-400">⚠️ {error}</span>
                </div>
            ) : historicalData && historicalData.dates.length > 0 ? (
                <div className="relative overflow-x-auto">
                    <div className="min-h-[320px]">
                        {/* Temperature Range Chart */}
                        <div className="h-60 relative mt-4 mb-8">
                            {historicalData.dates.map((date, index) => {
                                const minTemp = historicalData.temperatureMin[index];
                                const maxTemp = historicalData.temperatureMax[index];
                                const meanTemp = historicalData.temperatureMean[index];
                                const precipitation = historicalData.precipitationSum[index];

                                // Chart positioning
                                const itemWidth = 100 / historicalData.dates.length;
                                const left = `${index * itemWidth}%`;

                                // Temperature range visualization
                                const minColor = getTemperatureColor(minTemp);
                                const maxColor = getTemperatureColor(maxTemp);

                                return (
                                    <div
                                        key={date}
                                        className="absolute bottom-0"
                                        style={{
                                            left,
                                            width: `${itemWidth}%`,
                                            height: '100%'
                                        }}
                                    >
                                        {/* Date Label */}
                                        <div className="absolute bottom-[-30px] text-xs text-white/80 w-full text-center">
                                            {formatDate(date)}
                                        </div>

                                        {/* Temperature Range Bar */}
                                        <div className="absolute w-[40%] left-[30%] bottom-10 h-40 flex flex-col items-center">
                                            {/* Min-Max Range */}
                                            <div
                                                className="w-2 rounded-full"
                                                style={{
                                                    background: `linear-gradient(to top, ${minColor}, ${maxColor})`,
                                                    height: '100%'
                                                }}
                                            ></div>

                                            {/* Mean Temperature Line */}
                                            <div
                                                className="absolute w-4 h-1 bg-white rounded-full"
                                                style={{
                                                    bottom: `${(meanTemp - (minTemp - 5)) / ((maxTemp + 5) - (minTemp - 5)) * 100}%`,
                                                    transform: 'translateX(-25%)'
                                                }}
                                            ></div>

                                            {/* Temperature Labels */}
                                            <div className="absolute bottom-[-10px] text-xs font-semibold text-center w-full">
                                                <span className="text-blue-300">{minTemp.toFixed(1)}°</span>
                                            </div>
                                            <div className="absolute top-[-10px] text-xs font-semibold text-center w-full">
                                                <span className="text-red-300">{maxTemp.toFixed(1)}°</span>
                                            </div>
                                        </div>

                                        {/* Precipitation Indicator */}
                                        {precipitation > 0 && (
                                            <div
                                                className="absolute bottom-2 left-[30%] w-[40%] flex justify-center"
                                            >
                                                <div
                                                    className="rounded-full bg-blue-400/60 flex items-center justify-center"
                                                    style={{
                                                        width: `${Math.min(precipitation * 2, 24)}px`,
                                                        height: `${Math.min(precipitation * 2, 24)}px`
                                                    }}
                                                >
                                                    <span className="text-[8px] text-white font-bold">
                                                        {precipitation.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-between text-xs text-white/80 mt-8">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-t from-blue-400 to-red-400 mr-1"></div>
                            <span>Temperature Range (Min-Max)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-400/60 mr-1"></div>
                            <span>Precipitation (mm)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-1 bg-white rounded-full mr-1"></div>
                            <span>Mean Temperature</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-64 text-white/70">
                    No historical data available
                </div>
            )}
        </GlassCard>
    );
};

export default HistoricalWeatherChart;