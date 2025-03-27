import React from 'react';
import clsx from 'clsx';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    elevated?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hover = false,
    elevated = false
}) => {
    const { isDark } = useTheme();

    return (
        <div
            className={clsx(
                'bg-white/10 backdrop-blur-md rounded-lg border border-white/20',
                'transition-all duration-300',
                isDark ? 'dark:bg-slate-800/40 dark:border-slate-700/50' : '',
                hover && 'hover:bg-white/15 dark:hover:bg-slate-700/50 hover:border-white/30 dark:hover:border-slate-600/60',
                elevated ? 'shadow-glass-strong' : 'shadow-glass',
                className
            )}
        >
            {children}
        </div>
    );
};

export default GlassCard;