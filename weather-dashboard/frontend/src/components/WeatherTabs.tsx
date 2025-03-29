import React, { useState, useCallback, memo } from 'react';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import WeatherMap from './WeatherMap';
import DailyForecastCards from './DailyForecastCards';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import ErrorBoundary from './ErrorBoundary';
import HourlyForecastWithSunrise from './HourlyForecastWithSunrise';

interface WeatherTabsProps {
    latitude: number;
    longitude: number;
}

type TabType = '24hours' | '7days' | 'historical';

// Memoize tab content to prevent unnecessary re-renders
const HourlyTabContent = memo(({ latitude, longitude, isDark }: { latitude: number; longitude: number; isDark: boolean }) => (
    <>
        <ErrorBoundary>
            <HourlyForecastWithSunrise
                latitude={latitude}
                longitude={longitude}
            />
        </ErrorBoundary>

        <GlassCard className="p-3 md:p-4 w-full">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Precipitation</h2>
            <ErrorBoundary>
                <PrecipitationChart
                    latitude={latitude}
                    longitude={longitude}
                />
            </ErrorBoundary>
        </GlassCard>

        <GlassCard className="p-3 md:p-4 w-full">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Wind</h2>
            <ErrorBoundary>
                <WindChart
                    latitude={latitude}
                    longitude={longitude}
                />
            </ErrorBoundary>
        </GlassCard>

        <GlassCard className="p-3 md:p-4 w-full">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>Weather Map</h2>
            <ErrorBoundary>
                <WeatherMap
                    latitude={latitude}
                    longitude={longitude}
                />
            </ErrorBoundary>
        </GlassCard>
    </>
));

const DailyTabContent = memo(({ latitude, longitude, isDark }: { latitude: number; longitude: number; isDark: boolean }) => (
    <GlassCard className="p-3 md:p-4 w-full">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 md:mb-4`}>7-Day Forecast</h2>
        <ErrorBoundary>
            <DailyForecastCards
                latitude={latitude}
                longitude={longitude}
            />
        </ErrorBoundary>
    </GlassCard>
));

const HistoricalTabContent = memo(({ isDark }: { isDark: boolean }) => (
    <GlassCard className="p-3 md:p-4 w-full">
        <div className="flex flex-col items-center justify-center py-10">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>Historical Weather</h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Coming Soon!</p>
            <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-lg`}>
                We're working on historical weather data visualization. This feature will allow you to explore
                past weather patterns and compare them with current conditions.
            </p>
        </div>
    </GlassCard>
));

const WeatherTabs: React.FC<WeatherTabsProps> = ({ latitude, longitude }) => {
    const [activeTab, setActiveTab] = useState<TabType>('24hours');
    const { isDark } = useTheme();

    // Use useCallback to prevent unnecessary re-renders
    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => handleTabChange('24hours')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === '24hours'
                        ? `${isDark ? 'bg-gray-800 text-white' : 'bg-white text-blue-600'} border-b-2 border-blue-500`
                        : `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`
                        }`}
                    aria-selected={activeTab === '24hours'}
                    role="tab"
                >
                    24 Hours
                </button>
                <button
                    onClick={() => handleTabChange('7days')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === '7days'
                        ? `${isDark ? 'bg-gray-800 text-white' : 'bg-white text-blue-600'} border-b-2 border-blue-500`
                        : `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`
                        }`}
                    aria-selected={activeTab === '7days'}
                    role="tab"
                >
                    7 Days
                </button>
                <button
                    onClick={() => handleTabChange('historical')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'historical'
                        ? `${isDark ? 'bg-gray-800 text-white' : 'bg-white text-blue-600'} border-b-2 border-blue-500`
                        : `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`
                        }`}
                    aria-selected={activeTab === 'historical'}
                    role="tab"
                >
                    Historical
                </button>
            </div>

            <div className="space-y-4" role="tabpanel">
                {activeTab === '24hours' && <HourlyTabContent latitude={latitude} longitude={longitude} isDark={isDark} />}
                {activeTab === '7days' && <DailyTabContent latitude={latitude} longitude={longitude} isDark={isDark} />}
                {activeTab === 'historical' && <HistoricalTabContent isDark={isDark} />}
            </div>
        </div>
    );
};

export default WeatherTabs;