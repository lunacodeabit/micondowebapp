import React, { useState } from 'react';
import type { Unit, Condo } from '../../types';
import { useCondo } from '../../context/CondoContext';
import { ResidentHeader } from './layout/ResidentHeader';
import { ResidentSidebar } from './layout/ResidentSidebar';
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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { updateCondo } = useCondo();

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
        <div className="bg-neutral-950 text-neutral-300 min-h-screen lg:flex">
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
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
