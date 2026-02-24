import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Transaction, Unit, AccountHistoryItem } from '../../../types';
import { expenseCategories } from '../../../data/mockData';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';


type TransactionFormData = Partial<Transaction> & { unitId?: string };

type TransactionFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<Transaction>;
};

export const TransactionForm = ({ onSuccess, onCancel, defaultValues }: TransactionFormProps) => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Transaction>({
        defaultValues: {
            ...defaultValues,
            date: getLocalDateString(defaultValues?.date),
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const transactionType = watch('type', defaultValues?.type || 'Ingreso');
    const [isFeePayment, setIsFeePayment] = useState(defaultValues?.description?.startsWith('Pago Mant') || false);
    const [selectedUnitId, setSelectedUnitId] = useState('');

    useEffect(() => {
        if (transactionType !== 'Ingreso') {
            setIsFeePayment(false);
        }
    }, [transactionType]);

    useEffect(() => {
        if (isFeePayment && selectedUnitId && selectedCondo) {
            const unit = selectedCondo.units.find(u => u.id === selectedUnitId);
            if (unit) {
                setValue('amount', unit.monthlyFee);
                const date = new Date(watch('date') + 'T00:00:00Z'); // Ensure correct date parsing
                const monthName = date.toLocaleString('es-ES', { month: 'long', timeZone: 'UTC' });
                const year = date.getUTCFullYear();
                setValue('description', `Pago Mant ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}-${year} - Apto ${unit.apartmentNumber}`);
            }
        }
    }, [isFeePayment, selectedUnitId, selectedCondo, setValue, watch]);

    const handleFormSubmit = async (data: Transaction) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            const submitData: TransactionFormData = { ...data };
            if (isFeePayment && selectedUnitId) {
                submitData.unitId = selectedUnitId;
            }

            const updatedCondo = { ...selectedCondo };
            let updatedFinances;

            if (defaultValues?.id) {
                updatedFinances = selectedCondo.finances.map(tx => tx.id === defaultValues.id ? { ...tx, ...submitData } as Transaction : tx);
            } else {
                const newTx: Transaction = {
                    id: Date.now().toString(),
                    date: submitData.date!,
                    type: submitData.type!,
                    description: submitData.description!,
                    amount: submitData.amount!,
                    category: submitData.category || null,
                    balance: 0, // Balance will be recalculated
                };
                updatedFinances = [...selectedCondo.finances, newTx];
            }

            updatedCondo.finances = updatedFinances;

            if (submitData.unitId && submitData.type === 'Ingreso') {
                const unitIndex = updatedCondo.units.findIndex(u => u.id === submitData.unitId);
                if (unitIndex !== -1) {
                    const newHistoryItem: AccountHistoryItem = {
                        id: (Date.now() + 1).toString(),
                        date: submitData.date!,
                        type: 'Abono',
                        description: 'Pago cuota',
                        amount: submitData.amount!,
                    };
                    updatedCondo.units[unitIndex].accountHistory.push(newHistoryItem);
                }
            }

            updateCondo(updatedCondo);
            addToast(`Transacción ${defaultValues?.id ? 'actualizada' : 'creada'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar la transacción.', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormCommon.Group label="Tipo de Transacción" htmlFor="type">
                <FormCommon.Select id="type" {...register('type')}>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Egreso">Egreso</option>
                </FormCommon.Select>
            </FormCommon.Group>

            {transactionType === 'Ingreso' && (
                <div className="flex items-center gap-2 bg-neutral-800 p-3 rounded-md">
                    <input type="checkbox" id="isFeePayment" checked={isFeePayment} onChange={(e) => setIsFeePayment(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isFeePayment" className="text-sm text-neutral-300">Es un pago de cuota de mantenimiento</label>
                </div>
            )}

            {isFeePayment && transactionType === 'Ingreso' && (
                <FormCommon.Group label="Unidad" htmlFor="unitSelect">
                    <FormCommon.Select id="unitSelect" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}>
                        <option value="">Seleccione una unidad</option>
                        {selectedCondo?.units.filter(u => u.status === 'Activo').map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.apartmentNumber} - {unit.ownerName}</option>
                        ))}
                    </FormCommon.Select>
                </FormCommon.Group>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Fecha" htmlFor="date" error={errors.date?.message}>
                    <FormCommon.Input type="date" id="date" {...register('date', { required: 'La fecha es requerida' })} />
                </FormCommon.Group>
                <FormCommon.Group label="Monto" htmlFor="amount" error={errors.amount?.message}>
                    <FormCommon.Input type="number" step="0.01" id="amount" {...register('amount', { required: 'El monto es requerido', valueAsNumber: true })} disabled={isFeePayment} />
                </FormCommon.Group>
            </div>

            <FormCommon.Group label="Descripción" htmlFor="description" error={errors.description?.message}>
                <FormCommon.Input id="description" {...register('description', { required: 'La descripción es requerida' })} disabled={isFeePayment} />
            </FormCommon.Group>

            {transactionType === 'Egreso' && (
                <FormCommon.Group label="Categoría" htmlFor="category">
                    <FormCommon.Select id="category" {...register('category')}>
                        <option value="">Sin Categoría</option>
                        {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
            )}

            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Transacción</FormCommon.Button>
            </div>
        </form>
    );
};