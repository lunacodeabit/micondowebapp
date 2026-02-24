import React, { useState, useMemo, useEffect } from 'react';
import type { Condo, Transaction, AccountHistoryItem, Unit, ExtraordinaryFee, PaymentNotification } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { TransactionForm } from '../forms/TransactionForm';
import { ExtraordinaryFeeForm } from '../forms/ExtraordinaryFeeForm';
import { formatDate } from '../../../utils/date';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';


type FinanceContentProps = {
    initialAction: string | null;
    clearInitialAction: () => void;
};

const TransactionsTab = ({ initialAction, clearInitialAction }: Omit<FinanceContentProps, 'condo' | 'onUpdateCondoData'>) => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        if (initialAction === 'add') {
            handleOpenModal();
            clearInitialAction();
        }
    }, [initialAction, clearInitialAction]);

    const handleOpenModal = (tx: Transaction | null = null) => {
        setEditingTx(tx);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTx(null);
        setIsModalOpen(false);
    };

    const filteredTransactions = useMemo(() => {
        if (!selectedCondo) return [];
        const finances = (selectedCondo.finances as unknown as any[]) || [];
        let transactions = [...finances];

        if (filter !== 'all') {
            transactions = transactions.filter((tx: any) => tx.type === filter);
        }
        if (dateRange.start) {
            transactions = transactions.filter((tx: any) => tx.date >= dateRange.start);
        }
        if (dateRange.end) {
            transactions = transactions.filter((tx: any) => tx.date <= dateRange.end);
        }
        return transactions.slice().reverse();
    }, [selectedCondo, filter, dateRange]);

    if (!selectedCondo) return null;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} />
                    <span>Nueva Transacción</span>
                </button>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-y-4 gap-x-6 mb-4 p-4 bg-neutral-900 rounded-lg">
                <div className="flex items-center flex-wrap gap-4">
                    <span className="font-semibold text-sm flex-shrink-0">Filtrar por Tipo:</span>
                    <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg">
                        <button onClick={() => setFilter('all')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}>Todos</button>
                        <button onClick={() => setFilter('Ingreso')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${filter === 'Ingreso' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}>Ingresos</button>
                        <button onClick={() => setFilter('Egreso')} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${filter === 'Egreso' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}>Egresos</button>
                    </div>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                    <label htmlFor="startDate" className="text-sm font-semibold flex-shrink-0">Fechas:</label>
                    <input type="date" id="startDate" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-white text-sm" />
                    <span className="text-neutral-500">a</span>
                    <input type="date" id="endDate" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-white text-sm" />
                    <button onClick={() => setDateRange({ start: '', end: '' })} title="Limpiar filtro de fechas" className="flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-white font-semibold p-2 rounded-lg text-sm">
                        <Icon name="x" size={16} />
                    </button>
                </div>
            </div>

            <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Fecha', 'Descripción', 'Categoría', 'Monto', 'Balance', 'Acciones'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {filteredTransactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-neutral-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(tx.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{tx.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">{tx.category || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.type === 'Ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'Ingreso' ? '+' : '-'} RD$ {Math.abs(tx.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">RD$ {tx.balance.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleOpenModal(tx)} className="text-blue-500 hover:text-blue-400">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && <p className="text-center text-neutral-400 py-8">No hay transacciones para mostrar.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTx ? 'Editar Transacción' : 'Nueva Transacción'}>
                <TransactionForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingTx || { type: 'Ingreso' }} />
            </Modal>
        </div>
    );
};

const ExtraordinaryFeesTab = () => {
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<ExtraordinaryFee | null>(null);

    const feesSafe = (selectedCondo?.extraordinaryFees as unknown as any[]) || [];

    const handleApplyFee = (fee: ExtraordinaryFee) => {
        if (!selectedCondo) return;
        if (fee.status === 'Aplicada' || !window.confirm(`¿Está seguro de que desea aplicar la cuota "${fee.title}" a todas las unidades activas? Esta acción no se puede deshacer.`)) {
            return;
        }

        // --- CORRECCIÓN CRÍTICA: Forzamos unidades a lista ---
        const unitsSafe = (selectedCondo.units as unknown as any[]) || [];
        const activeUnits = unitsSafe.filter((u: any) => u.status === 'Activo');

        if (activeUnits.length === 0) {
            addToast('No hay unidades activas para aplicar la cuota.', 'info');
            return;
        }

        const amountPerUnit = fee.totalAmount / activeUnits.length;
        const updatedUnits = unitsSafe.map((unit: any) => {
            if (unit.status === 'Activo') {
                const newCharge: AccountHistoryItem = {
                    id: `${Date.now()}-${unit.id}`,
                    date: fee.issueDate,
                    type: 'Cargo',
                    description: fee.title,
                    amount: amountPerUnit,
                };
                return { ...unit, accountHistory: [...((unit.accountHistory as unknown as any[]) || []), newCharge] as any };
            }
            return unit;
        });

        const updatedFees = feesSafe.map((f: any) => f.id === fee.id ? { ...f, status: 'Aplicada' as 'Aplicada' } : f);

        updateCondo({ ...selectedCondo, units: updatedUnits as any, extraordinaryFees: updatedFees as any });
        addToast(`Cuota aplicada a ${activeUnits.length} unidades.`, 'success');
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingFee(null);
    };

    if (!selectedCondo) return null;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setEditingFee(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} />
                    <span>Crear Cuota Extraordinaria</span>
                </button>
            </div>
            <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Título', 'Monto Total', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {feesSafe.map((fee: any) => (
                            <tr key={fee.id} className="hover:bg-neutral-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{fee.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">RD$ {fee.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(fee.issueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(fee.dueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={fee.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    {fee.status === 'Pendiente' && (
                                        <>
                                            <button onClick={() => { setEditingFee(fee); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-400">
                                                Editar
                                            </button>
                                            <button onClick={() => handleApplyFee(fee)} className="text-green-500 hover:text-green-400">
                                                Aplicar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {feesSafe.length === 0 && <p className="text-center text-neutral-400 py-8">No hay cuotas extraordinarias creadas.</p>}
            </div>
            <Modal isOpen={isModalOpen} onClose={handleSuccess} title={editingFee ? 'Editar Cuota Extraordinaria' : 'Nueva Cuota Extraordinaria'}>
                <ExtraordinaryFeeForm onSuccess={handleSuccess} onCancel={handleSuccess} defaultValues={editingFee || {}} />
            </Modal>
        </div>
    );
};

const PaymentNotificationsTab = () => {
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<PaymentNotification | null>(null);

    const notificationsSafe = (selectedCondo?.paymentNotifications as unknown as any[]) || [];

    const handleConfirmPayment = (notification: PaymentNotification) => {
        if (!selectedCondo) return;

        const unitsSafe = (selectedCondo.units as unknown as any[]) || [];
        const unit = unitsSafe.find((u: any) => u.id === notification.unitId);
        if (!unit) {
            addToast(`No se encontró la unidad para la notificación.`, 'error');
            return;
        }

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            date: notification.paymentDate,
            type: 'Ingreso',
            description: `Pago reportado por Residente - ${unit.ownerName} (Apto ${unit.apartmentNumber})`,
            amount: notification.amount,
            category: 'Pago de Cuota',
            balance: 0,
        };

        const newAccountHistoryItem: AccountHistoryItem = {
            id: (Date.now() + 1).toString(),
            date: notification.paymentDate,
            type: 'Abono',
            description: notification.notes || 'Pago reportado por residente',
            amount: notification.amount,
        };

        const updatedNotifications = notificationsSafe.map((n: any) =>
            n.id === notification.id ? { ...n, status: 'Verificado' as 'Verificado' } : n
        );

        const financesSafe = (selectedCondo.finances as unknown as any[]) || [];
        const updatedCondoData = { ...selectedCondo };

        updatedCondoData.finances = [...financesSafe, newTransaction] as any;
        updatedCondoData.units = unitsSafe.map((u: any) =>
            u.id === unit.id ? { ...u, accountHistory: [...((u.accountHistory as unknown as any[]) || []), newAccountHistoryItem] as any } : u
        ) as any;
        updatedCondoData.paymentNotifications = updatedNotifications as any;

        updateCondo(updatedCondoData);
        addToast('Pago confirmado y registrado con éxito.', 'success');
    };

    const handleRejectPayment = (notificationId: string) => {
        if (!selectedCondo) return;
        const updatedNotifications = notificationsSafe.map((n: any) =>
            n.id === notificationId ? { ...n, status: 'Rechazado' as 'Rechazado' } : n
        );
        updateCondo({ ...selectedCondo, paymentNotifications: updatedNotifications as any });
        addToast('Notificación de pago rechazada.', 'info');
    };

    if (!selectedCondo) return null;

    const pendingNotifications = notificationsSafe.filter((n: any) => n.status === 'Pendiente').sort((a: any, b: any) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

    return (
        <div>
            {pendingNotifications.length === 0 ? (
                <div className="text-center py-10 px-6 bg-neutral-900 rounded-lg">
                    <Icon name="check-circle-2" className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">Bandeja de entrada limpia</h3>
                    <p className="mt-1 text-sm text-neutral-400">No hay nuevas notificaciones de pago pendientes de revisión.</p>
                </div>
            ) : (
                <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-neutral-800">
                            <tr>
                                {['Unidad', 'Propietario', 'Fecha Pago', 'Monto', 'Estado', 'Acciones'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {pendingNotifications.map((notif: any) => {
                                const unit = ((selectedCondo.units as unknown as any[]) || []).find((u: any) => u.id === notif.unitId);
                                return (
                                    <tr key={notif.id} className="hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{unit?.apartmentNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{unit?.ownerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(notif.paymentDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">RD$ {notif.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={notif.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                            <button onClick={() => setViewingNotification(notif)} className="text-blue-500 hover:text-blue-400">
                                                Ver Comprobante
                                            </button>
                                            <button onClick={() => handleConfirmPayment(notif)} className="text-green-500 hover:text-green-400">
                                                Confirmar
                                            </button>
                                            <button onClick={() => handleRejectPayment(notif.id)} className="text-red-500 hover:text-red-400">
                                                Rechazar
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={!!viewingNotification} onClose={() => setViewingNotification(null)} title="Detalle de Notificación de Pago" size="3xl">
                {viewingNotification && (
                    <div>
                        <img src={viewingNotification.proofUrl} alt="Comprobante de pago" className="w-full max-w-full h-auto rounded-lg mx-auto" />
                        <div className="mt-4 text-center">
                            <a
                                href={viewingNotification.proofUrl}
                                download={viewingNotification.proofFileName || 'comprobante.png'}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                <Icon name="download" size={18} />
                                <span>Descargar Comprobante</span>
                            </a>
                        </div>
                        {viewingNotification.notes && (
                            <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                                <h4 className="font-semibold text-white">Notas del Residente:</h4>
                                <p className="text-neutral-300">{viewingNotification.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export const FinanceContent = (props: FinanceContentProps) => {
    const { selectedCondo } = useCondo();
    const [activeSubTab, setActiveSubTab] = useState('transactions');

    if (!selectedCondo) return <div>Cargando...</div>;

    const finances = (selectedCondo.finances as unknown as any[]) || [];
    const currentBalance = finances.length > 0 ? finances[finances.length - 1].balance : (selectedCondo.manualBalance || 0);
    const pendingNotificationsCount = ((selectedCondo.paymentNotifications as unknown as any[]) || []).filter((n: any) => n.status === 'Pendiente').length;

    const tabs = [
        { id: 'transactions', label: 'Transacciones' },
        { id: 'extraordinaryFees', label: 'Cuotas Extraordinarias' },
        { id: 'paymentNotifications', label: 'Notificaciones de Pago', count: pendingNotificationsCount }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Finanzas</h2>
                    <p className="text-neutral-400">Balance Actual: <span className="font-bold text-green-400">RD$ {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                </div>
            </div>
            <div className="border-b border-neutral-800 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                            className={`${activeSubTab === tab.id
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'}
                             whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}>
                            {tab.label}
                            {/* --- CORRECCIÓN: Verificar que count exista y sea mayor a 0 --- */}
                            {(tab.count !== undefined && tab.count > 0) && (
                                <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {activeSubTab === 'transactions' && <TransactionsTab {...props} />}
            {activeSubTab === 'extraordinaryFees' && <ExtraordinaryFeesTab />}
            {activeSubTab === 'paymentNotifications' && <PaymentNotificationsTab />}
        </div>
    );
};