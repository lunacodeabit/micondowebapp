import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Unit, UnitType, FeeRecipient } from '../../../types';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';
import { getLocalDateString } from '../../../utils/date';

type UnitFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultValues?: Partial<Unit>;
};

const FormSectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-lg font-semibold text-center text-white bg-neutral-700 p-2 rounded-md my-4 col-span-full">
        {title}
    </h3>
);

const unitTypes: UnitType[] = ['Apartamento', 'Penthouse', 'Residencia', 'Local Comercial', 'Oficina', 'Solar'];
const feeRecipients: FeeRecipient[] = ['Propietario', 'Inquilino', 'Representante', 'Propietario y Inquilino', 'Inquilino y Representante', 'Propietario, Inquilino y Representante'];

export const UnitForm = ({ onSuccess, onCancel, defaultValues }: UnitFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Unit>({
        defaultValues: {
            status: 'Activo',
            unitType: 'Apartamento',
            requiresNcf: false,
            isOccupied: true,
            isAirbnb: false,
            isRented: false,
            isRepresented: false,
            notifyByEmail: true,
            showOwnerNameInDocs: true,
            feeDistribution: {
                maintenance: 'Propietario',
                gas: 'Propietario',
                charges: 'Propietario',
                lateFees: 'Propietario',
                accountStatement: 'Propietario',
            },
            isBoardMember: false,
            hasPaymentAgreement: false,
            isUnderLegalAction: false,
            monthlyFee: 0.00,
            ...defaultValues,
        }
    });

    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: Unit) => {
        if (!selectedCondo) return;
        setIsLoading(true);

        try {
            await new Promise(res => setTimeout(res, 700));

            let updatedUnits;
            if (defaultValues?.id) {
                updatedUnits = selectedCondo.units.map(u => u.id === defaultValues.id ? { ...u, ...data } : u);
            } else {
                updatedUnits = [
                    ...selectedCondo.units,
                    {
                        ...data,
                        id: Date.now().toString(), // In a real app, the backend would generate this.
                        accountHistory: [],
                        managementHistory: [],
                        registeredDate: data.registeredDate || getLocalDateString(),
                    }
                ];
            }
            updateCondo({ ...selectedCondo, units: updatedUnits });

            addToast(`Unidad ${defaultValues?.id ? 'actualizada' : 'creada'} con éxito.`, 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al guardar la unidad.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const parseBool = (v: string | boolean) => v === 'true' || v === true;

    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormCommon.Group label="No. Apto" htmlFor="apartmentNumber" required error={errors.apartmentNumber?.message}>
                    <FormCommon.Input id="apartmentNumber" {...register('apartmentNumber', { required: 'El No. de Apto es requerido' })} />
                </FormCommon.Group>
                <FormCommon.Group label="Tipo Unidad" htmlFor="unitType">
                    <FormCommon.Select id="unitType" {...register('unitType')}>
                        {unitTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="¿Requiere NCF?" htmlFor="requiresNcf">
                    <FormCommon.Select id="requiresNcf" {...register('requiresNcf', { setValueAs: parseBool })}>
                        <option value="false">No</option>
                        <option value="true">Si</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Propietario" htmlFor="ownerName" required error={errors.ownerName?.message}>
                    <FormCommon.Input id="ownerName" {...register('ownerName', { required: 'El nombre del propietario es requerido' })} />
                </FormCommon.Group>
                <FormCommon.Group label="Teléfonos" htmlFor="ownerPhones" required error={errors.ownerPhones?.message}>
                    <FormCommon.Input id="ownerPhones" {...register('ownerPhones', { required: 'El teléfono es requerido' })} />
                </FormCommon.Group>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Whatsapp" htmlFor="ownerWhatsapp"><FormCommon.Input id="ownerWhatsapp" {...register('ownerWhatsapp')} /></FormCommon.Group>
                <FormCommon.Group label="Email 1" htmlFor="ownerEmail1"><FormCommon.Input type="email" id="ownerEmail1" {...register('ownerEmail1')} /></FormCommon.Group>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Email 2" htmlFor="ownerEmail2"><FormCommon.Input type="email" id="ownerEmail2" {...register('ownerEmail2')} /></FormCommon.Group>
                <div />
            </div>

            <FormCommon.Group label="Comentario" htmlFor="comment"><FormCommon.Textarea id="comment" {...register('comment')} /></FormCommon.Group>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormCommon.Group label="¿Habitado?" htmlFor="isOccupied">
                    <FormCommon.Select id="isOccupied" {...register('isOccupied', { setValueAs: parseBool })}>
                        <option value="true">Si</option><option value="false">No</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="AirBnB?" htmlFor="isAirbnb">
                    <FormCommon.Select id="isAirbnb" {...register('isAirbnb', { setValueAs: parseBool })}>
                        <option value="false">No</option><option value="true">Si</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="¿Alquilado?" htmlFor="isRented">
                    <FormCommon.Select id="isRented" {...register('isRented', { setValueAs: parseBool })}>
                        <option value="false">No</option><option value="true">Si</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="¿Representado?" htmlFor="isRepresented">
                    <FormCommon.Select id="isRepresented" {...register('isRepresented', { setValueAs: parseBool })}>
                        <option value="false">No</option><option value="true">Si</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Cuota Mensual" htmlFor="monthlyFee" required error={errors.monthlyFee?.message}>
                    <FormCommon.Input type="number" step="0.01" id="monthlyFee" {...register('monthlyFee', { required: 'La cuota mensual es requerida', valueAsNumber: true })} />
                </FormCommon.Group>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormCommon.Group label="Notif. Cuotas Email" htmlFor="notifyByEmail">
                    <FormCommon.Select id="notifyByEmail" {...register('notifyByEmail', { setValueAs: parseBool })}>
                        <option value="true">SI</option><option value="false">NO</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Ver Nombre en Docs" htmlFor="showOwnerNameInDocs">
                    <FormCommon.Select id="showOwnerNameInDocs" {...register('showOwnerNameInDocs', { setValueAs: parseBool })}>
                        <option value="true">SI</option><option value="false">NO</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>

            <FormSectionHeader title="DISTRIBUCIÓN DE CUOTAS" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-center">
                <span>Mantenimiento</span>
                <FormCommon.Select {...register('feeDistribution.maintenance')}><option disabled>Seleccionar</option>{feeRecipients.map(r => <option key={r} value={r}>{r}</option>)}</FormCommon.Select>
                <div />
                <span>Gas</span>
                <FormCommon.Select {...register('feeDistribution.gas')}><option disabled>Seleccionar</option>{feeRecipients.map(r => <option key={r} value={r}>{r}</option>)}</FormCommon.Select>
                <div />
                <span>Cargos</span>
                <FormCommon.Select {...register('feeDistribution.charges')}><option disabled>Seleccionar</option>{feeRecipients.map(r => <option key={r} value={r}>{r}</option>)}</FormCommon.Select>
                <div />
                <span>Moras</span>
                <FormCommon.Select {...register('feeDistribution.lateFees')}><option disabled>Seleccionar</option>{feeRecipients.map(r => <option key={r} value={r}>{r}</option>)}</FormCommon.Select>
                <div />
                <span>Envío de CxC</span>
                <FormCommon.Select {...register('feeDistribution.accountStatement')}><option disabled>Seleccionar</option>{feeRecipients.map(r => <option key={r} value={r}>{r}</option>)}</FormCommon.Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormCommon.Group label="Miembro Junta Admin." htmlFor="isBoardMember">
                    <FormCommon.Select id="isBoardMember" {...register('isBoardMember', { setValueAs: parseBool })}>
                        <option value="false">NO</option><option value="true">SI</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Nombre Miembro JA" htmlFor="boardMemberName"><FormCommon.Input id="boardMemberName" {...register('boardMemberName')} /></FormCommon.Group>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormCommon.Group label="¿Acuerdo de Pago?" htmlFor="hasPaymentAgreement">
                    <FormCommon.Select id="hasPaymentAgreement" {...register('hasPaymentAgreement', { setValueAs: parseBool })}>
                        <option value="false">NO</option><option value="true">SI</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="¿Apto en Legal?" htmlFor="isUnderLegalAction">
                    <FormCommon.Select id="isUnderLegalAction" {...register('isUnderLegalAction', { setValueAs: parseBool })}>
                        <option value="false">NO</option><option value="true">SI</option>
                    </FormCommon.Select>
                </FormCommon.Group>
                <FormCommon.Group label="Estado" htmlFor="status">
                    <FormCommon.Select id="status" {...register('status')}>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </FormCommon.Select>
                </FormCommon.Group>
            </div>


            <div className="flex justify-end gap-4 pt-8">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Unidad</FormCommon.Button>
            </div>
        </form>
    );
};