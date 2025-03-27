import React from 'react';
import WeatherBackground from '../WeatherBackground';

interface DashboardLayoutProps {
    children: React.ReactNode;
    weatherCondition: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';
    isDay: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    weatherCondition,
    isDay
}) => {
    return (
        <WeatherBackground condition={weatherCondition} isDay={isDay}>
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Sidebar - 3 columns on desktop */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Sidebar content will go here */}
                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-white">
                            <h3 className="text-xl font-semibold mb-3">Locations</h3>
                            <p className="text-white/70 text-sm">Select a location to view weather data.</p>
                        </div>
                    </div>

                    {/* Main content - 9 columns on desktop */}
                    <div className="md:col-span-9 space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </WeatherBackground>
    );
};

export default DashboardLayout;