/**
 * Date utility functions for common date operations
 */

/**
 * Checks if two dates represent the same day
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns true if the dates are the same day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * Checks if two dates represent the same hour of the same day
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns true if the dates are the same hour of the same day, false otherwise
 */
export function isSameHour(date1: Date, date2: Date): boolean {
    return (
        isSameDay(date1, date2) &&
        date1.getHours() === date2.getHours()
    );
}

/**
 * Formats a date to a time string based on the specified format
 * @param date The date to format
 * @param format The time format ('12h' or '24h')
 * @param includeMinutes Whether to include minutes in the output
 * @returns Formatted time string
 */
export function formatTime(date: Date, format: '12h' | '24h' = '24h', includeMinutes: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: includeMinutes ? '2-digit' : undefined,
        hour12: format === '12h'
    };

    return date.toLocaleTimeString([], options);
}

/**
 * Formats a date to a day string (e.g., "Mon", "Tue")
 * @param date The date to format
 * @param short Whether to use short day names (Mon vs Monday)
 * @returns Formatted day string
 */
export function formatDay(date: Date, short: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: short ? 'short' : 'long'
    };

    return date.toLocaleDateString([], options);
}

/**
 * Formats a date to a date string (e.g., "Jan 1")
 * @param date The date to format
 * @param format The format to use
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
    const options: Intl.DateTimeFormatOptions = {
        month: format === 'short' ? 'short' : format === 'medium' ? 'short' : 'long',
        day: 'numeric',
        year: format === 'long' ? 'numeric' : undefined
    };

    return date.toLocaleDateString([], options);
}

/**
 * Returns a full formatted date and time (e.g., "Mon, Jan 1, 2023, 12:00 PM")
 * @param date The date to format
 * @param format The time format ('12h' or '24h')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date, format: '12h' | '24h' = '24h'): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: format === '12h'
    };

    return date.toLocaleString([], options);
}

/**
 * Gets the timestamp for the start of the current day
 * @returns Date object set to the start of the current day
 */
export function startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

/**
 * Gets the timestamp for the end of the current day
 * @returns Date object set to the end of the current day
 */
export function endOfToday(): Date {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
}

/**
 * Gets a date that is N days from today
 * @param days Number of days to add (negative for past dates)
 * @returns Date object N days from today
 */
export function daysFromToday(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

/**
 * Checks if a date is today
 * @param date Date to check
 * @returns true if the date is today, false otherwise
 */
export function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

/**
 * Checks if a date is in the future
 * @param date Date to check
 * @returns true if the date is in the future, false otherwise
 */
export function isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
}

/**
 * Checks if a date is in the past
 * @param date Date to check
 * @returns true if the date is in the past, false otherwise
 */
export function isPast(date: Date): boolean {
    return date.getTime() < Date.now();
}