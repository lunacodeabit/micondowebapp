import React, { useState, useMemo } from 'react';
import type { Unit, Condo, PaymentNotification } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PaymentNotificationForm } from '../forms/PaymentNotificationForm';
import { formatDate } from '../../../utils/date';

type ResidentPaymentsProps = {
    resident: Unit;
    condo: Condo;
    onUpdateCondoData: (updatedCondo: Condo) => void;
};

// --- AIRBAG #1: Protección para la Tarjeta de Banco ---
// Si 'settings' viene vacío (undefined), usamos un objeto vacío {} para que no explote.
const BankInfoCard = ({ settings }: { settings: Condo['settings'] }) => {
    
    // Extraemos los datos con seguridad. Si no existen, ponemos strings vacíos o "N/A".
    // El operador ?. (Optional Chaining) es nuestro mejor amigo aquí.
    const beneficiary = settings?.payments?.beneficiaryName || 'No definido';
    const rnc = settings?.general?.rnc || 'N/A';
    const bankName = settings?.payments?.bankName || 'No definido';
    const accountNum = settings?.payments?.accountNumber || '---';
    const accountType = settings?.payments?.accountType || '';

    const info = [
        { label: 'Beneficiario', value: beneficiary, icon: 'user-round' },
        { label: 'RNC', value: rnc, icon: 'file-text' },
        { label: 'Banco', value: bankName, icon: 'landmark' },
        { label: 'No. Cuenta', value: accountNum, icon: 'hash' },
        { label: 'Tipo', value: accountType, icon: 'file-check-2' },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: show a notification
        });
    };

    return (
        <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-4">Información para Pagos</h3>
            <p className="text-neutral-400 text-sm mb-6">Utilice los siguientes datos para realizar sus pagos a través de transferencia bancaria. Luego, notifique su pago utilizando el botón de abajo.</p>
            <div className="space-y-3">
                {info.map(item => (
                    <div key={item.label} className="flex justify-between items-center bg-neutral-800/50 p-3 rounded-md">
                        <div className="flex items-center">
                            {/* Fix: Icon name type safety check could go here, keeping simple for now */}
                            <Icon name={item.icon as any} size={18} className="text-neutral-400 mr-3" />
                            <div>
                                <p className="text-xs text-neutral-500">{item.label}</p>
                                <p className="font-mono text-white">{item.value}</p>
                            </div>
                        </div>
                        <button onClick={() => copyToClipboard(item.value)} title={`Copiar ${item.label}`} className="p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
                            <Icon name="copy" size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const ResidentPayments = ({ resident, condo }: ResidentPaymentsProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const myNotifications = useMemo(() => {
        // --- AIRBAG #2: Protección para la Lista de Notificaciones ---
        // Forzamos a que sea un array. Si es undefined, usamos [].
        const notifications = (condo.paymentNotifications as unknown as any[]) || [];
        
        return notifications
            .filter((n: any) => n.unitId === resident.id)
            .sort((a: any, b: any) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
    }, [condo.paymentNotifications, resident.id]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                {/* Pasamos settings, si es undefined, el componente hijo ya sabe manejarlo */}
                <BankInfoCard settings={condo.settings} />
                <div className="bg-neutral-900 p-6 rounded-lg shadow-md text-center">
                     <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">
                        <Icon name="send" size={18} />
                        <span>Notificar un Pago</span>
                    </button>
                </div>
            </div>

            <div>
                <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Historial de Notificaciones</h3>
                    <div className="space-y-4">
                        {myNotifications.length > 0 ? myNotifications.map((notif: any) => (
                            <div key={notif.id} className="bg-neutral-800/50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">Monto: RD$ {notif.amount.toLocaleString()}</p>
                                    <p className="text-sm text-neutral-300">Fecha de Pago: {formatDate(notif.paymentDate)}</p>
                                    <p className="text-xs text-neutral-500">Reportado: {formatDate(notif.dateReported)}</p>
                                </div>
                                <StatusBadge status={notif.status} />
                            </div>
                        )) : (
                            <p className="text-neutral-400 text-center py-8">No ha enviado ninguna notificación de pago.</p>
                        )}
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Notificar Pago Realizado">
                <PaymentNotificationForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    resident={resident}
                />
            </Modal>
        </div>
    );
};