import React from 'react';
import GlassCard from './GlassCard';

interface LoadingStateProps {
    message?: string;
    className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading data...',
    className = ''
}) => {
    return (
        <GlassCard className={`p-8 flex flex-col items-center justify-center ${className}`}>
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white/80 animate-spin mb-4" />
            <p className="text-white/80 text-center font-medium">{message}</p>
        </GlassCard>
    );
};

export default LoadingState;