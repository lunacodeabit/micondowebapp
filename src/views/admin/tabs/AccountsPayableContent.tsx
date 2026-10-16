import React, { useState, useEffect } from 'react';
import type { Condo, AccountPayable } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { AccountPayableForm } from '../forms/AccountPayableForm';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';

type AccountsPayableContentProps = {
    initialAction: string | null;
    clearInitialAction: () => void;
};

export const AccountsPayableContent = ({ initialAction, clearInitialAction }: AccountsPayableContentProps) => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);
    const [filter, setFilter] = useState('Pendiente');
    
    useEffect(() => {
        if (initialAction === 'add') {
            handleOpenModal();
            clearInitialAction();
        }
    }, [initialAction, clearInitialAction]);


    const handleOpenModal = (payable: AccountPayable | null = null) => {
        setEditingPayable(payable);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingPayable(null);
        setIsModalOpen(false);
    };

    if (!selectedCondo) return <div>Cargando...</div>;

    const filteredPayables = selectedCondo.accountsPayable.filter(p => filter === 'Todos' || p.status === filter);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Cuentas por Pagar</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-xs">
                    <Icon name="plus" size={18} />
                    <span>Registrar Cuenta</span>
                </button>
            </div>

            <div className="mb-4">
                <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg max-w-xs border border-neutral-200/80 dark:border-neutral-700/60">
                    {['Pendiente', 'Pagada', 'Todos'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`w-full px-3 py-1 text-xs font-semibold rounded-md transition-all ${filter === f ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800">
                        <tr>
                            {['Proveedor', 'Factura', 'Emisión', 'Vencimiento', 'Monto', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
                        {filteredPayables.map(payable => (
                            <tr key={payable.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-white">{payable.supplier}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">{payable.invoiceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(payable.issueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(payable.dueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 dark:text-white">RD$ {payable.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={payable.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                    <button onClick={() => handleOpenModal(payable)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredPayables.length === 0 && <p className="text-center text-neutral-400 dark:text-neutral-500 py-8 text-sm">No hay cuentas para mostrar.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPayable ? 'Editar Cuenta por Pagar' : 'Nueva Cuenta por Pagar'}>
                <AccountPayableForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingPayable || { status: 'Pendiente' }} />
            </Modal>
        </div>
    );
};