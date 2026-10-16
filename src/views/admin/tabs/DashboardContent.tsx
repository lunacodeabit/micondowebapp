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
        className="group relative bg-neutral-50/80 dark:bg-neutral-900/40 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2.5 transition-all duration-150 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 shadow-2xs"
    >
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors shadow-2xs">
            <Icon name={icon} className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-center leading-tight">
            {label}
        </span>
    </button>
);

const SectionContainer = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl h-full shadow-2xs">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Icon name={icon} className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">{title}</h3>
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
        <SectionContainer title="Incidencias Críticas" icon="alert-triangle">
            {latestOpenIncident ? (
                <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40">
                    <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider rounded">
                            Atención Requerida
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">{formatDate(latestOpenIncident.date)}</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-2 leading-relaxed">{latestOpenIncident.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <Icon name="user" className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Reportado por: {latestOpenIncident.reportedBy}</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                    <Icon name="check-circle" className="w-8 h-8 mb-2 text-emerald-500" />
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Sin incidentes abiertos</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Todas las áreas funcionando con normalidad</p>
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
        if (!selectedCondo) {
            return {
                openIncidents: 0,
                totalPendingPayableAmount: 0,
                currentBalance: 0,
                totalUnits: 0,
                unitsUpToDate: 0,
                collectionRate: 100
            };
        }

        const incidents = (selectedCondo.incidents as unknown as any[]) || [];
        const payables = (selectedCondo.accountsPayable as unknown as any[]) || [];
        const finances = (selectedCondo.finances as unknown as any[]) || [];
        const units = (selectedCondo.units as unknown as any[]) || [];

        const openIncidents = incidents.filter((i: any) => i.status === 'Abierto').length;
        const pendingPayables = payables.filter((p: any) => p.status === 'Pendiente');
        const totalPendingPayableAmount = pendingPayables.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
        const currentBalance = finances.length > 0 ? finances[finances.length - 1].balance : (selectedCondo.manualBalance || 0);

        let unitsUpToDate = 0;
        units.forEach(u => {
            const history = (u.accountHistory as any[]) || [];
            const bal = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);
            if (bal <= 0) unitsUpToDate++;
        });

        const collectionRate = units.length > 0 ? Math.round((unitsUpToDate / units.length) * 100) : 100;

        return {
            openIncidents: openIncidents || 0,
            totalPendingPayableAmount: totalPendingPayableAmount || 0,
            currentBalance: currentBalance || 0,
            totalUnits: units.length,
            unitsUpToDate,
            collectionRate
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
                                label: 'Ingresos (Cuotas)',
                                data: chartData.incomeValues,
                                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 0,
                                borderRadius: 6
                            },
                            {
                                label: 'Egresos (Gastos Operativos)',
                                data: chartData.expenseValues,
                                backgroundColor: 'rgba(239, 68, 68, 0.65)',
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 0,
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { 
                                    color: '#737373', 
                                    font: { family: 'Inter', weight: 'bold', size: 10 },
                                    callback: (val: any) => `RD$ ${(val / 1000).toFixed(0)}k`
                                },
                                grid: { color: 'rgba(255,255,255,0.05)' }
                            },
                            x: {
                                ticks: { color: '#737373', font: { family: 'Inter', weight: 'bold', size: 10 } },
                                grid: { color: 'transparent' }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                align: 'end',
                                labels: {
                                    color: '#a3a3a3',
                                    font: { family: 'Inter', weight: 'bold', size: 11 },
                                    usePointStyle: true,
                                    pointStyle: 'circle'
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
        <div className="space-y-6 pb-12">
            {/* 4 Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PremiumKpiCard
                    title="Balance en Banco"
                    value={`RD$ ${(summary.currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle="Cuenta Operativa • Banco Popular"
                    icon="landmark"
                    badgeText="Conciliado"
                    badgeType="success"
                />
                <PremiumKpiCard
                    title="Cobranza del Mes"
                    value={`${summary.collectionRate}%`}
                    subtitle={`${summary.unitsUpToDate} de ${summary.totalUnits} unidades al día`}
                    icon="pie-chart"
                    badgeText={summary.collectionRate >= 80 ? 'Saludable' : 'Seguimiento'}
                    badgeType={summary.collectionRate >= 80 ? 'success' : 'warning'}
                />
                <PremiumKpiCard
                    title="Cuentas por Pagar"
                    value={`RD$ ${(summary.totalPendingPayableAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle="Proveedores y servicios pendientes"
                    icon="receipt"
                    badgeText="CxP Pendiente"
                    badgeType={summary.totalPendingPayableAmount > 0 ? 'warning' : 'neutral'}
                />
                <PremiumKpiCard
                    title="Incidencias Activas"
                    value={summary.openIncidents}
                    subtitle={summary.openIncidents === 0 ? "Todo en orden en la torre" : "Reportes de residentes"}
                    icon="alert-triangle"
                    badgeText={summary.openIncidents === 0 ? "Normal" : "Pendiente"}
                    badgeType={summary.openIncidents === 0 ? "success" : "warning"}
                />
            </div>

            {/* Quick Actions & Incident Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SectionContainer title="Acciones Rápidas de Gestión" icon="zap">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <QuickAccessButton icon="plus-circle" label="Registrar Cuota" onClick={() => onNavigate('finances', 'add')} />
                            <QuickAccessButton icon="receipt" label="Registrar Factura" onClick={() => onNavigate('payable', 'add')} />
                            <QuickAccessButton icon="megaphone" label="Nuevo Comunicado" onClick={() => onNavigate('communications', 'add')} />
                            <QuickAccessButton icon="gavel" label="Convocar Asamblea" onClick={() => onNavigate('assemblies')} />
                        </div>
                    </SectionContainer>
                </div>

                <LatestIncidentsCard />
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl relative shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <div>
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Flujo Financiero Mensual</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Ingresos por Cuotas vs. Gastos Operativos y Nómina</p>
                    </div>
                    <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/60">
                        {['3M', '6M', '12M'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === range
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[320px]">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};
