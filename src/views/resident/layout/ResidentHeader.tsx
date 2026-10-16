import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';

type ResidentHeaderProps = {
    pageTitle: string;
    onToggleMobileSidebar: () => void;
};

export const ResidentHeader = ({ pageTitle, onToggleMobileSidebar }: ResidentHeaderProps) => {
    return (
        <header className="bg-white dark:bg-[#111827] px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 sticky top-0 z-30 transition-colors duration-200">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleMobileSidebar}
                    className="lg:hidden p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors border border-neutral-200 dark:border-neutral-700"
                    aria-label="Abrir Menú"
                >
                    <Icon name="menu" className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon name="user-check" className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            {pageTitle}
                        </h1>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Portal de Residente • Powered by MiCondo</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Portal Activo</span>
                </div>
            </div>
        </header>
    );
};