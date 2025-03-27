import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock the ThemeContext
const renderWithThemeContext = (component: React.ReactNode, defaultTheme = 'light') => {
    // Create a mock localStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {};

        return {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => { store[key] = value.toString(); },
            clear: () => { store = {}; }
        };
    })();

    // Replace the real localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
    });

    // Set initial theme if provided
    if (defaultTheme) {
        localStorageMock.setItem('theme', defaultTheme);
    }

    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemeToggle', () => {
    beforeEach(() => {
        // Reset the document.documentElement.classList before each test
        document.documentElement.classList.remove('dark');
    });

    test('renders with light mode icon by default', () => {
        renderWithThemeContext(<ThemeToggle />);

        // In light mode, it should show a moon icon (for switching to dark)
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    test('changes to dark mode when clicked', () => {
        renderWithThemeContext(<ThemeToggle />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // After clicking, it should switch to dark mode and show a sun icon
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('initializes with dark mode when set in localStorage', () => {
        renderWithThemeContext(<ThemeToggle />, 'dark');

        // Should show sun icon (for switching to light) in dark mode
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('applies custom className when provided', () => {
        renderWithThemeContext(<ThemeToggle className="custom-test-class" />);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-test-class');
    });
});