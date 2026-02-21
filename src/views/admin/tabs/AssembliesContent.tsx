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
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Icon name="gavel" className="text-blue-500" />
                        Asambleas y Decisiones
                    </h2>
                    <p className="text-neutral-400">Gestiona las reuniones de copropietarios y procesos de votación.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 font-medium">
                    <Icon name="plus" className="w-4 h-4" />
                    Programar Asamblea
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Icon name="calendar" className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-neutral-400 text-sm">Próximas</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {assemblies.filter(a => a.status === 'Programada').length}
                    </div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Icon name="activity" className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-neutral-400 text-sm">En Curso</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {assemblies.filter(a => a.status === 'En Curso').length}
                    </div>
                </div>
                <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Icon name="check-circle" className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-neutral-400 text-sm">Finalizadas (Año)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {assemblies.filter(a => a.status === 'Completada').length}
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="flex border-b border-neutral-800 p-2 gap-2">
                    {(['Programada', 'En Curso', 'Completada'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                ? 'bg-neutral-800 text-white shadow-inner'
                                : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            {filter === 'Programada' ? 'Próximas' : filter}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-neutral-500">Cargando asambleas...</p>
                        </div>
                    ) : filteredAssemblies.length > 0 ? (
                        <div className="space-y-4">
                            {filteredAssemblies.map((assembly) => (
                                <div key={assembly.id} className="group bg-neutral-800/30 hover:bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 transition-all cursor-pointer">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center justify-center bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-700 min-w-[70px]">
                                                <span className="text-xs uppercase text-blue-400 font-bold">
                                                    {new Date(assembly.date).toLocaleDateString('es-ES', { month: 'short' })}
                                                </span>
                                                <span className="text-2xl font-bold text-white">
                                                    {new Date(assembly.date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {assembly.title}
                                                    </h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${assembly.type === 'Ordinaria'
                                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {assembly.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
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
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold rounded-md transition-all disabled:opacity-50"
                                                >
                                                    {generatingPdf === assembly.id ? (
                                                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Icon name="file-text" className="w-3.5 h-3.5 text-blue-400" />
                                                    )}
                                                    GENERAR ACTA
                                                </button>
                                            )}
                                            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all">
                                                <Icon name="eye" className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-700 rounded-lg transition-all">
                                                <Icon name="edit" className="w-5 h-5" />
                                            </button>
                                            {assembly.status === 'En Curso' && (
                                                <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-all animate-pulse">
                                                    ENTRAR
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                <Icon name="gavel" className="w-8 h-8 text-neutral-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No hay asambleas {activeFilter.toLowerCase()}s</h3>
                            <p className="text-neutral-500 max-w-sm">
                                Mantén la transparencia y gobernanza de tu condominio programando reuniones digitales.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Help/Tutorial Section */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                    <Icon name="info" className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white mb-1">¿Cómo funcionan las asambleas digitales?</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        Nuestro sistema permite que los residentes voten desde el App movil en tiempo real.
                        El sistema calcula automáticamente el quórum basado en los coeficientes (porcentajes) de participación de cada unidad.
                    </p>
                </div>
                <button className="whitespace-nowrap px-4 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-sm font-medium">
                    Leer guía
                </button>
            </div>
        </div>
    );
};
