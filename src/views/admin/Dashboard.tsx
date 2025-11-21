import React, { useState } from 'react';
import type { Condo } from '../../types';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { CondoForm } from './forms/CondoForm';

type CondoSelectorProps = {
    condos: Condo[];
    onSelectCondo: (id: number) => void;
    onLogout: () => void;
    onBack: () => void;
    onAddCondo: (data: any) => void; // This will be handled by the form now
};

export const CondoSelector = ({ condos, onSelectCondo, onLogout, onBack }: CondoSelectorProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <header className="absolute top-0 right-0 p-4 flex gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <Icon name="arrow-left" size={18} />
                    <span>Volver al Dashboard</span>
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <Icon name="log-out" size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </header>
            <div className="w-full max-w-2xl text-center">
                <Icon name="building-2" className="mx-auto text-blue-500 mb-4" size={48} />
                <h1 className="text-3xl font-bold text-white mb-2">Gestión de Clientes</h1>
                <p className="text-neutral-400 mb-8">Seleccione un cliente para gestionar o cree uno nuevo.</p>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        <Icon name="plus" size={18} />
                        <span>Crear Nuevo Cliente</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {condos.map(condo => (
                        <button
                            key={condo.id}
                            onClick={() => onSelectCondo(condo.id)}
                            className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold py-4 px-6 rounded-lg text-left transition-colors flex items-center justify-between"
                        >
                            <div>
                                <h2 className="text-lg">{condo.name}</h2>
                                <p className="text-sm text-neutral-500">{condo.address}</p>
                            </div>
                            <Icon name="chevron-right" />
                        </button>
                    ))}
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Crear Nuevo Cliente"
                size="5xl"
            >
                <CondoForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};