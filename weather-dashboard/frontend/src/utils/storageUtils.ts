/**
 * Local storage utilities for offline data storage
 */

export const STORAGE_KEYS = {
    CURRENT_WEATHER: 'weather_current',
    HOURLY_FORECAST: 'weather_hourly',
    DAILY_FORECAST: 'weather_daily',
    LAST_LOCATION: 'last_location',
    FAVORITES: 'favorite_locations',
    SETTINGS: 'user_settings'
};

/**
 * Save data to local storage
 * @param key Storage key
 * @param data Data to store
 * @param lat Latitude for location-specific data
 * @param lon Longitude for location-specific data
 */
export function saveToStorage<T>(key: string, data: T, lat?: number, lon?: number): void {
    try {
        // Create a storage item with metadata
        const storageItem = {
            data,
            timestamp: new Date().toISOString(),
            location: lat && lon ? `${lat.toFixed(4)}_${lon.toFixed(4)}` : undefined,
            version: '1.0'
        };

        // For location-specific data, use a compound key
        const storageKey = lat && lon
            ? `${key}_${lat.toFixed(4)}_${lon.toFixed(4)}`
            : key;

        localStorage.setItem(storageKey, JSON.stringify(storageItem));
    } catch (error) {
        console.error('Error saving to local storage:', error);
        // Fallback - try to save without location info
        if (lat && lon) {
            try {
                localStorage.setItem(key, JSON.stringify({ data, timestamp: new Date().toISOString() }));
            } catch (e) {
                console.error('Fallback storage failed:', e);
            }
        }
    }
}

/**
 * Load data from local storage
 * @param key Storage key
 * @param lat Latitude for location-specific data
 * @param lon Longitude for location-specific data
 * @returns Stored data or null if not found
 */
export function loadFromStorage<T>(key: string, lat?: number, lon?: number): T | null {
    try {
        // For location-specific data, use a compound key
        const storageKey = lat && lon
            ? `${key}_${lat.toFixed(4)}_${lon.toFixed(4)}`
            : key;

        const item = localStorage.getItem(storageKey);
        if (!item) return null;

        const storageItem = JSON.parse(item);

        // Return the actual data
        return storageItem.data as T;
    } catch (error) {
        console.error('Error loading from local storage:', error);
        return null;
    }
}

/**
 * Check if stored data is expired
 * @param timestamp ISO timestamp string from stored data
 * @param maxAge Maximum age in minutes
 * @returns True if data is expired
 */
export function isDataExpired(timestamp: string, maxAge: number = 60): boolean {
    const storedTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const maxAgeMs = maxAge * 60 * 1000;

    return (currentTime - storedTime) > maxAgeMs;
}

/**
 * Clear all stored weather data
 */
export function clearWeatherData(): void {
    try {
        // Find all weather-related keys
        const keysToRemove = Object.keys(localStorage).filter(key =>
            key.startsWith(STORAGE_KEYS.CURRENT_WEATHER) ||
            key.startsWith(STORAGE_KEYS.HOURLY_FORECAST) ||
            key.startsWith(STORAGE_KEYS.DAILY_FORECAST)
        );

        // Remove each key
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.error('Error clearing weather data:', error);
    }
}

/**
 * Check if the application is currently offline
 * @returns True if offline
 */
export function isOffline(): boolean {
    return !navigator.onLine;
}

/**
 * Add offline status change event listeners
 * @param onOffline Callback when going offline
 * @param onOnline Callback when coming back online
 */
export function setupOfflineListeners(
    onOffline: () => void,
    onOnline: () => void
): () => void {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Return a cleanup function
    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
}