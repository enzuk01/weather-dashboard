import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherTabs from '../WeatherTabs';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Mock the useTheme hook
jest.mock('../../contexts/ThemeContext', () => ({
    useTheme: () => ({ isDark: true, toggleTheme: jest.fn() }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the child components to isolate WeatherTabs testing
jest.mock('../HourlyForecastCards', () => {
    return jest.fn(() => <div data-testid="hourly-forecast">Hourly Forecast Content</div>);
});

jest.mock('../PrecipitationChart', () => {
    return jest.fn(() => <div data-testid="precipitation-chart">Precipitation Chart Content</div>);
});

jest.mock('../WindChart', () => {
    return jest.fn(() => <div data-testid="wind-chart">Wind Chart Content</div>);
});

jest.mock('../WeatherMap', () => {
    return jest.fn(() => <div data-testid="weather-map">Weather Map Content</div>);
});

jest.mock('../DailyForecastCards', () => {
    return jest.fn(() => <div data-testid="daily-forecast">Daily Forecast Content</div>);
});

describe('WeatherTabs Component', () => {
    test('renders with 24 Hours tab active by default', () => {
        render(<WeatherTabs latitude={40} longitude={-70} />);

        // Check if the 24 Hours tab is active
        const activeTab = screen.getByRole('tab', { selected: true });
        expect(activeTab).toHaveTextContent('24 Hours');

        // Check if hourly content is displayed
        expect(screen.getByTestId('hourly-forecast')).toBeInTheDocument();
        expect(screen.getByTestId('precipitation-chart')).toBeInTheDocument();
        expect(screen.getByTestId('wind-chart')).toBeInTheDocument();
        expect(screen.getByTestId('weather-map')).toBeInTheDocument();
    });

    test('switches to 7 Days tab when clicked', async () => {
        render(<WeatherTabs latitude={40} longitude={-70} />);

        // Click on the 7 Days tab
        fireEvent.click(screen.getByRole('tab', { name: /7 Days/i }));

        // Check if the 7 Days tab is now active
        await waitFor(() => {
            expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('7 Days');
        });

        // Check if the daily forecast content is displayed
        expect(screen.getByTestId('daily-forecast')).toBeInTheDocument();

        // Ensure hourly content is NOT displayed
        expect(screen.queryByTestId('hourly-forecast')).not.toBeInTheDocument();
    });

    test('switches to Historical tab when clicked', async () => {
        render(<WeatherTabs latitude={40} longitude={-70} />);

        // Click on the Historical tab
        fireEvent.click(screen.getByRole('tab', { name: /Historical/i }));

        // Check if the Historical tab is now active
        await waitFor(() => {
            expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Historical');
        });

        // Check if Historical content is displayed (with "Coming Soon" message)
        expect(screen.getByText(/Coming Soon!/i)).toBeInTheDocument();

        // Ensure hourly and daily content is NOT displayed
        expect(screen.queryByTestId('hourly-forecast')).not.toBeInTheDocument();
        expect(screen.queryByTestId('daily-forecast')).not.toBeInTheDocument();
    });

    test('handles rapid tab switching without errors', async () => {
        render(<WeatherTabs latitude={40} longitude={-70} />);

        // Perform rapid tab switching
        const tabs = screen.getAllByRole('tab');

        // Click all tabs in sequence rapidly
        for (const tab of tabs) {
            fireEvent.click(tab);
        }

        // Verify no errors and final tab is active
        await waitFor(() => {
            expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Historical');
        });
    });

    test('passes correct lat/long props to child components', () => {
        const HourlyForecastCards = require('../HourlyForecastCards');
        const PrecipitationChart = require('../PrecipitationChart');
        const WindChart = require('../WindChart');
        const WeatherMap = require('../WeatherMap');

        // Reset mocks before test
        HourlyForecastCards.mockClear();
        PrecipitationChart.mockClear();
        WindChart.mockClear();
        WeatherMap.mockClear();

        const testLat = 35.6895;
        const testLong = 139.6917;

        render(<WeatherTabs latitude={testLat} longitude={testLong} />);

        // Verify correct props were passed to each component
        expect(HourlyForecastCards).toHaveBeenCalledWith(
            expect.objectContaining({
                latitude: testLat,
                longitude: testLong
            }),
            expect.anything()
        );

        expect(PrecipitationChart).toHaveBeenCalledWith(
            expect.objectContaining({
                latitude: testLat,
                longitude: testLong
            }),
            expect.anything()
        );
    });
});