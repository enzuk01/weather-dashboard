import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrentWeatherDisplay from '../CurrentWeatherDisplay';
import { fetchCurrentWeather } from '../../services/weatherService';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { CurrentWeatherData } from '../../types/weatherTypes';

// Mock the weather service
jest.mock('../../services/weatherService');
const mockFetchCurrentWeather = fetchCurrentWeather as jest.MockedFunction<typeof fetchCurrentWeather>;

describe('CurrentWeatherDisplay', () => {
    const mockWeatherData: CurrentWeatherData = {
        temperature_2m: 20,
        apparent_temperature: 21,
        relative_humidity_2m: 65,
        precipitation: 0,
        precipitation_probability: 10,
        wind_speed_10m: 12,
        wind_direction_10m: 230,
        surface_pressure: 1015,
        weather_code: 1,
        is_day: 1,
        uv_index: 5
    };

    const mockProps = {
        latitude: 0,
        longitude: 0
    };

    beforeEach(() => {
        mockFetchCurrentWeather.mockReset();
    });

    it('shows loading state when fetching data', () => {
        mockFetchCurrentWeather.mockImplementation(() => new Promise(() => { }));

        render(
            <ThemeProvider>
                <SettingsProvider>
                    <CurrentWeatherDisplay {...mockProps} />
                </SettingsProvider>
            </ThemeProvider>
        );

        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it('displays weather data when loaded', async () => {
        mockFetchCurrentWeather.mockResolvedValue(mockWeatherData);

        render(
            <ThemeProvider>
                <SettingsProvider>
                    <CurrentWeatherDisplay {...mockProps} />
                </SettingsProvider>
            </ThemeProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('20°C')).toBeInTheDocument();
            expect(screen.getByText('65%')).toBeInTheDocument();
            expect(screen.getByText('12 kph')).toBeInTheDocument();
            expect(screen.getByText('0.0 mm')).toBeInTheDocument();
        });
    });

    it('shows error message when fetch fails', async () => {
        const errorMessage = 'Failed to fetch';
        mockFetchCurrentWeather.mockRejectedValue(new Error(errorMessage));

        render(
            <ThemeProvider>
                <SettingsProvider>
                    <CurrentWeatherDisplay {...mockProps} />
                </SettingsProvider>
            </ThemeProvider>
        );

        const error = await screen.findByText(/Failed to load current weather data/i);
        expect(error).toBeInTheDocument();
    });
});