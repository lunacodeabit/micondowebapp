import React from 'react';
import type { Unit, Condo } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { formatDate } from '../../../utils/date';

type ResidentDashboardProps = {
    resident: Unit;
    condo: Condo;
};

// Componente de tarjeta simple
const InfoCard = ({ icon, title, children }: { icon: string, title: string, children?: React.ReactNode }) => (
    <div className="bg-neutral-900 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
            <Icon name={icon} className="w-6 h-6 mr-3 text-blue-500" />
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {children}
    </div>
);

export const ResidentDashboard = ({ resident, condo }: ResidentDashboardProps) => {
    // --- CORRECCIÓN 1: FORZAMOS A QUE SEA UNA LISTA (ARRAY) ---
    // TypeScript cree que es un solo objeto, por eso usamos 'as unknown as any[]'
    const history = (resident.accountHistory as unknown as any[]) || []; 
    
    const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);
    
    // --- CORRECCIÓN 2: LO MISMO PARA LOS COMUNICADOS ---
    const communications = (condo.communications as unknown as any[]) || [];
    
    const lastCommunication = communications.length > 0 
        ? [...communications].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
        : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon="dollar-sign" title="Balance de Cuenta">
                    <p className="text-3xl font-bold">
                        RD$ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {balance > 0 ? "Balance pendiente de pago" : "Su cuenta está al día"}
                    </p>
                </InfoCard>

                <InfoCard icon="megaphone" title="Último Comunicado">
                    {lastCommunication ? (
                        <div>
                            <p className="font-semibold text-neutral-300">{lastCommunication.title}</p>
                            <p className="text-sm text-neutral-400">{formatDate(lastCommunication.date)}</p>
                             <p className="text-sm text-neutral-300 mt-2 truncate">{lastCommunication.content}</p>
                        </div>
                    ) : (
                        <p className="text-neutral-400">No hay comunicados recientes.</p>
                    )}
                </InfoCard>
            </div>
        </div>
    );
};