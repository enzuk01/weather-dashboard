/**
 * Local storage utilities for offline data storage
 */

import { CACHE_BUSTER } from './cacheBuster';

// Storage keys for browser cache
export const STORAGE_KEYS = {
    // New format keys
    CURRENT_WEATHER: 'current-weather',
    HOURLY_FORECAST: 'hourly-forecast',
    DAILY_FORECAST: 'daily-forecast',
    USER_PREFERENCES: 'user-preferences',
    FAVORITE_LOCATIONS: 'favorite-locations',
    FEATURE_FLAGS: 'feature-flags',

    // Old format keys - keep for compatibility
    LAST_LOCATION: 'last_location',
    FAVORITES: 'favorite_locations',
    SETTINGS: 'user_settings'
};

// In-memory cache to reduce localStorage calls
const memoryCache: Record<string, any> = {};
const memoryCacheKeys: string[] = [];
const MAX_MEMORY_CACHE_ITEMS = 20;

// Legacy key mapping for backward compatibility
const LEGACY_KEYS: Record<string, string> = {
    'current-weather': 'weather_current',
    'hourly-forecast': 'weather_hourly',
    'daily-forecast': 'weather_daily',
    'user-preferences': 'user_settings',
    'favorite-locations': 'favorite_locations'
};

/**
 * Generate storage key for new format
 */
function getStorageKey(key: string, lat?: number, lon?: number): string {
    const base = `${key}-${CACHE_BUSTER || 'v1'}`;
    if (lat !== undefined && lon !== undefined) {
        return `${base}-${lat.toFixed(4)}-${lon.toFixed(4)}`;
    }
    return base;
}

/**
 * Generate storage key for old format
 */
function getLegacyStorageKey(key: string, lat?: number, lon?: number): string | null {
    const oldKey = LEGACY_KEYS[key];
    if (!oldKey) return null;

    if (lat !== undefined && lon !== undefined) {
        return `${oldKey}_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    }
    return oldKey;
}

/**
 * Add item to memory cache with LRU eviction
 */
function addToMemoryCache(key: string, data: any): void {
    // If key already exists, remove it
    const existingIndex = memoryCacheKeys.indexOf(key);
    if (existingIndex >= 0) {
        memoryCacheKeys.splice(existingIndex, 1);
    }

    // Add to end (most recently used)
    memoryCacheKeys.push(key);

    // Evict oldest item if needed
    if (memoryCacheKeys.length > MAX_MEMORY_CACHE_ITEMS) {
        const oldestKey = memoryCacheKeys.shift();
        if (oldestKey) {
            delete memoryCache[oldestKey];
        }
    }

    // Store item
    memoryCache[key] = data;
}

/**
 * Save data to storage with both new and old formats
 */
export function saveToStorage<T>(key: string, data: T, lat?: number, lon?: number): void {
    try {
        // New format storage
        const newKey = getStorageKey(key, lat, lon);
        localStorage.setItem(newKey, JSON.stringify(data));
        addToMemoryCache(newKey, data);

        // Legacy format for backward compatibility
        const oldKey = getLegacyStorageKey(key, lat, lon);
        if (oldKey) {
            localStorage.setItem(oldKey, JSON.stringify({
                data,
                timestamp: new Date().toISOString(),
                location: lat && lon ? `${lat.toFixed(4)}_${lon.toFixed(4)}` : undefined,
                version: '1.0'
            }));
        }
    } catch (error) {
        console.error(`Error saving to storage: ${key}`, error);
    }
}

/**
 * Load data from storage, trying both new and old formats
 */
export function loadFromStorage<T>(key: string, lat?: number, lon?: number): T | null {
    try {
        // Try memory cache first
        const newKey = getStorageKey(key, lat, lon);
        if (memoryCache[newKey] !== undefined) {
            // Move to end of LRU list
            const existingIndex = memoryCacheKeys.indexOf(newKey);
            if (existingIndex >= 0) {
                memoryCacheKeys.splice(existingIndex, 1);
                memoryCacheKeys.push(newKey);
            }
            return memoryCache[newKey] as T;
        }

        // Try new format in localStorage
        const newData = localStorage.getItem(newKey);
        if (newData) {
            try {
                const parsed = JSON.parse(newData) as T;
                addToMemoryCache(newKey, parsed);
                return parsed;
            } catch (e) {
                console.error(`Error parsing data for ${key}`, e);
            }
        }

        // Try old format as fallback
        const oldKey = getLegacyStorageKey(key, lat, lon);
        if (oldKey) {
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                try {
                    const parsed = JSON.parse(oldData);
                    if (parsed && parsed.data) {
                        const data = parsed.data as T;

                        // Migrate to new format for next time
                        saveToStorage(key, data, lat, lon);

                        return data;
                    }
                } catch (e) {
                    console.error(`Error parsing legacy data for ${key}`, e);
                }
            }
        }

        return null;
    } catch (error) {
        console.error(`Error loading from storage: ${key}`, error);
        return null;
    }
}

/**
 * Remove item from storage (both formats)
 */
export function removeFromStorage(key: string, lat?: number, lon?: number): void {
    try {
        // Remove new format
        const newKey = getStorageKey(key, lat, lon);
        localStorage.removeItem(newKey);

        // Remove from memory cache
        const existingIndex = memoryCacheKeys.indexOf(newKey);
        if (existingIndex >= 0) {
            memoryCacheKeys.splice(existingIndex, 1);
        }
        delete memoryCache[newKey];

        // Remove old format
        const oldKey = getLegacyStorageKey(key, lat, lon);
        if (oldKey) {
            localStorage.removeItem(oldKey);
        }
    } catch (error) {
        console.error(`Error removing from storage: ${key}`, error);
    }
}

/**
 * Clear all weather data from storage
 */
export function clearWeatherCache(): void {
    try {
        // Clear memory cache
        Object.keys(memoryCache).forEach(key => {
            if (
                key.includes(STORAGE_KEYS.CURRENT_WEATHER) ||
                key.includes(STORAGE_KEYS.HOURLY_FORECAST) ||
                key.includes(STORAGE_KEYS.DAILY_FORECAST)
            ) {
                delete memoryCache[key];
            }
        });

        // Update keys list
        memoryCacheKeys.length = 0;
        Object.keys(memoryCache).forEach(key => memoryCacheKeys.push(key));

        // Clear localStorage (both formats)
        Object.keys(localStorage).forEach(key => {
            if (
                key.includes(STORAGE_KEYS.CURRENT_WEATHER) ||
                key.includes(STORAGE_KEYS.HOURLY_FORECAST) ||
                key.includes(STORAGE_KEYS.DAILY_FORECAST) ||
                key.includes('weather_current') ||
                key.includes('weather_hourly') ||
                key.includes('weather_daily')
            ) {
                localStorage.removeItem(key);
            }
        });

        console.log('Weather cache cleared');
    } catch (error) {
        console.error('Error clearing weather cache', error);
    }
}

/**
 * Check if stored data is expired
 */
export function isDataExpired(timestamp: string, maxAge: number = 60): boolean {
    const storedTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const maxAgeMs = maxAge * 60 * 1000;
    return (currentTime - storedTime) > maxAgeMs;
}

/**
 * Check if device is offline
 */
export function isOffline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * Setup offline event listeners
 */
export function setupOfflineListeners(
    onOffline: () => void,
    onOnline: () => void
): () => void {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Return cleanup function
    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
}

/**
 * Check localStorage availability
 */
export function isStorageAvailable(): boolean {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}
