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
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    onTabChange,
    onLogout,
    userName = "Administrador",
}) => {
    const navItems: NavItem[] = [
        { id: "dashboard", label: "Inicio", icon: "layout-dashboard" },
        { id: "condos", label: "Gestionar Clientes", icon: "building-2" },
        { id: "news", label: "Novedades SaaS", icon: "megaphone" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-6 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Icon name="shield-check" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">WISE <span className="text-neutral-500">SERVICES</span></h1>
                        <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[2px] px-3 mb-4 mt-2">
                    Ecosistema
                </p>

                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                w-full flex items-center justify-between px-3 py-3 rounded-xl
                transition-all duration-300 group
                ${isActive
                                    ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 text-white border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                                }
              `}
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    name={item.icon as any}
                                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-orange-400 font-bold" : "text-neutral-500 group-hover:text-neutral-300"}`}
                                />
                                <span className={`text-sm tracking-tight ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                                <span
                                    className={`${item.badgeColor} text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[18px] text-center shadow-lg`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}

                <div className="my-6 border-t border-neutral-800/50 mx-2" />

                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[2px] px-3 mb-4">
                    Personal
                </p>

                <button
                    onClick={() => onTabChange("profile")}
                    className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl
            transition-all duration-300 group
            ${activeTab === "profile"
                            ? "bg-neutral-800 text-white border border-neutral-700"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                        }
          `}
                >
                    <Icon name="user" className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300" />
                    <span className="text-sm font-medium">Mi Perfil</span>
                </button>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-neutral-700 flex items-center justify-center p-[2px]">
                        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                            <Icon name="user" className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate tracking-tight">
                            {userName}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-medium truncate uppercase tracking-widest">Power User</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-red-500/10 font-bold text-xs uppercase tracking-widest"
                >
                    <Icon name="log-out" className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};
