import React from 'react';
import GlassCard from './ui/GlassCard';
import { sample12HourData, formatLocalTime } from '../utils/timeUtils';

interface PrecipitationChartProps {
    timestamps: string[];
    precipitationProbabilities: number[];
}

const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
    timestamps,
    precipitationProbabilities
}) => {
    // Apply consistent 12-point sampling at 2-hour intervals
    const { timestamps: sampledTimestamps, dataArrays } = sample12HourData(
        timestamps,
        { precipitation_probability: precipitationProbabilities }
    );

    // Get the sampled precipitation probabilities
    const sampledProbabilities = dataArrays.precipitation_probability;

    // Ensure we have data to display
    console.log("Precipitation data:", { sampledProbabilities, original: precipitationProbabilities });

    // Find maximum value for scaling (ensure we always have at least a max of 100 for percentages)
    const maxProbability = Math.max(...sampledProbabilities, 30);

    // Check if there's any precipitation data with a lower threshold (5% instead of 0)
    const hasPrecipitation = sampledProbabilities.some(p => p > 5);

    // Calculate precipitation forecast summary
    const highestPrecipitation = Math.max(...sampledProbabilities);
    const averagePrecipitation = Math.round(
        sampledProbabilities.reduce((sum, val) => sum + val, 0) /
        sampledProbabilities.length
    );

    // Format time range for the forecast
    const startTime = formatLocalTime(sampledTimestamps[0]);
    const endTime = formatLocalTime(sampledTimestamps[sampledTimestamps.length - 1]);

    // Determine precipitation forecast message
    const getForecastMessage = () => {
        if (highestPrecipitation <= 5) return "No precipitation expected";
        if (highestPrecipitation < 20) return "Light chance of precipitation";
        if (highestPrecipitation < 50) return "Moderate chance of precipitation";
        if (highestPrecipitation < 80) return "High chance of precipitation";
        return "Very high chance of precipitation";
    };

    return (
        <div className="precipitation-chart">
            {/* Current precipitation status - always show this section */}
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-white text-base font-semibold">{getForecastMessage()}</h3>
                    <p className="text-white/70 text-xs">{startTime} - {endTime}</p>
                </div>
                <div className="text-right bg-blue-500/20 px-3 py-1 rounded-lg">
                    <span className="text-xl font-bold text-blue-400">{highestPrecipitation}%</span>
                    <p className="text-white/70 text-xs">peak chance</p>
                </div>
            </div>

            {/* Precipitation chart with grid lines */}
            <div className="relative">
                {/* Grid lines background */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-white/20"></div>
                    <div className="border-t border-white/20"></div>
                    <div className="border-t border-white/20"></div>
                    <div className="border-t border-white/20"></div>
                </div>

                {/* Chart bars container */}
                <div className="relative h-36 sm:h-40 md:h-48 lg:h-56 mb-2 overflow-hidden">
                    {/* Add vertical guides */}
                    <div className="absolute inset-0 grid pointer-events-none"
                        style={{ gridTemplateColumns: `repeat(${sampledTimestamps.length}, minmax(0, 1fr))` }}>
                        {sampledTimestamps.map((_, i) => (
                            <div key={`guide-${i}`} className="h-full border-r border-white/10 first:border-l"></div>
                        ))}
                    </div>

                    <div className="absolute inset-0 flex items-end overflow-hidden">
                        {sampledProbabilities.map((probability, index) => {
                            // Significantly exaggerate the scale to make small values more visible
                            // Even tiny probability values get decent visual representation
                            const heightPercentage = probability <= 0 ? 0 :
                                probability <= 5 ? 15 + (probability * 2) :  // 15-25% height for 1-5%
                                    probability <= 20 ? 25 + ((probability - 5) * 1.5) : // 25-45% height for 5-20%
                                        probability <= 50 ? 45 + ((probability - 20) * 0.8) : // 45-70% height for 20-50%
                                            70 + ((probability - 50) * 0.6); // 70-100% height for 50-100%

                            const height = `${heightPercentage}%`;

                            // Enhance bar color based on probability - make all values more prominent
                            let barColor = 'bg-blue-400/70 dark:bg-blue-400/70'; // Very low - now more colorful
                            let dropletColor = 'text-blue-400 dark:text-blue-400';

                            if (probability > 60) {
                                barColor = 'bg-blue-600/90 dark:bg-blue-600/90'; // Very high
                                dropletColor = 'text-blue-600 dark:text-blue-600';
                            } else if (probability > 30) {
                                barColor = 'bg-blue-500/80 dark:bg-blue-500/80'; // High
                                dropletColor = 'text-blue-500 dark:text-blue-500';
                            } else if (probability > 10) {
                                barColor = 'bg-blue-400/75 dark:bg-blue-400/75'; // Moderate
                                dropletColor = 'text-blue-400 dark:text-blue-400';
                            }

                            return (
                                <div
                                    key={index}
                                    className="flex flex-col items-center justify-end h-full"
                                    style={{ width: `${100 / sampledTimestamps.length}%` }}
                                >
                                    {probability > 10 && (
                                        <div className={`${dropletColor} absolute -top-2 transform -translate-x-0.5`}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-4"
                                                viewBox="0 0 24 24"
                                            >
                                                <defs>
                                                    <linearGradient id={`dropletGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                                                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d="M12 3.1L6.1 10.4c-2.5 3.1-2.1 7.6 0.8 10.3s7.8 2.9 11-0.1c3.1-3 3.4-7.9 0.6-11.2L12 3.1z"
                                                    fill={`url(#dropletGradient-${index})`}
                                                    strokeWidth="1"
                                                    stroke="currentColor"
                                                    strokeOpacity="0.8"
                                                />
                                                <path
                                                    d="M13.5 15c0 0.83-0.67 1.5-1.5 1.5s-1.5-0.67-1.5-1.5 0.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5z"
                                                    fill="white"
                                                    fillOpacity="0.7"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="w-10 sm:w-12 md:w-16 rounded-t flex justify-center">
                                        <div
                                            className={`w-full rounded-t ${barColor} ${probability <= 1 ? 'opacity-40' : 'shadow-lg'}`}
                                            style={{ height, minHeight: probability > 0 ? "4px" : "0" }}
                                            aria-label={`${probability}% chance at ${formatLocalTime(sampledTimestamps[index])}`}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Time labels */}
                <div
                    className="grid gap-x-0 text-center mt-1"
                    style={{ gridTemplateColumns: `repeat(${sampledTimestamps.length}, minmax(0, 1fr))` }}
                >
                    {sampledTimestamps.map((timestamp, index) => (
                        <div key={`time-${index}`} className="text-white/80 text-xs truncate px-0.5 font-medium">
                            {formatLocalTime(timestamp)}
                        </div>
                    ))}
                </div>

                {/* Percentage labels */}
                <div
                    className="grid gap-x-0 text-center mt-1"
                    style={{ gridTemplateColumns: `repeat(${sampledTimestamps.length}, minmax(0, 1fr))` }}
                >
                    {sampledProbabilities.map((probability, index) => (
                        <div
                            key={`prob-${index}`}
                            className={`text-xs font-medium truncate ${probability > 5 ? 'text-white' : 'text-white/50'}`}
                        >
                            {probability}%
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex justify-between items-center text-xs text-white/90">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Precipitation chance</span>
                </div>
                <div className="font-medium flex items-center">
                    <span className="text-sm">Avg:</span>
                    <span className="ml-1 text-blue-400 text-sm font-bold">{averagePrecipitation}%</span>
                </div>
            </div>
        </div>
    );
};

export default PrecipitationChart;