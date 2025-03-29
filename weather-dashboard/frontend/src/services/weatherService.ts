import { API } from '../config/api';

// Weather data interfaces
export interface Location {
    name: string;
    country: string;
    lat: number;
    lon: number;
}

// Common fields for weather data
interface BaseWeatherData {
    timestamp: number;
    date: string;
    time: string;
}

// Current weather data structure
export interface CurrentWeatherData extends BaseWeatherData {
    location: Location;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation_probability: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    description: string;
    icon: string;
    sunrise: string;
    sunset: string;
    pressure: number;
    feels_like: number;
    uv_index: number;
}

// Hourly forecast data structure
export interface HourlyForecastData {
    timestamps: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    is_day: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m?: number[];
}

// Daily forecast data structure
export interface DailyForecastData {
    date: string;
    day: string;
    min_temp: number;
    max_temp: number;
    description: string;
    icon: string;
    precipitation: number;
    wind_speed: number;
    wind_direction: number;
    humidity: number;
    timestamp: number;

    // Additional fields previously used
    temperature_2m_max?: number;
    temperature_2m_min?: number;
    apparent_temperature_max?: number;
    apparent_temperature_min?: number;
    precipitation_sum?: number;
    rain_sum?: number;
    weather_code?: number;
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

// API functions
export const fetchCurrentWeather = async (lat: number, lon: number): Promise<CurrentWeatherData> => {
    const cacheKey = getCacheKey(API.ENDPOINTS.CURRENT, lat, lon);

    // Check cache first
    if (memoryCache.has(cacheKey)) {
        const { data, timestamp } = memoryCache.get(cacheKey);
        if (isCacheValid(timestamp, API.CACHE_TTL.CURRENT)) {
            console.log('Using cached current weather data');
            return data;
        }
    }

    try {
        const url = buildApiUrl(`${API.ENDPOINTS.CURRENT}?lat=${lat}&lon=${lon}`);
        const response = await fetch(url);
        const data = await handleResponse(response);

        // Cache the response
        memoryCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
};

export const fetchHourlyForecast = async (lat: number, lon: number, hours: number = 24): Promise<HourlyForecastData> => {
    const cacheKey = getCacheKey(API.ENDPOINTS.HOURLY, lat, lon);

    // Check cache first
    if (memoryCache.has(cacheKey)) {
        const { data, timestamp } = memoryCache.get(cacheKey);
        if (isCacheValid(timestamp, API.CACHE_TTL.HOURLY)) {
            console.log('Using cached hourly forecast data');
            return data;
        }
    }

    try {
        const url = buildApiUrl(`${API.ENDPOINTS.HOURLY}?lat=${lat}&lon=${lon}&hours=${hours}`);
        const response = await fetch(url);
        const data = await handleResponse(response);

        // Cache the response
        memoryCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        throw error;
    }
};

export const fetchDailyForecast = async (lat: number, lon: number, days: number = 7): Promise<DailyForecastData[]> => {
    const cacheKey = getCacheKey(API.ENDPOINTS.DAILY, lat, lon);

    // Check cache first
    if (memoryCache.has(cacheKey)) {
        const { data, timestamp } = memoryCache.get(cacheKey);
        if (isCacheValid(timestamp, API.CACHE_TTL.DAILY)) {
            console.log('Using cached daily forecast data');
            return data;
        }
    }

    try {
        const url = buildApiUrl(`${API.ENDPOINTS.DAILY}?lat=${lat}&lon=${lon}&days=${days}`);
        const response = await fetch(url);
        const data = await handleResponse(response);

        // Cache the response
        memoryCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return data;
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        throw error;
    }
};

export const searchLocation = async (query: string): Promise<Location[]> => {
    try {
        const url = buildApiUrl(`${API.ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
        const response = await fetch(url);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error searching location:', error);
        throw error;
    }
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
