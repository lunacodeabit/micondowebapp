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
    { id: 'dashboard', label: 'Inicio', icon: 'layout-dashboard' },
    { id: 'finances', label: 'Finanzas', icon: 'dollar-sign' },
    { id: 'units', label: 'Unidades', subLabel: 'CxC', icon: 'users' },
    { id: 'residents', label: 'Residentes', icon: 'user-plus' },
    { id: 'payable', label: 'CxP', icon: 'receipt' },
    { id: 'hr', label: 'R. Humanos', icon: 'briefcase' },
    { id: 'communications', label: 'Comunicados', icon: 'megaphone' },
    { id: 'incidents', label: 'Incidentes', icon: 'alert-triangle' },
    { id: 'amenities', label: 'Amenities', icon: 'calendar-check' },
    { id: 'files', label: 'Archivos', icon: 'folder-archive' },
    { id: 'assemblies', label: 'Asambleas', icon: 'gavel' },
    { id: 'reports', label: 'Reportes', icon: 'file-text' },
    { id: 'settings', label: 'Ajustes', icon: 'sliders-horizontal' },
    { id: 'elisa', label: 'Elisa AI', icon: 'bot' },
];

export const Sidebar = ({
    activeTab,
    setActiveTab,
    onBack,
    onLogout,
    isCollapsed,
    onToggleCollapse,
    isOpenOnMobile,
    onCloseMobile
}: SidebarProps) => {
    return (
        <>
            {/* Mobile backdrop */}
            <div
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${isOpenOnMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onCloseMobile}
            />

            <aside className={`
                fixed inset-y-0 left-0 z-40 
                bg-neutral-900/90 backdrop-blur-xl 
                flex flex-col p-4 border-r border-neutral-800/50 
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-full
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                ${isOpenOnMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className={`flex items-center mb-10 px-2 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)] flex-shrink-0">
                        <Icon name="shield-check" className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3 anime-fade-in">
                            <h2 className="text-xl font-black text-white tracking-tighter leading-none">MI CONDO</h2>
                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[2px]">Admin Panel</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); onCloseMobile(); }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    transition-all duration-300 group
                                    ${isActive
                                        ? "bg-gradient-to-r from-orange-400/10 to-orange-600/10 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]"
                                        : "text-neutral-500 hover:text-white hover:bg-neutral-800/50"
                                    }
                                    ${isCollapsed ? 'justify-center px-0' : ''}
                                `}
                            >
                                <Icon
                                    name={item.icon}
                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : ''}`}
                                />
                                {!isCollapsed && (
                                    <div className="flex flex-col items-start leading-none group-hover:translate-x-1 transition-transform duration-300">
                                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                        {item.subLabel && <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">{item.subLabel}</span>}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-2 pt-4 border-t border-neutral-800/50">
                    <button
                        onClick={onBack}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-neutral-500 hover:text-white hover:bg-neutral-800/50
                            transition-all duration-300 border border-transparent
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <Icon name="arrow-left" className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">Volver</span>}
                    </button>

                    <button
                        onClick={onLogout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-neutral-500 hover:text-red-400 hover:bg-red-500/5
                            transition-all duration-300 border border-transparent
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <Icon name="log-out" className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">Cerrar Sesión</span>}
                    </button>

                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-neutral-600 hover:text-white transition-colors"
                    >
                        <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
                    </button>
                </div>
            </aside>
        </>
    );
};
