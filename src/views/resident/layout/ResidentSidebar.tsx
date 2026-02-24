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

            <aside className={`fixed lg:relative inset-y-0 left-0 z-40 bg-neutral-900/80 backdrop-blur-xl flex flex-col p-4 border-r border-neutral-800/50 transition-transform duration-300 ease-in-out w-72
                ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-4 mb-10 p-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        <Icon name="home" className="w-6 h-6 text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-lg font-black text-white tracking-tighter leading-none mb-1">WISE RESIDENT</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Portal Oficial</span>
                        </div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-neutral-800/30 border border-neutral-800/50 rounded-2xl p-4 mb-8 flex items-center gap-4 group transition-all duration-300 hover:border-blue-500/30">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700 overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${residentName}&background=2563eb&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs font-black text-white truncate">{residentName}</p>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Unidad {unitNumber}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveTab(item.id); onCloseMobile(); }}
                                className={`
                                    flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-blue-500/30'
                                        : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'
                                    }
                                `}
                            >
                                <Icon
                                    name={item.icon}
                                    className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-blue-400 group-hover:scale-110' : 'text-neutral-600 group-hover:text-blue-400'}`}
                                />
                                <span className={`whitespace-nowrap uppercase tracking-widest text-[11px] font-black ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                    {item.label}
                                </span>
                            </a>
                        );
                    })}
                </nav>

                <div className="pt-4 border-t border-neutral-800/50">
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <Icon name="log-out" className="w-5 h-5 text-neutral-600 group-hover:text-red-400" />
                        <span className="whitespace-nowrap uppercase tracking-widest text-[11px] font-black opacity-60 group-hover:opacity-100">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
