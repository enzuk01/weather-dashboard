import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import '@testing-library/jest-dom';
import LoadingState from './LoadingState';

describe('LoadingState', () => {
    test('renders loading indicator', () => {
        render(<LoadingState />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('renders default loading message when no message is provided', () => {
        render(<LoadingState />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders custom message when provided', () => {
        const customMessage = 'Custom loading message';
        render(<LoadingState message={customMessage} />);
        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    test('applies custom className when provided', () => {
        render(<LoadingState className="custom-class" />);
        const container = screen.getByRole('progressbar').closest('div.bg-white\\/10');
        expect(container).toHaveClass('custom-class');
    });
});