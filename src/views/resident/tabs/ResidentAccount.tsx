import React from 'react';
import type { Unit } from '../../../types';
import { formatDate } from '../../../utils/date';

type ResidentAccountProps = {
    resident: Unit;
};

export const ResidentAccount = ({ resident }: ResidentAccountProps) => {
    // --- AIRBAG: Forzamos a que sea una lista segura ---
    const history = (resident.accountHistory as unknown as any[]) || [];

    // Calculamos balance usando la lista segura
    const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);

    // Ordenamos la lista segura
    const sortedHistory = [...history].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Estado de Cuenta</h2>
            <p className="text-neutral-400 mb-6">Aquí puede ver el historial de transacciones de su unidad.</p>

            <div className="bg-neutral-900 rounded-lg shadow-md p-6 mb-6">
                <p className="text-neutral-400">Balance Actual</p>
                <p className={`text-3xl font-bold ${balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    RD$ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
            </div>
            
            <div className="bg-neutral-900 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-800">
                        <tr>
                            {['Fecha', 'Descripción', 'Cargo', 'Abono'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {sortedHistory.length > 0 ? sortedHistory.map((item: any) => (
                            <tr key={item.id} className="hover:bg-neutral-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{formatDate(item.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                                    {item.type === 'Cargo' ? `RD$ ${item.amount.toLocaleString()}`: ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                                    {item.type === 'Abono' ? `RD$ ${item.amount.toLocaleString()}`: ''}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                    No hay transacciones registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};