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
    <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] p-6 rounded-2xl h-full overflow-hidden relative transition-colors">
        <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
                <Icon name={icon} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

const QuickActionButton = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group relative bg-neutral-50/80 dark:bg-neutral-800/60 hover:bg-blue-50/60 dark:hover:bg-neutral-700/60 p-5 rounded-xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-blue-200 dark:hover:border-neutral-600 overflow-hidden h-full"
    >
        <Icon name={icon} className="w-6 h-6 text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-center">
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
    const isUpToDate = balance <= 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Executive Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        <Icon name="home" className="w-4 h-4" />
                        <span>{condo.name} • Apto {resident.apartmentNumber}</span>
                    </div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Bienvenido, {resident.ownerName}
                    </h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Portal de residente y propietarios en línea.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate?.('payments')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                        <Icon name="credit-card" className="w-4 h-4" />
                        <span>Notificar Pago de Cuota</span>
                    </button>
                </div>
            </div>

            {/* Resident KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PremiumKpiCard
                    title="Balance de Cuenta"
                    value={`RD$ ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle={isUpToDate ? "Tu cuenta se encuentra al día" : "Cuota pendiente de liquidación"}
                    icon="banknote"
                    badgeText={isUpToDate ? "Al Día" : "Pendiente"}
                    badgeType={isUpToDate ? "success" : "warning"}
                />
                <PremiumKpiCard
                    title="Cuota de Mantenimiento"
                    value={`RD$ ${resident.monthlyFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle="Facturación mensual estándar"
                    icon="file-text"
                    badgeText="Mensual"
                    badgeType="neutral"
                />
                <PremiumKpiCard
                    title="Reservaciones Activas"
                    value={stats.activeReservations}
                    subtitle="Áreas sociales solicitadas"
                    icon="calendar-check"
                    badgeText="Área Común"
                    badgeType="info"
                />
                <PremiumKpiCard
                    title="Incidencias Reportadas"
                    value={stats.openIncidents}
                    subtitle={stats.openIncidents === 0 ? "Sin fallas pendientes" : "En proceso de resolución"}
                    icon="alert-triangle"
                    badgeText={stats.openIncidents === 0 ? "Normal" : "En curso"}
                    badgeType={stats.openIncidents === 0 ? "success" : "warning"}
                />
            </div>

            {/* Quick Actions & Bank Transfer Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <SectionContainer title="Acciones Frecuentes" icon="zap">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <QuickActionButton icon="credit-card" label="Notificar Pago" onClick={() => onNavigate?.('payments')} />
                            <QuickActionButton icon="calendar" label="Reservar Área" onClick={() => onNavigate?.('reservations')} />
                            <QuickActionButton icon="alert-triangle" label="Reportar Avería" onClick={() => onNavigate?.('incidents')} />
                            <QuickActionButton icon="receipt" label="Estado de Cuenta" onClick={() => onNavigate?.('account')} />
                        </div>
                    </SectionContainer>

                    {/* Bank Transfer Details for Payment */}
                    <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] p-6 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Icon name="landmark" className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Datos para Pago por Transferencia</h3>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Deposita tu cuota directamente en la cuenta oficial del condominio</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                                <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-bold">Banco</span>
                                <p className="font-bold text-neutral-900 dark:text-white mt-1">Banco Popular Dominicano</p>
                            </div>
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                                <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-bold">Cuenta</span>
                                <p className="font-bold text-neutral-900 dark:text-white mt-1">801234567 (Corriente)</p>
                            </div>
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                                <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-bold">Beneficiario</span>
                                <p className="font-bold text-neutral-900 dark:text-white mt-1">Condominio Torre Pinos</p>
                            </div>
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                                <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-bold">RNC Condominio</span>
                                <p className="font-bold text-neutral-900 dark:text-white mt-1">430314706</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Communications & Announcements */}
                <div className="space-y-6">
                    {/* Condominium Communication */}
                    <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] p-6 rounded-2xl relative transition-colors">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/80 dark:border-neutral-800">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Icon name="megaphone" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Comunicados del Edificio
                            </h4>
                        </div>
                        {lastCommunication ? (
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{lastCommunication.title}</h3>
                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{formatDate(lastCommunication.date)}</span>
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2">{lastCommunication.content}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">No hay comunicados recientes.</p>
                        )}
                    </div>

                    {/* Support Contact */}
                    <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] p-6 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
                                <Icon name="phone" className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Administración del Edificio</h4>
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Wise Services RD</p>
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 leading-relaxed">
                            Para reportes de emergencia o dudas con tu estado de cuenta, contáctanos:
                        </p>
                        <div className="text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300">
                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">WhatsApp / Tel:</span>
                                <span className="font-semibold text-neutral-900 dark:text-white">829-455-4783</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">Conserjería:</span>
                                <span className="font-semibold text-neutral-900 dark:text-white">829-388-2445</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
