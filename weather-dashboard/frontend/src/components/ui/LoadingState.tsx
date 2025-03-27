import React from 'react';
import GlassCard from './GlassCard';

type LoadingSize = 'small' | 'medium' | 'large';
type LoadingType = 'spinner' | 'dots' | 'skeleton';

interface LoadingStateProps {
    size?: LoadingSize;
    type?: LoadingType;
    message?: string;
    fullHeight?: boolean;
    className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    size = 'medium',
    type = 'spinner',
    message = 'Loading...',
    fullHeight = false,
    className = '',
}) => {
    // Size mappings
    const sizeClasses = {
        small: {
            container: 'h-16',
            spinner: 'h-5 w-5',
            dot: 'h-2 w-2',
            text: 'text-sm',
        },
        medium: {
            container: 'h-24',
            spinner: 'h-8 w-8',
            dot: 'h-3 w-3',
            text: 'text-base',
        },
        large: {
            container: 'h-40',
            spinner: 'h-12 w-12',
            dot: 'h-4 w-4',
            text: 'text-lg',
        },
    };

    // Create a unique ID for ARIA labeling
    const loadingId = `loading-${Math.random().toString(36).substring(2, 9)}`;

    // Spinner loading indicator
    const renderSpinner = () => (
        <div
            className={`animate-spin ${sizeClasses[size].spinner} text-white`}
            role="progressbar"
            aria-labelledby={loadingId}
        >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
        </div>
    );

    // Dots loading indicator
    const renderDots = () => (
        <div
            className="flex space-x-2"
            role="progressbar"
            aria-labelledby={loadingId}
        >
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={`${sizeClasses[size].dot} bg-white rounded-full animate-pulse`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                ></div>
            ))}
        </div>
    );

    // Skeleton loading
    const renderSkeleton = () => (
        <div
            className="w-full space-y-2"
            role="progressbar"
            aria-labelledby={loadingId}
        >
            <div className="h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
        </div>
    );

    const renderLoadingIndicator = () => {
        switch (type) {
            case 'dots':
                return renderDots();
            case 'skeleton':
                return renderSkeleton();
            case 'spinner':
            default:
                return renderSpinner();
        }
    };

    return (
        <GlassCard className={`p-4 ${fullHeight ? 'h-full' : ''} ${className}`}>
            <div
                className={`flex flex-col items-center justify-center ${sizeClasses[size].container}`}
                aria-busy="true"
            >
                {renderLoadingIndicator()}

                {message && (
                    <p
                        id={loadingId}
                        className={`mt-3 text-white/80 ${sizeClasses[size].text}`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </GlassCard>
    );
};

export default LoadingState;