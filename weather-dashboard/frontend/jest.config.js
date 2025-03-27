module.exports = {
    // The root of your source code, typically /src
    roots: ['<rootDir>/src'],

    // Test file patterns to match
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],

    // Transform files with ts-jest for TypeScript
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },

    // Setup files to run before tests
    setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
    ],

    // Test environment
    testEnvironment: 'jsdom',

    // Module name mapper for CSS/SCSS imports
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/src/__mocks__/fileMock.js',
    },

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
    ],

    // Coverage directory
    coverageDirectory: 'coverage',

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
};