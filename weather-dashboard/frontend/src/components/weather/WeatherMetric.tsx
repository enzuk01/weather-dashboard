import React, { ReactNode } from 'react';

interface WeatherMetricProps {
    label: string;
    value: string | number;
    unit?: string;
    icon?: ReactNode;
    className?: string;
    // Value between 0-100 for progress indicators
    progressValue?: number;
    // Custom color for progress indicator (tailwind classes)
    progressColor?: string;
    // Optional tooltip content
    tooltip?: string;
}

/**
 * A reusable component for displaying weather metrics like humidity, wind, etc.
 * with optional progress indicators and animations
 */
const WeatherMetric: React.FC<WeatherMetricProps> = ({
    label,
    value,
    unit = '',
    icon,
    className = '',
    progressValue,
    progressColor = 'bg-blue-500',
    tooltip,
}) => {
    // For circular progress visualization
    const circleSize = 60; // Size of the circle in pixels
    const strokeWidth = 6; // Width of the progress stroke
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke-dashoffset based on progress value
    const getStrokeDashoffset = () => {
        if (typeof progressValue !== 'number') return circumference;
        const progress = Math.min(100, Math.max(0, progressValue)); // Ensure between 0-100
        return circumference - (progress / 100) * circumference;
    };

    return (
        <div className={`flex flex-col items-center transition-all duration-300 p-2 hover:bg-white/5 rounded-lg ${className}`}
            title={tooltip}>
            <div className="text-white/70 text-sm font-medium mb-1">{label}</div>

            {progressValue !== undefined ? (
                // Circular progress indicator
                <div className="relative flex items-center justify-center w-16 h-16 mb-1">
                    <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={circleSize / 2}
                            cy={circleSize / 2}
                            r={radius}
                            strokeWidth={strokeWidth}
                            className="stroke-white/10 fill-transparent"
                        />
                        {/* Progress circle */}
                        <circle
                            cx={circleSize / 2}
                            cy={circleSize / 2}
                            r={radius}
                            strokeWidth={strokeWidth}
                            className={`fill-transparent ${progressColor} transition-all duration-500 ease-out`}
                            strokeDasharray={circumference}
                            strokeDashoffset={getStrokeDashoffset()}
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Value in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {icon && <span className="text-xl mr-1">{icon}</span>}
                        <span className="text-xl font-semibold text-white">{value}</span>
                        {unit && <span className="text-sm ml-0.5 text-white/80">{unit}</span>}
                    </div>
                </div>
            ) : (
                // Simple icon and value display
                <div className="flex items-center gap-2 mb-1">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <span className="text-2xl font-semibold text-white">
                        {value}
                        {unit && <span className="text-sm ml-0.5 text-white/80">{unit}</span>}
                    </span>
                </div>
            )}
        </div>
    );
};

export default WeatherMetric;