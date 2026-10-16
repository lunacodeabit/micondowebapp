import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminProfileModal } from '../../../components/modals/AdminProfileModal';
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
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleTabChange = (tab: string) => {
        if (tab === 'profile') {
            setIsProfileModalOpen(true);
        } else {
            onTabChange(tab);
        }
    };

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            dashboard: 'Consola Central',
            condos: 'Gestionar Clientes',
        };
        return titles[activeTab] || 'Administración';
    };

    return (
        <div className="flex h-screen bg-[#f8f9fb] dark:bg-[#0b0f17] text-neutral-800 dark:text-neutral-100 overflow-hidden transition-colors duration-200">
            {/* Sidebar persistent for Admin experience */}
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={logout}
                isOpenOnMobile={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-[#f8f9fb] dark:bg-[#0b0f17] transition-colors duration-200">
                <AdminHeader
                    pageTitle={getPageTitle()}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    onOpenProfile={() => setIsProfileModalOpen(true)}
                />

                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
                    <div className="max-w-[1400px] mx-auto anime-fade-in pb-16">
                        {children}
                    </div>
                </main>
            </div>

            {/* Admin Profile Modal */}
            <AdminProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};
