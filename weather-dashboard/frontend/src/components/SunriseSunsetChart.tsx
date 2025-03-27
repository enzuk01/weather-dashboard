import React from 'react';
import GlassCard from './ui/GlassCard';

interface SunriseSunsetChartProps {
    sunrise: string; // ISO datetime string
    sunset: string;  // ISO datetime string
    currentTime?: string; // ISO datetime string (defaults to now)
    className?: string;
}

const SunriseSunsetChart: React.FC<SunriseSunsetChartProps> = ({
    sunrise,
    sunset,
    currentTime = new Date().toISOString(),
    className = ''
}) => {
    // Parse the time strings
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);
    const currentDate = new Date(currentTime);

    // Format times for display
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate the day length in hours
    const dayLengthHours = (sunsetDate.getTime() - sunriseDate.getTime()) / (1000 * 60 * 60);

    // Calculate the current position in the day cycle (0 to 1)
    const getProgress = (): number => {
        const now = currentDate.getTime();
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
    const isDaytime = (): boolean => {
        const now = currentDate.getTime();
        return now >= sunriseDate.getTime() && now <= sunsetDate.getTime();
    };

    // Calculate the progress percentage
    const progress = getProgress();
    const isDay = isDaytime();

    return (
        <GlassCard className={`p-4 ${className}`}>
            <h3 className="text-xl font-semibold text-white mb-3">Daylight</h3>

            <div className="relative h-32 mb-4">
                {/* Day/Night Arc */}
                <div className="absolute inset-x-0 bottom-0 h-24 overflow-hidden">
                    <div className="w-full h-48 bg-gradient-to-b from-amber-300/50 to-indigo-900/70 rounded-t-full relative">
                        {/* Horizon Line */}
                        <div className="absolute bottom-0 w-full h-[1px] bg-white/30"></div>
                    </div>
                </div>

                {/* Sun or Moon Icon */}
                <div
                    className="absolute w-8 h-8 rounded-full"
                    style={{
                        left: `calc(${progress * 100}% - 16px)`,
                        bottom: isDay
                            ? `calc(12px + ${Math.sin(progress * Math.PI) * 64}px)`
                            : '12px',
                        background: isDay
                            ? 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,177,0,0.8) 100%)'
                            : 'radial-gradient(circle, rgba(240,240,240,1) 0%, rgba(210,210,210,0.8) 100%)',
                        boxShadow: isDay
                            ? '0 0 16px rgba(255, 177, 0, 0.6)'
                            : '0 0 16px rgba(210, 210, 210, 0.4)'
                    }}
                    aria-hidden="true"
                ></div>

                {/* Sunrise Marker */}
                <div className="absolute bottom-0 left-0 flex flex-col items-center">
                    <div className="w-[2px] h-4 bg-amber-300/70 mb-1"></div>
                    <div className="text-sm text-amber-300/90">
                        {formatTime(sunriseDate)}
                    </div>
                </div>

                {/* Sunset Marker */}
                <div className="absolute bottom-0 right-0 flex flex-col items-center">
                    <div className="w-[2px] h-4 bg-amber-300/70 mb-1"></div>
                    <div className="text-sm text-amber-300/90">
                        {formatTime(sunsetDate)}
                    </div>
                </div>

                {/* Current Time Marker */}
                <div
                    className="absolute bottom-0 flex flex-col items-center"
                    style={{ left: `${progress * 100}%` }}
                >
                    <div className="w-[2px] h-6 bg-white mb-1"></div>
                    <div className="text-sm text-white/90 font-medium">
                        {formatTime(currentDate)}
                    </div>
                </div>
            </div>

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
        </GlassCard>
    );
};

export default SunriseSunsetChart;