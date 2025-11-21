import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Reservation, Unit } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type ReservationFormData = Omit<Reservation, 'id' | 'amenityId'>;

type ReservationFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    units: Unit[];
    amenityId: number;
    defaultValues?: Partial<ReservationFormData>;
};

export const ReservationForm = ({ onSuccess, onCancel, units, amenityId, defaultValues }: ReservationFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ReservationFormData>({
        defaultValues: {
            date: getLocalDateString(),
            startTime: '12:00',
            endTime: '16:00',
            status: 'Aprobada',
            ...defaultValues,
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: ReservationFormData) => {
        if (!selectedCondo) return;
        if (data.startTime >= data.endTime) {
            addToast('La hora de fin debe ser posterior a la hora de inicio.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            const newReservation: Reservation = {
                ...data,
                id: Date.now(),
                amenityId: amenityId,
                unitId: Number(data.unitId)
            };
    
            const updatedReservations = [...selectedCondo.reservations, newReservation];
            updateCondo({ ...selectedCondo, reservations: updatedReservations });
            onSuccess();
        } catch(error) {
            addToast('Error al crear la reserva.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Unidad" htmlFor="unitId" error={errors.unitId?.message}>
                <FormCommon.Select id="unitId" {...register('unitId', { required: 'Debe seleccionar una unidad', valueAsNumber: true })}>
                    <option value="">Seleccione una unidad...</option>
                    {units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                            {unit.apartmentNumber} - {unit.ownerName}
                        </option>
                    ))}
                </FormCommon.Select>
            </FormCommon.Group>

            <FormCommon.Group label="Fecha de la Reserva" htmlFor="date" error={errors.date?.message}>
                <FormCommon.Input
                    type="date"
                    id="date"
                    min={getLocalDateString()}
                    {...register('date', { required: 'La fecha es requerida' })}
                />
            </FormCommon.Group>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Hora de Inicio" htmlFor="startTime" error={errors.startTime?.message}>
                    <FormCommon.Input
                        type="time"
                        id="startTime"
                        {...register('startTime', { required: 'La hora de inicio es requerida' })}
                    />
                </FormCommon.Group>
                <FormCommon.Group label="Hora de Fin" htmlFor="endTime" error={errors.endTime?.message}>
                    <FormCommon.Input
                        type="time"
                        id="endTime"
                        {...register('endTime', { required: 'La hora de fin es requerida' })}
                    />
                </FormCommon.Group>
            </div>
            
             <FormCommon.Group label="Estado" htmlFor="status">
                <FormCommon.Select id="status" {...register('status')}>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Pendiente">Pendiente</option>
                </FormCommon.Select>
            </FormCommon.Group>

            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Reserva</FormCommon.Button>
            </div>
        </form>
    );
};