import React, { useState, useEffect } from 'react';
import { Sidebar } from './layout/Sidebar';
import { AdminHeader } from './layout/AdminHeader';
import { DashboardContent } from './tabs/DashboardContent';
import { FinanceContent } from './tabs/FinanceContent';
import { UnitsContent } from './tabs/UnitsContent';
import { CommunicationsContent } from './tabs/CommunicationsContent';
import { IncidentsContent } from './tabs/IncidentsContent';
import { AccountsPayableContent } from './tabs/AccountsPayableContent';
import { HRContent } from './tabs/HRContent';
import { AmenitiesContent } from './tabs/AmenitiesContent';
import { ReportsContent } from './tabs/ReportsContent';
import { FilesContent } from './tabs/FilesContent';
import { SettingsContent } from './tabs/SettingsContent';
import { useCondo } from '../../context/CondoContext'; // Nota: Solo dos '../'
import { ResidentsContent } from './tabs/ResidentsContent';
import { ElisaAIContent } from './tabs/ElisaAIContent';
import { AssembliesContent } from './tabs/AssembliesContent';

import { AdminProfileModal } from '../../components/modals/AdminProfileModal';

type CondoAdminPanelProps = {
    onBack: () => void;
    onLogout: () => void;
};

export const CondoAdminPanel = ({ onBack, onLogout }: CondoAdminPanelProps) => {
    const { selectedCondo } = useCondo();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [initialAction, setInitialAction] = useState<string | null>(null);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleNavigation = (tab: string, action: string | null = null) => {
        setActiveTab(tab);
        setInitialAction(action);
    };

    useEffect(() => {
        // Ensure Lucide icons are processed on tab change
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab]);

    const renderContent = () => {
        if (!selectedCondo) {
            return <div>Cargando condominio...</div>;
        }

        const actionProps = (tab: string) => ({
            initialAction: activeTab === tab ? initialAction : null,
            clearInitialAction: () => setInitialAction(null)
        });

        switch (activeTab) {
            case 'dashboard': return <DashboardContent onNavigate={handleNavigation} />;
            case 'finances': return <FinanceContent {...actionProps('finances')} />;
            case 'units': return <UnitsContent />;
            case 'communications': return <CommunicationsContent {...actionProps('communications')} />;
            case 'incidents': return <IncidentsContent {...actionProps('incidents')} />;
            case 'payable': return <AccountsPayableContent {...actionProps('payable')} />;
            case 'hr': return <HRContent />;
            case 'amenities': return <AmenitiesContent />;
            case 'files': return <FilesContent />;
            case 'reports': return <ReportsContent />;
            case 'settings': return <SettingsContent />;
            case 'residents': return <ResidentsContent />;
            case 'elisa': return <ElisaAIContent />;
            case 'assemblies': return <AssembliesContent />;
            default: return <DashboardContent onNavigate={handleNavigation} />;
        }
    };

    return (
        <div className="bg-[#f8f9fb] dark:bg-[#0b0f17] text-neutral-800 dark:text-neutral-100 min-h-screen transition-colors duration-200">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onBack={onBack}
                onLogout={onLogout}
                isCollapsed={isDesktopSidebarCollapsed}
                onToggleCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                isOpenOnMobile={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
            <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${isDesktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <AdminHeader
                    condoName={selectedCondo?.name || ''}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    onOpenProfile={() => setIsProfileModalOpen(true)}
                />
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </main>

            <AdminProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};