/**
 * API Configuration File
 * This file contains API configuration constants used throughout the application
 */

// Base API configuration
export const API = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5003/api',
    PORT: 5003,
    TIMEOUT: 30000, // 30 seconds
    CACHE_TTL: {
        CURRENT: 5 * 60 * 1000, // 5 minutes for current weather
        HOURLY: 15 * 60 * 1000, // 15 minutes for hourly forecasts
        DAILY: 60 * 60 * 1000,  // 60 minutes for daily forecasts
    },
    RETRY: {
        MAX_ATTEMPTS: 3,
        BACKOFF_FACTOR: 1.5,
    },
    THROTTLE: {
        MAX_REQUESTS: 10,
        TIME_WINDOW: 5000, // 5 seconds
    },
    ENDPOINTS: {
        CURRENT: '/weather/current',
        HOURLY: '/weather/hourly',
        DAILY: '/weather/daily',
        SEARCH: '/location/search',
        GEOCODE: '/location/geocode',
    }
};
