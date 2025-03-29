import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HourlyForecastData } from '../../types/weatherTypes';
import ModernDaylightVisualization from './ModernDaylightVisualization';
import HourlyForecastCard from './HourlyForecastCard';
import { debounce } from '../../utils/debounce';
import { isSameDay, isSameHour } from '../../utils/dateUtils';

interface HourlyForecastWithSunriseProps {
    hourlyData: HourlyForecastData;
    className?: string;
    onError?: (error: Error) => void;
}

const HourlyForecastWithSunrise: React.FC<HourlyForecastWithSunriseProps> = ({
    hourlyData,
    className = '',
    onError
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [previewTime, setPreviewTime] = useState<Date | null>(null);

    // Handle scroll position changes from the visualization component
    const handleScrollPositionChange = useCallback((scrollDelta: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += scrollDelta * 88; // 88px = card width + gap
        }
    }, []);

    // Handle scroll to update preview time based on the scrolled position
    const handleScroll = debounce(() => {
        if (!scrollRef.current || !hourlyData?.timestamps) return;

        const scrollLeft = scrollRef.current.scrollLeft;
        const visibleWidth = scrollRef.current.clientWidth;

        // Calculate which timestamp is at the center of the visible area
        const centerPosition = scrollLeft + (visibleWidth / 2);
        const cardWidth = 80; // match the card width
        const cardGap = 8; // match the gap between cards

        // Calculate the index of the hour card at the center
        const hourIndex = Math.floor(centerPosition / (cardWidth + cardGap));

        // Set the preview time if we have a valid index
        if (hourIndex >= 0 && hourIndex < hourlyData.timestamps.length) {
            setPreviewTime(new Date(hourlyData.timestamps[hourIndex]));
        }
    }, 100);

    // Error boundary for data validation
    useEffect(() => {
        try {
            // Validate hourly data to catch errors early
            if (!hourlyData) {
                throw new Error("Hourly data is undefined");
            }

            if (!Array.isArray(hourlyData.timestamps) || hourlyData.timestamps.length === 0) {
                throw new Error("No timestamps available in hourly data");
            }

            // Check for critical arrays
            const requiredArrays = ['temperature_2m', 'precipitation_probability', 'weather_code'];
            for (const field of requiredArrays) {
                if (!Array.isArray(hourlyData[field as keyof HourlyForecastData])) {
                    throw new Error(`Missing required array: ${field}`);
                }
            }
        } catch (error) {
            console.error("Data validation error:", error);
            if (onError && error instanceof Error) {
                onError(error);
            }
        }
    }, [hourlyData, onError]);

    // Handle case when hourly data is not available or incomplete
    if (!hourlyData?.timestamps ||
        !hourlyData.temperature_2m ||
        !hourlyData.precipitation_probability ||
        !hourlyData.weather_code) {
        return (
            <div className={`${className} p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-center`}>
                <p>Hourly forecast data unavailable. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className={`${className} flex flex-col w-full`}>
            {/* Container with both visualization and forecast that scroll together */}
            <div className="overflow-x-auto" ref={scrollRef} onScroll={handleScroll}>
                <div className="inline-block min-w-full">
                    {/* Daylight visualization - must be in the scrollable container */}
                    <ModernDaylightVisualization
                        hourlyData={hourlyData}
                        previewTime={previewTime}
                        onScrollPositionChange={handleScrollPositionChange}
                    />

                    {/* Hourly forecast cards */}
                    <div className="flex gap-2 p-2 pb-3">
                        {hourlyData.timestamps.map((timestamp, index) => {
                            const date = new Date(timestamp);
                            const temp = hourlyData.temperature_2m[index];
                            const apparentTemp = hourlyData.feels_like_temperature?.[index] || hourlyData.apparent_temperature?.[index];
                            const precipProb = hourlyData.precipitation_probability[index];
                            const weatherCode = hourlyData.weather_code[index];

                            // Get is_day value - could be undefined, boolean, or number
                            let isDay: boolean | number = true;
                            if (hourlyData.is_day && Array.isArray(hourlyData.is_day) && index < hourlyData.is_day.length) {
                                isDay = hourlyData.is_day[index];
                            } else {
                                // Default to daytime if between 6am and 6pm
                                const hour = date.getHours();
                                isDay = (hour >= 6 && hour < 18) ? 1 : 0;
                            }

                            const now = new Date();
                            const isCurrentHour = isSameHour(date, now) && isSameDay(date, now);
                            const isPreview = previewTime ? isSameHour(date, previewTime) && isSameDay(date, previewTime) : false;

                            return (
                                <HourlyForecastCard
                                    key={timestamp}
                                    time={date}
                                    temperature={temp}
                                    apparentTemperature={apparentTemp}
                                    precipitationProbability={precipProb}
                                    weatherCode={weatherCode}
                                    isDay={isDay}
                                    isCurrentHour={isCurrentHour}
                                    isHighlighted={isPreview}
                                    onClick={() => setPreviewTime(date)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(HourlyForecastWithSunrise);