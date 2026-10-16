import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useCondo } from '../../../context/CondoContext';
import { assemblyService } from '../../../services/assemblyService';
import type { Assembly } from '../../../types';

export const ResidentAssemblies = () => {
    const { selectedCondo } = useCondo();
    const [assemblies, setAssemblies] = useState<Assembly[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedCondo) {
            loadAssemblies();
        }
    }, [selectedCondo]);

    const loadAssemblies = async () => {
        try {
            setLoading(true);
            const data = await assemblyService.getAssemblies(selectedCondo!.id.toString());
            setAssemblies(data || []);
        } catch (error) {
            console.error('Error loading assemblies:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Asambleas de Copropietarios</h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Participe activamente en las decisiones y votaciones de su comunidad.</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
                    <Icon name="gavel" className="w-5 h-5" />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : assemblies.length === 0 ? (
                <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-12 text-center shadow-2xs">
                    <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-400">
                        <Icon name="calendar-off" className="w-6 h-6" />
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">Sin Asambleas Programadas</h2>
                    <p className="text-neutral-500 text-xs">No hay reuniones ni convocatorias activas por el momento.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assemblies.map((assembly) => (
                        <div key={assembly.id} className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                            <div className="p-4 flex items-start gap-4">
                                <div className="flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-800/60 rounded-xl px-3 py-2 border border-neutral-200/60 dark:border-neutral-700 min-w-[64px]">
                                    <span className="text-[10px] uppercase text-blue-600 dark:text-blue-400 font-bold">
                                        {new Date(assembly.date).toLocaleDateString('es-ES', { month: 'short' })}
                                    </span>
                                    <span className="text-lg font-black text-neutral-900 dark:text-white">
                                        {new Date(assembly.date).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-neutral-900 dark:text-white text-sm">{assembly.title}</h3>
                                        {assembly.status === 'En Curso' && (
                                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                        )}
                                    </div>
                                    <p className="text-neutral-500 text-xs mb-3 flex items-center gap-1">
                                        <Icon name="clock" className="w-3.5 h-3.5" />
                                        {new Date(assembly.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {assembly.type}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${assembly.status === 'En Curso'
                                                ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400'
                                                : assembly.status === 'Programada'
                                                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500'
                                            }`}>
                                            {assembly.status}
                                        </span>

                                        <button
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${assembly.status === 'En Curso'
                                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                                }`}
                                        >
                                            {assembly.status === 'En Curso' ? 'Participar' : 'Ver Detalles'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Participation Tip */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-300">
                <Icon name="lightbulb" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs leading-relaxed">
                    Recuerde que su voto tiene un peso proporcional al coeficiente de copropiedad de su unidad ({selectedCondo?.units?.[0]?.apartmentNumber || 'Tu Unidad'}).
                </p>
            </div>
        </div>
    );
};
