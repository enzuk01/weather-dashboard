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

// Mock matchMedia for components that use media queries (like for dark mode)
window.matchMedia = window.matchMedia || function () {
    return {
        matches: false,
        addListener: function () { },
        removeListener: function () { },
        addEventListener: function () { },
        removeEventListener: function () { },
        dispatchEvent: function () {
            return false;
        },
    };
};