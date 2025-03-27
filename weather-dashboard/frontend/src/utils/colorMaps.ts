// Color mapping utilities for data visualization

// Temperature color map (from cold blue to hot red)
export const getTemperatureColor = (temp: number): string => {
    if (temp <= 0) return '#38BDF8';  // Cold blue
    if (temp <= 10) return '#60A5FA'; // Light blue
    if (temp <= 15) return '#93C5FD'; // Lighter blue
    if (temp <= 20) return '#FBBF24'; // Yellow
    if (temp <= 25) return '#FB923C'; // Orange
    if (temp <= 30) return '#F97316'; // Dark orange
    return '#EF4444';                 // Red
};

// Precipitation probability color map
export const getPrecipitationColor = (probability: number): string => {
    if (probability <= 10) return '#F1F5F9'; // Very light blue
    if (probability <= 25) return '#E0F2FE'; // Light blue
    if (probability <= 50) return '#7DD3FC'; // Medium blue
    if (probability <= 75) return '#38BDF8'; // Blue
    return '#0EA5E9';                        // Dark blue
};

// Wind speed color map
export const getWindSpeedColor = (speed: number): string => {
    if (speed <= 5) return '#D1D5DB';  // Light gray
    if (speed <= 10) return '#9CA3AF'; // Medium gray
    if (speed <= 20) return '#6B7280'; // Dark gray
    if (speed <= 30) return '#4B5563'; // Darker gray
    return '#1F2937';                  // Almost black
};

// Get a weather condition color
export const getWeatherConditionColor = (condition: string): string => {
    switch (condition.toLowerCase()) {
        case 'clear':
            return '#FFD700'; // Sunny/clear gold
        case 'partly cloudy':
        case 'cloudy':
            return '#94A3B8'; // Cloudy gray
        case 'rain':
        case 'drizzle':
            return '#38BDF8'; // Rainy blue
        case 'snow':
            return '#F1F5F9'; // Snowy white
        case 'thunderstorm':
        case 'stormy':
            return '#3730A3'; // Stormy deep blue
        case 'fog':
        case 'foggy':
        case 'mist':
            return '#CBD5E1'; // Foggy light gray
        default:
            return '#94A3B8'; // Default gray
    }
};