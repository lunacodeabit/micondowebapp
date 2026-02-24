import React from 'react';
import { Icon } from '../../../components/ui/Icon';

type SuperAdminHeaderProps = {
    pageTitle: string;
    onToggleMobileSidebar: () => void;
};

export const SuperAdminHeader = ({ pageTitle, onToggleMobileSidebar }: SuperAdminHeaderProps) => {
    return (
        <header className="bg-neutral-900/50 backdrop-blur-xl p-4 flex items-center border-b border-neutral-800/50 sticky top-0 z-30 lg:hidden">
            <button
                onClick={onToggleMobileSidebar}
                className="mr-4 p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="Menu"
            >
                <Icon name="menu" className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Icon name="building-2" className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">
                        {pageTitle}
                    </h1>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">SuperAdmin Panel</p>
                </div>
            </div>
        </header>
    );
};
