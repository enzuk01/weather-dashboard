/**
 * Utility to clear the application cache
 * This can be run in the browser console to reset all cached data
 */

// Log a notification
console.log('🧹 Clearing weather dashboard cache...');

try {
    // Find and clear all weather-related items
    const keysToRemove = [];

    // Collect keys to remove
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Check for weather-related keys
        if (key && (
            key.includes('weather') ||
            key.includes('forecast') ||
            key.includes('current-') ||
            key.includes('hourly-') ||
            key.includes('daily-')
        )) {
            keysToRemove.push(key);
        }
    }

    // Remove the collected keys
    keysToRemove.forEach(key => {
        console.log(`  - Removing: ${key}`);
        localStorage.removeItem(key);
    });

    // Also clear any memory cache if the function exists
    if (typeof window.__CLEAR_MEMORY_CACHE === 'function') {
        window.__CLEAR_MEMORY_CACHE();
    }

    console.log(`✅ Cache cleared! Removed ${keysToRemove.length} items.`);
    console.log('🔄 Please refresh the page to load fresh data.');
} catch (error) {
    console.error('❌ Error clearing cache:', error);
}