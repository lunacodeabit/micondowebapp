import React, { useMemo, useEffect, useState } from 'react';
import type { Condo, Reservation, Novedad } from '../../types';
import { Icon } from '../../components/ui/Icon';
import { formatDate } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { supabase } from "../../supabaseClient";
import { AdminMainLayout } from './layout/AdminMainLayout';

type AdminHomeProps = {
    condos: Condo[];
    onLogout: () => void;
    onNavigateToCondos: () => void;
    onSelectCondo?: (id: string) => void;
};

type Activity = Reservation & { condoName: string; unitApartment: string; amenityName: string; };
import { PremiumKpiCard } from '../../components/ui/PremiumKpiCard';

const ActivityList = ({ title, activities }: { title: string, activities: Activity[] }) => (
    <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-neutral-800/50 flex justify-between items-center bg-neutral-900/40">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)]" />
                {title}
            </h2>
            <span className="px-3 py-1 bg-neutral-800 rounded-full text-[10px] font-black text-neutral-400 uppercase tracking-widest border border-neutral-700">
                {activities.length} Registros
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-neutral-900/60 border-b border-neutral-800/50">
                        <th className="p-4 font-bold text-[10px] text-neutral-500 uppercase tracking-[2px]">Área Social</th>
                        <th className="p-4 font-bold text-[10px] text-neutral-500 uppercase tracking-[2px]">Horario</th>
                        <th className="p-4 font-bold text-[10px] text-neutral-500 uppercase tracking-[2px]">Condominio / Apto</th>
                        <th className="p-4 font-bold text-[10px] text-neutral-500 uppercase tracking-[2px]">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30">
                    {activities.length > 0 ? activities.map(activity => (
                        <tr key={activity.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                                <span className="font-bold text-white group-hover:text-orange-400 transition-colors">{activity.amenityName}</span>
                                <p className="text-[10px] text-neutral-500 mt-0.5">{formatDate(activity.date)}</p>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 text-neutral-300">
                                    <Icon name="clock" className="w-3.5 h-3.5 text-neutral-500" />
                                    <span className="font-medium">{activity.startTime} — {activity.endTime}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <p className="text-white font-semibold">{activity.condoName}</p>
                                <p className="text-xs text-neutral-500">Unidad: {activity.unitApartment}</p>
                            </td>
                            <td className="p-4">
                                <StatusBadge status={activity.status} />
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center border border-neutral-700">
                                        <Icon name="calendar" className="w-8 h-8 text-neutral-600" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold tracking-tight">Sin actividad registrada</p>
                                        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-bold">Todo en orden por ahora</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export const AdminHome = ({ condos, onLogout, onNavigateToCondos, onSelectCondo }: AdminHomeProps) => {
    const [announcements, setAnnouncements] = useState<Novedad[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedPeriod, setSelectedPeriod] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [isCondoDropdownOpen, setIsCondoDropdownOpen] = useState(false);

    const activeCondo = condos[0] || null;

    const handleSelectCondo = (id: string) => {
        setIsCondoDropdownOpen(false);
        if (onSelectCondo) {
            onSelectCondo(id);
        } else {
            onNavigateToCondos();
        }
    };

    const stats = useMemo(() => {
        let totalUnits = 0;
        const safeCondos = (condos as unknown as any[]) || [];
        safeCondos.forEach(c => totalUnits += (c.units?.length || 0));
        return {
            totalCondos: safeCondos.length,
            totalUnits
        };
    }, [condos]);

    const { todayActivities, upcomingActivities } = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const allActivities: Activity[] = [];
        const safeCondos = (condos as unknown as any[]) || [];

        safeCondos.forEach((condo: any) => {
            const reservations = (condo.reservations as unknown as any[]) || [];
            const units = (condo.units as unknown as any[]) || [];
            const amenities = (condo.amenities as unknown as any[]) || [];

            reservations.forEach((res: any) => {
                const unit = units.find((u: any) => u.id === res.unitId);
                const amenity = amenities.find((a: any) => a.id === res.amenityId);

                if (unit && amenity) {
                    allActivities.push({
                        ...res,
                        condoName: condo.name,
                        unitApartment: unit.apartmentNumber,
                        amenityName: amenity.name
                    });
                }
            });
        });

        const todayActivities = allActivities.filter(a => a.date === today && a.status === 'Aprobada').sort((a, b) => a.startTime.localeCompare(b.startTime));
        const upcomingActivities = allActivities.filter(a => a.date > today && a.status === 'Aprobada').sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

        return { todayActivities, upcomingActivities };
    }, [condos]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const { data, error } = await supabase
                    .from('saas_announcements')
                    .select('*')
                    .eq('is_active', true)
                    .in('target_audience', ['admin', 'all']);

                if (error) throw error;

                const mapped = (data || []).map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    content: a.content,
                    date: `${formatDate(a.publish_date)}`
                }));

                setAnnouncements(mapped);
            } catch (err) {
                console.error("Error fetching system announcements:", err);
            } finally {
                setLoadingAnnouncements(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const handleTabChange = (tab: string) => {
        if (tab === "condos") onNavigateToCondos();
        else setActiveTab(tab);
    };

    // Monthly Chart Data (Tesla Style Blue Bars)
    const monthlyBars = [
        { month: 'ENE', height: 35, value: 'RD$ 35k' },
        { month: 'FEB', height: 42, value: 'RD$ 42k' },
        { month: 'MAR', height: 40, value: 'RD$ 40k' },
        { month: 'ABR', height: 65, value: 'RD$ 65k' },
        { month: 'MAY', height: 72, value: 'RD$ 72k' },
        { month: 'JUN', height: 58, value: 'RD$ 58k' },
        { month: 'JUL', height: 68, value: 'RD$ 68k' },
        { month: 'AGO', height: 30, value: 'RD$ 30k' },
        { month: 'SEP', height: 78, value: 'RD$ 78k' },
        { month: 'OCT', height: 85, value: 'RD$ 85k' },
        { month: 'NOV', height: 92, value: 'RD$ 92k' },
        { month: 'DIC', height: 98, value: 'RD$ 98k' },
    ];

    // Units progress data
    const unitsTracking = [
        { apt: 'Apto 1A', name: 'Luis Martínez', pct: 100, color: 'from-blue-500 to-indigo-600', status: 'Al día' },
        { apt: 'Apto 2A', name: 'Ana García', pct: 75, color: 'from-amber-400 to-orange-500', status: 'Pendiente' },
        { apt: 'Apto 3A', name: 'Carlos Perez', pct: 50, color: 'from-rose-400 to-red-500', status: 'Mora' },
        { apt: 'Apto 1B', name: 'Sofia Rodriguez', pct: 100, color: 'from-emerald-400 to-teal-500', status: 'Al día' },
        { apt: 'Apto 1C', name: 'Juan Gomez', pct: 85, color: 'from-cyan-400 to-blue-500', status: 'Al día' },
    ];

    // Services progress data
    const servicesCompliance = [
        { name: 'EDESUR (Energía Áreas Comunes)', pct: 100, status: 'Pagado' },
        { name: 'CAASD (Suministro de Agua)', pct: 95, status: 'Al día' },
        { name: 'Seguridad Privada 24/7', pct: 90, status: 'Facturado' },
        { name: 'TROPIGAS (Gas Centralizado)', pct: 88, status: 'En ciclo' },
        { name: 'Mantenimiento de Elevadores', pct: 100, status: 'Al día' },
    ];

    return (
        <AdminMainLayout activeTab={activeTab} onTabChange={handleTabChange}>
            <div className="space-y-6">
                {/* 1. TOP FILTER PILLS + ACTIVE CONDO SELECTOR */}
                <div className="flex flex-wrap items-center gap-3 relative">
                    <div className="relative">
                        <button
                            onClick={() => setIsCondoDropdownOpen(!isCondoDropdownOpen)}
                            className="inline-flex items-center gap-2 bg-white dark:bg-[#161b26] px-4 py-2 rounded-full border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                            title="Seleccionar condominio"
                        >
                            <span className="text-neutral-400 dark:text-neutral-500 font-normal">Condominio:</span>
                            <span className="font-bold">{activeCondo?.name || 'Torre Los Pinos'}</span>
                            <Icon name="chevron-down" className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isCondoDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Interactive Dropdown */}
                        {isCondoDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 anime-fade-in">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                    Tus Condominios Activos
                                </div>
                                {condos.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelectCondo(c.id)}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {c.name}
                                            </p>
                                            <p className="text-[11px] text-neutral-400 truncate">
                                                {c.units?.length || 0} unidades • {c.code || 'DOM'}
                                            </p>
                                        </div>
                                        <Icon name="chevron-right" className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                ))}
                                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-1">
                                    <button
                                        onClick={() => { setIsCondoDropdownOpen(false); onNavigateToCondos(); }}
                                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center justify-between"
                                    >
                                        <span>Administrar todos los clientes</span>
                                        <Icon name="arrow-right" className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white dark:bg-[#161b26] px-4 py-2 rounded-full border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal">Periodo:</span>
                        <span>Este Año (2026)</span>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white dark:bg-[#161b26] px-4 py-2 rounded-full border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal">Estado:</span>
                        <span>{condos.length} Inmuebles Activos</span>
                    </div>
                </div>

                {/* 1.1 CLIENTES ACTIVOS STRIP (Direct Click to Access Any Condo) */}
                <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-600 dark:bg-blue-500 rounded-full" />
                            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                                Clientes Activos ({condos.length} Condominios)
                            </h3>
                        </div>
                        <button
                            onClick={onNavigateToCondos}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <span>Gestionar Clientes</span>
                            <Icon name="arrow-right" className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {condos.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => handleSelectCondo(c.id)}
                                className="group p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/70 hover:bg-blue-50/50 dark:bg-neutral-800/40 dark:hover:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-500/60 text-left transition-all duration-150 flex items-center justify-between cursor-pointer shadow-2xs"
                                title={`Ingresar al panel de ${c.name}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Icon name="building-2" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {c.name}
                                        </p>
                                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                            {c.units?.length || 0} unidades • {c.address?.split(',')[0] || 'Santo Domingo'}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                                    <Icon name="chevron-right" className="w-4 h-4" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. TOP GRID: 6 White Metric Cards + Activity Bar Chart (Exact Layout from Image) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: 6 Mini Metric Cards in 2 rows of 3 */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Row 1 */}
                        <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Unidades Activas</span>
                            <div className="my-2">
                                <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">4<span className="text-xl text-neutral-400 font-semibold">/5</span></h3>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md inline-block w-fit">80% al día</span>
                        </div>

                        <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Cobranza del Mes</span>
                            <div className="my-2">
                                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">RD$ 66.8k</h3>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md inline-block w-fit">4 cuotas cobradas</span>
                        </div>

                        <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Balance Banco</span>
                            <div className="my-2">
                                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">RD$ 14.5k</h3>
                            </div>
                            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md inline-block w-fit">Banco Popular</span>
                        </div>

                        {/* Row 2 (Cards with Mini Sparkline Curves) */}
                        <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Efectividad Cobro</span>
                            <div className="my-2">
                                <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">80%</h3>
                            </div>
                            <svg className="w-full h-5 text-blue-500 dark:text-blue-400" viewBox="0 0 100 20" fill="none">
                                <path d="M0 16 Q 25 4, 50 14 T 100 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Cuentas por Pagar</span>
                            <div className="my-2">
                                <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">RD$ 6k</h3>
                            </div>
                            <svg className="w-full h-5 text-blue-500 dark:text-blue-400" viewBox="0 0 100 20" fill="none">
                                <path d="M0 10 Q 25 18, 50 8 T 100 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Crecimiento / Reserva</span>
                            <div className="my-2">
                                <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">+14%</h3>
                            </div>
                            <svg className="w-full h-5 text-blue-500 dark:text-blue-400" viewBox="0 0 100 20" fill="none">
                                <path d="M0 18 Q 30 12, 60 16 T 100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Right: Activity Bar Chart (Card with Blue Rounded Bars) */}
                    <div className="lg:col-span-5 bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Actividad de Cobros</h3>
                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/70 px-2.5 py-1 rounded-lg border border-neutral-200/60 dark:border-neutral-700 cursor-pointer">
                                <span>Mes</span>
                                <Icon name="chevron-down" className="w-3 h-3 text-neutral-400" />
                            </div>
                        </div>

                        {/* Bar Chart Visualization */}
                        <div className="h-44 flex items-end justify-between gap-1.5 pt-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                            {monthlyBars.map((bar, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div
                                        style={{ height: `${bar.height}%` }}
                                        className="w-full max-w-[14px] bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 rounded-full transition-all duration-300 group-hover:scale-y-105"
                                    />
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-7 hidden group-hover:block bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-20 shadow-md">
                                        {bar.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Month Labels */}
                        <div className="flex justify-between text-[9px] font-bold text-neutral-400 dark:text-neutral-500 pt-2 uppercase">
                            {monthlyBars.map((b, idx) => (
                                <span key={idx}>{b.month}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. MIDDLE ROW: Progress Bars (Weakest / Strongest Topics equivalent) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: Cuotas y Pagos por Unidad */}
                    <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Cumplimiento de Cuotas por Unidad</h3>
                            <button onClick={() => onNavigateToCondos()} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                Ver todas
                            </button>
                        </div>

                        <div className="space-y-4">
                            {unitsTracking.map((u, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-neutral-900 dark:text-white">{u.apt}</span>
                                            <span className="text-neutral-500 dark:text-neutral-400">• {u.name}</span>
                                        </div>
                                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{u.pct}% {u.status}</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${u.pct}%` }}
                                            className={`h-full rounded-full bg-gradient-to-r ${u.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Servicios Básicos & Proveedores */}
                    <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Servicios Básicos & Pagos Operativos</h3>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                                Al corriente
                            </span>
                        </div>

                        <div className="space-y-4">
                            {servicesCompliance.map((s, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{s.name}</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.pct}% {s.status}</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${s.pct}%` }}
                                            className="h-full rounded-full bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. BOTTOM ROW: Resident Leaderboard & Operating Announcements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: Leaderboard de Residentes */}
                    <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Directorio de Propietarios</h3>
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">Torre Los Pinos</span>
                        </div>

                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {[
                                { name: 'Luis Martínez', unit: 'Apto 1A', fee: 'RD$ 16,700', rank: 1, trend: 'up' },
                                { name: 'Sofia Rodriguez', unit: 'Apto 1B', fee: 'RD$ 16,700', rank: 2, trend: 'up' },
                                { name: 'Juan Gomez', unit: 'Apto 1C', fee: 'RD$ 16,700', rank: 3, trend: 'up' },
                                { name: 'Ana García', unit: 'Apto 2A', fee: 'RD$ 16,700', rank: 4, trend: 'down' },
                            ].map((r, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center border border-neutral-200/80 dark:border-neutral-700">
                                            {r.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{r.name}</p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{r.unit} • Cuota: {r.fee}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold">
                                        <span className="text-neutral-700 dark:text-neutral-300">{r.rank}</span>
                                        {r.trend === 'up' ? (
                                            <span className="text-emerald-500">▲</span>
                                        ) : (
                                            <span className="text-rose-500">▼</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Novedades & Circulares */}
                    <div className="bg-white dark:bg-[#161b26] p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-2xs dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Circulares & Comunicados Recientes</h3>
                            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">{announcements.length} Publicados</span>
                        </div>

                        {loadingAnnouncements ? (
                            <div className="py-8 flex flex-col items-center gap-2 text-neutral-400">
                                <Icon name="loader" className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="text-xs">Cargando circulares...</span>
                            </div>
                        ) : announcements.length > 0 ? (
                            <div className="space-y-3">
                                {announcements.slice(0, 3).map(a => (
                                    <div key={a.id} className="p-3.5 bg-neutral-50/70 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{a.title}</h4>
                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium whitespace-nowrap">{a.date}</span>
                                        </div>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">{a.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-neutral-400 dark:text-neutral-500">
                                <p className="text-xs">Sin circulares pendientes en este momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminMainLayout>
    );
};
