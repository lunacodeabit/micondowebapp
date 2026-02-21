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
};

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeTab,
  onTabChange,
  onShowRoadmap,
  onLogout,
  metrics,
}) => {
  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
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
    { id: "communications", label: "Anuncios", icon: "megaphone" },
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Icon name="building-2" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">MI CONDO</h1>
            <p className="text-xs text-neutral-500">SuperAdmin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-3">
          Menú Principal
        </p>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${isActive
                  ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={item.icon as any}
                  className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-300"}`}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span
                  className={`${item.badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-neutral-800" />

        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-3">
          Herramientas
        </p>

        {/* Roadmap Button */}
        <button
          onClick={onShowRoadmap}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200 group
            ${activeTab === "roadmap"
              ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }
          `}
        >
          <Icon
            name="map"
            className={`w-5 h-5 ${activeTab === "roadmap" ? "text-purple-400" : "text-purple-500 group-hover:text-purple-400"}`}
          />
          <span className="font-medium text-sm">Dev Roadmap</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30">
            DEV
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={() => onTabChange("settings")}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200 group
            ${activeTab === "settings"
              ? "bg-gradient-to-r from-neutral-600/20 to-neutral-600/20 text-white border border-neutral-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }
          `}
        >
          <Icon
            name="settings"
            className={`w-5 h-5 ${activeTab === "settings" ? "text-neutral-300" : "text-neutral-500 group-hover:text-neutral-300"}`}
          />
          <span className="font-medium text-sm">Configuración</span>
        </button>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Icon name="user" className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Super Admin
            </p>
            <p className="text-xs text-neutral-500 truncate">Acceso total</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 border border-red-500/20"
        >
          <Icon name="log-out" className="w-4 h-4" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
