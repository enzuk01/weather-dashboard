import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlassCard from './GlassCard';

describe('GlassCard', () => {
    test('renders children correctly', () => {
        render(<GlassCard>Test Content</GlassCard>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('applies custom className', () => {
        render(<GlassCard className="custom-class">Test Content</GlassCard>);
        const card = screen.getByText('Test Content').parentElement;
        expect(card).toHaveClass('custom-class');
    });

    test('applies hover effect when hover prop is true', () => {
        render(<GlassCard hover>Test Content</GlassCard>);
        const card = screen.getByText('Test Content').parentElement;
        expect(card).toHaveClass('transition-all');
        expect(card).toHaveClass('hover:bg-white/20');
    });
});