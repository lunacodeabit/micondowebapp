import React, { useState, useMemo } from 'react';
import type { Unit, AccountHistoryItem } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { UnitForm } from '../forms/UnitForm';
import { generateInvoicePDF, generateAccountStatementPDF } from '../../../utils/pdf';
import { formatDate, getLocalDateString } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

const UnitAccountHistory = ({ unit }: { unit: Unit }) => {
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();

    // --- AIRBAG: Historial ---
    const history = (unit.accountHistory as unknown as any[]) || [];
    const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);

    const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number | string>('');
    const [paymentDescription, setPaymentDescription] = useState('Pago cuota');

    const handleAddPaymentClick = () => {
        setPaymentAmount(balance > 0 ? balance : '');
        setIsPaymentFormVisible(true);
    };

    const handleSavePayment = () => {
        if (!selectedCondo) return;
        if (Number(paymentAmount) > 0) {
            // --- CORRECCIÓN 1: FORZAR LISTA DE UNIDADES ---
            const unitsSafe = (selectedCondo.units as unknown as any[]) || [];

            const updatedUnits = unitsSafe.map((u: any) => {
                if (u.id === unit.id) {
                    const newHistoryItem: AccountHistoryItem = {
                        id: Date.now().toString(),
                        date: new Date().toISOString(),
                        type: 'Abono',
                        description: paymentDescription,
                        amount: Number(paymentAmount)
                    };
                    return { ...u, accountHistory: [...((u.accountHistory as unknown as any[]) || []), newHistoryItem] as any };
                }
                return u;
            });

            // Forzamos el guardado ignorando el tipo erroneo de Condo
            updateCondo({ ...selectedCondo, units: updatedUnits as any });

            setIsPaymentFormVisible(false);
            setPaymentAmount('');
            setPaymentDescription('Pago cuota');
            addToast('Pago registrado con éxito.', 'success');
        }
    };

    return (
        <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Historial de Cuenta</h4>
            <table className="min-w-full text-sm">
                <thead>
                    <tr>
                        <th className="text-left py-2 px-3">Fecha</th>
                        <th className="text-left py-2 px-3">Descripción</th>
                        <th className="text-right py-2 px-3">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item: any) => (
                        <tr key={item.id}>
                            <td className="py-1 px-3">{formatDate(item.date)}</td>
                            <td className="py-1 px-3">{item.description}</td>
                            <td className={`py-1 px-3 text-right ${item.type === 'Cargo' ? 'text-red-400' : 'text-green-400'}`}>
                                {item.type === 'Cargo' ? '+' : '-'}RD$ {item.amount.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={2} className="text-right font-bold pt-2 px-3">Balance:</td>
                        <td className="text-right font-bold pt-2 px-3">RD$ {balance.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            {isPaymentFormVisible ? (
                <div className="mt-4 pt-4 border-t border-neutral-700 space-y-2">
                    <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value))} placeholder="Monto" className="w-full bg-neutral-700 p-2 rounded" />
                    <input type="text" value={paymentDescription} onChange={e => setPaymentDescription(e.target.value)} placeholder="Descripción" className="w-full bg-neutral-700 p-2 rounded" />
                    <div className="flex gap-2">
                        <button onClick={handleSavePayment} className="bg-blue-600 px-3 py-1 rounded">Guardar Pago</button>
                        <button onClick={() => setIsPaymentFormVisible(false)} className="bg-neutral-600 px-3 py-1 rounded">Cancelar</button>
                    </div>
                </div>
            ) : (
                <button onClick={handleAddPaymentClick} className="mt-4 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md">
                    Registrar Pago
                </button>
            )}
        </div>
    );
};


export const UnitsContent = () => {
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statementUnit, setStatementUnit] = useState<Unit | null>(null);
    const [statementDates, setStatementDates] = useState({ start: getLocalDateString(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()), end: getLocalDateString() });


    const handleOpenModal = (unit: Unit | null = null) => {
        setEditingUnit(unit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUnit(null);
        setIsModalOpen(false);
    };

    const handleGenerateStatement = (unit: Unit) => {
        setStatementUnit(unit);
        setIsStatementModalOpen(true);
    };

    const handleGenerateMonthlyFees = () => {
        if (!selectedCondo) return;
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const monthName = today.toLocaleString('es-ES', { month: 'long' });

        let unitsCharged = 0;

        // --- CORRECCIÓN 2: FORZAR LISTA ---
        const unitsSafe = (selectedCondo.units as unknown as any[]) || [];

        const updatedUnits = unitsSafe.map((unit: any) => {
            if (unit.status === 'Activo') {
                const history = (unit.accountHistory as unknown as any[]) || [];
                const alreadyCharged = history.some((item: any) =>
                    item.type === 'Cargo' &&
                    item.description.toLowerCase().includes(monthName.toLowerCase()) &&
                    item.description.includes(String(year))
                );

                if (!alreadyCharged) {
                    unitsCharged++;
                    const newCharge: AccountHistoryItem = {
                        id: (Date.now() + unitsCharged).toString(),
                        date: new Date(year, month, 1).toISOString(),
                        type: 'Cargo',
                        description: `Cuota Mantenimiento ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
                        amount: unit.monthlyFee,
                    };
                    return { ...unit, accountHistory: [...history, newCharge] as any };
                }
            }
            return unit;
        });

        if (unitsCharged > 0) {
            updateCondo({ ...selectedCondo, units: updatedUnits as any });
            addToast(`Se han generado cargos de mantenimiento para ${unitsCharged} unidades.`, 'success');
        } else {
            addToast('Todas las unidades activas ya tienen el cargo para el mes actual.', 'info');
        }
    };

    const handleApplyLateFees = () => {
        if (!selectedCondo) return;
        // Check safe access
        const lateFees = selectedCondo.settings?.lateFees;
        if (!lateFees || !lateFees.apply) {
            addToast("La aplicación de moras no está activada en la configuración.", 'info');
            return;
        }

        const { gracePeriodDays, type, value, chargeConcept } = lateFees;

        const today = new Date();
        const currentDay = today.getDate();

        if (currentDay <= gracePeriodDays) {
            addToast(`Las moras solo se aplican después del día ${gracePeriodDays} del mes.`, 'info');
            return;
        }

        if (!window.confirm("Esto aplicará cargos por mora a todas las unidades con balance vencido del mes anterior. ¿Desea continuar?")) {
            return;
        }

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const endOfPrevMonth = new Date(currentYear, currentMonth, 0);
        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthName = prevMonthDate.toLocaleString('es-ES', { month: 'long' });
        const prevMonthYear = prevMonthDate.getFullYear();

        let unitsCharged = 0;

        // --- CORRECCIÓN 3: FORZAR LISTA ---
        const unitsSafe = (selectedCondo.units as unknown as any[]) || [];

        const activeUnits = unitsSafe.filter((u: any) => u.status === 'Activo');

        const updatedUnits = activeUnits.map((unit: any) => {
            const history = (unit.accountHistory as unknown as any[]) || [];
            const expectedChargeDescription = `${chargeConcept} ${prevMonthName.charAt(0).toUpperCase() + prevMonthName.slice(1)} ${prevMonthYear}`;
            const alreadyCharged = history.some((item: any) => item.description === expectedChargeDescription);

            if (alreadyCharged) {
                return unit;
            }

            const debtBalance = history
                .filter((item: any) => new Date(item.date) <= endOfPrevMonth)
                .reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);

            if (debtBalance > 0) {
                let feeAmount = 0;
                if (type === 'FIXED_AMOUNT') {
                    feeAmount = value;
                } else if (type === 'PERCENTAGE_ON_DEBT') {
                    feeAmount = (debtBalance * value) / 100;
                }

                if (feeAmount > 0) {
                    unitsCharged++;
                    const newCharge: AccountHistoryItem = {
                        id: (Date.now() + unitsCharged).toString(),
                        date: getLocalDateString(),
                        type: 'Cargo',
                        description: expectedChargeDescription,
                        amount: parseFloat(feeAmount.toFixed(2)),
                    };
                    return { ...unit, accountHistory: [...history, newCharge] as any };
                }
            }
            return unit;
        });

        const finalUnits = unitsSafe.map((u: any) => updatedUnits.find((uu: any) => uu.id === u.id) || u);

        if (unitsCharged > 0) {
            updateCondo({ ...selectedCondo, units: finalUnits as any });
            addToast(`Proceso completado. Se aplicaron moras a ${unitsCharged} unidades.`, 'success');
        } else {
            addToast("No se aplicaron nuevas moras.", 'info');
        }
    };

    const filteredUnits = useMemo(() => {
        if (!selectedCondo) return [];

        // --- CORRECCIÓN 4: FORZAR LISTA EN MEMO ---
        const unitsSafe = (selectedCondo.units as unknown as any[]) || [];

        return unitsSafe.filter((unit: any) =>
            unit.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a: any, b: any) => a.apartmentNumber.localeCompare(b.apartmentNumber));
    }, [selectedCondo, searchTerm]);

    if (!selectedCondo) return <div>Cargando...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white">Unidades y Propietarios</h2>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar unidad o propietario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        {selectedCondo.settings?.lateFees?.apply && (
                            <button onClick={handleApplyLateFees} title="Aplicar cargos por mora a unidades con balance vencido" className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                                <Icon name="percent-circle" size={18} />
                                <span>Aplicar Moras</span>
                            </button>
                        )}
                        <button onClick={handleGenerateMonthlyFees} title="Generar cargos de mantenimiento para el mes actual a todas las unidades activas" className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                            <Icon name="file-plus-2" size={18} />
                            <span>Generar Cargos</span>
                        </button>
                        <button onClick={() => handleOpenModal()} className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            <Icon name="plus" size={18} />
                            <span>Añadir Unidad</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Apto', 'Propietario', 'Cuota Mensual', 'Balance', 'Miembro Desde', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {filteredUnits.map((unit: any) => {
                            const history = (unit.accountHistory as unknown as any[]) || [];
                            const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);
                            return (
                                <React.Fragment key={unit.id}>
                                    <tr className="hover:bg-neutral-800/50 group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{unit.apartmentNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{unit.ownerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">RD$ {unit.monthlyFee.toLocaleString()}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            RD$ {balance.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(unit.registeredDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={unit.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                                            <button onClick={() => handleOpenModal(unit)} className="text-blue-500 hover:text-blue-400">Editar</button>
                                            <button onClick={() => generateInvoicePDF(unit, selectedCondo)} className="text-green-500 hover:text-green-400">Aviso</button>
                                            <button onClick={() => handleGenerateStatement(unit)} className="text-yellow-500 hover:text-yellow-400">Estado</button>
                                        </td>
                                    </tr>
                                    <tr className="hidden group-hover:table-row bg-neutral-800">
                                        <td colSpan={7} className="p-0">
                                            <UnitAccountHistory unit={unit} />
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredUnits.map((unit: any) => {
                    const history = (unit.accountHistory as unknown as any[]) || [];
                    const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);
                    return (
                        <div key={unit.id} className="bg-neutral-900 rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{unit.apartmentNumber}</h3>
                                    <p className="text-sm text-neutral-300">{unit.ownerName}</p>
                                </div>
                                <StatusBadge status={unit.status} />
                            </div>
                            <div className="text-sm space-y-1 mb-4 border-b border-neutral-800 pb-3">
                                <p className="text-neutral-400">Cuota: <span className="text-neutral-200 font-medium">RD$ {unit.monthlyFee.toLocaleString()}</span></p>
                                <p className="text-neutral-400">Balance: <span className={`font-bold ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>RD$ {balance.toLocaleString()}</span></p>
                            </div>
                            <div className="flex justify-start items-center gap-4">
                                <button onClick={() => handleOpenModal(unit)} className="text-blue-500 hover:text-blue-400 text-sm font-semibold">Editar</button>
                                <button onClick={() => generateInvoicePDF(unit, selectedCondo)} className="text-green-500 hover:text-green-400 text-sm font-semibold">Aviso</button>
                                <button onClick={() => handleGenerateStatement(unit)} className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold">Estado</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUnit ? 'Editar Unidad' : 'Agregando Unidad'} size="4xl">
                <UnitForm onSuccess={handleCloseModal} onCancel={handleCloseModal} defaultValues={editingUnit || undefined} />
            </Modal>
            <Modal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} title={`Generar Estado de Cuenta para ${statementUnit?.apartmentNumber}`}>
                {statementUnit && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm">Fecha de Inicio</label>
                                <input type="date" id="startDate" value={statementDates.start} onChange={e => setStatementDates(prev => ({ ...prev, start: e.target.value }))} className="w-full bg-neutral-800 p-2 rounded mt-1" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm">Fecha de Fin</label>
                                <input type="date" id="endDate" value={statementDates.end} onChange={e => setStatementDates(prev => ({ ...prev, end: e.target.value }))} className="w-full bg-neutral-800 p-2 rounded mt-1" />
                            </div>
                        </div>
                        <button
                            onClick={() => generateAccountStatementPDF(statementUnit, selectedCondo, statementDates.start, statementDates.end)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Generar PDF
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};