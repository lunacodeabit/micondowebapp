import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Payroll, PayrollPayment } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

type PayrollFormData = {
    year: number;
    month: number;
    fortnight: 1 | 2;
    periodType: 'Quincenal' | 'Mensual';
};

type PayrollFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
};

export const PayrollForm = ({ onSuccess, onCancel }: PayrollFormProps) => {
    const { register, handleSubmit } = useForm<PayrollFormData>({
        defaultValues: {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            fortnight: 1,
            periodType: 'Quincenal'
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: PayrollFormData) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            const activeEmployees = selectedCondo.employees.filter(e => e.status === 'Activo');
            if (activeEmployees.length === 0) {
                addToast('No hay empleados activos para generar la nómina.', 'info');
                setIsLoading(false);
                return;
            }

            const payments: PayrollPayment[] = activeEmployees.map(emp => {
                const fortnightlySalary = emp.monthlySalary / 2;
                return {
                    employeeId: emp.id,
                    employeeName: emp.name,
                    netPay: fortnightlySalary,
                    incomeDetails: [{ concept: 'Sueldo Quincena', amount: fortnightlySalary }],
                    deductionDetails: []
                };
            });

            const monthName = new Date(data.year, data.month).toLocaleString('es-ES', { month: 'long' });
            const periodLabel = `${data.fortnight === 1 ? '1ra' : '2da'} Quincena ${monthName} ${data.year}`;

            const newPayroll: Payroll = {
                id: Date.now(),
                year: data.year,
                month: data.month,
                fortnight: data.fortnight,
                periodType: data.periodType,
                periodLabel,
                status: 'Abierta',
                payments
            };
            
            updateCondo({ ...selectedCondo, payrolls: [newPayroll, ...selectedCondo.payrolls] });
            addToast('Nómina generada con éxito.', 'success');
            onSuccess();

        } catch (error) {
            addToast('Error al generar la nómina.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Año" htmlFor="year">
                    <FormCommon.Select id="year" {...register('year', { valueAsNumber: true })}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
                 <FormCommon.Group label="Mes" htmlFor="month">
                    <FormCommon.Select id="month" {...register('month', { valueAsNumber: true })}>
                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>
             <FormCommon.Group label="Tipo de Período" htmlFor="periodType">
                <FormCommon.Select id="periodType" {...register('periodType')}>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                </FormCommon.Select>
            </FormCommon.Group>
             <FormCommon.Group label="Quincena" htmlFor="fortnight">
                <FormCommon.Select id="fortnight" {...register('fortnight', { valueAsNumber: true })}>
                    <option value={1}>1ra Quincena</option>
                    <option value={2}>2da Quincena</option>
                </FormCommon.Select>
            </FormCommon.Group>
            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Generar Nómina</FormCommon.Button>
            </div>
        </form>
    );
};