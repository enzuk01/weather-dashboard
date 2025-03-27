/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary color palette
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                // Weather condition colors
                weather: {
                    sunny: '#FFD700',
                    cloudy: '#94A3B8',
                    rainy: '#38BDF8',
                    stormy: '#3730A3',
                    foggy: '#CBD5E1',
                    snowy: '#F1F5F9',
                },
                // Temperature gradient colors
                temp: {
                    cold: '#38BDF8',  // Cold blue
                    neutral: '#94A3B8',  // Neutral gray
                    warm: '#FB923C',  // Warm orange
                    hot: '#EF4444',   // Hot red
                },
                'weather-bg': {
                    light: 'rgba(59, 130, 246, 0.5)', // Light blue with transparency
                    dark: 'rgba(30, 41, 59, 0.8)', // Slate-800 with transparency
                },
                'weather-card': {
                    light: 'rgba(255, 255, 255, 0.15)', // Light glass effect
                    dark: 'rgba(30, 41, 59, 0.5)', // Dark glass effect
                },
            },
            fontFamily: {
                sans: ['Inter var', 'sans-serif'],
                display: ['Montserrat', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'day-clear': "url('/assets/backgrounds/day-clear.jpg')",
                'day-cloudy': "url('/assets/backgrounds/day-cloudy.jpg')",
                'night-clear': "url('/assets/backgrounds/night-clear.jpg')",
                'night-cloudy': "url('/assets/backgrounds/night-cloudy.jpg')",
                'rainy': "url('/assets/backgrounds/rainy.jpg')",
                'snowy': "url('/assets/backgrounds/snowy.jpg')",
                'gradient-light': 'linear-gradient(to bottom right, rgba(96, 165, 250, 0.7), rgba(59, 130, 246, 0.8))',
                'gradient-dark': 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9))',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'wind': 'wind 10s linear infinite',
                'rain': 'rain 0.8s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                wind: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                rain: {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(20px)', opacity: 0 },
                },
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-strong': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            },
            dropShadow: {
                'glow': '0 0 6px rgba(254, 240, 138, 0.7)',
                'glow-blue': '0 0 6px rgba(96, 165, 250, 0.7)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}