import React from 'react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import GlassCard from './GlassCard';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface FeatureFlagsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeatureFlagsPanel: React.FC<FeatureFlagsPanelProps> = ({ isOpen, onClose }) => {
    const { flags, toggleFlag, resetFlags } = useFeatureFlags();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="relative max-w-md w-full p-6 mx-auto">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white/70 hover:text-white"
                    aria-label="Close"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">UI Enhancement Options</h2>

                <p className="text-white/80 mb-6">
                    Toggle between the original UI components and the new enhanced versions.
                    Changes will be applied immediately.
                </p>

                <div className="space-y-4">
                    {/* Current Weather Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <div>
                            <h3 className="text-white font-medium">Enhanced Current Weather</h3>
                            <p className="text-white/70 text-sm">
                                Modern UI with animations and interactive elements
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={flags.useEnhancedCurrentWeather}
                                onChange={() => toggleFlag('useEnhancedCurrentWeather')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Sunrise/Sunset Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <div>
                            <h3 className="text-white font-medium">Enhanced Sunrise & Sunset</h3>
                            <p className="text-white/70 text-sm">
                                Interactive timeline with horizon visualization
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={flags.useEnhancedSunriseSunset}
                                onChange={() => toggleFlag('useEnhancedSunriseSunset')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-8 flex justify-between">
                    <button
                        onClick={resetFlags}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded transition-colors"
                    >
                        Reset to Default
                    </button>

                    <button
                        onClick={() => {
                            toggleFlag('useEnhancedCurrentWeather');
                            toggleFlag('useEnhancedSunriseSunset');
                        }}
                        className="px-4 py-2 bg-blue-500/70 hover:bg-blue-500/90 text-white rounded transition-colors"
                    >
                        Toggle All
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default FeatureFlagsPanel;