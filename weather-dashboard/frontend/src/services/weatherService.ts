import { API } from '../config/api';
import {
    CurrentWeatherData,
    HourlyForecastData,
    DailyForecastData,
    LocationData
} from '../types/weatherTypes';

// Legacy location interface for backward compatibility
export interface Location {
    name: string;
    country: string;
    lat: number;
    lon: number;
}

// Common fields for legacy weather data
interface BaseWeatherData {
    timestamp: number;
    date: string;
    time: string;
}

// Legacy ForecastData structure to maintain compatibility
export interface ForecastData extends BaseWeatherData {
    hour: number;
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    description: string;
    icon: string;
    is_day: number | boolean;
    precipitation: number;
}

// Cache management
const memoryCache = new Map();
const CACHE_BUSTER = Date.now().toString();

const getCacheKey = (endpoint: string, lat: number, lon: number) => {
    return `${endpoint}_${lat.toFixed(4)}_${lon.toFixed(4)}_${CACHE_BUSTER}`;
};

const isCacheValid = (cacheTime: number, ttl: number) => {
    return Date.now() - cacheTime < ttl;
};

// Utility functions
const buildApiUrl = (endpoint: string) => `${API.BASE_URL}${endpoint}`;

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
};

// Weather code mapping for icon and description
export const fetchWeatherCodes = () => {
    return {
        0: { description: "Clear sky", icon: "clear" },
        1: { description: "Mainly clear", icon: "mainly-clear" },
        2: { description: "Partly cloudy", icon: "partly-cloudy" },
        3: { description: "Overcast", icon: "cloudy" },
        45: { description: "Fog", icon: "fog" },
        48: { description: "Depositing rime fog", icon: "fog" },
        51: { description: "Light drizzle", icon: "drizzle" },
        53: { description: "Moderate drizzle", icon: "drizzle" },
        55: { description: "Dense drizzle", icon: "drizzle" },
        56: { description: "Light freezing drizzle", icon: "freezing-drizzle" },
        57: { description: "Dense freezing drizzle", icon: "freezing-drizzle" },
        61: { description: "Slight rain", icon: "rain" },
        63: { description: "Moderate rain", icon: "rain" },
        65: { description: "Heavy rain", icon: "heavy-rain" },
        66: { description: "Light freezing rain", icon: "freezing-rain" },
        67: { description: "Heavy freezing rain", icon: "freezing-rain" },
        71: { description: "Slight snow fall", icon: "snow" },
        73: { description: "Moderate snow fall", icon: "snow" },
        75: { description: "Heavy snow fall", icon: "heavy-snow" },
        77: { description: "Snow grains", icon: "snow-grains" },
        80: { description: "Slight rain showers", icon: "rain-showers" },
        81: { description: "Moderate rain showers", icon: "rain-showers" },
        82: { description: "Violent rain showers", icon: "heavy-rain-showers" },
        85: { description: "Slight snow showers", icon: "snow-showers" },
        86: { description: "Heavy snow showers", icon: "heavy-snow-showers" },
        95: { description: "Thunderstorm", icon: "thunderstorm" },
        96: { description: "Thunderstorm with slight hail", icon: "thunderstorm-hail" },
        99: { description: "Thunderstorm with heavy hail", icon: "thunderstorm-hail" }
    };
};

// Generic fetch handler with error management and JSON parsing
const fetchWithErrorHandling = async (url: string): Promise<any> => {
    try {
        console.log(`Fetching: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};

// Fetch current weather data for a given location
export const fetchCurrentWeather = async (latitude: number, longitude: number): Promise<CurrentWeatherData> => {
    const url = `${API.baseUrl}/current?latitude=${latitude}&longitude=${longitude}`;
    const data = await fetchWithErrorHandling(url);

    // Validate and transform the data to match the interface
    return {
        temperature_2m: data.temperature || 0,
        apparent_temperature: data.apparent_temperature || 0,
        feels_like_temperature: data.feels_like_temperature || data.apparent_temperature || 0,
        relative_humidity_2m: data.relative_humidity || data.humidity || 0,
        precipitation: data.precipitation || 0,
        precipitation_probability: data.precipitation_probability || 0,
        wind_speed_10m: data.wind_speed || 0,
        wind_direction_10m: data.wind_direction || 0,
        surface_pressure: data.surface_pressure || 1013,
        weather_code: data.weather_code || 0,
        is_day: data.is_day !== undefined ? data.is_day : 1,
        uv_index: data.uv_index || 0,
        cloud_cover: data.cloud_cover || 0
    };
};

// Fetch hourly forecast data for a given location
export const fetchHourlyForecast = async (
    latitude: number,
    longitude: number,
    hours: number = 24
): Promise<HourlyForecastData> => {
    const url = `${API.baseUrl}/hourly?latitude=${latitude}&longitude=${longitude}&hours=${hours}`;
    const data = await fetchWithErrorHandling(url);

    // Ensure we return a properly formatted data object
    return {
        timestamps: data.timestamps || data.time || [],
        temperature_2m: data.temperature_2m || data.temperature || [],
        precipitation: data.precipitation || [],
        precipitation_probability: data.precipitation_probability || [],
        weather_code: data.weather_code || [],
        wind_speed_10m: data.wind_speed_10m || data.wind_speed || [],
        wind_direction_10m: data.wind_direction_10m || data.wind_direction || [],
        is_day: data.is_day || []
    };
};

// Fetch daily forecast data for a given location
export const fetchDailyForecast = async (
    latitude: number,
    longitude: number,
    days: number = 7
): Promise<DailyForecastData> => {
    const url = `${API.baseUrl}/daily?latitude=${latitude}&longitude=${longitude}&days=${days}`;
    const data = await fetchWithErrorHandling(url);

    // Ensure we return a properly formatted data object
    return {
        time: data.time || data.dates || [],
        temperature_2m_max: data.temperature_2m_max || data.temperature_max || [],
        temperature_2m_min: data.temperature_2m_min || data.temperature_min || [],
        precipitation_sum: data.precipitation_sum || data.precipitation || [],
        precipitation_probability_max: data.precipitation_probability_max ||
            data.precipitation_probability || [],
        weather_code: data.weather_code || [],
        wind_speed_10m_max: data.wind_speed_10m_max || data.wind_speed_max || [],
        wind_direction_10m_dominant: data.wind_direction_10m_dominant || [],
        sunrise: data.sunrise || [],
        sunset: data.sunset || []
    };
};

// Search for a location by query string
export const fetchLocationBySearch = async (query: string): Promise<LocationData> => {
    const url = `${API.geocodingUrl}?query=${encodeURIComponent(query)}`;
    const data = await fetchWithErrorHandling(url);

    if (!data || !data.latitude || !data.longitude) {
        throw new Error('Location not found');
    }

    return {
        name: data.name || 'Unknown Location',
        country: data.country || '',
        state: data.state || '',
        latitude: data.latitude,
        longitude: data.longitude
    };
};

export const clearWeatherCache = () => {
    // Clear only weather-related cache entries
    const keysToDelete = [];
    for (const key of Array.from(memoryCache.keys())) {
        if (key.includes(API.ENDPOINTS.CURRENT) ||
            key.includes(API.ENDPOINTS.HOURLY) ||
            key.includes(API.ENDPOINTS.DAILY)) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => memoryCache.delete(key));
    console.log('Weather cache cleared');
};
