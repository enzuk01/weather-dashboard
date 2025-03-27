import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSettings } from '../contexts/SettingsContext';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherMapLayer from './WeatherMapLayer';

// Fix for default marker icon issue in react-leaflet
const defaultIcon = L.icon({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface WeatherMapProps {
    latitude: number;
    longitude: number;
    className?: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({
    latitude,
    longitude,
    className = ''
}) => {
    const { temperatureUnit } = useSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLayer, setActiveLayer] = useState<'temperature' | 'precipitation' | 'wind' | 'clouds'>('temperature');

    const layerOptions = [
        { value: 'temperature', label: 'Temperature' },
        { value: 'precipitation', label: 'Precipitation' },
        { value: 'wind', label: 'Wind' },
        { value: 'clouds', label: 'Clouds' }
    ] as const;

    if (loading) {
        return (
            <GlassCard className={`p-4 ${className}`}>
                <LoadingState message="Loading weather map..." />
            </GlassCard>
        );
    }

    if (error) {
        return (
            <GlassCard className={`p-4 ${className}`}>
                <ErrorState message={error} retryAction={() => window.location.reload()} />
            </GlassCard>
        );
    }

    return (
        <GlassCard className={`p-4 ${className}`}>
            <h2 className="text-xl font-semibold mb-4 text-white">Weather Map</h2>
            <div className="mb-4">
                <div className="flex gap-2">
                    {layerOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setActiveLayer(option.value)}
                            className={`px-3 py-1 rounded-lg text-sm ${activeLayer === option.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <MapContainer
                    center={[latitude, longitude]}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <WeatherMapLayer type={activeLayer} />
                    <Marker position={[latitude, longitude]} icon={defaultIcon}>
                        <Popup>
                            Selected Location
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </GlassCard>
    );
};

export default WeatherMap;