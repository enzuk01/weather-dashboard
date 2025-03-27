import React, { useState, useEffect } from 'react';
import { isOffline } from '../../utils/storageUtils';

interface OfflineIndicatorProps {
    className?: string;
}

/**
 * Component that displays an indicator when the user is offline
 * @param className - Additional CSS classes to apply
 */
const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
    const [offline, setOffline] = useState<boolean>(isOffline());

    useEffect(() => {
        // Function to update offline status
        const handleOnlineStatusChange = () => {
            setOffline(isOffline());
        };

        // Add event listeners
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);

        // Initial check
        handleOnlineStatusChange();

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, []);

    if (!offline) {
        return null;
    }

    return (
        <div className={`bg-red-600 text-white px-4 py-2 rounded-md flex items-center shadow-md ${className}`}>
            <span className="mr-2">⚠️</span>
            <span className="font-medium">You are offline. Showing cached data.</span>
        </div>
    );
};

export default OfflineIndicator;