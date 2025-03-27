import React from 'react';
// import { XMarkIcon } from '@heroicons/react/24/solid';
import {
    TemperatureUnit,
    WindSpeedUnit,
    PrecipitationUnit,
    Language
} from '../contexts/SettingsContext';
import GlassCard from './ui/GlassCard';

// Define props for Settings Panel
interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    temperatureUnit: TemperatureUnit;
    setTemperatureUnit: (unit: TemperatureUnit) => void;
    windSpeedUnit: WindSpeedUnit;
    setWindSpeedUnit: (unit: WindSpeedUnit) => void;
    precipitationUnit: PrecipitationUnit;
    setPrecipitationUnit: (unit: PrecipitationUnit) => void;
    language: Language;
    setLanguage: (language: Language) => void;
    refreshInterval: number;
    setRefreshInterval: (interval: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    temperatureUnit,
    setTemperatureUnit,
    windSpeedUnit,
    setWindSpeedUnit,
    precipitationUnit,
    setPrecipitationUnit,
    language,
    setLanguage,
    refreshInterval,
    setRefreshInterval
}) => {
    if (!isOpen) return null;

    // Define language options
    const languageOptions: { value: Language; label: string }[] = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'it', label: 'Italiano' }
    ];

    // Define refresh interval options (in minutes)
    const refreshOptions = [
        { value: 5, label: '5 minutes' },
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' }
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white"
                            aria-label="Close settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Units Section */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Units</h3>

                            {/* Temperature Units */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Temperature
                                </label>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="temperatureUnit"
                                            value="celsius"
                                            checked={temperatureUnit === 'celsius'}
                                            onChange={() => setTemperatureUnit('celsius')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Celsius (°C)</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="temperatureUnit"
                                            value="fahrenheit"
                                            checked={temperatureUnit === 'fahrenheit'}
                                            onChange={() => setTemperatureUnit('fahrenheit')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Fahrenheit (°F)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Wind Speed Units */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Wind Speed
                                </label>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="windSpeedUnit"
                                            value="kph"
                                            checked={windSpeedUnit === 'kph'}
                                            onChange={() => setWindSpeedUnit('kph')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">km/h</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="windSpeedUnit"
                                            value="mph"
                                            checked={windSpeedUnit === 'mph'}
                                            onChange={() => setWindSpeedUnit('mph')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">mph</span>
                                    </label>
                                </div>
                            </div>

                            {/* Precipitation Units */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Precipitation
                                </label>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="precipitationUnit"
                                            value="mm"
                                            checked={precipitationUnit === 'mm'}
                                            onChange={() => setPrecipitationUnit('mm')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Millimeters (mm)</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="precipitationUnit"
                                            value="inches"
                                            checked={precipitationUnit === 'inches'}
                                            onChange={() => setPrecipitationUnit('inches')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Inches (in)</span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Language Section */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Display Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as Language)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                >
                                    {languageOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* Data Refresh Section */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Refresh</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Auto-Refresh Interval
                                </label>
                                <select
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                >
                                    {refreshOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Weather data will automatically refresh at this interval
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer with buttons */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Save & Close
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default SettingsPanel;