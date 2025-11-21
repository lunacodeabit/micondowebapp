import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Incident } from '../../../types';
import { incidentStatusOptions } from '../../../data/mockData';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';


type IncidentFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues: Incident;
};

export const IncidentForm = ({ onSuccess, onCancel, defaultValues }: IncidentFormProps) => {
    const { register, handleSubmit } = useForm<Incident>({ defaultValues });
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleFormSubmit = async (data: Incident) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            const updatedIncidents = selectedCondo.incidents.map(i => i.id === data.id ? data : i);
            updateCondo({ ...selectedCondo, incidents: updatedIncidents });
            
            addToast('Incidencia actualizada con éxito.', 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al actualizar la incidencia.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="p-4 bg-neutral-800 rounded-lg">
                <p><strong>Reportado por:</strong> {defaultValues.reportedBy}</p>
                <p><strong>Fecha:</strong> {formatDate(defaultValues.date)}</p>
                <p className="mt-2"><strong>Descripción:</strong></p>
                <p className="text-neutral-300">{defaultValues.description}</p>
            </div>

            <FormCommon.Group label="Estado de la Incidencia" htmlFor="status">
                <FormCommon.Select id="status" {...register('status')}>
                    {incidentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </FormCommon.Select>
            </FormCommon.Group>

            <FormCommon.Group label="Detalles de la Resolución" htmlFor="resolution">
                <FormCommon.Textarea id="resolution" {...register('resolution')} />
            </FormCommon.Group>
            
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Actualizar Incidencia</FormCommon.Button>
            </div>
        </form>
    );
};