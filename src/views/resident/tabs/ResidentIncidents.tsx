import React, { useState, useMemo } from 'react';
import type { Unit, Condo, Incident } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ResidentIncidentForm } from '../forms/ResidentIncidentForm';
import { formatDate } from '../../../utils/date';

type ResidentIncidentsProps = {
    resident: Unit;
    condo: Condo;
    onUpdateCondoData: (updatedCondo: Condo) => void;
};

export const ResidentIncidents = ({ resident, condo }: ResidentIncidentsProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const reporterIdentifier = `${resident.ownerName} (${resident.apartmentNumber})`;
    
    const myIncidents = useMemo(() => {
        // --- AIRBAG: Lista segura de incidentes ---
        const incidents = (condo.incidents as unknown as any[]) || [];
        
        return incidents
            .filter((i: any) => i.reportedBy === reporterIdentifier)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [condo.incidents, reporterIdentifier]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Mis Incidentes</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} />
                    <span>Reportar Incidente</span>
                </button>
            </div>
            
            <p className="text-neutral-400 mb-6">Aquí puede ver el historial de incidentes que ha reportado y su estado actual.</p>

            <div className="space-y-4">
                {myIncidents.length > 0 ? myIncidents.map((incident: any) => (
                    <details key={incident.id} className="bg-neutral-900 rounded-lg shadow-md overflow-hidden">
                        <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-800/50">
                            <div>
                                <p className="font-semibold text-white truncate max-w-xs md:max-w-md">{incident.description}</p>
                                <p className="text-sm text-neutral-500">{formatDate(incident.date)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={incident.status} />
                                <Icon name="chevron-down" className="w-5 h-5 transition-transform details-open:rotate-180 flex-shrink-0"/>
                            </div>
                        </summary>
                        <div className="px-4 pb-4 border-t border-neutral-800">
                            <p className="mt-2 text-neutral-300"><strong>Descripción Completa:</strong> {incident.description}</p>
                            <p className="mt-2 text-neutral-300"><strong>Respuesta de la Administración:</strong> {incident.resolution || 'Aún sin respuesta.'}</p>
                        </div>
                    </details>
                )) : (
                     <div className="bg-neutral-900 rounded-lg shadow-md p-8 text-center text-neutral-400">
                        <Icon name="shield-check" className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-2 text-lg font-medium text-white">Todo en orden</h3>
                        <p className="mt-1 text-sm">No ha reportado ningún incidente.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reportar Nuevo Incidente">
                <ResidentIncidentForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    resident={resident}
                />
            </Modal>
        </div>
    );
};