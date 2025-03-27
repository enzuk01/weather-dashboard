import React from 'react';
import { isOffline } from '../utils/storageUtils';
import ThemeToggle from './ui/ThemeToggle';
import OfflineIndicator from './ui/OfflineIndicator';

interface HeaderProps {
    title: string;
    locationName?: string;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, locationName, onSettingsClick }) => {
    return (
        <header className="sticky top-0 bg-gradient-to-r from-blue-800 to-blue-600 dark:from-slate-800 dark:to-slate-900 py-3 px-4 flex justify-between items-center z-20 shadow-lg transition-colors duration-300">
            <div className="flex items-center">
                <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
                {locationName && (
                    <span className="text-lg md:text-xl text-white/90 ml-2 font-medium">
                        | {locationName}
                    </span>
                )}
                {isOffline() && <OfflineIndicator className="ml-3" />}
            </div>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                <button
                    onClick={onSettingsClick}
                    className="text-white hover:text-blue-200 dark:hover:text-blue-300 transition-colors"
                    aria-label="Open Settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;