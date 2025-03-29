import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureFlagsProvider, useFeatureFlags } from './FeatureFlagsContext';

// Mock localStorage
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Test component to access the context
const TestComponent = () => {
    const { flags, toggleFlag, resetFlags } = useFeatureFlags();

    return (
        <div>
            <div data-testid="enhanced-weather">{flags.useEnhancedCurrentWeather.toString()}</div>
            <div data-testid="enhanced-sunrise">{flags.useEnhancedSunriseSunset.toString()}</div>
            <button data-testid="toggle-weather" onClick={() => toggleFlag('useEnhancedCurrentWeather')}>
                Toggle Weather
            </button>
            <button data-testid="toggle-sunrise" onClick={() => toggleFlag('useEnhancedSunriseSunset')}>
                Toggle Sunrise
            </button>
            <button data-testid="reset" onClick={resetFlags}>
                Reset
            </button>
        </div>
    );
};

describe('FeatureFlagsContext', () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        jest.clearAllMocks();
    });

    it('renders with default values when localStorage is empty', () => {
        render(
            <FeatureFlagsProvider>
                <TestComponent />
            </FeatureFlagsProvider>
        );

        expect(screen.getByTestId('enhanced-weather').textContent).toBe('false');
        expect(screen.getByTestId('enhanced-sunrise').textContent).toBe('false');
    });

    it('loads values from localStorage if available', () => {
        // Set values in localStorage
        mockLocalStorage.setItem('featureFlags', JSON.stringify({
            useEnhancedCurrentWeather: true,
            useEnhancedSunriseSunset: false,
        }));

        render(
            <FeatureFlagsProvider>
                <TestComponent />
            </FeatureFlagsProvider>
        );

        expect(screen.getByTestId('enhanced-weather').textContent).toBe('true');
        expect(screen.getByTestId('enhanced-sunrise').textContent).toBe('false');
    });

    it('toggles feature flags correctly', () => {
        render(
            <FeatureFlagsProvider>
                <TestComponent />
            </FeatureFlagsProvider>
        );

        // Initial state should be false for both flags
        expect(screen.getByTestId('enhanced-weather').textContent).toBe('false');

        // Toggle weather flag
        fireEvent.click(screen.getByTestId('toggle-weather'));
        expect(screen.getByTestId('enhanced-weather').textContent).toBe('true');

        // Toggle sunrise flag
        fireEvent.click(screen.getByTestId('toggle-sunrise'));
        expect(screen.getByTestId('enhanced-sunrise').textContent).toBe('true');

        // Toggle weather flag back to false
        fireEvent.click(screen.getByTestId('toggle-weather'));
        expect(screen.getByTestId('enhanced-weather').textContent).toBe('false');
    });

    it('saves flag state to localStorage when changed', () => {
        render(
            <FeatureFlagsProvider>
                <TestComponent />
            </FeatureFlagsProvider>
        );

        // Toggle weather flag
        fireEvent.click(screen.getByTestId('toggle-weather'));

        // Check localStorage was updated
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('featureFlags', expect.any(String));

        // Get the latest call to localStorage.setItem
        const latestCallIndex = mockLocalStorage.setItem.mock.calls.length - 1;
        const savedValue = JSON.parse(mockLocalStorage.setItem.mock.calls[latestCallIndex][1]);
        expect(savedValue.useEnhancedCurrentWeather).toBe(true);
        expect(savedValue.useEnhancedSunriseSunset).toBe(false);
    });

    it('resets flags to default values', () => {
        // Set initial values
        mockLocalStorage.setItem('featureFlags', JSON.stringify({
            useEnhancedCurrentWeather: true,
            useEnhancedSunriseSunset: true,
        }));

        render(
            <FeatureFlagsProvider>
                <TestComponent />
            </FeatureFlagsProvider>
        );

        // Verify initial state
        expect(screen.getByTestId('enhanced-weather').textContent).toBe('true');
        expect(screen.getByTestId('enhanced-sunrise').textContent).toBe('true');

        // Reset flags
        fireEvent.click(screen.getByTestId('reset'));

        // Check values after reset
        expect(screen.getByTestId('enhanced-weather').textContent).toBe('false');
        expect(screen.getByTestId('enhanced-sunrise').textContent).toBe('false');

        // Check localStorage was updated
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('featureFlags', expect.any(String));
    });
});