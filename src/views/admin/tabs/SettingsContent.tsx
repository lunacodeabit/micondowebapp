import React from 'react';
import { CondoForm } from '../forms/CondoForm';
import { useCondo } from '../../../context/CondoContext';

export const SettingsContent = () => {
    const { selectedCondo } = useCondo();

    if (!selectedCondo) {
        return <div>Cargando configuración...</div>;
    }

    const defaultValues = {
        code: selectedCondo.code,
        name: selectedCondo.name,
        address: selectedCondo.address,
        settings: selectedCondo.settings,
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Configuración del Condominio</h2>
            <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
                 <CondoForm 
                    onSuccess={() => {}} // No need to close modal here
                    onCancel={() => {}} // No-op for this context
                    defaultValues={defaultValues}
                    submitButtonText="Actualizar Configuración"
                    showCancelButton={false}
                />
            </div>
        </div>
    );
};