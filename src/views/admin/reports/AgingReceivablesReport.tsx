import React from 'react';
import type { Unit } from '../../../types';

export type UnitAgingData = {
    unit: Unit;
    aging: {
        current: number;
        '31-60': number;
        '61-90': number;
        '91+': number;
        total: number;
    };
};

type AgingTotals = {
    total: number;
    current: number;
    '31-60': number;
    '61-90': number;
    '91+': number;
};

type AgingReceivablesReportProps = {
    agingData: UnitAgingData[];
    totals: AgingTotals;
};

export const AgingReceivablesReport = ({ agingData, totals }: AgingReceivablesReportProps) => {

    const formatCurrency = (value: number) => {
        if (value === 0) return '0.00';
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="summary-box col-span-1">
                     <table>
                        <thead>
                            <tr><th colSpan={2} className="text-center">RESUMEN GENERAL DE DEUDA</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Deuda Corriente (0-30 días):</td><td className="text-right">{formatCurrency(totals.current)}</td></tr>
                            <tr><td>Deuda de 31-60 días:</td><td className="text-right">{formatCurrency(totals['31-60'])}</td></tr>
                            <tr><td>Deuda de 61-90 días:</td><td className="text-right">{formatCurrency(totals['61-90'])}</td></tr>
                            <tr><td>Deuda de 91+ días:</td><td className="text-right">{formatCurrency(totals['91+'])}</td></tr>
                        </tbody>
                        <tfoot>
                             <tr><td>Total Adeudado:</td><td className="text-right">{formatCurrency(totals.total)}</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>


            <div className="section-header">DETALLE DE DEUDA POR UNIDAD</div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Unidad</th>
                        <th>Propietario</th>
                        <th className="text-right">Total Deuda</th>
                        <th className="text-right">Corriente</th>
                        <th className="text-right">31-60 Días</th>
                        <th className="text-right">61-90 Días</th>
                        <th className="text-right">91+ Días</th>
                    </tr>
                </thead>
                <tbody>
                    {agingData.map(({ unit, aging }) => (
                        <tr key={unit.id}>
                            <td>{unit.apartmentNumber}</td>
                            <td>{unit.ownerName}</td>
                            <td className="text-right font-bold">{formatCurrency(aging.total)}</td>
                            <td className="text-right">{formatCurrency(aging.current)}</td>
                            <td className="text-right">{formatCurrency(aging['31-60'])}</td>
                            <td className="text-right">{formatCurrency(aging['61-90'])}</td>
                            <td className="text-right">{formatCurrency(aging['91+'])}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold" style={{ backgroundColor: '#e0e0e0' }}>
                        <td colSpan={2}>TOTALES</td>
                        <td className="text-right">{formatCurrency(totals.total)}</td>
                        <td className="text-right">{formatCurrency(totals.current)}</td>
                        <td className="text-right">{formatCurrency(totals['31-60'])}</td>
                        <td className="text-right">{formatCurrency(totals['61-90'])}</td>
                        <td className="text-right">{formatCurrency(totals['91+'])}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};