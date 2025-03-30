import React, { useMemo } from 'react';

interface ModernDaylightVisualizationProps {
    timestamps: string[];
    isDay: number[];
    className?: string;
    scrollOffset?: number;
}

/**
 * A component that visualizes daylight and nighttime hours across a forecast period
 * This modern version supports both number (0/1) and boolean (true/false) is_day values
 * and ensures smooth scrolling in sync with hourly forecast cards
 */
const ModernDaylightVisualization: React.FC<ModernDaylightVisualizationProps> = ({
    timestamps,
    isDay,
    className = '',
    scrollOffset = 0
}) => {
    // Normalize isDay values to ensure they're all 0 or 1
    const normalizedDayValues = useMemo(() => {
        return isDay.map(value => (value === 1 ? 1 : 0));
    }, [isDay]);

    // Calculate local times for better display
    const localTimes = useMemo(() => {
        return timestamps.map(timestamp => {
            const date = new Date(timestamp);
            return {
                hour: date.getHours(),
                minute: date.getMinutes(),
                formattedTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        });
    }, [timestamps]);

    // Find transitions between day and night
    const transitions = useMemo(() => {
        const result = [];
        for (let i = 1; i < normalizedDayValues.length; i++) {
            if (normalizedDayValues[i] !== normalizedDayValues[i - 1]) {
                result.push({
                    index: i,
                    time: localTimes[i].formattedTime,
                    type: normalizedDayValues[i] === 1 ? 'sunrise' : 'sunset',
                    percentage: (i / normalizedDayValues.length) * 100
                });
            }
        }
        return result;
    }, [normalizedDayValues, localTimes]);

    // Find current time index
    const currentTimeIndex = useMemo(() => {
        const now = new Date();
        let closestIndex = 0;
        let closestDiff = Infinity;

        timestamps.forEach((timestamp, index) => {
            const diff = Math.abs(now.getTime() - new Date(timestamp).getTime());
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = index;
            }
        });

        return closestIndex;
    }, [timestamps]);

    // Calculate scroll-adjusted position for elements
    const getScrollAdjustedStyle = (index: number) => {
        // Each hour card is approximately 82px wide (80px + margins)
        const cardWidth = 82;
        const adjustedLeft = (index * cardWidth) - scrollOffset;
        return { left: `${adjustedLeft}px` };
    };

    return (
        <div className={`relative h-16 w-full overflow-hidden rounded-lg ${className}`}>
            {/* Background gradient representing day/night */}
            <div className="absolute inset-0 flex">
                {normalizedDayValues.map((isDayValue, index) => (
                    <div
                        key={`bg-${index}`}
                        className={`h-full flex-1 ${isDayValue === 1
                                ? 'bg-gradient-to-b from-blue-400 to-blue-300'
                                : 'bg-gradient-to-b from-gray-900 to-indigo-900'
                            }`}
                    />
                ))}
            </div>

            {/* Sun/moon icons along the timeline */}
            <div className="absolute inset-0">
                {normalizedDayValues.map((isDayValue, index) => (
                    <div
                        key={`icon-${index}`}
                        className="absolute top-2"
                        style={getScrollAdjustedStyle(index)}
                    >
                        {isDayValue === 1 ? (
                            <div className="w-6 h-6 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50 flex items-center justify-center">
                                <span className="text-yellow-600">☀</span>
                            </div>
                        ) : (
                            <div className="w-6 h-6 bg-gray-700 rounded-full shadow-lg shadow-blue-900/50 flex items-center justify-center">
                                <span className="text-gray-300">☽</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Time markers at the bottom */}
            <div className="absolute bottom-0 inset-x-0 h-6 flex items-end">
                {localTimes.map((time, index) => (
                    <div
                        key={`time-${index}`}
                        className="absolute bottom-0"
                        style={getScrollAdjustedStyle(index)}
                    >
                        {index % 3 === 0 && (
                            <div className="text-xs font-medium text-white drop-shadow-md">
                                {time.hour}:00
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Sunrise/sunset labels */}
            {transitions.map((transition, index) => (
                <div
                    key={`transition-${index}`}
                    className="absolute"
                    style={{
                        ...getScrollAdjustedStyle(transition.index),
                        top: transition.type === 'sunrise' ? '4px' : '20px',
                    }}
                >
                    <div className="text-xs font-semibold text-white bg-black/40 px-1 rounded">
                        {transition.type === 'sunrise' ? '🌅 Sunrise' : '🌇 Sunset'}
                    </div>
                </div>
            ))}

            {/* Current time indicator */}
            <div
                className="absolute h-full w-0.5 bg-red-500 z-10"
                style={getScrollAdjustedStyle(currentTimeIndex)}
            >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            </div>
        </div>
    );
};

export default ModernDaylightVisualization;