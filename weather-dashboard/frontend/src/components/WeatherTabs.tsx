import React, { useState } from 'react';
import HourlyForecastCards from './HourlyForecastCards';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import WeatherMap from './WeatherMap';
import DailyForecastCards from './DailyForecastCards';
import { WeatherData } from '../types/weatherTypes';

interface WeatherTabsProps {
    weatherData: WeatherData;
}

export const WeatherTabs: React.FC<WeatherTabsProps> = ({ weatherData }) => {
    const [activeTab, setActiveTab] = useState<'24h' | '7d'>('24h');

    return (
        <div className="mt-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={() => setActiveTab('24h')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === '24h'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                        }`}
                >
                    24-Hours
                </button>
                <button
                    onClick={() => setActiveTab('7d')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === '7d'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                        }`}
                >
                    7-Days
                </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === '24h' ? (
                    <>
                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">24-Hour Forecast</h2>
                            <HourlyForecastCards weatherData={weatherData} />
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">Precipitation</h2>
                            <PrecipitationChart weatherData={weatherData} />
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">Wind</h2>
                            <WindChart weatherData={weatherData} />
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">Weather Map</h2>
                            <WeatherMap location={weatherData.location} />
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
                        <DailyForecastCards weatherData={weatherData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherTabs;