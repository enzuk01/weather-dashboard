import { API } from '../config/api';

// Weather data interfaces
interface Location {
    name: string;
    country: string;
    lat: number;
    lon: number;
}

interface WeatherData {
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    description: string;
    icon: string;
    is_day: number | boolean;
    precipitation: number;
    date: string;
    time: string;
    timestamp: number;
}

interface CurrentWeatherData extends WeatherData {
    location: Location;
    sunrise: string;
    sunset: string;
    pressure: number;
    feels_like: number;
    uv_index: number;
}

interface ForecastData extends WeatherData {
    hour: number;
}

interface DailyForecastData {
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

export const fetchHourlyForecast = async (lat: number, lon: number): Promise<ForecastData[]> => {
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
        const url = buildApiUrl(`${API.ENDPOINTS.HOURLY}?lat=${lat}&lon=${lon}`);
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

export const fetchDailyForecast = async (lat: number, lon: number): Promise<DailyForecastData[]> => {
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
        const url = buildApiUrl(`${API.ENDPOINTS.DAILY}?lat=${lat}&lon=${lon}`);
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
    for (const key of memoryCache.keys()) {
        if (key.includes(API.ENDPOINTS.CURRENT) ||
            key.includes(API.ENDPOINTS.HOURLY) ||
            key.includes(API.ENDPOINTS.DAILY)) {
            memoryCache.delete(key);
        }
    }
    console.log('Weather cache cleared');
};
