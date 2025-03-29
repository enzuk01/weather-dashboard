/**
 * API Configuration
 */

// API Configuration
const ENV = process.env.NODE_ENV || 'development';

// Use environment variables with fallbacks
const API_CONFIG = {
    // Base API URL from environment or fallback to port 5003
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5003/api',

    // Request timeout in milliseconds
    TIMEOUT: 10000,

    // Enable cache
    CACHE_ENABLED: true,

    // Cache duration in milliseconds
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Retry configuration
    RETRIES: 3,
    RETRY_DELAY: 1000,
};

// Additional endpoints
const ENDPOINTS = {
    HEALTH: '/health',
    CURRENT_WEATHER: '/weather/current',
    HOURLY_FORECAST: '/weather/forecast/hourly',
    DAILY_FORECAST: '/weather/forecast/daily',
};

// Export configuration
export const API = {
    ...API_CONFIG,
    ENDPOINTS,

    // Helper for full URLs
    getUrl: (endpoint: string): string => `${API_CONFIG.BASE_URL}${endpoint}`,

    // Helper for displaying configuration
    getConfig: () => ({
        ...API_CONFIG,
        ENV,
        ENDPOINTS,
    }),
};

export default API;

/**
 * Build a complete API URL
 * @param endpoint - The API endpoint path
 * @returns The complete URL
 */
export const buildApiUrl = (endpoint: string): string => {
    return `${API.BASE_URL}${endpoint}`;
};

/**
 * Build URL parameters for API requests
 * @param params - Object containing URL parameters
 * @returns URL-encoded parameter string
 */
export const buildUrlParams = (params: Record<string, string | number>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
    });
    return `?${searchParams.toString()}`;
};