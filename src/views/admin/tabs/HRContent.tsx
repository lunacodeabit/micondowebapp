import React, { useState } from 'react';
import type { Employee, Payroll, Supplier, PayrollPayment, Transaction } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmployeeForm } from '../forms/EmployeeForm';
import { SupplierForm } from '../forms/SupplierForm';
import { PayrollForm } from '../forms/PayrollForm';
import { formatDate, getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

// Sub-components for each tab
const EmployeesTab = () => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleOpenModal = (employee: Employee | null = null) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingEmployee(null);
        setIsModalOpen(false);
    };
    
    if (!selectedCondo) return null;

    // --- AIRBAG ---
    const employees = (selectedCondo.employees as unknown as any[]) || [];

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} /><span>Añadir Empleado</span>
                </button>
            </div>
            <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Nombre', 'Cargo', 'Teléfono', 'Salario Mensual', 'Estado', 'Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {employees.map((e: any) => (
                            <tr key={e.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{e.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{e.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{e.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">RD$ {e.monthlySalary.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={e.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><button onClick={() => handleOpenModal(e)} className="text-blue-500 hover:text-blue-400">Editar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}>
                <EmployeeForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingEmployee || { status: 'Activo' }} />
            </Modal>
        </div>
    );
};

const PayrollsTab = () => {
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingPayroll, setViewingPayroll] = useState<Payroll | null>(null);

    // --- AIRBAG ---
    const payrolls = (selectedCondo?.payrolls as unknown as any[]) || [];

    const handleCloseAndPayPayroll = (payroll: Payroll) => {
        if (!selectedCondo || payroll.status !== 'Abierta') return;
        
        if (!window.confirm(`¿Está seguro que desea cerrar y pagar la nómina "${payroll.periodLabel}"? Esta acción registrará un egreso y no se puede deshacer.`)) {
            return;
        }

        // --- CORRECCIÓN: Forzamos lista y tipado explícito para reduce ---
        const paymentsSafe = (payroll.payments as unknown as any[]) || [];
        const totalPayrollAmount = paymentsSafe.reduce((acc: number, p: any) => acc + p.netPay, 0);

        const newExpense: Transaction = {
            id: Date.now(),
            date: getLocalDateString(),
            type: 'Egreso',
            description: `Pago Nómina - ${payroll.periodLabel}`,
            amount: totalPayrollAmount,
            category: 'Nómina',
            balance: 0,
        };

        const updatedPayrolls = payrolls.map((p: any) =>
            p.id === payroll.id ? { ...p, status: 'Cerrada' as 'Cerrada' } : p
        );

        const financesSafe = (selectedCondo.finances as unknown as any[]) || [];
        const updatedFinances = [...financesSafe, newExpense];

        updateCondo({ ...selectedCondo, payrolls: updatedPayrolls as any, finances: updatedFinances as any });
        addToast('Nómina cerrada y pagada con éxito.', 'success');
    };
    
    if (!selectedCondo) return null;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} /><span>Generar Nómina</span>
                </button>
            </div>
            <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                     <thead className="bg-neutral-800">
                        <tr>
                            {['Período', 'Tipo', 'Estado', 'Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                       {payrolls.map((p: any) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{p.periodLabel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{p.periodType}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-4">
                                    <button onClick={() => setViewingPayroll(p)} className="text-blue-500 hover:text-blue-400">Ver Detalles</button>
                                    {p.status === 'Abierta' && (
                                        <button 
                                            onClick={() => handleCloseAndPayPayroll(p)} 
                                            className="text-green-500 hover:text-green-400 font-semibold"
                                            title="Cerrar la nómina y registrar el egreso en finanzas"
                                        >
                                            Cerrar y Pagar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generar Nueva Nómina">
                <PayrollForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <Modal isOpen={!!viewingPayroll} onClose={() => setViewingPayroll(null)} title={`Detalles de Nómina - ${viewingPayroll?.periodLabel}`}>
                {viewingPayroll && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-2 text-left">Empleado</th>
                                    <th className="px-4 py-2 text-right">Sueldo Bruto</th>
                                    <th className="px-4 py-2 text-right">Total Deducciones</th>
                                    <th className="px-4 py-2 text-right">Neto a Pagar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700">
                                {/* --- CORRECCIÓN: Forzamos lista y tipado de reduce --- */}
                                {((viewingPayroll.payments as unknown as any[]) || []).map((p: any) => (
                                    <tr key={p.employeeId}>
                                        <td className="px-4 py-2 text-white">{p.employeeName}</td>
                                        <td className="px-4 py-2 text-right text-neutral-300">{((p.incomeDetails as unknown as any[]) || []).reduce((a: number, c: any) => a + c.amount, 0).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right text-neutral-300">{((p.deductionDetails as unknown as any[]) || []).reduce((a: number, c: any) => a + c.amount, 0).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right text-white font-bold">{p.netPay.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const SuppliersTab = () => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const handleOpenModal = (supplier: Supplier | null = null) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSupplier(null);
        setIsModalOpen(false);
    };

    if (!selectedCondo) return null;

    // --- AIRBAG ---
    const suppliers = (selectedCondo.suppliers as unknown as any[]) || [];

    return (
        <div>
            <div className="flex justify-end mb-4">
                 <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} /><span>Añadir Proveedor</span>
                </button>
            </div>
             <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Nombre', 'Servicio', 'Contacto', 'Teléfono', 'Proveedor Desde', 'Estado', 'Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                       {suppliers.map((s: any) => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{s.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{s.serviceType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{s.contactName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{s.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(s.supplierSince)}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-400">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
                <SupplierForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingSupplier || { status: 'Activo' }} />
            </Modal>
        </div>
    );
};

// Main component
export const HRContent = () => {
    const [activeSubTab, setActiveSubTab] = useState('employees');

    const renderSubContent = () => {
        switch (activeSubTab) {
            case 'employees': return <EmployeesTab />;
            case 'payrolls': return <PayrollsTab />;
            case 'suppliers': return <SuppliersTab />;
            default: return null;
        }
    };
    
    const tabs = [
        { id: 'employees', label: 'Empleados' },
        { id: 'payrolls', label: 'Nóminas' },
        { id: 'suppliers', label: 'Proveedores' }
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recursos Humanos</h2>
            <div className="border-b border-neutral-800 mb-6">
                 <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                            className={`${activeSubTab === tab.id
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'}
                             whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            {renderSubContent()}
        </div>
    );
};