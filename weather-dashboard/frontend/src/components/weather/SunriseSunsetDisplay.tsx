import React, { useState, useEffect } from 'react';
import { fetchHourlyForecast } from '../../services/weatherService';
import { HourlyForecastData } from '../../types/weatherTypes';
import WeatherCard from './WeatherCard';
import DaylightVisualization from './DaylightVisualization';

interface SunriseSunsetDisplayProps {
    latitude: number;
    longitude: number;
    className?: string;
}

/**
 * Enhanced display for sunrise and sunset information with interactive
 * visualization and animations
 */
const SunriseSunsetDisplay: React.FC<SunriseSunsetDisplayProps> = ({
    latitude,
    longitude,
    className = '',
}) => {
    const [hourlyData, setHourlyData] = useState<HourlyForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Use 24 hours for a full day cycle
                const data = await fetchHourlyForecast(latitude, longitude, 24);
                setHourlyData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching hourly forecast:', err);
                setError('Failed to load sunrise/sunset data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [latitude, longitude]);

    // Extract sunrise and sunset times from the hourly data
    // In a real implementation, these would come from a specific API endpoint
    // Here we're approximating based on hourly data
    const getSunriseSunsetData = () => {
        if (!hourlyData || hourlyData.timestamps.length < 24) {
            return null;
        }

        // Approximate sunrise and sunset times (this is a simplification)
        // In a real app, these would come directly from the API
        return {
            sunrise: hourlyData.timestamps[6], // Approximate sunrise time (6 AM)
            sunset: hourlyData.timestamps[18], // Approximate sunset time (6 PM)
            currentTime: new Date().toISOString()
        };
    };

    const sunriseSunsetData = getSunriseSunsetData();

    return (
        <WeatherCard
            title="Sunrise & Sunset"
            className={className}
            isLoading={loading}
            isError={!!error}
            errorMessage={error || 'Failed to load sunrise and sunset data'}
            backgroundGradient="bg-gradient-to-br from-blue-800/30 to-purple-800/20"
        >
            {sunriseSunsetData && (
                <DaylightVisualization
                    sunrise={sunriseSunsetData.sunrise}
                    sunset={sunriseSunsetData.sunset}
                    currentTime={sunriseSunsetData.currentTime}
                    interactive={true}
                />
            )}
        </WeatherCard>
    );
};

export default SunriseSunsetDisplay;