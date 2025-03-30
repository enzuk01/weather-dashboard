/**
 * Utility functions for date and time formatting
 */

/**
 * Formats a timestamp string to a localized time string
 * @param timestamp ISO timestamp string
 * @returns Formatted time string (e.g. "10:30 AM")
 */
export const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats a timestamp string to a localized date string
 * @param timestamp ISO timestamp string
 * @returns Formatted date string (e.g. "Jan 15")
 */
export const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Formats a timestamp string to a localized day name
 * @param timestamp ISO timestamp string
 * @returns Day name (e.g. "Monday")
 */
export const formatDay = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long' });
};

/**
 * Formats a timestamp string to a short day name
 * @param timestamp ISO timestamp string
 * @returns Short day name (e.g. "Mon")
 */
export const formatShortDay = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'short' });
};

/**
 * Returns true if the given date is today
 * @param timestamp ISO timestamp string
 * @returns boolean
 */
export const isToday = (timestamp: string): boolean => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};