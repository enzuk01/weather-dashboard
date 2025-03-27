/**
 * Time and data sampling utilities for weather components
 */

/**
 * Samples hourly data at 2-hour intervals to create exactly 12 data points
 * starting from the current hour
 *
 * @param timestamps Array of ISO timestamp strings
 * @param dataArrays Object containing arrays of data values that correspond to timestamps
 * @returns Object with sampled timestamps and data arrays
 */
export function sample12HourData<T extends Record<string, number[]>>(
    timestamps: string[],
    dataArrays: T
): { timestamps: string[], dataArrays: T } {
    // Ensure we have at least 24 hours of data
    if (timestamps.length < 24) {
        console.warn('Less than 24 hours of data provided');
        return { timestamps, dataArrays }; // Return original if not enough data
    }

    // Create sampled arrays
    const sampledTimestamps: string[] = [];
    const sampledDataArrays: any = {};

    // Initialize empty arrays for each data property
    Object.keys(dataArrays).forEach(key => {
        sampledDataArrays[key] = [];
    });

    // Sample at 2-hour intervals for 12 points (0, 2, 4, ..., 22)
    for (let i = 0; i < 24; i += 2) {
        if (sampledTimestamps.length < 12) {
            sampledTimestamps.push(timestamps[i]);

            // Sample each data array at the same indices
            Object.keys(dataArrays).forEach(key => {
                sampledDataArrays[key].push(dataArrays[key][i]);
            });
        }
    }

    return {
        timestamps: sampledTimestamps,
        dataArrays: sampledDataArrays as T
    };
}

/**
 * Formats a timestamp for display using the user's local timezone
 *
 * @param timestamp ISO timestamp string
 * @returns Formatted time string (e.g., "14:00")
 */
export function formatLocalTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24-hour format
    });
}