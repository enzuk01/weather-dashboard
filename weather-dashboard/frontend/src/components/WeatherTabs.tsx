import React, { useState } from 'react';
import { WeatherData, LocationData } from '../types/weatherTypes';
import HourlyForecastCards from './HourlyForecastCards';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import WeatherMap from './WeatherMap';
import DailyForecastCards from './DailyForecastCards';

interface WeatherTabsProps {
    weatherData: WeatherData;
}

const WeatherTabs: React.FC<WeatherTabsProps> = ({ weatherData }) => {
    const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('hourly')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'hourly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-white/70 hover:bg-slate-700/70'
                        }`}
                >
                    24-Hour Forecast
                </button>
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'daily'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-white/70 hover:bg-slate-700/70'
                        }`}
                >
                    7-Day Forecast
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'hourly' ? (
                    <>
                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">24-Hour Forecast</h2>
                            <HourlyForecastCards
                                latitude={weatherData.location.latitude}
                                longitude={weatherData.location.longitude}
                            />
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">Precipitation</h2>
                            <PrecipitationChart
                                latitude={weatherData.location.latitude}
                                longitude={weatherData.location.longitude}
                            />
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">Wind</h2>
                            <WindChart
                                latitude={weatherData.location.latitude}
                                longitude={weatherData.location.longitude}
                            />
                        </div>

                        <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-4">Weather Map</h2>
                            <WeatherMap
                                latitude={weatherData.location.latitude}
                                longitude={weatherData.location.longitude}
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-800/40 rounded-xl p-4 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
                        <DailyForecastCards
                            latitude={weatherData.location.latitude}
                            longitude={weatherData.location.longitude}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherTabs;