import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    elevated?: boolean;
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hover = false,
    elevated = false,
    onClick
}) => {
    const { isDark } = useTheme();

    return (
        <div
            className={clsx(
                'bg-white/10 backdrop-blur-md rounded-xl shadow-lg',
                'border border-white/20',
                isDark ? 'dark:bg-slate-800/40 dark:border-slate-700/50' : '',
                hover && 'hover:bg-white/15 dark:hover:bg-slate-700/50 hover:border-white/30 dark:hover:border-slate-600/60',
                elevated ? 'shadow-glass-strong' : 'shadow-glass',
                className,
                onClick && 'cursor-pointer'
            )}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};

export default GlassCard;