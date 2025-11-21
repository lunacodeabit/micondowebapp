import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AccountPayable, Transaction } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type AccountPayableFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<AccountPayable>;
};

export const AccountPayableForm = ({ onSuccess, onCancel, defaultValues }: AccountPayableFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<AccountPayable>({
        defaultValues: {
            ...defaultValues,
            issueDate: getLocalDateString(defaultValues?.issueDate),
            dueDate: getLocalDateString(defaultValues?.dueDate),
        }
    });
    
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: AccountPayable) => {
        if (!selectedCondo) return;
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(res => setTimeout(res, 700));

            const updatedCondo = { ...selectedCondo };
            let newExpense: Transaction | null = null;
            
            const wasPending = defaultValues?.id ? defaultValues.status === 'Pendiente' : false;
            const isNowPaid = data.status === 'Pagada';
            const needsExpense = !defaultValues?.relatedExpenseId && (isNowPaid || (wasPending && isNowPaid));

            if (needsExpense) {
                const expenseId = Date.now();
                newExpense = {
                    id: expenseId,
                    date: getLocalDateString(),
                    type: 'Egreso',
                    description: `Pago Factura: ${data.supplier} - #${data.invoiceNumber}`,
                    amount: data.amount,
                    category: 'Servicios',
                    balance: 0, 
                };
                data.relatedExpenseId = expenseId;
                data.paymentDate = getLocalDateString();
            }

            let updatedPayables;
            if (defaultValues?.id) {
                updatedPayables = selectedCondo.accountsPayable.map(p => p.id === defaultValues.id ? { ...p, ...data } : p);
            } else {
                const newPayable: AccountPayable = {
                    ...data,
                    id: Date.now() + 1,
                    paymentDate: data.status === 'Pagada' ? getLocalDateString() : null,
                    relatedExpenseId: data.relatedExpenseId || null,
                };
                updatedPayables = [...selectedCondo.accountsPayable, newPayable];
            }
            
            updatedCondo.accountsPayable = updatedPayables;
            if (newExpense) {
                updatedCondo.finances = [...selectedCondo.finances, newExpense];
            }
            
            updateCondo(updatedCondo);
            addToast(`Cuenta por pagar ${defaultValues?.id ? 'actualizada' : 'creada'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar la cuenta por pagar.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Proveedor" htmlFor="supplier" error={errors.supplier?.message}>
                <FormCommon.Input id="supplier" {...register('supplier', { required: 'El proveedor es requerido' })} />
            </FormCommon.Group>
            <FormCommon.Group label="Número de Factura" htmlFor="invoiceNumber" error={errors.invoiceNumber?.message}>
                <FormCommon.Input id="invoiceNumber" {...register('invoiceNumber', { required: 'El número de factura es requerido' })} />
            </FormCommon.Group>
             <FormCommon.Group label="Descripción" htmlFor="description" error={errors.description?.message}>
                <FormCommon.Input id="description" {...register('description', { required: 'La descripción es requerida' })} />
            </FormCommon.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Fecha de Emisión" htmlFor="issueDate" error={errors.issueDate?.message}>
                    <FormCommon.Input type="date" id="issueDate" {...register('issueDate', { required: 'La fecha de emisión es requerida' })} />
                </FormCommon.Group>
                <FormCommon.Group label="Fecha de Vencimiento" htmlFor="dueDate" error={errors.dueDate?.message}>
                    <FormCommon.Input type="date" id="dueDate" {...register('dueDate', { required: 'La fecha de vencimiento es requerida' })} />
                </FormCommon.Group>
            </div>
            <FormCommon.Group label="Monto" htmlFor="amount" error={errors.amount?.message}>
                <FormCommon.Input type="number" step="0.01" id="amount" {...register('amount', { required: 'El monto es requerido', valueAsNumber: true })} />
            </FormCommon.Group>
            <FormCommon.Group label="Estado" htmlFor="status">
                <FormCommon.Select id="status" {...register('status')}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagada">Pagada</option>
                </FormCommon.Select>
            </FormCommon.Group>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Cuenta</FormCommon.Button>
            </div>
        </form>
    );
};