import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherIcon from './WeatherIcon';

// Mock the weatherColors utility
jest.mock('../utils/weatherColors', () => ({
    getWeatherConditionColor: jest.fn().mockReturnValue('#4299E1'),
    getWeatherCodeColor: jest.fn().mockReturnValue('#4299E1')
}));

describe('WeatherIcon', () => {
    test('renders clear day icon correctly', () => {
        render(<WeatherIcon weatherCode={0} isDay={true} />);
        const icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toBeInTheDocument();
        expect(icon.textContent).toBe('☀️');
    });

    test('renders clear night icon correctly', () => {
        render(<WeatherIcon weatherCode={0} isDay={false} />);
        const icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toBeInTheDocument();
        expect(icon.textContent).toBe('🌙');
    });

    test('renders rainy weather icon correctly', () => {
        render(<WeatherIcon weatherCode={61} isDay={true} />);
        const icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toBeInTheDocument();
        expect(icon.textContent).toBe('🌧️');
    });

    test('applies different size classes', () => {
        // Test small size
        const { rerender } = render(<WeatherIcon weatherCode={0} isDay={true} size="sm" />);
        let icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toHaveClass('text-xl');

        // Test medium size (default)
        rerender(<WeatherIcon weatherCode={0} isDay={true} size="md" />);
        icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toHaveClass('text-3xl');

        // Test large size
        rerender(<WeatherIcon weatherCode={0} isDay={true} size="lg" />);
        icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toHaveClass('text-5xl');
    });

    test('applies custom className', () => {
        render(<WeatherIcon weatherCode={0} isDay={true} className="test-class" />);
        const icon = screen.getByLabelText(/Weather condition/);
        expect(icon).toHaveClass('test-class');
    });
});