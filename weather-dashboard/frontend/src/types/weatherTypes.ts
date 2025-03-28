/**
 * Types for the weather data responses from the API
 */

// Current weather data
export interface CurrentWeatherData {
    // Temperature at 2 meters above ground in degrees Celsius
    temperature_2m: number;

    // Apparent (feels like) temperature in degrees Celsius
    apparent_temperature?: number;

    // Feels like temperature in degrees Celsius (alternative field name)
    feels_like_temperature?: number;

    // Relative humidity at 2 meters above ground in percentage
    relative_humidity_2m: number;

    // Precipitation amount in millimeters
    precipitation: number;

    // Precipitation probability in percentage
    precipitation_probability?: number;

    // Wind speed at 10 meters above ground in km/h
    wind_speed_10m: number;

    // Wind direction at 10 meters above ground in degrees
    wind_direction_10m: number;

    // Surface pressure in hPa
    surface_pressure: number;

    // Weather condition code according to WMO (World Meteorological Organization)
    weather_code: number;

    // Daylight indicator (1 for day, 0 for night)
    is_day: number;

    // UV index
    uv_index?: number;
}

// Hourly forecast data
export interface HourlyForecastData {
    // Array of timestamps for the hourly forecast
    timestamps: string[];

    // Array of temperatures at 2 meters above ground in degrees Celsius
    temperature_2m: number[];

    // Array of precipitation amounts in millimeters
    precipitation: number[];

    // Array of precipitation probabilities in percentage
    precipitation_probability: number[];

    // Array of wind speeds at 10 meters above ground in km/h
    wind_speed_10m: number[];

    // Array of wind directions at 10 meters above ground in degrees
    wind_direction_10m: number[];

    // Array of wind gust speeds at 10 meters above ground in km/h
    wind_gusts_10m?: number[];

    // Array of weather condition codes according to WMO
    weather_code: number[];

    // Array of daylight indicators (1 for day, 0 for night)
    is_day: number[];
}

// Daily forecast data
export interface DailyForecastData {
    // Array of dates for the daily forecast
    time: string[];

    // Array of maximum temperatures in degrees Celsius
    temperature_2m_max: number[];

    // Array of minimum temperatures in degrees Celsius
    temperature_2m_min: number[];

    // Array of precipitation sum values in millimeters
    precipitation_sum: number[];

    // Array of precipitation probability maximum values in percentage
    precipitation_probability_max: number[];

    // Array of maximum wind speeds during the day
    wind_speed_10m_max: number[];

    // Array of dominant wind directions during the day
    wind_direction_10m_dominant: number[];

    // Array of weather condition codes during the day
    weather_code: number[];

    // Array of sunrise times for each day
    sunrise: string[];

    // Array of sunset times for each day
    sunset: string[];
}

// Location data
export interface LocationData {
    name: string;
    country: string;
    state?: string;
    latitude: number;
    longitude: number;
}

// User preferences for the weather dashboard
export interface UserPreferences {
    temperatureUnit: 'celsius' | 'fahrenheit';
    windSpeedUnit: 'km/h' | 'mph' | 'm/s';
    timeFormat: '12h' | '24h';
    defaultLocation: LocationData | null;
    favoriteLocations: LocationData[];
    theme: 'light' | 'dark' | 'auto';
}

// Combined weather data interface
export interface WeatherData {
    current: CurrentWeatherData;
    hourly: HourlyForecastData;
    daily: DailyForecastData;
    location: LocationData;
}