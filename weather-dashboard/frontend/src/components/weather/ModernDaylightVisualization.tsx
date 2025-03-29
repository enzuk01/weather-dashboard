import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { HourlyForecastData } from '../../types/weatherTypes';
import { debounce } from '../../utils/debounce';

interface ModernDaylightVisualizationProps {
    hourlyData: HourlyForecastData;
    onScrollPositionChange?: (position: number) => void;
    previewTime?: Date | null;
    internalPreviewTime?: Date | null;
    className?: string;
    interactive?: boolean;
}

/**
 * Enhanced modernized visualization for daylight cycle that shows all 24 hours
 * and aligns perfectly with the hourly forecast below it
 */
const ModernDaylightVisualization: React.FC<ModernDaylightVisualizationProps> = memo(({
    hourlyData,
    onScrollPositionChange,
    previewTime,
    internalPreviewTime,
    className = '',
    interactive = true,
}) => {
    const { isDark } = useTheme();
    const [sunriseIndex, setSunriseIndex] = useState<number | null>(null);
    const [sunsetIndex, setSunsetIndex] = useState<number | null>(null);
    const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);

    const timeArray = useMemo(() => {
        if (!hourlyData?.timestamps) return [];
        return hourlyData.timestamps.map(timestamp => new Date(timestamp));
    }, [hourlyData?.timestamps]);

    // Calculate positions based on sunrise, sunset, and current time
    useEffect(() => {
        if (!timeArray.length) return;

        // Find the accurate sunrise and sunset indices by matching hours directly
        const sunriseHours: number[] = [];
        const sunsetHours: number[] = [];

        // Safely normalize is_day values - convert any format to number[] (1 or 0)
        const normalizeIsDayValues = () => {
            if (!hourlyData.is_day || !Array.isArray(hourlyData.is_day)) {
                // If is_day is missing or not an array, use 6am-6pm as default daylight hours
                return timeArray.map(time => {
                    const hour = time.getHours();
                    return (hour >= 6 && hour < 18) ? 1 : 0;
                });
            }

            // Convert boolean values to numbers if needed
            return hourlyData.is_day.map(value => {
                if (typeof value === 'boolean') {
                    return value ? 1 : 0;
                }
                return value === 1 ? 1 : 0; // Ensure it's 1 or 0
            });
        };

        const isDayValues = normalizeIsDayValues();

        // Extract sunrise/sunset hours from the data if available
        if (isDayValues.length > 0) {
            let lastValue = isDayValues[0];
            isDayValues.forEach((isDayValue, index) => {
                // Only process if we have valid timestamps
                if (index < hourlyData.timestamps.length) {
                    if (lastValue === 0 && isDayValue === 1) {
                        // Transition from night to day = sunrise
                        sunriseHours.push(new Date(hourlyData.timestamps[index]).getHours());
                    } else if (lastValue === 1 && isDayValue === 0) {
                        // Transition from day to night = sunset
                        sunsetHours.push(new Date(hourlyData.timestamps[index]).getHours());
                    }
                    lastValue = isDayValue;
                }
            });
        }

        // Use the first sunrise/sunset hour found, or use defaults if not found
        let sunriseHour = sunriseHours.length > 0 ? sunriseHours[0] : 6; // Default to 6 AM
        let sunsetHour = sunsetHours.length > 0 ? sunsetHours[0] : 19; // Default to 7 PM

        // Find indices with matching hours
        let foundSunriseIndex = null;
        let foundSunsetIndex = null;

        // Find the exact matching hours
        for (let i = 0; i < timeArray.length; i++) {
            const hour = timeArray[i].getHours();
            if (hour === sunriseHour && foundSunriseIndex === null) {
                foundSunriseIndex = i;
            }
            if (hour === sunsetHour && foundSunsetIndex === null) {
                foundSunsetIndex = i;
            }
        }

        // Validate that sunrise comes before sunset within our time period
        if (foundSunriseIndex !== null && foundSunsetIndex !== null) {
            if (foundSunriseIndex > foundSunsetIndex) {
                // If sunset appears to come before sunrise, it means we're crossing midnight
                // For simplicity, we'll just use default positions in this case
                foundSunriseIndex = Math.floor(timeArray.length * 0.25); // 1/4 through the time range
                foundSunsetIndex = Math.floor(timeArray.length * 0.75); // 3/4 through the time range
            }
        } else {
            // If we couldn't find exact matches, use reasonable defaults
            foundSunriseIndex = Math.floor(timeArray.length * 0.25);
            foundSunsetIndex = Math.floor(timeArray.length * 0.75);
        }

        setSunriseIndex(foundSunriseIndex);
        setSunsetIndex(foundSunsetIndex);

        // Find current hour index
        const now = new Date();
        const currentHourIdx = timeArray.findIndex(
            (time) => time.getHours() === now.getHours() && time.getDate() === now.getDate()
        );
        setCurrentHourIndex(currentHourIdx >= 0 ? currentHourIdx : null);
    }, [timeArray, hourlyData]);

    // Calculate positions for elements
    const calculatePosition = useCallback((index: number | null): number => {
        if (index === null || timeArray.length === 0) return 0;
        // Ensure the position is within the width of the container
        return (index / (timeArray.length - 1)) * 100;
    }, [timeArray.length]);

    // Get current visualization time
    const effectivePreviewTime = useMemo(() => {
        if (previewTime) return previewTime;
        if (internalPreviewTime) return internalPreviewTime;
        return new Date();
    }, [previewTime, internalPreviewTime]);

    // Find the current highlighted hour index
    const highlightedHourIndex = useMemo(() => {
        if (!timeArray.length) return null;
        return timeArray.findIndex(
            (time) =>
                time.getHours() === effectivePreviewTime.getHours() &&
                time.getDate() === effectivePreviewTime.getDate()
        );
    }, [timeArray, effectivePreviewTime]);

    // Calculate sun position using a sine wave
    const calculateSunPosition = useMemo(() => {
        if (sunriseIndex === null || sunsetIndex === null || timeArray.length === 0) {
            return { top: 50, left: 50 };
        }

        // For highlighted time position
        let positionIndex = highlightedHourIndex !== null ? highlightedHourIndex : currentHourIndex;
        if (positionIndex === null) {
            // Default to middle of daylight hours if no highlighted position
            positionIndex = Math.floor((sunriseIndex + sunsetIndex) / 2);
        }

        // Ensure position is within the day
        if (positionIndex < sunriseIndex) positionIndex = sunriseIndex;
        if (positionIndex > sunsetIndex) positionIndex = sunsetIndex;

        // Progress through the day (0 at sunrise, 1 at sunset)
        const dayProgress = (positionIndex - sunriseIndex) / (sunsetIndex - sunriseIndex);

        // Calculate position using a sine wave for a natural arc
        const left = calculatePosition(positionIndex);
        const top = 50 - Math.sin(dayProgress * Math.PI) * 40; // 40 is the amplitude

        return { top, left };
    }, [sunriseIndex, sunsetIndex, currentHourIndex, highlightedHourIndex, calculatePosition, timeArray.length]);

    // Calculate moon position (opposite to sun)
    const calculateMoonPosition = useMemo(() => {
        if (sunriseIndex === null || sunsetIndex === null || timeArray.length === 0) {
            return { top: 50, left: 50 };
        }

        // Moon appears in the middle of the night
        let moonIndex: number;

        // If sunset is later in our time array than sunrise, moon is in the middle between sunset and end + start and sunrise
        if (sunsetIndex > sunriseIndex) {
            // Calculate middle of night considering array wrapping
            const totalNightHours = (timeArray.length - sunsetIndex) + sunriseIndex;
            const halfNightHours = Math.floor(totalNightHours / 2);

            // Determine if the midnight point is after sunset or before sunrise
            if (sunsetIndex + halfNightHours < timeArray.length) {
                moonIndex = sunsetIndex + halfNightHours;
            } else {
                moonIndex = (sunsetIndex + halfNightHours) - timeArray.length;
            }
        } else {
            // If our time array doesn't include a full day/night cycle, position moon at middle of window
            moonIndex = Math.floor(timeArray.length / 2);
        }

        const left = calculatePosition(moonIndex);
        const top = 30; // Higher in the sky than the sun's lowest point

        return { top, left };
    }, [sunriseIndex, sunsetIndex, calculatePosition, timeArray.length]);

    // Handle wheel event for horizontal scrolling
    const handleWheel = debounce((e: React.WheelEvent) => {
        if (e.deltaY !== 0 && onScrollPositionChange) {
            const scrollAmount = e.deltaY > 0 ? 1 : -1;
            onScrollPositionChange(scrollAmount);
        }
    }, 50);

    // Style for the daylight section based on sunrise and sunset indices
    const daylightStyle = useMemo(() => {
        if (sunriseIndex === null || sunsetIndex === null || timeArray.length === 0) {
            return { left: '25%', width: '50%' };
        }

        const left = calculatePosition(sunriseIndex);
        const right = calculatePosition(sunsetIndex);
        const width = right - left;

        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    }, [sunriseIndex, sunsetIndex, calculatePosition, timeArray.length]);

    // Render the hour markers evenly spaced
    const renderHourMarkers = useMemo(() => {
        if (!timeArray.length) return null;

        return timeArray.map((time, index) => {
            const isHighlighted = highlightedHourIndex === index ||
                (highlightedHourIndex === null && currentHourIndex === index);

            const position = calculatePosition(index);

            return (
                <div
                    key={`hour-${index}`}
                    className={`absolute bottom-0 w-0.5 h-2 bg-white/60 transform -translate-x-1/2 ${isHighlighted ? 'h-3 bg-white/90' : ''
                        }`}
                    style={{ left: `${position}%` }}
                />
            );
        });
    }, [timeArray, highlightedHourIndex, currentHourIndex, calculatePosition]);

    return (
        <div
            className={`${className} relative h-20 rounded-t-lg overflow-hidden`}
            onWheel={handleWheel}
        >
            {/* Night sky background with stars */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-[#0a1033] flex items-center justify-center">
                <div className="absolute inset-0">
                    {/* Stars - random dots */}
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={`star-${i}`}
                            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.7 + 0.3,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Daylight section */}
            <div
                className="absolute h-full bg-gradient-to-t from-blue-400 to-blue-600 opacity-90"
                style={daylightStyle}
            />

            {/* Sun and moon positions */}
            <div
                className="absolute w-4 h-4 bg-yellow-300 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: `${calculateSunPosition.top}%`, left: `${calculateSunPosition.left}%` }}
            >
                <div className="absolute inset-0 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
            </div>

            <div
                className="absolute w-3 h-3 bg-gray-100 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: `${calculateMoonPosition.top}%`, left: `${calculateMoonPosition.left}%` }}
            >
                <div className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 bg-[#0a1033] rounded-full" />
            </div>

            {/* Hour markers */}
            <div className="absolute bottom-0 w-full">
                {renderHourMarkers}
            </div>

            {/* Debug info - uncomment when troubleshooting */}
            {/* <div className="absolute bottom-0 left-0 text-xs text-white bg-black/50 p-1 z-20">
                SR: {sunriseIndex !== null ? new Date(timeArray[sunriseIndex]).getHours() : 'N/A'}:00,
                SS: {sunsetIndex !== null ? new Date(timeArray[sunsetIndex]).getHours() : 'N/A'}:00
            </div> */}
        </div>
    );
});

export default ModernDaylightVisualization;