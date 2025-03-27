import React from 'react';
import GlassCard from './GlassCard';

export interface ErrorStateProps {
    message: string;
    retryAction?: () => void;
}

/**
 * Component to display an error state with optional retry action
 * @param message - Error message to display
 * @param retryAction - Optional function to call when retry button is clicked
 */
const ErrorState: React.FC<ErrorStateProps> = ({ message, retryAction }) => {
    return (
        <GlassCard className="p-5 w-full">
            <div className="flex flex-col items-center text-center">
                <div className="text-5xl text-red-400 mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                <p className="text-white/80 mb-4">{message}</p>
                {retryAction && (
                    <button
                        onClick={retryAction}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </GlassCard>
    );
};

export default ErrorState;