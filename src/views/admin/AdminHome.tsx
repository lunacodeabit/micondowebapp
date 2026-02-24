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

export const AdminHome = ({ condos, onLogout, onNavigateToCondos }: AdminHomeProps) => {
    const [announcements, setAnnouncements] = useState<Novedad[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");

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

    return (
        <AdminMainLayout activeTab={activeTab} onTabChange={handleTabChange}>
            {/* Aura Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 anime-fade-in">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] font-black text-orange-500 uppercase tracking-[3px]">
                        <Icon name="shield-check" className="w-4 h-4 shadow-xl shadow-orange-500/50" />
                        <span>Consola Central de Operaciones</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                        Tu Ecosistema <br />
                        <span className="text-neutral-500">en una sola vista</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onNavigateToCondos}
                        className="group relative px-8 py-4 bg-orange-600 rounded-2xl overflow-hidden shadow-2xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="flex items-center gap-3 relative z-10">
                            <Icon name="mouse-pointer-2" className="w-5 h-5 text-white" />
                            <span className="text-white font-black uppercase tracking-widest text-xs">Gestionar Condominios</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <PremiumKpiCard
                    title="Clientes Registrados"
                    value={stats.totalCondos}
                    icon="building-2"
                    gradient="from-indigo-600 to-blue-600"
                    delay="delay-100"
                />
                <PremiumKpiCard
                    title="Unidades Bajo Gestión"
                    value={stats.totalUnits}
                    icon="home"
                    gradient="from-emerald-600 to-teal-600"
                    delay="delay-200"
                />
                <PremiumKpiCard
                    title="Novedades SaaS"
                    value={announcements.length}
                    icon="megaphone"
                    gradient="from-orange-600 to-red-600"
                    delay="delay-300"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Main Activity Lists */}
                <div className="lg:col-span-2 space-y-12">
                    <ActivityList title="Actividades para Hoy" activities={todayActivities} />
                    <ActivityList title="Próximas Reservaciones" activities={upcomingActivities} />
                </div>

                {/* Right: SaaS News & Insights */}
                <div className="space-y-8">
                    <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />

                        <h2 className="text-xl font-black text-white tracking-tight mb-8 flex items-center gap-3 relative z-10">
                            <Icon name="megaphone" className="w-6 h-6 text-orange-400 font-bold" />
                            Novedades del Sistema
                        </h2>

                        {loadingAnnouncements ? (
                            <div className="py-12 flex flex-col items-center gap-4 text-neutral-500">
                                <Icon name="refresh-cw" className="w-8 h-8 animate-spin opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                            </div>
                        ) : announcements.length > 0 ? (
                            <div className="space-y-6 relative z-10">
                                {announcements.map(novedad => (
                                    <div key={novedad.id} className="group/item">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-sm font-bold text-white group-hover/item:text-orange-400 transition-colors uppercase tracking-tight">{novedad.title}</h3>
                                            <span className="text-[9px] text-neutral-600 font-black">{novedad.date}</span>
                                        </div>
                                        <p className="text-xs text-neutral-400 leading-relaxed font-medium line-clamp-3">{novedad.content}</p>
                                        <div className="mt-4 border-b border-neutral-800/50" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-neutral-500">
                                <p className="text-xs font-bold uppercase tracking-widest">Sin anuncios recientes</p>
                            </div>
                        )}

                        <button className="w-full mt-8 py-3 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 rounded-xl text-[10px] font-black text-neutral-400 uppercase tracking-[3px] transition-all duration-300">
                            Ver historial completo
                        </button>
                    </div>

                    {/* Quick Access or System Health Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-3xl relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-white/60 uppercase tracking-[3px] mb-4">Estado del Ecosistema</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                    <Icon name="cpu" className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-white tracking-tight">Wise Core 3.6.9</p>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">Latencia: 1.2ms (DR-East)</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden mb-2">
                                <div className="h-full w-[98%] bg-white/80 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                            </div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[2px] text-right">Optimized Performance</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminMainLayout>
    );
};
