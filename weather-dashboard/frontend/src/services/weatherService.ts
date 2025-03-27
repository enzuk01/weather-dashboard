/**
 * Weather API service
 * This module handles all interactions with the backend weather API
 */

export type { CurrentWeatherData, HourlyForecastData, DailyForecastData } from '../types/weatherTypes';
import { CurrentWeatherData, HourlyForecastData, DailyForecastData } from '../types/weatherTypes';
import { saveToStorage, loadFromStorage, STORAGE_KEYS, isOffline } from '../utils/storageUtils';

// Default to localhost if no API URL is provided
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

/**
 * Fetch current weather data for a specific location
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @returns Promise with current weather data
 */
export async function fetchCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeatherData> {
    // Try to load from storage first if offline
    if (isOffline()) {
        const cachedData = loadFromStorage<CurrentWeatherData>(
            STORAGE_KEYS.CURRENT_WEATHER,
            latitude,
            longitude
        );

        if (cachedData) {
            return cachedData;
        }

        throw new Error('You are offline and no cached data is available');
    }

    try {
        // Fetch fresh data from API
        const response = await fetch(`${API_BASE_URL}/weather/current?lat=${latitude}&lon=${longitude}`);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        // Save data to storage for offline use
        saveToStorage(STORAGE_KEYS.CURRENT_WEATHER, data, latitude, longitude);

        return data;
    } catch (error) {
        // If API fetch fails, try to return cached data as fallback
        const cachedData = loadFromStorage<CurrentWeatherData>(
            STORAGE_KEYS.CURRENT_WEATHER,
            latitude,
            longitude
        );

        if (cachedData) {
            return cachedData;
        }

        // If no cached data, rethrow the error
        throw error;
    }
}

/**
 * Fetch hourly forecast data for a specific location
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @param hours Number of hours to forecast (default: 24)
 * @returns Promise with hourly forecast data
 */
export async function fetchHourlyForecast(
    latitude: number,
    longitude: number,
    hours: number = 24
): Promise<HourlyForecastData> {
    // Try to load from storage first if offline
    if (isOffline()) {
        const cachedData = loadFromStorage<HourlyForecastData>(
            STORAGE_KEYS.HOURLY_FORECAST,
            latitude,
            longitude
        );

        if (cachedData) {
            return cachedData;
        }

        throw new Error('You are offline and no cached data is available');
    }

    try {
        // Fetch fresh data from API
        const response = await fetch(
            `${API_BASE_URL}/weather/forecast/hourly?lat=${latitude}&lon=${longitude}&hours=${hours}`
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        // Save data to storage for offline use
        saveToStorage(STORAGE_KEYS.HOURLY_FORECAST, data, latitude, longitude);

        return data;
    } catch (error) {
        // If API fetch fails, try to return cached data as fallback
        const cachedData = loadFromStorage<HourlyForecastData>(
            STORAGE_KEYS.HOURLY_FORECAST,
            latitude,
            longitude
        );

        if (cachedData) {
            return cachedData;
        }

        // If no cached data, rethrow the error
        throw error;
    }
}

/**
 * Fetch daily forecast data for a specific location
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @param days Number of days to forecast (default: 7)
 * @returns Promise with daily forecast data
 */
export async function fetchDailyForecast(
    latitude: number,
    longitude: number,
    days: number = 7
): Promise<DailyForecastData> {
    // Try to load from storage first if offline
    if (isOffline()) {
        const cachedData = loadFromStorage<DailyForecastData>(
            STORAGE_KEYS.DAILY_FORECAST,
            latitude,
            longitude
        );

        if (cachedData) {
            return cachedData;
        }

        throw new Error('You are offline and no cached data is available');
    }

    try {
        // Fetch fresh data from API
        const response = await fetch(
            `${API_BASE_URL}/weather/forecast/daily?lat=${latitude}&lon=${longitude}&days=${days}`
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        // Save data to storage for offline use
        saveToStorage(STORAGE_KEYS.DAILY_FORECAST, data, latitude, longitude);

        return data;
    } catch (error) {
        // If API fetch fails, try to return cached data as fallback
        const cachedData = loadFromStorage<DailyForecastData>(
            STORAGE_KEYS.DAILY_FORECAST,
            latitude,
            longitude
        );

        if (cachedData) {
            return cachedData;
        }

        // If no cached data, rethrow the error
        throw error;
    }
}

/**
 * Get user's current location
 * @returns Promise with latitude and longitude
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Store last location for offline use
                    saveToStorage(STORAGE_KEYS.LAST_LOCATION, { latitude, longitude }, latitude, longitude);
                    resolve({ latitude, longitude });
                },
                (error) => {
                    reject(new Error(`Geolocation error: ${error.message}`));
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser'));
        }
    });
}

/**
 * Maps weather codes to weather conditions
 * Based on WMO weather codes: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 * @param weatherCode - WMO weather code
 * @returns Weather condition string
 */
export const mapWeatherCodeToCondition = (weatherCode: number): 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy' => {
    if (weatherCode === 0) return 'clear'; // Clear sky
    if (weatherCode <= 3) return 'cloudy'; // Partly cloudy
    if (weatherCode >= 45 && weatherCode <= 49) return 'foggy'; // Fog
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return 'rainy'; // Rain
    if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) return 'snowy'; // Snow
    if (weatherCode >= 95) return 'stormy'; // Thunderstorm

    // Default fallback
    return 'cloudy';
};

/**
 * Fetch weather codes and their descriptions
 * @returns Map of weather codes to descriptions
 */
export async function fetchWeatherCodes(): Promise<Map<number, string>> {
    try {
        const response = await fetch(`${API_BASE_URL}/weather/codes`);

        if (!response.ok) {
            throw new Error(`Failed to fetch weather codes: ${response.statusText}`);
        }

        const data = await response.json();
        return new Map(Object.entries(data).map(([code, description]) => [parseInt(code), description as string]));
    } catch (error) {
        console.error('Error fetching weather codes:', error);
        throw error;
    }
}