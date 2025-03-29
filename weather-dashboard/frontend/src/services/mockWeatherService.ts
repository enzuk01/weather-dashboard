import { CurrentWeatherData, HourlyForecastData, DailyForecastData } from '../types/weatherTypes';

/**
 * Mock implementation of the weather service for testing
 */

export const fetchCurrentWeather = async (
    latitude: number,
    longitude: number
): Promise<CurrentWeatherData> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock current weather data
    return {
        temperature_2m: 22.5,
        apparent_temperature: 23.1,
        relative_humidity_2m: 65,
        precipitation: 0,
        precipitation_probability: 10,
        wind_speed_10m: 12,
        wind_direction_10m: 230,
        surface_pressure: 1015,
        weather_code: 1, // Mainly clear
        is_day: 1,
        uv_index: 5
    };
};

export const fetchHourlyForecast = async (
    latitude: number,
    longitude: number
): Promise<HourlyForecastData> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Generate timestamp array for the next 24 hours
    const now = new Date();
    const timestamps: string[] = [];
    for (let i = 0; i < 24; i++) {
        const date = new Date(now);
        date.setHours(now.getHours() + i);
        timestamps.push(date.toISOString());
    }

    // Generate mock data arrays
    const temperature2mArray = Array.from({ length: 24 }, (_, i) => 20 + i);
    const precipitationProbabilityArray = Array.from({ length: 24 }, (_, i) => 10 + i);
    const precipitationArray = Array.from({ length: 24 }, (_, i) => i * 0.1);
    const weatherCodeArray = Array.from({ length: 24 }, () => 1);
    const isDayArray = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(now.getTime() + i * 3600000).getHours();
        return hour >= 6 && hour < 18 ? 1 : 0;
    });
    const windSpeedArray = Array.from({ length: 24 }, (_, i) => 10 + i);
    const windDirectionArray = Array.from({ length: 24 }, (_, i) => (i * 15) % 360);
    const windGustsArray = Array.from({ length: 24 }, (_, i) => 15 + i);

    return {
        timestamps,
        temperature_2m: temperature2mArray,
        precipitation_probability: precipitationProbabilityArray,
        precipitation: precipitationArray,
        weather_code: weatherCodeArray,
        is_day: isDayArray,
        wind_speed_10m: windSpeedArray,
        wind_direction_10m: windDirectionArray,
        wind_gusts_10m: windGustsArray
    };
};

export const fetchDailyForecast = async (
    latitude: number,
    longitude: number,
    days: number = 7
): Promise<DailyForecastData> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Generate dates for the forecast period
    const today = new Date();
    const time: string[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        time.push(date.toISOString().split('T')[0]);
    }

    // Generate mock data arrays
    const temperature2mMax = Array.from({ length: days }, (_, i) => 25 + i);
    const temperature2mMin = Array.from({ length: days }, (_, i) => 15 + i);
    const precipitationSum = Array.from({ length: days }, (_, i) => i * 0.5);
    const precipitationProbabilityMax = Array.from({ length: days }, (_, i) => 20 + i);
    const weatherCode = Array.from({ length: days }, () => 1);
    const windDirection10mDominant = Array.from({ length: days }, (_, i) => (i * 15) % 360);
    const windSpeed10mMax = Array.from({ length: days }, (_, i) => 15 + i);
    const sunrise = Array.from({ length: days }, () => '06:00');
    const sunset = Array.from({ length: days }, () => '18:00');

    return {
        time,
        temperature_2m_max: temperature2mMax,
        temperature_2m_min: temperature2mMin,
        precipitation_sum: precipitationSum,
        precipitation_probability_max: precipitationProbabilityMax,
        weather_code: weatherCode,
        wind_direction_10m_dominant: windDirection10mDominant,
        wind_speed_10m_max: windSpeed10mMax,
        sunrise: sunrise,
        sunset: sunset
    };
};

export const mapWeatherCodeToCondition = (weatherCode: number): 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy' => {
    if (weatherCode === 0) return 'clear';
    if (weatherCode <= 3) return 'cloudy';
    if (weatherCode >= 45 && weatherCode <= 49) return 'foggy';
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return 'rainy';
    if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) return 'snowy';
    if (weatherCode >= 95) return 'stormy';
    return 'cloudy';
};