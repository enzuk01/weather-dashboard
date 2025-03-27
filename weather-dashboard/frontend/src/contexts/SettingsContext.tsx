import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the units of measurement
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kph' | 'mph';
export type PrecipitationUnit = 'mm' | 'inches';

// Define the available languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it';

// Interface for the settings context
interface SettingsContextType {
    temperatureUnit: TemperatureUnit;
    setTemperatureUnit: (unit: TemperatureUnit) => void;
    windSpeedUnit: WindSpeedUnit;
    setWindSpeedUnit: (unit: WindSpeedUnit) => void;
    precipitationUnit: PrecipitationUnit;
    setPrecipitationUnit: (unit: PrecipitationUnit) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    refreshInterval: number;
    setRefreshInterval: (interval: number) => void;
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

// Helper function to safely parse stored settings
const getStoredValue = <T extends unknown>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    // Units
    const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>(
        () => getStoredValue<TemperatureUnit>('temperatureUnit', 'celsius')
    );

    const [windSpeedUnit, setWindSpeedUnitState] = useState<WindSpeedUnit>(
        () => getStoredValue<WindSpeedUnit>('windSpeedUnit', 'kph')
    );

    const [precipitationUnit, setPrecipitationUnitState] = useState<PrecipitationUnit>(
        () => getStoredValue<PrecipitationUnit>('precipitationUnit', 'mm')
    );

    // Language
    const [language, setLanguageState] = useState<Language>(
        () => getStoredValue<Language>('language', 'en')
    );

    // Refresh Interval
    const [refreshInterval, setRefreshIntervalState] = useState<number>(
        () => getStoredValue<number>('refreshInterval', 15) // Default to 15 minutes
    );

    // Settings modal state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Wrapper functions to update state and localStorage
    const setTemperatureUnit = (unit: TemperatureUnit) => {
        setTemperatureUnitState(unit);
        localStorage.setItem('temperatureUnit', JSON.stringify(unit));
    };

    const setWindSpeedUnit = (unit: WindSpeedUnit) => {
        setWindSpeedUnitState(unit);
        localStorage.setItem('windSpeedUnit', JSON.stringify(unit));
    };

    const setPrecipitationUnit = (unit: PrecipitationUnit) => {
        setPrecipitationUnitState(unit);
        localStorage.setItem('precipitationUnit', JSON.stringify(unit));
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', JSON.stringify(lang));
    };

    const setRefreshInterval = (interval: number) => {
        setRefreshIntervalState(interval);
        localStorage.setItem('refreshInterval', JSON.stringify(interval));
    };

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);

    return (
        <SettingsContext.Provider
            value={{
                temperatureUnit,
                setTemperatureUnit,
                windSpeedUnit,
                setWindSpeedUnit,
                precipitationUnit,
                setPrecipitationUnit,
                language,
                setLanguage,
                refreshInterval,
                setRefreshInterval,
                isSettingsOpen,
                openSettings,
                closeSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

// Utility functions for unit conversions
export const convertTemperature = (value: number, fromUnit: TemperatureUnit, toUnit: TemperatureUnit): number => {
    if (fromUnit === toUnit) return value;

    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return (value * 9 / 5) + 32;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return (value - 32) * 5 / 9;
    }

    return value;
};

export const convertWindSpeed = (value: number, fromUnit: WindSpeedUnit, toUnit: WindSpeedUnit): number => {
    if (fromUnit === toUnit) return value;

    if (fromUnit === 'kph' && toUnit === 'mph') {
        return value * 0.621371;
    } else if (fromUnit === 'mph' && toUnit === 'kph') {
        return value * 1.60934;
    }

    return value;
};

export const convertPrecipitation = (value: number, fromUnit: PrecipitationUnit, toUnit: PrecipitationUnit): number => {
    if (fromUnit === toUnit) return value;

    if (fromUnit === 'mm' && toUnit === 'inches') {
        return value * 0.0393701;
    } else if (fromUnit === 'inches' && toUnit === 'mm') {
        return value * 25.4;
    }

    return value;
};

export default SettingsContext;