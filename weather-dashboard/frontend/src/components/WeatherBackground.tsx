import React from 'react';
import clsx from 'clsx';

interface WeatherBackgroundProps {
    children: React.ReactNode;
    condition: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';
    isDay: boolean;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
    children,
    condition,
    isDay
}) => {
    // For now, use gradients instead of images since we don't have the actual background assets
    const getBgClass = () => {
        switch (condition) {
            case 'clear':
                return isDay
                    ? 'bg-gradient-to-b from-blue-400 to-blue-600'
                    : 'bg-gradient-to-b from-indigo-900 to-blue-950';
            case 'cloudy':
                return isDay
                    ? 'bg-gradient-to-b from-blue-300 to-gray-400'
                    : 'bg-gradient-to-b from-gray-800 to-gray-950';
            case 'rainy':
                return 'bg-gradient-to-b from-gray-500 to-gray-700';
            case 'snowy':
                return 'bg-gradient-to-b from-gray-200 to-blue-200';
            case 'foggy':
                return isDay
                    ? 'bg-gradient-to-b from-gray-300 to-gray-400'
                    : 'bg-gradient-to-b from-gray-700 to-gray-800';
            case 'stormy':
                return 'bg-gradient-to-b from-gray-700 to-gray-900';
            default:
                return isDay
                    ? 'bg-gradient-to-b from-blue-400 to-blue-600'
                    : 'bg-gradient-to-b from-indigo-900 to-blue-950';
        }
    };

    // Add weather effect elements
    const renderWeatherEffects = () => {
        switch (condition) {
            case 'rainy':
                return (
                    <div className="rain-animation absolute inset-0 pointer-events-none">
                        {/* Generate rain drops */}
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className="rain-drop"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random()}s`
                                }}
                            />
                        ))}
                    </div>
                );
            case 'snowy':
                return (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Generate snowflakes */}
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div
                                key={i}
                                className="snow-particle"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${3 + Math.random() * 5}s`
                                }}
                            />
                        ))}
                    </div>
                );
            case 'foggy':
                return (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className={clsx(
                'min-h-screen transition-colors duration-1000',
                getBgClass()
            )}>
                {renderWeatherEffects()}
                <div className="relative z-10 min-h-screen">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default WeatherBackground;