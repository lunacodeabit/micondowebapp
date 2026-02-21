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
        <div className="p-4 md:p-6 pb-24 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Asambleas</h1>
                    <p className="text-neutral-400 text-sm">Participa en las decisiones de tu comunidad.</p>
                </div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <Icon name="gavel" className="text-blue-500 w-6 h-6" />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : assemblies.length === 0 ? (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="calendar-off" className="text-neutral-600 w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">Sin Asambleas</h2>
                    <p className="text-neutral-500 text-sm">No hay reuniones programadas por el momento.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assemblies.map((assembly) => (
                        <div key={assembly.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all">
                            <div className="p-4 flex items-start gap-4">
                                <div className="flex flex-col items-center justify-center bg-neutral-800 rounded-xl px-3 py-2 border border-neutral-700 min-w-[64px]">
                                    <span className="text-[10px] uppercase text-blue-400 font-bold">
                                        {new Date(assembly.date).toLocaleDateString('es-ES', { month: 'short' })}
                                    </span>
                                    <span className="text-xl font-bold text-white">
                                        {new Date(assembly.date).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">{assembly.title}</h3>
                                        {assembly.status === 'En Curso' && (
                                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                        )}
                                    </div>
                                    <p className="text-neutral-500 text-xs mb-3 flex items-center gap-1">
                                        <Icon name="clock" className="w-3 h-3" />
                                        {new Date(assembly.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {assembly.type}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${assembly.status === 'En Curso'
                                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                : assembly.status === 'Programada'
                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                                            }`}>
                                            {assembly.status}
                                        </span>

                                        <button
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${assembly.status === 'En Curso'
                                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
                                                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                                }`}
                                        >
                                            {assembly.status === 'En Curso' ? 'PARTICIPAR' : 'VER DETALLES'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Participation Tip */}
            <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-xl flex gap-3">
                <Icon name="lightbulb" className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-neutral-500 leading-relaxed">
                    Recuerda que tu voto tiene un peso proporcional al coeficiente de copropiedad de tu unidad ({selectedCondo?.units?.[0]?.apartmentNumber || 'Tu Unidad'}).
                </p>
            </div>
        </div>
    );
};
