import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import '@testing-library/jest-dom';
import GlassCard from './GlassCard';

describe('GlassCard', () => {
    test('renders children correctly', () => {
        render(<GlassCard>Test Content</GlassCard>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('applies custom class name', () => {
        render(<GlassCard className="custom-class">Test Content</GlassCard>);
        const card = screen.getByText('Test Content').closest('div.bg-white\\/10');
        expect(card).toHaveClass('custom-class');
    });

    test('applies hover effect when hover prop is true', () => {
        render(<GlassCard hover>Test Content</GlassCard>);
        const card = screen.getByText('Test Content').closest('div.bg-white\\/10');
        expect(card).toHaveClass('hover:bg-white/15');
        expect(card).toHaveClass('dark:hover:bg-slate-700/50');
    });
});