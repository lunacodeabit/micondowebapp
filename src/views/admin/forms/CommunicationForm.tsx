import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Communication } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type CommunicationFormData = Omit<Communication, 'id' | 'date'>;

type CommunicationFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<Communication>;
};

export const CommunicationForm = ({ onSuccess, onCancel, defaultValues }: CommunicationFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Communication>({ defaultValues });
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: CommunicationFormData) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));
            const newCommunication: Communication = {
                ...data,
                id: Date.now(),
                date: new Date().toISOString(),
            };
            const updatedCommunications = [newCommunication, ...selectedCondo.communications];
            updateCondo({ ...selectedCondo, communications: updatedCommunications });
            
            addToast('Comunicado enviado con éxito.', 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al enviar el comunicado.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Título" htmlFor="title" error={errors.title?.message}>
                <FormCommon.Input id="title" {...register('title', { required: 'El título es requerido' })} />
            </FormCommon.Group>
            <FormCommon.Group label="Contenido del Comunicado" htmlFor="content" error={errors.content?.message}>
                <FormCommon.Textarea id="content" {...register('content', { required: 'El contenido es requerido' })} />
            </FormCommon.Group>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Enviar Comunicado</FormCommon.Button>
            </div>
        </form>
    );
};