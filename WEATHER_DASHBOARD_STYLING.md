# Weather Dashboard Styling Guide

This document outlines the styling approach for the Weather Dashboard application, ensuring a consistent and visually appealing design.

## Tailwind CSS Configuration

Create a custom Tailwind configuration to extend the default theme:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
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
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
```

## Glassmorphism UI Components

Create a set of reusable glass-effect UI components:

```tsx
// src/components/ui/GlassCard.tsx
import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={clsx(
        'bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-glass',
        hover && 'hover:bg-white/15 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
```

## Dynamic Weather Backgrounds

Create a component to dynamically change the background based on weather conditions:

```tsx
// src/components/WeatherBackground.tsx
import React from 'react';
import clsx from 'clsx';

interface WeatherBackgroundProps {
  children: React.ReactNode;
  condition: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';
  isDay: boolean;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  children,
  condition,
  isDay
}) => {
  const getBgClass = () => {
    switch (condition) {
      case 'clear':
        return isDay ? 'bg-day-clear' : 'bg-night-clear';
      case 'cloudy':
        return isDay ? 'bg-day-cloudy' : 'bg-night-cloudy';
      case 'rainy':
        return 'bg-rainy';
      case 'snowy':
        return 'bg-snowy';
      case 'foggy':
        return isDay ? 'bg-day-cloudy' : 'bg-night-cloudy';
      case 'stormy':
        return 'bg-rainy';
      default:
        return isDay ? 'bg-day-clear' : 'bg-night-clear';
    }
  };

  return (
    <div className={clsx(
      'min-h-screen bg-cover bg-center transition-opacity duration-1000',
      getBgClass()
    )}>
      <div className="min-h-screen bg-gradient-to-b from-black/30 to-black/50">
        {children}
      </div>
    </div>
  );
};

export default WeatherBackground;
```

## Weather Icons

Use SVG weather icons with animations:

```tsx
// src/components/WeatherIcon.tsx
import React from 'react';
import {
  WiDaySunny,
  WiNightClear,
  WiCloudy,
  WiDayCloudy,
  WiNightAltCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog
} from 'react-icons/wi';

interface WeatherIconProps {
  condition: string;
  isDay: boolean;
  size?: number;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  isDay,
  size = 48,
  className = ''
}) => {
  const getIcon = () => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return isDay ? <WiDaySunny className="text-weather-sunny animate-pulse-slow" /> : <WiNightClear className="text-gray-200" />;
      case 'partly cloudy':
        return isDay ? <WiDayCloudy className="text-weather-cloudy" /> : <WiNightAltCloudy className="text-weather-cloudy" />;
      case 'cloudy':
        return <WiCloudy className="text-weather-cloudy" />;
      case 'rain':
      case 'drizzle':
        return <WiRain className="text-weather-rainy" />;
      case 'snow':
        return <WiSnow className="text-weather-snowy animate-float" />;
      case 'thunderstorm':
        return <WiThunderstorm className="text-weather-stormy" />;
      case 'fog':
      case 'mist':
        return <WiFog className="text-weather-foggy" />;
      default:
        return isDay ? <WiDaySunny className="text-weather-sunny" /> : <WiNightClear className="text-gray-200" />;
    }
  };

  return (
    <div className={`text-[${size}px] ${className}`}>
      {getIcon()}
    </div>
  );
};

export default WeatherIcon;
```

## Temperature Display

Create a temperature display component with color gradients based on temperature:

```tsx
// src/components/TemperatureDisplay.tsx
import React from 'react';
import clsx from 'clsx';

interface TemperatureDisplayProps {
  temperature: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUnit?: boolean;
  unitType?: 'celsius' | 'fahrenheit';
  className?: string;
}

const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
  temperature,
  size = 'md',
  showUnit = true,
  unitType = 'celsius',
  className = ''
}) => {
  // Determine color based on temperature
  const getColorClass = () => {
    if (temperature < 5) return 'text-temp-cold';
    if (temperature < 15) return 'text-primary-400';
    if (temperature < 25) return 'text-temp-warm';
    return 'text-temp-hot';
  };

  // Determine size class
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xl';
      case 'md': return 'text-3xl';
      case 'lg': return 'text-5xl font-bold';
      case 'xl': return 'text-7xl font-bold';
      default: return 'text-3xl';
    }
  };

  // Format temperature as integer
  const formattedTemp = Math.round(temperature);
  const unit = unitType === 'celsius' ? '°C' : '°F';

  return (
    <span className={clsx(
      'font-display transition-colors duration-500',
      getColorClass(),
      getSizeClass(),
      className
    )}>
      {formattedTemp}{showUnit && unit}
    </span>
  );
};

export default TemperatureDisplay;
```

## Animation Examples

Define reusable animations for weather effects:

```css
/* src/styles/animations.css */
@keyframes rainDrop {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(20px);
    opacity: 0;
  }
}

@keyframes windParticle {
  0% {
    transform: translateX(-5px) translateY(0);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(30px) translateY(5px);
    opacity: 0;
  }
}

@keyframes snowfall {
  0% {
    transform: translateY(-10px) translateX(0);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(25px) translateX(10px);
    opacity: 0;
  }
}

.rain-animation {
  position: relative;
  overflow: hidden;
}

.rain-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(56, 189, 248, 0.2) 100%);
  z-index: -1;
}

.rain-drop {
  position: absolute;
  width: 2px;
  height: 10px;
  background-color: rgba(56, 189, 248, 0.6);
  border-radius: 50%;
  animation: rainDrop 1.5s linear infinite;
}

.wind-particle {
  position: absolute;
  width: 4px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: windParticle 3s linear infinite;
}

.snow-particle {
  position: absolute;
  width: 5px;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: snowfall 6s linear infinite;
}
```

## Responsive Layout

Define a responsive layout system:

```tsx
// src/components/layout/DashboardLayout.tsx
import React from 'react';
import WeatherBackground from '../WeatherBackground';

interface DashboardLayoutProps {
  children: React.ReactNode;
  weatherCondition: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy';
  isDay: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  weatherCondition,
  isDay
}) => {
  return (
    <WeatherBackground condition={weatherCondition} isDay={isDay}>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar - 3 columns on desktop */}
          <div className="md:col-span-3 space-y-6">
            {/* Sidebar content will go here */}
          </div>

          {/* Main content - 9 columns on desktop */}
          <div className="md:col-span-9 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </WeatherBackground>
  );
};

export default DashboardLayout;
```

## Color Maps for Data Visualization

Define color maps for consistent data visualization:

```typescript
// src/utils/colorMaps.ts

// Temperature color map (from cold blue to hot red)
export const getTemperatureColor = (temp: number): string => {
  if (temp <= 0) return '#38BDF8';  // Cold blue
  if (temp <= 10) return '#60A5FA'; // Light blue
  if (temp <= 15) return '#93C5FD'; // Lighter blue
  if (temp <= 20) return '#FBBF24'; // Yellow
  if (temp <= 25) return '#FB923C'; // Orange
  if (temp <= 30) return '#F97316'; // Dark orange
  return '#EF4444';                 // Red
};

// Precipitation probability color map
export const getPrecipitationColor = (probability: number): string => {
  if (probability <= 10) return '#F1F5F9'; // Very light blue
  if (probability <= 25) return '#E0F2FE'; // Light blue
  if (probability <= 50) return '#7DD3FC'; // Medium blue
  if (probability <= 75) return '#38BDF8'; // Blue
  return '#0EA5E9';                        // Dark blue
};

// Wind speed color map
export const getWindSpeedColor = (speed: number): string => {
  if (speed <= 5) return '#D1D5DB';  // Light gray
  if (speed <= 10) return '#9CA3AF'; // Medium gray
  if (speed <= 20) return '#6B7280'; // Dark gray
  if (speed <= 30) return '#4B5563'; // Darker gray
  return '#1F2937';                  // Almost black
};
```

## Design System Components

Create a collection of design system components:

```tsx
// src/components/ui/Button.tsx
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

## Best Practices

1. Use a consistent color palette based on the defined color system
2. Implement dark mode based on user preference and time of day
3. Ensure all components have appropriate hover and focus states
4. Use animation sparingly to enhance weather effects without overwhelming the user
5. Ensure text has sufficient contrast against background images
6. Use SVG icons for better scaling and quality
7. Optimize image assets for web to reduce load times
8. Implement a loading state with skeleton UI for data fetching
9. Test on various screen sizes to ensure responsive behavior
10. Create a cohesive visual language across all components
