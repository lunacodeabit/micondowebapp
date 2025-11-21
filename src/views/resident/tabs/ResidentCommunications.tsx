import React from 'react';
import type { Condo } from '../../../types';
import { formatDate } from '../../../utils/date';

type ResidentCommunicationsProps = {
    condo: Condo;
};

export const ResidentCommunications = ({ condo }: ResidentCommunicationsProps) => {
    // --- AIRBAG: Lista segura de comunicados ---
    const communications = (condo.communications as unknown as any[]) || [];
    
    const sortedCommunications = [...communications].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
         <div>
            <h2 className="text-2xl font-bold text-white mb-2">Comunicados</h2>
            <p className="text-neutral-400 mb-6">Manténgase al día con los últimos anuncios de la administración.</p>

            <div className="space-y-4">
                {sortedCommunications.length > 0 ? sortedCommunications.map((comm: any) => (
                    <div key={comm.id} className="bg-neutral-900 p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-white">{comm.title}</h3>
                             <span className="text-sm text-neutral-400">{formatDate(comm.date)}</span>
                        </div>
                        <p className="text-neutral-300 whitespace-pre-wrap">{comm.content}</p>
                    </div>
                )) : (
                    <div className="bg-neutral-900 p-8 rounded-lg shadow-md text-center">
                        <p className="text-neutral-500">No hay comunicados recientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};