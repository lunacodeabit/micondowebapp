import React from 'react';
import { Icon } from '../../../components/ui/Icon';

type ResidentSidebarProps = {
    residentName: string;
    unitNumber: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    isOpenOnMobile: boolean;
    onCloseMobile: () => void;
};

const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'layout-dashboard' },
    { id: 'account', label: 'Mi Cuenta', icon: 'credit-card' },
    { id: 'payments', label: 'Pagos', icon: 'banknote' },
    { id: 'communications', label: 'Comunicados', icon: 'megaphone' },
    { id: 'reservations', label: 'Reservas', icon: 'calendar-check' },
    { id: 'incidents', label: 'Incidentes', icon: 'siren' },
    { id: 'assemblies', label: 'Asambleas', icon: 'gavel' },
];

export const ResidentSidebar = ({
    residentName,
    unitNumber,
    activeTab,
    setActiveTab,
    onLogout,
    isOpenOnMobile,
    onCloseMobile
}: ResidentSidebarProps) => {

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpenOnMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onCloseMobile}
                aria-hidden="true"
            ></div>

            <aside className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white dark:bg-[#111827] border-r border-neutral-200/80 dark:border-neutral-800 shadow-[1px_0_10px_rgba(0,0,0,0.02)] flex flex-col p-4 transition-colors duration-200 ease-in-out w-72
                ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-3 mb-6 p-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm text-white font-extrabold text-sm">
                        <Icon name="home" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-neutral-900 dark:text-white tracking-tight leading-tight">MiCondo</h2>
                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Portal de Residente</p>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-3.5 mb-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {residentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate leading-tight">{residentName}</p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Apto {unitNumber} • Propietario</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveTab(item.id); onCloseMobile(); }}
                                className={`
                                    flex items-center gap-3 px-3.5 py-2 text-xs font-medium rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                                    }
                                `}
                            >
                                <Icon
                                    name={item.icon}
                                    className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400 dark:text-neutral-500'}`}
                                />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>

                <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800">
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 px-3.5 py-2 text-xs font-medium rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    >
                        <Icon name="log-out" className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
