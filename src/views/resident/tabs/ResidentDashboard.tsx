import React, { useEffect, useState, useMemo } from 'react';
import type { Unit, Condo } from '../../../types';
import { PremiumKpiCard } from '../../../components/ui/PremiumKpiCard';
import { Icon } from '../../../components/ui/Icon';
import { formatDate } from '../../../utils/date';
import { supabase } from "../../../supabaseClient";

type ResidentDashboardProps = {
    resident: Unit;
    condo: Condo;
    onNavigate?: (tab: string) => void;
};

const SectionContainer = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-6 rounded-[2rem] h-full overflow-hidden relative">
        <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                <Icon name={icon} className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[2px]">{title}</h3>
        </div>
        {children}
    </div>
);

const QuickActionButton = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group relative bg-neutral-800/30 hover:bg-neutral-800/80 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-neutral-800/50 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.05)] overflow-hidden h-full"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon name={icon} className="w-8 h-8 text-neutral-500 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110 relative z-10" />
        <span className="text-[9px] font-black text-neutral-400 group-hover:text-white uppercase tracking-widest text-center relative z-10">
            {label}
        </span>
    </button>
);

export const ResidentDashboard = ({ resident, condo, onNavigate }: ResidentDashboardProps) => {
    const [systemAnnouncements, setSystemAnnouncements] = useState<any[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

    const history = (resident.accountHistory as unknown as any[]) || [];
    const balance = history.reduce((acc: number, item: any) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);

    const communications = (condo.communications as unknown as any[]) || [];
    const lastCommunication = useMemo(() => {
        if (communications.length === 0) return null;
        return [...communications].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }, [communications]);

    const stats = useMemo(() => {
        const reservations = (condo.reservations as unknown as any[]) || [];
        const myActiveReservations = reservations.filter((r: any) =>
            r.unitId === resident.id &&
            new Date(r.date) >= new Date() &&
            r.status === 'Aprobada'
        ).length;

        const incidents = (condo.incidents as unknown as any[]) || [];
        const myOpenIncidents = incidents.filter((i: any) =>
            i.unitId === resident.id &&
            i.status === 'Abierto'
        ).length;

        return {
            activeReservations: myActiveReservations,
            openIncidents: myOpenIncidents
        };
    }, [condo, resident.id]);

    useEffect(() => {
        const fetchSystemAnnouncements = async () => {
            try {
                const { data, error } = await supabase
                    .from('saas_announcements')
                    .select('*')
                    .eq('is_active', true)
                    .in('target_audience', ['resident', 'all'])
                    .order('publish_date', { ascending: false })
                    .limit(1);

                if (error) throw error;
                setSystemAnnouncements(data || []);
            } catch (err) {
                console.error("Error fetching system announcements:", err);
            } finally {
                setLoadingAnnouncements(false);
            }
        };

        fetchSystemAnnouncements();
    }, []);

    const lastSystemAnnouncement = systemAnnouncements[0];

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-6 anime-fade-in">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] font-black text-blue-500 uppercase tracking-[3px]">
                        <Icon name="shield-check" className="w-4 h-4 shadow-xl shadow-blue-500/50" />
                        <span>Bienvenido a tu Espacio Digital</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                        Hola, <span className="text-neutral-500">{resident.ownerName.split(' ')[0]}</span>. <br />
                        <span className="text-3xl">Todo está <span className="text-blue-400">bajo control</span></span>
                    </h1>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <PremiumKpiCard
                    title="Balance del Mes"
                    value={`RD$ ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon="banknote"
                    gradient="from-blue-600 to-indigo-600"
                    delay="delay-100"
                />
                <PremiumKpiCard
                    title="Reservas Activas"
                    value={stats.activeReservations}
                    icon="calendar-check"
                    gradient="from-emerald-600 to-teal-600"
                    delay="delay-200"
                />
                <PremiumKpiCard
                    title="Alertas Pendientes"
                    value={stats.openIncidents}
                    icon="siren"
                    gradient="from-orange-600 to-red-600"
                    delay="delay-300"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Quick Actions */}
                <SectionContainer title="Tu Resumen Ejecutivo" icon="zap">
                    <div className="grid grid-cols-2 gap-4 h-[calc(100%-3rem)]">
                        <QuickActionButton icon="credit-card" label="Notificar Pago" onClick={() => onNavigate?.('payments')} />
                        <QuickActionButton icon="key" label="Nueva Reserva" onClick={() => onNavigate?.('reservations')} />
                        <QuickActionButton icon="siren" label="Reportar Avería" onClick={() => onNavigate?.('incidents')} />
                        <QuickActionButton icon="user" label="Mi Propiedad" onClick={() => onNavigate?.('account')} />
                    </div>
                </SectionContainer>

                {/* Right: Info Hub */}
                <div className="space-y-6">
                    {/* Condominium Communication */}
                    <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
                        <h4 className="text-[9px] font-black text-neutral-500 uppercase tracking-[2px] mb-4">Comunicado del Condominio</h4>
                        {lastCommunication ? (
                            <div className="relative z-10">
                                <h3 className="text-md font-bold text-white group-hover:text-blue-400 transition-colors mb-2 uppercase tracking-tight">{lastCommunication.title}</h3>
                                <p className="text-xs text-neutral-500 mb-4">{formatDate(lastCommunication.date)}</p>
                                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{lastCommunication.content}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-500 italic">No hay comunicados recientes.</p>
                        )}
                        <Icon name="megaphone" className="absolute -bottom-4 -right-4 w-20 h-20 text-blue-500/5 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700" />
                    </div>

                    {/* System Announcement */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-indigo-500/10 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[2px]">Avisos del Sistema Wise</h4>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                        </div>
                        {loadingAnnouncements ? (
                            <div className="py-4 flex flex-col items-center gap-2 opacity-20">
                                <Icon name="refresh-cw" className="w-5 h-5 animate-spin" />
                            </div>
                        ) : lastSystemAnnouncement ? (
                            <div className="relative z-10">
                                <h3 className="text-md font-bold text-white mb-2 uppercase tracking-tight">{lastSystemAnnouncement.title}</h3>
                                <p className="text-[10px] text-indigo-400 mb-3 font-bold">{formatDate(lastSystemAnnouncement.publish_date)}</p>
                                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{lastSystemAnnouncement.content}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-500 italic">Sin avisos globales.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
