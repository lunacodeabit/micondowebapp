import React, { useState, useMemo } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { formatDate } from '../../../utils/date';
import { AgingReceivablesReport, UnitAgingData } from '../reports/AgingReceivablesReport';
import { calculateAgingBalances } from '../../../utils/finance';
import { useCondo } from '../../../context/CondoContext';
import type { Condo } from '../../../types';

const ReportViewer = ({ title, children, onDownloadPdf, condo }: { title: string, children?: React.ReactNode, onDownloadPdf: () => void, condo: Condo }) => (
    <div className="bg-neutral-900 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4 report-controls">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onDownloadPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm">
                <Icon name="file-down" size={16} />
                <span>Descargar PDF</span>
            </button>
        </div>
        <div className="report-paper">
            <div className="hidden printable-header text-center mb-4">
                <h1 className="text-2xl font-bold">{condo.name}</h1>
                <h2 className="text-lg">{title}</h2>
                <p>{new Date().toLocaleDateString('es-ES')}</p>
            </div>
            {children}
        </div>
    </div>
);

const IncomeAndExpenseReport = ({ data }: { data: { incomes: any[], expenses: any[], totalIncome: number, totalExpense: number, netResult: number } }) => {
    return (
        <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="summary-box col-span-1">
                    <table>
                        <thead>
                            <tr><th colSpan={2} className="text-center">RESUMEN DEL MES</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Total Ingresos:</td><td className="text-right">{data.totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                            <tr><td>Total Egresos:</td><td className="text-right">{data.totalExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody>
                        <tfoot>
                             <tr><td>Resultado Neto:</td><td className="text-right">{data.netResult.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="section-header">INGRESOS</div>
            <table className="data-table">
                <thead>
                    <tr><th>Fecha</th><th>Descripción</th><th className="text-right">Monto</th></tr>
                </thead>
                <tbody>
                    {data.incomes.map(t => <tr key={t.id}><td>{formatDate(t.date)}</td><td>{t.description}</td><td className="text-right">{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>)}
                </tbody>
            </table>
            <div className="section-header mt-4">EGRESOS</div>
             <table className="data-table">
                <thead>
                    <tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th className="text-right">Monto</th></tr>
                </thead>
                <tbody>
                     {data.expenses.map(t => <tr key={t.id}><td>{formatDate(t.date)}</td><td>{t.description}</td><td>{t.category}</td><td className="text-right">{Math.abs(t.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>)}
                </tbody>
            </table>
        </div>
    );
};

export const ReportsContent = () => {
    const { selectedCondo } = useCondo();
    const [activeReport, setActiveReport] = useState('income_expense');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
    
    const availableMonths = useMemo(() => {
        if (!selectedCondo) return [];
        // AIRBAG
        const finances = (selectedCondo.finances as unknown as any[]) || [];
        const months = new Set<string>();
        finances.forEach((t: any) => months.add(t.date.slice(0, 7)));
        return Array.from(months).sort().reverse();
    }, [selectedCondo]);
    
    // --- Data Calculation ---
    const incomeExpenseData = useMemo(() => {
        if (!selectedCondo) return { incomes: [], expenses: [], totalIncome: 0, totalExpense: 0, netResult: 0 };
        
        // AIRBAG
        const finances = (selectedCondo.finances as unknown as any[]) || [];
        
        const incomes = finances.filter((t: any) => t.type === 'Ingreso' && t.date.startsWith(reportMonth));
        const expenses = finances.filter((t: any) => t.type === 'Egreso' && t.date.startsWith(reportMonth));
        const totalIncome = incomes.reduce((sum: number, t: any) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        const netResult = totalIncome - totalExpense;
        return { incomes, expenses, totalIncome, totalExpense, netResult };
    }, [selectedCondo, reportMonth]);

    const agingReportData = useMemo(() => {
        if (!selectedCondo) return { agingData: [], totals: { total: 0, current: 0, '31-60': 0, '61-90': 0, '91+': 0 }};
        
        const asOfDate = new Date();
        const data: UnitAgingData[] = [];
        
        // AIRBAG
        const units = (selectedCondo.units as unknown as any[]) || [];

        units.forEach((unit: any) => {
            const history = (unit.accountHistory as unknown as any[]) || [];
            const aging = calculateAgingBalances(history as any, asOfDate);
            if (aging.total > 0) {
                data.push({ unit, aging });
            }
        });

        const totals = data.reduce((acc, d) => {
            acc.total += d.aging.total;
            acc.current += d.aging.current;
            acc['31-60'] += d.aging['31-60'];
            acc['61-90'] += d.aging['61-90'];
            acc['91+'] += d.aging['91+'];
            return acc;
        }, { total: 0, current: 0, '31-60': 0, '61-90': 0, '91+': 0 });

        return { agingData: data, totals };
    }, [selectedCondo]);

    // --- PDF Generation ---
    const handleDownloadPdf = () => {
        if (!selectedCondo) return;

        // Safe access to jspdf global
        const { jsPDF } = (window as any).jspdf || { jsPDF: class {} };
        
        if (!(window as any).jspdf) {
            alert("La librería PDF no está cargada.");
            return;
        }

        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('es-ES');
        let finalY = 35;

        // Common Header
        doc.setFontSize(18);
        doc.text(selectedCondo.name, 14, 22);
        doc.setFontSize(12);
        doc.text(`Fecha de Emisión: ${today}`, 14, 30);

        const formatCurrency = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (activeReport === 'income_expense') {
            const reportTitle = `Reporte de Ingresos y Egresos - ${new Date(reportMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`;
            doc.setFontSize(14);
            doc.text(reportTitle, 14, finalY);
            finalY += 10;
            
            // Summary Table
            doc.autoTable({
                startY: finalY,
                body: [
                    ['Total Ingresos:', formatCurrency(incomeExpenseData.totalIncome)],
                    ['Total Egresos:', formatCurrency(incomeExpenseData.totalExpense)],
                    [{ content: 'Resultado Neto:', styles: { fontStyle: 'bold' } }, { content: formatCurrency(incomeExpenseData.netResult), styles: { fontStyle: 'bold' } }],
                ],
                theme: 'striped',
                headStyles: { fillColor: [22, 160, 133] },
            });
            finalY = doc.lastAutoTable.finalY + 10;
            
            // Incomes Table
            doc.autoTable({
                startY: finalY,
                head: [['INGRESOS']],
                headStyles: { fillColor: [41, 128, 185] },
            });
            doc.autoTable({
                startY: doc.lastAutoTable.finalY,
                head: [['Fecha', 'Descripción', 'Monto']],
                body: incomeExpenseData.incomes.map(t => [formatDate(t.date), t.description, formatCurrency(t.amount)]),
                columnStyles: { 2: { halign: 'right' } }
            });
            finalY = doc.lastAutoTable.finalY + 10;
            
            // Expenses Table
            doc.autoTable({
                startY: finalY,
                head: [['EGRESOS']],
                headStyles: { fillColor: [192, 57, 43] },
            });
            doc.autoTable({
                startY: doc.lastAutoTable.finalY,
                head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
                body: incomeExpenseData.expenses.map(t => [formatDate(t.date), t.description, t.category, formatCurrency(Math.abs(t.amount))]),
                columnStyles: { 3: { halign: 'right' } }
            });

            doc.save(`Reporte_Ingresos_Egresos_${reportMonth}.pdf`);

        } else if (activeReport === 'aging_receivables') {
            doc.setFontSize(14);
            doc.text('Reporte de Antigüedad de Saldos por Cobrar', 14, finalY);
            finalY += 10;

            const { agingData, totals } = agingReportData;
            doc.autoTable({
                startY: finalY,
                head: [['RESUMEN GENERAL DE DEUDA']],
                headStyles: { fillColor: [41, 128, 185] },
            });
             doc.autoTable({
                startY: doc.lastAutoTable.finalY,
                body: [
                    ['Deuda Corriente (0-30 días):', { content: formatCurrency(totals.current), styles: { halign: 'right' } }],
                    ['Deuda de 31-60 días:', { content: formatCurrency(totals['31-60']), styles: { halign: 'right' } }],
                    ['Deuda de 61-90 días:', { content: formatCurrency(totals['61-90']), styles: { halign: 'right' } }],
                    ['Deuda de 91+ días:', { content: formatCurrency(totals['91+']), styles: { halign: 'right' } }],
                    [{ content: 'Total Adeudado:', styles: { fontStyle: 'bold' } }, { content: formatCurrency(totals.total), styles: { fontStyle: 'bold', halign: 'right' } }],
                ],
            });
            finalY = doc.lastAutoTable.finalY + 10;

            doc.autoTable({
                startY: finalY,
                head: [['DETALLE DE DEUDA POR UNIDAD']],
                headStyles: { fillColor: [41, 128, 185] },
            });
            doc.autoTable({
                startY: doc.lastAutoTable.finalY,
                head: [['Unidad', 'Propietario', 'Total Deuda', 'Corriente', '31-60 Días', '61-90 Días', '91+ Días']],
                body: agingData.map(({ unit, aging }) => [
                    unit.apartmentNumber, unit.ownerName,
                    { content: formatCurrency(aging.total), styles: { halign: 'right' } },
                    { content: formatCurrency(aging.current), styles: { halign: 'right' } },
                    { content: formatCurrency(aging['31-60']), styles: { halign: 'right' } },
                    { content: formatCurrency(aging['61-90']), styles: { halign: 'right' } },
                    { content: formatCurrency(aging['91+']), styles: { halign: 'right' } },
                ]),
                foot: [[
                    { content: 'TOTALES', colSpan: 2, styles: { fontStyle: 'bold' } },
                    { content: formatCurrency(totals.total), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: formatCurrency(totals.current), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: formatCurrency(totals['31-60']), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: formatCurrency(totals['61-90']), styles: { halign: 'right', fontStyle: 'bold' } },
                    { content: formatCurrency(totals['91+']), styles: { halign: 'right', fontStyle: 'bold' } },
                ]],
                footStyles: { fontStyle: 'bold', fillColor: [230, 230, 230], textColor: [0,0,0] },
                didParseCell: function (data: any) {
                    if(data.row.section === 'body') {
                        data.cell.styles.halign = 'right';
                         if (data.column.index <= 1) {
                            data.cell.styles.halign = 'left';
                        }
                    }
                }
            });
            doc.save(`Reporte_Antiguedad_Saldos.pdf`);
        }
    };


    const renderReport = () => {
        if (!selectedCondo) return <p>Seleccione un condominio.</p>;

        switch (activeReport) {
            case 'income_expense':
                return (
                    <ReportViewer condo={selectedCondo} title={`Reporte de Ingresos y Egresos - ${new Date(reportMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`} onDownloadPdf={handleDownloadPdf}>
                        <IncomeAndExpenseReport data={incomeExpenseData} />
                    </ReportViewer>
                );
            case 'aging_receivables':
                return (
                    <ReportViewer condo={selectedCondo} title="Reporte de Antigüedad de Saldos por Cobrar" onDownloadPdf={handleDownloadPdf}>
                        <AgingReceivablesReport agingData={agingReportData.agingData} totals={agingReportData.totals} />
                    </ReportViewer>
                );
            default:
                return <p>Seleccione un reporte</p>;
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Reportes</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1">
                    <div className="bg-neutral-900 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">Seleccionar Reporte</h4>
                        <select
                            value={activeReport}
                            onChange={(e) => setActiveReport(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white"
                        >
                            <option value="income_expense">Ingresos y Egresos</option>
                            <option value="aging_receivables">Antigüedad de Saldos (CxC)</option>
                        </select>

                        <div className="mt-4 report-filter-bar">
                             <h4 className="font-bold mb-2">Filtros</h4>
                             {activeReport === 'income_expense' && (
                                <div>
                                    <label htmlFor="month" className="block text-sm font-medium text-neutral-400 mb-1">Mes</label>
                                    <select
                                        id="month"
                                        value={reportMonth}
                                        onChange={(e) => setReportMonth(e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white"
                                    >
                                        {availableMonths.map((m: any) => (
                                            <option key={m} value={m}>
                                                {new Date(m + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
                <main className="lg:col-span-3">
                    {renderReport()}
                </main>
            </div>
        </div>
    );
};