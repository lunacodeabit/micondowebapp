import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// Fix: Import CondoFormData from shared types file.
import type { Condo, CondoSettings, CondoFormData } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { defaultCondoSettings } from '../../../data/mockData';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

// This type is for the full condo object when editing
type FullCondoData = Omit<Condo, 'id' | 'finances' | 'units' | 'communications' | 'incidents' | 'accountsPayable' | 'employees' | 'suppliers' | 'payrolls' | 'amenities' | 'reservations' | 'files' | 'extraordinaryFees' | 'paymentNotifications' | 'manualBalance'>;


type CondoFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<CondoFormData>;
    submitButtonText?: string;
    showCancelButton?: boolean;
};

const FormSectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-lg font-semibold text-center text-white bg-neutral-700 p-2 rounded-md my-6">
        {title}
    </h3>
);

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

export const CondoForm = ({ 
    onSuccess, 
    onCancel, 
    defaultValues,
    submitButtonText = 'Guardar Cliente',
    showCancelButton = true 
}: CondoFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CondoFormData>({
        defaultValues: {
            ...defaultValues,
            settings: defaultValues?.settings || defaultCondoSettings,
        }
    });

    const { addCondo, selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: CondoFormData | FullCondoData) => {
        setIsLoading(true);
        try {
            await new Promise(res => setTimeout(res, 800));
            
            // If defaultValues (and thus an existing condo) is present, it's an update.
            if (defaultValues?.name && selectedCondo) {
                 const updatedCondo = {
                    ...selectedCondo,
                    ...data
                };
                updateCondo(updatedCondo);
                addToast('Configuración actualizada con éxito.', 'success');
            } else { // Otherwise, it's a new condo.
                addCondo(data as CondoFormData);
                addToast('Cliente creado con éxito.', 'success');
            }
            onSuccess();

        } catch (error) {
            addToast('Error al guardar los datos.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const parseBool = (v: string) => v === 'true';

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            
            <FormSectionHeader title="DATOS GENERALES" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormCommon.Group label="Código" htmlFor="code" error={errors.code?.message}><FormCommon.Input id="code" {...register('code')} /></FormCommon.Group>
                <FormCommon.Group label="Nombre Cliente" htmlFor="name" error={errors.name?.message}><FormCommon.Input id="name" {...register('name', { required: true })} /></FormCommon.Group>
                <FormCommon.Group label="Nombre Corto" htmlFor="shortName"><FormCommon.Input id="shortName" {...register('settings.general.shortName')} /></FormCommon.Group>
            </div>
            <FormCommon.Group label="Dirección" htmlFor="address" error={errors.address?.message}><FormCommon.Input id="address" {...register('address', { required: true })} /></FormCommon.Group>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormCommon.Group label="Sector" htmlFor="sector"><FormCommon.Input id="sector" {...register('settings.general.sector')} /></FormCommon.Group>
                 <FormCommon.Group label="Provincia" htmlFor="province">
                    <FormCommon.Select id="province" {...register('settings.general.province')}>
                         <option>Distrito Nacional</option>
                         <option>Santo Domingo</option>
                         {/* Add other provinces as needed */}
                    </FormCommon.Select>
                </FormCommon.Group>
                 <FormCommon.Group label="Teléfono" htmlFor="phone"><FormCommon.Input id="phone" {...register('settings.general.phone')} /></FormCommon.Group>
            </div>
             <FormCommon.Group label="RNC" htmlFor="rnc"><FormCommon.Input id="rnc" {...register('settings.general.rnc')} /></FormCommon.Group>
             <FormCommon.Group label="Comentario" htmlFor="comment"><FormCommon.Textarea id="comment" rows={2} {...register('settings.general.comment')} /></FormCommon.Group>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormCommon.Group label="Compañía Eléctrica" htmlFor="electricCompany.name"><FormCommon.Input id="electricCompany.name" {...register('settings.general.electricCompany.name')} /></FormCommon.Group>
                <FormCommon.Group label="Contrato" htmlFor="electricCompany.contractId"><FormCommon.Input id="electricCompany.contractId" {...register('settings.general.electricCompany.contractId')} /></FormCommon.Group>
                <div />
                <FormCommon.Group label="Compañía Agua" htmlFor="waterCompany.name"><FormCommon.Input id="waterCompany.name" {...register('settings.general.waterCompany.name')} /></FormCommon.Group>
                <FormCommon.Group label="Contrato" htmlFor="waterCompany.contractId"><FormCommon.Input id="waterCompany.contractId" {...register('settings.general.waterCompany.contractId')} /></FormCommon.Group>
                <div />
                <FormCommon.Group label="Compañía Basura" htmlFor="trashCompany.name"><FormCommon.Input id="trashCompany.name" {...register('settings.general.trashCompany.name')} /></FormCommon.Group>
                <FormCommon.Group label="Contrato" htmlFor="trashCompany.contractId"><FormCommon.Input id="trashCompany.contractId" {...register('settings.general.trashCompany.contractId')} /></FormCommon.Group>
                <div />
                 <FormCommon.Group label="Compañía Gas" htmlFor="gasCompany.name"><FormCommon.Input id="gasCompany.name" {...register('settings.general.gasCompany.name')} /></FormCommon.Group>
                <FormCommon.Group label="Contrato" htmlFor="gasCompany.contractId"><FormCommon.Input id="gasCompany.contractId" {...register('settings.general.gasCompany.contractId')} /></FormCommon.Group>
                <div />
                 <FormCommon.Group label="Compañía Gasoil" htmlFor="dieselCompany.name"><FormCommon.Input id="dieselCompany.name" {...register('settings.general.dieselCompany.name')} /></FormCommon.Group>
                <FormCommon.Group label="Contrato" htmlFor="dieselCompany.contractId"><FormCommon.Input id="dieselCompany.contractId" {...register('settings.general.dieselCompany.contractId')} /></FormCommon.Group>
                <div />
                 <FormCommon.Group label="Compañía Ascensor" htmlFor="elevatorCompany.name"><FormCommon.Input id="elevatorCompany.name" {...register('settings.general.elevatorCompany.name')} /></FormCommon.Group>
                <FormCommon.Group label="Contrato" htmlFor="elevatorCompany.contractId"><FormCommon.Input id="elevatorCompany.contractId" {...register('settings.general.elevatorCompany.contractId')} /></FormCommon.Group>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormCommon.Group label="¿Pozo de Agua?" htmlFor="hasWaterWell">
                    <FormCommon.Select id="hasWaterWell" {...register('settings.general.hasWaterWell', { setValueAs: parseBool })}>
                        <option value="true">SI</option><option value="false">NO</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                 <FormCommon.Group label="Fecha Bloqueo" htmlFor="lockoutDate"><FormCommon.Input type="date" id="lockoutDate" {...register('settings.general.lockoutDate')} /></FormCommon.Group>
                <FormCommon.Group label="Estado" htmlFor="status">
                     <FormCommon.Select id="status" {...register('settings.general.status')}>
                        <option>Activo</option><option>Inactivo</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>

            <FormSectionHeader title="INFORMACIÓN FISCAL" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormCommon.Group label="¿Condo Requiere NCF de Admin?" htmlFor="requiresAdminNcf">
                    <FormCommon.Select id="requiresAdminNcf" {...register('settings.fiscal.requiresAdminNcf', { setValueAs: parseBool })}><option value="false">NO</option><option value="true">SI</option></FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="¿Condo Emite NCF a Aptos?" htmlFor="emitsNcfToUnits">
                    <FormCommon.Select id="emitsNcfToUnits" {...register('settings.fiscal.emitsNcfToUnits', { setValueAs: parseBool })}><option value="false">NO</option><option value="true">SI</option></FormCommon.Select>
                </FormCommon.Group>
            </div>
            
            <FormSectionHeader title="INFORMACIÓN DEL GAS" />
              <FormCommon.Group label="¿Facturar Gas?" htmlFor="shouldBillGas">
                <FormCommon.Select id="shouldBillGas" {...register('settings.gas.shouldBillGas', { setValueAs: parseBool })}><option value="false">NO</option><option value="true">SI</option></FormCommon.Select>
            </FormCommon.Group>
            
            <FormSectionHeader title="INFORMACIÓN DE HONORARIOS" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormCommon.Group label="Tipo de Honorarios" htmlFor="honorariums.type">
                    <FormCommon.Select id="honorariums.type" {...register('settings.honorariums.type')}><option>MONTO FIJO</option><option>PORCENTAJE</option></FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Honorarios Fijos" htmlFor="honorariums.fixedAmount">
                    <FormCommon.Input type="number" step="0.01" id="honorariums.fixedAmount" {...register('settings.honorariums.fixedAmount', { valueAsNumber: true })} />
                </FormCommon.Group>
                 <FormCommon.Group label="Día Fact Honorarios" htmlFor="honorariums.billingDay">
                    <FormCommon.Select id="honorariums.billingDay" {...register('settings.honorariums.billingDay', { valueAsNumber: true })}>
                        {dayOptions.map(d => <option key={d} value={d}>Día {d}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>
              <FormCommon.Group label="Concepto Honorarios por Servicios de" htmlFor="honorariums.concept"><FormCommon.Textarea rows={3} id="honorariums.concept" {...register('settings.honorariums.concept')} /></FormCommon.Group>
            
            <FormSectionHeader title="GESTIÓN DE MORAS" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <FormCommon.Group label="¿Aplicar Moras?" htmlFor="lateFees.apply">
                    <FormCommon.Select {...register('settings.lateFees.apply', { setValueAs: parseBool })}>
                        <option value="true">SI</option>
                        <option value="false">NO</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Tipo de Mora" htmlFor="lateFees.type">
                    <FormCommon.Select {...register('settings.lateFees.type')}>
                        <option value="PERCENTAGE_ON_DEBT">Porcentaje sobre deuda</option>
                        <option value="FIXED_AMOUNT">Monto Fijo</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Valor (% o RD$)" htmlFor="lateFees.value">
                    <FormCommon.Input type="number" step="0.01" {...register('settings.lateFees.value', { valueAsNumber: true })} />
                </FormCommon.Group>
                <FormCommon.Group label="Días de Gracia" htmlFor="lateFees.gracePeriodDays">
                    <FormCommon.Input type="number" {...register('settings.lateFees.gracePeriodDays', { valueAsNumber: true })} />
                </FormCommon.Group>
            </div>
            <FormCommon.Group label="Concepto de Mora" htmlFor="lateFees.chargeConcept">
                <FormCommon.Input {...register('settings.lateFees.chargeConcept')} />
            </FormCommon.Group>

            <FormSectionHeader title="INFORMACIÓN DE LAS CUOTAS" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormCommon.Group label="Cuota del mes se genera" htmlFor="quotas.generationStrategy">
                    <FormCommon.Select id="quotas.generationStrategy" {...register('settings.quotas.generationStrategy')}>
                        <option value="SAME_MONTH">En el mismo mes -- (Ej: Marzo se factura en Marzo)</option>
                        <option value="PREVIOUS_MONTH">Un mes antes -- (Ej: Marzo se factura en Febrero)</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="¿Las cuotas vencen?" htmlFor="quotas.haveDueDate">
                     <FormCommon.Select id="quotas.haveDueDate" {...register('settings.quotas.haveDueDate', { setValueAs: parseBool })}><option value="false">NO</option><option value="true">SI</option></FormCommon.Select>
                </FormCommon.Group>
            </div>
            
             <FormSectionHeader title="INFORMACIÓN DE PAGOS" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Nombre del Beneficiario" htmlFor="payments.beneficiaryName">
                    <FormCommon.Input {...register('settings.payments.beneficiaryName')} />
                </FormCommon.Group>
                <FormCommon.Group label="Nombre del Banco" htmlFor="payments.bankName">
                    <FormCommon.Input {...register('settings.payments.bankName')} />
                </FormCommon.Group>
                <FormCommon.Group label="Número de Cuenta" htmlFor="payments.accountNumber">
                    <FormCommon.Input {...register('settings.payments.accountNumber')} />
                </FormCommon.Group>
                <FormCommon.Group label="Tipo de Cuenta" htmlFor="payments.accountType">
                    <FormCommon.Select {...register('settings.payments.accountType')}>
                        <option>Corriente</option>
                        <option>Ahorros</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>


            <FormSectionHeader title="INFORMACIÓN GENERAL DE ENVÍOS" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormCommon.Group label="Envío Automático" htmlFor="automaticSending"><FormCommon.Select {...register('settings.notifications.automaticSending', { setValueAs: parseBool })}><option value="true">SI</option><option value="false">NO</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="¿Correo Administración Propio?" htmlFor="useCustomAdminEmail"><FormCommon.Select {...register('settings.notifications.useCustomAdminEmail', { setValueAs: parseBool })}><option value="false">NO</option><option value="true">SI</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="Correos a nombre de" htmlFor="senderName"><FormCommon.Select {...register('settings.notifications.senderName')}><option>Administrador</option><option>Condominio</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="¿Ver Moras en Factura?" htmlFor="showLateFeesInInvoice"><FormCommon.Select {...register('settings.notifications.showLateFeesInInvoice', { setValueAs: parseBool })}><option value="true">SI</option><option value="false">NO</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="¿Ver Cuentas Pends. en Factura?" htmlFor="showPendingBalanceInInvoice"><FormCommon.Select {...register('settings.notifications.showPendingBalanceInInvoice', { setValueAs: parseBool })}><option value="true">SI</option><option value="false">NO</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="¿Enviar CxC en Autocorreos?" htmlFor="sendAccountStatusInAutoMail"><FormCommon.Select {...register('settings.notifications.sendAccountStatusInAutoMail', { setValueAs: parseBool })}><option value="true">SI</option><option value="false">NO</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="¿Copiar Correos al Admin?" htmlFor="copyAdminInMails"><FormCommon.Select {...register('settings.notifications.copyAdminInMails', { setValueAs: parseBool })}><option value="true">SI</option><option value="false">NO</option></FormCommon.Select></FormCommon.Group>
                <FormCommon.Group label="Correo de Copia Admin" htmlFor="adminCopyEmail"><FormCommon.Input {...register('settings.notifications.adminCopyEmail')} /></FormCommon.Group>
                <FormCommon.Group label="¿CxC en Notif. Mantenimiento?" htmlFor="includeAccountStatusInMaintNotif"><FormCommon.Select {...register('settings.notifications.includeAccountStatusInMaintNotif', { setValueAs: parseBool })}><option value="false">NO</option><option value="true">SI</option></FormCommon.Select></FormCommon.Group>
            </div>
            
            <FormSectionHeader title="INFORMACIÓN DE NÓMINAS" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormCommon.Group label="Día Autonómina Q1" htmlFor="payroll.q1Day">
                    <FormCommon.Select id="payroll.q1Day" {...register('settings.payroll.q1Day', { valueAsNumber: true })}>
                         {dayOptions.map(d => <option key={d} value={d}>Día {d}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
                 <FormCommon.Group label="Día Autonómina Q2" htmlFor="payroll.q2Day">
                    <FormCommon.Select id="payroll.q2Day" {...register('settings.payroll.q2Day', { valueAsNumber: true })}>
                         {dayOptions.map(d => <option key={d} value={d}>Día {d}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>
            
            <FormSectionHeader title="INFORMACIÓN DE RESERVACIONES" />
            <FormCommon.Group label="Días Previos Reservación" htmlFor="reservations.daysInAdvance">
                <FormCommon.Select id="reservations.daysInAdvance" {...register('settings.reservations.daysInAdvance', { valueAsNumber: true })}>
                    <option value="0">Sin límite</option>
                    {dayOptions.map(d => <option key={d} value={d}>{d} {d > 1 ? 'días' : 'día'}</option>)}
                </FormCommon.Select>
            </FormCommon.Group>

            <div className="flex justify-end gap-4 pt-8">
                {showCancelButton && <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>}
                <FormCommon.Button type="submit" isLoading={isLoading}>{submitButtonText}</FormCommon.Button>
            </div>
        </form>
    );
};