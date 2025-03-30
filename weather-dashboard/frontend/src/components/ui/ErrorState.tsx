import React from 'react';
import GlassCard from './GlassCard';

interface ErrorStateProps {
    message: string;
    retryAction?: () => void;
    className?: string;
}

/**
 * Component to display an error state with optional retry action
 * @param message - Error message to display
 * @param retryAction - Optional function to call when retry button is clicked
 * @param className - Optional additional CSS classes
 */
const ErrorState: React.FC<ErrorStateProps> = ({ message, retryAction, className = '' }) => {
    return (
        <GlassCard className={`p-6 ${className}`}>
            <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-red-500/20 rounded-full mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10 text-red-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                    Something went wrong
                </h3>

                <p className="text-white/70 mb-4">
                    {message}
                </p>

                {retryAction && (
                    <button
                        onClick={retryAction}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700
                                  text-white rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </GlassCard>
    );
};

export default ErrorState;