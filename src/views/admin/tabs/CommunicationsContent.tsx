import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { CommunicationForm } from '../forms/CommunicationForm';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';

type CommunicationsContentProps = {
    initialAction: string | null;
    clearInitialAction: () => void;
};

export const CommunicationsContent = ({ initialAction, clearInitialAction }: CommunicationsContentProps) => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        if (initialAction === 'add') {
            setIsModalOpen(true);
            clearInitialAction();
        }
    }, [initialAction, clearInitialAction]);
    
    if (!selectedCondo) return <div>Cargando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Comunicados</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-xs">
                    <Icon name="plus" size={18} />
                    <span>Nuevo Comunicado</span>
                </button>
            </div>

            <div className="space-y-4">
                {selectedCondo.communications.map(comm => (
                    <div key={comm.id} className="bg-white dark:bg-[#161b26] p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="text-base font-bold text-neutral-900 dark:text-white">{comm.title}</h3>
                             <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{formatDate(comm.date)}</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{comm.content}</p>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Comunicado">
                <CommunicationForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};