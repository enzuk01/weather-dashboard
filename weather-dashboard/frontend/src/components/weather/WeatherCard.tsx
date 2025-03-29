import React, { ReactNode } from 'react';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts/ThemeContext';

interface WeatherCardProps {
    title: string;
    className?: string;
    children: ReactNode;
    isLoading?: boolean;
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    backgroundGradient?: string;
    interactive?: boolean;
}

/**
 * A reusable weather card component that serves as the base container
 * for all weather information displays
 */
const WeatherCard: React.FC<WeatherCardProps> = ({
    title,
    className = '',
    children,
    isLoading = false,
    isError = false,
    errorMessage = 'Failed to load data',
    onRetry,
    backgroundGradient,
    interactive = true,
}) => {
    const { isDark } = useTheme();

    // Default gradients for day and night
    const defaultGradient = isDark
        ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/10'
        : 'bg-gradient-to-br from-blue-400/30 to-blue-300/10';

    const gradientClass = backgroundGradient || defaultGradient;

    // Determine hover effects based on interactive flag
    const hoverEffects = interactive
        ? 'transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1'
        : '';

    return (
        <GlassCard
            className={`p-6 relative overflow-hidden ${hoverEffects} ${className}`}
        >
            {/* Background gradient */}
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${gradientClass}`} />

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h2>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 mb-3"></div>
                        <div className="h-4 w-24 bg-white/20 rounded"></div>
                    </div>
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className="text-red-400 text-3xl mb-2">⚠️</div>
                    <p className="text-white/80 mb-3">{errorMessage}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-blue-600/70 hover:bg-blue-600 rounded-md text-white transition-colors"
                        >
                            Retry
                        </button>
                    )}
                </div>
            ) : (
                <div className="relative z-10">
                    {children}
                </div>
            )}
        </GlassCard>
    );
};

export default WeatherCard;