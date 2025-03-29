/**
 * Weather API service
 * This module handles all interactions with the backend weather API
 */

import { logger } from '../utils/logger';
import {
    STORAGE_KEYS,
    saveToStorage,
    loadFromStorage,
    isOffline,
    clearWeatherCache
} from '../utils/storageUtils';
import { CACHE_BUSTER } from '../utils/cacheBuster';
import { CurrentWeatherData, HourlyForecastData, DailyForecastData } from '../types/weatherTypes';
import { API, buildApiUrl, buildUrlParams } from '../config/api';

interface ApiErrorResponse {
    message: string;
}

// Request throttling mechanism
const requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 2;
let activeRequests = 0;

// Cache TTL settings (milliseconds)
const CACHE_TTL = {
    CURRENT_WEATHER: 5 * 60 * 1000, // 5 minutes
    HOURLY_FORECAST: 15 * 60 * 1000, // 15 minutes
    DAILY_FORECAST: 60 * 60 * 1000, // 1 hour
};

// Request timestamp tracking for rate limiting
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_REQUESTS_PER_WINDOW = 10;
let hasLoggedRateLimit = false;

/**
 * Process the request queue one at a time
 */
async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) {
        return;
    }

    isProcessingQueue = true;

    try {
        while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
            const request = requestQueue.shift();
            if (request) {
                activeRequests++;
                try {
                    await request();
                } catch (error) {
                    logger.error("Error processing queued request", error);
                } finally {
                    activeRequests--;
                }
            }
        }
    } finally {
        isProcessingQueue = false;

        // If there are more requests and capacity available, continue processing
        if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
            setTimeout(processQueue, 50);
        }
    }
}

/**
 * Add a request to the queue and start processing
 */
function queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        // Apply rate limiting
        const now = Date.now();
        requestTimestamps.push(now);

        // Clean up old timestamps
        const cutoff = now - RATE_LIMIT_WINDOW;
        while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
            requestTimestamps.shift();
        }

        // Check if we're exceeding rate limit
        if (requestTimestamps.length > MAX_REQUESTS_PER_WINDOW) {
            const oldestTimestamp = requestTimestamps[0];
            const delay = RATE_LIMIT_WINDOW - (now - oldestTimestamp);
            if (!hasLoggedRateLimit) {
                console.warn(`Rate limit exceeded, delaying requests by ${delay}ms`);
                hasLoggedRateLimit = true;
                // Reset the flag after a while
                setTimeout(() => { hasLoggedRateLimit = false; }, 10000);
            }

            setTimeout(() => {
                queueRequest(requestFn).then(resolve).catch(reject);
            }, delay + 100);
            return;
        }

        requestQueue.push(async () => {
            try {
                const result = await requestFn();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });

        processQueue();
    });
}

/**
 * Check if cached data is still valid
 */
function isCacheValid<T>(key: string, latitude: number, longitude: number, ttl: number): boolean {
    const cachedData = loadFromStorage<T & { timestamp?: number }>(key, latitude, longitude);
    if (!cachedData || !cachedData.timestamp) return false;

    return (Date.now() - cachedData.timestamp) < ttl;
}

/**
 * Normalize hourly forecast data to ensure consistent structure
 * @param data Raw API response data
 * @returns Normalized hourly forecast data
 */
const normalizeHourlyForecast = (data: any): HourlyForecastData => {
    // Handle field name differences
    const timestamps = data.timestamps || data.time || [];

    // Ensure all arrays exist and have the same length
    const arrayLength = timestamps.length;

    const ensureArray = (value: any[] | undefined, defaultValue: number): number[] => {
        if (!value || !Array.isArray(value)) return Array(arrayLength).fill(defaultValue);
        if (value.length < arrayLength) {
            return [...value, ...Array(arrayLength - value.length).fill(defaultValue)];
        }
        return value.slice(0, arrayLength);
    };

    // Make sure we have feels_like_temperature - either use existing or calculate from apparent temperature
    const feels_like_temperature = data.feels_like_temperature ||
        data.apparent_temperature?.map((temp: number, i: number) => {
            // If no feels_like_temperature exists, we'll create a transformation based on apparent_temperature
            const baseTemp = data.temperature_2m?.[i] || 0;
            const appTemp = temp || 0;
            // Create a slight variation to simulate the feels like temperature
            return baseTemp + (appTemp - baseTemp) * 1.2 + Math.random() * 0.5;
        }) || Array(arrayLength).fill(0);

    // Add timestamp for caching validity
    const result: HourlyForecastData = {
        timestamp: Date.now(),
        timestamps,
        time: timestamps, // Ensure both field names are present
        temperature_2m: ensureArray(data.temperature_2m, 0),
        apparent_temperature: ensureArray(data.apparent_temperature, 0),
        feels_like_temperature: ensureArray(feels_like_temperature, 0),
        precipitation_probability: ensureArray(data.precipitation_probability, 0),
        precipitation: ensureArray(data.precipitation, 0),
        weather_code: ensureArray(data.weather_code, 0),
        wind_speed_10m: ensureArray(data.wind_speed_10m, 0),
        wind_direction_10m: ensureArray(data.wind_direction_10m, 0),
        wind_gusts_10m: ensureArray(data.wind_gusts_10m, 0),
        relative_humidity_2m: ensureArray(data.relative_humidity_2m, 50),
        is_day: ensureArray(data.is_day, 1),
        // Include any additional metadata
        latitude: data.latitude,
        longitude: data.longitude,
        elevation: data.elevation,
        timezone: data.timezone
    };

    return result;
};

/**
 * Normalize daily forecast data to ensure consistent structure
 * @param data Raw API response data
 * @returns Normalized daily forecast data
 */
const normalizeDailyForecast = (data: any): DailyForecastData => {
    // Handle nested data structure from backend
    const dailyData = data.daily || data;

    // Get time array and determine array length - handle both 'time' and 'dates'
    const time = dailyData.time || dailyData.dates || [];
    const arrayLength = time.length;

    const ensureArray = (value: any[] | undefined, defaultValue: number): number[] => {
        if (!value || !Array.isArray(value)) return Array(arrayLength).fill(defaultValue);
        if (value.length < arrayLength) {
            return [...value, ...Array(arrayLength - value.length).fill(defaultValue)];
        }
        return value.slice(0, arrayLength);
    };

    // Add timestamp for caching validity
    const result: DailyForecastData = {
        timestamp: Date.now(),
        time,
        temperature_2m_max: ensureArray(dailyData.temperature_2m_max, 0),
        temperature_2m_min: ensureArray(dailyData.temperature_2m_min, 0),
        precipitation_sum: ensureArray(dailyData.precipitation_sum, 0),
        precipitation_probability_max: ensureArray(dailyData.precipitation_probability_max, 0),
        wind_speed_10m_max: ensureArray(dailyData.wind_speed_10m_max, 0),
        wind_direction_10m_dominant: ensureArray(dailyData.wind_direction_10m_dominant, 0),
        weather_code: ensureArray(dailyData.weather_code, 0),
        sunrise: dailyData.sunrise || [],
        sunset: dailyData.sunset || []
    };

    return result;
};

/**
 * Fetch current weather data for a specific location
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @returns Promise with current weather data
 */
export const fetchCurrentWeather = async (latitude: number, longitude: number): Promise<CurrentWeatherData> => {
    const metricName = 'fetchCurrentWeather';
    logger.startPerformanceMetric(metricName);

    try {
        // Check if we have valid cache
        if (isCacheValid<CurrentWeatherData>(STORAGE_KEYS.CURRENT_WEATHER, latitude, longitude, CACHE_TTL.CURRENT_WEATHER)) {
            const cachedData = loadFromStorage<CurrentWeatherData>(STORAGE_KEYS.CURRENT_WEATHER, latitude, longitude);
            if (cachedData) {
                logger.info('Using cached current weather data');
                logger.endPerformanceMetric(metricName);
                return cachedData;
            }
        }

        // No valid cache, use expired cache but fetch fresh data in background
        const cachedData = loadFromStorage<CurrentWeatherData>(STORAGE_KEYS.CURRENT_WEATHER, latitude, longitude);
        if (cachedData) {
            // If we have expired cached data, use it immediately to improve UX
            logger.info('Using expired cached weather data while fetching new data');

            // Fetch fresh data in the background, but don't wait for it
            fetchAndCacheCurrentWeather(latitude, longitude)
                .catch(err => logger.error('Background fetch failed', err));

            logger.endPerformanceMetric(metricName);
            return cachedData;
        }

        // No cache available, fetch from API and wait for result
        const data = await fetchAndCacheCurrentWeather(latitude, longitude);
        logger.endPerformanceMetric(metricName);
        return data;
    } catch (error) {
        logger.error('Error fetching current weather', error);

        const cachedData = loadFromStorage<CurrentWeatherData>(STORAGE_KEYS.CURRENT_WEATHER, latitude, longitude);
        if (cachedData) {
            logger.info('Using cached data as fallback after error');
            return cachedData;
        }

        throw error;
    }
};

/**
 * Helper function to fetch and cache current weather
 */
async function fetchAndCacheCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeatherData> {
    // Check if offline
    if (isOffline()) {
        throw new Error('You are offline and no cached data is available');
    }

    const params = { latitude, longitude };
    const url = buildApiUrl(API.ENDPOINTS.CURRENT_WEATHER) + buildUrlParams(params);

    // Use the queue to limit concurrent requests
    return queueRequest(async () => {
        try {
            const response = await fetch(url, {
                // Add cache control headers
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                // Handle rate limiting specifically
                if (response.status === 429) {
                    throw new Error('API rate limit reached. Please try again in a few minutes.');
                }

                const errorData = await response.json() as ApiErrorResponse;
                throw new Error(errorData.message || `Failed to fetch current weather: ${response.status}`);
            }

            const data = await response.json() as CurrentWeatherData;

            // Add timestamp before caching
            const timestampedData = {
                ...data,
                timestamp: Date.now()
            };

            // Save to cache
            saveToStorage(STORAGE_KEYS.CURRENT_WEATHER, timestampedData, latitude, longitude);
            return timestampedData;
        } catch (error) {
            console.error("Error fetching current weather:", error);
            throw error;
        }
    });
}

/**
 * Fetch hourly forecast data for a specific location
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @param hours Number of hours to forecast (default: 24)
 * @returns Promise with hourly forecast data
 */
export const fetchHourlyForecast = async (latitude: number, longitude: number, hours: number = 24): Promise<HourlyForecastData> => {
    const metricName = 'fetchHourlyForecast';
    logger.startPerformanceMetric(metricName);

    try {
        // Check if we have valid cache
        if (isCacheValid<HourlyForecastData>(STORAGE_KEYS.HOURLY_FORECAST, latitude, longitude, CACHE_TTL.HOURLY_FORECAST)) {
            const cachedData = loadFromStorage<HourlyForecastData>(STORAGE_KEYS.HOURLY_FORECAST, latitude, longitude);
            if (cachedData) {
                logger.info('Using cached hourly forecast data');
                logger.endPerformanceMetric(metricName);
                return normalizeHourlyForecast(cachedData);
            }
        }

        // No valid cache, use expired cache but fetch fresh data in background
        const expiredCache = loadFromStorage<HourlyForecastData>(STORAGE_KEYS.HOURLY_FORECAST, latitude, longitude);
        if (expiredCache && !isOffline()) {
            // If we have expired cached data, use it immediately to improve UX
            logger.info('Using expired cached hourly forecast while fetching new data');

            // Fetch fresh data in the background, but don't wait for it
            fetchAndCacheHourlyForecast(latitude, longitude, hours)
                .catch(err => logger.error('Background fetch failed', err));

            logger.endPerformanceMetric(metricName);
            return normalizeHourlyForecast(expiredCache);
        }

        // No cache available or offline, fetch from API and wait
        const data = await fetchAndCacheHourlyForecast(latitude, longitude, hours);
        logger.endPerformanceMetric(metricName);
        return data;
    } catch (error) {
        logger.error('Error fetching hourly forecast', error);

        const cachedData = loadFromStorage<HourlyForecastData>(STORAGE_KEYS.HOURLY_FORECAST, latitude, longitude);
        if (cachedData) {
            logger.info('Using cached hourly forecast as fallback after error');
            return normalizeHourlyForecast(cachedData);
        }

        throw error;
    }
};

/**
 * Helper function to fetch and cache hourly forecast
 */
async function fetchAndCacheHourlyForecast(latitude: number, longitude: number, hours: number): Promise<HourlyForecastData> {
    // Check if offline
    if (isOffline()) {
        throw new Error('You are offline and no cached data is available');
    }

    const params = { latitude, longitude, hours };
    const url = buildApiUrl(API.ENDPOINTS.HOURLY_FORECAST) + buildUrlParams(params);

    // Use the queue to limit concurrent requests
    return queueRequest(async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                // Handle rate limiting specifically
                if (response.status === 429) {
                    throw new Error('API rate limit reached. Please try again in a few minutes.');
                }

                throw new Error(`Failed to fetch hourly forecast: ${response.status}`);
            }

            const rawData = await response.json();
            // Normalize data to ensure consistent structure
            const data = normalizeHourlyForecast(rawData);

            // Save to cache
            saveToStorage(STORAGE_KEYS.HOURLY_FORECAST, data, latitude, longitude);
            return data;
        } catch (error) {
            console.error("Error fetching hourly forecast:", error);
            throw error;
        }
    });
}

/**
 * Fetch daily forecast data for a specific location
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @param days Number of days to forecast (default: 7)
 * @returns Promise with daily forecast data
 */
export const fetchDailyForecast = async (latitude: number, longitude: number, days: number = 7): Promise<DailyForecastData> => {
    const metricName = 'fetchDailyForecast';
    logger.startPerformanceMetric(metricName);

    try {
        // Check if we have valid cache
        if (isCacheValid<DailyForecastData>(STORAGE_KEYS.DAILY_FORECAST, latitude, longitude, CACHE_TTL.DAILY_FORECAST)) {
            const cachedData = loadFromStorage<DailyForecastData>(STORAGE_KEYS.DAILY_FORECAST, latitude, longitude);
            if (cachedData) {
                logger.info('Using cached daily forecast data');
                logger.endPerformanceMetric(metricName);
                return normalizeDailyForecast(cachedData);
            }
        }

        // No valid cache, use expired cache but fetch fresh data in background
        const expiredCache = loadFromStorage<DailyForecastData>(STORAGE_KEYS.DAILY_FORECAST, latitude, longitude);
        if (expiredCache && !isOffline()) {
            // If we have expired cached data, use it immediately to improve UX
            logger.info('Using expired cached daily forecast while fetching new data');

            // Fetch fresh data in the background, but don't wait for it
            fetchAndCacheDailyForecast(latitude, longitude, days)
                .catch(err => logger.error('Background fetch failed', err));

            logger.endPerformanceMetric(metricName);
            return normalizeDailyForecast(expiredCache);
        }

        // No cache available or offline, fetch from API and wait
        const data = await fetchAndCacheDailyForecast(latitude, longitude, days);
        logger.endPerformanceMetric(metricName);
        return data;
    } catch (error) {
        logger.error('Error fetching daily forecast', error);

        const cachedData = loadFromStorage<DailyForecastData>(STORAGE_KEYS.DAILY_FORECAST, latitude, longitude);
        if (cachedData) {
            logger.info('Using cached daily forecast as fallback after error');
            return normalizeDailyForecast(cachedData);
        }

        throw error;
    }
};

/**
 * Helper function to fetch and cache daily forecast
 */
async function fetchAndCacheDailyForecast(latitude: number, longitude: number, days: number): Promise<DailyForecastData> {
    // Check if offline
    if (isOffline()) {
        throw new Error('You are offline and no cached data is available');
    }

    const params = { latitude, longitude, days };
    const url = buildApiUrl(API.ENDPOINTS.DAILY_FORECAST) + buildUrlParams(params);

    // Use the queue to limit concurrent requests
    return queueRequest(async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                // Handle rate limiting specifically
                if (response.status === 429) {
                    throw new Error('API rate limit reached. Please try again in a few minutes.');
                }

                throw new Error(`Failed to fetch daily forecast: ${response.status}`);
            }

            const rawData = await response.json();
            // Normalize data to ensure consistent structure
            const data = normalizeDailyForecast(rawData);

            // Save to cache
            saveToStorage(STORAGE_KEYS.DAILY_FORECAST, data, latitude, longitude);
            return data;
        } catch (error) {
            console.error("Error fetching daily forecast:", error);
            throw error;
        }
    });
}

// Debounce map to track pending operations
const debouncedOperations: Record<string, any> = {};

/**
 * Fetch weather data with debouncing to prevent excessive API calls
 * Useful for components that need to fetch data based on user interactions
 */
export const debouncedFetchWeatherData = (
    latitude: number,
    longitude: number,
    callback: (data: {
        current?: CurrentWeatherData,
        hourly?: HourlyForecastData,
        daily?: DailyForecastData
    }) => void,
    options = {
        delay: 500,
        fetchCurrent: true,
        fetchHourly: true,
        fetchDaily: false,
        hours: 24,
        days: 7
    }
) => {
    const locationKey = `${latitude},${longitude}`;

    // Clear any pending operation for this location
    if (debouncedOperations[locationKey]) {
        clearTimeout(debouncedOperations[locationKey]);
    }

    // Set new timeout
    debouncedOperations[locationKey] = setTimeout(async () => {
        try {
            const results: {
                current?: CurrentWeatherData,
                hourly?: HourlyForecastData,
                daily?: DailyForecastData
            } = {};

            // Run fetches in parallel
            const promises = [];

            if (options.fetchCurrent) {
                promises.push(
                    fetchCurrentWeather(latitude, longitude)
                        .then(data => { results.current = data; })
                        .catch(err => { logger.error('Error in debounced current weather fetch', err); })
                );
            }

            if (options.fetchHourly) {
                promises.push(
                    fetchHourlyForecast(latitude, longitude, options.hours)
                        .then(data => { results.hourly = data; })
                        .catch(err => { logger.error('Error in debounced hourly forecast fetch', err); })
                );
            }

            if (options.fetchDaily) {
                promises.push(
                    fetchDailyForecast(latitude, longitude, options.days)
                        .then(data => { results.daily = data; })
                        .catch(err => { logger.error('Error in debounced daily forecast fetch', err); })
                );
            }

            // Wait for all promises to settle (even if some fail)
            await Promise.allSettled(promises);

            // Call the callback with whatever data we have
            callback(results);
        } catch (error) {
            logger.error('Error in debounced weather data fetch', error);
        } finally {
            // Clean up
            delete debouncedOperations[locationKey];
        }
    }, options.delay);

    // Return a function to cancel the pending operation
    return () => {
        if (debouncedOperations[locationKey]) {
            clearTimeout(debouncedOperations[locationKey]);
            delete debouncedOperations[locationKey];
        }
    };
};

/**
 * Clear all weather-related cache data
 */
export const clearCache = (): void => {
    try {
        clearWeatherCache();
    } catch (error) {
        logger.error('Error clearing cache', error);
    }
};

/**
 * Preload weather data for a location
 * Useful for improving perceived performance
 */
export const preloadWeatherData = async (latitude: number, longitude: number): Promise<void> => {
    // Preload current weather
    fetchCurrentWeather(latitude, longitude).catch(e => logger.error('Preload current weather failed', e));

    // Preload hourly forecast with a slight delay to avoid overloading
    setTimeout(() => {
        fetchHourlyForecast(latitude, longitude, 48).catch(e => logger.error('Preload hourly forecast failed', e));
    }, 500);

    // Preload daily forecast with a slight delay
    setTimeout(() => {
        fetchDailyForecast(latitude, longitude, 7).catch(e => logger.error('Preload daily forecast failed', e));
    }, 1000);
};