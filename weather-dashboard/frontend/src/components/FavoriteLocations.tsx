import React, { useState, useEffect } from 'react';
import { HeartIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import GlassCard from './ui/GlassCard';
import { Location } from './LocationSearch';

interface FavoriteLocationsProps {
    onLocationSelect: (location: Location) => void;
    currentLocation: Location;
}

const FavoriteLocations: React.FC<FavoriteLocationsProps> = ({
    onLocationSelect,
    currentLocation
}) => {
    const [favorites, setFavorites] = useState<Location[]>([]);
    const [newLocationName, setNewLocationName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load saved favorites from localStorage on component mount
    useEffect(() => {
        loadFavorites();
        // Initialize with the current location name when adding a new favorite
        setNewLocationName(currentLocation.name);
    }, [currentLocation]);

    const loadFavorites = () => {
        try {
            setError(null); // Clear any previous errors
            const savedFavorites = localStorage.getItem('favoriteLocations');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError('Failed to load favorite locations');
        }
    };

    const saveFavorites = (updatedFavorites: Location[]) => {
        try {
            localStorage.setItem('favoriteLocations', JSON.stringify(updatedFavorites));
            return true;
        } catch (err) {
            console.error('Error saving favorites:', err);
            setError('Failed to save to local storage');
            return false;
        }
    };

    const addCurrentLocation = () => {
        if (!newLocationName.trim()) {
            setError('Please enter a location name');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            // Create a new favorite with the current location data but with the custom name
            const newFavorite: Location = {
                ...currentLocation,
                name: newLocationName
            };

            // Check for duplicates
            if (favorites.some(fav =>
                fav.latitude === newFavorite.latitude &&
                fav.longitude === newFavorite.longitude)) {
                setError('This location is already in your favorites');
                setIsSaving(false);
                return;
            }

            const updatedFavorites = [...favorites, newFavorite];
            const saveSuccessful = saveFavorites(updatedFavorites);

            if (saveSuccessful) {
                setFavorites(updatedFavorites);
                setNewLocationName('');
                setIsAdding(false);
            }
        } catch (err: any) {
            console.error('Error adding favorite:', err);
            setError(err.message || 'Failed to add favorite location');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteLocation = (index: number) => {
        try {
            setError(null);
            const updatedFavorites = [...favorites];
            updatedFavorites.splice(index, 1);
            const saveSuccessful = saveFavorites(updatedFavorites);

            if (saveSuccessful) {
                setFavorites(updatedFavorites);
            }
        } catch (err) {
            console.error('Error deleting favorite:', err);
            setError('Failed to delete favorite location');
        }
    };

    return (
        <GlassCard className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Favorite Locations</h2>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setError(null); // Clear errors when toggling
                        if (!isAdding) {
                            setNewLocationName(currentLocation.name);
                        }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                    aria-label={isAdding ? 'Cancel adding location' : 'Add location'}
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-white p-2 rounded mb-4">
                    {error}
                </div>
            )}

            {isAdding && (
                <div className="mb-4 bg-white/10 p-3 rounded-lg">
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="locationName" className="text-white/80 text-sm">
                            Save current location as:
                        </label>
                        <input
                            id="locationName"
                            type="text"
                            value={newLocationName}
                            onChange={(e) => setNewLocationName(e.target.value)}
                            placeholder="Enter location name"
                            className="bg-white/20 text-white border border-white/30 rounded p-2"
                        />
                        <div className="flex space-x-2 mt-2">
                            <button
                                onClick={addCurrentLocation}
                                disabled={isSaving}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1 flex justify-center items-center"
                            >
                                {isSaving ? 'Saving...' : 'Save Location'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewLocationName('');
                                    setError(null);
                                }}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {favorites.length === 0 ? (
                <p className="text-white/70 text-center py-4">
                    No favorite locations saved yet. Add some by clicking the + button!
                </p>
            ) : (
                <div className="space-y-2">
                    {favorites.map((favorite, index) => (
                        <div
                            key={`${favorite.name}-${index}`}
                            className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all"
                        >
                            <button
                                className="flex-1 text-left text-white font-medium"
                                onClick={() => onLocationSelect(favorite)}
                            >
                                <div className="flex items-center">
                                    <HeartIcon className="h-5 w-5 text-red-400 mr-2" />
                                    {favorite.name}
                                </div>
                                <div className="text-white/60 text-xs mt-1">
                                    {favorite.country}
                                    {favorite.state && `, ${favorite.state}`}
                                </div>
                            </button>
                            <button
                                onClick={() => deleteLocation(index)}
                                className="p-2 text-white/60 hover:text-red-400 transition-colors"
                                aria-label={`Delete ${favorite.name}`}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
};

export default FavoriteLocations;