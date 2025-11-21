import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';
import { Incident } from '../../../types';

type IncidentReportFormData = {
    description: string;
    date: string;
};

type IncidentReportFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
};

export const IncidentReportForm = ({ onSuccess, onCancel }: IncidentReportFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<IncidentReportFormData>({
        defaultValues: {
            date: getLocalDateString(),
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: IncidentReportFormData) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            const newIncident: Incident = {
                id: Date.now(),
                date: data.date,
                reportedBy: 'Administrador',
                description: data.description,
                status: 'Abierto',
                resolution: '',
            };
            const updatedIncidents = [newIncident, ...selectedCondo.incidents];
            updateCondo({ ...selectedCondo, incidents: updatedIncidents });

            addToast('Incidente reportado con éxito.', 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al reportar el incidente.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Fecha del Incidente" htmlFor="date" error={errors.date?.message}>
                <FormCommon.Input type="date" id="date" {...register('date', { required: 'La fecha es requerida' })} />
            </FormCommon.Group>
            <FormCommon.Group label="Descripción del Incidente" htmlFor="description" error={errors.description?.message}>
                <FormCommon.Textarea id="description" {...register('description', { required: 'La descripción es requerida' })} />
            </FormCommon.Group>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Reportar Incidente</FormCommon.Button>
            </div>
        </form>
    );
};