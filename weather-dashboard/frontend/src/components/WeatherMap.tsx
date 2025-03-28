import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { WeatherData } from '../types/weatherTypes';
import { useSettings } from '../contexts/SettingsContext';
import WeatherMapLayer from './WeatherMapLayer';
import 'leaflet/dist/leaflet.css';

interface WeatherMapProps {
    weatherData: WeatherData;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ weatherData }) => {
    const [selectedLayer, setSelectedLayer] = useState<'temperature' | 'precipitation' | 'wind' | 'clouds'>('temperature');
    const { temperatureUnit } = useSettings();

    const layerButtons = [
        { id: 'temperature', label: 'Temperature', icon: '🌡️' },
        { id: 'precipitation', label: 'Precipitation', icon: '🌧️' },
        { id: 'wind', label: 'Wind', icon: '💨' },
        { id: 'clouds', label: 'Clouds', icon: '☁️' }
    ] as const;

    return (
        <div className="w-full h-[400px] relative">
            {/* Layer controls */}
            <div className="absolute top-2 right-2 z-[1000] bg-white/90 dark:bg-gray-800/90 rounded-lg p-2 shadow-lg">
                <div className="flex flex-col gap-2">
                    {layerButtons.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedLayer(id)}
                            className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 transition-colors
                                ${selectedLayer === id
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Map */}
            <MapContainer
                center={[weatherData.location.latitude, weatherData.location.longitude]}
                zoom={10}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[weatherData.location.latitude, weatherData.location.longitude]}>
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-semibold">{weatherData.location.name}</h3>
                            <p className="text-sm text-gray-600">{weatherData.location.country}</p>
                        </div>
                    </Popup>
                </Marker>
                <WeatherMapLayer type={selectedLayer} />
            </MapContainer>
        </div>
    );
};

export default WeatherMap;