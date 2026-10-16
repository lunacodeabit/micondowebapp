import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from './Icon';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className={`
                relative flex items-center gap-2 p-2 rounded-xl text-xs font-semibold
                transition-all duration-200 border
                ${isDark
                    ? 'bg-neutral-800/80 text-amber-400 border-neutral-700 hover:bg-neutral-700/80 hover:text-amber-300'
                    : 'bg-white text-neutral-600 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900 shadow-sm'
                }
                ${className}
            `}
        >
            <div className="relative w-4 h-4 flex items-center justify-center">
                {isDark ? (
                    <Icon name="sun" className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 scale-100" />
                ) : (
                    <Icon name="moon" className="w-4 h-4 text-neutral-600 transition-transform duration-200 rotate-0 scale-100" />
                )}
            </div>
            {showLabel && (
                <span className="text-xs font-medium">
                    {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
            )}
        </button>
    );
};
