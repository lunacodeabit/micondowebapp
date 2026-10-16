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
        const incidents = (condo.incidents as unknown as any[]) || [];
        return incidents
            .filter((i: any) => i.reportedBy === reporterIdentifier || (i.reportedBy && i.reportedBy.includes(resident.apartmentNumber)))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [condo.incidents, reporterIdentifier, resident.apartmentNumber]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Reporte de Averías e Incidentes</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Consulte el estado de sus reportes o notifique un nuevo incidente en su edificio.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all self-start sm:self-auto"
                >
                    <Icon name="plus" size={16} />
                    <span>Reportar Incidente</span>
                </button>
            </div>

            <div className="space-y-3">
                {myIncidents.length > 0 ? myIncidents.map((incident: any) => (
                    <details key={incident.id} className="group bg-white dark:bg-[#161b26] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all">
                        <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors list-none">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-neutral-900 dark:text-white text-sm truncate">{incident.description}</p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{formatDate(incident.date)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={incident.status} />
                                <Icon name="chevron-down" className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180 flex-shrink-0"/>
                            </div>
                        </summary>
                        <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs space-y-2 bg-neutral-50/50 dark:bg-neutral-900/30">
                            <p className="text-neutral-700 dark:text-neutral-300">
                                <span className="font-bold text-neutral-900 dark:text-white">Descripción Completa: </span>
                                {incident.description}
                            </p>
                            <p className="text-neutral-700 dark:text-neutral-300">
                                <span className="font-bold text-neutral-900 dark:text-white">Respuesta de la Administración: </span>
                                {incident.resolution ? (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">{incident.resolution}</span>
                                ) : (
                                    <span className="text-neutral-400 italic">En revisión por el equipo administrativo.</span>
                                )}
                            </p>
                        </div>
                    </details>
                )) : (
                    <div className="bg-white dark:bg-[#161b26] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs p-10 text-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                            <Icon name="shield-check" className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Todo en orden</h3>
                        <p className="text-xs text-neutral-500 mt-1">No tiene incidentes abiertos o reportados.</p>
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