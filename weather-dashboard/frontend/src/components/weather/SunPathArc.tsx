import React from 'react';

interface SunPathArcProps {
    progress: number; // 0-1 value representing current time between sunrise and sunset
    isDay: boolean; // Whether it's currently daytime
    className?: string;
}

/**
 * Component that visualizes the sun's path through the day with
 * a smooth curved path and animated sun
 */
const SunPathArc: React.FC<SunPathArcProps> = ({
    progress,
    isDay,
    className = '',
}) => {
    // Calculate sun position using a sine curve
    const getSunPosition = () => {
        // Convert progress (0-1) to an angle (0 to 180 degrees)
        const angle = progress * Math.PI;
        // Calculate y position using sine function (0 at edges, 1 at middle)
        const heightPercent = Math.sin(angle);

        return {
            x: `${progress * 100}%`,
            y: `${(1 - heightPercent) * 75}%`, // Invert height because 0,0 is top-left
        };
    };

    const sunPosition = getSunPosition();

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Sky background with gradient */}
            <div className="absolute inset-0 rounded-t-full overflow-hidden">
                <div className="w-full h-full relative">
                    {/* Day/Night sky */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-blue-600/50 opacity-70" />

                    {/* Horizon with silhouette */}
                    <div className="absolute bottom-0 w-full">
                        {/* Subtle horizon glow */}
                        <div className="h-6 w-full bg-gradient-to-t from-amber-300/30 to-transparent" />

                        {/* Terrain silhouette */}
                        <svg
                            className="w-full h-12 fill-gray-900/30"
                            viewBox="0 0 1000 120"
                            preserveAspectRatio="none"
                        >
                            <path d="M0,100 C50,80 100,90 150,70 C200,55 250,60 300,50 C350,40 400,30 450,40 C500,50 550,70 600,60 C650,50 700,30 750,40 C800,50 850,70 900,60 C950,50 980,70 1000,60 L1000,120 L0,120 Z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Sun path arc */}
            <div className="absolute inset-x-0 bottom-0 h-full overflow-hidden">
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {/* Subtle path for the sun */}
                    <path
                        d="M0,100 Q50,20 100,100"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />
                </svg>
            </div>

            {/* Sun or Moon */}
            <div
                className={`absolute w-10 h-10 rounded-full transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${isDay ? 'animate-sun-glow' : 'animate-moon-glow'
                    }`}
                style={{
                    left: sunPosition.x,
                    top: sunPosition.y,
                    background: isDay
                        ? 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,177,0,0.8) 100%)'
                        : 'radial-gradient(circle, rgba(240,240,240,1) 0%, rgba(210,210,210,0.8) 100%)',
                    boxShadow: isDay
                        ? '0 0 20px rgba(255, 177, 0, 0.8), 0 0 40px rgba(255, 177, 0, 0.4)'
                        : '0 0 20px rgba(210, 210, 210, 0.4), 0 0 40px rgba(210, 210, 210, 0.2)'
                }}
            />

            {/* Hour markers */}
            <div className="absolute bottom-0 w-full flex justify-between px-8">
                {[...Array(5)].map((_, i) => {
                    const percent = i / 4; // 0, 0.25, 0.5, 0.75, 1
                    return (
                        <div
                            key={i}
                            className="absolute bottom-0 flex flex-col items-center opacity-50"
                            style={{ left: `${percent * 100}%` }}
                        >
                            <div className="h-3 w-0.5 bg-white/50 mb-1"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SunPathArc;