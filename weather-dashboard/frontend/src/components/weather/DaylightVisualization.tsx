import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SunPathArc from './SunPathArc';
import TimeIndicator from './TimeIndicator';

interface DaylightVisualizationProps {
    sunrise: string; // ISO datetime string
    sunset: string;  // ISO datetime string
    currentTime?: string; // ISO datetime string (defaults to now)
    className?: string;
    interactive?: boolean;
}

/**
 * Enhanced visualization for sunrise, sunset and daylight information
 * with interactive elements and animations
 */
const DaylightVisualization: React.FC<DaylightVisualizationProps> = ({
    sunrise,
    sunset,
    currentTime = new Date().toISOString(),
    className = '',
    interactive = true,
}) => {
    const { isDark } = useTheme();
    // For interactive scrubbing
    const [previewTime, setPreviewTime] = useState<Date | null>(null);

    // Parse the time strings
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);
    const currentDate = new Date(currentTime);

    // The time to display (either current time or preview time when scrubbing)
    const displayTime = previewTime || currentDate;

    // Format times for display
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate the day length in hours
    const dayLengthHours = (sunsetDate.getTime() - sunriseDate.getTime()) / (1000 * 60 * 60);

    // Calculate the current position in the day cycle (0 to 1)
    const getProgress = (time: Date): number => {
        const now = time.getTime();
        const sunriseTime = sunriseDate.getTime();
        const sunsetTime = sunsetDate.getTime();

        // Before sunrise
        if (now < sunriseTime) return 0;

        // After sunset
        if (now > sunsetTime) return 1;

        // During daylight
        return (now - sunriseTime) / (sunsetTime - sunriseTime);
    };

    // Determine if it's currently day or night
    const isDaytime = (time: Date): boolean => {
        const now = time.getTime();
        return now >= sunriseDate.getTime() && now <= sunsetDate.getTime();
    };

    // Calculate the progress percentage
    const progress = getProgress(displayTime);
    const isDay = isDaytime(displayTime);

    // Calculate golden hour times (1 hour after sunrise and 1 hour before sunset)
    const morningGoldenHour = new Date(sunriseDate);
    morningGoldenHour.setHours(morningGoldenHour.getHours() + 1);

    const eveningGoldenHour = new Date(sunsetDate);
    eveningGoldenHour.setHours(eveningGoldenHour.getHours() - 1);

    // Handle interactive scrubbing
    const handleScrub = (clientX: number) => {
        if (!interactive) return;

        // Get the position relative to the container
        const arc = document.getElementById('sun-path-arc');
        if (!arc) return;

        const rect = arc.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;

        // Calculate time based on position
        const percent = Math.max(0, Math.min(1, x / width));
        const timeMs = sunriseDate.getTime() + percent * (sunsetDate.getTime() - sunriseDate.getTime());

        setPreviewTime(new Date(timeMs));
    };

    // Reset preview time when mouse leaves
    const handleMouseLeave = () => {
        setPreviewTime(null);
    };

    return (
        <div className={`${className} relative`}>
            <div
                id="sun-path-arc"
                className={`relative h-40 mb-4 ${interactive ? 'cursor-pointer' : ''}`}
                onMouseMove={interactive ? (e) => handleScrub(e.clientX) : undefined}
                onMouseLeave={interactive ? handleMouseLeave : undefined}
                onClick={interactive ? (e) => handleScrub(e.clientX) : undefined}
            >
                {/* Day/Night visualization */}
                <SunPathArc
                    progress={progress}
                    isDay={isDay}
                />

                {/* Time indicators */}
                <div className="absolute bottom-0 w-full flex justify-between px-4">
                    <TimeIndicator
                        time={sunriseDate}
                        label="Sunrise"
                        position="left"
                        highlight={displayTime.getTime() === sunriseDate.getTime()}
                    />

                    <TimeIndicator
                        time={sunsetDate}
                        label="Sunset"
                        position="right"
                        highlight={displayTime.getTime() === sunsetDate.getTime()}
                    />
                </div>

                {/* Current/Preview Time indicator */}
                <div
                    className="absolute bottom-0 transition-all duration-300"
                    style={{ left: `calc(${progress * 100}%)` }}
                >
                    <TimeIndicator
                        time={displayTime}
                        label={previewTime ? "Preview" : "Current"}
                        position="center"
                        highlight={true}
                    />
                </div>

                {/* Golden Hour indicators */}
                <div
                    className="absolute bottom-0 opacity-70"
                    style={{ left: `calc(${getProgress(morningGoldenHour) * 100}%)` }}
                >
                    <TimeIndicator
                        time={morningGoldenHour}
                        label="Morning Golden Hour"
                        position="center"
                        className="text-amber-300"
                        showOnHover
                    />
                </div>

                <div
                    className="absolute bottom-0 opacity-70"
                    style={{ left: `calc(${getProgress(eveningGoldenHour) * 100}%)` }}
                >
                    <TimeIndicator
                        time={eveningGoldenHour}
                        label="Evening Golden Hour"
                        position="center"
                        className="text-amber-300"
                        showOnHover
                    />
                </div>
            </div>

            {/* Daylight information */}
            <div className="flex justify-between text-white/80 text-sm">
                <div>
                    <span className="font-medium">Sunrise: </span>
                    {formatTime(sunriseDate)}
                </div>
                <div>
                    <span className="font-medium">Daylight: </span>
                    {dayLengthHours.toFixed(1)} hours
                </div>
                <div>
                    <span className="font-medium">Sunset: </span>
                    {formatTime(sunsetDate)}
                </div>
            </div>

            {/* Accessible text description (for screen readers) */}
            <div className="sr-only" role="status" aria-live="polite">
                The sun rose at {formatTime(sunriseDate)} and will set at {formatTime(sunsetDate)},
                giving {dayLengthHours.toFixed(1)} hours of daylight.
                {isDay
                    ? `It is currently daytime, ${formatTime(currentDate)}.`
                    : `It is currently nighttime, ${formatTime(currentDate)}.`
                }
            </div>
        </div>
    );
};

export default DaylightVisualization;