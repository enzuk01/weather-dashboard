export interface Location {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

export interface WeatherData {
    location: Location;
    current: {
        temperature: number;
        feelsLike: number;
        humidity: number;
        windSpeed: number;
        windDirection: number;
        precipitation: number;
        pressure: number;
        weatherCode: number;
        description: string;
    };
    hourly: {
        time: number[];
        temperature: number[];
        precipitation: number[];
        precipitationProbability: number[];
        windSpeed: number[];
        windDirection: number[];
        weatherCode: number[];
    };
    daily: {
        time: number[];
        temperatureMax: number[];
        temperatureMin: number[];
        precipitation: number[];
        precipitationProbability: number[];
        windSpeed: number[];
        windDirection: number[];
        weatherCode: number[];
    };
    sunrise: number;
    sunset: number;
}