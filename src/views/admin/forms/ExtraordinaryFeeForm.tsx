import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ExtraordinaryFee } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type ExtraordinaryFeeFormData = Omit<ExtraordinaryFee, 'id' | 'status' | 'distributionType'>;

type ExtraordinaryFeeFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<ExtraordinaryFee>;
};

export const ExtraordinaryFeeForm = ({ onSuccess, onCancel, defaultValues }: ExtraordinaryFeeFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ExtraordinaryFeeFormData>({
        defaultValues: {
            ...defaultValues,
            issueDate: getLocalDateString(defaultValues?.issueDate),
            dueDate: getLocalDateString(defaultValues?.dueDate),
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleFormSubmit = async (data: ExtraordinaryFeeFormData) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            let updatedFees;
            if (defaultValues?.id) {
                updatedFees = (selectedCondo.extraordinaryFees || []).map(f =>
                    f.id === defaultValues.id ? { ...f, ...data } : f
                );
            } else {
                const newFee: ExtraordinaryFee = {
                    ...data,
                    id: Date.now(),
                    status: 'Pendiente',
                    distributionType: 'EQUAL',
                };
                updatedFees = [...(selectedCondo.extraordinaryFees || []), newFee];
            }
            updateCondo({ ...selectedCondo, extraordinaryFees: updatedFees });
            
            addToast(`Cuota extraordinaria ${defaultValues?.id ? 'actualizada' : 'creada'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar la cuota extraordinaria.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Título de la Cuota" htmlFor="title" error={errors.title?.message}>
                <FormCommon.Input id="title" {...register('title', { required: 'El título es requerido' })} />
            </FormCommon.Group>
            <FormCommon.Group label="Descripción" htmlFor="description">
                <FormCommon.Textarea id="description" {...register('description')} />
            </FormCommon.Group>
            <FormCommon.Group label="Monto Total (RD$)" htmlFor="totalAmount" error={errors.totalAmount?.message}>
                <FormCommon.Input type="number" step="0.01" id="totalAmount" {...register('totalAmount', { required: 'El monto total es requerido', valueAsNumber: true, min: 1 })} />
            </FormCommon.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Fecha de Emisión" htmlFor="issueDate" error={errors.issueDate?.message}>
                    <FormCommon.Input type="date" id="issueDate" {...register('issueDate', { required: 'La fecha de emisión es requerida' })} />
                </FormCommon.Group>
                <FormCommon.Group label="Fecha de Vencimiento" htmlFor="dueDate" error={errors.dueDate?.message}>
                    <FormCommon.Input type="date" id="dueDate" {...register('dueDate', { required: 'La fecha de vencimiento es requerida' })} />
                </FormCommon.Group>
            </div>
            <p className="text-sm text-neutral-400">
                Nota: El monto total se distribuirá en partes iguales entre todas las unidades activas al momento de aplicar la cuota.
            </p>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Cuota</FormCommon.Button>
            </div>
        </form>
    );
};