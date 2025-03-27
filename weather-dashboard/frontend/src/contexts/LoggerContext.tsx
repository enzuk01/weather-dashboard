import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

interface LoggerContextType {
    logger: typeof logger;
    isInitialized: boolean;
    error: string | null;
}

const LoggerContext = createContext<LoggerContextType | null>(null);

export const LoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initLogger = async () => {
            try {
                // Test logger initialization by attempting to log
                await logger.info('Logger initialization check');
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize logger');
                console.error('Logger initialization failed:', err);
            }
        };

        initLogger();
    }, []);

    if (!isInitialized) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    {error ? (
                        <div className="text-red-400">
                            Failed to initialize logging system: {error}
                        </div>
                    ) : (
                        <div className="text-white">
                            Initializing logging system...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <LoggerContext.Provider value={{ logger, isInitialized, error }}>
            {children}
        </LoggerContext.Provider>
    );
};

export const useLogger = () => {
    const context = useContext(LoggerContext);
    if (!context) {
        throw new Error('useLogger must be used within a LoggerProvider');
    }
    return context;
};