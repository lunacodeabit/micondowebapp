import React, { useState } from 'react';
import type { Condo } from '../../types';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { CondoForm } from './forms/CondoForm';
import { AdminMainLayout } from './layout/AdminMainLayout';

type CondoSelectorProps = {
    condos: Condo[];
    onSelectCondo: (id: string) => void;
    onLogout: () => void;
    onBack: () => void;
    onAddCondo: (data: any) => void;
};

const CustomerCard = ({ condo, onSelect }: { condo: Condo; onSelect: () => void }) => (
    <button
        onClick={onSelect}
        className="group bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500/50 p-6 rounded-2xl text-left transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:shadow-md cursor-pointer flex items-center justify-between gap-4"
    >
        <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Icon name="building-2" className="w-7 h-7" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {condo.name}
                    </h2>
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold rounded-md border border-neutral-200/60 dark:border-neutral-700">
                        {condo.code || "CLI"}
                    </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate font-medium">
                    {condo.address || 'Santo Domingo, República Dominicana'}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{condo.units?.length || 0} Unidades</span>
                    </span>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                        • Gestión Operativa
                    </span>
                </div>
            </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 flex items-center justify-center transition-all group-hover:translate-x-1 flex-shrink-0 border border-neutral-200/60 dark:border-neutral-700">
            <Icon name="chevron-right" className="w-5 h-5" />
        </div>
    </button>
);

export const CondoSelector = ({ condos, onSelectCondo, onLogout, onBack }: CondoSelectorProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AdminMainLayout activeTab="condos" onTabChange={(tab) => { if (tab === 'dashboard') onBack(); }}>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                        <Icon name="building-2" className="w-4 h-4" />
                        <span>Gestión de Clientes</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Tus Clientes
                        <span className="text-neutral-400 dark:text-neutral-500 font-medium ml-2">Activos ({condos.length})</span>
                    </h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Selecciona un condominio para acceder a su panel administrativo o registra un nuevo edificio.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                    <Icon name="plus" className="w-4 h-4" />
                    <span>Crear Nuevo Cliente</span>
                </button>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
                {condos.map(condo => (
                    <CustomerCard
                        key={condo.id}
                        condo={condo}
                        onSelect={() => onSelectCondo(condo.id)}
                    />
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Crear Nuevo Cliente"
                size="5xl"
            >
                <div className="p-2">
                    <CondoForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
                </div>
            </Modal>
        </AdminMainLayout>
    );
};
