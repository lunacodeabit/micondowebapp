import React, { useMemo, useEffect, useRef, useState } from 'react';
import { PremiumKpiCard } from '../../../components/ui/PremiumKpiCard';
import { Icon } from '../../../components/ui/Icon';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';

type DashboardContentProps = {
    onNavigate: (tab: string, action?: string) => void;
};

const QuickAccessButton = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group relative bg-neutral-800/30 hover:bg-neutral-800/80 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-neutral-800/50 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)] overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon name={icon} className="w-8 h-8 text-neutral-500 group-hover:text-orange-400 transition-all duration-300 group-hover:scale-110 relative z-10" />
        <span className="text-xs font-black text-neutral-400 group-hover:text-white uppercase tracking-widest text-center relative z-10">
            {label}
        </span>
    </button>
);

const SectionContainer = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-6 rounded-[2rem] h-full overflow-hidden relative">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Icon name={icon} className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-[2px]">{title}</h3>
        </div>
        {children}
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
        <SectionContainer title="Incidentes Críticos" icon="alert-triangle">
            {latestOpenIncident ? (
                <div className="group relative bg-neutral-900/60 p-5 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-red-500/10 text-[9px] font-black text-red-500 uppercase tracking-widest rounded">Alta Prioridad</span>
                        <span className="text-[10px] text-neutral-500 font-bold">{formatDate(latestOpenIncident.date)}</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-2 leading-relaxed">{latestOpenIncident.description}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Icon name="user" className="w-3 h-3" />
                        <span>{latestOpenIncident.reportedBy}</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <Icon name="check-circle" className="w-10 h-10 mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">Sin Incidentes</p>
                </div>
            )}
        </SectionContainer>
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
                                backgroundColor: 'rgba(34, 197, 94, 0.4)',
                                borderColor: 'rgba(34, 197, 94, 1)',
                                borderWidth: 0,
                                borderRadius: 10
                            },
                            {
                                label: 'Egresos',
                                data: chartData.expenseValues,
                                backgroundColor: 'rgba(239, 68, 68, 0.4)',
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 0,
                                borderRadius: 10
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#525252', font: { family: 'Inter', weight: 'bold', size: 10 } },
                                grid: { color: 'rgba(255,255,255,0.03)' }
                            },
                            x: {
                                ticks: { color: '#525252', font: { family: 'Inter', weight: 'bold', size: 10 } },
                                grid: { color: 'transparent' }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                align: 'end',
                                labels: {
                                    color: '#737373',
                                    font: { family: 'Inter', weight: 'black', size: 10 }
                                }
                            }
                        }
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
        <div className="space-y-8 pb-20">
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <PremiumKpiCard
                    title="Balance en Bóveda"
                    value={`RD$ ${(summary.currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon="scale"
                    gradient="from-blue-600 to-indigo-600"
                    delay="delay-100"
                />
                <PremiumKpiCard
                    title="Incidentes Activos"
                    value={summary.openIncidents || 0}
                    icon="alert-triangle"
                    gradient="from-orange-600 to-red-600"
                    delay="delay-200"
                />
                <PremiumKpiCard
                    title="Pasivos Pendientes"
                    value={`RD$ ${(summary.totalPendingPayableAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon="receipt"
                    gradient="from-red-600 to-pink-600"
                    delay="delay-300"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Access */}
                <div className="lg:col-span-2">
                    <SectionContainer title="Acciones de Alta Velocidad" icon="zap">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickAccessButton icon="landmark" label="Registrar Movimiento" onClick={() => onNavigate('finances', 'add')} />
                            <QuickAccessButton icon="receipt" label="Gasto Pendiente" onClick={() => onNavigate('payable', 'add')} />
                            <QuickAccessButton icon="megaphone" label="Emitir Comunicado" onClick={() => onNavigate('communications', 'add')} />
                            <QuickAccessButton icon="siren" label="Reportar Alerta" onClick={() => onNavigate('incidents', 'add')} />
                        </div>
                    </SectionContainer>
                </div>

                {/* Latest Incidents */}
                <LatestIncidentsCard />
            </div>

            {/* Visual Analytics Section */}
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-8 rounded-[2rem] overflow-hidden relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter">Análisis de Flujo de Caja</h3>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Comparativa Ingresos vs Egresos</p>
                    </div>
                    <div className="flex space-x-1 bg-neutral-800/50 p-1.5 rounded-xl border border-neutral-700/30">
                        {['1M', '3M', '6M', '12M'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${timeRange === range
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'text-neutral-500 hover:text-white hover:bg-neutral-700'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[400px]">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};
