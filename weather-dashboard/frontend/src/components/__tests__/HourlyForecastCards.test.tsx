import React from 'react';
import { render, screen, waitFor, act } from '../../test-utils/test-utils';
import '@testing-library/jest-dom';
import HourlyForecastCards from '../HourlyForecastCards';
import { fetchHourlyForecast } from '../../services/weatherService';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { HourlyForecastData } from '../../types/weatherTypes';

// Mock the weather service
jest.mock('../../services/weatherService');
const mockFetchHourlyForecast = fetchHourlyForecast as jest.MockedFunction<typeof fetchHourlyForecast>;

describe('HourlyForecastCards', () => {
    const mockHourlyData: HourlyForecastData = {
        timestamps: Array.from({ length: 24 }, (_, i) => new Date(Date.now() + i * 3600000).toISOString()),
        temperature_2m: Array.from({ length: 24 }, (_, i) => 20 + i),
        apparent_temperature: Array.from({ length: 24 }, (_, i) => 22 + i),
        precipitation_probability: Array.from({ length: 24 }, (_, i) => 10 + i),
        precipitation: Array.from({ length: 24 }, (_, i) => i * 0.1),
        rain: Array.from({ length: 24 }, (_, i) => i * 0.1),
        showers: Array.from({ length: 24 }, () => 0),
        snowfall: Array.from({ length: 24 }, () => 0),
        cloud_cover: Array.from({ length: 24 }, (_, i) => 50 + i),
        wind_speed_10m: Array.from({ length: 24 }, (_, i) => 5 + i),
        wind_direction_10m: Array.from({ length: 24 }, (_, i) => 180 + i),
        weather_code: Array.from({ length: 24 }, () => 0),
        is_day: Array.from({ length: 24 }, (_, i) => i >= 6 && i <= 18 ? 1 : 0),
        relative_humidity_2m: Array.from({ length: 24 }, () => 70),
        wind_gusts_10m: Array.from({ length: 24 }, (_, i) => 8 + i)
    };

    const mockProps = {
        latitude: 0,
        longitude: 0
    };

    const renderWithProviders = (children: React.ReactNode) => {
        return render(
            <ThemeProvider>
                <SettingsProvider>
                    {children}
                </SettingsProvider>
            </ThemeProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('shows loading state initially', async () => {
        // Set up a promise that won't resolve immediately
        const loadingPromise = new Promise<HourlyForecastData>(() => { });
        mockFetchHourlyForecast.mockReturnValue(loadingPromise);

        await act(async () => {
            render(<HourlyForecastCards {...mockProps} />);
        });

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByText('Loading hourly forecast...')).toBeInTheDocument();
    });

    test('displays hourly forecast data when loaded successfully', async () => {
        mockFetchHourlyForecast.mockResolvedValueOnce(mockHourlyData);

        await act(async () => {
            render(<HourlyForecastCards {...mockProps} />);
        });

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText('Loading hourly forecast...')).not.toBeInTheDocument();
        });

        // Check if the first hour's data is displayed
        const firstHourTemp = await screen.findByText(`${Math.round(mockHourlyData.temperature_2m[0])}°C`);
        expect(firstHourTemp).toBeInTheDocument();

        // Verify multiple hour cards are rendered
        const hourCards = screen.getAllByText(/^\d{1,2}:\d{2}$/);
        expect(hourCards.length).toBeGreaterThan(1);
    });

    test('shows error message when fetch fails', async () => {
        mockFetchHourlyForecast.mockRejectedValueOnce(new Error('Failed to fetch hourly forecast'));

        await act(async () => {
            render(<HourlyForecastCards {...mockProps} />);
        });

        // Wait for error message
        const errorMessage = await screen.findByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
        expect(screen.getByText('Unable to load forecast data')).toBeInTheDocument();
    });
});