import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuth } from '../../../context/AuthContext';

type AdminMainLayoutProps = {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
};

export const AdminMainLayout: React.FC<AdminMainLayoutProps> = ({
    children,
    activeTab,
    onTabChange
}) => {
    const { logout } = useAuth();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            dashboard: 'Consola Central',
            condos: 'Gestionar Condominios',
            news: 'Novedades Mi Condo',
            profile: 'Mi Perfil'
        };
        return titles[activeTab] || 'Administración';
    };

    return (
        <div className="flex h-screen bg-neutral-950 overflow-hidden">
            {/* Sidebar persistent for Admin experience */}
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={logout}
                isOpenOnMobile={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64 relative overflow-hidden">
                <AdminHeader
                    pageTitle={getPageTitle()}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                />
                {/* Background decorative elements matching Shadow-Fusion */}
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative z-10">
                    <div className="max-w-7xl mx-auto anime-fade-in pb-20 md:pb-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
