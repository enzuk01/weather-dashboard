import React from 'react';
import GlassCard from './ui/GlassCard';
import { getWeatherConditionColor } from '../utils/weatherColors';

interface TemperatureChartProps {
    timestamps: string[];
    temperatures: number[];
    title?: string;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
    timestamps,
    temperatures,
    title = "Temperature (°C)"
}) => {
    // Find min and max values for scaling
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp;

    // Chart dimensions
    const chartHeight = 200;
    const barWidth = 100 / (timestamps.length || 1);

    // Format time from ISO string
    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for chart header
    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <GlassCard className="p-4 w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                {timestamps.length > 0 && (
                    <p className="text-sm text-white/80">{formatDate(timestamps[0])}</p>
                )}
            </div>

            {temperatures.length > 0 ? (
                <div className="relative" style={{ height: `${chartHeight}px` }}>
                    {/* Chart grid lines */}
                    <div className="absolute w-full h-full flex flex-col justify-between">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="border-t border-white/10 w-full"
                                style={{ top: `${(i * 25)}%` }}
                            />
                        ))}
                    </div>

                    {/* Temperature bars */}
                    <div className="absolute w-full h-full flex">
                        {temperatures.map((temp, index) => {
                            // Calculate height percentage based on temperature
                            const heightPercent = tempRange === 0
                                ? 50 // Default to 50% if all temps are the same
                                : ((temp - minTemp) / tempRange) * 80 + 10; // Scale to 10%-90% of chart height

                            const color = getWeatherConditionColor('clear', true);

                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center justify-end"
                                    style={{ width: `${barWidth}%` }}
                                >
                                    {/* Temperature bar */}
                                    <div
                                        className="w-[60%] rounded-t-md"
                                        style={{
                                            height: `${heightPercent}%`,
                                            backgroundColor: color,
                                            opacity: 0.8
                                        }}
                                    />

                                    {/* Temperature value */}
                                    <div className="text-xs text-white font-medium mt-1">
                                        {temp.toFixed(1)}°
                                    </div>

                                    {/* Timestamp */}
                                    <div className="text-xs text-white/70 mt-0.5">
                                        {formatTime(timestamps[index])}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-[200px] text-white/70">
                    No temperature data available
                </div>
            )}
        </GlassCard>
    );
};

export default TemperatureChart;