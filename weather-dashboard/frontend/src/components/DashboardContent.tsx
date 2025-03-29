import React from 'react';
import { LocationData } from '../types/weatherTypes';
import CurrentWeatherDisplay from './CurrentWeatherDisplay';
import HourlyForecastCards from './HourlyForecastCards';
import WeatherMap from './WeatherMap';

interface DashboardContentProps {
    currentLocation: LocationData;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ currentLocation }) => {
    return (
        <div className="space-y-6">
            <CurrentWeatherDisplay
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HourlyForecastCards
                    latitude={currentLocation.latitude}
                    longitude={currentLocation.longitude}
                />
                <WeatherMap
                    latitude={currentLocation.latitude}
                    longitude={currentLocation.longitude}
                />
            </div>
        </div>
    );
};

export default DashboardContent;