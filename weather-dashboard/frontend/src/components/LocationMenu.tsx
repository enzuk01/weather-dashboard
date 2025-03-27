import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import LocationSearch, { Location } from './LocationSearch';
import FavoriteLocations from './FavoriteLocations';
import GlassCard from './ui/GlassCard';

interface LocationMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: Location;
    onLocationSelect: (location: Location) => void;
}

const LocationMenu: React.FC<LocationMenuProps> = ({
    isOpen,
    onClose,
    currentLocation,
    onLocationSelect
}) => {
    if (!isOpen) return null;

    const handleLocationSelect = (location: Location) => {
        onLocationSelect(location);
        onClose();
    };

    // Handle clicking outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-2xl mt-20 mx-4">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <MapPinIcon className="h-6 w-6 text-white mr-2" />
                            <h2 className="text-2xl font-bold text-white">Location Settings</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition-colors"
                            aria-label="Close location menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg text-white/90 mb-3">Search Location</h3>
                            <LocationSearch
                                onLocationSelect={handleLocationSelect}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <FavoriteLocations
                                onLocationSelect={handleLocationSelect}
                                currentLocation={currentLocation}
                            />
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default LocationMenu;