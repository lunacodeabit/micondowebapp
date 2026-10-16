import React from "react";
import { Icon } from "../../../components/ui/Icon";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  badgeColor?: string;
};

type SuperAdminSidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShowRoadmap: () => void;
  onLogout: () => void;
  metrics: {
    unreadMessages?: number;
    pendingPayments?: number;
    inGrace?: number;
  };
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
};

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeTab,
  onTabChange,
  onShowRoadmap,
  onLogout,
  metrics,
  isOpenOnMobile,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    { id: "dashboard", label: "Inicio", icon: "layout-dashboard" },
    {
      id: "companies",
      label: "Compañías",
      icon: "building-2",
      badge: metrics.inGrace,
      badgeColor: "bg-yellow-500",
    },
    {
      id: "plans",
      label: "Planes",
      icon: "credit-card",
    },
    {
      id: "billing",
      label: "Facturación",
      icon: "receipt",
      badge: metrics.pendingPayments,
      badgeColor: "bg-orange-500",
    },
    { id: "communications", label: "Comunicados", icon: "megaphone" },
    {
      id: "messages",
      label: "Mensajes",
      icon: "message-circle",
      badge: metrics.unreadMessages,
      badgeColor: "bg-red-500",
    },
    { id: "elisa", label: "Elisa AI", icon: "bot" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${isOpenOnMobile ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#111827] border-r border-neutral-200/80 dark:border-neutral-800 shadow-[1px_0_10px_rgba(0,0,0,0.02)] flex flex-col z-[70] transition-colors duration-200 ease-in-out
        ${isOpenOnMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Icon name="building-2" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-neutral-900 dark:text-white tracking-tight">MICONDO OS</h1>
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">SuperAdmin SaaS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-2">
            Menú Principal
          </p>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onCloseMobile(); }}
                className={`
                w-full flex items-center justify-between px-3 py-2 rounded-xl
                transition-all duration-200 group text-left
                ${isActive
                    ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60"
                  }
              `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={item.icon as any}
                    className={`w-4 h-4 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"}`}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span
                    className={`${item.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-neutral-200/80 dark:border-neutral-800" />

          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-2">
            Herramientas
          </p>

          {/* Roadmap Button */}
          <button
            onClick={() => { onShowRoadmap(); onCloseMobile(); }}
            className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            transition-all duration-200 group
            ${activeTab === "roadmap"
                ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60"
              }
          `}
          >
            <Icon
              name="map"
              className={`w-4 h-4 ${activeTab === "roadmap" ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500"}`}
            />
            <span className="text-xs font-medium">Dev Roadmap</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">
              DEV
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => { onTabChange("settings"); onCloseMobile(); }}
            className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            transition-all duration-200 group
            ${activeTab === "settings"
                ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60"
              }
          `}
          >
            <Icon
              name="settings"
              className={`w-4 h-4 ${activeTab === "settings" ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500"}`}
            />
            <span className="text-xs font-medium">Configuración</span>
          </button>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 mb-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              <Icon name="user" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                Super Admin
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">Acceso total</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200 text-xs font-medium"
          >
            <Icon name="log-out" className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
