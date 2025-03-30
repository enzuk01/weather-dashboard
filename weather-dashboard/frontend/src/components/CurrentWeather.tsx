import React from 'react';
import WeatherIcon from './WeatherIcon';
import GlassCard from './ui/GlassCard';
import { CurrentWeatherData, LocationData } from '../types/weatherTypes';

interface CurrentWeatherProps {
    data: CurrentWeatherData;
    location: LocationData;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, location }) => {
    // Format temperature with unit
    const formatTemp = (temp: number) => {
        return `${Math.round(temp)}°`;
    };

    // Format percentage
    const formatPercent = (value: number) => {
        return `${Math.round(value)}%`;
    };

    // Format wind
    const formatWind = (speed: number, direction: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
        const index = Math.round(direction / 45);
        return `${Math.round(speed)} km/h ${directions[index]}`;
    };

    return (
        <GlassCard className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {location.name}, {location.country}
                    </h2>

                    <div className="flex items-center mt-4">
                        <WeatherIcon
                            weatherCode={data.weather_code}
                            isDay={data.is_day === 1}
                            className="w-16 h-16 mr-4"
                        />
                        <div>
                            <div className="text-5xl font-bold text-white">
                                {formatTemp(data.temperature_2m)}
                            </div>
                            <div className="text-white/70">
                                Feels like {formatTemp(data.apparent_temperature || data.feels_like_temperature || data.temperature_2m)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Humidity</div>
                        <div className="text-white text-lg font-semibold">
                            {formatPercent(data.relative_humidity_2m)}
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Wind</div>
                        <div className="text-white text-lg font-semibold">
                            {formatWind(data.wind_speed_10m, data.wind_direction_10m)}
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Pressure</div>
                        <div className="text-white text-lg font-semibold">
                            {Math.round(data.surface_pressure)} hPa
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Precipitation</div>
                        <div className="text-white text-lg font-semibold">
                            {data.precipitation_probability !== undefined ?
                                formatPercent(data.precipitation_probability) :
                                (data.precipitation !== undefined ?
                                    `${data.precipitation} mm` : 'N/A')}
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CurrentWeather;