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
                bg-white dark:bg-[#111827] border-r border-neutral-200/80 dark:border-neutral-800 shadow-[1px_0_10px_rgba(0,0,0,0.02)]
                flex flex-col p-4
                transition-colors duration-200 ease-in-out h-full
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                ${isOpenOnMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className={`flex items-center mb-6 px-2 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center shadow-sm flex-shrink-0 text-white font-extrabold text-sm">
                        <Icon name="shield-check" className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3">
                            <h2 className="text-sm font-black text-neutral-900 dark:text-white tracking-tight leading-tight">WISE SERVICES</h2>
                            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Gestión Condominal</p>
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
                                    w-full flex items-center gap-3 px-3 py-2 rounded-xl
                                    transition-all duration-200 group text-left
                                    ${isActive
                                        ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60"
                                    }
                                    ${isCollapsed ? 'justify-center px-0' : ''}
                                `}
                            >
                                <Icon
                                    name={item.icon}
                                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`}
                                />
                                {!isCollapsed && (
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-xs font-medium tracking-tight">{item.label}</span>
                                        {item.subLabel && <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider mt-0.5">{item.subLabel}</span>}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-1 pt-3 border-t border-neutral-200/80 dark:border-neutral-800">
                    <button
                        onClick={onBack}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60
                            transition-all duration-200
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <Icon name="arrow-left" className="w-4 h-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                        {!isCollapsed && <span className="text-xs font-medium">Volver a Condominios</span>}
                    </button>

                    <button
                        onClick={onLogout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30
                            transition-all duration-200
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <Icon name="log-out" className="w-4 h-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                        {!isCollapsed && <span className="text-xs font-medium">Cerrar Sesión</span>}
                    </button>

                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                        <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} className="w-4 h-4" />
                    </button>
                </div>
            </aside>
        </>
    );
};
