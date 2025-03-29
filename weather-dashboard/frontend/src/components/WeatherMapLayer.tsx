import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSettings } from '../contexts/SettingsContext';
import { fetchCurrentWeather } from '../services/weatherService';
import 'leaflet/dist/leaflet.css';

interface WeatherMapLayerProps {
    type: 'temperature' | 'precipitation' | 'wind' | 'clouds';
    timestamp?: string;
}

const WeatherMapLayer: React.FC<WeatherMapLayerProps> = ({ type }) => {
    const map = useMap();
    const { temperatureUnit } = useSettings();
    const [weatherData, setWeatherData] = useState<any>(null);

    // Define color scales and units for each type
    const scales = {
        temperature: {
            colors: ['#313695', '#4575B4', '#74ADD1', '#ABD9E9', '#E0F3F8', '#FFFFBF', '#FEE090', '#FDAE61', '#F46D43', '#D73027', '#A50026'],
            range: [-20, 40],
            unit: temperatureUnit === 'celsius' ? '°C' : '°F'
        },
        precipitation: {
            colors: ['#FFFFFF', '#C6DBEF', '#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#08519C', '#08306B'],
            range: [0, 50],
            unit: 'mm'
        },
        wind: {
            colors: ['#F7FCFD', '#E5F5F9', '#CCECE6', '#99D8C9', '#66C2A4', '#41AE76', '#238B45', '#006D2C', '#00441B'],
            range: [0, 100],
            unit: 'km/h'
        },
        clouds: {
            colors: ['#FFFFFF', '#F7F7F7', '#D9D9D9', '#BDBDBD', '#969696', '#737373', '#525252', '#252525'],
            range: [0, 100],
            unit: '%'
        }
    };

    // Function to get color based on value
    const getColor = (value: number, scale: typeof scales.temperature) => {
        const { range, colors } = scale;
        const normalizedValue = (value - range[0]) / (range[1] - range[0]);
        const index = Math.min(Math.floor(normalizedValue * (colors.length - 1)), colors.length - 1);
        return colors[Math.max(0, index)];
    };

    useEffect(() => {
        let layer: L.CircleMarker[] = [];
        const bounds = map.getBounds();
        const scale = scales[type];
        const zoom = map.getZoom();

        // Create a grid of points
        const createGrid = async () => {
            // Calculate grid density based on viewport size
            const viewportWidth = map.getSize().x;
            const viewportHeight = map.getSize().y;

            // Aim for roughly 20-30 points across the viewport
            const targetPoints = 25;
            const boundsWidth = bounds.getEast() - bounds.getWest();
            const boundsHeight = bounds.getNorth() - bounds.getSouth();

            const latStep = boundsHeight / targetPoints;
            const lonStep = boundsWidth / targetPoints;

            const points: [number, number][] = [];

            // Create grid with proper spacing
            for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += latStep) {
                for (let lon = bounds.getWest(); lon <= bounds.getEast(); lon += lonStep) {
                    points.push([lat, lon]);
                }
            }

            console.log(`Creating grid with ${points.length} points at zoom level ${zoom}`);

            try {
                // Fetch data for each point in smaller batches to avoid overwhelming the API
                const batchSize = 10;
                const batches = [];
                for (let i = 0; i < points.length; i += batchSize) {
                    const batch = points.slice(i, i + batchSize);
                    const batchPromises = batch.map(([lat, lon]) => fetchCurrentWeather(lat, lon));
                    batches.push(Promise.all(batchPromises));
                }

                const batchResults = await Promise.all(batches);
                const results = batchResults.flat();

                // Log sample values for debugging
                console.log('Sample weather values:', results.slice(0, 5).map((data, i) => {
                    const [lat, lon] = points[i];
                    return {
                        location: [lat.toFixed(2), lon.toFixed(2)],
                        value: type === 'temperature' ? data.temperature_2m :
                            type === 'precipitation' ? data.precipitation :
                                type === 'wind' ? data.wind_speed_10m :
                                    data.cloud_cover
                    };
                }));

                // Create circle markers for each point
                results.forEach((data, index) => {
                    const [lat, lon] = points[index];
                    let value: number;

                    switch (type) {
                        case 'temperature':
                            value = data.temperature_2m;
                            break;
                        case 'precipitation':
                            value = data.precipitation;
                            break;
                        case 'wind':
                            value = data.wind_speed_10m;
                            break;
                        case 'clouds':
                            value = data.cloud_cover ?? 0;
                            break;
                        default:
                            return;
                    }

                    // Create circle with size based on viewport
                    const baseRadius = Math.min(viewportWidth, viewportHeight) / (targetPoints * 2);
                    const circle = L.circleMarker([lat, lon], {
                        radius: baseRadius,
                        fillColor: getColor(value, scale),
                        color: 'transparent',
                        fillOpacity: 0.7,
                        className: 'weather-point'
                    }).bindPopup(`${type}: ${value.toFixed(1)}${scale.unit}<br>Location: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);

                    circle.addTo(map);
                    layer.push(circle);
                });

                // Add CSS for hover effect
                const style = document.createElement('style');
                style.textContent = `
                    .weather-point {
                        transition: all 0.3s ease;
                        filter: blur(8px);
                    }
                    .weather-point:hover {
                        transform: scale(1.1);
                        z-index: 1000 !important;
                        filter: blur(2px);
                    }
                `;
                document.head.appendChild(style);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        // Create a custom legend control
        const legend = new L.Control({ position: 'bottomright' });

        legend.onAdd = (map: L.Map) => {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            div.style.padding = '10px';
            div.style.borderRadius = '5px';
            div.style.border = '1px solid rgba(0, 0, 0, 0.2)';

            const range = scale.range;
            const step = (range[1] - range[0]) / (scale.colors.length - 1);

            div.innerHTML = '<div style="margin-bottom: 5px"><strong>' + type.charAt(0).toUpperCase() + type.slice(1) + '</strong></div>';
            div.innerHTML += '<div style="font-size: 0.8em; margin-bottom: 8px">Weather data points</div>';

            // Create color boxes
            for (let i = 0; i < scale.colors.length; i++) {
                const value = range[0] + (i * step);
                div.innerHTML +=
                    '<div style="display: flex; align-items: center; margin: 2px 0;">' +
                    '<div style="background:' + scale.colors[i] + '; width: 20px; height: 20px; margin-right: 5px;"></div>' +
                    '<span>' + Math.round(value) + scale.unit + '</span>' +
                    '</div>';
            }

            return div;
        };

        // Add the legend to the map
        legend.addTo(map);

        // Create the initial grid
        createGrid();

        // Update grid when map moves or zooms
        const updateLayer = () => {
            // Remove old markers
            layer.forEach(marker => marker.remove());
            layer = [];
            // Create new grid
            createGrid();
        };

        map.on('moveend', updateLayer);
        map.on('zoomend', updateLayer);

        // Cleanup function
        return () => {
            layer.forEach(marker => marker.remove());
            legend.remove();
            map.off('moveend', updateLayer);
            map.off('zoomend', updateLayer);
        };
    }, [map, type, temperatureUnit]);

    return null;
};

export default WeatherMapLayer;