import React, { useState, useEffect } from 'react';
import type { Incident } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { IncidentForm } from '../forms/IncidentForm';
import { IncidentReportForm } from '../forms/IncidentReportForm';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';

type IncidentsContentProps = {
    initialAction: string | null;
    clearInitialAction: () => void;
};

export const IncidentsContent = ({ initialAction, clearInitialAction }: IncidentsContentProps) => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
    const [filter, setFilter] = useState('Abierto');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (initialAction === 'add') {
            setIsReportModalOpen(true);
            clearInitialAction();
        }
    }, [initialAction, clearInitialAction]);

    const handleOpenModal = (incident: Incident) => {
        setEditingIncident(incident);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingIncident(null);
        setIsModalOpen(false);
    };

    const handleCloseReportModal = () => {
        setIsReportModalOpen(false);
    };

    if (!selectedCondo) return <div>Cargando...</div>;

    const filteredIncidents = (selectedCondo.incidents || [])
        .filter(i => filter === 'Todos' || i.status === filter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gestión de Incidentes</h2>
                 <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-xs">
                    <Icon name="plus" size={18} />
                    <span>Reportar Incidente</span>
                </button>
            </div>

            <div className="mb-4">
                <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg max-w-sm border border-neutral-200/80 dark:border-neutral-700/60">
                    {['Abierto', 'En Progreso', 'Cerrado', 'Todos'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`w-full px-3 py-1 text-xs font-semibold rounded-md transition-all ${filter === f ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredIncidents.length > 0 ? filteredIncidents.map(incident => (
                    <details key={incident.id} className="bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden group">
                        <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                            <div>
                                <p className="font-semibold text-sm text-neutral-900 dark:text-white">Reportado por: {incident.reportedBy}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{incident.description.substring(0, 80)}...</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={incident.status} />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(incident.date)}</span>
                                <Icon name="chevron-down" className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"/>
                            </div>
                        </summary>
                        <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs space-y-2">
                            <p className="text-neutral-700 dark:text-neutral-300"><strong className="text-neutral-900 dark:text-white">Descripción Completa:</strong> {incident.description}</p>
                            <p className="text-neutral-700 dark:text-neutral-300"><strong className="text-neutral-900 dark:text-white">Resolución:</strong> {incident.resolution || 'N/A'}</p>
                            <button onClick={() => handleOpenModal(incident)} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                Actualizar Estado/Resolución
                            </button>
                        </div>
                    </details>
                )) : (
                     <div className="bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs p-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                        No hay incidentes para mostrar en esta categoría.
                    </div>
                )}
            </div>

            {editingIncident && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Actualizar Incidencia">
                    <IncidentForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingIncident} />
                </Modal>
            )}

             <Modal isOpen={isReportModalOpen} onClose={handleCloseReportModal} title="Reportar Nuevo Incidente">
                <IncidentReportForm onSuccess={handleCloseReportModal} onCancel={handleCloseReportModal} />
            </Modal>
        </div>
    );
};