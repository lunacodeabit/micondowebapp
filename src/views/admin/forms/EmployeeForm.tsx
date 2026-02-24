import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Employee } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type EmployeeFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<Employee>;
};

export const EmployeeForm = ({ onSuccess, onCancel, defaultValues }: EmployeeFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Employee>({
        defaultValues: {
            ...defaultValues,
            hireDate: getLocalDateString(defaultValues?.hireDate),
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: Employee) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            let updatedEmployees;
            if (defaultValues?.id) {
                updatedEmployees = selectedCondo.employees.map(e => e.id === defaultValues.id ? { ...e, ...data } : e);
            } else {
                updatedEmployees = [...selectedCondo.employees, { ...data, id: Date.now().toString() }];
            }
            updateCondo({ ...selectedCondo, employees: updatedEmployees });

            addToast(`Empleado ${defaultValues?.id ? 'actualizado' : 'creado'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar el empleado.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Nombre Completo" htmlFor="name" error={errors.name?.message}>
                <FormCommon.Input id="name" {...register('name', { required: 'El nombre es requerido' })} />
            </FormCommon.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Cédula" htmlFor="identityNumber">
                    <FormCommon.Input id="identityNumber" {...register('identityNumber')} />
                </FormCommon.Group>
                <FormCommon.Group label="Teléfono" htmlFor="phone">
                    <FormCommon.Input id="phone" {...register('phone')} />
                </FormCommon.Group>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Cargo" htmlFor="position" error={errors.position?.message}>
                    <FormCommon.Input id="position" {...register('position', { required: 'El cargo es requerido' })} />
                </FormCommon.Group>
                <FormCommon.Group label="Salario Mensual (RD$)" htmlFor="monthlySalary" error={errors.monthlySalary?.message}>
                    <FormCommon.Input type="number" step="0.01" id="monthlySalary" {...register('monthlySalary', { required: 'El salario es requerido', valueAsNumber: true })} />
                </FormCommon.Group>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Fecha de Contratación" htmlFor="hireDate">
                    <FormCommon.Input type="date" id="hireDate" {...register('hireDate')} />
                </FormCommon.Group>
                <FormCommon.Group label="Estado" htmlFor="status">
                    <FormCommon.Select id="status" {...register('status')}>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Empleado</FormCommon.Button>
            </div>
        </form>
    );
};