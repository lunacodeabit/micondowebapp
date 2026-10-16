import React from 'react';
import { Icon } from './Icon';

interface PremiumKpiCardProps {
    title: string;
    value: string | number;
    icon: string;
    gradient?: string;
    delay?: string;
    subtitle?: string;
    badgeText?: string;
    badgeType?: 'success' | 'warning' | 'info' | 'neutral';
    trend?: {
        value: string;
        isPositive: boolean;
    };
    onClick?: () => void;
}

export const PremiumKpiCard = ({
    title,
    value,
    icon,
    delay = "",
    subtitle,
    badgeText,
    badgeType = 'success',
    trend,
    onClick
}: PremiumKpiCardProps) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 p-5 rounded-2xl transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:shadow-md flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''} ${delay}`}
    >
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{title}</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-400">
                <Icon name={icon} className="w-4 h-4" />
            </div>
        </div>

        <div className="space-y-1 mb-3">
            <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
                {value}
            </h3>
            {subtitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-0.5">{subtitle}</p>
            )}
        </div>

        {/* Mini Sparkline SVG wave */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
            <svg className="w-20 h-5 text-blue-500 dark:text-blue-400" viewBox="0 0 100 25" fill="none">
                <path
                    d="M0 20 Q 25 5, 50 18 T 100 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
            {badgeText && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight border ${
                    badgeType === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/50' :
                    badgeType === 'info' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/50' :
                    badgeType === 'neutral' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200/60 dark:border-neutral-700' :
                    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/50'
                }`}>
                    {badgeText}
                </span>
            )}
        </div>
    </div>
);
