import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define feature flags
interface FeatureFlags {
    useEnhancedCurrentWeather: boolean;
    useEnhancedSunriseSunset: boolean;
}

// Context type definition
interface FeatureFlagsContextType {
    flags: FeatureFlags;
    toggleFlag: (flagName: keyof FeatureFlags) => void;
    resetFlags: () => void;
}

// Create the context
const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

// Default feature flags values
const defaultFlags: FeatureFlags = {
    useEnhancedCurrentWeather: false,
    useEnhancedSunriseSunset: false,
};

// Custom hook to use the feature flags
export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagsContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
};

// Props for the provider component
interface FeatureFlagsProviderProps {
    children: ReactNode;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ children }) => {
    const [flags, setFlags] = useState<FeatureFlags>(() => {
        // Try to load flags from localStorage
        try {
            const savedFlags = localStorage.getItem('featureFlags');
            return savedFlags ? JSON.parse(savedFlags) : defaultFlags;
        } catch (error) {
            console.error('Failed to load feature flags from localStorage:', error);
            return defaultFlags;
        }
    });

    // Save flags to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('featureFlags', JSON.stringify(flags));
        } catch (error) {
            console.error('Failed to save feature flags to localStorage:', error);
        }
    }, [flags]);

    // Toggle a specific feature flag
    const toggleFlag = (flagName: keyof FeatureFlags) => {
        setFlags(prevFlags => ({
            ...prevFlags,
            [flagName]: !prevFlags[flagName],
        }));
    };

    // Reset all flags to default values
    const resetFlags = () => {
        setFlags(defaultFlags);
    };

    return (
        <FeatureFlagsContext.Provider
            value={{
                flags,
                toggleFlag,
                resetFlags,
            }}
        >
            {children}
        </FeatureFlagsContext.Provider>
    );
};

export default FeatureFlagsContext;