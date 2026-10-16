import React, { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { PaymentNotification, Unit } from '../../../types';
import { FormCommon } from '../../../components/forms/FormCommon';
import { Icon } from '../../../components/ui/Icon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type PaymentNotificationFormData = Omit<PaymentNotification, 'id' | 'unitId' | 'dateReported' | 'status' | 'proofUrl'>;

type PaymentNotificationFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    resident: Unit;
};

export const PaymentNotificationForm = ({ onSuccess, onCancel, resident }: PaymentNotificationFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<PaymentNotificationFormData>({
        defaultValues: {
            paymentDate: getLocalDateString(),
        }
    });
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            setFileName(file.name);
            setValue('proofFileName', file.name);
        }
    };

    const handleFormSubmit = async (data: PaymentNotificationFormData) => {
        if (!selectedCondo) return;
        if (!proofFile) {
            addToast('Debe adjuntar un comprobante de pago.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call delay
            await new Promise(res => setTimeout(res, 500));

            // Create a local blob URL for the proof file
            const proofUrl = URL.createObjectURL(proofFile);

            const newNotification: PaymentNotification = {
                ...data,
                id: Date.now().toString(),
                unitId: resident.id,
                dateReported: new Date().toISOString(),
                status: 'Pendiente',
                proofUrl: proofUrl,
            };

            // --- CORRECCIÓN BLINDADA ---
            // Convertimos la lista existente a 'any[]' para evitar errores de tipo
            const currentNotifications = (selectedCondo.paymentNotifications as unknown as any[]) || [];

            const updatedCondo = {
                ...selectedCondo,
                // Agregamos la nueva y le decimos a TS que confíe en nosotros
                paymentNotifications: [...currentNotifications, newNotification] as any
            };
            // ---------------------------

            updateCondo(updatedCondo);

            addToast('Notificación de pago enviada con éxito.', 'success');
            onSuccess();
        } catch (error) {
            console.error("Error creating blob URL for proof or saving notification: ", error);
            addToast('Error al enviar la notificación.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <input type="hidden" {...register('proofFileName')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Fecha del Pago" htmlFor="paymentDate" error={errors.paymentDate?.message}>
                    <FormCommon.Input type="date" id="paymentDate" {...register('paymentDate', { required: 'La fecha es requerida' })} />
                </FormCommon.Group>

                <FormCommon.Group label="Monto Pagado (RD$)" htmlFor="amount" error={errors.amount?.message}>
                    <FormCommon.Input type="number" step="0.01" id="amount" {...register('amount', { required: 'El monto es requerido', valueAsNumber: true, min: 1 })} />
                </FormCommon.Group>
            </div>

            <FormCommon.Group label="Adjuntar Comprobante" htmlFor="proof-upload">
                <div className="flex items-center gap-4">
                    <label htmlFor="proof-upload" className="cursor-pointer flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors">
                        <Icon name="upload-cloud" size={16} />
                        <span>Seleccionar Archivo</span>
                    </label>
                    <input id="proof-upload" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                    {fileName && <span className="text-neutral-700 dark:text-neutral-300 text-xs font-mono truncate">{fileName}</span>}
                </div>
                {!proofFile && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">
                        El comprobante es requerido.
                    </p>
                )}
            </FormCommon.Group>

            <FormCommon.Group label="Notas (Opcional)" htmlFor="notes">
                <FormCommon.Textarea id="notes" {...register('notes')} placeholder="Ej: Pago cuota Junio + abono a cuota extraordinaria." />
            </FormCommon.Group>

            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Enviar Notificación</FormCommon.Button>
            </div>
        </form>
    );
};