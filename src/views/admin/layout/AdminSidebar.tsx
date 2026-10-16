import React from "react";
import { Icon } from "../../../components/ui/Icon";

type NavItem = {
    id: string;
    label: string;
    icon: string;
    badge?: number;
    badgeColor?: string;
};

type AdminSidebarProps = {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    userName?: string;
    isOpenOnMobile: boolean;
    onCloseMobile: () => void;
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    onTabChange,
    onLogout,
    userName = "Administrador",
    isOpenOnMobile,
    onCloseMobile,
}) => {
    const navItems: NavItem[] = [
        { id: "dashboard", label: "Inicio", icon: "layout-dashboard" },
        { id: "condos", label: "Gestionar Clientes", icon: "building-2" },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${isOpenOnMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onCloseMobile}
                aria-hidden="true"
            ></div>

            <aside className={`fixed lg:relative left-0 top-0 h-screen w-60 bg-white dark:bg-[#111827] border-r border-neutral-200/80 dark:border-neutral-800 flex flex-col z-[70] transition-colors duration-200 ease-in-out
                ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section - Tesla Style Clean Branding */}
                <div className="p-6 pb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-[0.2em] text-[#e82127]">WISE</span>
                        <span className="text-xl font-light tracking-[0.2em] text-neutral-800 dark:text-neutral-200">SERVICES</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider uppercase mt-1">
                        Administración • <span className="text-blue-600 dark:text-blue-400 font-bold">MiCondo</span>
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onTabChange(item.id); onCloseMobile(); }}
                                className={`
                                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl
                                    transition-all duration-150 group text-left
                                    ${isActive
                                        ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-medium"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        name={item.icon as any}
                                        className={`w-4 h-4 transition-transform duration-150 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"}`}
                                    />
                                    <span className="text-sm tracking-tight">{item.label}</span>
                                </div>
                                {item.badge && item.badge > 0 && (
                                    <span
                                        className={`${item.badgeColor || 'bg-blue-600'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <div className="pt-6 pb-2 px-3">
                        <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                            Soporte
                        </p>
                    </div>

                    <button
                        onClick={() => { onTabChange("profile"); onCloseMobile(); }}
                        className={`
                            w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                            transition-all duration-150 group text-left
                            ${activeTab === "profile"
                                ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-medium"
                            }
                        `}
                    >
                        <Icon name="user" className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
                        <span className="text-sm tracking-tight">Mi Perfil</span>
                    </button>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                            HL
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate leading-tight">
                                {userName}
                            </p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium truncate">Wise Services RD</p>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-xs font-semibold shadow-2xs"
                    >
                        <Icon name="log-out" className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
