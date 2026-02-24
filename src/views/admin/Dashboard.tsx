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
        className="group relative bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-6 rounded-3xl text-left transition-all duration-500 hover:border-orange-500/30 hover:shadow-[0_0_40px_rgba(249,115,22,0.05)] overflow-hidden anime-fade-in"
    >
        {/* Hover Highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-orange-500/50 transition-all duration-500">
                <Icon name="building-2" className="w-8 h-8 text-neutral-400 group-hover:text-orange-400 transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-black text-white tracking-tight truncate group-hover:text-orange-400 transition-colors">
                        {condo.name}
                    </h2>
                    <span className="px-2 py-0.5 bg-neutral-800 rounded-md text-[9px] font-black text-neutral-500 uppercase tracking-widest border border-neutral-700">
                        {condo.code || "CLI"}
                    </span>
                </div>
                <p className="text-sm text-neutral-500 truncate font-medium">{condo.address}</p>

                <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <Icon name="users" className="w-3 h-3 text-neutral-600" />
                        <span>{condo.units?.length || 0} Unidades</span>
                    </div>
                </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-neutral-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500 border border-neutral-700">
                <Icon name="chevron-right" className="w-5 h-5 text-orange-500" />
            </div>
        </div>
    </button>
);

export const CondoSelector = ({ condos, onSelectCondo, onLogout, onBack }: CondoSelectorProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AdminMainLayout activeTab="condos" onTabChange={(tab) => { if (tab === 'dashboard') onBack(); }}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 anime-fade-in">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] font-black text-orange-500 uppercase tracking-[3px]">
                        <Icon name="building" className="w-4 h-4 shadow-xl shadow-orange-500/50" />
                        <span>Gestión de Clientes</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                        Tus Clientes <br />
                        <span className="text-neutral-500">Activos</span>
                    </h1>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative px-8 py-4 bg-white rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center gap-3 relative z-10">
                        <Icon name="plus" className="w-5 h-5 text-black" />
                        <span className="text-black font-black uppercase tracking-widest text-xs">Crear Nuevo Cliente</span>
                    </div>
                </button>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
