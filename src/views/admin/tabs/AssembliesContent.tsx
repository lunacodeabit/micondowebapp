import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useCondo } from '../../../context/CondoContext';
import { assemblyService } from '../../../services/assemblyService';
import { generateMeetingMinutesPDF } from '../../../utils/meetingMinutesGenerator';
import type { Assembly } from '../../../types';

export const AssembliesContent = () => {
    const { selectedCondo } = useCondo();
    const [assemblies, setAssemblies] = useState<Assembly[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'Programada' | 'En Curso' | 'Completada'>('Programada');

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

    const handleGenerateMinutes = async (assemblyId: string) => {
        try {
            setGeneratingPdf(assemblyId);
            const data = await assemblyService.getAssemblyReportData(assemblyId);
            generateMeetingMinutesPDF(data, selectedCondo?.name || 'Mi Condo');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generando el acta. Por favor intente de nuevo.');
        } finally {
            setGeneratingPdf(null);
        }
    };

    const filteredAssemblies = assemblies.filter(a => a.status === activeFilter || (activeFilter === 'Programada' && a.status === 'Cancelada'));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Icon name="gavel" className="text-blue-600 dark:text-blue-400" />
                        Asambleas y Decisiones
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Gestiona las reuniones de copropietarios y procesos de votación.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-xs font-semibold text-xs">
                    <Icon name="plus" className="w-4 h-4" />
                    Programar Asamblea
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 p-4 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                            <Icon name="calendar" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">Próximas</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {assemblies.filter(a => a.status === 'Programada').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 p-4 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                            <Icon name="activity" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">En Curso</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {assemblies.filter(a => a.status === 'En Curso').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 p-4 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                            <Icon name="check-circle" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">Finalizadas (Año)</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {assemblies.filter(a => a.status === 'Completada').length}
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs overflow-hidden">
                <div className="flex border-b border-neutral-100 dark:border-neutral-800 p-2 gap-2 bg-neutral-50/50 dark:bg-neutral-900/30">
                    {(['Programada', 'En Curso', 'Completada'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === filter
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                                }`}
                        >
                            {filter === 'Programada' ? 'Próximas' : filter}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Cargando asambleas...</p>
                        </div>
                    ) : filteredAssemblies.length > 0 ? (
                        <div className="space-y-3">
                            {filteredAssemblies.map((assembly) => (
                                <div key={assembly.id} className="group bg-neutral-50/50 hover:bg-blue-50/40 dark:bg-neutral-800/20 dark:hover:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-4 transition-all cursor-pointer shadow-2xs">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-xl px-3 py-2 border border-neutral-200/80 dark:border-neutral-700 min-w-[70px] shadow-2xs">
                                                <span className="text-[10px] uppercase text-blue-600 dark:text-blue-400 font-bold">
                                                    {new Date(assembly.date).toLocaleDateString('es-ES', { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black text-neutral-900 dark:text-white">
                                                    {new Date(assembly.date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {assembly.title}
                                                    </h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${assembly.type === 'Ordinaria'
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'
                                                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
                                                        }`}>
                                                        {assembly.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="clock" className="w-3.5 h-3.5" />
                                                        {new Date(assembly.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="users" className="w-3.5 h-3.5" />
                                                        Quórum: {assembly.quorumRequired}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            {assembly.status === 'Completada' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleGenerateMinutes(assembly.id);
                                                    }}
                                                    disabled={generatingPdf === assembly.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white text-xs font-semibold rounded-lg transition-all border border-neutral-200 dark:border-neutral-600 disabled:opacity-50"
                                                >
                                                    {generatingPdf === assembly.id ? (
                                                        <div className="w-3 h-3 border-2 border-neutral-400 border-t-blue-600 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Icon name="file-text" className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                    Generar Acta
                                                </button>
                                            )}
                                            <button className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg transition-all">
                                                <Icon name="eye" className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg transition-all">
                                                <Icon name="edit" className="w-4 h-4" />
                                            </button>
                                            {assembly.status === 'En Curso' && (
                                                <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all animate-pulse">
                                                    Entrar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-3">
                                <Icon name="gavel" className="w-6 h-6 text-neutral-400" />
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">No hay asambleas {activeFilter.toLowerCase()}s</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                                Mantén la transparencia y gobernanza de tu condominio programando reuniones digitales.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Help/Tutorial Section */}
            <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="info" className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">¿Cómo funcionan las asambleas digitales?</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Nuestro sistema permite que los residentes voten desde el App móvil en tiempo real.
                        El sistema calcula automáticamente el quórum basado en los coeficientes de participación de cada unidad.
                    </p>
                </div>
                <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-xs font-semibold shadow-2xs">
                    Leer guía
                </button>
            </div>
        </div>
    );
};
