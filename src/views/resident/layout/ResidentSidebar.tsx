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

            <aside className={`fixed lg:relative inset-y-0 left-0 z-40 bg-neutral-900 flex flex-col p-4 border-r border-neutral-800 transition-transform duration-300 ease-in-out w-64
                ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex items-center mb-6 p-2">
                    <Icon name="home" className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div className="ml-3 overflow-hidden">
                        <h2 className="text-md font-bold text-white whitespace-nowrap truncate">{residentName}</h2>
                        <p className="text-sm text-neutral-400">Unidad {unitNumber}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {/* Fix: Inlined NavLink component to resolve TypeScript error with the 'key' prop. */}
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab(item.id); onCloseMobile(); }}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                }`}
                        >
                            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                            <span className="whitespace-nowrap ml-3">{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="mt-auto pt-2 border-t border-neutral-800">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onLogout(); }}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                        <Icon name="log-out" className="w-5 h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap ml-3">Cerrar Sesión</span>
                    </a>
                </div>
            </aside>
        </>
    );
};