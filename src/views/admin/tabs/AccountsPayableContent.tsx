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
                <h2 className="text-2xl font-bold text-white">Cuentas por Pagar</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} />
                    <span>Registrar Cuenta</span>
                </button>
            </div>

            <div className="mb-4">
                <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg max-w-xs">
                    {['Pendiente', 'Pagada', 'Todos'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`w-full px-3 py-1 text-sm font-medium rounded-md ${filter === f ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Proveedor', 'Factura', 'Emisión', 'Vencimiento', 'Monto', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {filteredPayables.map(payable => (
                            <tr key={payable.id} className="hover:bg-neutral-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payable.supplier}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{payable.invoiceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(payable.issueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(payable.dueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">RD$ {payable.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={payable.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleOpenModal(payable)} className="text-blue-500 hover:text-blue-400">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredPayables.length === 0 && <p className="text-center text-neutral-400 py-8">No hay cuentas para mostrar.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPayable ? 'Editar Cuenta por Pagar' : 'Nueva Cuenta por Pagar'}>
                <AccountPayableForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingPayable || { status: 'Pendiente' }} />
            </Modal>
        </div>
    );
};