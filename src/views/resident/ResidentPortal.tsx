import React, { useState } from 'react';
import type { Unit, Condo } from '../../types';
import { useCondo } from '../../context/CondoContext';
import { ResidentHeader } from './layout/ResidentHeader';
import { ResidentSidebar } from './layout/ResidentSidebar';
import { Icon } from '../../components/ui/Icon';
import { ResidentDashboard } from './tabs/ResidentDashboard';
import { ResidentAccount } from './tabs/ResidentAccount';
import { ResidentCommunications } from './tabs/ResidentCommunications';
import { ResidentPayments } from './tabs/ResidentPayments';
import { ResidentReservations } from './tabs/ResidentReservations';
import { ResidentIncidents } from './tabs/ResidentIncidents';
import { ResidentAssemblies } from './tabs/ResidentAssemblies';

type ResidentPortalProps = {
    resident: Unit;
    condo: Condo;
    onLogout: () => void;
};

// Fix: Reconstructed the ResidentPortal component, which was missing due to a file corruption issue.
export const ResidentPortal = ({ resident, condo, onLogout }: ResidentPortalProps) => {
    const { updateCondo } = useCondo();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    if (!resident) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 border border-neutral-800">
                    <Icon name="loader" className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Cargando Perfil...</h2>
                <p className="text-xs text-neutral-500 max-w-xs">Estamos preparando tu portal residencial para brindarte la mejor experiencia.</p>
                <button
                    onClick={onLogout}
                    className="mt-8 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <ResidentDashboard resident={resident} condo={condo} />;
            case 'account':
                return <ResidentAccount resident={resident} />;
            case 'payments':
                return <ResidentPayments resident={resident} condo={condo} onUpdateCondoData={updateCondo} />;
            case 'communications':
                return <ResidentCommunications condo={condo} />;
            case 'reservations':
                return <ResidentReservations resident={resident} condo={condo} onUpdateCondoData={updateCondo} />;
            case 'incidents':
                return <ResidentIncidents resident={resident} condo={condo} onUpdateCondoData={updateCondo} />;
            case 'assemblies':
                return <ResidentAssemblies />;
            default:
                return <ResidentDashboard resident={resident} condo={condo} />;
        }
    };

    const getPageTitle = () => {
        const titles: { [key: string]: string } = {
            dashboard: 'Inicio',
            account: 'Mi Cuenta',
            payments: 'Notificación de Pagos',
            communications: 'Comunicados',
            reservations: 'Reservas',
            incidents: 'Incidentes',
            assemblies: 'Asambleas'
        };
        return titles[activeTab] || 'Portal de Residente';
    };

    return (
        <div className="bg-neutral-950 text-neutral-300 min-h-screen lg:flex overflow-hidden">
            <ResidentSidebar
                residentName={resident.ownerName}
                unitNumber={resident.apartmentNumber}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                isOpenOnMobile={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <ResidentHeader
                    pageTitle={getPageTitle()}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-neutral-950 relative">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {activeTab === 'dashboard' ? (
                            <ResidentDashboard
                                resident={resident}
                                condo={condo}
                                onNavigate={setActiveTab}
                            />
                        ) : renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};
