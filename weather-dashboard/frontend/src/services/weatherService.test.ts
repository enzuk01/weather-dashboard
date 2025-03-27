import { fetchCurrentWeather, fetchHourlyForecast, fetchWeatherCodes } from './weatherService';
import { STORAGE_KEYS, loadFromStorage } from '../utils/storageUtils';
import currentWeatherFixture from './__tests__/fixtures/weather/current_weather.json';
import hourlyForecastFixture from './__tests__/fixtures/weather/hourly_forecast.json';
import weatherCodesFixture from './__tests__/fixtures/weather/weather_codes.json';

// Mock fetch and storage functions
global.fetch = jest.fn();
jest.mock('../utils/storageUtils', () => ({
    STORAGE_KEYS: {
        CURRENT_WEATHER: 'weather_current',
        HOURLY_FORECAST: 'weather_hourly',
        DAILY_FORECAST: 'weather_daily'
    },
    loadFromStorage: jest.fn(),
    saveToStorage: jest.fn(),
    isOffline: jest.fn().mockReturnValue(false)
}));

describe('weatherService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (loadFromStorage as jest.Mock).mockReturnValue(null); // No cached data by default
    });

    describe('fetchCurrentWeather', () => {
        test('should fetch current weather data successfully', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(currentWeatherFixture)
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await fetchCurrentWeather(40.7128, -74.0060);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5001/weather/current?lat=40.7128&lon=-74.006'
            );
            expect(result).toEqual(currentWeatherFixture);
        });

        test('should throw an error when the API call fails and no cache is available', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ message: 'Server Error' })
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);
            (loadFromStorage as jest.Mock).mockReturnValue(null);

            await expect(fetchCurrentWeather(40.7128, -74.0060)).rejects.toThrow(
                'Server Error'
            );
        });

        test('should use cached data when API call fails', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ message: 'Server Error' })
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);
            (loadFromStorage as jest.Mock).mockReturnValue(currentWeatherFixture);

            const result = await fetchCurrentWeather(40.7128, -74.0060);
            expect(result).toEqual(currentWeatherFixture);
        });
    });

    describe('fetchHourlyForecast', () => {
        test('should fetch hourly forecast data successfully', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(hourlyForecastFixture)
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await fetchHourlyForecast(40.7128, -74.0060);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5001/weather/forecast/hourly?lat=40.7128&lon=-74.006&hours=24'
            );
            expect(result).toEqual(hourlyForecastFixture);
        });

        test('should throw an error when the API call fails and no cache is available', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ message: 'Server Error' })
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);
            (loadFromStorage as jest.Mock).mockReturnValue(null);

            await expect(fetchHourlyForecast(40.7128, -74.0060)).rejects.toThrow(
                'Failed to fetch hourly forecast'
            );
        });

        test('should use cached data when API call fails', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ message: 'Server Error' })
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);
            (loadFromStorage as jest.Mock).mockReturnValue(hourlyForecastFixture);

            const result = await fetchHourlyForecast(40.7128, -74.0060);
            expect(result).toEqual(hourlyForecastFixture);
        });
    });

    describe('fetchWeatherCodes', () => {
        test('should fetch weather codes successfully', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(weatherCodesFixture)
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await fetchWeatherCodes();

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5001/weather/codes'
            );
            // Convert the fixture object to a Map for comparison
            const expectedMap = new Map(Object.entries(weatherCodesFixture).map(([key, value]) => [parseInt(key), value]));
            expect(result).toEqual(expectedMap);
        });

        test('should throw an error when the API call fails', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                json: jest.fn().mockResolvedValue({ message: 'Server Error' })
            };
            (fetch as jest.Mock).mockResolvedValue(mockResponse);

            await expect(fetchWeatherCodes()).rejects.toThrow(
                'Failed to fetch weather codes'
            );
        });
    });
});