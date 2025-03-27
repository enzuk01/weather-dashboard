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
        timestamp: new Date().toISOString(),
        temperature_2m: 22.5,
        apparent_temperature: 23.1,
        relative_humidity_2m: 65,
        precipitation: 0,
        rain: 0,
        snowfall: 0,
        weather_code: 1, // Mainly clear
        wind_speed_10m: 12,
        wind_direction_10m: 230,
        surface_pressure: 1015,
        is_day: 1
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

    // Generate mock temperature values
    const temperature2mArray: number[] = [];
    const apparentTemperatureArray: number[] = [];
    const precipitationProbabilityArray: number[] = [];
    const precipitationArray: number[] = [];
    const weatherCodeArray: number[] = [];
    const isDayArray: number[] = [];
    const windSpeedArray: number[] = [];
    const windDirectionArray: number[] = [];
    const humidityArray: number[] = [];
    const windGustsArray: number[] = [];

    for (let i = 0; i < 24; i++) {
        const hour = (now.getHours() + i) % 24;

        // Temperature varies throughout the day
        const baseTemp = 20 + Math.sin((hour - 12) * Math.PI / 12) * 8;
        temperature2mArray.push(parseFloat(baseTemp.toFixed(1)));

        // Apparent temperature is usually slightly different
        apparentTemperatureArray.push(parseFloat((baseTemp + (Math.random() * 2 - 1)).toFixed(1)));

        // Precipitation probability
        precipitationProbabilityArray.push(Math.floor(Math.random() * 30));

        // Precipitation amount
        precipitationArray.push(parseFloat((Math.random() * 0.5).toFixed(2)));

        // Weather code (1: clear, 2: partly cloudy, 3: cloudy)
        weatherCodeArray.push(Math.floor(Math.random() * 3) + 1);

        // Is day (1 for day, 0 for night)
        isDayArray.push(hour >= 6 && hour < 20 ? 1 : 0);

        // Wind speed
        windSpeedArray.push(parseFloat((5 + Math.random() * 10).toFixed(1)));

        // Wind direction
        windDirectionArray.push(Math.floor(Math.random() * 360));

        // Humidity
        humidityArray.push(Math.floor(50 + Math.random() * 30));

        // Wind gusts
        windGustsArray.push(parseFloat((8 + Math.random() * 15).toFixed(1)));
    }

    return {
        timestamps,
        temperature_2m: temperature2mArray,
        apparent_temperature: apparentTemperatureArray,
        precipitation_probability: precipitationProbabilityArray,
        precipitation: precipitationArray,
        weather_code: weatherCodeArray,
        is_day: isDayArray,
        wind_speed_10m: windSpeedArray,
        wind_direction_10m: windDirectionArray,
        relative_humidity_2m: humidityArray,
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

    // Generate mock data for each day
    const temperature2mMax: number[] = [];
    const temperature2mMin: number[] = [];
    const apparentTemperatureMax: number[] = [];
    const apparentTemperatureMin: number[] = [];
    const sunrise: string[] = [];
    const sunset: string[] = [];
    const uvIndexMax: number[] = [];
    const precipitationSum: number[] = [];
    const rainSum: number[] = [];
    const snowfallSum: number[] = [];
    const precipitationProbabilityMax: number[] = [];
    const weatherCode: number[] = [];
    const windDirection10mDominant: number[] = [];
    const windSpeed10mMax: number[] = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Base temperature for the day with slight variations by day
        const baseTemp = 20 + Math.sin(i * Math.PI / 7) * 5;

        // Max and min temperatures
        temperature2mMax.push(parseFloat((baseTemp + 5 + Math.random() * 3).toFixed(1)));
        temperature2mMin.push(parseFloat((baseTemp - 5 - Math.random() * 3).toFixed(1)));

        // Apparent temperatures
        apparentTemperatureMax.push(parseFloat((temperature2mMax[i] + Math.random() * 2 - 1).toFixed(1)));
        apparentTemperatureMin.push(parseFloat((temperature2mMin[i] + Math.random() * 2 - 1).toFixed(1)));

        // Sunrise time (around 6am with slight variation)
        const sunriseDate = new Date(date);
        sunriseDate.setHours(6, Math.floor(Math.random() * 30), 0);
        sunrise.push(sunriseDate.toISOString());

        // Sunset time (around 8pm with slight variation)
        const sunsetDate = new Date(date);
        sunsetDate.setHours(20, Math.floor(Math.random() * 30), 0);
        sunset.push(sunsetDate.toISOString());

        // UV Index (0-11)
        uvIndexMax.push(Math.floor(Math.random() * 8) + 3);

        // Precipitation-related values
        const dayPrecipitation = Math.random() * 10;
        precipitationSum.push(parseFloat(dayPrecipitation.toFixed(1)));

        // Mostly rain, less snow
        rainSum.push(parseFloat((dayPrecipitation * 0.8).toFixed(1)));
        snowfallSum.push(parseFloat((dayPrecipitation * 0.2).toFixed(1)));

        // Precipitation probability
        precipitationProbabilityMax.push(Math.floor(Math.random() * 100));

        // Weather code (1-3: clear, partly cloudy, cloudy)
        weatherCode.push(Math.floor(Math.random() * 3) + 1);

        // Wind-related values
        windDirection10mDominant.push(Math.floor(Math.random() * 360));
        windSpeed10mMax.push(parseFloat((10 + Math.random() * 15).toFixed(1)));
    }

    return {
        time,
        temperature_2m_max: temperature2mMax,
        temperature_2m_min: temperature2mMin,
        apparent_temperature_max: apparentTemperatureMax,
        apparent_temperature_min: apparentTemperatureMin,
        sunrise,
        sunset,
        uv_index_max: uvIndexMax,
        precipitation_sum: precipitationSum,
        rain_sum: rainSum,
        snowfall_sum: snowfallSum,
        precipitation_probability_max: precipitationProbabilityMax,
        weather_code: weatherCode,
        wind_direction_10m_dominant: windDirection10mDominant,
        wind_speed_10m_max: windSpeed10mMax
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