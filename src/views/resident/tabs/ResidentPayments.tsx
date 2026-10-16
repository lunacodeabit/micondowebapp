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

// Tarjeta de Banco con soporte completo Light / Dark Mode
const BankInfoCard = ({ settings }: { settings: Condo['settings'] }) => {
    const beneficiary = settings?.payments?.beneficiaryName || 'Wise Services Dominicana SRL';
    const rnc = settings?.general?.rnc || '430314706';
    const bankName = settings?.payments?.bankName || 'Banco Popular Dominicano';
    const accountNum = settings?.payments?.accountNumber || '801234567';
    const accountType = settings?.payments?.accountType || 'Cuenta Corriente';

    const info = [
        { label: 'Beneficiario', value: beneficiary, icon: 'user-round' },
        { label: 'RNC', value: rnc, icon: 'file-text' },
        { label: 'Banco', value: bankName, icon: 'landmark' },
        { label: 'No. Cuenta', value: accountNum, icon: 'hash' },
        { label: 'Tipo de Cuenta', value: accountType, icon: 'file-check-2' },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-1">Información Bancaria</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-5">
                Utilice estos datos para realizar sus transferencias. Al completar el pago, adjunte su comprobante con el botón de abajo.
            </p>
            <div className="space-y-2.5">
                {info.map(item => (
                    <div key={item.label} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                <Icon name={item.icon as any} size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">{item.label}</p>
                                <p className="font-mono text-xs font-bold text-neutral-900 dark:text-white">{item.value}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => copyToClipboard(item.value)}
                            title={`Copiar ${item.label}`}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                        >
                            <Icon name="copy" size={14} />
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
        const notifications = (condo.paymentNotifications as unknown as any[]) || [];
        return notifications
            .filter((n: any) => n.unitId === resident.id)
            .sort((a: any, b: any) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
    }, [condo.paymentNotifications, resident.id]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <BankInfoCard settings={condo.settings} />
                <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">¿Ya realizó su transferencia o depósito bancario?</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm transition-all"
                    >
                        <Icon name="send" size={16} />
                        <span>Notificar Pago Realizado</span>
                    </button>
                </div>
            </div>

            <div>
                <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-neutral-900 dark:text-white">Historial de Notificaciones</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {myNotifications.length} reportes
                        </span>
                    </div>

                    <div className="space-y-3">
                        {myNotifications.length > 0 ? myNotifications.map((notif: any) => (
                            <div key={notif.id} className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700/50 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-neutral-900 dark:text-white text-sm">RD$ {notif.amount?.toLocaleString()}</p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">Fecha de Pago: {formatDate(notif.paymentDate)}</p>
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Reportado: {formatDate(notif.dateReported)}</p>
                                </div>
                                <StatusBadge status={notif.status} />
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                                    <Icon name="receipt" size={20} />
                                </div>
                                <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">No ha enviado ninguna notificación de pago aún.</p>
                            </div>
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