import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Supplier } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type SupplierFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<Supplier>;
};

export const SupplierForm = ({ onSuccess, onCancel, defaultValues }: SupplierFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Supplier>({
        defaultValues: {
            ...defaultValues,
            supplierSince: getLocalDateString(defaultValues?.supplierSince),
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: Supplier) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            let updatedSuppliers;
            if (defaultValues?.id) {
                updatedSuppliers = selectedCondo.suppliers.map(s => s.id === defaultValues.id ? { ...s, ...data } : s);
            } else {
                updatedSuppliers = [...selectedCondo.suppliers, { ...data, id: Date.now() }];
            }
            updateCondo({ ...selectedCondo, suppliers: updatedSuppliers });

            addToast(`Proveedor ${defaultValues?.id ? 'actualizado' : 'creado'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar el proveedor.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Nombre del Proveedor" htmlFor="name" error={errors.name?.message}>
                <FormCommon.Input id="name" {...register('name', { required: 'El nombre es requerido' })} />
            </FormCommon.Group>
            <FormCommon.Group label="Tipo de Servicio" htmlFor="serviceType" error={errors.serviceType?.message}>
                <FormCommon.Input id="serviceType" {...register('serviceType', { required: 'El tipo de servicio es requerido' })} />
            </FormCommon.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Nombre de Contacto" htmlFor="contactName">
                    <FormCommon.Input id="contactName" {...register('contactName')} />
                </FormCommon.Group>
                <FormCommon.Group label="Teléfono" htmlFor="phone">
                    <FormCommon.Input id="phone" {...register('phone')} />
                </FormCommon.Group>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Email" htmlFor="email">
                    <FormCommon.Input type="email" id="email" {...register('email')} />
                </FormCommon.Group>
                <FormCommon.Group label="RNC" htmlFor="rnc">
                    <FormCommon.Input id="rnc" {...register('rnc')} />
                </FormCommon.Group>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Estado" htmlFor="status">
                    <FormCommon.Select id="status" {...register('status')}>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Proveedor Desde" htmlFor="supplierSince">
                    <FormCommon.Input type="date" id="supplierSince" {...register('supplierSince')} />
                </FormCommon.Group>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Proveedor</FormCommon.Button>
            </div>
        </form>
    );
};