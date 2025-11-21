import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Amenity } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type AmenityFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<Amenity>;
};

export const AmenityForm = ({ onSuccess, onCancel, defaultValues }: AmenityFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Amenity>({ defaultValues });
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: Amenity) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            let updatedAmenities;
            if (defaultValues?.id) {
                updatedAmenities = selectedCondo.amenities.map(a => a.id === defaultValues.id ? { ...a, ...data } : a);
            } else {
                updatedAmenities = [...selectedCondo.amenities, { ...data, id: Date.now() }];
            }
            updateCondo({ ...selectedCondo, amenities: updatedAmenities });
            
            addToast(`Área común ${defaultValues?.id ? 'actualizada' : 'creada'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar el área común.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Nombre del Área" htmlFor="name" error={errors.name?.message}>
                <FormCommon.Input id="name" {...register('name', { required: 'El nombre es requerido' })} />
            </FormCommon.Group>
            <FormCommon.Group label="Descripción" htmlFor="description" error={errors.description?.message}>
                <FormCommon.Textarea id="description" {...register('description', { required: 'La descripción es requerida' })} />
            </FormCommon.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Capacidad (Personas)" htmlFor="capacity" error={errors.capacity?.message}>
                    <FormCommon.Input type="number" id="capacity" {...register('capacity', { required: 'La capacidad es requerida', valueAsNumber: true, min: 1 })} />
                </FormCommon.Group>
                <FormCommon.Group label="Costo de Reserva (RD$)" htmlFor="fee" error={errors.fee?.message}>
                    <FormCommon.Input type="number" step="0.01" id="fee" {...register('fee', { required: 'El costo es requerido', valueAsNumber: true, min: 0 })} />
                </FormCommon.Group>
            </div>
            <FormCommon.Group label="Reglas de Uso" htmlFor="rules" error={errors.rules?.message}>
                <FormCommon.Textarea id="rules" {...register('rules', { required: 'Las reglas son requeridas' })} />
            </FormCommon.Group>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Área Común</FormCommon.Button>
            </div>
        </form>
    );
};