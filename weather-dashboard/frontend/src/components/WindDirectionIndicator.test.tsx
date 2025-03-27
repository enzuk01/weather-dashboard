import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WindDirectionIndicator from './WindDirectionIndicator';

describe('WindDirectionIndicator', () => {
    test('renders with the correct direction', () => {
        render(<WindDirectionIndicator direction={90} />);

        // Check that the arrow is visible
        const arrow = screen.getByLabelText('Wind direction: E');
        expect(arrow).toBeInTheDocument();

        // Check that the screen reader text is correct
        const srOnly = screen.getByText('E');
        expect(srOnly).toBeInTheDocument();
        expect(srOnly).toHaveClass('sr-only');
    });

    test('renders with different cardinal directions', () => {
        // Test North direction
        const { rerender } = render(<WindDirectionIndicator direction={0} />);
        expect(screen.getByLabelText('Wind direction: N')).toBeInTheDocument();

        // Test South direction
        rerender(<WindDirectionIndicator direction={180} />);
        expect(screen.getByLabelText('Wind direction: S')).toBeInTheDocument();

        // Test West direction
        rerender(<WindDirectionIndicator direction={270} />);
        expect(screen.getByLabelText('Wind direction: W')).toBeInTheDocument();

        // Test Northeast direction
        rerender(<WindDirectionIndicator direction={45} />);
        expect(screen.getByLabelText('Wind direction: NE')).toBeInTheDocument();
    });

    test('applies rotation style based on direction', () => {
        render(<WindDirectionIndicator direction={90} />);

        // Find the arrow element
        const arrowElement = screen.getByText('↑');

        // Check that it has the correct rotation transform
        expect(arrowElement).toHaveStyle({ transform: 'rotate(90deg)' });
    });

    test('applies size classes', () => {
        // Test small size
        const { rerender } = render(<WindDirectionIndicator direction={0} size="sm" />);
        expect(screen.getByLabelText('Wind direction: N')).toHaveClass('text-xs');

        // Test medium size (default)
        rerender(<WindDirectionIndicator direction={0} size="md" />);
        expect(screen.getByLabelText('Wind direction: N')).toHaveClass('text-sm');

        // Test large size
        rerender(<WindDirectionIndicator direction={0} size="lg" />);
        expect(screen.getByLabelText('Wind direction: N')).toHaveClass('text-base');
    });

    test('applies custom className', () => {
        render(<WindDirectionIndicator direction={0} className="test-class" />);
        expect(screen.getByLabelText('Wind direction: N')).toHaveClass('test-class');
    });
});