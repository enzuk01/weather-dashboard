/**
 * Types for the weather data responses from the API
 */

// Current weather data
export interface CurrentWeatherData {
    // Temperature at 2 meters above ground in degrees Celsius
    temperature_2m: number;

    // Apparent (feels like) temperature in degrees Celsius
    apparent_temperature: number;

    // Feels like temperature in degrees Celsius (alternative field name)
    feels_like_temperature?: number;

    // Relative humidity at 2 meters above ground in percentage
    relative_humidity_2m: number;

    // Precipitation amount in millimeters
    precipitation: number;

    // Precipitation probability in percentage
    precipitation_probability: number;

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

    // Cloud cover percentage (0-100)
    cloud_cover?: number;
}

// Hourly forecast data
export interface HourlyForecastData {
    timestamps: string[];
    time?: string[];  // Alternative property name that might be used
    temperature_2m: number[];
    apparent_temperature?: number[];
    feels_like_temperature?: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain?: number[];
    showers?: number[];
    snowfall?: number[];
    cloud_cover?: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m?: number[];
    relative_humidity_2m?: number[];
    is_day: number[];
    latitude?: number;
    longitude?: number;
    elevation?: number;
    timezone?: string;
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

    // Additional legacy fields for backward compatibility
    date?: string;
    day?: string;
    min_temp?: number;
    max_temp?: number;
    description?: string;
    icon?: string;
    precipitation?: number;
    wind_speed?: number;
    wind_direction?: number;
    humidity?: number;
    timestamp?: number;
    rain_sum?: number;
    apparent_temperature_max?: number;
    apparent_temperature_min?: number;
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