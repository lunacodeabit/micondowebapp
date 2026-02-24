import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 14: Elite Console
 * The "True UI" version of Aura-Shadow Fusion.
 * High-density, functional, yet ultra-premium.
 */
export const EliteConsole = () => {
    return (
        <div className="flex h-screen bg-[#050507] text-[#eef0f3] font-['Geist Sans', 'Inter'] overflow-hidden antialiased">
            {/* Ambient Background Glows (Subtilized for Work) */}
            <div className="fixed top-[-15%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-15%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* PERSISTENT SIDEBAR - Elite Style */}
            <aside className="w-[280px] h-full flex flex-col border-r border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-all">M</div>
                        <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-white">MiCondo<span className="text-neutral-600">OS</span></h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="mb-4">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2">Nodo Principal</p>
                        {[
                            { icon: 'layout-dashboard', label: 'Dashboard', active: true },
                            { icon: 'building', label: 'Propiedades' },
                            { icon: 'users', label: 'Residentes' },
                            { icon: 'credit-card', label: 'Finanzas' },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-white/5 border border-white/10 shadow-[inner_0_1px_10px_rgba(255,255,255,0.02)]' : 'hover:bg-white/5 group'}`}>
                                <Icon name={item.icon} size={18} className={item.active ? 'text-purple-400' : 'text-neutral-500 group-hover:text-neutral-300'} />
                                <span className={`text-[13px] font-semibold ${item.active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>{item.label}</span>
                                {item.active && <div className="ml-auto w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></div>}
                            </div>
                        ))}
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2">Operaciones</p>
                        {[
                            { icon: 'ticket', label: 'Tickets de Servicio', count: 12 },
                            { icon: 'calendar', label: 'Asambleas' },
                            { icon: 'shield', label: 'Logs de Seguridad' },
                            { icon: 'message-square', label: 'Comunicados' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 group transition-all">
                                <Icon name={item.icon} size={18} className="text-neutral-500 group-hover:text-neutral-300" />
                                <span className="text-[13px] font-semibold text-neutral-500 group-hover:text-neutral-300">{item.label}</span>
                                {item.count && <span className="ml-auto px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-black border border-purple-500/20">{item.count}</span>}
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_#a855f7]"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Elisa AI Activa</p>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-tight">Escuchando eventos entre nodos. Lista para asistir.</p>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#070709] relative">
                {/* TOOLBAR HEADER */}
                <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-10 relative z-20">
                    <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
                        <span className="hover:text-white cursor-pointer transition-colors">MiCondo</span>
                        <Icon name="chevron-right" size={14} />
                        <span className="text-white">Dashboard Activo</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg items-center gap-3 text-[11px] font-bold text-neutral-500 w-64 focus-within:border-white/10 transition-all">
                            <Icon name="search" size={14} className="text-neutral-600" />
                            <input type="text" placeholder="Comando rápido..." className="bg-transparent border-none outline-none flex-1" />
                            <span className="text-[9px] bg-white/5 px-1 py-0.5 rounded">⌘K</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:border-white/10 transition-all">
                            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-black">H</div>
                            <span className="text-[11px] font-black text-white">Howard</span>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE VIEWPORT */}
                <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar">
                    {/* Welcome Summary - Subtilized */}
                    <div className="mb-14">
                        <h2 className="text-3xl font-black tracking-tighter text-white mb-2 underline decoration-purple-500/30 decoration-4 underline-offset-8">Vista General de Operaciones</h2>
                        <p className="text-[13px] font-medium text-neutral-500">Sincronizado con 4 edificios activos en Santo Domingo.</p>
                    </div>

                    {/* KPIs - Aura Visual Style but Dense */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Tasa de Recaudación', value: '94.2%', change: '+3.1%', icon: 'trending-up' },
                            { label: 'Incidentes Activos', value: '18', change: '8 sin resolver', icon: 'zap' },
                            { label: 'Próxima Asamblea', value: '7 Días', change: '12 de Junio', icon: 'calendar' },
                            { label: 'Reserva Líquida', value: 'RD$ 840k', change: 'Óptima', icon: 'credit-card' },
                        ].map((kpi, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -4 }}
                                className="p-6 bg-[#121216] border border-white/5 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col justify-between group cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon name={kpi.icon} size={40} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4">{kpi.label}</p>
                                <div>
                                    <h4 className="text-3xl font-black tracking-tighter text-white mb-1">{kpi.value}</h4>
                                    <p className="text-[11px] font-bold text-purple-400 uppercase tracking-tighter">{kpi.change}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* MAIN CONTENT GRID - Functional Table View */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Table Area (Two Columns) */}
                        <div className="xl:col-span-2 space-y-8">
                            <div className="bg-[#121216] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Incidentes Críticos</h3>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">Exportar Logs</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.02]">
                                                {['Ticket', 'Residente', 'Tipo', 'Estado', 'Fecha'].map((h, i) => (
                                                    <th key={i} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-600 border-b border-white/5">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[
                                                { id: '#TK-402', name: 'Maria Santos', type: 'Plomería', status: 'En Camino', date: 'Ahora mismo' },
                                                { id: '#TK-401', name: 'Pedro Luis', type: 'Seguridad', status: 'Crítico', date: 'hace 22m' },
                                                { id: '#TK-398', name: 'Ana Beltran', type: 'Área Común', status: 'Pausado', date: 'hace 1h' },
                                                { id: '#TK-395', name: 'Elite Tower', type: 'Elevador', status: 'Restaurado', date: 'hace 2h' },
                                                { id: '#TK-394', name: 'Juan Mendez', type: 'Finanzas', status: 'En Revisión', date: 'hace 5h' },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-white/[0.01] transition-colors cursor-pointer group">
                                                    <td className="px-8 py-5 text-[12px] font-black tracking-tight text-white">{row.id}</td>
                                                    <td className="px-8 py-5 text-[12px] font-bold text-neutral-400">{row.name}</td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/5 border border-transparent group-hover:border-white/10 text-neutral-300 uppercase tracking-tighter">{row.type}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Crítico' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : row.status === 'En Camino' ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-neutral-600'}`}></div>
                                                            <span className="text-[11px] font-black text-white">{row.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-[11px] font-bold text-neutral-600">{row.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Context Actions */}
                        <div className="space-y-8">
                            <div className="bg-[#121216] border border-white/5 rounded-[40px] p-8 shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-8">Asistente de Prioridad AI</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-all hover:translate-x-1 group">
                                        <p className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Anomalía Financiera</p>
                                        <p className="text-[12px] font-bold text-white leading-snug">Se detectó un cargo duplicado de mantenimiento en el Apto 502.</p>
                                        <button className="mt-3 text-[10px] font-black text-neutral-400 group-hover:text-white transition-colors">Arreglar al Instante →</button>
                                    </div>
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-all hover:translate-x-1 group opacity-60">
                                        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">Próximo Hito</p>
                                        <p className="text-[12px] font-bold text-white leading-snug">Borrador de acta de asamblea para Apex Esperilla.</p>
                                        <button className="mt-3 text-[10px] font-black text-neutral-400 group-hover:text-white transition-colors">Iniciar Borrador →</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-neutral-500 border border-white/5 rounded-[40px] p-8 shadow-2xl group cursor-pointer">
                                <h4 className="text-xl font-black tracking-tighter text-black mb-2">Salud del Ecosistema</h4>
                                <p className="text-[11px] font-bold text-black/60 leading-tight mb-8">Todos los nodos están operando dentro de parámetros de latencia óptimos.</p>
                                <div className="flex justify-between items-center bg-black/10 rounded-2xl p-4">
                                    <span className="text-[10px] font-black uppercase text-black">Uptime 99.9%</span>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-black border-2 border-white/20"></div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
