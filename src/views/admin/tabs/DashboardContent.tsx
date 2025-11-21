import React, { useMemo, useEffect, useRef, useState } from 'react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { Icon } from '../../../components/ui/Icon';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';

type DashboardContentProps = {
    onNavigate: (tab: string, action?: string) => void;
};

const QuickAccessCard = ({ onNavigate }: { onNavigate: (tab: string, action?: string) => void }) => (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-md h-full">
        <h3 className="text-xl font-bold text-white mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onNavigate('finances', 'add')} className="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-sm text-neutral-300 transition-colors">
                <Icon name="landmark" size={24} className="text-orange-400"/>
                <span className="text-center">Registrar Movimiento</span>
            </button>
            <button onClick={() => onNavigate('payable', 'add')} className="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-sm text-neutral-300 transition-colors">
                <Icon name="receipt" size={24} className="text-orange-400"/>
                <span className="text-center">Registrar Factura</span>
            </button>
            <button onClick={() => onNavigate('communications', 'add')} className="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-sm text-neutral-300 transition-colors">
                <Icon name="megaphone" size={24} className="text-orange-400"/>
                <span className="text-center">Nuevo Comunicado</span>
            </button>
            <button onClick={() => onNavigate('incidents', 'add')} className="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-sm text-neutral-300 transition-colors">
                <Icon name="siren" size={24} className="text-orange-400"/>
                <span className="text-center">Reportar Incidente</span>
            </button>
        </div>
    </div>
);

const LatestIncidentsCard = () => {
    const { selectedCondo } = useCondo();

    const latestOpenIncident = useMemo(() => {
        if (!selectedCondo) return null;
        const incidents = (selectedCondo.incidents as unknown as any[]) || [];
        return incidents
            .filter((i: any) => i.status === 'Abierto')
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }, [selectedCondo]);

    return (
        <div className="bg-neutral-900 p-6 rounded-lg shadow-md h-full">
            <h3 className="text-xl font-bold text-white mb-4">Últimos Incidentes Abiertos</h3>
            {latestOpenIncident ? (
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                    <p className="font-semibold text-white">{latestOpenIncident.description}</p>
                    <p className="text-sm text-neutral-400 mt-1">
                        {latestOpenIncident.reportedBy} - {formatDate(latestOpenIncident.date)}
                    </p>
                </div>
            ) : (
                <p className="text-neutral-400 text-center py-8">No hay incidentes abiertos.</p>
            )}
        </div>
    );
};

export const DashboardContent = ({ onNavigate }: DashboardContentProps) => {
    const { selectedCondo } = useCondo();
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const [timeRange, setTimeRange] = useState('6M');

    const summary = useMemo(() => {
        if (!selectedCondo) return { openIncidents: 0, totalPendingPayableAmount: 0, currentBalance: 0 };
        
        const incidents = (selectedCondo.incidents as unknown as any[]) || [];
        const payables = (selectedCondo.accountsPayable as unknown as any[]) || [];
        const finances = (selectedCondo.finances as unknown as any[]) || [];

        const openIncidents = incidents.filter((i: any) => i.status === 'Abierto').length;
        
        const pendingPayables = payables.filter((p: any) => p.status === 'Pendiente');
        const totalPendingPayableAmount = pendingPayables.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

        const currentBalance = finances.length > 0 ? finances[finances.length - 1].balance : (selectedCondo.manualBalance || 0);

        return {
            openIncidents: openIncidents || 0,
            totalPendingPayableAmount: totalPendingPayableAmount || 0,
            currentBalance: currentBalance || 0,
        };
    }, [selectedCondo]);

    const chartData = useMemo(() => {
        const finances = (selectedCondo?.finances as unknown as any[]) || [];

        if (!selectedCondo || finances.length === 0) {
            return { labels: [], incomeValues: [], expenseValues: [] };
        }

        const latestDate = new Date(Math.max(...finances.map((t: any) => new Date(t.date).getTime())));
        const monthsToShow = parseInt(timeRange.replace('M', ''), 10);
        const endDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0);
        const startDate = new Date(latestDate.getFullYear(), latestDate.getMonth() - monthsToShow + 1, 1);

        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        const labels: string[] = [];

        for (let i = 0; i < monthsToShow; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const monthKey = d.toISOString().slice(0, 7);
            const monthLabel = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
            labels.push(monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', ''));
            monthlyData[monthKey] = { income: 0, expense: 0 };
        }

        finances.forEach((tx: any) => {
            const txDate = new Date(tx.date);
            if (txDate >= startDate && txDate <= endDate) {
                const monthKey = tx.date.slice(0, 7);
                if (monthlyData[monthKey]) {
                    if (tx.type === 'Ingreso') {
                        monthlyData[monthKey].income += (tx.amount || 0);
                    } else {
                        monthlyData[monthKey].expense += Math.abs(tx.amount || 0);
                    }
                }
            }
        });

        const incomeValues = Object.values(monthlyData).map(d => d.income);
        const expenseValues = Object.values(monthlyData).map(d => d.expense);
        
        return { labels, incomeValues, expenseValues };
    }, [selectedCondo, timeRange]);


    useEffect(() => {
        if (chartRef.current && (window as any).Chart) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                chartInstance.current = new (window as any).Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartData.labels,
                        datasets: [
                            {
                                label: 'Ingresos',
                                data: chartData.incomeValues,
                                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                borderColor: 'rgba(34, 197, 94, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Egresos',
                                data: chartData.expenseValues,
                                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#a3a3a3' }, grid: { color: '#404040' } },
                            x: { ticks: { color: '#a3a3a3' }, grid: { color: 'transparent' } }
                        },
                        plugins: { legend: { labels: { color: '#d4d4d4' } } }
                    }
                });
            }
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    if (!selectedCondo) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard 
                    title="Balance Actual" 
                    // --- AIRBAG: (value || 0) ---
                    value={`RD$ ${(summary.currentBalance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`}
                    icon="scale" 
                    color="bg-blue-600"
                />
                 <KpiCard 
                    title="Incidentes Abiertos" 
                    value={summary.openIncidents || 0} 
                    icon="alert-triangle" 
                    color="bg-yellow-600"
                />
                <KpiCard 
                    title="Cuentas por Pagar" 
                    // --- AIRBAG: (value || 0) ---
                    value={`RD$ ${(summary.totalPendingPayableAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}`}
                    icon="receipt" 
                    color="bg-red-600"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickAccessCard onNavigate={onNavigate} />
                <LatestIncidentsCard />
            </div>

            <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Resumen Gráfico (Últimos {timeRange.replace('M', '')} Meses)</h3>
                    <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg">
                        {['1M', '3M', '6M', '9M', '12M'].map(range => (
                            <button 
                                key={range} 
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                                    timeRange === range 
                                    ? 'bg-orange-500 text-white' 
                                    : 'text-neutral-400 hover:bg-neutral-700'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-80">
                     <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};