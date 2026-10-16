import React from 'react';
import type { Unit } from '../../../types';
import { formatDate } from '../../../utils/date';
import { Icon } from '../../../components/ui/Icon';

type ResidentAccountProps = {
    resident: Unit;
};

export const ResidentAccount = ({ resident }: ResidentAccountProps) => {
    const history = (resident.accountHistory as unknown as any[]) || [];
    const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);
    const sortedHistory = [...history].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Estado de Cuenta</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Historial cronológico de cargos de mantenimiento, cuotas y abonos aplicados a su unidad ({resident.apartmentNumber}).
                </p>
            </div>

            {/* Balance Card */}
            <div className="bg-white dark:bg-[#161b26] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Balance Pendiente</span>
                    <p className={`text-3xl font-black mt-1 ${balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        RD$ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                        {balance > 0 ? 'Monto adeudado al condominio' : 'Su cuenta se encuentra al día'}
                    </p>
                </div>
                <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${balance > 0 ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/60 text-rose-700 dark:text-rose-300' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'}`}>
                    <Icon name={balance > 0 ? 'alert-triangle' : 'check-circle-2'} size={20} />
                    <span className="text-xs font-bold">
                        {balance > 0 ? 'Pago Pendiente' : 'Al Día'}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#161b26] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Movimientos Registrados</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Concepto</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cargo</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Abono</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
                            {sortedHistory.length > 0 ? sortedHistory.map((item: any) => (
                                <tr key={item.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400 font-mono">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4 text-sm text-neutral-800 dark:text-neutral-200 font-medium">{item.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-rose-600 dark:text-rose-400 font-bold">
                                        {item.type === 'Cargo' ? `RD$ ${item.amount.toLocaleString()}`: '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                        {item.type === 'Abono' ? `RD$ ${item.amount.toLocaleString()}`: '—'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-neutral-400 text-xs">
                                        No hay transacciones registradas aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};