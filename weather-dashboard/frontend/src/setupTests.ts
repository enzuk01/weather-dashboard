// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Extend type definitions for TypeScript
declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveClass: (className: string) => R;
            toBeInTheDocument: () => R;
            toHaveStyle: (style: Record<string, any>) => R;
        }
    }
}

// Mock the Leaflet library
jest.mock('leaflet', () => ({
    map: jest.fn(),
    marker: jest.fn(),
    tileLayer: jest.fn(),
    control: jest.fn(),
    icon: jest.fn(),
    Marker: {
        prototype: {
            options: {
                icon: {}
            }
        }
    }
}));

// Mock matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});