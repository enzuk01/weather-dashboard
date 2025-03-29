import React, { useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { isOffline } from '../utils/storageUtils';
import ThemeToggle from './ui/ThemeToggle';
import OfflineIndicator from './ui/OfflineIndicator';
import { useTheme } from '../contexts/ThemeContext';
import LocationMenu from './LocationMenu';
import { Location } from './LocationSearch';
import FeatureFlagsPanel from './ui/FeatureFlagsPanel';

interface HeaderProps {
    title: string;
    currentLocation: Location;
    onLocationChange: (location: Location) => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title,
    currentLocation,
    onLocationChange,
    onSettingsClick
}) => {
    const { isDark } = useTheme();
    const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
    const [isFeatureFlagsOpen, setIsFeatureFlagsOpen] = useState(false);

    return (
        <>
            <header className={`sticky top-0 z-20 shadow-lg py-3 px-4 flex justify-between items-center transition-colors duration-500
                ${isDark
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white'
                    : 'bg-gradient-to-r from-blue-800 to-blue-600 text-white'
                }`}>
                <div className="flex items-center">
                    <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
                    <span className="text-lg md:text-xl opacity-90 ml-2 font-medium">
                        | {currentLocation.name}, {currentLocation.country}
                    </span>
                    {isOffline() && <OfflineIndicator className="ml-3" />}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsLocationMenuOpen(true)}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-full
                            hover:bg-white/10 transition-colors"
                        aria-label="Change location"
                    >
                        <MapPinIcon className="h-5 w-5" />
                        <span className="text-sm md:text-base font-medium">
                            Change Location
                        </span>
                    </button>

                    {/* Feature Flags Button */}
                    <button
                        onClick={() => setIsFeatureFlagsOpen(true)}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-full
                            hover:bg-white/10 transition-colors"
                        aria-label="UI Enhancements"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base font-medium">
                            UI Options
                        </span>
                    </button>

                    <ThemeToggle />
                    <button
                        onClick={onSettingsClick}
                        className={`hover:text-blue-200 dark:hover:text-blue-300 transition-colors p-2 rounded-full
                            ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-blue-700/30'}`}
                        aria-label="Open Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </header>

            <LocationMenu
                isOpen={isLocationMenuOpen}
                onClose={() => setIsLocationMenuOpen(false)}
                currentLocation={currentLocation}
                onLocationSelect={onLocationChange}
            />

            <FeatureFlagsPanel
                isOpen={isFeatureFlagsOpen}
                onClose={() => setIsFeatureFlagsOpen(false)}
            />
        </>
    );
};

export default Header;