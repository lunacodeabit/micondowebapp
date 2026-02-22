import React, { useMemo, useEffect, useState } from 'react';
import type { Condo, Reservation, Novedad } from '../../types'; // Importamos Novedad de tipos
import { Icon } from '../../components/ui/Icon';
import { getLocalDateString, formatDate } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { supabase } from "../../supabaseClient";

type AdminHomeProps = {
    condos: Condo[];
    onLogout: () => void;
    onNavigateToCondos: () => void;
};

type Activity = Reservation & { condoName: string; unitApartment: string; amenityName: string; };

const ActivityList = ({ title, activities }: { title: string, activities: Activity[] }) => (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-neutral-800">
                    <tr>
                        <th className="p-3 font-medium text-neutral-400">Área Social</th>
                        <th className="p-3 font-medium text-neutral-400">FH Actividad</th>
                        <th className="p-3 font-medium text-neutral-400">Apto</th>
                        <th className="p-3 font-medium text-neutral-400">Actividad</th>
                        <th className="p-3 font-medium text-neutral-400">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.length > 0 ? activities.map(activity => (
                        <tr key={activity.id} className="border-b border-neutral-800 last:border-none hover:bg-neutral-800/50">
                            <td className="p-3">{activity.amenityName}</td>
                            <td className="p-3">{formatDate(activity.date)}</td>
                            <td className="p-3">{activity.unitApartment} ({activity.condoName})</td>
                            <td className="p-3">{activity.startTime} - {activity.endTime}</td>
                            <td className="p-3"><StatusBadge status={activity.status} /></td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-6 text-center text-neutral-500">
                                {title.includes("hoy") ? "Aún no hay reservaciones aprobadas para hoy." : "Aún no hay reservaciones aprobadas de mañana en adelante."}
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

    const { todayActivities, upcomingActivities } = useMemo(() => {
        const today = getLocalDateString();
        const allActivities: Activity[] = [];

        // --- BLINDAJE DE LISTAS ---
        const safeCondos = (condos as unknown as any[]) || [];

        safeCondos.forEach((condo: any) => {
            const reservations = (condo.reservations as unknown as any[]) || [];
            const units = (condo.units as unknown as any[]) || [];
            const amenities = (condo.amenities as unknown as any[]) || [];

            reservations.forEach((res: any) => {
                if (res.status === 'Aprobada') {
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
                }
            });
        });

        const todayActivities = allActivities.filter(a => a.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const upcomingActivities = allActivities.filter(a => a.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

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
                    date: `${formatDate(a.publish_date)} - Sistema`
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


    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-300 p-6 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-black tracking-tighter flex items-center">
                        <span className="bg-orange-500 w-3 h-10 inline-block mr-1"></span>
                        <span className="bg-orange-500 w-3 h-8 inline-block mr-2"></span>
                        <span className="text-white">WISE</span>
                        <span className="text-neutral-500">SERVICES</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onNavigateToCondos}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Icon name="building" size={18} />
                        <span>Gestionar Clientes</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Icon name="log-out" size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            <main className="space-y-8">
                <ActivityList title="Actividades para hoy" activities={todayActivities} />
                <ActivityList title="Actividades próximos días" activities={upcomingActivities} />

                <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-white mb-4">Novedades del Sistema</h2>
                    {loadingAnnouncements ? (
                        <p className="text-neutral-500 text-sm">Cargando novedades...</p>
                    ) : announcements.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.map(novedad => (
                                <div key={novedad.id} className="bg-neutral-800/50 p-5 rounded-lg border border-neutral-700">
                                    <h3 className="text-lg font-semibold text-white mb-2">{novedad.title}</h3>
                                    <p className="text-neutral-300 whitespace-pre-wrap text-sm mb-4">{novedad.content}</p>
                                    <p className="text-right text-xs text-neutral-500">{novedad.date}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500 text-sm">No hay novedades recientes del sistema.</p>
                    )}
                </div>
            </main>
        </div>
    );
};
