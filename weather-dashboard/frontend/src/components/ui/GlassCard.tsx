import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, hover = false }) => {
    return (
        <div
            className={clsx(
                'bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-glass',
                'dark:bg-slate-800/40 dark:border-slate-700/50',
                hover && 'hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300',
                className
            )}
        >
            {children}
        </div>
    );
};

export default GlassCard;