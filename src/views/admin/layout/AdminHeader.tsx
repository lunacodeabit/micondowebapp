import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';

type AdminHeaderProps = {
    pageTitle?: string;
    condoName?: string;
    onToggleMobileSidebar: () => void;
    onOpenProfile?: () => void;
};

export const AdminHeader = ({ pageTitle, condoName, onToggleMobileSidebar, onOpenProfile }: AdminHeaderProps) => {
    const activeCondoName = condoName || 'Torre Residencial Los Pinos';
    const activeSection = pageTitle || 'Informes & Operaciones';

    return (
        <header className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 sticky top-0 z-30 transition-colors duration-200">
            {/* Left: Mobile Toggle + Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleMobileSidebar}
                    className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors lg:hidden border border-neutral-200 dark:border-neutral-700"
                    aria-label="Abrir Menú"
                >
                    <Icon name="menu" className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <h1 className="text-xl lg:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                        {activeSection}
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {activeCondoName}
                    </span>
                </div>
            </div>

            {/* Right: Theme Toggle + Download Report Button + Profile */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 text-xs font-semibold transition-all shadow-xs"
                >
                    <Icon name="download" className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="hidden sm:inline">Descargar Informe</span>
                </button>

                <button
                    onClick={onOpenProfile}
                    className="flex items-center gap-2.5 pl-3 border-l border-neutral-200 dark:border-neutral-800 hover:opacity-80 transition-opacity cursor-pointer group text-left"
                    title="Ver Mi Perfil"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                        HL
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Howard Luna</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Administrador</p>
                    </div>
                </button>
            </div>
        </header>
    );
};