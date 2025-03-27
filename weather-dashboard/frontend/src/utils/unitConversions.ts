/**
 * Unit conversion utilities for the weather dashboard
 */

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param value - The temperature value to convert
 * @param from - The source unit ('celsius' or 'fahrenheit')
 * @param to - The target unit ('celsius' or 'fahrenheit')
 * @returns The converted temperature value
 */
export const convertTemperature = (
    value: number,
    from: 'celsius' | 'fahrenheit',
    to: 'celsius' | 'fahrenheit'
): number => {
    // Same unit, no conversion needed
    if (from === to) return value;

    // Convert from Celsius to Fahrenheit
    if (from === 'celsius' && to === 'fahrenheit') {
        return (value * 9 / 5) + 32;
    }

    // Convert from Fahrenheit to Celsius
    if (from === 'fahrenheit' && to === 'celsius') {
        return (value - 32) * 5 / 9;
    }

    // Should never reach here
    return value;
};

/**
 * Format temperature for display with the appropriate unit symbol
 * @param value - The temperature value
 * @param unit - The temperature unit ('celsius' or 'fahrenheit')
 * @param precision - Number of decimal places (defaults to 0)
 * @returns Formatted temperature string with unit symbol
 */
export const formatTemperature = (
    value: number,
    unit: 'celsius' | 'fahrenheit',
    precision: number = 0
): string => {
    const roundedValue = Number(value.toFixed(precision));
    const symbol = unit === 'celsius' ? '°C' : '°F';
    return `${roundedValue}${symbol}`;
};

/**
 * Convert wind speed between kilometers per hour and miles per hour
 * @param value - The wind speed value to convert
 * @param from - The source unit ('km/h' or 'mph')
 * @param to - The target unit ('km/h' or 'mph')
 * @returns The converted wind speed value
 */
export const convertWindSpeed = (
    value: number,
    from: 'km/h' | 'mph',
    to: 'km/h' | 'mph'
): number => {
    // Same unit, no conversion needed
    if (from === to) return value;

    // Convert from km/h to mph
    if (from === 'km/h' && to === 'mph') {
        return value * 0.621371;
    }

    // Convert from mph to km/h
    if (from === 'mph' && to === 'km/h') {
        return value * 1.60934;
    }

    // Should never reach here
    return value;
};

/**
 * Format wind speed for display with the appropriate unit symbol
 * @param value - The wind speed value
 * @param unit - The wind speed unit ('km/h' or 'mph')
 * @param precision - Number of decimal places (defaults to 0)
 * @returns Formatted wind speed string with unit
 */
export const formatWindSpeed = (
    value: number,
    unit: 'km/h' | 'mph',
    precision: number = 0
): string => {
    const roundedValue = Number(value.toFixed(precision));
    return `${roundedValue} ${unit}`;
};

/**
 * Convert precipitation between millimeters and inches
 * @param value - The precipitation value to convert
 * @param from - The source unit ('mm' or 'in')
 * @param to - The target unit ('mm' or 'in')
 * @returns The converted precipitation value
 */
export const convertPrecipitation = (
    value: number,
    from: 'mm' | 'in',
    to: 'mm' | 'in'
): number => {
    // Same unit, no conversion needed
    if (from === to) return value;

    // Convert from mm to inches
    if (from === 'mm' && to === 'in') {
        return value * 0.0393701;
    }

    // Convert from inches to mm
    if (from === 'in' && to === 'mm') {
        return value * 25.4;
    }

    // Should never reach here
    return value;
};

/**
 * Format precipitation for display with the appropriate unit symbol
 * @param value - The precipitation value
 * @param unit - The precipitation unit ('mm' or 'in')
 * @param precision - Number of decimal places (defaults to 1)
 * @returns Formatted precipitation string with unit
 */
export const formatPrecipitation = (
    value: number,
    unit: 'mm' | 'in',
    precision: number = 1
): string => {
    const roundedValue = Number(value.toFixed(precision));
    return `${roundedValue} ${unit}`;
};