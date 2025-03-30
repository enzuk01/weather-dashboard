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
    lat?: number;
    lon?: number;
    latitude: number;
    longitude: number;
}

// Common fields for legacy weather data
interface BaseWeatherData {
    timestamp?: number;
    date?: string;
    time?: string;
}

// Legacy ForecastData structure to maintain compatibility
export interface ForecastData extends BaseWeatherData {
    hour?: number;
    temperature?: number;
    humidity?: number;
    wind_speed?: number;
    wind_direction?: number;
    description?: string;
    icon?: string;
    is_day: number | boolean;
    precipitation?: number;
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
    const currentWeather: CurrentWeatherData = {
        temperature_2m: data.temperature_2m || data.temperature || 0,
        apparent_temperature: data.apparent_temperature || 0,
        relative_humidity_2m: data.relative_humidity_2m || data.humidity || 0,
        precipitation: data.precipitation || 0,
        precipitation_probability: data.precipitation_probability || 0,
        wind_speed_10m: data.wind_speed_10m || data.wind_speed || 0,
        wind_direction_10m: data.wind_direction_10m || data.wind_direction || 0,
        surface_pressure: data.surface_pressure || 1013,
        weather_code: data.weather_code || 0,
        is_day: typeof data.is_day === 'number' ? data.is_day : 1
    };

    // Add optional properties if they exist
    if (data.feels_like_temperature !== undefined) {
        currentWeather.feels_like_temperature = data.feels_like_temperature;
    }
    if (data.uv_index !== undefined) {
        currentWeather.uv_index = data.uv_index;
    }
    if (data.cloud_cover !== undefined) {
        currentWeather.cloud_cover = data.cloud_cover;
    }

    return currentWeather;
};

// Fetch hourly forecast data for a given location
export const fetchHourlyForecast = async (
    latitude: number,
    longitude: number,
    hours: number = 24
): Promise<HourlyForecastData> => {
    const url = `${API.baseUrl}/hourly?latitude=${latitude}&longitude=${longitude}&hours=${hours}`;
    const data = await fetchWithErrorHandling(url);

    // Create empty arrays for required properties
    const emptyArray = new Array(hours).fill(0);

    // Ensure we return a properly formatted data object with all required fields
    const hourlyForecast: HourlyForecastData = {
        timestamps: data.timestamps || data.time || Array(hours).fill(new Date().toISOString()),
        temperature_2m: data.temperature_2m || data.temperature || emptyArray,
        precipitation: data.precipitation || emptyArray,
        precipitation_probability: data.precipitation_probability || emptyArray,
        weather_code: data.weather_code || emptyArray,
        wind_speed_10m: data.wind_speed_10m || data.wind_speed || emptyArray,
        wind_direction_10m: data.wind_direction_10m || data.wind_direction || emptyArray,
        is_day: data.is_day || Array(hours).fill(1)
    };

    // Add optional properties if they exist
    if (data.apparent_temperature) {
        hourlyForecast.apparent_temperature = data.apparent_temperature;
    }
    if (data.feels_like_temperature) {
        hourlyForecast.feels_like_temperature = data.feels_like_temperature;
    }
    if (data.rain) {
        hourlyForecast.rain = data.rain;
    }
    if (data.showers) {
        hourlyForecast.showers = data.showers;
    }
    if (data.snowfall) {
        hourlyForecast.snowfall = data.snowfall;
    }
    if (data.cloud_cover) {
        hourlyForecast.cloud_cover = data.cloud_cover;
    }
    if (data.wind_gusts_10m) {
        hourlyForecast.wind_gusts_10m = data.wind_gusts_10m;
    }
    if (data.relative_humidity_2m) {
        hourlyForecast.relative_humidity_2m = data.relative_humidity_2m;
    }
    if (data.latitude !== undefined) {
        hourlyForecast.latitude = data.latitude;
    }
    if (data.longitude !== undefined) {
        hourlyForecast.longitude = data.longitude;
    }
    if (data.elevation !== undefined) {
        hourlyForecast.elevation = data.elevation;
    }
    if (data.timezone) {
        hourlyForecast.timezone = data.timezone;
    }

    return hourlyForecast;
};

// Fetch daily forecast data for a given location
export const fetchDailyForecast = async (
    latitude: number,
    longitude: number,
    days: number = 7
): Promise<DailyForecastData> => {
    const url = `${API.baseUrl}/daily?latitude=${latitude}&longitude=${longitude}&days=${days}`;
    const data = await fetchWithErrorHandling(url);

    // Create empty arrays for required properties
    const emptyArray = new Array(days).fill(0);
    const emptyDates = Array(days).fill(new Date().toISOString().split('T')[0]);

    // Ensure we return a properly formatted data object with all required fields
    const dailyForecast: DailyForecastData = {
        time: data.time || data.dates || emptyDates,
        temperature_2m_max: data.temperature_2m_max || data.temperature_max || emptyArray,
        temperature_2m_min: data.temperature_2m_min || data.temperature_min || emptyArray,
        precipitation_sum: data.precipitation_sum || data.precipitation || emptyArray,
        precipitation_probability_max: data.precipitation_probability_max || data.precipitation_probability || emptyArray,
        weather_code: data.weather_code || emptyArray,
        wind_speed_10m_max: data.wind_speed_10m_max || data.wind_speed_max || emptyArray,
        wind_direction_10m_dominant: data.wind_direction_10m_dominant || data.wind_direction || emptyArray,
        sunrise: data.sunrise || Array(days).fill('06:00:00'),
        sunset: data.sunset || Array(days).fill('18:00:00')
    };

    // Add optional properties if they exist
    if (data.date) dailyForecast.date = data.date;
    if (data.day) dailyForecast.day = data.day;
    if (data.min_temp) dailyForecast.min_temp = data.min_temp;
    if (data.max_temp) dailyForecast.max_temp = data.max_temp;
    if (data.description) dailyForecast.description = data.description;
    if (data.icon) dailyForecast.icon = data.icon;
    if (data.precipitation) dailyForecast.precipitation = data.precipitation;
    if (data.wind_speed) dailyForecast.wind_speed = data.wind_speed;
    if (data.wind_direction) dailyForecast.wind_direction = data.wind_direction;
    if (data.humidity) dailyForecast.humidity = data.humidity;
    if (data.timestamp) dailyForecast.timestamp = data.timestamp;
    if (data.rain_sum) dailyForecast.rain_sum = data.rain_sum;
    if (data.apparent_temperature_max) dailyForecast.apparent_temperature_max = data.apparent_temperature_max;
    if (data.apparent_temperature_min) dailyForecast.apparent_temperature_min = data.apparent_temperature_min;

    return dailyForecast;
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
