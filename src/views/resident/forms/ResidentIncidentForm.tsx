import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormCommon } from '../../../components/forms/FormCommon';
import type { Unit, Incident } from '../../../types';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';
import { getLocalDateString } from '../../../utils/date';

type IncidentReportFormData = {
    description: string;
};

type ResidentIncidentFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    resident: Unit;
};

export const ResidentIncidentForm = ({ onSuccess, onCancel, resident }: ResidentIncidentFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<IncidentReportFormData>();
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: IncidentReportFormData) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            const reporterIdentifier = `${resident.ownerName} (${resident.apartmentNumber})`;
            const newIncident: Incident = {
                id: Date.now(),
                date: getLocalDateString(),
                reportedBy: reporterIdentifier,
                description: data.description,
                status: 'Abierto',
                resolution: '',
            };

            // --- CORRECCIÓN BLINDADA ---
            // Obtenemos la lista vieja de forma segura (si es undefined, es [])
            const currentIncidents = (selectedCondo.incidents as unknown as any[]) || [];
            
            const updatedCondo = {
                ...selectedCondo,
                // Guardamos la nueva lista forzando el tipo
                incidents: [newIncident, ...currentIncidents] as any
            };
            // ---------------------------
            
            updateCondo(updatedCondo);

            addToast('Incidente reportado con éxito. La administración lo revisará pronto.', 'success');
            onSuccess();
        } catch (error) {
            addToast('Hubo un error al reportar el incidente.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Descripción del Incidente" htmlFor="description" error={errors.description?.message}>
                <FormCommon.Textarea
                    id="description"
                    rows={5}
                    placeholder="Por favor, sea lo más detallado posible sobre el problema, incluyendo la ubicación exacta (ej. 'Bombillo quemado en el pasillo del piso 3, cerca del ascensor')."
                    {...register('description', { required: 'La descripción es requerida' })}
                />
            </FormCommon.Group>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Enviar Reporte</FormCommon.Button>
            </div>
        </form>
    );
};