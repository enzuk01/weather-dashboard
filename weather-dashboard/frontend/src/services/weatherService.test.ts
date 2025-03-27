import { fetchCurrentWeather, fetchHourlyForecast, fetchWeatherCodes } from './weatherService';

// Mock the fetch function
global.fetch = jest.fn();

describe('weatherService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchCurrentWeather', () => {
        it('should fetch current weather data successfully', async () => {
            const mockData = {
                timestamp: '2023-04-01T12:00:00Z',
                latitude: 40.7128,
                longitude: -74.0060,
                temperature_2m: 22.5,
                relative_humidity_2m: 45,
                precipitation: 0,
                wind_speed_10m: 10,
                wind_direction_10m: 180,
                elevation: 10,
                timezone: 'America/New_York'
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await fetchCurrentWeather(40.7128, -74.0060);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/weather/current?lat=40.7128&lon=-74.006'
            );
            expect(result).toEqual(mockData);
        });

        it('should throw an error when the API call fails', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            });

            await expect(fetchCurrentWeather(40.7128, -74.0060)).rejects.toThrow(
                'Failed to fetch current weather: Not Found'
            );
        });
    });

    describe('fetchHourlyForecast', () => {
        it('should fetch hourly forecast data successfully', async () => {
            const mockData = {
                timestamps: ['2023-04-01T12:00:00Z', '2023-04-01T13:00:00Z'],
                temperature_2m: [22.5, 23],
                precipitation_probability: [0, 10],
                precipitation: [0, 0.5],
                wind_speed_10m: [10, 12],
                wind_direction_10m: [180, 200],
                latitude: 40.7128,
                longitude: -74.0060,
                elevation: 10,
                timezone: 'America/New_York'
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await fetchHourlyForecast(40.7128, -74.0060, 24);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/weather/forecast/hourly?lat=40.7128&lon=-74.006&hours=24'
            );
            expect(result).toEqual(mockData);
        });

        it('should use default hours parameter when not specified', async () => {
            const mockData = { /* mock data */ };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            await fetchHourlyForecast(40.7128, -74.0060);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/weather/forecast/hourly?lat=40.7128&lon=-74.006&hours=48'
            );
        });

        it('should throw an error when the API call fails', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Server Error'
            });

            await expect(fetchHourlyForecast(40.7128, -74.0060)).rejects.toThrow(
                'Failed to fetch hourly forecast: Server Error'
            );
        });
    });

    describe('fetchWeatherCodes', () => {
        it('should fetch weather codes successfully', async () => {
            const mockData = {
                0: "Clear sky",
                1: "Mainly clear",
                2: "Partly cloudy"
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await fetchWeatherCodes();

            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/weather/codes');
            expect(result).toEqual(new Map([
                [0, "Clear sky"],
                [1, "Mainly clear"],
                [2, "Partly cloudy"]
            ]));
        });

        it('should throw an error when the API call fails', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Server Error'
            });

            await expect(fetchWeatherCodes()).rejects.toThrow(
                'Failed to fetch weather codes: Server Error'
            );
        });
    });
});