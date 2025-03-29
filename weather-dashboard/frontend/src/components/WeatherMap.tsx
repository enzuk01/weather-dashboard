import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSettings } from '../contexts/SettingsContext';
import GlassCard from './ui/GlassCard';
import LoadingState from './ui/LoadingState';
import ErrorState from './ui/ErrorState';
import WeatherMapLayer from './WeatherMapLayer';
import { useMap } from 'react-leaflet';
import { fetchCurrentWeather } from '../services/weatherService';
import { LocationData } from '../types/weatherTypes';

// Create a simple marker icon using a div
const createCustomIcon = (): L.DivIcon => {
    const div = document.createElement('div');
    div.className = 'custom-marker';
    div.style.width = '20px';
    div.style.height = '20px';
    div.style.backgroundColor = '#FF0000';
    div.style.borderRadius = '50%';
    div.style.border = '2px solid white';
    div.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    return L.divIcon({
        html: div.outerHTML,
        className: 'custom-marker-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

// Set up the default icon
const defaultIcon = createCustomIcon();
L.Marker.prototype.options.icon = defaultIcon;

interface WeatherMapProps {
    latitude: number;
    longitude: number;
}

type LayerType = 'temperature' | 'precipitation' | 'wind' | 'clouds';

const WeatherMap: React.FC<WeatherMapProps> = ({ latitude, longitude }) => {
    const { temperatureUnit } = useSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLayer, setActiveLayer] = useState<LayerType>('temperature');
    const [isMapReady, setIsMapReady] = useState(false);

    const layerOptions: Array<{ value: LayerType; label: string }> = [
        { value: 'temperature', label: 'Temperature' },
        { value: 'precipitation', label: 'Precipitation' },
        { value: 'wind', label: 'Wind' },
        { value: 'clouds', label: 'Clouds' }
    ];

    useEffect(() => {
        // Add CSS for map container
        const style = document.createElement('style');
        style.textContent = `
            .leaflet-container {
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .custom-marker-icon {
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (loading) {
        return (
            <GlassCard className={`p-4`}>
                <LoadingState message="Loading weather map..." />
            </GlassCard>
        );
    }

    if (error) {
        return (
            <GlassCard className={`p-4`}>
                <ErrorState message={error} retryAction={() => window.location.reload()} />
            </GlassCard>
        );
    }

    return (
        <GlassCard className={`p-4`}>
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
                    whenReady={() => setIsMapReady(true)}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {isMapReady && <WeatherMapLayer type={activeLayer} />}
                    <Marker position={[latitude, longitude]}>
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