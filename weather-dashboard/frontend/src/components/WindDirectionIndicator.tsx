import React from 'react';

export interface WindDirectionIndicatorProps {
    direction: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Component to display a wind direction arrow
 * @param direction - Wind direction in degrees (0-360, where 0 is North)
 * @param className - Additional CSS classes
 * @param size - Size of the arrow (small, medium, large)
 */
const WindDirectionIndicator: React.FC<WindDirectionIndicatorProps> = ({
    direction,
    className = '',
    size = 'md'
}) => {
    // Function to get the cardinal direction text (N, NE, E, etc)
    const getCardinalDirection = (degrees: number): string => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(((degrees % 360) / 45)) % 8;
        return directions[index];
    };

    // Get size class
    const getSizeClass = (): string => {
        switch (size) {
            case 'sm': return 'text-xs';
            case 'md': return 'text-sm';
            case 'lg': return 'text-base';
            default: return 'text-sm';
        }
    };

    // This arrow points up by default (North, 0°)
    // We rotate it based on the direction (arrow points where wind is coming FROM)
    return (
        <span
            className={`inline-flex items-center justify-center ${getSizeClass()} ${className}`}
            title={`Wind from ${getCardinalDirection(direction)} (${Math.round(direction)}°)`}
            aria-label={`Wind direction: ${getCardinalDirection(direction)}`}
        >
            <span
                className="inline-block transform"
                style={{ transform: `rotate(${direction}deg)` }}
            >
                ↑
            </span>
            <span className="sr-only">{getCardinalDirection(direction)}</span>
        </span>
    );
};

export default WindDirectionIndicator;