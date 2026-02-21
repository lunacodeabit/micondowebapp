import React from 'react';
import { Icon } from '../../../components/ui/Icon';

type SidebarProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onBack: () => void;
    onLogout: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isOpenOnMobile: boolean;
    onCloseMobile: () => void;
};

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'finances', label: 'Finanzas', icon: 'dollar-sign' },
    { id: 'units', label: 'Unidades', subLabel: 'Cuentas por Cobrar', icon: 'users' },
    { id: 'residents', label: 'Residentes', icon: 'user-plus' },
    { id: 'payable', label: 'Cuentas x Pagar', icon: 'receipt' },
    { id: 'hr', label: 'Recursos Humanos', icon: 'briefcase' },
    { id: 'communications', label: 'Comunicados', icon: 'megaphone' },
    { id: 'incidents', label: 'Incidentes', icon: 'alert-triangle' },
    { id: 'amenities', label: 'Áreas Comunes', icon: 'calendar-check' },
    { id: 'files', label: 'Archivos', icon: 'folder-archive' },
    { id: 'reports', label: 'Reportes', icon: 'file-text' },
    { id: 'settings', label: 'Configuración', icon: 'sliders-horizontal' },
    { id: 'elisa', label: 'Elisa AI', icon: 'bot', subLabel: 'Asistente Virtual' },
];

export const Sidebar = ({ activeTab, setActiveTab, onBack, onLogout, isCollapsed, onToggleCollapse, isOpenOnMobile, onCloseMobile }: SidebarProps) => {
    return (
        <>
            {/* Mobile backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpenOnMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onCloseMobile}
                aria-hidden="true"
            ></div>

            <aside className={`fixed inset-y-0 left-0 z-40 bg-neutral-900 flex flex-col p-4 border-r border-neutral-800 transition-all duration-300 ease-in-out h-full
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                ${isOpenOnMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className={`flex items-center mb-6 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                    <Icon name="shield-check" className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <h2 className={`text-xl font-bold text-white whitespace-nowrap ml-2 transition-all duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100 delay-100'}`}>MiCondoApp</h2>
                </div>
                <nav className="flex-1 space-y-2">
                    {/* Fix: Inlined NavLink component to resolve TypeScript error with the 'key' prop. */}
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab(item.id); onCloseMobile(); }}
                            title={isCollapsed ? item.label : undefined}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                            <div className={`flex flex-col ml-3 transition-all duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100 delay-100'}`}>
                                <span className="whitespace-nowrap leading-tight">{item.label}</span>
                                {item.subLabel && <span className="whitespace-nowrap text-xs text-neutral-500 leading-tight">{item.subLabel}</span>}
                            </div>
                        </a>
                    ))}
                </nav>
                <div className="mt-auto space-y-2 pt-2 border-t border-neutral-800">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onBack(); }}
                        title={isCollapsed ? "Volver a Condos" : undefined}
                        className={`flex w-full items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <Icon name="arrow-left" className="w-5 h-5 flex-shrink-0" />
                        <span className={`whitespace-nowrap ml-3 transition-all duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100 delay-100'}`}>Volver a Condos</span>
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); onLogout(); }}
                        title={isCollapsed ? "Cerrar Sesión" : undefined}
                        className={`flex w-full items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <Icon name="log-out" className="w-5 h-5 flex-shrink-0" />
                        <span className={`whitespace-nowrap ml-3 transition-all duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100 delay-100'}`}>Cerrar Sesión</span>
                    </a>
                    <button
                        onClick={onToggleCollapse}
                        className={`hidden lg:flex w-full items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? "Expandir" : "Colapsar"}
                    >
                        <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-5 h-5 flex-shrink-0" />
                        <span className={`whitespace-nowrap ml-3 transition-all duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100 delay-100'}`}>Colapsar</span>
                    </button>
                </div>
            </aside>
        </>
    );
};