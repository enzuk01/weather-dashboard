import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import clsx from 'clsx';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { isDark, toggleTheme } = useTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [showRipple, setShowRipple] = useState(false);
    const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

    // Handle the click animation
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Get the relative position for the ripple
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setRipplePosition({ x, y });
        setShowRipple(true);
        setIsAnimating(true);
        toggleTheme();

        // Hide ripple after animation completes
        setTimeout(() => setShowRipple(false), 600);
    };

    // Reset animation state after transition completes
    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => setIsAnimating(false), 700);
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    return (
        <button
            onClick={handleClick}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={clsx(
                'relative p-2 rounded-full transition-all duration-300 overflow-hidden',
                'hover:bg-blue-700/30 dark:hover:bg-slate-700/50',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 dark:focus:ring-blue-300',
                isAnimating && 'scale-110',
                isDark && 'animate-pulse-slow',
                className
            )}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Background glow effect */}
            <div className={clsx(
                'absolute inset-0 rounded-full transition-opacity duration-500',
                isDark
                    ? 'bg-yellow-400/30 opacity-0 group-hover:opacity-100'
                    : 'bg-blue-700/20 opacity-0 group-hover:opacity-100',
                isDark && 'shadow-glow'
            )} />

            {/* Ripple effect */}
            {showRipple && (
                <span
                    className="absolute bg-white/30 rounded-full animate-ripple"
                    style={{
                        width: '100px',
                        height: '100px',
                        left: ripplePosition.x - 50,
                        top: ripplePosition.y - 50,
                    }}
                />
            )}

            <div className={clsx(
                'relative transform transition-transform duration-500',
                isAnimating && (isDark ? 'rotate-180' : '-rotate-180')
            )}>
                {isDark ? (
                    // Sun icon for dark mode
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-yellow-300 drop-shadow-glow transition-all duration-300"
                    >
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                ) : (
                    // Moon icon for light mode
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-slate-700 transition-all duration-300"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;