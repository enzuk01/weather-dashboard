import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingState from './LoadingState';

describe('LoadingState', () => {
    test('renders loading indicator', () => {
        render(<LoadingState />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('renders default loading message when no message is provided', () => {
        render(<LoadingState />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders custom loading message when provided', () => {
        const customMessage = 'Fetching weather data...';
        render(<LoadingState message={customMessage} />);
        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    test('applies custom className when provided', () => {
        render(<LoadingState className="custom-class" />);
        expect(screen.getByRole('status').parentElement).toHaveClass('custom-class');
    });
});