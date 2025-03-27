import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
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
    const { isDark } = useTheme();

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 animate-fade-in">
            <div
                className="w-full max-w-xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <GlassCard className="p-6" elevated>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className={`text-white/70 hover:text-white p-2 rounded-full transition-colors duration-300
                                ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-blue-700/30'}`}
                            aria-label="Close settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Units Section */}
                        <section className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/10'} border ${isDark ? 'border-slate-700/50' : 'border-white/20'}`}>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                                Measurement Units
                            </h3>

                            {/* Temperature Units */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Temperature
                                </label>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-500 focus:ring-blue-500 bg-white/10 border-white/20"
                                            name="temperatureUnit"
                                            value="celsius"
                                            checked={temperatureUnit === 'celsius'}
                                            onChange={() => setTemperatureUnit('celsius')}
                                        />
                                        <span className="ml-2 text-white">Celsius (°C)</span>
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-500 focus:ring-blue-500 bg-white/10 border-white/20"
                                            name="temperatureUnit"
                                            value="fahrenheit"
                                            checked={temperatureUnit === 'fahrenheit'}
                                            onChange={() => setTemperatureUnit('fahrenheit')}
                                        />
                                        <span className="ml-2 text-white">Fahrenheit (°F)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Wind Speed Units */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Wind Speed
                                </label>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-500 focus:ring-blue-500 bg-white/10 border-white/20"
                                            name="windSpeedUnit"
                                            value="kph"
                                            checked={windSpeedUnit === 'kph'}
                                            onChange={() => setWindSpeedUnit('kph')}
                                        />
                                        <span className="ml-2 text-white">km/h</span>
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-500 focus:ring-blue-500 bg-white/10 border-white/20"
                                            name="windSpeedUnit"
                                            value="mph"
                                            checked={windSpeedUnit === 'mph'}
                                            onChange={() => setWindSpeedUnit('mph')}
                                        />
                                        <span className="ml-2 text-white">mph</span>
                                    </label>
                                </div>
                            </div>

                            {/* Precipitation Units */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Precipitation
                                </label>
                                <div className="flex gap-4">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-500 focus:ring-blue-500 bg-white/10 border-white/20"
                                            name="precipitationUnit"
                                            value="mm"
                                            checked={precipitationUnit === 'mm'}
                                            onChange={() => setPrecipitationUnit('mm')}
                                        />
                                        <span className="ml-2 text-white">Millimeters (mm)</span>
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-500 focus:ring-blue-500 bg-white/10 border-white/20"
                                            name="precipitationUnit"
                                            value="inches"
                                            checked={precipitationUnit === 'inches'}
                                            onChange={() => setPrecipitationUnit('inches')}
                                        />
                                        <span className="ml-2 text-white">Inches (in)</span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Language Section */}
                        <section className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/10'} border ${isDark ? 'border-slate-700/50' : 'border-white/20'}`}>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                Display Language
                            </h3>
                            <div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as Language)}
                                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300
                                        ${isDark
                                            ? 'bg-slate-700/70 border-slate-600/60 text-white'
                                            : 'bg-white/10 border-white/20 text-white'
                                        }`}
                                >
                                    {languageOptions.map((option) => (
                                        <option key={option.value} value={option.value} className={isDark ? 'bg-slate-800 text-white' : 'bg-blue-800 text-white'}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* Data Refresh Section */}
                        <section className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/10'} border ${isDark ? 'border-slate-700/50' : 'border-white/20'}`}>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Auto-Refresh Interval
                            </h3>
                            <div>
                                <select
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300
                                        ${isDark
                                            ? 'bg-slate-700/70 border-slate-600/60 text-white'
                                            : 'bg-white/10 border-white/20 text-white'
                                        }`}
                                >
                                    {refreshOptions.map((option) => (
                                        <option key={option.value} value={option.value} className={isDark ? 'bg-slate-800 text-white' : 'bg-blue-800 text-white'}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-sm text-white/60">
                                    Weather data will automatically refresh at this interval
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer with buttons */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className={`px-5 py-2 rounded-md font-medium transition-colors duration-300 flex items-center
                                ${isDark
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save & Close
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default SettingsPanel;