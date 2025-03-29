import React, { useState } from 'react';

interface TimeIndicatorProps {
    time: Date;
    label: string;
    position: 'left' | 'center' | 'right'; // Alignment
    highlight?: boolean; // Whether to visually highlight this indicator
    className?: string;
    showOnHover?: boolean; // Only show label on hover
}

/**
 * Component that shows time markers with labels for the daylight visualization
 */
const TimeIndicator: React.FC<TimeIndicatorProps> = ({
    time,
    label,
    position,
    highlight = false,
    className = '',
    showOnHover = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Format the time for display
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Determine alignment based on position
    const getAlignment = (): string => {
        switch (position) {
            case 'left': return 'items-start';
            case 'right': return 'items-end';
            default: return 'items-center';
        }
    };

    // Calculate offset to center the indicator correctly
    const getOffset = (): string => {
        switch (position) {
            case 'left': return 'translate-x-0';
            case 'right': return 'translate-x-0';
            default: return '-translate-x-1/2';
        }
    };

    const showLabel = !showOnHover || isHovered;

    return (
        <div
            className={`flex flex-col ${getAlignment()} transform ${getOffset()} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`w-0.5 h-4 mb-1 transition-all duration-200 ${highlight ? 'bg-white' : 'bg-amber-300/70'
                    } ${highlight ? 'h-6' : 'h-4'}`}
            ></div>

            <div className={`transition-all duration-300 ${showLabel ? 'opacity-100' : 'opacity-0'}`}>
                <div
                    className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap transition-all ${highlight
                        ? 'bg-white/20 text-white'
                        : 'text-amber-300/90'
                        }`}
                >
                    {label}
                </div>
                <div
                    className={`text-sm transition-all ${highlight ? 'text-white/90 font-medium' : 'text-amber-300/90'
                        }`}
                >
                    {formatTime(time)}
                </div>
            </div>
        </div>
    );
};

export default TimeIndicator;